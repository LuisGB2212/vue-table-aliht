<template>
  <div class="vtt-scope vtt-min-h-screen vtt-bg-neutral-100 vtt-p-2 sm:vtt-p-8">
    <DataTable
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
      <template #col-voucher="{ value }">
        <a v-if="value" :href="String(value)" target="_blank" @click.stop
          class="vtt-inline-flex vtt-items-center vtt-gap-1 vtt-text-xs vtt-font-medium vtt-text-blue-600 hover:vtt-text-blue-800 vtt-underline">
          <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          View
        </a>
        <span v-else class="vtt-text-neutral-300 vtt-text-xs">—</span>
      </template>

      <!-- <template #col-actions="{ row }">
        <div class="vtt-flex vtt-items-center vtt-gap-1" @click.stop>
          <button @click="onAction('approve', row)" class="vtt-p-1.5 vtt-rounded-md vtt-text-emerald-600 hover:vtt-bg-emerald-50 vtt-transition-colors" title="Approve">
            <svg class="vtt-w-3.5 vtt-h-3.5" fill="none" viewBox="0 0 14 14"><path d="M2.5 7l3 3 6-5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button @click="onAction('edit', row)" class="vtt-p-1.5 vtt-rounded-md vtt-text-neutral-500 hover:vtt-bg-neutral-100 vtt-transition-colors" title="Edit">
            <svg class="vtt-w-3.5 vtt-h-3.5" fill="none" viewBox="0 0 14 14"><path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button @click="onAction('delete', row)" class="vtt-p-1.5 vtt-rounded-md vtt-text-red-400 hover:vtt-bg-red-50 vtt-transition-colors" title="Delete">
            <svg class="vtt-w-3.5 vtt-h-3.5" fill="none" viewBox="0 0 14 14"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M4 3.5l.7 8h4.6l.7-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </template> -->
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from './components/DataTable.vue'
import type { DataRow, SectionDefinition, ColumnDefinition } from './types'

function randomStatus() {
  const s = ['new','pending-approval','pending-review','approved','finalized','in-progress','rejected']
  return s[Math.floor(Math.random() * s.length)]
}
const categories = ['Grand Trans - Cab','Meals - Dinner','AC - Handling','Fuel','Office Supplies','Travel - Air','Hotel','Software']
const descriptions = ['TRTI - Uber Trip','GADU - PWA Atlantic','AMZN - AWS Services','DELTA - Flight 441','HILTON - Chicago','ADOBE - Creative Cloud','GOOGLE - Workspace','SLACK - Team Plan']

const allData: DataRow[] = Array.from({ length: 317 }, (_, i) => ({
  id: i + 1,
  date: new Date(2021, 3, Math.floor(Math.random() * 30) + 1).toISOString().slice(0, 10),
  transactionNumber: `1134${5678 + i}`,
  description: descriptions[Math.floor(Math.random() * descriptions.length)],
  amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
  category: categories[Math.floor(Math.random() * categories.length)],
  status: randomStatus(),
  voucher: Math.random() > 0.5 ? `https://example.com/voucher/${i + 1}` : null,
})).sort((a, b) => String(b.date).localeCompare(String(a.date)))

const sections = ref<SectionDefinition[]>([
  { key: 'all',      title: 'All Transactions', source: { mode: 'local', data: allData } },
  { key: 'pending',  title: 'Pending', color: 'yellow', source: { mode: 'local', data: allData.filter(t => ['pending-approval','pending-review'].includes(t.status as string)) } },
  { key: 'approved', title: 'Approved', color: 'green', source: { mode: 'local', data: allData.filter(t => ['approved','finalized'].includes(t.status as string)) } },
])

const columns = ref<ColumnDefinition[]>([
  { field: 'date',              label: 'Date',              type: 'date',     sortable: true },
  { field: 'transactionNumber', label: 'Transaction #',     type: 'text',     sortable: true },
  { field: 'description',       label: 'Description',       type: 'text',     sortable: true, truncate: true, tooltip: true },
  { field: 'amount',            label: 'Amount',            type: 'currency', sortable: true, align: 'right' },
  { field: 'category',          label: 'Category',          type: 'text',     sortable: true },
  { field: 'status',            label: 'Status',            type: 'status',   sortable: true },
  { field: 'voucher',           label: 'Voucher',           type: 'custom',   sortable: false, visible: false, align: 'center', width: '90px' },
  { type: 'actions',            label: '',                  width: '96px',    align: 'right' },
])

function onRowClick(row: DataRow) { console.log('Row:', row) }
function onAction(action: string, row: DataRow) { console.log('Action:', action, row.id) }
function onSectionChange(key: string) { console.log('Section:', key) }
function onSelectionChange(selected: DataRow[]) { console.log('Selected:', selected.length) }
</script>
