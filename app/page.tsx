import { loadPortfolio } from '@/lib/content/load-portfolio'
import { NexusOS } from '@/components/os/nexus-os'

export default function Page() {
  const portfolio = loadPortfolio()
  return <NexusOS portfolio={portfolio} />
}
