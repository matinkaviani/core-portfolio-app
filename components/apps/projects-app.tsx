'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PROJECTS, type ProjectItem } from '@/lib/os-data'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<ProjectItem['status'], string> = {
  Live: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  'In progress': 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Archived: 'bg-muted text-muted-foreground border-border',
}

export function ProjectsApp() {
  const [selected, setSelected] = useState<ProjectItem>(PROJECTS[0])

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)] md:flex-row">
      <aside className="nexus-scrollbar shrink-0 overflow-auto border-b border-border p-3 md:w-64 md:border-b-0 md:border-r">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Selected work
        </p>
        <ul className="space-y-1">
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                  selected.id === p.id
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )}
              >
                <span className="font-medium">{p.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {p.year}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="nexus-scrollbar flex-1 overflow-auto p-6"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-primary">
            {selected.category}
          </span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] font-medium',
              STATUS_STYLES[selected.status],
            )}
          >
            {selected.status}
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {selected.name}
        </h2>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {selected.year}
        </p>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/80">
          {selected.description}
        </p>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.stack.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground/80"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {['Architecture', 'Interface', 'Performance'].map((label, i) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-3"
            >
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {['A+', '60fps', '< 50ms'][i]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
