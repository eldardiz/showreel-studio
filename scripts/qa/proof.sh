#!/usr/bin/env bash
# Proof stills for every slide (start+2, mid, end-2) → out/<id>/qa/proof.jpg
# usage: npm run qa:proof -- <id>
set -euo pipefail
ID="${1:?edit id}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SKILL="${SHOWREEL_SKILL_SCRIPTS:-$ROOT/../../skills/internal-skills/showreel/scripts}"
QA="$ROOT/out/$ID/qa"; mkdir -p "$QA"; rm -f "$QA"/proof_*.png
JSON=$(cd "$ROOT" && npx tsx scripts/qa/timeline.ts "$ID" --json | tail -1)
FRAMES=$(python3 - "$JSON" <<'PY'
import json,sys
tl=json.loads(sys.argv[1]); out=[]
for s in tl['slides']:
    a,d=s['from'],s['dur']
    for f in (a+2, a+d//2, a+d-2): out.append(f"{f}:{s['id']}")
print(" ".join(out))
PY
)
ITEMS=()
for pair in $FRAMES; do
  f="${pair%%:*}"; sid="${pair##*:}"
  (cd "$ROOT" && npx remotion still "Showreel-$ID" "$QA/proof_$(printf %04d "$f").png" --frame="$f" --log=error)
  ITEMS+=("$QA/proof_$(printf %04d "$f").png:$sid #$f")
done
python3 "$SKILL/contact_sheet.py" "$QA/proof.jpg" --cols 6 --cell 320x180 "${ITEMS[@]}"
