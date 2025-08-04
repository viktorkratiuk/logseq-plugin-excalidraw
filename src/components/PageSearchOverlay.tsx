import type { PageEntity } from '@logseq/libs/dist/LSPlugin'
import { Search, FileText } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'

import { getExcalidrawPages, getExcalidrawInfoFromPage, getExcalidrawAlias } from '@/lib/utils'
import getI18N from '@/locales'

interface PageWithAlias extends PageEntity {
  drawAlias?: string
}

interface PageSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onPageSelect?: (page: PageEntity) => void
}

export const PageSearchOverlay: React.FC<PageSearchOverlayProps> = ({ isOpen, onClose, onPageSelect }) => {
  const i18n = getI18N().pageSearch

  const [searchQuery, setSearchQuery] = useState('')
  const [pages, setPages] = useState<PageWithAlias[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filteredPages, setFilteredPages] = useState<PageWithAlias[]>([])

  useEffect(() => {
    if (isOpen && pages.length === 0) {
      setIsLoading(true)

      getExcalidrawPages()
        .then(async (excalidrawPages) => {
          if (!excalidrawPages) {
            setPages([])
            setFilteredPages([])
            return
          }

          const promises = excalidrawPages.map(async (page) => {
            try {
              const { rawBlocks } = await getExcalidrawInfoFromPage(page.name)
              const drawAlias = getExcalidrawAlias(rawBlocks, page.originalName || page.name)
              return {
                ...page,
                drawAlias,
              } as PageWithAlias
            } catch (error) {
              console.warn(`Error loading alias for page ${page.name}:`, error)
              return {
                ...page,
                drawAlias: undefined,
              } as PageWithAlias
            }
          })
          const pagesWithAliases = await Promise.all(promises)
          setPages(pagesWithAliases)
          setFilteredPages(pagesWithAliases)
        })
        .catch((error) => {
          console.error('Error loading Excalidraw pages:', error)
          setPages([])
          setFilteredPages([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, pages.length])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPages(pages)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = pages.filter((page) => {
      const pageName = page.originalName?.toLowerCase() || page.name?.toLowerCase() || ''
      const pageAlias =
        page.drawAlias && page.drawAlias !== (page.originalName || page.name) ? page.drawAlias.toLowerCase() : ''
      return pageName.includes(query) || pageAlias.includes(query)
    })
    setFilteredPages(filtered)
  }, [searchQuery, pages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handlePageClick = useCallback(
    (page: PageWithAlias) => {
      onPageSelect?.(page)
      onClose()
    },
    [onPageSelect, onClose],
  )

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-2xl rounded-lg bg-white/90 shadow-xl dark:bg-gray-800/90">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder={i18n.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white/80 py-2 pl-10 pr-4 text-gray-900
                focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/80
                dark:text-white"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">{i18n.loading}</div>
          ) : filteredPages.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery.trim() ? i18n.noResults : i18n.resultsPlaceholder}
            </div>
          ) : (
            <div className="py-2">
              {filteredPages.map((page) => (
                <div
                  key={page.id || page.name}
                  onClick={() => handlePageClick(page)}
                  className="flex cursor-pointer items-center border-b border-gray-100 px-4 py-3 last:border-b-0
                    hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <FileText className="mr-3 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {page.originalName || page.name}
                    </div>
                    <div className="truncate text-xs text-blue-600 dark:text-blue-400">
                      {page.drawAlias && page.drawAlias !== (page.originalName || page.name)
                        ? page.drawAlias
                        : i18n.noAlias}
                    </div>
                    {page.originalName && page.originalName !== page.name ? (
                      <div className="truncate text-xs text-gray-500 dark:text-gray-400">{page.name}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between rounded-b-lg bg-gray-50/80 p-3 text-xs text-gray-500
            dark:bg-gray-700/80 dark:text-gray-400"
        >
          <span>{i18n.closeHint}</span>
          {!isLoading && filteredPages.length > 0 ? <span>{i18n.pageCount(filteredPages.length)}</span> : null}
        </div>
      </div>
    </div>
  )
}
