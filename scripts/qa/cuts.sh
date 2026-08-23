#!/usr/bin/env bash
# Dense frame strips around every cut of a rendered edit → out/<id>/qa/cuts-NN.jpg
# usage: npm run qa:cuts -- <id> [video.mp4] [--pad 6]
set -euo pipefail
ID="${1:?edit id}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SKILL="${SHOWREEL_SKILL_SCRIPTS:-$ROOT/../../skills/internal-skills/showreel/scripts}"
VIDEO="${2:-$ROOT/out/$ID/$ID.mp4}"
PAD=6
QA="$ROOT/out/$ID/qa"; FR="$QA/frames"; mkdir -p "$FR"; rm -f "$FR"/f_*.jpg "$QA"/cuts-*.jpg
ffmpeg -v error -y -i "$VIDEO" -vf scale=320:-1 -q:v 4 "$FR/f_%04d.jpg"
JSON=$(cd "$ROOT" && npx tsx scripts/qa/timeline.ts "$ID" --json | tail -1)
TOTAL=$(python3 -c "import json,sys;print(json.loads(sys.argv[1])['total'])" "$JSON")
CUTS=$(python3 -c "import json,sys;print(' '.join(str(c) for c in json.loads(sys.argv[1])['cuts'][1:]))" "$JSON")
n=0
for c in $CUTS; do
  n=$((n+1)); lo=$((c-PAD)); hi=$((c+PAD)); [ $lo -lt 0 ] && lo=0
  python3 "$SKILL/contact_sheet.py" "$QA/cuts-$(printf %02d $n).jpg" --frames "$FR" --range "$lo-$hi" --cols 13 --cell 200x113
done
# tail (fade out) strip
python3 "$SKILL/contact_sheet.py" "$QA/cuts-tail.jpg" --frames "$FR" --range "$((TOTAL-26))-$((TOTAL-1))" --step 2 --cols 13 --cell 200x113
echo "sheets in $QA"
