<template>
    <div class="relative" ref="containerRef">
        <button @click="toggleOpen()" :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
            open || activeCount > 0
                ? 'border-neutral-400 bg-neutral-50 text-neutral-900'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
        ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Filtros
            <span v-if="activeCount > 0"
                class="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none font-semibold">{{
                activeCount }}</span>
        </button>

        <Teleport to="body">
            <Transition name="dropdown">
                <div v-if="open" ref="panelRef" :style="panelStyle"
                    class="scope fixed w-[280px] bg-white border border-neutral-200 rounded-2xl shadow-dropdown z-[9999]">
                    <!-- Search -->
                    <div class="px-4 pt-4 pb-3">
                        <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Buscar</p>
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"
                                fill="none" viewBox="0 0 14 14">
                                <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3" />
                                <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" stroke-width="1.3"
                                    stroke-linecap="round" />
                            </svg>
                            <input :value="filters.search"
                                @input="emit('update:filter', { search: ($event.target as HTMLInputElement).value })"
                                type="text" placeholder="Buscar registros..."
                                class="w-full text-sm pl-8 pr-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-800 placeholder:text-neutral-400" />
                        </div>
                    </div>

                    <div class="h-px bg-neutral-100 mx-4" />

                    <!-- Status -->
                    <div class="px-4 py-3">
                        <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Estado</p>
                        <div class="space-y-1">
                            <label v-for="status in statusOptions" :key="status.value"
                                class="flex items-center gap-2.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-neutral-50 transition-colors group">
                                <div :class="[
                                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
                                    filters.status?.includes(status.value)
                                        ? 'bg-primary border-primary'
                                        : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                                ]" @click="toggleStatus(status.value)">
                                    <svg v-if="filters.status?.includes(status.value)" class="w-2.5 h-2.5 text-white"
                                        fill="none" viewBox="0 0 10 10">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <span
                                    class="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors select-none">{{
                                    status.label }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="h-px bg-neutral-100 mx-4" />

                    <!-- Date Range -->
                    <div class="px-4 py-3">
                        <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Rango de
                            fechas</p>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-[11px] text-neutral-500 mb-1 block font-medium">Desde</label>
                                <input :value="filters.dateFrom"
                                    @input="emit('update:filter', { dateFrom: ($event.target as HTMLInputElement).value })"
                                    type="date"
                                    class="w-full text-xs px-2.5 py-2 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-700" />
                            </div>
                            <div>
                                <label class="text-[11px] text-neutral-500 mb-1 block font-medium">Hasta</label>
                                <input :value="filters.dateTo"
                                    @input="emit('update:filter', { dateTo: ($event.target as HTMLInputElement).value })"
                                    type="date"
                                    class="w-full text-xs px-2.5 py-2 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-700" />
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100 rounded-b-2xl">
                        <button @click="onClear"
                            class="text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium">
                            Limpiar todo
                        </button>
                        <button @click="open = false"
                            class="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-xl hover:bg-neutral-700 transition-colors">
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

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function updatePosition() {
    const el = containerRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    panelStyle.value = {
        top: `${rect.bottom + 6}px`,
        left: `${rect.left}px`,
    }
}

function toggleOpen() {
    if (!open.value) updatePosition()
    open.value = !open.value
}

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
    const insidePanel = panelRef.value?.contains(target)
    if (!insideTrigger && !insidePanel) {
        open.value = false
    }
}

onMounted(() => document.addEventListener('click', handleOutside, true))
onUnmounted(() => document.removeEventListener('click', handleOutside, true))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
}
</style>
