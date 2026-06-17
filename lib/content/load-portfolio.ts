import fs from 'node:fs'
import path from 'node:path'
import type { ExperienceItem, ProjectItem } from '@/lib/os-data'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface PortfolioProfile {
  name: string
  handle: string
  role: string
  location: string
  email: string
  bio: string
  links: {
    github: string
    linkedin: string
    x?: string
  }
}

export interface SkillCategory {
  name: string
  skills: string[]
}

export interface ContentDocument {
  id: string
  title: string
  raw: string
  sections: Record<string, string>
}

export interface PortfolioData {
  profile: PortfolioProfile
  projects: ProjectItem[]
  experience: ExperienceItem[]
  skills: SkillCategory[]
  about: ContentDocument
  skillsDoc: ContentDocument
  experienceDoc: ContentDocument
  contact: ContentDocument
  aiInstructions: string
}

const PROJECT_META: Record<
  string,
  Pick<ProjectItem, 'category' | 'year' | 'status'>
> = {
  'trading-platform': {
    category: 'FinTech',
    year: '2024',
    status: 'Live',
  },
  'affiliate-system': {
    category: 'Platform',
    year: '2024',
    status: 'Live',
  },
  'ai-automation': {
    category: 'AI / Automation',
    year: '2025',
    status: 'Live',
  },
  'diagram-generator': {
    category: 'Developer Tools',
    year: '2024',
    status: 'Live',
  },
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8').trim()
}

function parseSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = markdown.split(/^## /m).slice(1)

  for (const part of parts) {
    const newline = part.indexOf('\n')
    if (newline === -1) continue
    const heading = part.slice(0, newline).trim()
    const body = part.slice(newline + 1).trim()
    sections[heading] = body
  }

  return sections
}

function parseTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() ?? 'Untitled'
}

function parseDocument(id: string, markdown: string): ContentDocument {
  return {
    id,
    title: parseTitle(markdown),
    raw: markdown,
    sections: parseSections(markdown),
  }
}

function parseListItems(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
}

function parseContactFields(markdown: string) {
  const fields: Record<string, string> = {}

  for (const line of markdown.split('\n')) {
    const match = line.match(/^([^:]+):\s*(.+)$/)
    if (!match) continue
    fields[match[1].trim().toLowerCase()] = match[2].trim()
  }

  return fields
}

function normalizeUrl(value: string): string {
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function parseBio(markdown: string): string {
  const withoutTitle = markdown.replace(/^#\s+.+\n+/, '').trim()
  const firstBlock = withoutTitle.split(/\n## /)[0]?.trim() ?? withoutTitle
  return firstBlock.replace(/\n+/g, ' ')
}

function parseSkills(markdown: string): SkillCategory[] {
  const sections = parseSections(markdown)
  return Object.entries(sections).map(([name, body]) => ({
    name,
    skills: parseListItems(body),
  }))
}

function parseProject(fileName: string, markdown: string): ProjectItem {
  const id = fileName.replace(/\.md$/, '')
  const meta = PROJECT_META[id] ?? {
    category: 'Engineering',
    year: '2024',
    status: 'Live' as const,
  }
  const sections = parseSections(markdown)
  const overview =
    sections.Overview ?? sections.Features ?? markdown.replace(/^#.+\n+/, '').trim()
  const stack = parseListItems(sections['Tech Stack'] ?? '')
  const challenges = parseListItems(
    sections['Key Challenges'] ?? sections.Challenges ?? '',
  )
  const outcome = sections.Outcome?.replace(/\n+/g, ' ').trim()

  return {
    id,
    name: parseTitle(markdown),
    category: meta.category,
    year: meta.year,
    description: overview.replace(/\n+/g, ' ').trim(),
    stack,
    status: meta.status,
    challenges,
    outcome,
    sections,
  }
}

function parseSubsections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = text.split(/^### /m).slice(1)

  for (const part of parts) {
    const newline = part.indexOf('\n')
    if (newline === -1) continue
    const heading = part.slice(0, newline).trim()
    const body = part.slice(newline + 1).trim()
    sections[heading] = body
  }

  return sections
}

function parseExperience(
  markdown: string,
  location: string,
): ExperienceItem[] {
  const sections = parseSections(markdown)
  const role = Object.keys(sections)[0] ?? 'Frontend Engineer'
  const roleBody = sections[role] ?? ''
  const subsections = parseSubsections(roleBody)
  const responsibilities = parseListItems(subsections.Responsibilities ?? '')
  const achievements = parseListItems(subsections.Achievements ?? '')

  return [
    {
      id: 'frontend-engineer',
      role,
      company: 'Product & Platform Work',
      period: 'Present',
      location,
      summary: responsibilities.join(' '),
      highlights: achievements.length ? achievements : responsibilities,
    },
  ]
}

function loadProfile(
  profileJson: { name: string; handle: string; role: string },
  aboutMarkdown: string,
  contactFields: Record<string, string>,
): PortfolioProfile {
  const github = normalizeUrl(contactFields.github ?? '')
  const linkedin = normalizeUrl(contactFields.linkedin ?? '')

  return {
    name: profileJson.name,
    handle: profileJson.handle,
    role: profileJson.role,
    location: contactFields.location ?? '',
    email: contactFields.email ?? '',
    bio: parseBio(aboutMarkdown),
    links: {
      github,
      linkedin,
    },
  }
}

export function loadPortfolio(): PortfolioData {
  const profileJson = JSON.parse(
    readFile(path.join(CONTENT_DIR, 'profile.json')),
  ) as { name: string; handle: string; role: string }

  const aboutMarkdown = readFile(path.join(CONTENT_DIR, 'about.md'))
  const skillsMarkdown = readFile(path.join(CONTENT_DIR, 'skills.md'))
  const experienceMarkdown = readFile(path.join(CONTENT_DIR, 'experience.md'))
  const contactMarkdown = readFile(path.join(CONTENT_DIR, 'contact.md'))
  const aiInstructions = readFile(path.join(CONTENT_DIR, 'ai-instructions.md'))

  const contactFields = parseContactFields(contactMarkdown)
  const profile = loadProfile(profileJson, aboutMarkdown, contactFields)

  const projectDir = path.join(CONTENT_DIR, 'projects')
  const projectFiles = fs
    .readdirSync(projectDir)
    .filter((file) => file.endsWith('.md'))
    .sort()

  const projects = projectFiles.map((file) =>
    parseProject(file, readFile(path.join(projectDir, file))),
  )

  return {
    profile,
    projects,
    experience: parseExperience(experienceMarkdown, profile.location),
    skills: parseSkills(skillsMarkdown),
    about: parseDocument('about', aboutMarkdown),
    skillsDoc: parseDocument('skills', skillsMarkdown),
    experienceDoc: parseDocument('experience', experienceMarkdown),
    contact: parseDocument('contact', contactMarkdown),
    aiInstructions,
  }
}
