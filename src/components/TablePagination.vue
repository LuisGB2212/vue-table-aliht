<template>
  <div class="vtt-flex vtt-items-center vtt-justify-between vtt-px-4 vtt-py-3 vtt-border-t vtt-border-neutral-100">
    <!-- Info -->
    <p class="vtt-text-xs vtt-text-neutral-500">
      Showing {{ from }}–{{ to }} of {{ total }} items
    </p>

    <!-- Pages -->
    <div class="vtt-flex vtt-items-center vtt-gap-1">
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
        <span v-if="p === '...'" class="vtt-px-2 vtt-text-neutral-400 vtt-text-sm">…</span>
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

    <!-- Rows per page -->
    <div class="vtt-flex vtt-items-center vtt-gap-2">
      <span class="vtt-text-xs vtt-text-neutral-500">Rows per page:</span>
      <select
        :value="rowsPerPage"
        @change="emit('rows-per-page', Number(($event.target as HTMLSelectElement).value))"
        class="vtt-text-xs vtt-border vtt-border-neutral-200 vtt-rounded-md vtt-px-2 vtt-py-1.5 vtt-bg-white vtt-text-neutral-700 focus:vtt-outline-none focus:vtt-ring-2 focus:vtt-ring-neutral-300 vtt-cursor-pointer"
      >
        <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  total: number
  rowsPerPage: number
}>()

const emit = defineEmits<{
  (e: 'page', page: number): void
  (e: 'rows-per-page', rows: number): void
}>()

const from = computed(() => (props.currentPage - 1) * props.rowsPerPage + 1)
const to = computed(() => Math.min(props.currentPage * props.rowsPerPage, props.total))

const pages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | string)[] = [1]
  if (current > 3) result.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    result.push(i)
  }
  if (current < total - 2) result.push('...')
  result.push(total)
  return result
})
</script>
