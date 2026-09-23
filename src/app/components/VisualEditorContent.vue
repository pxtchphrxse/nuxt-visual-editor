<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { sanitizeVisualContent } from '#visual-editor/sanitize'
import type { PublicVisualEditorConfig } from '../../options'

const TAGS = ['div', 'article', 'section', 'main', 'aside'] as const

const props = withDefaults(
  defineProps<{
    /** Saved visual-editor HTML. */
    html: string
    /** Skip sanitization for HTML that was already sanitized (for example on save). */
    trusted?: boolean
    /** Wrapper element. */
    tag?: (typeof TAGS)[number]
  }>(),
  { trusted: false, tag: 'div' },
)

const config = useRuntimeConfig().public.visualEditor as PublicVisualEditorConfig
const wrapper = computed(() => (TAGS.includes(props.tag) ? props.tag : 'div'))
const safeHtml = computed(() => (props.trusted ? props.html : sanitizeVisualContent(props.html)))
</script>

<template>
  <component :is="wrapper" :class="config.containerClass" v-html="safeHtml" />
</template>
