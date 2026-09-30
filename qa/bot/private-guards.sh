#!/usr/bin/env bash
# Drives tools/check-private.sh and tools/pre-push.sh in throwaway repos
# made with mktemp -d, never in this repo or its history, and prints one
# PASS or FAIL line per case. Every case pushes to a bare scratch remote
# through the real hook (git config core.hooksPath tools/hooks), so a
# refused push is git refusing it, and the remote's ref is read back to
# prove nothing was sent. The private word is a made up one written into
# the scratch repo's own local/private-patterns.txt.
# Run from anywhere: bash qa/bot/private-guards.sh. Exit 0 when every case
# passes.
#
# @interacts  copies tools/check-private.sh, tools/pre-push.sh and
#             tools/hooks/pre-push into scratch repos under one mktemp -d
#             folder, removed on exit; runs git in them
# @deps       bash, git, mktemp
# @complexity O(k): k cases (16), each a handful of git calls
# @alloc      one scratch folder, removed on exit
set -u
src=$(git -C "$(dirname "$0")" rev-parse --show-toplevel) || exit 1
work=$(mktemp -d) || exit 1
trap 'rm -rf "$work"' EXIT
WORD='zorblaxquint'
passed=0
failed=0
G=(git -c user.name=qa -c user.email=qa@example.invalid -c init.defaultBranch=main -c advice.detachedHead=false)

ok()   { echo "PASS $1"; passed=$((passed + 1)); }
bad()  { echo "FAIL $1"; failed=$((failed + 1)); }
expect() {  # expect <want exit> <case name> <command...>
  local want=$1 name=$2; shift 2
  local out rc
  out=$("$@" 2>&1); rc=$?
  if { [ "$want" = 0 ] && [ "$rc" -eq 0 ]; } || { [ "$want" != 0 ] && [ "$rc" -ne 0 ]; }; then
    ok "$name"
  else
    bad "$name (exit $rc)"; printf '%s\n' "$out" | sed 's/^/    /'
  fi
}

# A fresh repo with the guards, a pattern list, one clean commit, and a
# bare remote holding that commit on main.
fresh() {
  local d="$work/$1"
  "${G[@]}" init -q "$d/repo" && "${G[@]}" init -q --bare "$d/remote.git" || return 1
  mkdir -p "$d/repo/tools/hooks" "$d/repo/local"
  cp "$src/tools/check-private.sh" "$src/tools/pre-push.sh" "$d/repo/tools/"
  cp "$src/tools/hooks/pre-push" "$d/repo/tools/hooks/"
  printf 'local/\n' > "$d/repo/.gitignore"
  printf '# scratch list\n%s\n' "$WORD" > "$d/repo/local/private-patterns.txt"
  printf 'public text\n' > "$d/repo/notes.md"
  (cd "$d/repo" && "${G[@]}" add -A && "${G[@]}" commit -q -m "clean start" \
     && "${G[@]}" config core.hooksPath tools/hooks \
     && "${G[@]}" remote add origin "$d/remote.git" && "${G[@]}" push -q origin main) >/dev/null 2>&1 || return 1
  echo "$d/repo"
}
remote_tip() { git -C "$1/../remote.git" rev-parse --verify --quiet "refs/heads/$2"; }

# 1 to 3: the pattern list.
r=$(fresh c1) || exit 1
expect 0 "clean tree passes" bash -c "cd '$r' && bash tools/check-private.sh"
mv "$r/local/private-patterns.txt" "$work/list.bak"
expect 1 "missing list fails" bash -c "cd '$r' && bash tools/check-private.sh"
out=$(cd "$r" && PRIVATE_CHECK_ALLOW_MISSING=1 bash tools/check-private.sh 2>&1); rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -q 'NOT CHECKED'; then ok "missing list with the override passes and says NOT CHECKED"; else bad "override (exit $rc)"; fi
: > "$r/local/private-patterns.txt"
expect 1 "empty list fails, override or not" bash -c "cd '$r' && PRIVATE_CHECK_ALLOW_MISSING=1 bash tools/check-private.sh"
mv "$work/list.bak" "$r/local/private-patterns.txt"

# 4: a word in the tree.
echo "a $WORD here" >> "$r/notes.md"
expect 1 "word in the working tree fails" bash -c "cd '$r' && bash tools/check-private.sh"
(cd "$r" && "${G[@]}" checkout -q -- notes.md)

# 5 and 6: a word committed, then scrubbed. The tree is clean; the push is not.
r=$(fresh c5) || exit 1
(cd "$r" && echo "a $WORD here" >> notes.md && "${G[@]}" commit -q -am "add a line" \
   && "${G[@]}" checkout -q HEAD~1 -- notes.md && "${G[@]}" commit -q -am "scrub it")
before=$(remote_tip "$r" main)
expect 0 "scrubbed tree passes the tree check" bash -c "cd '$r' && bash tools/check-private.sh && bash tools/check-private.sh --tree HEAD"
expect 1 "scrubbed range fails the history check" bash -c "cd '$r' && bash tools/check-private.sh --history HEAD~2..HEAD"
expect 1 "git push of the scrubbed range is refused" bash -c "cd '$r' && git push -q origin main"
[ "$(remote_tip "$r" main)" = "$before" ] && ok "the remote did not move" || bad "the remote moved"

# 7: a word in a commit message only.
r=$(fresh c7) || exit 1
(cd "$r" && echo "more" >> notes.md && "${G[@]}" commit -q -am "fix for $WORD")
expect 1 "a word in a commit message refuses the push" bash -c "cd '$r' && git push -q origin main"

# 8: a new branch, whose commits no remote ref holds.
r=$(fresh c8) || exit 1
(cd "$r" && "${G[@]}" checkout -q -b topic && echo "a $WORD here" > extra.md && "${G[@]}" add extra.md \
   && "${G[@]}" commit -q -m "extra" && "${G[@]}" rm -q extra.md && "${G[@]}" commit -q -m "drop extra")
expect 1 "a new branch carrying the word in its history is refused" bash -c "cd '$r' && git push -q origin topic"
[ -z "$(remote_tip "$r" topic)" ] && ok "the new branch was not created" || bad "the new branch was created"

# 9: a home path, a local/ file and a learn mark, each added then removed.
r=$(fresh c9) || exit 1
(cd "$r" && echo "see /home/someone/notes" >> notes.md && "${G[@]}" commit -q -am "path" \
   && "${G[@]}" checkout -q HEAD~1 -- notes.md && "${G[@]}" commit -q -am "unpath")
expect 1 "a home path in the range refuses the push" bash -c "cd '$r' && git push -q origin main"
r=$(fresh c10) || exit 1
(cd "$r" && echo x > local/run.md && "${G[@]}" add -f local/run.md && "${G[@]}" commit -q -m "oops" \
   && "${G[@]}" rm -q --cached local/run.md && "${G[@]}" commit -q -m "unoops")
expect 1 "a local/ file added in the range refuses the push" bash -c "cd '$r' && git push -q origin main"
r=$(fresh c11) || exit 1
(cd "$r" && mkdir -p docs audits && echo 'status: learn draft, not yet reviewed' > docs/run.md \
   && "${G[@]}" add docs && "${G[@]}" commit -q -m "mark" && "${G[@]}" rm -q docs/run.md && "${G[@]}" commit -q -m "unmark")
expect 1 "a learn mark outside the defining files refuses the push" bash -c "cd '$r' && git push -q origin main"
r=$(fresh c12) || exit 1
(cd "$r" && mkdir -p audits && echo 'the status learn draft, not yet reviewed is discussed' > audits/note.md \
   && "${G[@]}" add audits && "${G[@]}" commit -q -m "audit note")
expect 0 "a learn mark under audits/ is allowed and the push goes out" bash -c "cd '$r' && git push -q origin main"

# 13: a clean push goes out, and a delete is not checked.
r=$(fresh c13) || exit 1
(cd "$r" && echo "more public text" >> notes.md && "${G[@]}" commit -q -am "more")
expect 0 "a clean push goes out" bash -c "cd '$r' && git push -q origin main"
[ "$(remote_tip "$r" main)" = "$(git -C "$r" rev-parse HEAD)" ] && ok "the remote reads the pushed tip" || bad "the remote did not move"
(cd "$r" && "${G[@]}" push -q origin main:gone) >/dev/null 2>&1
expect 0 "a delete push is not blocked" bash -c "cd '$r' && git push -q origin :gone"

echo "private guards: $passed passed, $failed failed"
[ "$failed" -eq 0 ]
