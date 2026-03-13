<template>
  <span :class="['vtt-inline-flex vtt-items-center vtt-gap-1.5 vtt-px-2.5 vtt-py-1 vtt-rounded-full vtt-text-xs vtt-font-medium', config.classes]">
    <span v-if="config.dot" :class="['vtt-w-1.5 vtt-h-1.5 vtt-rounded-full', config.dotColor]" />
    <svg v-else-if="config.icon === 'circle'" class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
    </svg>
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TransactionStatus } from '../types'

const props = defineProps<{ status: TransactionStatus }>()

const statusMap: Record<TransactionStatus, { label: string; classes: string; dot?: boolean; dotColor?: string; icon?: string }> = {
  new: {
    label: 'New',
    classes: 'vtt-text-neutral-600 vtt-bg-neutral-100 vtt-border vtt-border-neutral-200',
    icon: 'circle',
  },
  'pending-approval': {
    label: 'Pending approval',
    classes: 'vtt-text-amber-700 vtt-bg-amber-50 vtt-border vtt-border-amber-200',
    dot: true,
    dotColor: 'vtt-bg-amber-500',
  },
  'pending-review': {
    label: 'Pending review',
    classes: 'vtt-text-orange-700 vtt-bg-orange-50 vtt-border vtt-border-orange-200',
    dot: true,
    dotColor: 'vtt-bg-orange-500',
  },
  approved: {
    label: 'Approved',
    classes: 'vtt-text-emerald-700 vtt-bg-emerald-50 vtt-border vtt-border-emerald-200',
    dot: true,
    dotColor: 'vtt-bg-emerald-500',
  },
  finalized: {
    label: 'Finalized',
    classes: 'vtt-text-emerald-700 vtt-bg-emerald-50 vtt-border vtt-border-emerald-200',
    dot: true,
    dotColor: 'vtt-bg-emerald-500',
  },
  'in-progress': {
    label: 'In Progress',
    classes: 'vtt-text-blue-700 vtt-bg-blue-50 vtt-border vtt-border-blue-200',
    dot: true,
    dotColor: 'vtt-bg-blue-500',
  },
  rejected: {
    label: 'Rejected',
    classes: 'vtt-text-red-700 vtt-bg-red-50 vtt-border vtt-border-red-200',
    dot: true,
    dotColor: 'vtt-bg-red-500',
  },
}

const config = computed(() => statusMap[props.status] ?? {
  label: props.status,
  classes: 'vtt-text-neutral-600 vtt-bg-neutral-100',
})
</script>
