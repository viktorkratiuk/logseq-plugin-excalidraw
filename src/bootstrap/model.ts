import getI18N from '@/locales'
import type { RenderAppProps } from '@/main'

const bootModels = (renderApp: (props: RenderAppProps) => void) => {
  const { common: i18nCommon } = getI18N()
  logseq.provideModel({
    edit(e) {
      const pageName = e.dataset.pageName
      const containerId = e.dataset.containerId
      if (!pageName) return logseq.UI.showMsg(i18nCommon.pageNotFound)
      renderApp({ mode: 'edit', pageName, renderSlotId: containerId })
      logseq.showMainUI()
    },
    fullscreen(e) {
      const pageName = e.dataset.pageName
      if (!pageName) return logseq.UI.showMsg(i18nCommon.pageNotFound)
      renderApp({ mode: 'preview', pageName })
      logseq.showMainUI()
    },

    async delete(e) {
      const pageName = e.dataset.pageName
      if (!pageName) return logseq.UI.showMsg(i18nCommon.pageNotFound)
      await logseq.Editor.deletePage(pageName)
      logseq.UI.showMsg('Delete excalidraw file success', 'success')
      const uuid = e.dataset.blockId
      logseq.Editor.removeBlock(uuid)
    },
    async navPage(e) {
      const pageName = e.dataset.pageName
      if (!pageName) return logseq.UI.showMsg(i18nCommon.pageNotFound)
      logseq.App.pushState('page', { name: pageName })
    },
    showDashboard() {
      renderApp({ mode: 'dashboard' })
      logseq.showMainUI()
    },

    openDrawLink(e) {
      const pageName = e.dataset.pageName
      if (!pageName) return logseq.UI.showMsg(i18nCommon.pageNotFound)
      renderApp({ mode: 'preview', pageName })
      logseq.showMainUI()
    },
  })
}

export default bootModels
