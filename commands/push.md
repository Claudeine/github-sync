---
description: Commit and push my changes to GitHub / Enregistrer et envoyer mes modifications sur GitHub
argument-hint: [optional commit message]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(date:*)
---

Repository status: !`git status -sb 2>&1`
Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
Notifications (anything but "off" means on): !`git config --global --default on --get github-sync.notifications`

Commit message given by the user (may be empty): $ARGUMENTS

Write every reply, and the commit message, in the reply language above, in plain words.

If this folder is not linked to GitHub, say so and suggest `/github-sync:setup`. Otherwise:

1. If there is nothing to commit, say so. If local commits are not pushed yet, only run `git push`.
2. Before adding anything, check that no sensitive file is included (keys, passwords, `.env` files, access tokens) and no very large file. If there is one, stop and ask me what to do.
3. `git add -A`, then `git commit` with a short, clear message describing the changes (use mine if I gave one). If git refuses because no name or email is set, suggest `/github-sync:setup`.
4. `git push`.
5. If GitHub refuses the push because it holds newer changes, never force (no `--force`). Explain simply and suggest `/github-sync:pull` first.
6. Notification:
   - failure: always a quoted warning line ("> Attention : le push n'a pas pu se faire (…)" / "> Warning: the push failed (…)") and the suggested fix;
   - success or nothing to send, notifications on: take the time with `date +%H:%M:%S`, the version and file count with `git log -1 --shortstat --format=%h`, then one quoted line, e.g. "> Push réussi à 14:02:11 : 3 fichiers envoyés (version abc1234)." / "> Push succeeded at 14:02:11: 3 files sent (version abc1234)." (say so instead of a file count when only earlier commits were sent), or "nothing to send, already up to date";
   - success, notifications off: no notification line.
   End with one short sentence on what was sent.
