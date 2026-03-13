<template>
  <div class="sm:vtt-flex vtt-grid vtt-gap-6 sm:vtt-items-center sm:vtt-justify-between vtt-justify-items-center vtt-px-5 vtt-py-3 vtt-border-t vtt-border-neutral-100">

    <!-- Left: count + mode toggle -->
    <div class="vtt-flex vtt-items-center vtt-gap-3">
      <p class="vtt-text-xs vtt-text-neutral-500 vtt-font-mono vtt-whitespace-nowrap">
        <template v-if="mode === 'paginated'">
          {{ from }}–{{ to }} de {{ total }}
        </template>
        <template v-else>
          {{ shownCount }} de {{ total }}
        </template>
      </p>

      <!-- Mode toggle pill -->
      <div class="vtt-flex vtt-items-center vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-overflow-hidden vtt-bg-neutral-50">
        <button
          @click="emit('mode-change', 'paginated')"
          :class="[
            'vtt-flex vtt-items-center vtt-gap-1.5 vtt-px-2.5 vtt-py-1.5 vtt-text-xs vtt-font-medium vtt-transition-all',
            mode === 'paginated'
              ? 'vtt-bg-neutral-900 vtt-text-white'
              : 'vtt-text-neutral-500 hover:vtt-text-neutral-700'
          ]"
          title="Paginated"
        >
          <!-- pages icon -->
          <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12">
            <rect x="1" y="1" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/>
            <rect x="7" y="1" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          Páginas
        </button>
        <button
          @click="emit('mode-change', 'infinite')"
          :class="[
            'vtt-flex vtt-items-center vtt-gap-1.5 vtt-px-2.5 vtt-py-1.5 vtt-text-xs vtt-font-medium vtt-transition-all',
            mode === 'infinite'
              ? 'vtt-bg-neutral-900 vtt-text-white'
              : 'vtt-text-neutral-500 hover:vtt-text-neutral-700'
          ]"
          title="Infinite scroll"
        >
          <!-- scroll icon -->
          <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12">
            <path d="M6 1v10M3 8l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Infinito
        </button>
      </div>
    </div>

    <!-- Center: page buttons (only in paginated mode) -->
    <div v-if="mode === 'paginated'" class="vtt-flex vtt-items-center vtt-gap-1">
      <button
        @click="emit('page', currentPage - 1)"
        :disabled="currentPage === 1"
        class="vtt-p-1.5 vtt-rounded vtt-text-neutral-400 hover:vtt-text-neutral-700 hover:vtt-bg-neutral-100 disabled:vtt-opacity-30 disabled:vtt-cursor-not-allowed vtt-transition-colors"
      >
        <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="vtt-px-1.5 vtt-text-neutral-400 vtt-text-sm">…</span>
        <button
          v-else
          @click="emit('page', p as number)"
          :class="[
            'vtt-min-w-[32px] vtt-h-8 vtt-px-2 vtt-rounded vtt-text-sm vtt-font-medium vtt-transition-all',
            p === currentPage
              ? 'vtt-bg-neutral-900 vtt-text-white vtt-shadow-sm'
              : 'vtt-text-neutral-600 hover:vtt-bg-neutral-100'
          ]"
        >{{ p }}</button>
      </template>

      <button
        @click="emit('page', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="vtt-p-1.5 vtt-rounded vtt-text-neutral-400 hover:vtt-text-neutral-700 hover:vtt-bg-neutral-100 disabled:vtt-opacity-30 disabled:vtt-cursor-not-allowed vtt-transition-colors"
      >
        <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
          <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Right: rows per page -->
    <div class="vtt-flex vtt-items-center vtt-gap-2">
      <span class="vtt-text-xs vtt-text-neutral-500">Filas:</span>
      <select
        :value="rowsPerPage"
        @change="emit('rows-per-page', Number(($event.target as HTMLSelectElement).value))"
        class="vtt-text-xs vtt-border vtt-border-neutral-200 vtt-rounded-lg vtt-px-2 vtt-py-1.5 vtt-bg-white vtt-text-neutral-700 focus:vtt-outline-none focus:vtt-ring-2 focus:vtt-ring-neutral-300 vtt-cursor-pointer"
      >
        <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DisplayMode } from '../types'

const props = defineProps<{
  currentPage: number
  totalPages: number
  total: number
  rowsPerPage: number
  mode: DisplayMode
  shownCount?: number
}>()

const emit = defineEmits<{
  (e: 'page', page: number): void
  (e: 'rows-per-page', rows: number): void
  (e: 'mode-change', mode: DisplayMode): void
}>()

const from = computed(() => (props.currentPage - 1) * props.rowsPerPage + 1)
const to   = computed(() => Math.min(props.currentPage * props.rowsPerPage, props.total))

const pages = computed(() => {
  const total   = props.totalPages
  const current = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | string)[] = [1]
  if (current > 3) result.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) result.push(i)
  if (current < total - 2) result.push('...')
  result.push(total)
  return result
})
</script>
