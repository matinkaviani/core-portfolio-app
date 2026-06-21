import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background core-grid">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-160 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <header className="relative z-10 flex h-9 items-center border-b border-border core-glass px-3 text-xs">
        <div className="flex items-center gap-2 px-2 font-semibold tracking-tight">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
              <path
                d="M7 8l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 16h4"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-foreground">CORE</span>
        </div>
        <span className="ml-3 text-muted-foreground">System</span>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            CORE · System Error
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-border bg-[oklch(0.18_0.004_270)] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                terminal — exit 404
              </span>
            </div>

            <div className="space-y-3 bg-[oklch(0.13_0.004_270)] p-5 font-mono text-[13px] leading-relaxed">
              <p className="text-muted-foreground">
                CORE shell — route handler failed.
              </p>
              <div className="space-y-1">
                <p>
                  <span className="text-primary">guest@core</span>
                  <span className="text-muted-foreground"> ~ </span>
                  <span className="text-foreground">cd /unknown-route</span>
                </p>
                <p className="text-foreground/80">
                  bash: cd: /unknown-route: No such file or directory
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  <span className="text-primary">guest@core</span>
                  <span className="text-muted-foreground"> ~ </span>
                  <span className="text-foreground">echo $?</span>
                </p>
                <p className="text-foreground/80">404</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Page not found
            </h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              The path you requested doesn&apos;t exist in this portfolio system.
              Return to the desktop to open Terminal, Projects, or the
              Assistant.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/" />} nativeButton={false}>
                Return to desktop
              </Button>
              <Button
                variant="outline"
                render={<Link href="/" />}
                nativeButton={false}
              >
                Open Terminal
              </Button>
            </div>
          </div>

          <p className="mt-8 font-mono text-xs text-muted-foreground">
            Tip: on the desktop, type{' '}
            <span className="text-primary">help</span> in the Terminal.
          </p>
        </div>
      </div>
    </main>
  )
}
