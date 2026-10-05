#!/usr/bin/env bash
# Fail when this public repo tracks, is about to commit, or is about to push
# anything private: a /djinn:learn run folder or any file shaped like one, a
# home directory path, or any word on the owner's private pattern list.
# Commit 32a1c17 put two run folders under docs/examples/, and round 3 of
# the learn review found three project names the list had never held; this
# check catches a real id, a listed word, a home path and the learn marks.
# It cannot catch a prose sentence about a key written under an alias: that
# holds none of them, and only the scrub by reading finds it.
#
# Three modes, one set of passes:
#   check-private.sh                  the working tree: every tracked or
#                                     unignored file (the build gate)
#   check-private.sh --tree <sha>     the tree a commit carries (what a push
#                                     publishes at its tip)
#   check-private.sh --history <revs> every ADDED line, added path and commit
#                                     message of the commits `git rev-list
#                                     <revs>` names (what a push publishes on
#                                     the way), e.g. `--history A..B` or
#                                     `--history B --not --remotes`
# tools/pre-push.sh runs all three as a git pre-push hook.
#
# The passes:
#   1. no path under learn/ or local/ is tracked, unignored or added;
#   2. the learn marks (the secure README banner, a training row's
#      source_ref key, and the learn draft status) appear only in the named
#      prompt files that define them and in audits/, where reports discuss
#      them by name;
#   3. no home directory path (/home/<user>/, /Users/<user>/, C:\Users\)
#      appears anywhere but this script and its test (the shared /Users/Shared/,
#      Public and Default folders are not a home);
#   4. no line of local/private-patterns.txt matches anywhere, audits/ and
#      plugins/ included. That file is gitignored, so the private words it
#      lists never enter this repo. MISSING, THE CHECK FAILS: a check that
#      cannot read the list has not checked the words. Set
#      PRIVATE_CHECK_ALLOW_MISSING=1 to run the other passes anyway on a
#      clone that has no list; the last line then says the words were NOT
#      CHECKED. Present but empty, the check fails.
# Every git call's exit status is read: a git error fails the check, it
# never reads as clean. A hit names the file (and in --history the commit),
# never the word.
#
# @interacts  reads the git index, the working tree or a commit's tree, the
#             commits of a rev range, and local/private-patterns.txt (or the
#             main worktree's copy when run in a linked worktree); writes two
#             temp files, removed on exit
# @deps       git, grep, awk, mktemp; no project imports
# @complexity tree modes O(f * b * p): f files (about 250 today), b bytes
#             per file (under 400 KB), p patterns (about 50); --history
#             O(c * (a + m) * p): c commits in the range (1 to 20 on a
#             push), a added lines per commit (up to about 30000 for a
#             collapsed range), m message lines
# @alloc      two temp files (the filtered patterns, one commit's added
#             lines); git's own buffers
set -o pipefail

root=$(git rev-parse --show-toplevel) || { echo "private check: FAIL, not inside a git repo" >&2; exit 1; }
[ -n "$root" ] || { echo "private check: FAIL, git gave no repo root" >&2; exit 1; }
cd "$root" || exit 1

# The exact banner line learn-synthesis writes first in a secure run's
# README, fixed in CONTRACTS.md section 13 ("Secure sources"). Change both
# together.
BANNER='SECURE SOURCE. Derived from'
ROW_KEY='"source_ref"'
DRAFT_STATUS='learn draft, not yet reviewed'
# The only files allowed to carry the learn marks: the prompts that define
# them, the Codex adapter's generated copies of those prompts
# (adapters/codex/build.mjs, byte for byte below a marker), the QA scripts
# that walk them, and this script. audits/ discusses them by name.
MARK_FILES=(
  adapters/codex/plugin/CONTRACTS.md
  adapters/codex/plugin/commands/learn.md
  adapters/codex/plugin/agents/learn-known.md
  adapters/codex/plugin/agents/learn-asked.md
  adapters/codex/plugin/agents/learn-harder.md
  adapters/codex/plugin/agents/learn-prepare.md
  adapters/codex/plugin/agents/learn-fact-checker.md
  adapters/codex/plugin/agents/learn-blind-reader.md
  adapters/codex/plugin/agents/learn-synthesis.md
  plugins/djinn/CONTRACTS.md
  plugins/djinn/commands/learn.md
  plugins/djinn/agents/learn-known.md
  plugins/djinn/agents/learn-asked.md
  plugins/djinn/agents/learn-harder.md
  plugins/djinn/agents/learn-prepare.md
  plugins/djinn/agents/learn-fact-checker.md
  plugins/djinn/agents/learn-blind-reader.md
  plugins/djinn/agents/learn-synthesis.md
  qa/human/learn-leak-guards.md
  qa/bot/private-guards.sh
  tools/check-private.sh
)
# The only files allowed to carry a home directory path: this script, which
# defines the pattern, and the scratch repo test, which plants one.
HOME_FILES=(
  qa/bot/private-guards.sh
  tools/check-private.sh
)
# A user name starts with a letter, digit or underscore, so the placeholder
# forms docs use (/home/<user>/) never match.
HOME_PATH='(/home/[A-Za-z0-9_][A-Za-z0-9_.-]*/|/Users/[A-Za-z0-9_][A-Za-z0-9_.-]*/|[A-Za-z]:\\Users\\[A-Za-z0-9_])'
# The shared Windows and macOS folders are not a user's home.
HOME_OK='/Users/(Shared|Public|Default)/'
PATTERNS_REL='local/private-patterns.txt'
ALLOW_MISSING_VAR='PRIVATE_CHECK_ALLOW_MISSING'
failed=0
words_checked=1

mode=worktree
tree=
revs=()
case "$1" in
  '') ;;
  --tree)
    [ "$#" -eq 2 ] || { echo "private check: FAIL, --tree takes one commit" >&2; exit 1; }
    tree=$(git rev-parse --verify --quiet "$2^{commit}") || { echo "private check: FAIL, --tree: $2 is not a commit" >&2; exit 1; }
    mode=tree ;;
  --history)
    shift
    [ "$#" -ge 1 ] || { echo "private check: FAIL, --history takes rev-list arguments" >&2; exit 1; }
    revs=("$@")
    mode=history ;;
  *)
    echo "private check: FAIL, unknown argument $1 (none, --tree <sha>, or --history <revs>)" >&2
    exit 1 ;;
esac

tmp=$(mktemp) || { echo "private check: FAIL, mktemp failed" >&2; exit 1; }
added=$(mktemp) || { rm -f "$tmp"; echo "private check: FAIL, mktemp failed" >&2; exit 1; }
trap 'rm -f "$tmp" "$added"' EXIT

# The pattern list, filtered into $tmp. Missing fails unless the override
# variable is set; empty always fails.
patterns="$root/$PATTERNS_REL"
if [ ! -f "$patterns" ]; then
  common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)
  [ -n "$common" ] && [ -f "$common/../$PATTERNS_REL" ] && patterns="$common/../$PATTERNS_REL"
fi
if [ ! -f "$patterns" ]; then
  if [ "${!ALLOW_MISSING_VAR}" = "1" ]; then
    echo "private check: PRIVATE WORDS NOT CHECKED. $PATTERNS_REL does not exist here or in the main worktree, and $ALLOW_MISSING_VAR=1 allows that." >&2
    words_checked=0
  else
    echo "private check: FAIL, $PATTERNS_REL does not exist here or in the main worktree, so the private words cannot be checked." >&2
    echo "private check: make it (one extended regex per line, # comments), or set $ALLOW_MISSING_VAR=1 to run the other passes on a clone with no list." >&2
    failed=1
    words_checked=0
  fi
else
  grep -v -E '^[[:space:]]*(#|$)' "$patterns" > "$tmp"
  count=$(wc -l < "$tmp")
  if [ "$count" -eq 0 ]; then
    echo "private check: FAIL, $PATTERNS_REL holds no patterns; an empty list checks nothing" >&2
    failed=1
    words_checked=0
  fi
fi

# Run git grep over the working tree (worktree mode) or over $tree (tree
# mode) with the grep options before `--` and the pathspecs after it; print
# matching file names. Exit 0 on a match, 1 on none, 2 on a git error
# (reported here).
grep_files() {
  local opts=() out rc
  while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do opts+=("$1"); shift; done
  [ "$1" = "--" ] && shift
  if [ "$mode" = tree ]; then
    out=$(git -c core.quotePath=false grep -l "${opts[@]}" "$tree" -- "$@" 2>&1)
  else
    out=$(git -c core.quotePath=false grep --untracked -l "${opts[@]}" -- "$@" 2>&1)
  fi
  rc=$?
  if [ "$rc" -gt 1 ]; then
    echo "private check: FAIL, git grep exited $rc: $out" >&2
    return 2
  fi
  [ -n "$out" ] && printf '%s\n' "$out"
  return "$rc"
}

# Report one pass's hits and set failed. $1 is grep_files' status, $2 the
# hits, $3 what they carry.
report() {
  if [ "$1" -eq 2 ]; then
    failed=1
  elif [ "$1" -eq 0 ]; then
    echo "private check: $3:" >&2
    echo "$2" >&2
    failed=1
  fi
}

is_home_file() {
  local f
  for f in "${HOME_FILES[@]}"; do [ "$1" = "$f" ] && return 0; done
  return 1
}

is_mark_file() {
  local f
  for f in "${MARK_FILES[@]}"; do [ "$1" = "$f" ] && return 0; done
  return 1
}

tree_passes() {
  # Pass 1: learn/ and local/ paths.
  local listing rc paths hits pattern excludes f
  if [ "$mode" = tree ]; then
    listing=$(git -c core.quotePath=false ls-tree -r --name-only "$tree")
  else
    listing=$(git -c core.quotePath=false ls-files --cached --others --exclude-standard)
  fi
  rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "private check: FAIL, git could not list the files (exit $rc)" >&2
    failed=1
  else
    paths=$(printf '%s\n' "$listing" | grep -E '(^|/)(learn|local)/')
    [ -n "$paths" ] && report 0 "$paths" "learn/ or local/ files are tracked or unignored"
  fi

  # Pass 2: the learn marks outside the files that define them.
  excludes=(':!audits')
  for f in "${MARK_FILES[@]}"; do excludes+=(":(exclude,literal)$f"); done
  for pattern in "$BANNER" "$ROW_KEY" "$DRAFT_STATUS"; do
    hits=$(grep_files -F -e "$pattern" -- . "${excludes[@]}")
    report $? "$hits" "files carry '$pattern', the mark of a learn run"
  done

  # Pass 3: home directory paths, everywhere.
  excludes=()
  for f in "${HOME_FILES[@]}"; do excludes+=(":(exclude,literal)$f"); done
  hits=$(grep_files -i -E -e "$HOME_PATH" --and --not -e "$HOME_OK" -- . "${excludes[@]}")
  report $? "$hits" "files carry a home directory path (write ~ instead)"

  # Pass 4: the owner's private words, everywhere.
  if [ "$words_checked" -eq 1 ]; then
    hits=$(grep_files -i -E -f "$tmp" -- .)
    report $? "$hits" "files carry a word from $PATTERNS_REL (the words are not printed)"
  fi
}

history_passes() {
  local commits c short msg rc paths
  commits=$(git rev-list "${revs[@]}") || { echo "private check: FAIL, git rev-list ${revs[*]} failed" >&2; failed=1; return; }
  [ -z "$commits" ] && { echo "private check: history: no commits in ${revs[*]}"; return; }
  for c in $commits; do
    short=${c:0:12}
    # The message.
    msg=$(git log -1 --format=%B "$c") || { echo "private check: FAIL, git log $short failed" >&2; failed=1; continue; }
    if [ "$words_checked" -eq 1 ] && printf '%s\n' "$msg" | grep -q -i -E -f "$tmp"; then
      echo "private check: commit $short's message carries a word from $PATTERNS_REL" >&2; failed=1
    fi
    if printf '%s\n' "$msg" | grep -i -E -e "$HOME_PATH" | grep -q -v -i -E -e "$HOME_OK"; then
      echo "private check: commit $short's message carries a home directory path" >&2; failed=1
    fi
    # Added paths (pass 1).
    paths=$(git -c core.quotePath=false show --no-renames --diff-filter=A --name-only --format= "$c") \
      || { echo "private check: FAIL, git show $short failed" >&2; failed=1; continue; }
    paths=$(printf '%s\n' "$paths" | grep -E '(^|/)(learn|local)/')
    [ -n "$paths" ] && report 0 "$paths" "commit $short adds learn/ or local/ files"
    # Added lines, one per line as <path><TAB><text>; the +++ line itself
    # is kept, so a private word in a new file's name is caught too. A merge
    # is read against its first parent.
    git -c core.quotePath=false show --no-color --no-ext-diff --no-textconv --no-renames \
        -m --first-parent --unified=0 --format= "$c" \
      | awk '/^\+\+\+ /{p=substr($0,5); sub(/^b\//,"",p); print p "\t" $0; next}
             /^\+/{print p "\t" substr($0,2)}' > "$added"
    rc=$?
    [ "$rc" -ne 0 ] && { echo "private check: FAIL, reading the diff of $short failed" >&2; failed=1; continue; }
    if [ "$words_checked" -eq 1 ]; then
      paths=$(grep -i -E -f "$tmp" "$added" | cut -f1 | sort -u)
      [ -n "$paths" ] && report 0 "$paths" "commit $short adds lines carrying a word from $PATTERNS_REL (the words are not printed)"
    fi
    paths=$(grep -i -E -e "$HOME_PATH" "$added" | grep -v -i -E -e "$HOME_OK" | cut -f1 | sort -u \
      | while IFS= read -r f; do is_home_file "$f" || printf '%s\n' "$f"; done)
    [ -n "$paths" ] && report 0 "$paths" "commit $short adds lines carrying a home directory path"
    paths=$(grep -F -e "$BANNER" -e "$ROW_KEY" -e "$DRAFT_STATUS" "$added" | cut -f1 | sort -u \
      | while IFS= read -r f; do case "$f" in audits/*) ;; *) is_mark_file "$f" || printf '%s\n' "$f" ;; esac; done)
    [ -n "$paths" ] && report 0 "$paths" "commit $short adds a learn mark outside the files that define it"
  done
}

if [ "$mode" = history ]; then
  history_passes
else
  tree_passes
fi

where="the working tree"
[ "$mode" = tree ] && where="the tree of ${tree:0:12}"
[ "$mode" = history ] && where="the added lines and messages of ${revs[*]}"
if [ "$failed" -ne 0 ]; then
  echo "private check: FAIL in $where. Move run folders to local/ (gitignored), write ~ for the home folder, and scrub private words before any commit; a word already committed needs the range collapsed or rewritten before a push." >&2
  exit 1
fi
if [ "$words_checked" -eq 0 ]; then
  echo "private check: clean in $where, except private words NOT CHECKED ($ALLOW_MISSING_VAR=1)"
  exit 0
fi
echo "private check: $count private patterns, 0 hits in $where"
echo "private check: clean"
