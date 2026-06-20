import { loadPortfolio } from '@/lib/content/load-portfolio'
import { CoreOS } from '@/components/os/core-os'

export default function Page() {
  const portfolio = loadPortfolio()
  return <CoreOS portfolio={portfolio} />
}
