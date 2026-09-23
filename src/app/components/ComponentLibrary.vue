<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditor, type ComponentDefinition } from '../context'

const props = defineProps<{ components: ComponentDefinition[]; categories: string[] }>()
const editor = useEditor()
const active = ref(props.categories[0] ?? '')

watch(
  () => props.categories,
  (categories) => {
    if (!categories.includes(active.value)) active.value = categories[0] ?? ''
  },
)

const visible = computed(() => props.components.filter((c) => c.category === active.value))
const previewUrl = (preview?: string) =>
  preview?.replaceAll('{{assets}}', editor.assetsBase.replace(/\/$/, ''))
</script>

<template>
  <nav class="ve-library" aria-label="Component library" data-testid="library">
    <p class="ve-library__title">Components</p>
    <div class="ve-library__tabs" role="tablist" aria-label="Categories">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        role="tab"
        class="ve-library__tab"
        :aria-selected="category === active"
        @click="active = category"
      >
        {{ category }}
      </button>
    </div>
    <div class="ve-library__panel" role="tabpanel" :aria-label="active">
      <ul class="ve-library__list">
        <li v-for="component in visible" :key="component.name">
          <button
            type="button"
            class="ve-library__item"
            :aria-label="`Add ${component.name}`"
            @click="editor.addComponent(component)"
          >
            <img
              v-if="component.preview"
              :src="previewUrl(component.preview)"
              alt=""
              loading="lazy"
            />
            <span>{{ component.name }}</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-library {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--ve-border);
  background: var(--ve-surface);
}

.ve-library__title {
  margin: 0;
  padding: 1rem 1rem 0.5rem;
  @include label;
}

.ve-library__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid var(--ve-border);
}

.ve-library__tab {
  @include button;
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  text-transform: capitalize;
  &[aria-selected='true'] {
    background: var(--ve-brand);
    color: var(--ve-surface);
  }
}

.ve-library__panel {
  min-height: 0;
  overflow-y: auto;
}

.ve-library__list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0.75rem 1rem 1rem;
  list-style: none;
}

.ve-library__item {
  @include reset-button;
  display: grid;
  gap: 0.375rem;
  width: 100%;
  padding: 0.375rem;
  border: 1px solid var(--ve-border);
  border-radius: $radius;
  font-size: 0.8125rem;
  text-align: left;
  &:hover {
    border-color: var(--ve-link);
  }
  &:focus-visible {
    @include focus-ring;
  }
  img {
    width: 100%;
    border-radius: 0.25rem;
    background: var(--ve-border);
  }
}
</style>
