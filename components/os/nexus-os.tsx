'use client'

import { useState } from 'react'
import { OSProvider } from '@/components/os/os-context'
import { BootSequence } from '@/components/os/boot-sequence'
import { Desktop } from '@/components/os/desktop'

export function NexusOS() {
  const [booted, setBooted] = useState(false)

  return (
    <OSProvider>
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      {booted && <Desktop />}
    </OSProvider>
  )
}
