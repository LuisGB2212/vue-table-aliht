<template>
    <div class="relative" ref="containerRef">
        <button @click.stop="open = !open"
            class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="3" r="1.2" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="8" cy="13" r="1.2" />
            </svg>
        </button>

        <Transition name="menu">
            <div v-if="open"
                class="absolute right-0 top-full mt-1 min-w-[160px] bg-white border border-neutral-200 rounded-xl shadow-dropdown z-50 overflow-hidden py-1">
                <button v-for="item in defaultItems" :key="item.action" @click.stop="onAction(item.action)" :class="[
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                    item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-neutral-700 hover:bg-neutral-50'
                ]">
                    <span class="text-base leading-none">{{ item.icon }}</span>
                    {{ item.label }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Transaction } from '../types'

defineProps<{ row: Transaction }>()
const emit = defineEmits<{ (e: 'action', action: string): void }>()

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const defaultItems = [
    { action: 'view', label: 'View details', icon: '👁', danger: false },
    { action: 'edit', label: 'Edit', icon: '✏️', danger: false },
    { action: 'approve', label: 'Approve', icon: '✓', danger: false },
    { action: 'delete', label: 'Delete', icon: '🗑', danger: true },
]

function onAction(action: string) {
    emit('action', action)
    open.value = false
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
.menu-enter-active,
.menu-leave-active {
    transition: all 0.12s ease;
}

.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
}
</style>
