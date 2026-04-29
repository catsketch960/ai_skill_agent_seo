---
title: "LangGraph: Building Stateful AI Agents"
date: "2026-02-25"
slug: "langgraph-building-stateful-ai-agents"
description: "LangGraph tutorial: build stateful AI agents with nodes, edges, checkpoints, and human-in-the-loop patterns. Includes real code and CrewAI comparison."
heroImage: "/images/heroes/langgraph-building-stateful-ai-agents.webp"
tags: [ai-agents, ai-tools]
---

I spent three weeks rebuilding a research pipeline that kept breaking. The original version was a chain of LLM calls duct-taped together with retry logic and a lot of hope. It had no memory between runs, no way for a human to intervene mid-flight, and when one step failed, the whole thing started over. The fix wasn't a better prompt — it was a better graph. That graph was built with LangGraph.

This tutorial covers everything I learned: the core concepts, real working code, multi-agent patterns, and an honest look at where LangGraph wins and where it doesn't.

---

## What Is LangGraph?

LangGraph is an open-source Python and JavaScript library from LangChain that lets you model AI agent workflows as directed graphs. Instead of writing a linear chain of `llm.invoke()` calls, you define **nodes** (processing steps) and **edges** (transitions between steps) that together form a stateful, controllable execution loop.

The key word is *stateful*. Every node reads from and writes back to a shared state object. That state persists across steps, across retries, and — with checkpointing enabled — across process restarts. This is what makes LangGraph agents fundamentally different from simple prompt chains.

LangGraph ships inside the `langgraph` package and works independently of LangChain, though it integrates well with it. You can use any LLM provider: Anthropic, OpenAI, Google, a local Ollama model — whatever emits a structured response.

---

## Key Concepts

Before writing a single line of code, these four concepts are worth locking in. Everything else is application of them.

### Nodes

A node is a Python function that takes the current state as input and returns a partial state update. Nodes do the actual work: they call LLMs, run tools, parse results, or apply business logic. A node can be as simple as a one-liner or as complex as an async function that fans out to a dozen API calls.

### Edges

Edges define which node runs next. They come in two flavors: **static edges** (always go from node A to node B) and **conditional edges** (a router function inspects state and picks the next node dynamically). Conditional edges are how you express branching logic — retry on failure, ask a human when confidence is low, or route to different specialists based on the task type.

### State

State is a typed Python dictionary (backed by a `TypedDict` or Pydantic model) that flows through the entire graph. Every node receives a copy of the current state and returns a dict of fields to update. LangGraph merges those updates back into the canonical state using reducers — by default, the last-write-wins, but you can define custom reducers (e.g., a list field that appends rather than replaces).

### Checkpoints

A checkpoint is a serialized snapshot of the state at a specific step. LangGraph can save checkpoints to memory, SQLite, PostgreSQL, or Redis. With checkpoints enabled, you can pause a graph mid-run, inspect the state, edit it, and resume — or recover from a crash without replaying from the beginning. This is the foundation for human-in-the-loop interrupts.

---

## How LangGraph Executes a Graph

Here is a visual model of how a LangGraph agent runs. The executor pulls nodes off a queue, runs them, merges their state updates, evaluates edges, and either queues the next node or terminates.

```mermaid
graph TD
    A([START]) --> B[Initialize State]
    B --> C{Route}
    C -->|research task| D[Research Node]
    C -->|write task| E[Writer Node]
    D --> F[Tool Node]
    F --> G{Tool result OK?}
    G -->|yes| H[Summarize Node]
    G -->|no, retry| D
    E --> H
    H --> I{Needs human review?}
    I -->|yes| J[INTERRUPT — await input]
    J --> K[Human edits state]
    K --> H
    I -->|no| L([END])
```

The loop between the Research Node, Tool Node, and the retry edge is the core of a ReAct-style agent. The interrupt path to the right is human-in-the-loop. Both are first-class citizens in LangGraph.

---

## Building Your First Graph

Let me walk through a minimal but real example: a research agent that searches the web and produces a summary.

### Installation

```bash
pip install langgraph langchain-anthropic
```

### Define State

```python
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # add_messages is a reducer: new messages append, not replace
    messages: Annotated[list, add_messages]
    task: str
    draft: str
    approved: bool
```

### Define Nodes

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")

def research_node(state: AgentState) -> dict:
    """Call the LLM to gather information."""
    response = llm.invoke([
        SystemMessage(content="You are a research assistant. Be concise and factual."),
        HumanMessage(content=f"Research this topic: {state['task']}")
    ])
    return {"messages": [response], "draft": response.content}

def review_node(state: AgentState) -> dict:
    """Check whether the draft meets quality criteria."""
    response = llm.invoke([
        SystemMessage(content="Review the draft. Reply 'APPROVED' or 'REVISE: <reason>'."),
        HumanMessage(content=state["draft"])
    ])
    approved = response.content.strip().startswith("APPROVED")
    return {"messages": [response], "approved": approved}

def route_after_review(state: AgentState) -> str:
    """Conditional edge: retry research or finish."""
    return "END" if state["approved"] else "research"
```

### Build the Graph

```python
from langgraph.graph import StateGraph, END

builder = StateGraph(AgentState)

builder.add_node("research", research_node)
builder.add_node("review", review_node)

builder.set_entry_point("research")
builder.add_edge("research", "review")
builder.add_conditional_edges(
    "review",
    route_after_review,
    {"END": END, "research": "research"},
)

graph = builder.compile()
```

### Run It

```python
result = graph.invoke({
    "task": "Explain LangGraph checkpointing in two paragraphs",
    "messages": [],
    "draft": "",
    "approved": False,
})

print(result["draft"])
```

That is a complete, runnable LangGraph agent. The conditional edge means the graph will keep refining the draft until the reviewer approves or you add a max-retry guard. Let's add one now:

```python
def route_after_review(state: AgentState) -> str:
    attempts = sum(1 for m in state["messages"] if "research" in str(m))
    if state["approved"] or attempts >= 3:
        return "END"
    return "research"
```

---

## Adding Human-in-the-Loop

The research loop above is fully autonomous. For production work — anything touching customers, money, or external APIs — you want a human approval step before the agent takes an irreversible action. LangGraph implements this through **interrupts**.

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

# Node that pauses and waits for human input
def human_review_node(state: AgentState) -> dict:
    human_input = interrupt({
        "question": "Approve this draft?",
        "draft": state["draft"],
    })
    # human_input is whatever the caller passes when resuming
    return {"approved": human_input.get("approved", False)}

builder.add_node("human_review", human_review_node)
builder.add_edge("review", "human_review")

# Compile with a checkpointer so state survives the pause
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer, interrupt_before=["human_review"])
```

Running with a thread ID lets LangGraph track where execution paused:

```python
config = {"configurable": {"thread_id": "run-001"}}

# First invocation — runs until the interrupt
result = graph.invoke({"task": "LangGraph tutorial", ...}, config=config)
print("Paused at:", result["__interrupt__"])

# Human reviews, then resumes by passing their decision
final = graph.invoke(
    {"approved": True},  # resume payload
    config=config,
)
```

The graph picks up exactly where it left off. The state is fully preserved in the checkpointer. This pattern works for approval queues, async Slack-based reviews, or any workflow where a human sits between two automated steps.

---

## Multi-Agent Patterns

Single-graph agents are powerful. But some tasks genuinely benefit from multiple specialized agents coordinating together. LangGraph supports this through **subgraphs** and a **supervisor** pattern.

The supervisor is itself a LangGraph node. It receives a task, decides which worker agent to delegate to, and routes the result back to itself or to the next stage.

```python
def supervisor_node(state: AgentState) -> dict:
    """Route the task to the appropriate specialist."""
    response = llm.invoke([
        SystemMessage(content="""You are a supervisor. Given the task, reply with exactly
one word: RESEARCHER, WRITER, or DONE."""),
        HumanMessage(content=f"Task: {state['task']}\nLast result: {state.get('draft', 'none')}")
    ])
    return {"next_agent": response.content.strip()}

def route_by_supervisor(state: AgentState) -> str:
    mapping = {
        "RESEARCHER": "research",
        "WRITER": "writer",
        "DONE": END,
    }
    return mapping.get(state["next_agent"], END)
```

Here is what the multi-agent workflow looks like:

```mermaid
flowchart LR
    subgraph Orchestration
        S[Supervisor]
    end
    subgraph Workers
        R[Researcher Agent]
        W[Writer Agent]
        T[Tool Executor]
    end
    subgraph Review
        H[Human Approval]
    end

    S -->|route: RESEARCHER| R
    S -->|route: WRITER| W
    R --> T
    T --> R
    R -->|results| S
    W -->|draft| S
    S -->|route: DONE| H
    H -->|approved| E([END])
    H -->|revise| S
```

Each worker can be its own compiled LangGraph graph, mounted as a node in the outer orchestration graph. This keeps agents independently testable and reusable.

---

## Persistence and Memory

LangGraph's checkpointing system is the most underrated part of the library. Here is what you get for free once you attach a checkpointer:

**Thread-scoped memory.** Every `thread_id` has its own independent state history. Run the same graph with a hundred different thread IDs and each maintains its own trajectory without interference.

**Time-travel debugging.** Because every step is snapshotted, you can rewind to any checkpoint and re-run from that point with different inputs. This is invaluable for debugging edge cases without re-running expensive early steps.

**Resume after failure.** If a node throws an uncaught exception, the last successful checkpoint is preserved. Fix the bug, redeploy, and resume the thread — no data loss, no replaying from scratch.

For production, swap `MemorySaver` for a persistent backend:

```python
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver.from_conn_string("postgresql://user:pass@host/db")
graph = builder.compile(checkpointer=checkpointer)
```

SQLite (`SqliteSaver`) is the right choice for local development and single-server deployments. PostgreSQL or Redis scales to concurrent, multi-worker environments.

---

## LangGraph vs CrewAI vs AutoGen

All three frameworks solve the multi-agent coordination problem. They take very different approaches to it.

```mermaid
quadrantChart
    title Agent Framework Comparison
    x-axis "Low Control" --> "High Control"
    y-axis "High Abstraction" --> "Low Abstraction"
    quadrant-1 Power Users
    quadrant-2 Rapid Prototypers
    quadrant-3 Simple Automation
    quadrant-4 Production Systems
    CrewAI: [0.25, 0.80]
    AutoGen: [0.45, 0.55]
    LangGraph: [0.85, 0.25]
```

| Dimension | LangGraph | CrewAI | AutoGen |
|---|---|---|---|
| **Mental model** | Graph of typed nodes | Role-based crew | Conversation between agents |
| **State management** | Explicit typed state dict | Implicit, role-scoped | Message history |
| **Human-in-the-loop** | First-class interrupt API | Limited | Supported via `UserProxyAgent` |
| **Persistence** | Built-in checkpointer backends | None (you add it) | None (you add it) |
| **Debugging** | Time-travel via checkpoints | Limited | ConversableAgent traces |
| **Learning curve** | Steeper (graph thinking required) | Gentle (role assignment) | Moderate |
| **Production readiness** | High — explicit, auditable | Medium — relies on LLM routing | Medium |
| **Best for** | Complex, stateful, auditable workflows | Quick multi-agent prototypes | Research & conversation flows |

**My honest take:** CrewAI is faster to get running for a demo. If you need to ship something to production where failures are costly, state must be inspectable, and humans need to intervene, LangGraph's explicit control model pays for itself inside the first incident postmortem.

AutoGen suits research contexts where the agents are largely conversational and you want them to debate each other toward a conclusion. It is less suited to workflows where you need strict ordering, typed outputs, and checkpointed recovery.

---

## When NOT to Use LangGraph

LangGraph is not the answer for every agent problem. I have talked to teams that adopted it too early and spent weeks building graph infrastructure for a workflow that would have been fine as three sequential LLM calls.

**Skip LangGraph when:**

- Your workflow is a linear sequence with no branching and no retry logic. A simple function pipeline is easier to read, test, and maintain.
- You are prototyping and iteration speed matters more than control. CrewAI or even raw `llm.invoke()` loops get you a working demo in an afternoon.
- You are not Python-first. LangGraph has a JavaScript SDK but the Python version is more mature and better documented. If your team lives in Go or Ruby, integrating LangGraph adds operational complexity.
- Your state doesn't need persistence between steps. If each run is completely fresh, the checkpointing machinery is overhead without benefit.
- You need sub-100ms latency for every step. Graph overhead is small but real. For latency-sensitive real-time features, a tighter loop without the graph abstraction is worth considering.

The right time to reach for LangGraph is when you find yourself writing custom retry logic, building a state machine by hand, or wishing you could pause a workflow and let a human look at it before it continues.

---

## Verdict

LangGraph is the most production-ready agent orchestration framework I have used. It forces you to be explicit about state, transitions, and recovery — which feels like overhead until the third time a workflow fails in a way you can actually diagnose and fix without starting over.

The learning curve is real. You need to think in graphs, type your state carefully, and understand how reducers work before the pieces click into place. That investment pays back quickly once you start using checkpoints for debugging and interrupts for human review.

For teams building internal tools, research pipelines, document processing workflows, or any multi-step automation where failures are costly: LangGraph is worth learning properly. For quick experiments and demo-tier prototypes: start simpler, then graduate to LangGraph when the workflow earns the complexity.

---

## FAQ

### Do I have to use LangChain with LangGraph?

No. LangGraph is a separate package (`langgraph`) with its own graph runtime. You can use it with any LLM client — `anthropic`, `openai`, `litellm`, or even a local Ollama wrapper. LangChain tools and message formats are optional conveniences, not requirements.

### How does LangGraph handle infinite loops?

It doesn't by default — that is your responsibility. The standard pattern is to track a step counter or attempt counter in your state and add a guard in your conditional edge function. Some teams set a hard `recursion_limit` in the graph config: `graph.invoke(input, config={"recursion_limit": 10})`.

### Can LangGraph run nodes in parallel?

Yes. You can add multiple edges from a single node to several target nodes, and LangGraph will execute them in parallel using a fan-out pattern. The state from parallel branches is merged back when a join node runs. This is useful for agents that need to query multiple APIs simultaneously before synthesizing results.

### What is the difference between `interrupt_before` and `interrupt_after`?

`interrupt_before=["node_name"]` pauses the graph *before* the named node runs — useful when you want a human to decide whether to proceed. `interrupt_after=["node_name"]` pauses *after* the node runs — useful when you want to inspect or edit the node's output before it flows downstream. You can use both in the same graph on different nodes.

### Is LangGraph suitable for high-volume production workloads?

Yes, with the right checkpointer. `MemorySaver` is in-process only. For concurrent, multi-worker deployments, use `PostgresSaver` or a Redis-backed checkpointer. LangGraph Studio (the hosted product) adds deployment infrastructure, monitoring, and a visual debugger on top of the open-source library if you prefer a managed path.
