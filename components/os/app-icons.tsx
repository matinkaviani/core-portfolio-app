import type { AppId } from '@/lib/os-data'
import { cn } from '@/lib/utils'
import { motion, type Variants } from 'framer-motion'

type IconProps = {
  className?: string
}

const centerOrigin = {
  transformBox: 'fill-box' as const,
  transformOrigin: 'center' as const,
}

function Svg({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 sm:h-6 sm:w-6', className)}
      aria-hidden
    >
      {children}
    </motion.svg>
  )
}

function TerminalIcon(props: IconProps) {
  const chevron: Variants = {
    rest: { x: 0 },
    hover: { x: 1.5, transition: { type: 'spring', stiffness: 500, damping: 14 } },
  }
  const cursor: Variants = {
    rest: { opacity: 1 },
    hover: {
      opacity: [1, 0, 1, 0, 1],
      transition: { duration: 0.8, ease: 'linear' },
    },
  }
  return (
    <Svg {...props}>
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <motion.path d="M6.5 9.5 9.5 12l-3 2.5" variants={chevron} />
      <motion.path d="M12.5 14.5h5" variants={cursor} />
    </Svg>
  )
}

function AssistantIcon(props: IconProps) {
  const bigStar: Variants = {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 12,
      transition: { type: 'spring', stiffness: 300, damping: 12 },
    },
  }
  const smallStar: Variants = {
    rest: { scale: 1, opacity: 0.9 },
    hover: {
      scale: [1, 1.4, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
  }
  return (
    <Svg {...props}>
      <motion.path
        style={centerOrigin}
        variants={bigStar}
        d="M12 3.5l1.7 3.95 3.95 1.7-3.95 1.7L12 14.8l-1.7-3.95L6.35 9.15l3.95-1.7z"
      />
      <motion.path
        style={centerOrigin}
        variants={smallStar}
        d="M18 15l.85 1.9 1.9.85-1.9.85L18 20.5l-.85-1.9-1.9-.85 1.9-.85z"
      />
    </Svg>
  )
}

function ProjectsIcon(props: IconProps) {
  const top: Variants = {
    rest: { y: 0 },
    hover: { y: -1.6, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  }
  const bottom: Variants = {
    rest: { y: 0 },
    hover: { y: 1.6, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  }
  return (
    <Svg {...props}>
      <motion.path variants={top} d="M12 3l8.5 4.5L12 12 3.5 7.5z" />
      <motion.path variants={bottom} d="M3.5 12 12 16.5 20.5 12" />
      <motion.path variants={bottom} d="M3.5 16.5 12 21l8.5-4.5" />
    </Svg>
  )
}

function ExperienceIcon(props: IconProps) {
  const handle: Variants = {
    rest: { y: 0 },
    hover: { y: -1.4, transition: { type: 'spring', stiffness: 400, damping: 13 } },
  }
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <motion.path
        variants={handle}
        d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7"
      />
      <path d="M3 12.5h18" />
      <path d="M11 12.5v2h2v-2" />
    </Svg>
  )
}

function ResumeIcon(props: IconProps) {
  const line: Variants = {
    rest: { scaleX: 1, opacity: 1 },
    hover: {
      scaleX: [0, 1],
      opacity: [0.4, 1],
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  }
  const lineOrigin = { transformBox: 'fill-box' as const, transformOrigin: 'left' as const }
  return (
    <Svg {...props}>
      <path d="M6 3h7l5 5v13H6z" />
      <path d="M13 3v5h5" />
      <motion.path style={lineOrigin} variants={line} d="M9 13h6" />
      <motion.path
        style={lineOrigin}
        variants={{
          rest: line.rest,
          hover: {
            scaleX: [0, 1],
            opacity: [0.4, 1],
            transition: { duration: 0.45, ease: 'easeOut', delay: 0.1 },
          },
        }}
        d="M9 16.5h6"
      />
    </Svg>
  )
}

function ContactIcon(props: IconProps) {
  const flap: Variants = {
    rest: { scaleY: 1, opacity: 1 },
    hover: {
      scaleY: [1, 0.2, 1],
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
  }
  const flapOrigin = { transformBox: 'fill-box' as const, transformOrigin: 'top' as const }
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <motion.path style={flapOrigin} variants={flap} d="M4 7l8 5.5L20 7" />
    </Svg>
  )
}

function FinderIcon(props: IconProps) {
  const lid: Variants = {
    rest: { rotate: 0 },
    hover: {
      rotate: -6,
      transition: { type: 'spring', stiffness: 300, damping: 12 },
    },
  }
  return (
    <Svg {...props}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v6.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z" />
      <motion.path
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom left' }}
        variants={lid}
        d="M3 9.5h8l1.6-2H5.5A2.5 2.5 0 0 0 3 9.5z"
        fill="currentColor"
        stroke="none"
        opacity={0.18}
      />
    </Svg>
  )
}

function SettingsIcon(props: IconProps) {
  const gear: Variants = {
    rest: { rotate: 0 },
    hover: {
      rotate: 180,
      transition: { duration: 1.1, ease: 'easeInOut' },
    },
  }
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.25" />
      <motion.path
        style={centerOrigin}
        variants={gear}
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"
      />
    </Svg>
  )
}

const ICONS: Record<AppId, (props: IconProps) => React.ReactElement> = {
  terminal: TerminalIcon,
  assistant: AssistantIcon,
  projects: ProjectsIcon,
  experience: ExperienceIcon,
  resume: ResumeIcon,
  contact: ContactIcon,
  finder: FinderIcon,
  settings: SettingsIcon,
}

export function AppIcon({
  id,
  className,
}: {
  id: AppId
  className?: string
}) {
  const Icon = ICONS[id]
  return <Icon className={className} />
}
