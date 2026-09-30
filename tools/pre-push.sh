#!/usr/bin/env bash
# git pre-push hook: check what a push publishes, as well as the folder it is
# pushed from. For every ref git hands the hook on stdin
# (<local ref> <local sha> <remote ref> <remote sha>), it runs
# tools/check-private.sh over:
#   - every commit the push sends: each added line, added path and commit
#     message of <remote sha>..<local sha>, or, for a new branch, of every
#     commit on <local sha> that no remote ref already holds;
#   - the tree at <local sha>, which is what the remote shows at its tip;
# and, once, over the working tree, as the build gate does. A delete sends
# nothing and is skipped. Any failure stops the push, and so does a missing
# local/private-patterns.txt (see check-private.sh for the override).
# Install once per clone, from the repo root:
#   git config core.hooksPath tools/hooks
# (tools/hooks/pre-push runs this file), or link it by hand:
#   ln -s ../../tools/pre-push.sh .git/hooks/pre-push
#
# @interacts  reads the ref lines git writes to stdin; runs
#             tools/check-private.sh; writes nothing
# @deps       bash, git, tools/check-private.sh
# @complexity O(r * check-private.sh): r refs pushed at once (1 or 2)
# @alloc      none beyond check-private.sh's temp files
root=$(git rev-parse --show-toplevel) || exit 1
check="$root/tools/check-private.sh"
status=0

while read -r local_ref local_sha remote_ref remote_sha; do
  [ -n "$local_sha" ] || continue
  case "$local_sha" in *[!0]*) ;; *) continue ;; esac   # a delete: nothing is sent
  new_branch=1
  case "$remote_sha" in *[!0]*) new_branch=0 ;; esac
  if [ "$new_branch" -eq 0 ] && git cat-file -e "$remote_sha^{commit}" 2>/dev/null; then
    bash "$check" --history "$remote_sha..$local_sha" || status=1
  else
    # A new branch, or a remote tip this clone does not hold: check every
    # commit no remote ref already holds.
    bash "$check" --history "$local_sha" --not --remotes || status=1
  fi
  bash "$check" --tree "$local_sha" || status=1
  echo "pre-push: checked $local_ref for $remote_ref" >&2
done

bash "$check" || status=1
[ "$status" -eq 0 ] || echo "pre-push: FAIL, the push is refused; nothing was sent." >&2
exit "$status"
