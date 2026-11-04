<script setup lang="ts">
import { experience, profile, techStack } from '~/data/profile'

const title = `${profile.name} — ${profile.title} · Frontend, Backend & AI`
const description = profile.intro

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

// Structured data: tells search engines who this site is about.
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': profile.name,
  'jobTitle': profile.title,
  'description': profile.intro,
  'worksFor': { '@type': 'Organization', 'name': experience.company },
  'knowsAbout': techStack.flatMap(group => group.core),
  'sameAs': profile.socials.map(s => s.href).filter(isRealUrl),
  ...(isRealUrl(`mailto:${profile.email}`) && { email: `mailto:${profile.email}` }),
})
</script>

<template>
  <div>
    <HeroSection />
    <TechMarquee />
    <ExperienceSection />
    <TechStack />
    <FeaturedProjects />
    <ContactCta />
  </div>
</template>
