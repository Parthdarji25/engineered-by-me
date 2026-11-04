<script setup lang="ts">
import { icons, type IconName } from '~/utils/icons'

const props = withDefaults(defineProps<{
  name: IconName
  size?: number
}>(), {
  size: 20,
})

const shapes = computed(() => icons[props.name])
</script>

<template>
  <svg
    :width="size"
    :height="size" 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component :is="shape.tag" v-for="(shape, i) in shapes" :key="i" v-bind="shape.attrs" />
  </svg>
</template>
