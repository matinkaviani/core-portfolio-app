import type { PortfolioData } from '@/lib/content/load-portfolio'

export interface ContentFileNode {
  path: string
  name: string
  type: 'file' | 'folder'
  children?: ContentFileNode[]
  content?: string
}

export function buildContentTree(portfolio: PortfolioData): ContentFileNode[] {
  return [
    {
      path: 'content',
      name: 'content',
      type: 'folder',
      children: [
        fileNode('content/about.md', 'about.md', portfolio.about.raw),
        fileNode('content/skills.md', 'skills.md', portfolio.skillsDoc.raw),
        fileNode(
          'content/experience.md',
          'experience.md',
          portfolio.experienceDoc.raw,
        ),
        fileNode('content/contact.md', 'contact.md', portfolio.contact.raw),
        fileNode(
          'content/ai-instructions.md',
          'ai-instructions.md',
          portfolio.aiInstructions,
        ),
        fileNode(
          'content/profile.json',
          'profile.json',
          JSON.stringify(
            {
              name: portfolio.profile.name,
              handle: portfolio.profile.handle,
              role: portfolio.profile.role,
            },
            null,
            2,
          ),
        ),
        {
          path: 'content/projects',
          name: 'projects',
          type: 'folder',
          children: portfolio.projects.map((p) =>
            fileNode(
              `content/projects/${p.id}.md`,
              `${p.id}.md`,
              `# ${p.name}\n\n${p.description}\n\n${Object.entries(p.sections ?? {})
                .map(([h, v]) => `## ${h}\n${v}`)
                .join('\n\n')}`,
            ),
          ),
        },
      ],
    },
  ]
}

function fileNode(path: string, name: string, content: string): ContentFileNode {
  return { path, name, type: 'file', content }
}

export function findContentFile(
  tree: ContentFileNode[],
  path: string,
): ContentFileNode | undefined {
  for (const node of tree) {
    if (node.path === path && node.type === 'file') return node
    if (node.children) {
      const found = findContentFile(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

export function flattenFiles(tree: ContentFileNode[]): ContentFileNode[] {
  const files: ContentFileNode[] = []
  for (const node of tree) {
    if (node.type === 'file') files.push(node)
    if (node.children) files.push(...flattenFiles(node.children))
  }
  return files
}
