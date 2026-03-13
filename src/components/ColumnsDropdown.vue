<template>
  <div class="vtt-relative" ref="containerRef">
    <button
      @click="toggleOpen()"
      :class="[
        'vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-text-sm vtt-font-medium vtt-transition-all',
        open
          ? 'vtt-border-neutral-400 vtt-bg-neutral-50 vtt-text-neutral-900'
          : 'vtt-border-neutral-200 vtt-bg-white vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900'
      ]"
    >
      <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="11.5" width="6" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
      Columns
      <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400 vtt-transition-transform" :class="open ? 'vtt-rotate-180' : ''" fill="none" viewBox="0 0 12 12">
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Teleport to="body">
    <Transition name="dropdown">
      <div
        v-if="open"
        :style="panelStyle"
        class="vtt-scope vtt-fixed vtt-w-[220px] vtt-bg-white vtt-border vtt-border-neutral-200 vtt-rounded-2xl vtt-shadow-dropdown vtt-z-[9999]"
      >
        <div class="vtt-px-4 vtt-pt-4 vtt-pb-1">
          <p class="vtt-text-[10px] vtt-font-bold vtt-text-neutral-400 vtt-uppercase vtt-tracking-widest vtt-mb-3">Toggle Columns</p>
          <div class="vtt-space-y-0.5">
            <label
              v-for="col in toggleableColumns"
              :key="colKey(col)"
              class="vtt-flex vtt-items-center vtt-gap-2.5 vtt-cursor-pointer vtt-py-1.5 vtt-px-1.5 vtt-rounded-lg hover:vtt-bg-neutral-50 vtt-transition-colors vtt-group vtt-select-none"
            >
              <div
                :class="[
                  'vtt-w-4 vtt-h-4 vtt-rounded vtt-border vtt-flex vtt-items-center vtt-justify-center vtt-flex-shrink-0 vtt-transition-all',
                  col.visible !== false
                    ? 'vtt-bg-neutral-900 vtt-border-neutral-900'
                    : 'vtt-border-neutral-300 vtt-bg-white group-hover:vtt-border-neutral-400'
                ]"
                @click="toggle(col)"
              >
                <svg v-if="col.visible !== false" class="vtt-w-2.5 vtt-h-2.5 vtt-text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="vtt-text-sm vtt-text-neutral-700 group-hover:vtt-text-neutral-900 vtt-transition-colors vtt-truncate">
                {{ colLabel(col) }}
              </span>
            </label>
          </div>
        </div>

        <div class="vtt-flex vtt-items-center vtt-justify-between vtt-px-4 vtt-py-3 vtt-border-t vtt-border-neutral-100 vtt-mt-2 vtt-rounded-b-2xl">
          <button @click="showAll" class="vtt-text-xs vtt-text-neutral-500 hover:vtt-text-neutral-800 vtt-transition-colors vtt-font-medium">Show all</button>
          <button @click="open = false" class="vtt-text-xs vtt-font-semibold vtt-bg-neutral-900 vtt-text-white vtt-px-4 vtt-py-1.5 vtt-rounded-lg hover:vtt-bg-neutral-700 vtt-transition-colors">Done</button>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ColumnDefinition, DataColumn } from '../types'

const props = defineProps<{ columns: ColumnDefinition[] }>()
const emit = defineEmits<{ (e: 'update:columns', cols: ColumnDefinition[]): void }>()

const open         = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelStyle   = ref<Record<string, string>>({})

function updatePosition() {
  const el = containerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  // align to right edge of the button
  panelStyle.value = {
    top:   `${rect.bottom + 6}px`,
    left:  `${rect.right - 220}px`,   // 220 = panel width
  }
}

function toggleOpen() {
  if (!open.value) updatePosition()
  open.value = !open.value
}

const toggleableColumns = computed(() => props.columns.filter(c => c.type !== 'actions'))

function colKey(col: ColumnDefinition): string {
  return (col as DataColumn).field ?? '__actions__'
}

function colLabel(col: ColumnDefinition): string {
  const label = (col as DataColumn).label
  if (label) return label
  return (col as DataColumn).field ?? 'Actions'
}

function toggle(col: ColumnDefinition) {
  const next = props.columns.map(c => {
    if (colKey(c) !== colKey(col)) return c
    return { ...c, visible: c.visible === false ? true : false }
  })
  emit('update:columns', next)
}

function showAll() {
  emit('update:columns', props.columns.map(c => ({ ...c, visible: true })))
}

function handleOutside(e: MouseEvent) {
  if (!open.value) return
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutside, true))
onUnmounted(() => document.removeEventListener('click', handleOutside, true))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
</style>
