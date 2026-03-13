<template>
  <div class="vtt-relative" ref="containerRef">
    <button
      @click="open = !open"
      :class="[
        'vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-text-sm vtt-font-medium vtt-transition-all',
        open
          ? 'vtt-border-neutral-400 vtt-bg-neutral-50 vtt-text-neutral-900'
          : 'vtt-border-neutral-200 vtt-bg-white vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900'
      ]"
    >
      <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Filter
      <span v-if="activeCount > 0" class="vtt-bg-neutral-900 vtt-text-white vtt-text-xs vtt-rounded-full vtt-px-1.5 vtt-py-0.5 vtt-leading-none">{{ activeCount }}</span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="vtt-absolute vtt-left-0 vtt-top-full vtt-mt-2 vtt-w-72 vtt-bg-white vtt-border vtt-border-neutral-200 vtt-rounded-xl vtt-shadow-dropdown vtt-z-50 vtt-overflow-hidden"
      >
        <div class="vtt-p-4 vtt-border-b vtt-border-neutral-100">
          <p class="vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider vtt-mb-3">Search</p>
          <input
            :value="store.filters.search"
            @input="store.setFilter({ search: ($event.target as HTMLInputElement).value })"
            type="vtt-text"
            placeholder="Search transactions..."
            class="vtt-w-full vtt-text-sm vtt-px-3 vtt-py-2 vtt-border vtt-border-neutral-200 vtt-rounded-lg focus:vtt-outline-none focus:vtt-ring-2 focus:vtt-ring-neutral-300"
          />
        </div>

        <div class="vtt-p-4 vtt-border-b vtt-border-neutral-100">
          <p class="vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider vtt-mb-3">Status</p>
          <div class="vtt-space-y-2">
            <label
              v-for="status in statusOptions"
              :key="status.value"
              class="vtt-flex vtt-items-center vtt-gap-2 vtt-cursor-pointer vtt-group"
            >
              <input
                type="checkbox"
                :value="status.value"
                :checked="store.filters.status?.includes(status.value)"
                @change="toggleStatus(status.value)"
                class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500"
              />
              <span class="vtt-text-sm vtt-text-neutral-700 group-hover:vtt-text-neutral-900">{{ status.label }}</span>
            </label>
          </div>
        </div>

        <div class="vtt-p-4 vtt-border-b vtt-border-neutral-100">
          <p class="vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider vtt-mb-3">Date Range</p>
          <div class="vtt-grid vtt-grid-cols-2 vtt-gap-2">
            <div>
              <label class="vtt-text-xs vtt-text-neutral-500 vtt-mb-1 vtt-block">From</label>
              <input
                :value="store.filters.dateFrom"
                @input="store.setFilter({ dateFrom: ($event.target as HTMLInputElement).value })"
                type="date"
                class="vtt-w-full vtt-text-sm vtt-px-2 vtt-py-1.5 vtt-border vtt-border-neutral-200 vtt-rounded-lg focus:vtt-outline-none focus:vtt-ring-2 focus:vtt-ring-neutral-300"
              />
            </div>
            <div>
              <label class="vtt-text-xs vtt-text-neutral-500 vtt-mb-1 vtt-block">To</label>
              <input
                :value="store.filters.dateTo"
                @input="store.setFilter({ dateTo: ($event.target as HTMLInputElement).value })"
                type="date"
                class="vtt-w-full vtt-text-sm vtt-px-2 vtt-py-1.5 vtt-border vtt-border-neutral-200 vtt-rounded-lg focus:vtt-outline-none focus:vtt-ring-2 focus:vtt-ring-neutral-300"
              />
            </div>
          </div>
        </div>

        <div class="vtt-flex vtt-items-center vtt-justify-between vtt-p-3">
          <button @click="store.resetFilters()" class="vtt-text-sm vtt-text-neutral-500 hover:vtt-text-neutral-700 vtt-transition-colors">
            Clear all
          </button>
          <button @click="open = false" class="vtt-text-sm vtt-font-medium vtt-bg-neutral-900 vtt-text-white vtt-px-4 vtt-py-1.5 vtt-rounded-lg hover:vtt-bg-neutral-700 vtt-transition-colors">
            Apply
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'
import type { TransactionStatus } from '../types'

const store = useTransactionsStore()
const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const statusOptions: { value: TransactionStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'rejected', label: 'Rejected' },
]

const activeCount = computed(() => {
  let n = 0
  if (store.filters.status?.length) n += store.filters.status.length
  if (store.filters.search) n++
  if (store.filters.dateFrom || store.filters.dateTo) n++
  return n
})

function toggleStatus(status: TransactionStatus) {
  const current = store.filters.status ?? []
  const next = current.includes(status)
    ? current.filter((s) => s !== status)
    : [...current, status]
  store.setFilter({ status: next })
}

function handleOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleOutside))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
