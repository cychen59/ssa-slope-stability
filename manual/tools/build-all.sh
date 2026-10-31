#!/usr/bin/env bash
# Regenerate every screenshot, example file and the PDF of the SSA manual.
# Run from the repository root's manual/tools folder with the repository served at http://127.0.0.1:8766/
#   python3 -m http.server 8766 --bind 127.0.0.1   (in the repository root)
set -e
cd "$(dirname "$0")"
node tutorial.js     # chapters 0–6, examples tutorial-1/2
node wall.js         # chapters 7–8, tutorial-3, report docx/pdf
python3 report_pages.py
node advanced.js     # chapters 9–16 (includes the 2-minute verification run)
python3 optimize.py
node build-pdf.js
