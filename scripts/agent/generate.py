#!/usr/bin/env python3
"""AI article generation agent — calls Claude for content, Qwen for hero images."""

import json
import os
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

import anthropic
import requests

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
POSTS_DIR = REPO_ROOT / "content" / "posts"
HEROES_DIR = REPO_ROOT / "public" / "images" / "heroes"
TOPICS_FILE = SCRIPT_DIR / "topics.json"
PROGRESS_FILE = SCRIPT_DIR / "progress.json"

DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")

ARTICLE_PROMPT = """Write a comprehensive English blog article about: "{title}"

Requirements:
- Length: 1800-2400 words
- Structure: use H2 and H3 Markdown headings
- Include: introduction, 4-6 main sections, a FAQ section (3-5 questions), conclusion
- Tone: informative, practical, developer-friendly
- Do NOT include any disclaimer about being AI-generated
- Do NOT use phrases like "In conclusion," or "In summary,"
- Output ONLY the Markdown body (no frontmatter, no title heading)
- Ensure high Flesch readability score (short sentences, active voice)
"""

IMAGE_PROMPT_TEMPLATE = (
    "Wide 16:9 editorial header image in the style of a bright real-world business "
    "whiteboard brainstorming session: a professional person or hand drawing colorful "
    "marker diagrams on a large whiteboard, with clean charts, arrows, AI workflow boxes, "
    "cloud and API sketches, subtle analytics graphs, natural office lighting, realistic "
    "photography, crisp details, modern technology publication style. "
    "Article theme: '{title}'. No logos, no brand names, no readable text, no watermark, "
    "no UI screenshot, no cartoon icons."
)


def load_topics() -> list[dict]:
    return json.loads(TOPICS_FILE.read_text())


def load_progress() -> dict:
    return json.loads(PROGRESS_FILE.read_text())


def save_progress(progress: dict) -> None:
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))


def generate_article(client: anthropic.Anthropic, topic: dict) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": ARTICLE_PROMPT.format(title=topic["title"])}],
    )
    return message.content[0].text


def generate_hero_image(title: str, slug: str) -> str | None:
    """Generate hero image via Qwen wanx-v1. Returns public path or None on failure."""
    if not DASHSCOPE_API_KEY:
        return None

    HEROES_DIR.mkdir(parents=True, exist_ok=True)
    out_path = HEROES_DIR / f"{slug}.png"
    if out_path.exists():
        return f"/images/heroes/{slug}.png"

    resp = requests.post(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
        headers={
            "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        },
        json={
            "model": "wanx2.1-t2i-turbo",
            "input": {"prompt": IMAGE_PROMPT_TEMPLATE.format(title=title)},
            "parameters": {"size": "1280*720", "n": 1},
        },
        timeout=30,
    )
    if resp.status_code != 200:
        print(f"  Image submit failed: {resp.text}", file=sys.stderr)
        return None

    task_id = resp.json()["output"]["task_id"]

    for _ in range(18):
        time.sleep(5)
        poll = requests.get(
            f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {DASHSCOPE_API_KEY}"},
            timeout=15,
        )
        status = poll.json()["output"]["task_status"]
        if status == "SUCCEEDED":
            img_url = poll.json()["output"]["results"][0]["url"]
            img_data = requests.get(img_url, timeout=30).content
            out_path.write_bytes(img_data)
            return f"/images/heroes/{slug}.png"
        if status == "FAILED":
            return None

    return None


def build_frontmatter(topic: dict, pub_date: str, hero_image: str | None) -> str:
    tags_yaml = ", ".join(topic["tags"])
    hero_line = f'\nheroImage: "{hero_image}"' if hero_image else ""
    return f"""---
title: "{topic['title']}"
date: "{pub_date}"
slug: "{topic['slug']}"
description: "Learn everything about {topic['title'].lower()} in this in-depth guide."{hero_line}
tags: [{tags_yaml}]
---

"""


def write_post(topic: dict, body: str, pub_date: str, hero_image: str | None) -> Path:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{pub_date}-{topic['slug']}.md"
    filepath = POSTS_DIR / filename
    content = build_frontmatter(topic, pub_date, hero_image) + body
    filepath.write_text(content)
    return filepath


def git_commit(filepath: Path, hero_path: Path | None, title: str) -> None:
    files = [str(filepath), str(PROGRESS_FILE)]
    if hero_path and hero_path.exists():
        files.append(str(hero_path))
    subprocess.run(["git", "add"] + files, cwd=REPO_ROOT, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"content: add article — {title}\n\nCo-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"],
        cwd=REPO_ROOT,
        check=True,
    )


def git_push() -> None:
    subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)


def main() -> None:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    topics = load_topics()
    progress = load_progress()
    published_ids = set(progress["published"])

    pending = [t for t in topics if t["id"] not in published_ids]
    pending.sort(key=lambda t: (t["phase"], t["id"]))
    batch = pending[:count]

    if not batch:
        print("All topics published.")
        return

    pub_date = date.today().isoformat()

    for topic in batch:
        print(f"Generating: {topic['title']}")
        try:
            body = generate_article(client, topic)
            print(f"  ✓ Article written ({len(body.split())} words)")

            filepath = write_post(topic, body, pub_date, None)
            progress["published"].append(topic["id"])
            save_progress(progress)
            print(f"  ✓ Saved: {filepath.name}")
        except Exception as e:
            print(f"  ✗ Failed: {e}", file=sys.stderr)
            continue

    # Commit all articles in one batch
    subprocess.run(["git", "add", str(POSTS_DIR), str(PROGRESS_FILE)], cwd=REPO_ROOT, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"content: add {len(batch)} articles\n\nCo-Authored-By: Claude Code <claude-sonnet-4-6> <noreply@anthropic.com>"],
        cwd=REPO_ROOT,
        check=True,
    )
    print(f"\nDone. {len(batch)} articles generated and committed.")


if __name__ == "__main__":
    main()
