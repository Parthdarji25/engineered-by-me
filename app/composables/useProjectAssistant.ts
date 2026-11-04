import type { Project } from '~/data/projects'

/**
 * A scripted "agent" for a project page — NO AI and no network calls.
 * It matches the visitor's question against keyword intents built from the
 * project data, then streams the prepared answer word by word so it feels live.
 */

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  /** Optional "jump to section" action shown under an answer. */
  section?: { id: string, label: string }
}

interface Intent {
  id: string
  keywords: string[]
  /** Generic phrases that only nudge the score (e.g. "tell me about"). */
  weak?: string[]
  weight: number
  answer: () => string
  section?: { id: string, label: string }
}

export interface Suggestion {
  label: string
  intentId: string
}

const bullets = (items: string[]) => items.map(i => `• ${i}`).join('\n')
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')

function buildIntents(project: Project): Intent[] {
  const layers = project.architecture
  const firstFlow = project.flows[0]

  const general: Intent[] = [
    {
      id: 'greeting',
      keywords: ['hello', ' hi ', ' hey', 'good morning'],
      weight: 1,
      answer: () => `Hi! I'm the guide for ${project.title}. Ask me about the architecture, how a request flows, the tech decisions, or the hardest problems.`,
    },
    {
      id: 'overview',
      keywords: ['overview', 'summary', 'problem', 'purpose', 'solve', 'goal'],
      weak: ['about', 'explain', 'tell me', 'what is', 'what does'],
      weight: 1,
      answer: () => `${project.summary}\n\nThe problem: ${project.problem}\n\nThe solution: ${project.solution}`,
      section: { id: 'overview', label: 'Overview' },
    },
    {
      id: 'architecture',
      keywords: ['architecture', 'system', 'design', 'component', 'diagram', 'layer', 'structure', 'service'],
      weight: 1,
      answer: () =>
        `The system has ${layers.length} layers:\n${bullets(layers.map(l => `${l.name}: ${l.nodes.map(n => n.name).join(', ')}`))}\n\nClick any box in the diagram to see what that component does.`,
      section: { id: 'architecture', label: 'Architecture' },
    },
    {
      id: 'flow',
      keywords: ['how it works', 'flow', 'request', 'process', 'pipeline', 'end to end', 'end-to-end', 'walkthrough'],
      weak: ['how does', ' work', 'step'],
      weight: 1,
      answer: () =>
        firstFlow
          ? `Here's "${firstFlow.name}", end to end:\n${firstFlow.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.description}`).join('\n')}\n\nPress "Play flow" on the diagram to watch it happen.`
          : project.solution,
      section: { id: 'architecture', label: 'Play the flow' },
    },
    {
      id: 'stack',
      keywords: ['stack', 'tech', 'technolog', 'built with', 'language', 'framework', 'tools', 'library'],
      weight: 1,
      answer: () => `Main tools: ${project.tags.join(', ')}.\n\nThe key choices were:\n${bullets(project.decisions.map(d => d.choice))}`,
      section: { id: 'decisions', label: 'Tech decisions' },
    },
    {
      id: 'decisions',
      keywords: ['decision', 'choose', 'chose', 'trade-off', 'tradeoff', 'instead', 'alternative'],
      weak: ['why'],
      weight: 1,
      answer: () => bullets(project.decisions.map(d => `${d.choice}: ${d.reason}`)),
      section: { id: 'decisions', label: 'Tech decisions' },
    },
    {
      id: 'features',
      keywords: ['feature', 'capabilit', 'can it', 'does it do', 'functionality'],
      weight: 1,
      answer: () => bullets(project.features.map(f => `${f.title} — ${f.description}`)),
      section: { id: 'features', label: 'Features' },
    },
    {
      id: 'challenges',
      keywords: ['challenge', 'hard', 'difficult', 'bug', 'issue', 'obstacle', 'tricky', 'struggle'],
      weight: 1,
      answer: () => project.challenges.map(c => `${c.title}\nProblem: ${c.problem}\nFix: ${c.solution}`).join('\n\n'),
      section: { id: 'challenges', label: 'Challenges' },
    },
    {
      id: 'results',
      keywords: ['result', 'impact', 'outcome', 'metric', 'number', 'success', 'learn', 'lesson'],
      weight: 1,
      answer: () =>
        `${bullets(project.outcomes.map(o => `${o.value} — ${o.label}`))}\n\nWhat I learned:\n${bullets(project.learnings)}`,
      section: { id: 'results', label: 'Results' },
    },
    {
      id: 'role',
      keywords: ['role', 'your part', 'team', 'timeline', 'how long', 'duration', 'status', 'did you', 'who built'],
      weight: 1,
      answer: () => `Role: ${project.role}\nTimeline: ${project.timeline}\nStatus: ${project.status}`,
    },
    {
      id: 'links',
      keywords: ['demo', 'code', 'github', 'repo', 'link', 'live', 'source', 'try it'],
      weight: 1,
      answer: () => {
        const real = (url?: string) => url && url !== '#'
        const parts = [
          real(project.repoUrl) ? `Code: ${project.repoUrl}` : '',
          real(project.liveUrl) ? `Live demo: ${project.liveUrl}` : '',
        ].filter(Boolean)
        return parts.length ? parts.join('\n') : 'The code and demo links are at the top of this page. Some projects are private; ask for a walkthrough via the contact section.'
      },
    },
  ]

  // Project-specific answers are more precise, so they score double.
  const specific: Intent[] = project.faq.map((f, i) => ({
    id: `faq-${i}`,
    keywords: f.keywords,
    weight: 2,
    answer: () => f.answer,
  }))

  return [...specific, ...general]
}

export function useProjectAssistant(project: Project) {
  const intents = buildIntents(project)
  const messages = ref<ChatMessage[]>([])
  const thinking = ref(false)
  const streaming = ref(false)
  const busy = computed(() => thinking.value || streaming.value)
  const asked = ref(new Set<string>())
  const reducedMotion = useReducedMotion()

  const allSuggestions: Suggestion[] = [
    { label: 'What problem does it solve?', intentId: 'overview' },
    { label: 'Walk me through the architecture', intentId: 'architecture' },
    { label: 'How does it work end to end?', intentId: 'flow' },
    ...project.faq.map((f, i) => ({ label: f.question, intentId: `faq-${i}` })),
    { label: 'Why this tech stack?', intentId: 'decisions' },
    { label: 'What was the hardest part?', intentId: 'challenges' },
    { label: 'What were the results?', intentId: 'results' },
  ]
  const suggestions = computed(() => allSuggestions.filter(s => !asked.value.has(s.intentId)).slice(0, 4))

  let nextId = 0
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const wait = (ms: number) => new Promise<void>((resolve) => {
    const t = setTimeout(() => {
      timers.delete(t)
      resolve()
    }, ms)
    timers.add(t)
  })

  function match(question: string): Intent | undefined {
    const text = ` ${normalize(question)} `
    let best: Intent | undefined
    let bestScore = 0
    for (const intent of intents) {
      const strong = intent.keywords.filter(k => text.includes(k)).length
      const weak = intent.weak?.filter(k => text.includes(k)).length ?? 0
      const score = strong * intent.weight + weak * 0.4
      if (score > bestScore) {
        best = intent
        bestScore = score
      }
    }
    // Weak phrases alone ("what is…") aren't enough — fall back instead of guessing.
    return bestScore >= 1 ? best : undefined
  }

  const fallback = () =>
    `I'm a scripted guide, so I can only answer questions about ${project.title}. Try asking about its architecture, how a request flows, the tech decisions, challenges or results.`

  async function respond(intent: Intent | undefined) {
    thinking.value = true
    await wait(reducedMotion.value ? 150 : 550 + Math.random() * 500)
    thinking.value = false

    const full = intent ? intent.answer() : fallback()
    if (intent) asked.value.add(intent.id)
    const message: ChatMessage = { id: nextId++, role: 'assistant', text: '' }
    messages.value.push(message)
    const live = messages.value.at(-1)! // reactive proxy of the pushed message

    if (reducedMotion.value) {
      live.text = full
    }
    else {
      streaming.value = true
      const tokens = full.split(/(\s+)/)
      for (let i = 0; i < tokens.length; i += 2) {
        live.text += tokens.slice(i, i + 2).join('')
        await wait(16 + Math.random() * 22)
      }
      streaming.value = false
    }
    if (intent?.section) live.section = intent.section
  }

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy.value) return
    messages.value.push({ id: nextId++, role: 'user', text: q })
    await respond(match(q))
  }

  async function askSuggestion(suggestion: Suggestion) {
    if (busy.value) return
    messages.value.push({ id: nextId++, role: 'user', text: suggestion.label })
    await respond(intents.find(i => i.id === suggestion.intentId))
  }

  function greet() {
    if (messages.value.length) return
    messages.value.push({
      id: nextId++,
      role: 'assistant',
      text: `Hi! I'm the Project Guide for ${project.title}. I can walk you through the architecture, the request flow, the tech decisions and the results. What would you like to know?`,
    })
  }

  onBeforeUnmount(() => timers.forEach(clearTimeout))

  return { messages, thinking, streaming, busy, suggestions, ask, askSuggestion, greet }
}
