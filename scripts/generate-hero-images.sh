#!/bin/bash
# Generate hero images from first Mermaid diagram in each article
set -e

POSTS_DIR="content/posts"
HEROES_DIR="public/images/heroes"
CONFIG="scripts/mermaid-config.json"
TMPDIR="/tmp/mermaid-heroes"
mkdir -p "$TMPDIR"

TOTAL=0
SUCCESS=0
FAIL=0

for md_file in "$POSTS_DIR"/*.md; do
  slug=$(grep '^slug:' "$md_file" | head -1 | sed 's/^slug: *//; s/^"//; s/"$//')
  if [ -z "$slug" ]; then
    continue
  fi

  TOTAL=$((TOTAL + 1))
  mmd_file="$TMPDIR/${slug}.mmd"
  png_file="$TMPDIR/${slug}.png"
  webp_file="$HEROES_DIR/${slug}.webp"

  # Extract first mermaid block
  awk '/^```mermaid/{flag=1; next} /^```/{if(flag) {flag=0; exit}} flag' "$md_file" > "$mmd_file"

  if [ ! -s "$mmd_file" ]; then
    echo "SKIP: $slug (no mermaid block)"
    FAIL=$((FAIL + 1))
    continue
  fi

  # Render to PNG
  if npx --yes @mermaid-js/mermaid-cli -i "$mmd_file" -o "$png_file" \
    --backgroundColor "#1e1b4b" -c "$CONFIG" -s 2 -q 2>/dev/null; then
    # Convert to webp
    if npx --yes sharp-cli -i "$png_file" -o "$webp_file" --format webp 2>/dev/null; then
      echo "OK: $slug"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "FAIL (webp): $slug"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "FAIL (render): $slug"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Done: $SUCCESS/$TOTAL succeeded, $FAIL failed"
