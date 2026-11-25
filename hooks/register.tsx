import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Lang } from '../types'

// Settings live in the user's global git config (github-sync.*): git is the one
// tool every platform already has here, and the slash commands read them the same way.
const isLinked = atom({ plugin: 'github-sync', key: 'isLinked' } as const, false)
const isNotifOn = atom({ plugin: 'github-sync', key: 'isNotifOn' } as const, true)
const isAutoPullOn = atom({ plugin: 'github-sync', key: 'isAutoPullOn' } as const, true)
const lang = atom({ plugin: 'github-sync', key: 'lang' } as const, 'fr' as Lang)
const pendingNote = atom({ plugin: 'github-sync', key: 'pendingNote' } as const, null as string | null)

const T = {
  fr: {
    setup: 'Configurer la synchro GitHub',
    upToDate: (v: string) => `Pull automatique réussi : déjà à jour (version ${v}).`,
    pulled: (a: string, b: string) => `Pull automatique réussi : nouvelles modifications récupérées (version ${a} vers ${b}).`,
    failed: 'Attention : le pull automatique n\'a pas pu se faire (modifications locales non enregistrées, conflit ou pas de connexion). Cliquez sur ⬇ pour voir le détail.',
    cantRun: (c: string) => `/github-sync:${c} n'a pas pu être lancé`,
  },
  en: {
    setup: 'Set up GitHub sync',
    upToDate: (v: string) => `Automatic pull succeeded: already up to date (version ${v}).`,
    pulled: (a: string, b: string) => `Automatic pull succeeded: new changes received (version ${a} to ${b}).`,
    failed: 'Warning: the automatic pull failed (unsaved local changes, a conflict or no connection). Press ⬇ to see the details.',
    cantRun: (c: string) => `/github-sync:${c} could not be started`,
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
    $.ui.toast(t.failed)
    await update($, pendingNote, () => t.failed)
    return
  }
  if (!(await read($, isNotifOn))) return
  const after = (await git($, ['rev-parse', '--short', 'HEAD'])).stdout.trim()
  $.ui.toast(before === after ? t.upToDate(after) : t.pulled(before, after))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($).catch(() => {})
    await autoPull($).catch(() => {})
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($).catch(() => {})
    return next(e)
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
          {langSwitch}
        </Box>,
      )
    }

    return withRule(
      <Box flexDirection="row" alignItems="center" gap={1}>
        {group('sync', action('pull', '⬇', run('pull')), action('push', '⬆', run('push')))}
        {toggle('autopull', 'Auto', await read($, isAutoPullOn))}
        <Box flexGrow={1} />
        {toggle('notifications', 'Notifications', await read($, isNotifOn))}
        {langSwitch}
      </Box>,
    )
  })
}
