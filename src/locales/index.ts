import type { Language } from '@excalidraw/excalidraw/types/i18n'

import { getLangCode } from '@/lib/utils'
import type { PluginSettings } from '@/type'

import de from './de'
import en from './en'
import uk from './uk'
import zhCN from './zh-CN'

export const DEFAULT_LANGUAGE: Language = { code: 'en', label: 'English' }

/**
 * languages
 * The value here must be one of the excalidraw languages
 * https://github.com/excalidraw/excalidraw/blob/master/src/i18n.ts#L14
 */
export const LANGUAGES = [DEFAULT_LANGUAGE].concat([
  { code: 'zh-CN', label: '简体中文' },
  { code: 'uk-UA', label: 'Українська' },
  { code: 'de-DE', label: 'Deutsch' },
])

const i18nData = {
  en,
  'zh-CN': zhCN,
  'uk-UA': uk,
  'de-DE': de,
}

export type I18N = typeof en

const getI18N = () => {
  const i18n: I18N = i18nData[getLangCode((logseq.settings as unknown as PluginSettings).langCode)]
  return i18n
}

export default getI18N
