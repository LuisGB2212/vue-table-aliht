<template>
    <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.classes]">
        <span v-if="config.dot" :class="['w-1.5 h-1.5 rounded-full', config.dotColor]" />
        <svg v-else-if="config.icon === 'circle'" class="w-3 h-3" fill="none" viewBox="0 0 12 12">
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
        classes: 'text-neutral-600 bg-neutral-100 border border-neutral-200',
        icon: 'circle',
    },
    'pending-approval': {
        label: 'Pending approval',
        classes: 'text-amber-700 bg-amber-50 border border-amber-200',
        dot: true,
        dotColor: 'bg-amber-500',
    },
    'pending-review': {
        label: 'Pending review',
        classes: 'text-orange-700 bg-orange-50 border border-orange-200',
        dot: true,
        dotColor: 'bg-orange-500',
    },
    approved: {
        label: 'Approved',
        classes: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
        dot: true,
        dotColor: 'bg-emerald-500',
    },
    finalized: {
        label: 'Finalized',
        classes: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
        dot: true,
        dotColor: 'bg-emerald-500',
    },
    'in-progress': {
        label: 'In Progress',
        classes: 'text-blue-700 bg-blue-50 border border-blue-200',
        dot: true,
        dotColor: 'bg-blue-500',
    },
    rejected: {
        label: 'Rejected',
        classes: 'text-red-700 bg-red-50 border border-red-200',
        dot: true,
        dotColor: 'bg-red-500',
    },
}

const config = computed(() => statusMap[props.status] ?? {
    label: props.status,
    classes: 'text-neutral-600 bg-neutral-100',
})
</script>
