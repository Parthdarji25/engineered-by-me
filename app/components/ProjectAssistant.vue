<script setup lang="ts">
import type { Project } from '~/data/projects'

/**
 * Floating "Project Guide" chat. It looks and feels like an AI agent, but every
 * answer is scripted from the project data (see useProjectAssistant).
 */
const props = defineProps<{ project: Project }>()

const { messages, thinking, streaming, busy, suggestions, ask, askSuggestion, greet } = useProjectAssistant(props.project)

const isOpen = ref(false)
const draft = ref('')
const input = ref<HTMLInputElement>()
const launcher = ref<HTMLButtonElement>()
const log = ref<HTMLElement>()

function open() {
  isOpen.value = true
  greet()
  nextTick(() => input.value?.focus())
}

function close() {
  isOpen.value = false
  nextTick(() => launcher.value?.focus())
}

async function submit() {
  const question = draft.value
  draft.value = ''
  await ask(question)
}

const { scrollTo } = useSmoothScroll()

function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (el) scrollTo(el)
  // On phones the panel covers the page, so get out of the way.
  if (window.matchMedia('(max-width: 640px)').matches) close()
}

// Keep the newest message in view while answers stream in.
watch([() => messages.value.length, () => messages.value.at(-1)?.text, thinking], () => {
  nextTick(() => log.value?.scrollTo({ top: log.value.scrollHeight }))
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// Lets the page open the chat from its own buttons: assistant.value.open()
defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <div class="assistant">
      <Transition name="launcher">
        <button
          v-show="!isOpen"
          ref="launcher"
          type="button"
          class="launcher"
          aria-haspopup="dialog"
          aria-label="Ask about this project"
          @click="open"
        >
          <span class="launcher-icon"><AppIcon name="sparkles" :size="20" /></span>
          <span class="launcher-label">Ask about this project</span>
        </button>
      </Transition>

      <Transition name="panel">
        <section
          v-if="isOpen"
          class="panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
        >
          <header class="panel-head">
            <span class="avatar" aria-hidden="true"><AppIcon name="bot" :size="20" /></span>
            <div class="head-text">
              <p id="assistant-title" class="head-title">
                Project Guide
              </p>
              <p class="head-sub">
                <span class="status-dot" aria-hidden="true" />
                Scripted demo · not a live AI
              </p>
            </div>
            <button type="button" class="icon-btn" aria-label="Close project guide" @click="close">
              <AppIcon name="close" :size="18" />
            </button>
          </header>

          <div ref="log" class="log" role="log" aria-live="polite" aria-relevant="additions" data-lenis-prevent>
            <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
              <span v-if="m.role === 'assistant'" class="msg-avatar" aria-hidden="true">
                <AppIcon name="bot" :size="14" />
              </span>
              <div class="bubble">
                <p class="bubble-text">
                  {{ m.text }}<span
                    v-if="streaming && m === messages.at(-1) && m.role === 'assistant'"
                    class="cursor"
                    aria-hidden="true"
                  />
                </p>
                <button v-if="m.section" type="button" class="jump" @click="jumpTo(m.section.id)">
                  View {{ m.section.label }}
                  <AppIcon name="arrowDown" :size="14" />
                </button>
              </div>
            </div>

            <div v-if="thinking" class="msg assistant" aria-label="Guide is typing">
              <span class="msg-avatar" aria-hidden="true"><AppIcon name="bot" :size="14" /></span>
              <div class="bubble typing" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </div>

          <div v-if="suggestions.length" class="suggestions" aria-label="Suggested questions">
            <button
              v-for="s in suggestions"
              :key="s.intentId"
              type="button"
              class="suggestion"
              :disabled="busy"
              @click="askSuggestion(s)"
            >
              {{ s.label }}
            </button>
          </div>

          <form class="composer" @submit.prevent="submit">
            <label for="assistant-input" class="sr-only">Ask a question about {{ project.title }}</label>
            <input
              id="assistant-input"
              ref="input"
              v-model="draft"
              type="text"
              autocomplete="off"
              maxlength="200"
              placeholder="Ask about the architecture, stack…"
            >
            <button type="submit" class="send" :disabled="busy || !draft.trim()" aria-label="Send question">
              <AppIcon name="send" :size="18" />
            </button>
          </form>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.launcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px 8px 8px;
  border-radius: 999px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow), 0 0 0 6px color-mix(in srgb, var(--accent) 10%, transparent);
  font-weight: 600;
  font-size: 14.5px;
  transition: transform 0.25s var(--ease), box-shadow 0.25s;
}

.launcher:hover {
  transform: translateY(-3px);
}

.launcher-icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--gradient);
  color: #fff;
}

.launcher-icon::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--accent-2);
  animation: ring 2.4s var(--ease) infinite;
}

.panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 40px));
  height: min(600px, calc(100vh - var(--header-h) - 40px));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.55);
  overflow: hidden;
  transform-origin: bottom right;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent);
}

.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--gradient);
  color: #fff;
}

.head-text {
  flex: 1;
  min-width: 0;
}

.head-title {
  font-weight: 700;
  line-height: 1.2;
}

.head-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-dim);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--text-muted);
}

.icon-btn:hover {
  background: var(--surface-strong);
  color: var(--text);
}

.log {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.msg {
  display: flex;
  gap: 8px;
  max-width: 92%;
  animation: msg-in 0.35s var(--ease) both;
}

.msg.user {
  align-self: flex-end;
}

.msg-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  margin-top: 2px;
  border-radius: 8px;
  background: var(--surface-strong);
  color: var(--accent-2);
}

.bubble {
  padding: 10px 14px;
  border-radius: 16px 16px 16px 4px;
  background: var(--surface-strong);
  font-size: 14.5px;
  line-height: 1.55;
}

.msg.user .bubble {
  border-radius: 16px 16px 4px 16px;
  background: var(--gradient);
  color: #fff;
}

.bubble-text {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.cursor {
  display: inline-block;
  width: 7px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  border-radius: 2px;
  background: var(--accent-2);
  animation: blink 0.9s steps(1) infinite;
}

.jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-2);
}

.jump:hover {
  background: var(--surface);
}

.typing {
  display: flex;
  gap: 4px;
  padding: 14px;
}

.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-dim);
  animation: dot 1.2s ease-in-out infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

.suggestions {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.suggestions::-webkit-scrollbar {
  display: none;
}

.suggestion {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-muted);
  transition: color 0.2s, background-color 0.2s, opacity 0.2s;
}

.suggestion:hover:not(:disabled) {
  color: var(--text);
  background: var(--surface-strong);
}

.suggestion:disabled {
  opacity: 0.5;
  cursor: wait;
}

.composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border);
}

.composer input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 15px;
}

.composer input:focus {
  outline: none;
  border-color: var(--accent-2);
}

.send {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--gradient);
  color: #fff;
  transition: opacity 0.2s;
}

.send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Transitions */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.launcher-enter-active,
.launcher-leave-active {
  transition: opacity 0.25s, transform 0.25s var(--ease);
}

.launcher-enter-from,
.launcher-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes ring {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes dot {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }

  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* Phones: compact launcher and a bottom sheet */
@media (max-width: 640px) {
  .launcher {
    right: 16px;
    bottom: 16px;
    padding: 8px;
  }

  .launcher-label {
    display: none;
  }

  .panel {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: min(82svh, 640px);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: 0;
  }
}
</style>
