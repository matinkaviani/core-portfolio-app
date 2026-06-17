import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { loadPortfolioFromFs } from '../lib/content/load-portfolio'

const outPath = path.join(process.cwd(), 'lib/content/portfolio.snapshot.json')
const data = loadPortfolioFromFs()

writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
console.log(`Wrote portfolio snapshot to ${outPath}`)
