<template>
    <div
        class="sm:flex grid gap-6 sm:items-center sm:justify-between justify-items-center px-5 py-3 border-t border-neutral-200">

        <!-- Left: count + mode toggle -->
        <div class="flex items-center gap-3">
            <p class="text-xs text-neutral-500 font-mono whitespace-nowrap">
                <template v-if="mode === 'paginated'">
                    {{ from }}–{{ to }} de {{ total }}
                </template>
                <template v-else>
                    {{ shownCount }} de {{ total }}
                </template>
            </p>

            <!-- Mode toggle pill -->
            <div class="flex items-center rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50">
                <button @click="emit('mode-change', 'paginated')" :class="[
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                    mode === 'paginated'
                        ? 'bg-primary text-white'
                        : 'text-neutral-500 hover:text-neutral-700'
                ]" title="Paginated">
                    <!-- pages icon -->
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 12 12">
                        <rect x="1" y="1" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.2" />
                        <rect x="7" y="1" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.2" />
                    </svg>
                    Páginas
                </button>
                <button @click="emit('mode-change', 'infinite')" :class="[
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
                    mode === 'infinite'
                        ? 'bg-primary text-white'
                        : 'text-neutral-500 hover:text-neutral-700'
                ]" title="Infinite scroll">
                    <!-- scroll icon -->
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 12 12">
                        <path d="M6 1v10M3 8l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Infinito
                </button>
            </div>
        </div>

        <!-- Center: page buttons (only in paginated mode) -->
        <div v-if="mode === 'paginated'" class="flex items-center gap-1">
            <button @click="emit('page', currentPage - 1)" :disabled="currentPage === 1"
                class="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>

            <template v-for="p in pages" :key="p">
                <span v-if="p === '...'" class="px-1.5 text-neutral-400 text-sm">…</span>
                <button v-else @click="emit('page', p as number)" :class="[
                    'min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-all',
                    p === currentPage
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100'
                ]">{{ p }}</button>
            </template>

            <button @click="emit('page', currentPage + 1)" :disabled="currentPage === totalPages"
                class="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <!-- Right: rows per page -->
        <div class="flex items-center gap-2">
            <span class="text-xs text-neutral-500">Filas:</span>
            <select :value="rowsPerPage"
                @change="emit('rows-per-page', Number(($event.target as HTMLSelectElement).value))"
                class="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer">
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
const to = computed(() => Math.min(props.currentPage * props.rowsPerPage, props.total))

const pages = computed(() => {
    const total = props.totalPages
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
