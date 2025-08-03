import { Excalidraw, Button, MainMenu, WelcomeScreen, getSceneVersion, Footer } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import type { LibraryItems } from '@excalidraw/excalidraw/types/types'
import type { BlockIdentity } from '@logseq/libs/dist/LSPlugin'
import { debounce } from 'lodash-es'
import React, { useEffect, useRef, useState } from 'react'
import { BiSlideshow } from 'react-icons/bi'
import { BsLayoutSidebarInset } from 'react-icons/bs'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { IoAppsOutline } from 'react-icons/io5'
import { TbLogout, TbBrandGithub, TbArrowsMinimize } from 'react-icons/tb'

import { getExcalidrawLibraryItems, updateExcalidrawLibraryItems } from '@/bootstrap/excalidrawLibraryItems'
import { insertSVG } from '@/bootstrap/renderBlockImage'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import useSlides from '@/hook/useSlides'
import { GITHUB_URL } from '@/lib/constants'
import {
  cn,
  genBlockData,
  getExcalidrawInfoFromPage,
  getLangCode,
  getMinimalAppState,
  updateExcalidrawSvgTitle,
} from '@/lib/utils'
import getI18N from '@/locales'
import type { ExcalidrawData, PluginSettings } from '@/type'

import { PageSearchOverlay } from './PageSearchOverlay'
import SlidesOverview from './SlidesOverview'
import SlidesPreview from './SlidesPreview'
import TagSelector from './TagSelector'

export type Theme = 'light' | 'dark'
export enum EditorTypeEnum {
  App = 'app',
  Page = 'page',
}
const WAIT = 1000
const updatePageProperty = debounce((block: BlockIdentity, key: string, value: string) => {
  logseq.Editor.upsertBlockProperty(block, key, value)
}, WAIT)

const Editor: React.FC<
  React.PropsWithChildren<{
    pageName: string
    onClose?: () => void
    type?: EditorTypeEnum
    renderSlotId?: string
  }>
> = ({ pageName, onClose, type = EditorTypeEnum.App, renderSlotId }) => {
  const [excalidrawData, setExcalidrawData] = useState<ExcalidrawData>()
  const [libraryItems, setLibraryItems] = useState<LibraryItems>()
  const [theme, setTheme] = useState<Theme>()
  const blockUUIDRef = useRef<string>()
  const pagePropertyBlockUUIDRef = useRef<string>()
  const currentExcalidrawDataRef = useRef<ExcalidrawData>()
  // const [currentExcalidrawData, setCurrentExcalidrawData] = useState<ExcalidrawData>()
  const sceneVersionRef = useRef<number>()
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const { frames, isFirst, isLast, activeFrameIndex, updateFrames, prev, next } = useSlides(excalidrawAPI)
  const [slidesModeEnabled, setSlidesModeEnabled] = useState(false)
  const [showSlidesPreview, setShowSlidesPreview] = useState(true)
  const [showSlidesOverview, setShowSlidesOverview] = useState(false)
  const [showPageSearchOverlay, setShowPageSearchOverlay] = useState(false)

  const [aliasName, setAliasName] = useState<string>()
  const [tag, setTag] = useState<string>()

  const { toast } = useToast()
  const { editor: i18nEditor } = getI18N()

  // save excalidraw data to currentExcalidrawDataRef
  const onExcalidrawChange = debounce(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      // const blockData = genBlockData({
      //   ...excalidrawData,
      //   elements: excalidrawElements,
      //   appState: getMinimalAppState(appState),
      //   files,
      // });
      // if (blockUUIDRef.current)
      //   logseq.Editor.updateBlock(blockUUIDRef.current, blockData);
      currentExcalidrawDataRef.current = {
        elements,
        appState,
        files,
      }
      const sceneVersion = getSceneVersion(elements)
      // fix https://github.com/excalidraw/excalidraw/issues/3014
      if (sceneVersionRef.current !== sceneVersion) {
        sceneVersionRef.current = sceneVersion
        // setCurrentExcalidrawData({
        //   elements,
        //   appState,
        //   files,
        // })
        updateFrames({ elements, files, theme })
      }
    },
    WAIT,
  )
  // save library items to page
  const onLibraryChange = (items: LibraryItems) => {
    updateExcalidrawLibraryItems(items)
  }
  // save excalidraw data to page
  const onClickClose = (type?: EditorTypeEnum) => {
    const { id, dismiss } = toast({
      variant: 'destructive',
      title: i18nEditor.saveToast.title,
      description: i18nEditor.saveToast.description,
      duration: 0,
    })
    setTimeout(async () => {
      if (currentExcalidrawDataRef.current && blockUUIDRef.current) {
        console.log('[faiz:] === start save')
        const { elements, appState, files } = currentExcalidrawDataRef.current
        const blockData = genBlockData({
          ...excalidrawData,
          elements,
          appState: getMinimalAppState(appState!),
          files,
        })
        await logseq.Editor.updateBlock(blockUUIDRef.current, blockData)
        console.log('[faiz:] === end save')
        dismiss()
        onClose?.()
      }
    }, WAIT + 100)
  }

  const saveCurrentDrawing = async () => {
    if (currentExcalidrawDataRef.current && blockUUIDRef.current) {
      const { elements, appState, files } = currentExcalidrawDataRef.current
      const blockData = genBlockData({
        ...excalidrawData,
        elements,
        appState: getMinimalAppState(appState!),
        files,
      })
      await logseq.Editor.updateBlock(blockUUIDRef.current, blockData)

      if (renderSlotId) {
        const { excalidrawData: freshData, rawBlocks } = await getExcalidrawInfoFromPage(pageName)
        await insertSVG(renderSlotId, undefined, freshData)
        const page = await logseq.Editor.getPage(pageName)
        await updateExcalidrawSvgTitle(renderSlotId, rawBlocks, page?.originalName || pageName)
      }
    }
  }

  const onAliasNameChange = (aliasName: string) => {
    setAliasName(aliasName)
    if (pagePropertyBlockUUIDRef.current) {
      updatePageProperty(pagePropertyBlockUUIDRef.current, 'excalidraw-plugin-alias', aliasName)
    }
  }
  const onTagChange = (tag: string) => {
    setTag(tag)
    if (pagePropertyBlockUUIDRef.current) {
      updatePageProperty(pagePropertyBlockUUIDRef.current, 'excalidraw-plugin-tag', tag)
    }
  }

  // initialize excalidraw data
  useEffect(() => {
    getExcalidrawInfoFromPage(pageName).then((data) => {
      setExcalidrawData(data?.excalidrawData)
      blockUUIDRef.current = data?.block?.uuid

      const firstBlock = data?.rawBlocks?.[0]
      pagePropertyBlockUUIDRef.current = firstBlock?.uuid
      setAliasName(firstBlock.properties?.excalidrawPluginAlias || '')
      setTag(firstBlock.properties?.excalidrawPluginTag?.toLowerCase?.() || '')
    })
  }, [pageName])
  // initialize library items
  useEffect(() => {
    getExcalidrawLibraryItems().then((items) => {
      setLibraryItems(items || [])
    })
  }, [])
  // initialize theme
  useEffect(() => {
    logseq.App.getStateFromStore<Theme>('ui/theme').then(setTheme)
  }, [])

  // Add search button to Link input field
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .logseq-search-icon:hover {
        transform: scale(1.3);
      }
    `
    document.head.appendChild(styleElement)

    const createSearchButton = (linkInput: HTMLInputElement) => {
      const btn = document.createElement('button')
      btn.className = 'link-search-btn'
      const img = document.createElement('img')
      img.src = new URL('../assets/logseq.png', import.meta.url).href
      img.style.cssText = 'width: 22px; height: 22px; object-fit: contain; transition: transform 0.2s ease;'
      img.className = 'logseq-search-icon'
      btn.appendChild(img)

      btn.onclick = () => setShowPageSearchOverlay(true)
      btn.style.cssText = `
        position: fixed;
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      document.body.appendChild(btn)
      updateButtonPosition(linkInput, btn)
      return btn
    }

    const updateButtonPosition = (linkInput: HTMLInputElement, btn: HTMLButtonElement) => {
      const rect = linkInput.getBoundingClientRect()
      btn.style.left = rect.left + rect.width / 2 - 12 + 12 + 'px'
      btn.style.top = rect.top - 40 + 'px'
    }

    const checkAndUpdateButton = () => {
      const linkInput = document.querySelector('input[placeholder*="ink"]') as HTMLInputElement
      const existingBtn = document.querySelector('.link-search-btn') as HTMLButtonElement

      if (!linkInput && existingBtn) {
        existingBtn.remove()
        return
      }

      if (linkInput && !existingBtn) {
        createSearchButton(linkInput)
        return
      }

      if (linkInput && existingBtn) {
        updateButtonPosition(linkInput, existingBtn)
        existingBtn.onclick = () => setShowPageSearchOverlay(true)
      }
    }

    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          shouldUpdate = true
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          shouldUpdate = true
        }
      })

      if (shouldUpdate) {
        checkAndUpdateButton()
      }
    })

    checkAndUpdateButton()

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    const handlePositionUpdate = () => checkAndUpdateButton()
    window.addEventListener('scroll', handlePositionUpdate, true)
    window.addEventListener('resize', handlePositionUpdate)

    const resizeObserver = new ResizeObserver(() => {
      checkAndUpdateButton()
    })

    resizeObserver.observe(document.body)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('scroll', handlePositionUpdate, true)
      window.removeEventListener('resize', handlePositionUpdate)
      try {
        document.head.removeChild(styleElement)
      } catch (e) {
        // Style element already removed
      }
      const existingBtn = document.querySelector('.link-search-btn')
      existingBtn?.remove()
    }
  }, [pageName])

  return (
    <div className={cn('relative h-screen w-screen pt-5', theme === 'dark' ? 'bg-[#121212]' : 'bg-white')}>
      {excalidrawData && libraryItems ? (
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          langCode={getLangCode((logseq.settings as unknown as PluginSettings)?.langCode)}
          initialData={{
            elements: excalidrawData.elements || [],
            appState: excalidrawData.appState
              ? Object.assign({ theme }, getMinimalAppState(excalidrawData.appState))
              : { theme },
            files: excalidrawData?.files || undefined,
            libraryItems,
          }}
          onChange={onExcalidrawChange}
          onLibraryChange={onLibraryChange}
          onLinkOpen={(element, event) => {
            if (element.link && element.link.includes('#excalidraw:')) {
              event.preventDefault()

              const pageName = element.link.replace(/.*#excalidraw:/, '')

              saveCurrentDrawing().then(() => {
                if (window.renderApp) {
                  window.renderApp({ mode: 'edit', pageName, renderSlotId: 'excalidraw-link-' + Date.now() })
                  logseq.showMainUI()
                }
              })

              return false
            }

            return true
          }}
          renderTopRightUI={() => (
            <div className="flex items-center gap-3">
              <Input placeholder="Untitled" value={aliasName} onChange={(e) => onAliasNameChange(e.target.value)} />
              <TagSelector showAdd value={tag} onChange={onTagChange} />
              <Button
                className="!h-[var(--lg-button-size)] !w-auto"
                onSelect={() => setSlidesModeEnabled((_old) => !_old)}
                title={i18nEditor.slidesMode}
              >
                <BiSlideshow className="!w-[14px]" />
              </Button>
              <Button
                className="!h-[var(--lg-button-size)] !w-auto"
                onSelect={() => onClickClose(type)}
                title={i18nEditor.exitButton}
              >
                {type === EditorTypeEnum.App ? (
                  <TbLogout className="!w-[14px]" />
                ) : (
                  <TbArrowsMinimize className="!w-[14px]" />
                )}
              </Button>
            </div>
          )}
        >
          <MainMenu>
            <MainMenu.Item icon={<TbBrandGithub />} onSelect={() => logseq.App.openExternalLink(GITHUB_URL)}>
              Github
            </MainMenu.Item>
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Logo></WelcomeScreen.Center.Logo>
              <WelcomeScreen.Center.Heading>Logseq Excalidraw Plugin</WelcomeScreen.Center.Heading>
            </WelcomeScreen.Center>
          </WelcomeScreen>
          <Footer>
            {slidesModeEnabled ? (
              <div className="ml-2 flex items-center gap-2">
                <Button
                  className="!h-[var(--lg-button-size)] !w-auto"
                  onSelect={() => setShowSlidesPreview((_old) => !_old)}
                  title={i18nEditor.slidesPreview}
                >
                  <BsLayoutSidebarInset className="!w-[14px]" />
                </Button>
                <Button
                  className="!h-[var(--lg-button-size)] !w-auto"
                  onSelect={() => setShowSlidesOverview(true)}
                  title={i18nEditor.slidesOverview}
                >
                  <IoAppsOutline className="!w-[14px]" />
                </Button>
                <Button
                  className="!h-[var(--lg-button-size)] !w-auto"
                  onSelect={prev}
                  aria-disabled={isFirst}
                  title={i18nEditor.slidesPrev}
                >
                  <FiArrowLeft className={cn({ '!w-[14px] text-gray-400': isFirst })} />
                </Button>
                <Button
                  className="!h-[var(--lg-button-size)] !w-auto"
                  onSelect={next}
                  aria-disabled={isLast}
                  title={i18nEditor.slidesNext}
                >
                  <FiArrowRight className={cn({ '!w-[14px] text-gray-400': isLast })} />
                </Button>
                {activeFrameIndex >= 0 ? (
                  <div className="text-base">
                    <span className="text-lg">{activeFrameIndex + 1}</span>
                    <span className="text-gray-400"> / {frames.length}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Footer>
        </Excalidraw>
      ) : null}
      {slidesModeEnabled && showSlidesPreview ? <SlidesPreview api={excalidrawAPI} theme={theme} /> : null}
      <SlidesOverview
        theme={theme}
        className="fixed left-0 top-0 z-50 h-screen w-screen"
        open={showSlidesOverview}
        onClose={() => setShowSlidesOverview(false)}
        api={excalidrawAPI}
      />
      <PageSearchOverlay
        isOpen={showPageSearchOverlay}
        onClose={() => setShowPageSearchOverlay(false)}
        onPageSelect={(page) => {
          const linkInput = document.querySelector('input[placeholder*="ink"]') as HTMLInputElement

          if (linkInput) {
            const drawLink = `#excalidraw:${page.originalName || page.name}`

            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value',
            )?.set
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(linkInput, drawLink)
            } else {
              linkInput.value = drawLink
            }

            linkInput.focus()
            linkInput.select()

            const inputEvent = new Event('input', { bubbles: true })
            const changeEvent = new Event('change', { bubbles: true })

            Object.defineProperty(inputEvent, 'target', { writable: false, value: linkInput })
            Object.defineProperty(changeEvent, 'target', { writable: false, value: linkInput })

            linkInput.dispatchEvent(inputEvent)
            linkInput.dispatchEvent(changeEvent)
          }
        }}
      />
    </div>
  )
}

export default Editor
