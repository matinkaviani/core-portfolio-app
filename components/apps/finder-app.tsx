'use client'

import { useEffect, useMemo, useState } from 'react'
import { useOS } from '../os/os-context'
import { usePortfolio } from '../os/portfolio-context'
import { useAchievements } from '../os/achievements-context'
import {
  buildContentTree,
  findContentFile,
  type ContentFileNode,
} from '@/lib/content/files'
import { cn } from '@/lib/utils'

export function FinderApp() {
  const portfolio = usePortfolio()
  const { getAppParams } = useOS()
  const { unlock } = useAchievements()
  const params = getAppParams('finder')
  const tree = useMemo(() => buildContentTree(portfolio), [portfolio])
  const [selectedPath, setSelectedPath] = useState(
    params.file ?? 'content/about.md',
  )

  useEffect(() => {
    unlock('explorer')
  }, [unlock])

  useEffect(() => {
    if (params.file) setSelectedPath(params.file)
  }, [params.file])

  const selected = findContentFile(tree, selectedPath)

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)] md:flex-row">
      <aside className="nexus-scrollbar shrink-0 overflow-auto border-b border-border p-3 md:w-56 md:border-b-0 md:border-r">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          /content
        </p>
        <FileTree
          nodes={tree}
          selectedPath={selectedPath}
          onSelect={setSelectedPath}
          depth={0}
        />
      </aside>

      <div className="nexus-scrollbar flex min-h-0 flex-1 flex-col overflow-auto p-5">
        <p className="font-mono text-xs text-primary">{selectedPath}</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          {selected?.name ?? 'Select a file'}
        </h2>
        <pre className="mt-4 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
          {selected?.content ?? 'No file selected.'}
        </pre>
      </div>
    </div>
  )
}

function FileTree({
  nodes,
  selectedPath,
  onSelect,
  depth,
}: {
  nodes: ContentFileNode[]
  selectedPath: string
  onSelect: (path: string) => void
  depth: number
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <li key={node.path}>
          {node.type === 'folder' ? (
            <div>
              <p
                className="truncate px-2 py-1 text-xs font-medium text-muted-foreground"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
              >
                {node.name}/
              </p>
              {node.children && (
                <FileTree
                  nodes={node.children}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.path)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className={cn(
                'w-full truncate rounded-md py-1 pr-2 text-left text-xs transition-colors',
                selectedPath === node.path
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
