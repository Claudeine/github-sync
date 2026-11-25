---
description: Link this folder to GitHub (check the tools, get an existing project, or publish this folder) / Relier ce dossier à GitHub
allowed-tools: Bash(git:*), Bash(gh --version), Bash(gh auth status:*), Bash(gh repo list:*), Bash(gh repo view:*), Bash(gh repo create:*), Bash(gh auth setup-git:*), Bash(ls:*), Bash(pwd), Bash(uname:*)
---

Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
Folder: !`pwd`

You set up the GitHub sync of this folder. Write in the reply language above, in plain words for someone who is not technical. Never force anything (no `--force`), never overwrite or delete a file.

**Step 0 — Look around.** Run these checks yourself, one per call (a tool may be missing, so an error is an answer too): `uname -s`, `git --version`, `git config --global user.name`, `git config --global user.email`, `gh --version`, `gh auth status`, `git remote get-url origin`, `ls -A`.

**Step 1 — Check the tools.** Go through this list in order and stop at the first missing item, explaining what it is for and how to get it. Read `uname -s`: `Darwin` is macOS, `Linux` is Linux, anything else (`MINGW…`, `MSYS…`, `Windows`) is Windows.
1. **git** (does the syncing). macOS: `xcode-select --install` (or `brew install git`). Windows: `winget install --id Git.Git -e`. Linux: the distribution's package manager, e.g. `sudo apt install git` or `sudo dnf install git`.
2. **GitHub CLI `gh`** (talks to GitHub: lists, creates repositories, logs in). macOS: `brew install gh`. Windows: `winget install --id GitHub.cli -e`. Linux: see https://github.com/cli/cli#installation (e.g. `sudo apt install gh`).
   For these two, offer to run the install command yourself, and run it only once I say yes, except commands that start with `sudo` or open a system window (`xcode-select`): give those to me to run in a terminal. If `brew` or `winget` is missing too, say so and point to https://brew.sh or the Microsoft Store "App Installer". After an install, tell me that a new conversation may be needed for the tool to be found.
3. **GitHub login.** If `gh auth status` says I am not logged in, tell me to run `gh auth login` in a terminal myself (choose GitHub.com, HTTPS, and log in with the browser); never type a password or token yourself.
4. **git uses that login.** Run `gh auth setup-git` (it lets git push and pull with the GitHub login; it changes nothing else). GitHub Desktop is not needed.
5. **git identity** (the name and email written on each commit). If one is empty, ask me for it, then set it with `git config --global user.name "<name>"` and `git config --global user.email "<email>"`. GitHub's private address `<id>+<login>@users.noreply.github.com` works if I prefer not to show my email.

**Step 2 — Already linked?** If `git remote get-url origin` gave an address, say so in one sentence with its name, and stop.

**Step 3 — Ask me** (AskUserQuestion) what to do:
- **Get a project that already exists on GitHub** (for example to sync it on a second machine);
- **Publish this folder on GitHub** (a new repository, or an existing empty one).

*Get an existing project*
- List my repositories with `gh repo list --limit 50 --json nameWithOwner,description,updatedAt` and ask which one (most recent first; I can also give an address).
- Empty folder (or only `.claude`, `.DS_Store`): `git clone <address> .`.
- Folder not empty: do not mix. Clone into a subfolder `./<repository-name>` and tell me to open that subfolder in a new Claude conversation so the sync starts there.

*Publish this folder*
- Ask for the repository name (suggest the folder name) and whether it is private (default) or public, or for the address of an existing empty repository.
- `git init -b main` if the folder is not a git repository yet.
- If there is no `.gitignore`, create one with at least: `.DS_Store`, `Thumbs.db`, `.env`, `.env.*`, `.claude/settings.local.json`.
- Check that no sensitive file (keys, passwords, `.env`, tokens) or very large file would be sent; if one would, stop and ask me.
- `git add -A`, then a first commit ("Premier envoi" / "First commit").
- New repository: `gh repo create <name> --private|--public --source=. --remote=origin --push`. Existing empty repository: `git remote add origin <address>` then `git push -u origin main`; if it is refused because the repository is not empty, stop and explain.

**To finish**, one quoted line: "> Synchro configurée : <folder> ↔ <owner/repo>." / "> Sync set up: <folder> ↔ <owner/repo>.", then say that the Pull / Push buttons appear after this reply and the automatic pull runs from the next conversation opened in this folder.
