#!/usr/bin/env python3
"""Generate article hero images with DashScope/Qwen and update Markdown frontmatter."""

import argparse
import re
import sys
import time
from pathlib import Path

import requests
from requests import RequestException
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
POSTS_DIR = REPO_ROOT / "content" / "posts"
HEROES_DIR = REPO_ROOT / "public" / "images" / "heroes"

API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"


def parse_frontmatter(raw: str) -> tuple[str, str]:
    if not raw.startswith("---\n"):
        raise ValueError("missing frontmatter")
    _, frontmatter, body = raw.split("---", 2)
    return frontmatter.strip(), body.lstrip("\n")


def frontmatter_value(frontmatter: str, key: str) -> str:
    match = re.search(rf'^{key}:\s+"?([^"\n]+)"?$', frontmatter, re.MULTILINE)
    return match.group(1).strip() if match else ""


def frontmatter_tags(frontmatter: str) -> list[str]:
    match = re.search(r"^tags:\s+\[([^\]]+)\]$", frontmatter, re.MULTILINE)
    if not match:
        return []
    return [tag.strip().strip('"') for tag in match.group(1).split(",") if tag.strip()]


def build_prompt(title: str, tags: list[str]) -> str:
    topic = ", ".join(tags) if tags else "AI technology"
    return (
        "Wide 16:9 editorial header image in the style of a bright real-world business "
        "whiteboard brainstorming session: a professional person or hand drawing colorful "
        "marker diagrams on a large whiteboard, with clean charts, arrows, system diagrams, "
        "AI workflow boxes, cloud and API sketches, subtle analytics graphs, natural office "
        "lighting, realistic photography, crisp details, modern technology publication style. "
        f"Article theme: {title}. Topic tags: {topic}. "
        "No logos, no brand names, no readable text, no watermark, no UI screenshot, no cartoon icons."
    )


def request_with_retry(method: str, url: str, attempts: int = 4, **kwargs) -> requests.Response:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return requests.request(method, url, **kwargs)
        except RequestException as error:
            last_error = error
            if attempt == attempts:
                break
            time.sleep(3 * attempt)
    raise RuntimeError(f"request failed after {attempts} attempts: {last_error}") from last_error


def submit_task(api_key: str, prompt: str, model: str, size: str) -> str:
    response = request_with_retry(
        "POST",
        API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        },
        json={
            "model": model,
            "input": {"prompt": prompt},
            "parameters": {"size": size, "n": 1},
        },
        timeout=30,
    )
    if response.status_code != 200:
        raise RuntimeError(f"submit failed: {response.status_code} {response.text}")
    data = response.json()
    return data["output"]["task_id"]


def poll_image_url(api_key: str, task_id: str, timeout_seconds: int) -> str:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        time.sleep(5)
        response = request_with_retry(
            "GET",
            TASK_URL.format(task_id=task_id),
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=20,
        )
        if response.status_code != 200:
            raise RuntimeError(f"poll failed: {response.status_code} {response.text}")
        data = response.json()
        output = data.get("output", {})
        status = output.get("task_status")
        if status == "SUCCEEDED":
            return output["results"][0]["url"]
        if status == "FAILED":
            raise RuntimeError(f"task failed: {data}")
    raise TimeoutError(f"task timed out: {task_id}")


def download_image(url: str, path: Path) -> None:
    response = request_with_retry("GET", url, timeout=60)
    response.raise_for_status()
    path.write_bytes(response.content)


def convert_to_webp(source_path: Path, output_path: Path) -> None:
    with Image.open(source_path) as image:
        image.save(output_path, "WEBP", quality=84, method=6)


def upsert_hero_image(raw: str, public_path: str) -> str:
    frontmatter, body = parse_frontmatter(raw)
    if re.search(r"^heroImage:", frontmatter, re.MULTILINE):
        frontmatter = re.sub(r'^heroImage:.*$', f'heroImage: "{public_path}"', frontmatter, flags=re.MULTILINE)
    else:
        frontmatter = re.sub(
            r'^(description:.*)$',
            rf'\1\nheroImage: "{public_path}"',
            frontmatter,
            count=1,
            flags=re.MULTILINE,
        )
    return f"---\n{frontmatter}\n---\n\n{body}"


def iter_missing_posts(limit: int | None) -> list[Path]:
    posts = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        frontmatter, _ = parse_frontmatter(path.read_text())
        slug = frontmatter_value(frontmatter, "slug")
        hero = frontmatter_value(frontmatter, "heroImage")
        image_path = HEROES_DIR / f"{slug}.webp"
        if not hero or not image_path.exists():
            posts.append(path)
        if limit and len(posts) >= limit:
            break
    return posts


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--model", default="wanx2.1-t2i-turbo")
    parser.add_argument("--size", default="1280*720")
    parser.add_argument("--timeout", type=int, default=120)
    parser.add_argument("--format", choices=["png", "webp"], default="webp")
    args = parser.parse_args()

    api_key = __import__("os").environ.get("DASHSCOPE_API_KEY")
    if not api_key:
        print("DASHSCOPE_API_KEY is required", file=sys.stderr)
        return 2

    HEROES_DIR.mkdir(parents=True, exist_ok=True)
    posts = iter_missing_posts(args.limit)
    print(f"Generating {len(posts)} hero image(s)", flush=True)

    for index, path in enumerate(posts, start=1):
        raw = path.read_text()
        frontmatter, _ = parse_frontmatter(raw)
        title = frontmatter_value(frontmatter, "title")
        slug = frontmatter_value(frontmatter, "slug")
        tags = frontmatter_tags(frontmatter)
        public_path = f"/images/heroes/{slug}.{args.format}"
        image_path = HEROES_DIR / f"{slug}.{args.format}"
        download_path = image_path if args.format == "png" else HEROES_DIR / f"{slug}.png"
        prompt = build_prompt(title, tags)

        print(f"[{index}/{len(posts)}] {title}", flush=True)
        task_id = submit_task(api_key, prompt, args.model, args.size)
        image_url = poll_image_url(api_key, task_id, args.timeout)
        download_image(image_url, download_path)
        if args.format == "webp":
            convert_to_webp(download_path, image_path)
            download_path.unlink()
        path.write_text(upsert_hero_image(raw, public_path))
        print(f"  saved {image_path.relative_to(REPO_ROOT)}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
