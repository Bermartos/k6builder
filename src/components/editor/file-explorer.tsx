'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileCode2, Folder, FolderOpen, Plus } from 'lucide-react'
import { editorProject, PROJECT_ROOT, type EditorFile } from '@/lib/editor-files'
import { dictionary, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function FileRow({
  file,
  depth,
  active,
  onSelect,
}: {
  file: EditorFile
  depth: number
  active: boolean
  onSelect: (path: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(file.path)}
      aria-current={active ? 'true' : undefined}
      style={{ paddingLeft: `${depth * 1.1 + 0.75}rem` }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left font-mono text-[13px] transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <FileCode2 className={cn('size-3.5 shrink-0', active ? 'text-primary' : 'text-muted-foreground/70')} aria-hidden="true" />
      <span className="truncate">{file.name}</span>
    </button>
  )
}

export function FileExplorer({
  language,
  activePath,
  onSelect,
}: {
  language: Language
  activePath: string
  onSelect: (path: string) => void
}) {
  const t = dictionary[language]
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ requests: true })

  const toggleFolder = (name: string) => setOpenFolders((prev) => ({ ...prev, [name]: !prev[name] }))

  return (
    <nav
      aria-label={t.editorSidebarLabel}
      className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {t.editorSidebarLabel}
        </span>
        <button
          type="button"
          title={t.editorNewFileTitle}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{t.editorNewFile}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[13px] font-medium text-foreground">
          <FolderOpen className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{PROJECT_ROOT}</span>
        </div>

        <div className="mt-0.5 flex flex-col gap-0.5">
          {editorProject.files.map((file) => (
            <FileRow key={file.path} file={file} depth={1} active={activePath === file.path} onSelect={onSelect} />
          ))}

          {editorProject.folders?.map((folder) => {
            const isOpen = openFolders[folder.name]
            return (
              <div key={folder.name}>
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.name)}
                  aria-expanded={isOpen}
                  style={{ paddingLeft: '1.75rem' }}
                  className="flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left font-mono text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {isOpen ? (
                    <ChevronDown className="size-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
                  )}
                  {isOpen ? (
                    <FolderOpen className="size-3.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
                  ) : (
                    <Folder className="size-3.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-0.5">
                    {folder.files.map((file) => (
                      <FileRow
                        key={file.path}
                        file={file}
                        depth={2}
                        active={activePath === file.path}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
