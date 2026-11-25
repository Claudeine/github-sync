<h1 align="center">github-sync</h1>

<p align="center">
  <em>One project, several computers, always in sync through GitHub.</em>
</p>

<p align="center">
  <sub>English &middot; <a href="README.fr.md">Français</a></sub>
</p>

---

You work on the same project on a laptop and a desktop. You forget to send your changes before leaving one, you forget to fetch them on the other, and Claude starts from an old version.

**github-sync** is a mod for [Claude Code](https://code.claude.com) that keeps a project in sync between your computers through GitHub: it fetches the latest version when you open a conversation, sends your work in one click, and sets everything up for you, on a new project or on a second machine.

## What it does

- **Sets up a project in one command.** `/github-sync:setup` checks that the tools are there, then either publishes the current folder to GitHub or fetches a project that already exists there (your second machine).
- **Fetches automatically.** Each time a conversation opens or resumes in a linked project, the latest version is pulled from GitHub before Claude reads your message.
- **Sends in one click.** **⬆** saves your changes (a commit with a clear message) and sends them to GitHub, after checking that no secret (keys, passwords, `.env` files, tokens) or very large file goes with them.
- **Never forces anything.** If GitHub holds newer changes, or a conflict appears, nothing is overwritten: you are told what blocks it and how to fix it.
- **Tells you what happened.** A short notification after each pull and push: time, version, number of files. Failures are always shown, even with notifications off.
- **Speaks French or English.** The buttons, the notifications and Claude's replies in the commands follow the language you pick.

## The bar

Above the prompt, in every project linked to GitHub:

```
⬇ ⬆   Auto ✓                         Notifications ✓   EN
```

| Button | What it does |
| --- | --- |
| **⬇** | Pull: fetches the latest version from GitHub (`/github-sync:pull`). |
| **⬆** | Push: saves and sends your changes to GitHub (`/github-sync:push`). |
| **Notifications ✓ / ×** | On / off. Off: successes are no longer announced, failures still are. |
| **Auto ✓ / ×** | Automatic pull on / off. Off: nothing is fetched when a conversation opens; ⬇ still works. |
| **FR / EN** | Shows the current language; press to switch between French and English. |

In a folder that is not linked to GitHub, the bar shows a single button instead: **Set up GitHub sync**.

The switches apply to the whole computer, for every project.

## Install

The simplest way: in a Claude conversation (desktop app or terminal), ask

```
Install https://github.com/Claudeine/github-sync
```

Or at the prompt of a Claude Code session started in a terminal:

```
/plugin install github-sync --marketplace Claudeine/github-sync
```

Answer `y` to add the marketplace, then pick the user scope. Or, straight from a shell:

```bash
claude plugin install github-sync --marketplace Claudeine/github-sync
```

Once installed for your user, the mod also runs in the Claude desktop app, in every conversation. Install it once on each computer.

## First use

Open a conversation in the project folder and press **Set up GitHub sync** (or type `/github-sync:setup`).

**1. The tools are checked first**, in this order, stopping at the first one missing:

| Tool | Why | If it is missing |
| --- | --- | --- |
| git | does the syncing | Claude gives you the official installer or command for your system |
| GitHub CLI (`gh`) | talks to GitHub: lists and creates repositories, logs in | Claude points you to the official installer ([cli.github.com](https://cli.github.com)); no Homebrew needed |
| GitHub login | gives access to your repositories | you run `gh auth login` yourself; Claude never types a password |
| git uses that login | lets git pull and push with it | Claude runs `gh auth setup-git` |
| your name and email | written on each commit | Claude asks you and sets them |

Commands that need administrator rights (`sudo`) or open a system window are given to you to run. GitHub Desktop is not needed.

**2. Then you choose:**

- **Publish this folder on GitHub**: a new repository (private by default) or an existing empty one. A basic `.gitignore` is added if there is none, and the files are checked for secrets before the first send.
- **Get a project that already exists on GitHub**: Claude lists your repositories, you pick one, it is cloned. If the folder already holds files, the project goes into a subfolder instead of being mixed with them.

**On your second computer:** install the mod, open a conversation in an empty folder, press **Set up GitHub sync**, choose *Get a project that already exists on GitHub*, pick it. Done: both computers now stay in sync.

## Commands

| Command | What it does |
| --- | --- |
| `/github-sync:setup` | Checks the tools and links the folder to GitHub. |
| `/github-sync:pull` | Fetches the latest changes. |
| `/github-sync:push [message]` | Saves and sends the changes; the message is optional. |

## How it works

- **The automatic pull** runs inside the mod when a conversation opens or resumes, only in a folder whose git repository has a GitHub remote (`origin`). It uses `git pull --ff-only`: it only moves forward, and stops without touching anything if your local work and GitHub's have diverged.
- **Pull and push are Claude commands**, so Claude can explain a refusal in plain words, write the commit message and check for secrets before sending.
- **Settings are stored in your global git configuration** (`github-sync.notifications`, `github-sync.autopull`, `github-sync.lang`), so they survive restarts and work the same on every system.
- **Nothing runs outside git and GitHub CLI**: no script, no server, no network call of its own.

## Good habits

- Press **⬆** before leaving a computer, and let the automatic pull do the rest on the other.
- Avoid working on both computers at the same time without syncing: that is how conflicts happen.
- A conversation that stays open does not pull again: press **⬇** when you come back to it.
- Conversations themselves are not synced (they stay on each computer). Write what must last (decisions, progress) in the project's files, for example `CLAUDE.md`.

## Compatibility

- Claude Code in a terminal and in the Claude desktop app.
- macOS, Windows and Linux: the mod only relies on git and GitHub CLI. Tested on macOS so far.
- Works on its own: it does not need any other mod.

## Uninstall

```
/plugin uninstall github-sync
```

To also remove its settings:

```bash
git config --global --remove-section github-sync
```

Your projects and their GitHub repositories are left untouched.

## License

MIT
