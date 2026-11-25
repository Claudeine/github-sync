import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Lang } from '../types'

// Settings live in the user's global git config (github-sync.*): git is the one
// tool every platform already has here, and the slash commands read them the same way.
const isLinked = atom({ plugin: 'github-sync', key: 'isLinked' } as const, false)
const isNotifOn = atom({ plugin: 'github-sync', key: 'isNotifOn' } as const, true)
const isAutoPullOn = atom({ plugin: 'github-sync', key: 'isAutoPullOn' } as const, true)
const isAutoPushOn = atom({ plugin: 'github-sync', key: 'isAutoPushOn' } as const, false)
const lang = atom({ plugin: 'github-sync', key: 'lang' } as const, 'fr' as Lang)
const pendingNote = atom({ plugin: 'github-sync', key: 'pendingNote' } as const, null as string | null)

const T = {
  fr: {
    setup: 'Configurer la synchro GitHub',
    failed: 'Attention : le pull automatique n\'a pas pu se faire (modifications locales non enregistrées, conflit ou pas de connexion). Cliquez sur ⬇ pour voir le détail.',
    cantRun: (c: string) => `/github-sync:${c} n'a pas pu être lancé`,
    // Toasts are cut after about 150 characters: these stay well under.
    shortFailed: 'Pull auto impossible. Cliquez sur ⬇ pour voir pourquoi.',
    shortPushFailed: 'Push auto impossible. Cliquez sur ⬆ pour voir pourquoi.',
    shortHeld: (f: string) => `Push auto suspendu : ${f} est sensible. Cliquez sur ⬆ pour choisir.`,
    shortHeldLarge: (f: string) => `Push auto suspendu : ${f} dépasse 50 Mo. Cliquez sur ⬆ pour choisir.`,
    upToDateShort: (v: string) => `Pull auto : déjà à jour (${v}).`,
    pulledShort: (a: string, b: string) => `Pull auto : modifications récupérées (${a} → ${b}).`,
    pushedShort: (n: number, v: string) => `Push auto : ${n} fichier(s) envoyé(s) (${v}).`,
    pushFailed: 'Attention : le push automatique n\'a pas pu se faire (GitHub contient des modifications plus récentes, conflit ou pas de connexion). Cliquez sur ⬆ pour voir le détail.',
    pushHeld: (f: string) => `Push automatique suspendu : ${f} ressemble à un fichier sensible, et le push automatique n'en envoie jamais. Rien n'a été envoyé ; cliquez sur ⬆ pour choisir (l'envoyer, l'exclure, ou le mettre dans le zip à transférer à la main).`,
    pushHeldLarge: (f: string) => `Push automatique suspendu : ${f} est très volumineux (plus de 50 Mo). Rien n'a été envoyé ; cliquez sur ⬆ pour choisir (l'exclure ou le mettre dans le zip).`,
    commitMsg: (n: number) => `Envoi automatique : ${n} fichier(s) modifié(s)`,
    helpTitle: 'Aide github-sync',
    help: `## La barre github-sync

| Bouton | Ce qu'il fait |
| --- | --- |
| **⬇** | Pull : récupère la dernière version du projet depuis GitHub. |
| **⬆** | Push : enregistre vos modifications (commit) et les envoie sur GitHub. Si un fichier sensible est concerné, y compris un fichier exclu par \`.gitignore\` qui manquerait sur l'autre ordinateur, Claude explique le risque et demande votre accord ; sur un dépôt public, l'envoi est refusé et Claude propose un zip à transférer à la main, refait automatiquement quand ces fichiers changent. |
| **⬇ Auto ✓ / ×** | Pull automatique, activé par défaut : la dernière version est récupérée à chaque ouverture ou reprise d'une conversation. |
| **⬆ Auto ✓ / ×** | Push automatique, désactivé par défaut : après chaque réponse de Claude qui modifie le dossier, les modifications sont enregistrées et envoyées sur GitHub. Il n'envoie jamais de fichier sensible ou volumineux (voir plus bas). |
| **Notifications ✓ / ×** | Annonce les pull et push réussis. Coupées, seuls les échecs sont signalés. |
| **ⓘ** | Affiche cette aide. |
| **⚠︎** | Liste les fichiers sensibles et volumineux du projet, et ce qui a été décidé pour chacun. |
| **FR / EN** | Passe la barre et les réponses des commandes en français ou en anglais. |

Les réglages valent pour tout l'ordinateur, dans tous les projets.

## Les fichiers sensibles

Clés, mots de passe, \`.env\`, \`wp-config.php\`, certificats… Ils ne partent jamais sans vous.

- **Push automatique (⬆ Auto) :** il n'envoie jamais de fichier sensible, même un fichier que vous avez déjà autorisé. Dès qu'un fichier sensible a changé, il ne fait aucun envoi et vous prévient : passez par ⬆.
- **Push manuel (⬆) :** Claude vous montre les fichiers sensibles concernés, y compris ceux exclus par \`.gitignore\` (ils manqueraient sur l'autre ordinateur), explique le risque et vous propose :
  - **les envoyer** : seulement sur un dépôt privé, après votre accord ;
  - **les garder hors de GitHub** : ils ne vous sont plus redemandés ;
  - **les mettre dans un zip**, rangé à côté du dossier du projet, avec leurs dossiers, à transférer à la main (clé USB, AirDrop) et à décompresser à la racine du projet sur l'autre ordinateur. Le zip est refait à chaque ⬆ quand ces fichiers changent.
- **Dépôt public :** l'envoi est toujours refusé ; seuls les deux derniers choix sont possibles.
- **Déclarer vos propres fichiers sensibles :** écrivez-le simplement à Claude dans la zone de message, par exemple « Déclare le fichier config/api.json comme sensible ». Le chemin part du dossier du projet ; pour un dossier entier, terminez par \`/\` (« sauvegardes/ ») ; pour tous les fichiers d'un type, utilisez \`*\` (« *.sqlite »). La liste est gardée dans le fichier \`.github-sync-sensitive\` du projet (des noms seulement, jamais leur contenu) et suit le projet sur tous vos ordinateurs.
- **Voir la liste :** ⚠︎ affiche tous les fichiers sensibles et volumineux du projet, et ce qui a été décidé pour chacun (envoyé, gardé hors de GitHub, dans le zip, pas encore décidé).
- **Changer d'avis :** écrivez-le de la même façon, par exemple « Ne déclare plus config/api.json comme sensible », « Mets .env dans le zip », « Garde .env hors de GitHub » ou « Refais le zip maintenant ».

## Les fichiers volumineux

Au-delà de 50 Mo, GitHub prévient ; au-delà de 100 Mo, il refuse. Le push automatique n'en envoie jamais. Avec ⬆, Claude vous propose de les garder hors de GitHub ou de les mettre dans le même zip que les fichiers sensibles (de 50 à 100 Mo, vous pouvez aussi les envoyer quand même).

## Commandes

- \`/github-sync:sensitive\` : la même chose que ⚠︎.
- \`/github-sync:setup\` : vérifie les outils et relie le dossier à GitHub.
- \`/github-sync:pull\` et \`/github-sync:push [message]\` : les mêmes actions que ⬇ et ⬆.

## Mettre à jour ou désinstaller le mod

Le plus simple, dans une conversation Claude, demandez :

- « Mets à jour le plug-in github-sync »
- « Désinstalle le plug-in github-sync »

Ou dans un terminal : \`claude plugin update github-sync\` (puis rouvrez Claude) ou \`claude plugin uninstall github-sync\`. Pour effacer aussi les réglages : \`git config --global --remove-section github-sync\`.

Documentation complète : https://github.com/Claudeine/github-sync`,
  },
  en: {
    setup: 'Set up GitHub sync',
    failed: 'Warning: the automatic pull failed (unsaved local changes, a conflict or no connection). Press ⬇ to see the details.',
    cantRun: (c: string) => `/github-sync:${c} could not be started`,
    shortFailed: 'Automatic pull failed. Press ⬇ to see why.',
    shortPushFailed: 'Automatic push failed. Press ⬆ to see why.',
    shortHeld: (f: string) => `Automatic push held: ${f} is sensitive. Press ⬆ to choose.`,
    shortHeldLarge: (f: string) => `Automatic push held: ${f} is over 50 MB. Press ⬆ to choose.`,
    upToDateShort: (v: string) => `Automatic pull: already up to date (${v}).`,
    pulledShort: (a: string, b: string) => `Automatic pull: changes received (${a} → ${b}).`,
    pushedShort: (n: number, v: string) => `Automatic push: ${n} file(s) sent (${v}).`,
    pushFailed: 'Warning: the automatic push failed (GitHub holds newer changes, a conflict or no connection). Press ⬆ to see the details.',
    pushHeld: (f: string) => `Automatic push held: ${f} looks like a sensitive file, and the automatic push never sends one. Nothing was sent; press ⬆ to choose (send it, leave it out, or put it in a zip to carry by hand).`,
    pushHeldLarge: (f: string) => `Automatic push held: ${f} is very large (over 50 MB). Nothing was sent; press ⬆ to choose (leave it out or put it in the zip).`,
    commitMsg: (n: number) => `Automatic send: ${n} file(s) changed`,
    helpTitle: 'github-sync help',
    help: `## The github-sync bar

| Button | What it does |
| --- | --- |
| **⬇** | Pull: fetches the latest version of the project from GitHub. |
| **⬆** | Push: saves your changes (a commit) and sends them to GitHub. If a sensitive file is involved, including one kept out by \`.gitignore\` that would be missing on the other computer, Claude explains the risk and asks you; on a public repository the send is refused and Claude offers a zip to carry by hand, made again whenever those files change. |
| **⬇ Auto ✓ / ×** | Automatic pull, on by default: the latest version is fetched each time a conversation opens or resumes. |
| **⬆ Auto ✓ / ×** | Automatic push, off by default: after each Claude reply that changes the folder, the changes are saved and sent to GitHub. It never sends a sensitive or large file (see below). |
| **Notifications ✓ / ×** | Announces successful pulls and pushes. Off: only failures are shown. |
| **ⓘ** | Shows this help. |
| **⚠︎** | Lists the project's sensitive and large files, and what was decided for each. |
| **FR / EN** | Switches the bar and the commands' replies between French and English. |

The switches apply to the whole computer, in every project.

## Sensitive files

Keys, passwords, \`.env\`, \`wp-config.php\`, certificates… They never leave without you.

- **Automatic push (⬆ Auto):** it never sends a sensitive file, not even one you already allowed. As soon as a sensitive file has changed, it sends nothing and tells you: use ⬆.
- **Manual push (⬆):** Claude shows you the sensitive files involved, including those kept out by \`.gitignore\` (they would be missing on the other computer), explains the risk and offers:
  - **send them**: only to a private repository, after your agreement;
  - **keep them off GitHub**: you are not asked about them again;
  - **put them in a zip**, next to the project folder, with their folders, to carry by hand (USB key, AirDrop) and unzip at the root of the project on the other computer. The zip is made again on each ⬆ when those files change.
- **Public repository:** sending is always refused; only the last two choices are possible.
- **Declare your own sensitive files:** just write it to Claude in the message box, for example "Declare config/api.json as sensitive". The path starts from the project folder; for a whole folder end it with \`/\` ("backups/"); for every file of a kind use \`*\` ("*.sqlite"). The list is kept in the project's \`.github-sync-sensitive\` file (names only, never contents) and goes with the project to all your computers.
- **See the list:** ⚠︎ shows every sensitive and large file of the project, and what was decided for each (sent, kept off GitHub, in the zip, not decided yet).
- **Change your mind:** write it the same way, for example "Stop declaring config/api.json as sensitive", "Put .env in the zip", "Keep .env off GitHub" or "Make the zip now".

## Large files

Over 50 MB GitHub warns; over 100 MB it refuses. The automatic push never sends one. With ⬆, Claude offers to keep them off GitHub or to put them in the same zip as the sensitive files (from 50 to 100 MB you may also send them anyway).

## Commands

- \`/github-sync:sensitive\`: the same as ⚠︎.
- \`/github-sync:setup\`: checks the tools and links the folder to GitHub.
- \`/github-sync:pull\` and \`/github-sync:push [message]\`: the same as ⬇ and ⬆.

## Update or uninstall the mod

The simplest way, in a Claude conversation, ask:

- "Update the github-sync plugin"
- "Uninstall the github-sync plugin"

Or in a terminal: \`claude plugin update github-sync\` (then reopen Claude) or \`claude plugin uninstall github-sync\`. To also remove its settings: \`git config --global --remove-section github-sync\`.

Full documentation: https://github.com/Claudeine/github-sync`,
  },
}

// A 1px line as wide as the bar, in ponytail's divider colors for light and dark themes.
const RULE = '<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="1" viewBox="0 0 4000 1" preserveAspectRatio="none"><style>.d{stroke:#1f1e1d;stroke-opacity:.12}@media (prefers-color-scheme:dark){.d{stroke:#fff;stroke-opacity:.14}}</style><line class="d" x1="0" y1="0.5" x2="4000" y2="0.5"/></svg>'

async function git($: EngineInterface, args: string[], timeoutMs = 10000) {
  return $.process.run(['git', ...args], { cwd: await $.session.root(), timeoutMs })
}

async function getSetting($: EngineInterface, key: string) {
  const r = await git($, ['config', '--global', '--get', `github-sync.${key}`])
  return r.exitCode === 0 ? r.stdout.trim() : ''
}

async function setSetting($: EngineInterface, key: string, value: string) {
  await git($, ['config', '--global', `github-sync.${key}`, value])
}

async function refresh($: EngineInterface) {
  const remote = await git($, ['remote', 'get-url', 'origin'])
  await update($, isLinked, () => remote.exitCode === 0)
  const notif = await getSetting($, 'notifications')
  await update($, isNotifOn, () => notif !== 'off')
  const autoPull = await getSetting($, 'autopull')
  await update($, isAutoPullOn, () => autoPull !== 'off')
  const autoPush = await getSetting($, 'autopush')
  await update($, isAutoPushOn, () => autoPush === 'on')
  const l = await getSetting($, 'lang')
  await update($, lang, () => (l === 'en' ? 'en' : 'fr'))
}

async function autoPull($: EngineInterface) {
  if (!(await read($, isLinked)) || !(await read($, isAutoPullOn))) return
  const t = T[await read($, lang)]
  const before = (await git($, ['rev-parse', '--short', 'HEAD'])).stdout.trim()
  const pull = await git($, ['pull', '--ff-only', '--quiet'], 30000)
  if (pull.exitCode !== 0) {
    // Failures are always shown, and Claude is told on the next prompt.
    $.ui.toast(t.shortFailed)
    await update($, pendingNote, () => t.failed)
    return
  }
  if (!(await read($, isNotifOn))) return
  const after = (await git($, ['rev-parse', '--short', 'HEAD'])).stdout.trim()
  $.ui.toast(before === after ? t.upToDateShort(after) : t.pulledShort(before, after))
}

// Names that look like secrets: an automatic push never sends them, a person decides.
const SENSITIVE = /(^|\/)(\.env(\..*)?|wp-config\.php|id_rsa|id_ed25519|credentials(\.json)?|secrets?(\..*)?|.*\.(pem|key|p12|pfx|keystore))$/i
const HELP = 'github-sync-help'
// Files the person declared sensitive, one path or pattern per line, in a file
// sent with the project so every computer knows them (it holds names only).
const DECLARED = '.github-sync-sensitive'
// GitHub warns from 50 MB and refuses from 100 MB.
const LARGE = 50 * 1024 * 1024
let isPushing = false
// The last hold the person was told about: the same one is not repeated on
// every answer, only when it changes.
let lastHold: string | null = null

async function hold($: EngineInterface, toast: string, note: string) {
  if (note === lastHold) return
  lastHold = note
  $.ui.toast(toast)
  await update($, pendingNote, () => note)
}

async function declaredPatterns($: EngineInterface, root: string) {
  const text = await $.fs.read(`${root}/${DECLARED}`).catch(() => '')
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'))
    .map(line => {
      // `dir/` is the whole folder, `*` any run of characters.
      const body = line.replace(/^\.?\//, '').replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
      return new RegExp(line.endsWith('/') ? `^${body}` : `^${body}$`)
    })
}

async function autoPush($: EngineInterface) {
  if (isPushing || !(await read($, isLinked)) || !(await read($, isAutoPushOn))) return
  isPushing = true
  try {
    const t = T[await read($, lang)]
    const status = await git($, ['status', '--porcelain', '-uall'])
    const changed = status.stdout
      .split('\n')
      .filter(Boolean)
      .map(line => ({ path: line.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, '') }))
    // Files the person already decided about at ⬆ (kept off GitHub, or carried
    // in the zip) are left where they are; the rest goes.
    const decided = new Set(
      (await git($, ['config', '--local', '--get-all', 'github-sync.keepout'])).stdout
        .concat('\n', (await git($, ['config', '--local', '--get-all', 'github-sync.zip'])).stdout)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean),
    )
    const files = changed.filter(f => !decided.has(f.path))
    if (status.exitCode !== 0 || files.length === 0) {
      lastHold = null
      return
    }
    // The automatic push never sends a sensitive or very large file, even one
    // already accepted: it holds the whole push until ⬆, where Claude asks.
    const root = await $.session.root()
    const declared = await declaredPatterns($, root)
    const risky = files.find(f => SENSITIVE.test(f.path) || declared.some(re => re.test(f.path)))?.path
    if (risky) return hold($, t.shortHeld(risky), t.pushHeld(risky))
    for (const f of files) {
      const size = (await $.fs.stat(`${root}/${f.path}`).catch(() => null))?.size ?? 0
      if (size < LARGE) continue
      return hold($, t.shortHeldLarge(f.path), t.pushHeldLarge(f.path))
    }
    const ok =
      // Only decided files git can see are excluded: naming one .gitignore keeps
      // out makes `git add` fail.
      (await git($, ['add', '-A', '--', '.', ...changed.filter(f => decided.has(f.path)).map(f => `:(exclude,literal)${f.path}`)])).exitCode === 0 &&
      (await git($, ['commit', '--quiet', '-m', t.commitMsg(files.length)])).exitCode === 0 &&
      (await git($, ['push', '--quiet'], 30000)).exitCode === 0
    if (!ok) return hold($, t.shortPushFailed, t.pushFailed)
    lastHold = null
    if (!(await read($, isNotifOn))) return
    const v = (await git($, ['rev-parse', '--short', 'HEAD'])).stdout.trim()
    $.ui.toast(t.pushedShort(files.length, v))
  } finally {
    isPushing = false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($).catch(() => {})
    await autoPull($).catch(() => {})
    return next(e)
  })

  // After each answer: refresh the bar, then the automatic push if it is on.
  // Runs after next(e), so the reply is never held up by the network.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($).catch(() => {})
    if (!e.isAborted) void autoPush($).catch(() => {})
    return result
  })

  on('ui.render', { component: 'Pane', requestId: HELP }, async ($, e) => {
    const { Markdown } = $.ui.resolve(e)
    return <Markdown text={T[await read($, lang)].help} />
  })

  on('prompt.submit', async ($, e, next) => {
    const note = await read($, pendingNote)
    if (note === null) return next(e)
    await update($, pendingNote, () => null)
    return next({ ...e, context: [...(e.context ?? []), `github-sync: ${note}`] })
  })

  // Our row goes first in the band, above any other mod's (ponytail's, say).
  on('ui.render', { component: 'AbovePromptList' }, ($, e, next) => {
    const mine = e.props.rows.filter(r => r.plugin === 'github-sync')
    if (mine.length === 0) return next(e)
    const others = e.props.rows.filter(r => r.plugin !== 'github-sync')
    return next({ ...e, props: { ...e.props, rows: [...mine, ...others] } })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const l = await read($, lang)
    const t = T[l]

    const run = (command: string) => () => {
      $.command.run({ command: `github-sync:${command}` }).catch(() => $.ui.toast(t.cantRun(command)))
    }
    const flip = (key: string, value: boolean) => () => {
      setSetting($, key, value ? 'on' : 'off').then(() => refresh($)).catch(() => {})
    }
    // Pull and Push keep a button background; the switches are drawn plain, as
    // ponytail's band does, and read the same in both languages.
    // The desktop draws the label, so it holds the arrow.
    const action = (key: string, label: string, onPress: () => void) => (
      <Button key={key} variant="secondary" label={label} onPress={onPress} />
    )
    // paddingX matches the invisible padding of the plain buttons, so the group
    // sits as far from its neighbour as the plain buttons sit from each other.
    const group = (key: string, ...buttons: unknown[]) => (
      <Box key={key} flexDirection="row" alignItems="center" gap={1} paddingX={1}>
        {buttons}
      </Box>
    )
    const plain = (key: string, label: string, onPress: () => void) => (
      <Button key={key} plain label={label} onPress={onPress} />
    )
    const toggle = (key: string, label: string, isOn: boolean) =>
      plain(key, `${label} ${isOn ? '✓' : '×'}`, flip(key, !isOn))
    const langSwitch = plain('lang', l.toUpperCase(), () => {
      setSetting($, 'lang', l === 'fr' ? 'en' : 'fr').then(() => refresh($)).catch(() => {})
    })

    // ⓘ toggles the help pane: a second press closes it. Opening an id that is
    // already open only retitles it, so a pane left open would otherwise look
    // like a press that does nothing.
    const helpButton = plain('help', 'ⓘ', () => {
      const fail = (why: string) => $.ui.toast(`github-sync: ${t.helpTitle} — ${why}`)
      $.ui
        .panes()
        .then(async panes => {
          if (panes.some(p => p.id === HELP)) return $.ui.close({ id: HELP })
          const r = await $.ui.open({ id: HELP, title: t.helpTitle })
          if (!r.isPlaced) fail(r.reason)
        })
        .catch(err => fail(String(err)))
    })

    // A thin rule under the row separates this bar from another mod's band (ponytail's, say).
    const { Svg } = $.ui.resolve(e)
    const withRule = (row: unknown) => (
      <Box flexDirection="column" gap={1}>
        {row}
        {e.surface === 'desktop' && <Svg source={RULE} alt="separator" height={1} />}
      </Box>
    )

    if (!(await read($, isLinked))) {
      return withRule(
        <Box flexDirection="row" alignItems="center" gap={1}>
          {group('setup-group', action('setup', t.setup, run('setup')))}
          <Box flexGrow={1} />
          {helpButton}
          {langSwitch}
        </Box>,
      )
    }

    return withRule(
      <Box flexDirection="row" alignItems="center" gap={1}>
        {group('sync', action('pull', '⬇', run('pull')), action('push', '⬆', run('push')))}
        {toggle('autopull', '⬇ Auto', await read($, isAutoPullOn))}
        {toggle('autopush', '⬆ Auto', await read($, isAutoPushOn))}
        {plain('sensitive', '⚠︎', run('sensitive'))}
        <Box flexGrow={1} />
        {toggle('notifications', 'Notifications', await read($, isNotifOn))}
        {helpButton}
        {langSwitch}
      </Box>,
    )
  })
}
