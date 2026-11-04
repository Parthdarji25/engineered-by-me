// ─────────────────────────────────────────────────────────────────────────────
// All homepage content lives here. Edit this file to personalise the site —
// components read from it, so you never need to touch markup to change text.
// Items marked  TODO  are sample content: replace them with your real details.
// ─────────────────────────────────────────────────────────────────────────────
import type { IconName } from '~/utils/icons'

export interface SocialLink {
  label: string
  href: string
  icon: IconName
}

export interface ExperienceProject {
  name: string
  points: string[]
  tags: string[]
}

export interface ExperienceRole {
  title: string
  period: string
  duration?: string
  current?: boolean
  projects: ExperienceProject[]
}

export interface StackGroup {
  name: string
  icon: IconName
  summary: string
  /** Tools you use most — shown prominently. */
  core: string[]
  /** Tools you've used — shown as a quieter list. */
  also: string[]
}

export const profile = {
  name: 'Parth Darji',
  firstName: 'Parth',
  title: 'Software Engineer',
  headline: 'I build intelligent products end to end.',
  intro:
    'Software engineer working across the full stack — polished frontends, dependable backends, and generative AI features that make it to production.',
  /** Read out to screen readers in the hero. */
  roles: ['Frontend Engineer', 'Backend Engineer', 'GenAI Engineer', 'AI Engineer'],
  available: true, // shows the "open to opportunities" badge
  email: 'darjiparth701@gmail.com',
  resumeUrl: '', // TODO e.g. '/resume.pdf' (put the file in /public)
  socials: [
    { label: 'GitHub', href: 'https://github.com/Parthdarji25', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/parthdarji05/', icon: 'linkedin' },
    { label: 'X', href: 'https://x.com/ParthDarji_____', icon: 'x' },
  ] satisfies SocialLink[],
}

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export const experience = {
  company: 'CeX Webuy.com',
  employment: 'Full-time',
  location: 'Mumbai, India · Hybrid',
  since: 'Oct 2022',
  /** Shown between the two roles as a milestone. */
  promotion: 'Promoted to Software Engineer',
  roles: [
    {
      title: 'Software Engineer',
      period: 'Jun 2024 – Present',
      current: true,
      projects: [
        {
          name: 'KidX Platform Migration',
          points: [
            'Migrated KidX (sister brand of CeX) from Vue 2 / Nuxt 2 to Vue 3 / Nuxt 3.',
            'Delivered 50%+ of the modules, integrating and customising XCP components.',
            'Fixed high-priority defects along the way.',
          ],
          tags: ['Vue 3', 'Nuxt 3', 'Migration'],
        },
        {
          name: 'Diamond — Unified Membership',
          points: [
            'Led the end-to-end build of one membership platform for online and in-store customers.',
            'Built phone verification, membership linking, online access unlock and membership abilities from scratch.',
            'Owned state management and core logic; shipped on time with design, API and product teams.',
          ],
          tags: ['Vue 3', 'State management', 'Architecture'],
        },
        {
          name: 'DeX Platform Migration',
          points: [
            'Moved DeX from a legacy PHP app to a Vue 3 PWA.',
            'Built the core Basket Flow and Online Access Unlock features.',
            'Added GA4 tracking and reduced layout shift (CLS) with optimised image loading.',
          ],
          tags: ['Vue 3', 'PWA', 'GA4', 'Web Vitals'],
        },
      ],
    },
    {
      title: 'Trainee Software Engineer',
      period: 'Oct 2022 – Jun 2024',
      duration: '1 yr 9 mos',
      projects: [],
    },
  ] satisfies ExperienceRole[],
}

// TODO — move tools between `core` and `also` so they reflect your real experience.
export const techStack: StackGroup[] = [
  {
    name: 'Frontend',
    icon: 'code',
    summary: 'Interfaces that are fast, accessible and a joy to use.',
    core: ['Vue 3', 'Nuxt', 'TypeScript', 'React', 'Tailwind CSS'],
    also: ['Next.js', 'JavaScript', 'Three.js', 'GSAP', 'Pinia', 'HTML5', 'CSS3'],
  },
  {
    name: 'Backend',
    icon: 'server',
    summary: 'APIs and data layers built to scale and stay observable.',
    core: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'REST'],
    also: ['Express', 'NestJS', 'Django', 'GraphQL', 'MongoDB', 'Redis'],
  },
  {
    name: 'AI & ML',
    icon: 'sparkles',
    summary: 'LLM features, retrieval and agents that hold up in production.',
    core: ['LLM APIs', 'RAG', 'LangChain', 'Vector DBs', 'Prompt Engineering'],
    also: ['LlamaIndex', 'PyTorch', 'Hugging Face', 'scikit-learn', 'Evals'],
  },
  {
    name: 'DevOps & Tools',
    icon: 'terminal',
    summary: 'Shipping, automating and running it all reliably.',
    core: ['Git', 'Docker', 'GitHub Actions', 'AWS'],
    also: ['Kubernetes', 'Vercel', 'Linux', 'Vite'],
  },
]

/** Every tool in the stack, flattened (used by the marquee). */
export const allTools = techStack.flatMap(group =>
  [...group.core, ...group.also].map(name => ({ name, group: group.name })),
)

