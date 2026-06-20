'use client'

import { useEffect, useState } from 'react'
import type { PortfolioData } from '@/lib/content/load-portfolio'
import { OSProvider } from '@/components/os/os-context'
import { ContextMenuProvider } from '@/components/os/context-menu'
import { PortfolioProvider } from '@/components/os/portfolio-context'
import { SettingsProvider } from '@/components/os/settings-context'
import { AchievementsProvider, useAchievements } from '@/components/os/achievements-context'
import { CommandPaletteProvider } from '@/components/os/command-palette'
import { SessionProvider, useSession } from '@/components/os/session-context'
import { BootSequence } from '@/components/os/boot-sequence'
import { Desktop } from '@/components/os/desktop'
import { loadSettings } from '@/lib/os/settings'

function CoreShell({ portfolio }: { portfolio: PortfolioData }) {
  const { booted, sessionChecked, sessionKey, visitorName } = useSession()

  if (!sessionChecked) return null

  return (
    <OSProvider key={sessionKey}>
      <CommandPaletteProvider>
        <ContextMenuProvider>
          {!booted && <LoginFlow ownerName={portfolio.profile.name} />}
          {booted && (
            <Desktop
              visitorName={visitorName}
              ownerName={portfolio.profile.name}
            />
          )}
        </ContextMenuProvider>
      </CommandPaletteProvider>
    </OSProvider>
  )
}

function LoginFlow({ ownerName }: { ownerName: string }) {
  const { unlock } = useAchievements()
  const { login, skipBoot } = useSession()

  return (
    <BootSequence
      ownerName={ownerName}
      skipBoot={skipBoot}
      onComplete={(name) => {
        unlock('first_login')
        login(name)
      }}
    />
  )
}

export function CoreOS({ portfolio }: { portfolio: PortfolioData }) {
  const [skipBoot, setSkipBoot] = useState(false)

  useEffect(() => {
    setSkipBoot(loadSettings().skipBoot)
  }, [])

  return (
    <PortfolioProvider portfolio={portfolio}>
      <SettingsProvider>
        <AchievementsProvider>
          <SessionProvider skipBoot={skipBoot}>
            <CoreShell portfolio={portfolio} />
          </SessionProvider>
        </AchievementsProvider>
      </SettingsProvider>
    </PortfolioProvider>
  )
}
