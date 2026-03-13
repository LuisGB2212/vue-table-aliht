<template>
  <div class="vtt-scope vtt-min-h-screen vtt-bg-neutral-50 vtt-p-8">
    <TransactionsTable
      :sections="sections"
      :columns="columns"
      title="Transactions"
      currency="USD"
      locale="en-US"
      @row-click="onRowClick"
      @action="onAction"
      @section-change="onSectionChange"
      @selection-change="onSelectionChange"
    >
      <!-- Custom slot for the 'voucher' column -->
      <template #col-voucher="{ value }">
        <a
          v-if="value"
          :href="String(value)"
          target="_blank"
          @click.stop
          class="vtt-inline-flex vtt-items-center vtt-gap-1 vtt-text-xs vtt-font-medium vtt-text-blue-600 hover:vtt-text-blue-800 vtt-underline"
        >
          <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          View
        </a>
        <span v-else class="vtt-text-neutral-300 vtt-text-xs">—</span>
      </template>

      <!-- Custom slot for the actions column (overrides default ActionMenu) -->
      <template #col-actions="{ row }">
        <div class="vtt-flex vtt-items-center vtt-gap-1" @click.stop>
          <button
            @click="onAction('approve', row)"
            class="vtt-p-1.5 vtt-rounded-md vtt-text-emerald-600 hover:vtt-bg-emerald-50 vtt-transition-colors vtt-text-xs vtt-font-medium"
            title="Approve"
          >✓</button>
          <button
            @click="onAction('edit', row)"
            class="vtt-p-1.5 vtt-rounded-md vtt-text-neutral-500 hover:vtt-bg-neutral-100 vtt-transition-colors"
            title="Edit"
          >
            <svg class="vtt-w-3.5 vtt-h-3.5" fill="none" viewBox="0 0 14 14"><path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button
            @click="onAction('delete', row)"
            class="vtt-p-1.5 vtt-rounded-md vtt-text-red-400 hover:vtt-bg-red-50 vtt-transition-colors"
            title="Delete"
          >
            <svg class="vtt-w-3.5 vtt-h-3.5" fill="none" viewBox="0 0 14 14"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4 3.5l.7 8h4.6l.7-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </template>

      <!-- Custom toolbar actions -->
      <template #toolbar-actions>
        <button
          @click="console.log('custom import')"
          class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 vtt-transition-all"
        >
          Import
        </button>
        <button
          @click="console.log('create')"
          class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3.5 vtt-py-2 vtt-rounded-lg vtt-bg-neutral-900 vtt-text-white vtt-text-sm vtt-font-medium hover:vtt-bg-neutral-700 vtt-transition-all vtt-shadow-sm"
        >
          + Create transaction
        </button>
      </template>
    </TransactionsTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TransactionsTable from './components/TransactionsTable.vue'
import type { Transaction, SectionDefinition, ColumnDefinition } from './types'

// ── Demo data ─────────────────────────────────
function randomStatus(): Transaction['status'] {
  const s: Transaction['status'][] = ['new','pending-approval','pending-review','approved','finalized','in-progress','rejected']
  return s[Math.floor(Math.random() * s.length)]
}
const categories = ['Grand Trans - Cab','Meals - Dinner','AC - Handling','Fuel','Office Supplies','Travel - Air','Hotel','Software','Marketing']
const descriptions = ['TRTI - Uber Trip','TRTI - Grand Aire, Inc.','GADU - PWA Atlantic','AMZN - AWS Services','DELTA - Flight 441','HILTON - Chicago','ADOBE - Creative Cloud','GOOGLE - Workspace','SLACK - Team Plan','ZOOM - Pro Account']

const allData = Array.from({ length: 317 }, (_, i) => ({
  id: i + 1,
  date: new Date(2021, 3, Math.floor(Math.random() * 30) + 1).toISOString().slice(0, 10),
  transactionNumber: `1134${5678 + i}`,
  description: descriptions[Math.floor(Math.random() * descriptions.length)],
  amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
  category: categories[Math.floor(Math.random() * categories.length)],
  status: randomStatus(),
  // Extra field for the custom 'voucher' column
  voucher: Math.random() > 0.5 ? `https://example.com/voucher/${i + 1}` : null,
} as Transaction)).sort((a, b) => b.date.localeCompare(a.date))

// ── Sections ──────────────────────────────────
const sections = ref<SectionDefinition[]>([
  {
    key: 'all',
    title: 'All Transactions',
    source: { mode: 'local', data: allData },
  },
  {
    key: 'pending',
    title: 'Pending',
    color: 'yellow',
    source: { mode: 'local', data: allData.filter(t => t.status === 'pending-approval' || t.status === 'pending-review') },
  },
  {
    key: 'approved',
    title: 'Approved',
    color: 'green',
    source: { mode: 'local', data: allData.filter(t => t.status === 'approved' || t.status === 'finalized') },
  },
])

// ── Columns ───────────────────────────────────
const columns = ref<ColumnDefinition[]>([
  {
    field: 'date',
    label: 'Date',
    type: 'date',
    sortable: true,
    width: '120px',
  },
  {
    field: 'transactionNumber',
    label: 'Transaction Number',
    type: 'text',
    sortable: true,
  },
  {
    field: 'description',
    label: 'Description',
    type: 'text',
    sortable: true,
    truncate: true,
    tooltip: true,
    width: '220px',
  },
  {
    field: 'amount',
    label: 'Amount',
    type: 'currency',
    sortable: true,
    align: 'right',
    width: '110px',
  },
  {
    field: 'category',
    label: 'Category',
    type: 'text',
    sortable: true,
  },
  {
    field: 'status',
    label: 'Status',
    type: 'status',
    sortable: true,
  },
  {
    // Custom slot column — renders #col-voucher slot
    field: 'voucher',
    label: 'Voucher',
    type: 'custom',
    sortable: false,
    align: 'center',
    width: '90px',
  },
  {
    // Actions column — no field, renders #col-actions slot
    type: 'actions',
    label: '',
    width: '90px',
    align: 'right',
  },
])

function onRowClick(row: Transaction) { console.log('Row:', row) }
function onAction(action: string, row: Transaction) { console.log('Action:', action, row) }
function onSectionChange(key: string) { console.log('Section:', key) }
function onSelectionChange(selected: Transaction[]) { console.log('Selected:', selected.length) }
</script>
