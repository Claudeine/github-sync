---
description: Link this folder to GitHub (check the tools, get an existing project, or publish this folder) / Relier ce dossier à GitHub
allowed-tools: Bash(git:*), Bash(gh --version), Bash(gh auth status:*), Bash(gh repo list:*), Bash(gh repo view:*), Bash(gh repo create:*), Bash(gh auth setup-git:*), Bash(ls:*), Bash(pwd), Bash(uname:*)
---

Reply language (fr = French, en = English): !`git config --global --default fr --get github-sync.lang`
Folder: !`pwd`

You set up the GitHub sync of this folder. Write in the reply language above, in plain words for someone who is not technical. Never force anything (no `--force`), never overwrite or delete a file.

**Step 0 — Look around.** Run these checks yourself, one per call (a tool may be missing, so an error is an answer too): `uname -s`, `uname -m`, `git --version`, `git config --global user.name`, `git config --global user.email`, `gh --version`, `gh auth status`, `git remote get-url origin`, `ls -A`.

**Step 1 — Check the tools.** Go through this list in order and stop at the first missing item, explaining what it is for and how to get it. Read `uname -s`: `Darwin` is macOS, `Linux` is Linux, anything else (`MINGW…`, `MSYS…`, `Windows`) is Windows.
1. **git** (does the syncing). macOS: `xcode-select --install` (it opens a system window; nothing else needed). Windows: the official installer from https://git-scm.com/download/win, or `winget install --id Git.Git -e` if `winget` is there. Linux: the distribution's package manager, e.g. `sudo apt install git` or `sudo dnf install git`.
2. **GitHub CLI `gh`** (talks to GitHub: lists, creates repositories, logs in). Never ask the person to install Homebrew or another package manager just for this. If they already have one, offer it as a shortcut and run it only once they say yes: `brew install gh` (macOS, check with `brew --version`), `winget install --id GitHub.cli -e` (Windows). Otherwise guide them through the official download below. **Be a patient guide**: one step per message, say exactly what to click or paste and what they should see, ask them to tell you what appears, and adapt to their answer before giving the next step. Commands to paste go in their own code block. Say where to paste them: macOS, the Terminal app (Applications > Utilities > Terminal); Windows, PowerShell (Start menu, type "PowerShell"). Commands that start with `sudo` ask for the computer's password: tell them nothing shows while they type it, and to press Enter.
   - **macOS.** Read `uname -m`: `x86_64` is an Intel Mac, `arm64` is Apple Silicon (M1, M2…). On https://cli.github.com, "Download for Mac" gives either a `.pkg` installer or a `.zip`; the version to take is `amd64` / `x86_64` for Intel, `arm64` for Apple Silicon, or `universal` for both. Tell them which one matches their Mac.
     - `.pkg`: double-click it in Downloads and follow the screens (it may ask for the Mac's password). If macOS refuses because the developer is not verified: right-click the file, then Open.
     - `.zip` (no installer inside, only the program, which has to be copied by hand): double-click the zip in Downloads to unpack it, then check the folder is there with `ls ~/Downloads | grep gh_` (a folder like `gh_2.xx.x_macOS_amd64`). Then, one at a time: `sudo mkdir -p /usr/local/bin` and `sudo cp ~/Downloads/gh_*_macOS_<amd64|arm64>/bin/gh /usr/local/bin/gh` (put the right word for their Mac). If, later, macOS says the program cannot be opened because it comes from the internet: `sudo xattr -d com.apple.quarantine /usr/local/bin/gh`.
     - Then: close the Terminal and open it again, and run `gh --version`. A version number means it worked.
   - **Windows.** On https://cli.github.com, "Download for Windows" gives a `.msi`: double-click it and follow the screens. Then close PowerShell, open it again, and run `gh --version`.
   - **Linux.** Follow https://github.com/cli/cli#installation for their distribution (e.g. `sudo apt install gh` or `sudo dnf install gh`), then `gh --version`.
   - Once `gh --version` works for them, tell them a new Claude conversation in this folder may be needed for you to find `gh`, then go on with the next item.
3. **GitHub login.** If `gh auth status` says they are not logged in, they run it themselves in the same terminal: `gh auth login`. Never type a password or token yourself. Walk them through its questions, answered with the arrow keys ↑ ↓ and Enter:
   1. *Where do you use GitHub?* → `GitHub.com`.
   2. *What is your preferred protocol for Git operations?* → `HTTPS`.
   3. *Authenticate Git with your GitHub credentials?* → `Yes`.
   4. *How would you like to authenticate GitHub CLI?* → `Login with a web browser`.
   5. The terminal shows an 8-character code (like `ABCD-1234`) and "Press Enter to open github.com in your browser": copy the code, press Enter, paste it in the GitHub page that opens, and authorize. If no browser opens, go to https://github.com/login/device and type the code there.
   6. It is done when the terminal shows "Logged in as <login>". Ask them to tell you, then run `gh auth status` yourself to check.
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

**To finish**, one quoted line: "> Synchro configurée : <folder> ↔ <owner/repo>." / "> Sync set up: <folder> ↔ <owner/repo>.", then, if a project was fetched, add that sensitive files kept off GitHub on the other computer (`wp-config.php`, `.env`…) are not in it: if they were put in a zip there, unzip it at the root of this project. Then say that the Pull / Push buttons appear after this reply and the automatic pull runs from the next conversation opened in this folder.
