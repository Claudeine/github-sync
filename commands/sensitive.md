---
description: List and manage the sensitive and large files of this project / Voir et gérer les fichiers sensibles et volumineux du projet
argument-hint: [optional: what you want, in your own words]
allowed-tools: Bash(git status:*), Bash(git ls-files:*), Bash(git config --local:*), Bash(git check-ignore:*), Bash(gh repo view:*), Bash(find:*), Bash(ls:*), Bash(uname:*), Bash(tar:*), Bash(zip:*)
---

Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
What I asked for (may be empty): $ARGUMENTS

Write in the reply language above, in plain words for someone who is not technical. Never send anything to GitHub here (no commit, no push), never delete a file of mine.

If this folder is not linked to GitHub, say so and suggest `/github-sync:setup`.

**Which files count.**
- **Sensitive**: keys, passwords, `.env` files, `wp-config.php`, access tokens, certificates (`.pem`, `.key`, `.p12`, `.pfx`), and every path or pattern in `.github-sync-sensitive` at the project root (one per line; `dir/` is a whole folder, `*` any characters, `#` a comment). That file holds names only, never contents, and is sent with the project so every computer knows the list.
- **Large**: over 50 MB (GitHub warns from 50 MB and refuses from 100 MB).
- Look at every file in the project: tracked (`git ls-files`), new (`git status --porcelain -uall`) and kept out by `.gitignore` (`git ls-files --others --ignored --exclude-standard --directory`), leaving out media, caches and dependency folders unless a file in them is sensitive or declared. Find large ones with `find . -path ./.git -prune -o -type f -size +50M -print`.

**Status of each file**, read from:
- sent to GitHub: tracked by git;
- kept off GitHub: listed by `git config --local --get-all github-sync.keepout`;
- carried in the zip: listed by `git config --local --get-all github-sync.zip`;
- not decided yet: none of these.
(The last two are this computer's choices and are not sent.)

**If I asked for something** (above), do it:
- **Declare a file sensitive**: add its path (relative to the project root) or pattern to `.github-sync-sensitive`, creating the file if needed with a first comment line explaining it. If the file is already sent to GitHub, say that declaring it now does not remove it from GitHub or its history, and offer (do not do it without my yes) to stop following it with `git rm --cached <file>` on the next push.
- **Remove a declaration**: take the line out of `.github-sync-sensitive`; files the built-in list catches stay sensitive, say so.
- **Change a choice** (send, keep off GitHub, zip): update `github-sync.keepout` / `github-sync.zip` with `git config --local --add` or `--unset`. Sending is decided at the next ⬆, with its usual checks: sensitive files only to a private repository (`gh repo view --json visibility -q .visibility`) and only after my explicit yes; never a file over 100 MB.
- **Make the zip now**: same zip as ⬆ makes, holding every file listed in `github-sync.zip`, at its path from the project root, outside the project, in the folder that holds it: `<project>-hors-github.zip` / `<project>-off-github.zip` (keep the name that exists). macOS and Windows: `tar -a -cf ../<name>.zip <file>…`; Linux: `zip ../<name>.zip <file>…`. Give its full path and how to use it: carry it by USB key, AirDrop or a password manager (never by GitHub or an unencrypted email), unzip it at the root of the project on the other computer, delete it there once unzipped, keep it here.

**Then show the list**: one short table, sensitive files first then large ones, with the file, why it counts (built-in, declared, large: its size) and its status. If there is none, say so in one sentence. If some are "not decided yet", say they will be asked about at the next ⬆. End with a short "what you can do" part for someone who has never used a command: say I only have to write what I want in the message box, in my own words, and give these examples as a short list, each in its own code block so it can be copied (in the reply language; use a real file of the list when there is one, else `config/api.json`):
- FR: « Déclare le fichier config/api.json comme sensible » (and say: the path starts from the project folder; a whole folder ends with `/`, like `sauvegardes/`; every file of a kind with `*`, like `*.sqlite`), « Ne déclare plus config/api.json comme sensible », « Mets .env dans le zip », « Garde .env hors de GitHub », « Refais le zip maintenant ».
- EN: "Declare config/api.json as sensitive" (same explanation), "Stop declaring config/api.json as sensitive", "Put .env in the zip", "Keep .env off GitHub", "Make the zip now".
Never show the `/github-sync:sensitive` command syntax in this part.
