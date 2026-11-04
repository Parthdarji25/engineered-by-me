<script setup lang="ts">
import { profile } from '~/data/profile'

const { copied, copy } = useClipboard()
</script>

<template>
  <section id="contact" class="section" aria-labelledby="contact-title">
    <div class="container">
      <div v-reveal class="card cta glow-border is-always">
        <span class="ring r1" aria-hidden="true" />
        <span class="ring r2" aria-hidden="true" />

        <p class="eyebrow">
          Contact
        </p>
        <h2 id="contact-title">
          Have an idea? <span class="gradient-text">Let's build it.</span>
        </h2>
        <p class="lead">
          Whether it's a product, an AI feature or a role on your team, my inbox is open. I usually reply within a day or two.
        </p>

        <div class="actions">
          <a v-magnetic :href="`mailto:${profile.email}`" class="btn btn-primary">
            <AppIcon name="mail" :size="18" />
            Say hello
          </a>
          <button v-magnetic type="button" class="btn btn-ghost" @click="copy(profile.email)">
            <Transition name="swap" mode="out-in">
              <span v-if="copied" key="done" class="copy-label">
                <AppIcon name="check" :size="18" /> Copied!
              </span>
              <span v-else key="copy" class="copy-label">
                <AppIcon name="copy" :size="18" /> {{ profile.email }}
              </span>
            </Transition>
          </button>
        </div>
        <p class="sr-only" aria-live="polite">
          {{ copied ? 'Email address copied to clipboard' : '' }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  padding: clamp(40px, 7vw, 88px) clamp(24px, 6vw, 72px);
  text-align: center;
  background:
    radial-gradient(80% 120% at 50% 0%, var(--glow-1), transparent 60%),
    var(--surface);
}

.ring {
  position: absolute;
  left: 50%;
  top: 100%;
  border-radius: 50%;
  border: 1px solid var(--border);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.r1 {
  width: 520px;
  height: 520px;
}

.r2 {
  width: 820px;
  height: 820px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-2);
}

h2 {
  position: relative;
  margin-top: 16px;
  font-size: clamp(32px, 5.5vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.lead {
  position: relative;
  max-width: 560px;
  margin: 20px auto 0;
  color: var(--text-muted);
  font-size: clamp(16px, 1.7vw, 18px);
}

.actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

.actions .btn-ghost {
  max-width: 100%;
}

.copy-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
}

.actions .btn:hover svg {
  transform: none;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.2s, transform 0.2s var(--ease);
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 480px) {
  .actions .btn {
    flex: 1 1 100%;
  }
}
</style>
