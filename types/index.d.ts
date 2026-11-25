export type Lang = 'fr' | 'en'

declare module 'claude-code' {
  interface PluginState {
    'github-sync': {
      isLinked: boolean
      isNotifOn: boolean
      isAutoPullOn: boolean
      lang: Lang
      pendingNote: string | null
    }
  }
}
