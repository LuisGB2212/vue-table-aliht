<template>
  <div class="vtt-relative" ref="containerRef">
    <button
      @click="toggleOpen()"
      :class="[
        'vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-text-sm vtt-font-medium vtt-transition-all',
        open || activeCount > 0
          ? 'vtt-border-neutral-400 vtt-bg-neutral-50 vtt-text-neutral-900'
          : 'vtt-border-neutral-200 vtt-bg-white vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900'
      ]"
    >
      <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Filtros
      <span v-if="activeCount > 0" class="vtt-bg-neutral-900 vtt-text-white vtt-text-xs vtt-rounded-full vtt-w-4 vtt-h-4 vtt-flex vtt-items-center vtt-justify-center vtt-leading-none vtt-font-semibold">{{ activeCount }}</span>
    </button>

    <Teleport to="body">
    <Transition name="dropdown">
      <div
        v-if="open"
        ref="panelRef"
        :style="panelStyle"
        class="vtt-scope vtt-fixed vtt-w-[280px] vtt-bg-white vtt-border vtt-border-neutral-200 vtt-rounded-2xl vtt-shadow-dropdown vtt-z-[9999]"
      >
        <!-- Search -->
        <div class="vtt-px-4 vtt-pt-4 vtt-pb-3">
          <p class="vtt-text-[10px] vtt-font-bold vtt-text-neutral-400 vtt-uppercase vtt-tracking-widest vtt-mb-2.5">Buscar</p>
          <div class="vtt-relative">
            <svg class="vtt-absolute vtt-left-3 vtt-top-1/2 -vtt-translate-y-1/2 vtt-w-3.5 vtt-h-3.5 vtt-text-neutral-400 vtt-pointer-events-none" fill="none" viewBox="0 0 14 14">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <input
              :value="filters.search"
              @input="emit('update:filter', { search: ($event.target as HTMLInputElement).value })"
              type="text"
              placeholder="Buscar registros..."
              class="vtt-w-full vtt-text-sm vtt-pl-8 vtt-pr-3 vtt-py-2 vtt-border vtt-border-neutral-200 vtt-rounded-xl vtt-bg-neutral-50 focus:vtt-outline-none focus:vtt-border-neutral-400 focus:vtt-bg-white vtt-transition-all vtt-text-neutral-800 placeholder:vtt-text-neutral-400"
            />
          </div>
        </div>

        <div class="vtt-h-px vtt-bg-neutral-100 vtt-mx-4"/>

        <!-- Status -->
        <div class="vtt-px-4 vtt-py-3">
          <p class="vtt-text-[10px] vtt-font-bold vtt-text-neutral-400 vtt-uppercase vtt-tracking-widest vtt-mb-2.5">Estado</p>
          <div class="vtt-space-y-1">
            <label
              v-for="status in statusOptions"
              :key="status.value"
              class="vtt-flex vtt-items-center vtt-gap-2.5 vtt-cursor-pointer vtt-py-1 vtt-px-1.5 vtt-rounded-lg hover:vtt-bg-neutral-50 vtt-transition-colors vtt-group"
            >
              <div
                :class="[
                  'vtt-w-4 vtt-h-4 vtt-rounded vtt-border vtt-flex vtt-items-center vtt-justify-center vtt-flex-shrink-0 vtt-transition-all',
                  filters.status?.includes(status.value)
                    ? 'vtt-bg-neutral-900 vtt-border-neutral-900'
                    : 'vtt-border-neutral-300 vtt-bg-white group-hover:vtt-border-neutral-400'
                ]"
                @click="toggleStatus(status.value)"
              >
                <svg v-if="filters.status?.includes(status.value)" class="vtt-w-2.5 vtt-h-2.5 vtt-text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="vtt-text-sm vtt-text-neutral-700 group-hover:vtt-text-neutral-900 vtt-transition-colors vtt-select-none">{{ status.label }}</span>
            </label>
          </div>
        </div>

        <div class="vtt-h-px vtt-bg-neutral-100 vtt-mx-4"/>

        <!-- Date Range -->
        <div class="vtt-px-4 vtt-py-3">
          <p class="vtt-text-[10px] vtt-font-bold vtt-text-neutral-400 vtt-uppercase vtt-tracking-widest vtt-mb-2.5">Rango de fechas</p>
          <div class="vtt-grid vtt-grid-cols-2 vtt-gap-2">
            <div>
              <label class="vtt-text-[11px] vtt-text-neutral-500 vtt-mb-1 vtt-block vtt-font-medium">Desde</label>
              <input
                :value="filters.dateFrom"
                @input="emit('update:filter', { dateFrom: ($event.target as HTMLInputElement).value })"
                type="date"
                class="vtt-w-full vtt-text-xs vtt-px-2.5 vtt-py-2 vtt-border vtt-border-neutral-200 vtt-rounded-xl vtt-bg-neutral-50 focus:vtt-outline-none focus:vtt-border-neutral-400 focus:vtt-bg-white vtt-transition-all vtt-text-neutral-700"
              />
            </div>
            <div>
              <label class="vtt-text-[11px] vtt-text-neutral-500 vtt-mb-1 vtt-block vtt-font-medium">Hasta</label>
              <input
                :value="filters.dateTo"
                @input="emit('update:filter', { dateTo: ($event.target as HTMLInputElement).value })"
                type="date"
                class="vtt-w-full vtt-text-xs vtt-px-2.5 vtt-py-2 vtt-border vtt-border-neutral-200 vtt-rounded-xl vtt-bg-neutral-50 focus:vtt-outline-none focus:vtt-border-neutral-400 focus:vtt-bg-white vtt-transition-all vtt-text-neutral-700"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="vtt-flex vtt-items-center vtt-justify-between vtt-px-4 vtt-py-3 vtt-border-t vtt-border-neutral-100 vtt-rounded-b-2xl">
          <button
            @click="onClear"
            class="vtt-text-sm vtt-text-neutral-500 hover:vtt-text-neutral-800 vtt-transition-colors vtt-font-medium"
          >
            Limpiar todo
          </button>
          <button
            @click="open = false"
            class="vtt-text-sm vtt-font-semibold vtt-bg-neutral-900 vtt-text-white vtt-px-5 vtt-py-2 vtt-rounded-xl hover:vtt-bg-neutral-700 vtt-transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { DataTableFilter, TransactionStatus } from '../types'

const props = defineProps<{ filters: DataTableFilter }>()

const emit = defineEmits<{
  (e: 'update:filter', partial: Partial<DataTableFilter>): void
  (e: 'reset'): void
}>()

const open         = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelRef     = ref<HTMLElement | null>(null)
const panelStyle   = ref<Record<string, string>>({})

function updatePosition() {
  const el = containerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  panelStyle.value = {
    top:  `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
  }
}

function toggleOpen() {
  if (!open.value) updatePosition()
  open.value = !open.value
}

const statusOptions: { value: TransactionStatus; label: string }[] = [
  { value: 'new',              label: 'New' },
  { value: 'pending-review',   label: 'Pending Review' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'approved',         label: 'Approved' },
  { value: 'finalized',        label: 'Finalized' },
  { value: 'in-progress',      label: 'In Progress' },
  { value: 'rejected',         label: 'Rejected' },
]

const activeCount = computed(() => {
  let n = 0
  if (props.filters.status?.length) n += props.filters.status.length
  if (props.filters.search) n++
  if (props.filters.dateFrom || props.filters.dateTo) n++
  return n
})

function toggleStatus(status: TransactionStatus) {
  const current = props.filters.status ?? []
  const next = current.includes(status)
    ? current.filter(s => s !== status)
    : [...current, status]
  emit('update:filter', { status: next })
}

function onClear() {
  emit('reset')
}

function handleOutside(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  const insideTrigger = containerRef.value?.contains(target)
  const insidePanel   = panelRef.value?.contains(target)
  if (!insideTrigger && !insidePanel) {
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
