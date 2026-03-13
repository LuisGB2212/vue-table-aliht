<template>
  <div class="vtt-relative" ref="containerRef">
    <button
      @click.stop="open = !open"
      class="vtt-p-1.5 vtt-rounded-md vtt-text-neutral-400 hover:vtt-text-neutral-700 hover:vtt-bg-neutral-100 vtt-transition-colors"
    >
      <svg class="vtt-w-4 vtt-h-4" fill="currentColor" viewBox="0 0 16 16">
        <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
      </svg>
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        class="vtt-absolute vtt-right-0 vtt-top-full vtt-mt-1 vtt-min-w-[160px] vtt-bg-white vtt-border vtt-border-neutral-200 vtt-rounded-xl vtt-shadow-dropdown vtt-z-50 vtt-overflow-hidden vtt-py-1"
      >
        <button
          v-for="item in defaultItems"
          :key="item.action"
          @click.stop="onAction(item.action)"
          :class="[
            'vtt-w-full vtt-flex vtt-items-center vtt-gap-2.5 vtt-px-3 vtt-py-2 vtt-text-sm vtt-text-left vtt-transition-colors',
            item.danger
              ? 'vtt-text-red-600 hover:vtt-bg-red-50'
              : 'vtt-text-neutral-700 hover:vtt-bg-neutral-50'
          ]"
        >
          <span class="vtt-text-base vtt-leading-none">{{ item.icon }}</span>
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
  { action: 'view',   label: 'View details', icon: '👁', danger: false },
  { action: 'edit',   label: 'Edit',         icon: '✏️', danger: false },
  { action: 'approve',label: 'Approve',      icon: '✓',  danger: false },
  { action: 'delete', label: 'Delete',       icon: '🗑', danger: true  },
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
.menu-enter-active, .menu-leave-active { transition: all 0.12s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
