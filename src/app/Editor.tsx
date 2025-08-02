import { useAtom } from 'jotai'
import { useEffect } from 'react'

import { insertSVG } from '@/bootstrap/renderBlockImage'
import type { Theme } from '@/components/Editor'
import Editor from '@/components/Editor'
import { Toaster } from '@/components/ui/toaster'
import { getExcalidrawInfoFromPage, getTags, setTheme, updateExcalidrawSvgTitle } from '@/lib/utils'
import { tagsAtom } from '@/model/tags'

interface EditorAppProps {
  pageName: string
  renderSlotId?: string
}

const EditorApp: React.FC<EditorAppProps> = ({ pageName, renderSlotId }) => {
  const [, setTags] = useAtom(tagsAtom)
  const onClose = async () => {
    // refresh render block image
    if (pageName && renderSlotId) {
      const { excalidrawData, rawBlocks } = await getExcalidrawInfoFromPage(pageName)
      insertSVG(renderSlotId, undefined, excalidrawData)

      // Update the SVG title with the alias if it exists
      const page = await logseq.Editor.getPage(pageName)
      await updateExcalidrawSvgTitle(renderSlotId, rawBlocks, page?.originalName || pageName)
    }
    logseq.hideMainUI()
  }
  useEffect(() => {
    getTags().then(setTags)
  }, [setTags])
  // initialize theme
  useEffect(() => {
    logseq.App.getStateFromStore<Theme>('ui/theme').then(setTheme)
  }, [])
  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center overflow-auto">
        <div className="fixed left-0 top-0 h-screen w-screen" onClick={() => logseq.hideMainUI()}></div>
        <Editor pageName={pageName} onClose={onClose} />
      </div>
      <Toaster />
    </>
  )
}

export default EditorApp
