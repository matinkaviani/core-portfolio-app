'use client'

import { motion } from 'framer-motion'
import { usePortfolio } from '../os/portfolio-context'

export function ExperienceApp() {
  const { experience } = usePortfolio()

  return (
    <div className="nexus-scrollbar h-full overflow-auto bg-[oklch(0.155_0.004_270)] p-6">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-primary">
          Career
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Experience
        </h2>
      </div>

      <ol className="relative ml-2 border-l border-border">
        {experience.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="mb-8 ml-6 last:mb-0"
          >
            <span className="absolute -left-[7px] mt-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary/50 bg-background">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-base font-semibold text-foreground">
                {e.role}
                <span className="text-primary"> · {e.company}</span>
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {e.period}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{e.location}</p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/80">
              {e.summary}
            </p>
            <ul className="mt-3 space-y-1.5">
              {e.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-2 text-sm leading-relaxed text-foreground/70"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
