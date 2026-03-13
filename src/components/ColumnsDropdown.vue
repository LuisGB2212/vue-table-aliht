<template>
    <div class="relative" ref="containerRef">
        <button @click="toggleOpen()" :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
            open
                ? 'border-neutral-400 bg-neutral-50 text-neutral-900'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
        ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
                <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="currentColor" />
                <rect x="2" y="11.5" width="6" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
            Columnas
            <svg class="w-3 h-3 text-neutral-400 transition-transform" :class="open ? 'rotate-180' : ''" fill="none"
                viewBox="0 0 12 12">
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
        </button>

        <Teleport to="body">
            <Transition name="dropdown">
                <div v-if="open" ref="panelRef" :style="panelStyle"
                    class="scope fixed w-[220px] bg-white border border-neutral-200 rounded-2xl shadow-dropdown z-[9999]">
                    <div class="px-2 pt-4 pb-1">
                        <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-2">Columnas</p>
                        <div class="space-y-0.5" ref="listRef">
                            <label v-for="col in toggleableColumns" :key="colKey(col)"
                                class="flex items-center gap-2.5 cursor-pointer py-1.5 px-1.5 rounded-lg hover:bg-neutral-100 transition-colors group select-none">
                                <!-- Drag handle -->
                                <div
                                    class="drag-handle cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-800 transition-colors">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                                        <path
                                            d="M5 4h1.5v1.5H5V4zm4.5 0H11v1.5H9.5V4zm-4.5 4h1.5v1.5H5V8zm4.5 0H11v1.5H9.5V8zm-4.5 4h1.5v1.5H5V12zm4.5 0H11v1.5H9.5V12z"
                                            fill="currentColor" />
                                    </svg>
                                </div>

                                <div :class="[
                                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
                                    col.visible !== false
                                        ? 'bg-primary border-primary'
                                        : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                                ]" @click="toggle(col)">
                                    <svg v-if="col.visible !== false" class="w-2.5 h-2.5 text-white" fill="none"
                                        viewBox="0 0 10 10">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <span
                                    class="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors truncate">
                                    {{ colLabel(col) }}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div
                        class="flex items-center justify-between px-4 py-3 border-t border-neutral-100 mt-2 rounded-b-2xl">
                        <button @click="showAll"
                            class="text-xs text-neutral-500 hover:text-neutral-800 transition-colors font-medium">Mostrar
                            todas</button>
                        <button @click="open = false"
                            class="text-xs font-semibold bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-neutral-700 transition-colors">Listo</button>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Sortable from 'sortablejs'
import type { ColumnDefinition, DataColumn } from '../types'

const props = defineProps<{ columns: ColumnDefinition[] }>()
const emit = defineEmits<{ (e: 'update:columns', cols: ColumnDefinition[]): void }>()

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function initSortable() {
    if (!listRef.value) return
    Sortable.create(listRef.value, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'bg-neutral-50',
        onEnd: (evt: Sortable.SortableEvent) => {
            const { oldIndex, newIndex } = evt
            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return

            const toggles = [...toggleableColumns.value]
            const [moved] = toggles.splice(oldIndex, 1)
            toggles.splice(newIndex, 0, moved)

            const actions = props.columns.filter(c => c.type === 'actions')
            emit('update:columns', [...toggles, ...actions])
        }
    })
}

watch(open, (isOpen) => {
    if (isOpen) {
        nextTick(() => initSortable())
    }
})

function updatePosition() {
    const el = containerRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    // align to right edge of the button
    panelStyle.value = {
        top: `${rect.bottom + 6}px`,
        left: `${rect.right - 220}px`,   // 220 = panel width
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
