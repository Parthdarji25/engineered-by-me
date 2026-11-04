// ─────────────────────────────────────────────────────────────────────────────
// Project case studies. Each entry powers a card on the homepage AND a full
// page at /projects/<slug> (architecture, request flows, decisions, results)
// plus the scripted answers of the "Project Guide" chat on that page.
//
//  TODO  These three projects are SAMPLE content. Replace them with your own
//  work — especially `outcomes`, which should only contain real numbers.
// ─────────────────────────────────────────────────────────────────────────────

export interface ArchNode {
  id: string
  name: string
  tech: string
  description: string
}

export interface ArchLayer {
  name: string
  nodes: ArchNode[]
}

export interface FlowStep {
  title: string
  description: string
  /** Ids of the ArchNodes this step touches — highlighted in the diagram. */
  nodes: string[]
}

export interface Flow {
  name: string
  steps: FlowStep[]
}

export interface ProjectFaq {
  question: string
  answer: string
  /** Words that route a typed question to this answer. */
  keywords: string[]
}

export interface Project {
  slug: string
  title: string
  category: string
  summary: string
  tags: string[]
  /** Two colours used for the generated cover art. */
  palette: [string, string]
  repoUrl?: string
  liveUrl?: string

  role: string
  timeline: string
  status: string
  problem: string
  solution: string
  features: { title: string, description: string }[]
  architecture: ArchLayer[]
  flows: Flow[]
  decisions: { choice: string, reason: string }[]
  challenges: { title: string, problem: string, solution: string }[]
  outcomes: { value: string, label: string }[]
  learnings: string[]
  faq: ProjectFaq[]
}

export const projects: Project[] = [
  // ── 1 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'documind',
    title: 'DocuMind — RAG Knowledge Assistant',
    category: 'Generative AI',
    summary: 'Chat with internal documents. Hybrid search over a vector store, cited answers, and an evaluation suite that catches regressions before release.',
    tags: ['Nuxt', 'FastAPI', 'pgvector', 'LLM'],
    palette: ['#8b5cf6', '#22d3ee'],
    repoUrl: '#',
    liveUrl: '#',

    role: 'Full-stack & AI engineer (solo)',
    timeline: '10 weeks',
    status: 'In production',
    problem: 'Teams lost hours searching wikis, PDFs and old tickets. Keyword search missed paraphrased questions, and generic chatbots answered confidently without sources, so nobody trusted them.',
    solution: 'A retrieval-augmented assistant that only answers from company documents, shows the exact passages it used, and says "I don\'t know" when retrieval confidence is low. An offline evaluation suite runs on every change to prompts, chunking or models.',
    features: [
      { title: 'Cited answers', description: 'Every claim links to the source passage; clicking a citation opens the document at that chunk.' },
      { title: 'Hybrid retrieval', description: 'BM25 keyword search and vector similarity are merged, then re-ranked, so both exact terms and paraphrases are found.' },
      { title: 'Streaming UI', description: 'Tokens stream over Server-Sent Events, so the first words appear in under a second.' },
      { title: 'Eval dashboard', description: 'Golden question sets score faithfulness and answer relevance for each release, blocking regressions in CI.' },
    ],
    architecture: [
      {
        name: 'Client',
        nodes: [
          { id: 'web', name: 'Chat UI', tech: 'Nuxt · Vue 3', description: 'Streaming chat with a citations side panel, feedback buttons and conversation history.' },
          { id: 'admin', name: 'Admin console', tech: 'Nuxt', description: 'Upload and re-index documents, manage access groups and review evaluation runs.' },
        ],
      },
      {
        name: 'API',
        nodes: [
          { id: 'gateway', name: 'API gateway', tech: 'FastAPI', description: 'Authentication, per-user rate limits, request validation and SSE streaming back to the browser.' },
        ],
      },
      {
        name: 'AI services',
        nodes: [
          { id: 'ingest', name: 'Ingestion worker', tech: 'Python · Celery', description: 'Parses PDFs, HTML and Markdown, splits them into overlapping chunks and creates embeddings in batches.' },
          { id: 'retriever', name: 'Hybrid retriever', tech: 'BM25 + vectors · reranker', description: 'Runs keyword and vector search in parallel, fuses the results and re-ranks the top 30 down to the best 6.' },
          { id: 'llm', name: 'LLM orchestrator', tech: 'Prompt templates · guardrails', description: 'Builds the prompt from the chunks, asks the model to cite sources, and refuses when the context is too weak.' },
          { id: 'evals', name: 'Eval runner', tech: 'Python · CI', description: 'Replays golden questions and scores faithfulness and relevance for every release.' },
        ],
      },
      {
        name: 'Data',
        nodes: [
          { id: 'pg', name: 'PostgreSQL + pgvector', tech: 'Postgres 16', description: 'Stores chunks, embeddings, metadata, permissions and chat logs in one database.' },
          { id: 'storage', name: 'Object storage', tech: 'S3-compatible', description: 'Keeps the original files so citations can open the exact page.' },
          { id: 'redis', name: 'Redis', tech: 'Cache · queue', description: 'Caches frequent answers and embeddings, and acts as the job queue for ingestion.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Ask a question',
        steps: [
          { title: 'User asks', description: 'The question is sent from the chat UI with the user\'s session token.', nodes: ['web', 'gateway'] },
          { title: 'Check cache & auth', description: 'The gateway verifies access groups and checks Redis for a recent identical answer.', nodes: ['gateway', 'redis'] },
          { title: 'Hybrid search', description: 'Keyword and vector search run in parallel, filtered to documents the user may see.', nodes: ['retriever', 'pg'] },
          { title: 'Re-rank & build prompt', description: 'The best 6 chunks are re-ranked and placed into a prompt that requires citations.', nodes: ['retriever', 'llm'] },
          { title: 'Stream the answer', description: 'Tokens stream back through the gateway; citations render as they arrive.', nodes: ['llm', 'gateway', 'web'] },
          { title: 'Log for evaluation', description: 'The question, sources and user feedback are stored to grow the evaluation set.', nodes: ['evals', 'pg'] },
        ],
      },
      {
        name: 'Ingest a document',
        steps: [
          { title: 'Upload', description: 'An admin uploads a file; the original is saved to object storage.', nodes: ['admin', 'gateway', 'storage'] },
          { title: 'Queue a job', description: 'The gateway puts an ingestion job on the Redis queue and returns immediately.', nodes: ['gateway', 'redis'] },
          { title: 'Parse & chunk', description: 'The worker extracts text, keeps headings as context and splits it into overlapping chunks.', nodes: ['ingest', 'storage'] },
          { title: 'Embed & index', description: 'Chunks are embedded in batches and written to pgvector with their permissions.', nodes: ['ingest', 'pg'] },
        ],
      },
    ],
    decisions: [
      { choice: 'pgvector instead of a separate vector database', reason: 'One database for text, vectors and permissions means one backup, one security model, and permission filtering inside the same SQL query.' },
      { choice: 'Hybrid search + re-ranking', reason: 'Pure vector search missed product codes and acronyms; adding BM25 and a re-ranker fixed those without losing paraphrase matching.' },
      { choice: 'Server-Sent Events for streaming', reason: 'One-way streaming is all a chat answer needs; SSE works through proxies and is simpler than WebSockets.' },
      { choice: 'Evaluation in CI', reason: 'Prompt and chunking changes can silently make answers worse; a failing score blocks the merge.' },
    ],
    challenges: [
      { title: 'Confident wrong answers', problem: 'Early versions answered even when retrieval found nothing relevant.', solution: 'Added a relevance threshold after re-ranking and a prompt rule to answer "I don\'t know" with the closest documents instead.' },
      { title: 'Tables and PDFs', problem: 'Chunking split tables mid-row, so numbers lost their headers.', solution: 'Tables are extracted as whole units and converted to Markdown, with the section heading prepended to each chunk.' },
      { title: 'Document permissions', problem: 'Users must never see answers built from documents they cannot open.', solution: 'Access groups are stored on every chunk and applied as a SQL filter before similarity ranking.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: '< 1s', label: 'Time to first token' },
      { value: '6', label: 'Sources cited per answer (max)' },
      { value: '100%', label: 'Answers with citations' },
    ],
    learnings: [
      'Retrieval quality matters more than the model: most bad answers traced back to bad chunks.',
      'An evaluation set is the most valuable asset in an LLM project; build it on day one.',
      'Showing sources is what turns a demo into a tool people trust.',
    ],
    faq: [
      { question: 'How do you stop hallucinations?', keywords: ['hallucinat', 'wrong', 'trust', 'accura', 'guardrail'], answer: 'Three layers: answers may only use retrieved passages, every claim must carry a citation, and if the re-ranked chunks fall below a relevance threshold the assistant says it doesn\'t know and suggests the closest documents instead.' },
      { question: 'Why pgvector?', keywords: ['pgvector', 'vector', 'database', 'postgres', 'pinecone'], answer: 'Keeping vectors next to the text, metadata and permissions in PostgreSQL means permission filtering happens in the same query as similarity search, and there is only one database to secure and back up.' },
      { question: 'How is quality measured?', keywords: ['eval', 'measure', 'quality', 'test', 'metric'], answer: 'A golden set of real questions with expected sources is replayed in CI. Each run scores faithfulness (is every claim supported?) and relevance. A drop below the baseline blocks the merge.' },
    ],
  },

  // ── 2 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'agent-flow',
    title: 'Agent Flow — Workflow Automation',
    category: 'AI Engineering',
    summary: 'Multi-step agents that plan, call tools and hand off to a human when unsure, with a trace of every decision.',
    tags: ['TypeScript', 'Node.js', 'Redis', 'Queues'],
    palette: ['#f472b6', '#8b5cf6'],
    repoUrl: '#',

    role: 'Backend & AI engineer',
    timeline: '8 weeks',
    status: 'Internal beta',
    problem: 'Operations teams repeated the same multi-step tasks across tools every day: reading a request, looking up records, updating systems and replying. Simple scripts broke whenever the input varied.',
    solution: 'An orchestration engine where an LLM planner turns a goal into steps, a tool executor runs each step with retries and timeouts, and any low-confidence or risky step pauses for a human to approve. Every run is fully traced.',
    features: [
      { title: 'Goal → plan', description: 'The planner breaks a request into typed tool calls that are validated against JSON schemas before running.' },
      { title: 'Human in the loop', description: 'Risky actions (payments, deletes, external emails) always wait in a review inbox for approval.' },
      { title: 'Durable execution', description: 'Each step is a queued job, so runs survive restarts and failed steps retry with backoff.' },
      { title: 'Full trace', description: 'Every prompt, tool input and output is recorded as a span, so any decision can be replayed and explained.' },
    ],
    architecture: [
      {
        name: 'Client',
        nodes: [
          { id: 'builder', name: 'Workflow builder', tech: 'Vue 3', description: 'Define triggers, allowed tools and approval rules for each workflow.' },
          { id: 'inbox', name: 'Review inbox', tech: 'Vue 3', description: 'Shows paused steps with the agent\'s reasoning so a person can approve, edit or reject.' },
        ],
      },
      {
        name: 'API',
        nodes: [
          { id: 'api', name: 'Workflow API', tech: 'Node.js · TypeScript', description: 'Workflow CRUD, webhook triggers, run status and approval endpoints.' },
        ],
      },
      {
        name: 'Orchestration',
        nodes: [
          { id: 'planner', name: 'Planner', tech: 'LLM · JSON schema', description: 'Turns a goal and context into an ordered list of tool calls with validated arguments.' },
          { id: 'executor', name: 'Tool executor', tech: 'Sandboxed workers', description: 'Runs one tool call at a time with timeouts, retries and idempotency keys.' },
          { id: 'hitl', name: 'Approval gate', tech: 'Policy rules', description: 'Pauses any step that is risky or below the confidence threshold and notifies a reviewer.' },
        ],
      },
      {
        name: 'Infrastructure',
        nodes: [
          { id: 'queue', name: 'Job queue', tech: 'Redis · BullMQ', description: 'Durable queue for every step, with retries, backoff and concurrency limits.' },
          { id: 'db', name: 'PostgreSQL', tech: 'Runs · steps', description: 'Stores workflow definitions, runs, step results and approvals.' },
          { id: 'tracing', name: 'Tracing', tech: 'OpenTelemetry', description: 'One trace per run; one span per prompt and tool call.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Run a workflow',
        steps: [
          { title: 'Trigger', description: 'A webhook or schedule starts a run; the API stores it and queues the first job.', nodes: ['api', 'db', 'queue'] },
          { title: 'Plan', description: 'The planner reads the goal and context and returns validated tool calls.', nodes: ['planner', 'db'] },
          { title: 'Execute steps', description: 'Each tool call runs as its own queued job with retries.', nodes: ['executor', 'queue'] },
          { title: 'Pause if risky', description: 'A risky or low-confidence step is held and appears in the review inbox.', nodes: ['hitl', 'inbox'] },
          { title: 'Approve & finish', description: 'Approval resumes the run; results and the full trace are saved.', nodes: ['inbox', 'api', 'executor', 'tracing'] },
        ],
      },
    ],
    decisions: [
      { choice: 'Queue per step, not per run', reason: 'A crash mid-run only retries the failed step; completed steps are never repeated.' },
      { choice: 'Schema-validated tool calls', reason: 'Invalid arguments are rejected before anything runs, and the planner gets the error to fix its plan.' },
      { choice: 'Explicit approval policy', reason: 'Which actions need a human is written as rules, not left to the model to decide.' },
    ],
    challenges: [
      { title: 'Duplicate side effects', problem: 'Retries sometimes sent the same email twice.', solution: 'Every tool call carries an idempotency key; tools check it before acting.' },
      { title: 'Long-running plans drifting', problem: 'Plans made at the start became wrong after unexpected tool results.', solution: 'The planner re-plans after each step using the latest results, with a hard cap on total steps.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: '0', label: 'Risky actions without approval' },
      { value: '100%', label: 'Runs with a full trace' },
      { value: '3×', label: 'Retries with backoff per step' },
    ],
    learnings: [
      'Agents are distributed systems first and AI second: queues, retries and idempotency matter most.',
      'Tracing every decision is what makes an agent debuggable and trustworthy.',
    ],
    faq: [
      { question: 'When does it ask a human?', keywords: ['human', 'approv', 'review', 'safe', 'risk'], answer: 'Two cases: any action on the policy list (payments, deletes, external emails) always waits for approval, and any step where the planner\'s confidence is below the threshold is paused with its reasoning shown in the review inbox.' },
      { question: 'What if a step fails?', keywords: ['fail', 'error', 'retry', 'crash'], answer: 'Each step is its own queued job. It retries up to 3 times with exponential backoff; idempotency keys stop duplicate side effects. If it still fails, the planner gets the error and can re-plan or escalate to a human.' },
    ],
  },

  // ── 3 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'pulse',
    title: 'Pulse — Realtime Analytics',
    category: 'Full Stack',
    summary: 'Live product metrics streamed over WebSockets into an interactive, keyboard-accessible dashboard.',
    tags: ['Vue 3', 'WebSockets', 'PostgreSQL', 'Docker'],
    palette: ['#22d3ee', '#34d399'],
    repoUrl: '#',
    liveUrl: '#',

    role: 'Full-stack engineer',
    timeline: '6 weeks',
    status: 'Shipped',
    problem: 'Product teams waited for a nightly batch job to see how a release was doing, so problems were found hours after users hit them.',
    solution: 'An event pipeline that aggregates metrics in rolling windows and pushes only the changes to open dashboards over WebSockets, with threshold alerts when a metric moves out of range.',
    features: [
      { title: 'Live charts', description: 'Charts update in place a few times per second without reloading or flicker.' },
      { title: 'Rolling windows', description: '1-minute, 5-minute and 1-hour aggregates are kept in memory and saved to Postgres.' },
      { title: 'Threshold alerts', description: 'Rules like "error rate above 2% for 5 minutes" raise an alert in the dashboard.' },
      { title: 'Accessible dashboard', description: 'Every chart has a data table view, and filters work fully with the keyboard.' },
    ],
    architecture: [
      {
        name: 'Client',
        nodes: [
          { id: 'dashboard', name: 'Dashboard', tech: 'Vue 3 · Pinia', description: 'Charts, filters and saved views; applies small updates from the socket to reactive state.' },
          { id: 'alerts-ui', name: 'Alerts panel', tech: 'Vue 3', description: 'Shows active alerts with the metric history that triggered them.' },
        ],
      },
      {
        name: 'Edge',
        nodes: [
          { id: 'ingest', name: 'Ingest API', tech: 'Node.js', description: 'Receives batched events from app SDKs, validates them and publishes them.' },
          { id: 'ws', name: 'WebSocket gateway', tech: 'ws · Node.js', description: 'Keeps dashboard connections open and pushes only the metrics each one subscribed to.' },
        ],
      },
      {
        name: 'Processing',
        nodes: [
          { id: 'aggregator', name: 'Stream aggregator', tech: 'Node.js workers', description: 'Updates rolling window counts and percentiles for every incoming event.' },
          { id: 'alerts', name: 'Alert engine', tech: 'Rules', description: 'Checks each updated metric against threshold rules.' },
        ],
      },
      {
        name: 'Data',
        nodes: [
          { id: 'pubsub', name: 'Redis Pub/Sub', tech: 'Redis', description: 'Fans events and metric updates out between services.' },
          { id: 'timeseries', name: 'PostgreSQL', tech: 'Partitioned tables', description: 'Stores aggregates in time-partitioned tables for history and charts.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Event to chart',
        steps: [
          { title: 'Event arrives', description: 'An app SDK sends a batch of events; the ingest API validates them.', nodes: ['ingest'] },
          { title: 'Publish', description: 'Valid events are published to Redis for every consumer.', nodes: ['ingest', 'pubsub'] },
          { title: 'Aggregate', description: 'The aggregator updates rolling windows and saves them every few seconds.', nodes: ['aggregator', 'pubsub', 'timeseries'] },
          { title: 'Push the change', description: 'The WebSocket gateway sends only the changed values to subscribed dashboards.', nodes: ['ws', 'pubsub'] },
          { title: 'Update the chart', description: 'The dashboard patches its reactive store; the chart redraws just the new point.', nodes: ['dashboard'] },
          { title: 'Alert if needed', description: 'If a rule is breached, the alert engine raises an alert in the panel.', nodes: ['alerts', 'alerts-ui'] },
        ],
      },
    ],
    decisions: [
      { choice: 'Push deltas, not full datasets', reason: 'Sending only changed points keeps messages tiny and the UI smooth, even with many charts open.' },
      { choice: 'PostgreSQL with time partitions', reason: 'Good enough for this volume, familiar to the team, and old partitions can be dropped instantly.' },
      { choice: 'WebSockets over polling', reason: 'Updates arrive the moment they happen without hundreds of empty polling requests.' },
    ],
    challenges: [
      { title: 'Chart jank', problem: 'Frequent updates made charts stutter on laptops.', solution: 'Updates are batched per animation frame, and only the new points are drawn.' },
      { title: 'Reconnects', problem: 'Dashboards showed gaps after a network blip.', solution: 'On reconnect the client sends its last timestamp and the gateway replays what was missed.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: 'Seconds', label: 'From event to chart (was next day)' },
      { value: '3', label: 'Rolling window sizes' },
      { value: 'AA', label: 'WCAG contrast target' },
    ],
    learnings: [
      'Real-time is mostly about sending less: deltas, batching and subscriptions.',
      'Always design the reconnect path — networks drop more often than you think.',
    ],
    faq: [
      { question: 'Why WebSockets?', keywords: ['websocket', 'socket', 'realtime', 'real-time', 'polling', 'sse'], answer: 'Dashboards need updates the moment metrics change. WebSockets keep one connection open and push only changed values, instead of hundreds of polling requests that mostly return nothing.' },
      { question: 'How do charts stay smooth?', keywords: ['smooth', 'performance', 'jank', 'fast', 'chart'], answer: 'Incoming updates are batched once per animation frame and only new points are drawn, so the chart never redraws the whole dataset.' },
    ],
  },

  // ── 4 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'scribe',
    title: 'Scribe — AI Meeting Notes',
    category: 'Generative AI',
    summary: 'Upload a meeting recording and get a transcript, a structured summary and assigned action items in minutes.',
    tags: ['Nuxt', 'Python', 'Whisper', 'LLM'],
    palette: ['#f59e0b', '#f472b6'],
    repoUrl: '#',
    liveUrl: '#',

    role: 'Full-stack & AI engineer',
    timeline: '5 weeks',
    status: 'Side project',
    problem: 'Notes from long meetings were incomplete or never written, so decisions and owners got lost between teams.',
    solution: 'A pipeline that transcribes audio with speaker labels, splits the transcript into topics, and asks an LLM for a summary, decisions and action items in a strict JSON format that the UI renders and lets people edit.',
    features: [
      { title: 'Speaker-aware transcripts', description: 'Each line is labelled with its speaker and timestamp, and clicking it jumps the audio player there.' },
      { title: 'Structured summaries', description: 'Summary, decisions and action items come back as validated JSON, never free-form text.' },
      { title: 'Editable action items', description: 'Owners and due dates can be corrected before the notes are shared.' },
      { title: 'Progress updates', description: 'Long recordings show live progress while each processing step runs in the background.' },
    ],
    architecture: [
      {
        name: 'Client',
        nodes: [
          { id: 'app', name: 'Notes app', tech: 'Nuxt · Vue 3', description: 'Upload recordings, follow progress, and read or edit the transcript, summary and action items.' },
        ],
      },
      {
        name: 'API',
        nodes: [
          { id: 'api', name: 'API', tech: 'FastAPI', description: 'Issues upload URLs, creates jobs and streams job progress to the browser.' },
        ],
      },
      {
        name: 'Processing',
        nodes: [
          { id: 'transcribe', name: 'Transcriber', tech: 'Whisper · diarisation', description: 'Turns audio into timestamped text and labels who is speaking.' },
          { id: 'segment', name: 'Topic splitter', tech: 'Embeddings', description: 'Splits long transcripts into topic chunks that fit the model\'s context window.' },
          { id: 'summarise', name: 'Summariser', tech: 'LLM · JSON schema', description: 'Produces the summary, decisions and action items, validated against a schema.' },
        ],
      },
      {
        name: 'Data',
        nodes: [
          { id: 'storage', name: 'Object storage', tech: 'S3-compatible', description: 'Holds the uploaded audio files.' },
          { id: 'queue', name: 'Job queue', tech: 'Redis', description: 'Runs each processing step as a background job with retries.' },
          { id: 'db', name: 'PostgreSQL', tech: 'Postgres', description: 'Stores transcripts, summaries and action items.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Process a recording',
        steps: [
          { title: 'Upload', description: 'The browser uploads the audio straight to storage using a signed URL from the API.', nodes: ['app', 'api', 'storage'] },
          { title: 'Queue the job', description: 'The API creates a job and puts the first step on the queue.', nodes: ['api', 'queue', 'db'] },
          { title: 'Transcribe', description: 'The transcriber produces timestamped, speaker-labelled text.', nodes: ['transcribe', 'storage', 'queue'] },
          { title: 'Split by topic', description: 'The transcript is cut into topic chunks.', nodes: ['segment'] },
          { title: 'Summarise', description: 'Each chunk is summarised, then merged into one validated JSON result.', nodes: ['summarise', 'db'] },
          { title: 'Show the notes', description: 'The app receives the finished notes and renders them for editing.', nodes: ['api', 'app'] },
        ],
      },
    ],
    decisions: [
      { choice: 'Direct-to-storage uploads', reason: 'Large audio files never pass through the API server, so it stays small and fast.' },
      { choice: 'Strict JSON output', reason: 'Validating the model\'s output against a schema makes the UI reliable and lets bad responses be retried automatically.' },
      { choice: 'Topic chunking before summarising', reason: 'Summarising per topic keeps long meetings within the context window and improves accuracy.' },
    ],
    challenges: [
      { title: 'Two-hour meetings', problem: 'Very long transcripts exceeded the model\'s context window.', solution: 'Topic chunks are summarised separately, then a final pass merges them.' },
      { title: 'Made-up owners', problem: 'The model sometimes assigned action items to people who never spoke.', solution: 'Owners must match a detected speaker name; anything else is left blank for a person to fill in.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: 'Minutes', label: 'From upload to shareable notes' },
      { value: '100%', label: 'Summaries validated against a schema' },
      { value: '3', label: 'Outputs: summary, decisions, actions' },
    ],
    learnings: [
      'Structured output turns an LLM from a text generator into a dependable API.',
      'Long-running AI work needs visible progress, or users assume it is broken.',
    ],
    faq: [
      { question: 'How are action items extracted?', keywords: ['action', 'task', 'owner', 'extract'], answer: 'The summariser is asked for action items in a strict JSON schema: task, owner and optional due date. The owner must match a speaker found in the transcript; otherwise it is left blank for a person to fill in.' },
      { question: 'How do you handle long recordings?', keywords: ['long', 'hour', 'context', 'length', 'chunk'], answer: 'The transcript is split into topic chunks using embeddings, each chunk is summarised on its own, and a final pass merges them into one set of notes.' },
    ],
  },

  // ── 5 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'canvas-ui',
    title: 'Canvas UI — Vue Design System',
    category: 'Frontend',
    summary: 'An accessible, themeable component library with design tokens, documentation and visual regression tests.',
    tags: ['Vue 3', 'TypeScript', 'Storybook', 'Vite'],
    palette: ['#6366f1', '#22d3ee'],
    repoUrl: '#',
    liveUrl: '#',

    role: 'Frontend engineer',
    timeline: '8 weeks',
    status: 'Used in 3 apps',
    problem: 'Several product teams rebuilt the same buttons, forms and dialogs in slightly different ways, so the apps looked inconsistent and accessibility bugs kept coming back.',
    solution: 'A shared Vue 3 component library built on design tokens, with every component documented in Storybook, tested for accessibility, and protected by screenshot tests before release.',
    features: [
      { title: 'Design tokens', description: 'Colours, spacing and typography are defined once and themed with CSS variables, including dark mode.' },
      { title: 'Accessible by default', description: 'Keyboard support, focus management and ARIA are built into every interactive component.' },
      { title: 'Living docs', description: 'Storybook shows every component and state, with usage notes and copyable code.' },
      { title: 'Safe releases', description: 'Screenshot and accessibility checks run on every pull request before a version is published.' },
    ],
    architecture: [
      {
        name: 'Sources',
        nodes: [
          { id: 'tokens', name: 'Design tokens', tech: 'JSON', description: 'The single source for colours, spacing, radius and type scale.' },
          { id: 'components', name: 'Components', tech: 'Vue 3 · TypeScript', description: 'Buttons, inputs, dialogs, menus and more, written as typed single-file components.' },
        ],
      },
      {
        name: 'Build',
        nodes: [
          { id: 'build', name: 'Library build', tech: 'Vite library mode', description: 'Bundles tree-shakeable ES modules, type definitions and the theme CSS.' },
          { id: 'docs', name: 'Docs site', tech: 'Storybook', description: 'Interactive documentation for every component and state.' },
        ],
      },
      {
        name: 'Quality',
        nodes: [
          { id: 'unit', name: 'Unit tests', tech: 'Vitest', description: 'Check props, events and keyboard behaviour.' },
          { id: 'visual', name: 'Visual tests', tech: 'Screenshots · axe', description: 'Compare screenshots and run accessibility audits on every story.' },
        ],
      },
      {
        name: 'Delivery',
        nodes: [
          { id: 'ci', name: 'CI pipeline', tech: 'GitHub Actions', description: 'Runs every check on each pull request and publishes on release.' },
          { id: 'registry', name: 'Package registry', tech: 'npm', description: 'Versioned package that product apps install and upgrade.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Ship a component change',
        steps: [
          { title: 'Change a component', description: 'A developer updates a component and its story.', nodes: ['components', 'docs'] },
          { title: 'Open a pull request', description: 'CI builds the library and the docs.', nodes: ['ci', 'build', 'docs'] },
          { title: 'Run the checks', description: 'Unit tests, screenshot comparisons and accessibility audits run.', nodes: ['ci', 'unit', 'visual'] },
          { title: 'Release', description: 'After merge, a new version is published to the registry.', nodes: ['ci', 'registry'] },
        ],
      },
    ],
    decisions: [
      { choice: 'CSS variables for theming', reason: 'Themes and dark mode switch at runtime without rebuilding or shipping extra JavaScript.' },
      { choice: 'Tree-shakeable exports', reason: 'Apps only bundle the components they actually import.' },
      { choice: 'Screenshot tests in CI', reason: 'A one-pixel regression in a shared button would reach every app, so visual changes need explicit approval.' },
    ],
    challenges: [
      { title: 'Accessible dialogs', problem: 'Focus escaped modals and screen readers kept reading the page behind them.', solution: 'Dialogs trap focus, restore it on close and mark the rest of the page as inert.' },
      { title: 'Breaking changes', problem: 'Prop renames broke product apps on upgrade.', solution: 'Deprecated props keep working with a console warning for one major version, with a written migration guide.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: '3', label: 'Product apps using it' },
      { value: 'WCAG AA', label: 'Accessibility target' },
      { value: '100%', label: 'Components documented' },
    ],
    learnings: [
      'A design system is a product: its users are developers, and docs are its UI.',
      'Accessibility is far cheaper to build into shared components than to fix in every app.',
    ],
    faq: [
      { question: 'How is theming done?', keywords: ['theme', 'dark', 'token', 'color', 'colour'], answer: 'Design tokens are compiled into CSS variables. A theme is just a different set of variable values, so light, dark or brand themes switch at runtime without rebuilding.' },
      { question: 'How do you prevent regressions?', keywords: ['regression', 'test', 'break', 'screenshot', 'visual'], answer: 'Every story is screenshot-tested and audited for accessibility in CI. Any visual difference must be approved before the pull request can merge.' },
    ],
  },

  // ── 6 ─────────────────────────────────────────────────────────────────────
  {
    slug: 'lens',
    title: 'Lens — Semantic Image Search',
    category: 'AI Engineering',
    summary: 'Search a large photo library by describing what you want to see, powered by multimodal embeddings.',
    tags: ['Vue 3', 'Python', 'CLIP', 'Qdrant'],
    palette: ['#10b981', '#6366f1'],
    repoUrl: '#',

    role: 'AI & backend engineer',
    timeline: '6 weeks',
    status: 'Prototype',
    problem: 'Finding a specific photo in a library of thousands meant scrolling or relying on tags that nobody had filled in.',
    solution: 'Every image is turned into an embedding with a multimodal model, so a text query like "team on a stage with blue lights" is matched by meaning, with optional filters for date and album.',
    features: [
      { title: 'Search by description', description: 'Plain-language queries find images by what is in them, no tags required.' },
      { title: 'Similar images', description: 'Pick any photo to find others that look alike.' },
      { title: 'Filters', description: 'Combine meaning with filters for date, album or camera.' },
      { title: 'Fast results', description: 'An approximate nearest-neighbour index keeps searches quick as the library grows.' },
    ],
    architecture: [
      {
        name: 'Client',
        nodes: [
          { id: 'ui', name: 'Search UI', tech: 'Vue 3', description: 'Search box, filters and an infinite-scrolling results grid.' },
        ],
      },
      {
        name: 'API',
        nodes: [
          { id: 'api', name: 'Search API', tech: 'FastAPI', description: 'Turns queries into embeddings and runs filtered vector searches.' },
        ],
      },
      {
        name: 'AI',
        nodes: [
          { id: 'encoder', name: 'Embedding model', tech: 'CLIP', description: 'Maps both images and text into the same vector space.' },
          { id: 'indexer', name: 'Indexing worker', tech: 'Python · batches', description: 'Embeds new images in batches and writes them to the index.' },
        ],
      },
      {
        name: 'Data',
        nodes: [
          { id: 'vectors', name: 'Vector database', tech: 'Qdrant', description: 'Stores image embeddings with their metadata for filtered search.' },
          { id: 'images', name: 'Image storage', tech: 'S3-compatible', description: 'Holds the original photos and generated thumbnails.' },
        ],
      },
    ],
    flows: [
      {
        name: 'Search by text',
        steps: [
          { title: 'Type a query', description: 'The user describes the image and picks any filters.', nodes: ['ui', 'api'] },
          { title: 'Embed the query', description: 'The text is converted to a vector with the same model used for images.', nodes: ['api', 'encoder'] },
          { title: 'Vector search', description: 'The closest image vectors are found, filtered by metadata.', nodes: ['api', 'vectors'] },
          { title: 'Show results', description: 'Thumbnails load from storage in a scrolling grid.', nodes: ['ui', 'images'] },
        ],
      },
      {
        name: 'Index new photos',
        steps: [
          { title: 'Upload', description: 'New photos land in storage.', nodes: ['images'] },
          { title: 'Embed in batches', description: 'The worker embeds new images in batches.', nodes: ['indexer', 'encoder', 'images'] },
          { title: 'Write to the index', description: 'Vectors and metadata are stored for search.', nodes: ['indexer', 'vectors'] },
        ],
      },
    ],
    decisions: [
      { choice: 'One model for text and images', reason: 'CLIP puts both in the same vector space, so text-to-image and image-to-image search use the same index.' },
      { choice: 'Dedicated vector database', reason: 'Qdrant handles fast approximate search with metadata filters, which this workload relies on.' },
      { choice: 'Batch indexing', reason: 'Embedding images in batches uses the model far more efficiently than one at a time.' },
    ],
    challenges: [
      { title: 'Vague queries', problem: 'Short queries like "dog" returned loosely related results.', solution: 'Queries are expanded with a simple prompt template ("a photo of …"), which improved matches.' },
      { title: 'Filters vs relevance', problem: 'Filtering after search sometimes left too few results.', solution: 'Filters are applied inside the vector search itself instead of afterwards.' },
    ],
    outcomes: [ // TODO replace with real results
      { value: '0', label: 'Manual tags needed' },
      { value: '2', label: 'Search modes: text and similar image' },
      { value: 'Batch', label: 'Indexing for new uploads' },
    ],
    learnings: [
      'Embeddings make "search by meaning" surprisingly simple once the pipeline is right.',
      'Filtering belongs inside the vector query, not after it.',
    ],
    faq: [
      { question: 'How does text find images?', keywords: ['clip', 'embedding', 'text', 'image', 'how'], answer: 'CLIP maps text and images into the same vector space. The query is embedded and the images whose vectors are closest in meaning are returned.' },
      { question: 'Why Qdrant?', keywords: ['qdrant', 'vector', 'database', 'index'], answer: 'It offers fast approximate nearest-neighbour search with metadata filters applied during the search, which keeps results relevant when users filter by date or album.' },
    ],
  },
]

export const findProject = (slug: string) => projects.find(p => p.slug === slug)
