---
description: Commit and push my changes to GitHub / Enregistrer et envoyer mes modifications sur GitHub
argument-hint: [optional commit message]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(git ls-files:*), Bash(git config --local:*), Bash(git check-ignore:*), Bash(find:*), Bash(date:*), Bash(gh repo view:*), Bash(uname:*), Bash(mkdir:*), Bash(tar:*), Bash(zip:*)
---

Repository status: !`git status -sb 2>&1`
Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
Notifications (anything but "off" means on): !`git config --global --default on --get github-sync.notifications`

Commit message given by the user (may be empty): $ARGUMENTS

Write every reply, and the commit message, in the reply language above, in plain words.

If this folder is not linked to GitHub, say so and suggest `/github-sync:setup`. Otherwise:

**Sensitive files** are keys, passwords, `.env` files, `wp-config.php`, access tokens, certificates (`.pem`, `.key`, `.p12`, `.pfx`), and every path or pattern listed in `.github-sync-sensitive` at the project root (one per line; `dir/` is a whole folder, `*` any characters, `#` a comment). **Large files** are over 50 MB: GitHub warns from 50 MB and refuses from 100 MB.

1. **Sensitive files kept out by `.gitignore`.** Git skips them without a word, so they would be missing on the other computer. List them with `git ls-files --others --ignored --exclude-standard --directory` and keep only the sensitive ones (not media, caches or dependencies, unless declared). Leave out those I already chose to keep off GitHub (`git config --local --get-all github-sync.keepout`) or to carry in the zip (`git config --local --get-all github-sync.zip`). If some remain, tell me plainly that they are not synced and would be missing on my other computer, then offer **the choice** below.
2. **Keep the zip up to date.** If `git config --local --get-all github-sync.zip` lists files, check whether the zip (see **The zip**) is missing or older than one of them: `find <file> <file>… -newer ../<zip name>` (any output, or a missing zip, means it is stale). If so, make it again with all those files (it replaces the old one) and say in one quoted line: "> Fichiers hors GitHub modifiés : zip mis à jour (<path>), pensez à le transférer sur l'autre ordinateur." / "> Off-GitHub files changed: zip updated (<path>), remember to carry it to the other computer." A listed file that no longer exists is left out of the zip and named in that line. If the zip is up to date, say nothing about it.
3. If there is nothing to commit and step 1 sent nothing, say so. If local commits are not pushed yet, only run `git push`.
4. **Before adding anything**, check the changed files for sensitive files and large files (`find <changed files> -size +50M`). A large file that is not sensitive: offer **the choice** below, where "send it anyway" is allowed on any repository between 50 and 100 MB (say GitHub will warn) and never over 100 MB. A sensitive file already sent in an earlier commit (tracked by git) in a private repository: I already agreed to it, go on. Any other: offer **the choice** below.

**The choice**, for sensitive files (and large ones, as said above). First check the repository's visibility with `gh repo view --json visibility -q .visibility`.
- **Private** (`PRIVATE` or `INTERNAL`): tell me plainly the risk: anyone given access to the repository, now or later, can read them; they stay in the history even if deleted later; if the repository is ever made public, they are exposed. Then ask me (AskUserQuestion, one answer for all, or file by file if I want):
  - **Send them anyway**: only after this explicit yes, and only the files I named. A file kept out by `.gitignore` is added with `git add -f <file>`; leave its `.gitignore` line in place: once sent, git follows the file's changes anyway, and the line still keeps out similar files created later (`.env.local`, say). Say this in one sentence.
  - **Keep them off GitHub**: do not add them. Record each with `git config --local --add github-sync.keepout <path>` so I am not asked again (this stays on this computer, it is not sent); a new file not in `.gitignore` is also offered to be added to it.
  - **Put them in a zip** to carry by hand (below). Record each with `git config --local --add github-sync.zip <path>` (not as kept off GitHub), so the zip is made again whenever they change; a new file not in `.gitignore` is also offered to be added to it.
- **Public**, or the visibility cannot be read: never send them, even if I insist; say why in one sentence. Offer to keep them off GitHub or to put them in a zip, as above.
- **The zip** holds only the files I chose to carry by hand (sensitive or large), at their paths from the project root, so that unzipping it at the root of the project on the other computer puts each file back in place. Create it **outside the project** (so it is never sent): in the folder that holds the project, always under the same name, `<project>-hors-github.zip` / `<project>-off-github.zip` (the name in the reply language when it was first made; keep using the one that exists), so a new version replaces the old one. It holds every file listed in `github-sync.zip`. From the project root: macOS and Windows (`uname -s` is `Darwin`, `MINGW…`, `MSYS…`, or `uname` is missing) `tar -a -cf ../<name>.zip <file> <file>…`; Linux `zip ../<name>.zip <file> <file>…`. Then tell me its full path and how to use it: carry it by USB key, AirDrop or a password manager (never by GitHub or an unencrypted email), unzip it at the root of the project on the other computer (replacing the old files), and delete it there once unzipped; keep it here, it is what tells me when it needs to be made again.
- To be asked again about a file, I can say so: remove it with `git config --local --unset github-sync.keepout <path>` (or `github-sync.zip`).
- If a sensitive file is already in a commit in a public repository, stop and explain; never rewrite history without my agreement.

Then:

5. `git add -A`, leaving out the files I chose to keep off GitHub or carry in the zip that git can see (not those `.gitignore` already keeps out, which would make it fail): `git add -A -- . ':(exclude,literal)<file>'…`. Then `git commit` with a short, clear message describing the changes (use mine if I gave one). If git refuses because no name or email is set, suggest `/github-sync:setup`.
6. `git push`.
7. If GitHub refuses the push because it holds newer changes, never force (no `--force`). Explain simply and suggest `/github-sync:pull` first.
8. Notification:
   - failure: always a quoted warning line ("> Attention : le push n'a pas pu se faire (…)" / "> Warning: the push failed (…)") and the suggested fix;
   - success or nothing to send, notifications on: take the time with `date +%H:%M:%S`, the version and file count with `git log -1 --shortstat --format=%h`, then one quoted line, e.g. "> Push réussi à 14:02:11 : 3 fichiers envoyés (version abc1234)." / "> Push succeeded at 14:02:11: 3 files sent (version abc1234)." (say so instead of a file count when only earlier commits were sent), or "nothing to send, already up to date";
   - success, notifications off: no notification line.
   End with one short sentence on what was sent. If this push asked me about sensitive or large files, add that the ⚠︎ button lists them, and that I can declare another file just by writing it, e.g. « Déclare le fichier config/api.json comme sensible » / "Declare config/api.json as sensitive".
