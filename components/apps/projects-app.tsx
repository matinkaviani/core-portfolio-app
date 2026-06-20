'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useOS } from '../os/os-context'
import { usePortfolio } from '../os/portfolio-context'
import type { ProjectItem } from '@/lib/os-data'
import { clearDeepLink, copyDeepLink, syncDeepLink } from '../os/use-deep-links'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<ProjectItem['status'], string> = {
  Live: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  'In progress': 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Archived: 'bg-muted text-muted-foreground border-border',
}

function getProjectUrl(project: ProjectItem): string | undefined {
  const links = project.sections?.Links
  if (!links) return undefined
  const match = links.match(/https?:\/\/[^\s]+/)
  return match?.[0]
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 3h7v7M13 3 6 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M6.5 9.5a3.5 3.5 0 0 0 4.95 0l1.5-1.5a3.5 3.5 0 0 0-4.95-4.95L7.25 4.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 6.5a3.5 3.5 0 0 0-4.95 0l-1.5 1.5a3.5 3.5 0 0 0 4.95 4.95l1.2-1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ProjectsApp() {
  const { projects } = usePortfolio()
  const { getAppParams } = useOS()
  const params = getAppParams('projects')
  const initial =
    projects.find((p) => p.id === params.project) ?? projects[0]
  const [selected, setSelected] = useState<ProjectItem>(initial)
  const [copied, setCopied] = useState(false)

  const projectUrl = getProjectUrl(selected)

  useEffect(() => {
    if (params.project) {
      const match = projects.find((p) => p.id === params.project)
      if (match) setSelected(match)
    }
  }, [params.project, projects])

  useEffect(() => {
    setCopied(false)
  }, [selected.id])

  useEffect(() => {
    syncDeepLink('projects', { project: selected.id })
  }, [selected.id])

  useEffect(() => {
    return () => clearDeepLink('projects')
  }, [])

  const copyLink = async () => {
    const url = copyDeepLink('projects', { project: selected.id })
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const highlights = [
    ...(selected.challenges?.slice(0, 2).map((item) => ({
      label: 'Challenge',
      value: item,
    })) ?? []),
    ...(selected.outcome
      ? [{ label: 'Outcome', value: selected.outcome }]
      : []),
  ].slice(0, 3)

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)] md:flex-row">
      <aside className="core-scrollbar max-h-44 shrink-0 overflow-auto border-b border-border p-3 md:max-h-none md:w-64 md:border-b-0 md:border-r">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Selected work
        </p>
        <ul className="space-y-1">
          {projects.map((p) => (
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
        className="core-scrollbar flex-1 overflow-auto p-4 sm:p-6"
      >
        <header className="mb-6 border-b border-border pb-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {selected.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {selected.year}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {projectUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  nativeButton={false}
                >
                  <ExternalIcon />
                  Open site
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyLink}
              >
                <LinkIcon />
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </div>
          </div>
        </header>

        <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
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

        {highlights.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
