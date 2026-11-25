---
description: Pull the latest changes from GitHub / Récupérer les dernières modifications depuis GitHub
allowed-tools: Bash(git status:*), Bash(git pull:*), Bash(git log:*), Bash(git rev-parse:*), Bash(date:*)
---

Repository status: !`git status -sb 2>&1`
Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
Notifications (anything but "off" means on): !`git config --global --default on --get github-sync.notifications`

Write every reply in the reply language above, in plain words.

If this folder is not linked to GitHub, say so and suggest `/github-sync:setup`. Otherwise run `git pull --ff-only`.

- Success, notifications on: end with one quoted line (`>`) giving the time (`date +%H:%M:%S`), whether new changes came in, and the version (`git rev-parse --short HEAD`), e.g. "> Pull réussi à 14:02:11 : déjà à jour (version abc1234)." / "> Pull succeeded at 14:02:11: already up to date (version abc1234).", then one sentence on what was received. Notifications off: one short sentence only.
- Failure (unsaved local changes, diverged history, conflict): always show a quoted warning line ("> Attention : le pull n'a pas pu se faire (…)" / "> Warning: the pull failed (…)"), explain simply what blocks it and suggest a fix. Never force, overwrite or delete anything without my agreement.
