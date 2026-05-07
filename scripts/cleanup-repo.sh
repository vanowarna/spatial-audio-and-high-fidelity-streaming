#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/cleanup-repo.sh
#
# One-shot repo cleanup. Removes Office/LibreOffice scratch files, retires the
# legacy Node-based docx pipeline, drops duplicate Phase-2 notebooks, and
# renames the old "current-report-and-presentation-from-jackie-madaleine/"
# folder under ref-docs to a shorter, public-friendly path.
#
# WHY THIS IS A SCRIPT (not done automatically): on Windows, Word/LibreOffice
# hold .docx/.pptx and lock files exclusively while open. Run this from
# Git Bash / WSL / a Linux shell *after* closing those apps.
#
# Usage:
#   close PowerPoint / Word / LibreOffice on every spatial-audio file
#   cd <repo-root>
#   bash scripts/cleanup-repo.sh
#   git status
#   git commit -m "chore: repo cleanup — drop legacy artefacts, rename ref-docs"
# ----------------------------------------------------------------------------
set -eu

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Repo: $REPO_ROOT"
echo

# ---- 1. Remove a stale .git/index.lock if any --------------------------------
if [ -f .git/index.lock ]; then
  echo "Removing stale .git/index.lock"
  rm -f .git/index.lock
fi

# ---- 2. Untracked Office / LibreOffice trash --------------------------------
echo "==> Removing untracked scratch files"
shopt -s nullglob
for f in \
    deliverables/.~lock.* \
    deliverables/lu*.tmp \
    deliverables/~WRL*.tmp \
    report/.~lock.* \
    report/lu*.tmp ; do
  if [ -e "$f" ]; then rm -f "$f" && echo "  rm $f"; fi
done

# ---- 3. Tracked Office hidden lock files (~$*) -------------------------------
echo "==> git rm tracked Office hidden lock files"
TRACKED_TRASH=(
  'deliverables/~$Spatial_Audio_Presentation.pptx'
  'deliverables/~$atial_Audio_Report.docx'
  'ref-docs/current-report-and-presentation-from-jackie-madaleine/~$Project 4.pptx'
)
# Helper: try to git rm a file, but skip cleanly if Windows is holding a lock.
# Without this, git on Windows prompts "Unlink of file ... failed. Try again?"
# in a tight loop and the script can't be backgrounded.
safe_git_rm() {
  local f="$1"
  if ! git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    return 0
  fi
  # Stage the deletion in the index without touching the working tree first.
  git rm --cached -f -- "$f" >/dev/null 2>&1 || true
  # Try the actual unlink with a short retry budget; never prompt.
  for _ in 1 2 3; do
    if rm -f -- "$f" 2>/dev/null && [ ! -e "$f" ]; then
      echo "  rm  $f"
      return 0
    fi
    sleep 1
  done
  echo "  ⚠  $f is locked by another process — staged for deletion; close the app and rerun." >&2
  return 0
}

for f in "${TRACKED_TRASH[@]}"; do
  safe_git_rm "$f"
done

# ---- 4. Stale duplicates & legacy build pipeline -----------------------------
echo "==> git rm stale duplicates and legacy Node pipeline"
LEGACY=(
  'report/Spatial_Audio_Presentation.pdf'
  'report/Spatial_Audio_Presentation.pptx'
  'report/Spatial_Audio_Report.docx'
  'report/build_report.js'
  'report/create_report.js'
  'report/package.json'
  'report/package-lock.json'
  'ref-docs/Phase2_Codec_Analysis.ipynb'
  'src/phase2-codec-analysis/MultiMed_project.ipynb'
)
for f in "${LEGACY[@]}"; do
  safe_git_rm "$f"
done

# ---- 5. Drop empty dirs -----------------------------------------------------
echo "==> Dropping empty report/sections (no longer used)"
[ -d report/sections ] && rmdir report/sections 2>/dev/null || true

# ---- 6. Rename ref-docs/current-report-... → ref-docs/prior-drafts ----------
OLD="ref-docs/current-report-and-presentation-from-jackie-madaleine"
NEW="ref-docs/prior-drafts"
if [ -d "$OLD" ] && [ ! -d "$NEW" ]; then
  echo "==> Renaming $OLD -> $NEW"
  git mv "$OLD" "$NEW"

  # Also tidy the file names inside (remove personal names + spaces)
  if [ -f "$NEW/phase 2 code from jackie MultiMed_project.ipynb" ]; then
    git mv "$NEW/phase 2 code from jackie MultiMed_project.ipynb" \
           "$NEW/phase2-jackie-MultiMed_project.ipynb"
  fi
  if [ -f "$NEW/Project 4.pptx" ]; then
    git mv "$NEW/Project 4.pptx" "$NEW/project4_draft.pptx"
  fi
  if [ -f "$NEW/report - Copy.docx" ]; then
    git mv "$NEW/report - Copy.docx" "$NEW/report_draft.docx"
  fi
fi

# ---- 7. Make sure important empty dirs survive -------------------------------
echo "==> Adding .gitkeep where needed"
for d in audio-samples/original audio-samples/encoded \
         src/phase3-spatial-player/assets/audio/demo_music \
         src/phase3-spatial-player/assets/audio/demo_speech \
         src/phase3-spatial-player/assets/audio/demo_ambient \
         src/phase4-abx-testing/assets/audio \
         deliverables/audio-clips deliverables/demo-video ; do
  if [ -d "$d" ] && [ -z "$(ls -A "$d")" ]; then
    touch "$d/.gitkeep"
    git add "$d/.gitkeep"
  fi
done

# ---- 8. Summary --------------------------------------------------------------
echo
echo "Done. Review with:"
echo "  git status"
echo "  git diff --cached --stat"
echo
echo "If everything looks right, commit:"
echo "  git commit -m \"chore: repo cleanup — drop legacy artefacts, rename ref-docs\""
