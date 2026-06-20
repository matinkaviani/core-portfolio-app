'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useOS } from '../os/os-context'
import { usePortfolio } from '../os/portfolio-context'
import { useAchievements } from '../os/achievements-context'
import { useViewport } from '@/lib/os/use-viewport'
import { cn } from '@/lib/utils'

const RESUME_PATH = '/Matin_Kaviani_CV.pdf'
const RESUME_FILENAME = 'Matin_Kaviani_CV.pdf'

const ZOOM_STEPS = ['fit', 75, 100, 125, 150, 200] as const
type Zoom = (typeof ZOOM_STEPS)[number]

function zoomLabel(zoom: Zoom) {
  return zoom === 'fit' ? 'Fit' : `${zoom}%`
}

function buildSrc(zoom: Zoom) {
  const base = `${RESUME_PATH}#toolbar=0&navpanes=0&statusbar=0`
  return zoom === 'fit' ? `${base}&view=FitH` : `${base}&zoom=${zoom}`
}

export function ResumeApp() {
  const { profile } = usePortfolio()
  const { openApp } = useOS()
  const { unlock } = useAchievements()
  const { isMobile } = useViewport()

  const [zoomIdx, setZoomIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const zoom = ZOOM_STEPS[zoomIdx]

  useEffect(() => {
    unlock('curriculum_vitae')
  }, [unlock])

  const stepZoom = (dir: -1 | 1) => {
    setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, Math.max(0, i + dir)))
    setLoaded(false)
  }

  const printDoc = () => {
    try {
      iframeRef.current?.contentWindow?.focus()
      iframeRef.current?.contentWindow?.print()
    } catch {
      window.open(RESUME_PATH, '_blank', 'noopener,noreferrer')
    }
  }

  const specs = [
    { label: 'Type', value: 'PDF Document' },
    { label: 'Role', value: profile.role },
    profile.location ? { label: 'Location', value: profile.location } : null,
    { label: 'Format', value: 'A4 · single file' },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="flex h-full flex-col bg-[oklch(0.155_0.004_270)]">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card/60 px-3 py-2 backdrop-blur-xs">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-mono text-[11px] font-semibold text-primary">
            PDF
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">
              {RESUME_FILENAME}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              Quick Look
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!isMobile && (
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
              <ToolbarIconButton
                label="Zoom out"
                disabled={zoomIdx === 0}
                onClick={() => stepZoom(-1)}
              >
                <path d="M3.5 7h7" />
              </ToolbarIconButton>
              <span className="min-w-[2.6rem] text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                {zoomLabel(zoom)}
              </span>
              <ToolbarIconButton
                label="Zoom in"
                disabled={zoomIdx === ZOOM_STEPS.length - 1}
                onClick={() => stepZoom(1)}
              >
                <path d="M7 3.5v7M3.5 7h7" />
              </ToolbarIconButton>
            </div>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={printDoc}
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
            >
              <Icon>
                <path d="M4 5V2.5h6V5M4 10h6v2.5H4zM2.5 5h9v4h-9z" />
              </Icon>
              Print
            </button>
          )}

          <a
            href={RESUME_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Icon>
              <path d="M5.5 2.5h-3v9h9v-3M8 2.5h3.5V6M11 3l-5 5" />
            </Icon>
            <span className="hidden sm:inline">Open</span>
          </a>

          <a
            href={RESUME_PATH}
            download={RESUME_FILENAME}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Icon>
              <path d="M7 2.5v6M4 6l3 3 3-3M3 11h8" />
            </Icon>
            Download
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {!isMobile && (
          <aside className="core-scrollbar hidden w-60 shrink-0 overflow-auto border-r border-border bg-card/30 p-4 lg:block">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Document
            </p>
            <div className="mt-3 space-y-2.5">
              {specs.map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-border" />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openApp('assistant')}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="font-mono text-[10px] text-primary">AI</span>
                Ask Core about my CV
              </button>
              <button
                type="button"
                onClick={() => openApp('experience')}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="font-mono text-[10px] text-primary">EX</span>
                View career timeline
              </button>
              <button
                type="button"
                onClick={() => openApp('contact')}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="font-mono text-[10px] text-primary">CT</span>
                Get in touch
              </button>
            </div>
          </aside>
        )}

        {/* Preview surface */}
        <div className="relative min-h-0 flex-1 bg-[oklch(0.12_0.004_270)]">
          {isMobile ? (
            <MobilePreview />
          ) : (
            <>
              {!loaded && <PreviewSkeleton />}
              <iframe
                key={String(zoom)}
                ref={iframeRef}
                src={buildSrc(zoom)}
                title="Résumé preview"
                onLoad={() => setLoaded(true)}
                className={cn(
                  'h-full w-full border-0 transition-opacity duration-300',
                  loaded ? 'opacity-100' : 'opacity-0',
                )}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MobilePreview() {
  return (
    <div className="core-scrollbar flex h-full flex-col items-center justify-center overflow-auto p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xs"
      >
        <div className="mx-auto flex h-28 w-22 items-center justify-center rounded-xl border border-border bg-card shadow-lg shadow-black/30">
          <span className="font-mono text-sm font-semibold text-primary">
            PDF
          </span>
        </div>
        <h3 className="mt-5 text-base font-semibold text-foreground">
          {RESUME_FILENAME}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Inline preview isn&apos;t supported on most mobile browsers. Open or
          download the PDF to view it full screen.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={RESUME_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open PDF
          </a>
          <a
            href={RESUME_PATH}
            download={RESUME_FILENAME}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Download
          </a>
        </div>
      </motion.div>
    </div>
  )
}

function PreviewSkeleton() {
  return (
    <div className="absolute inset-0 flex items-start justify-center overflow-hidden p-6">
      <div className="h-full w-full max-w-2xl animate-pulse rounded-lg bg-card/50">
        <div className="space-y-3 p-8">
          <div className="h-7 w-1/2 rounded bg-secondary/60" />
          <div className="h-3 w-1/3 rounded bg-secondary/40" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-secondary/30"
                style={{ width: `${90 - (i % 4) * 12}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        disabled
          ? 'cursor-not-allowed text-muted-foreground/40'
          : 'text-foreground/80 hover:bg-secondary hover:text-foreground',
      )}
    >
      <svg
        viewBox="0 0 14 14"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  )
}
