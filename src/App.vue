<template>
  <div class="vtt-scope vtt-min-h-screen vtt-bg-neutral-50 vtt-p-8">
    <TransactionsTable
      :transactions="transactions"
      :loading="false"
      title="Transactions"
      currency="USD"
      locale="en-US"
      :show-import="true"
      :show-export="true"
      :show-create-button="true"
      create-button-label="Create transaction"
      @row-click="onRowClick"
      @create="onCreate"
      @import="onImport"
      @export="onExport"
      @selection-change="onSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TransactionsTable from './components/TransactionsTable.vue'
import type { Transaction } from './types'

function randomStatus(): Transaction['status'] {
  const statuses: Transaction['status'][] = [
    'new', 'pending-approval', 'pending-review', 'approved',
    'finalized', 'in-progress', 'rejected'
  ]
  return statuses[Math.floor(Math.random() * statuses.length)]
}

const categories = [
  'Grand Trans - Cab', 'Meals - Dinner', 'AC - Handling', 'Fuel',
  'Meals - Lunch', 'Office Supplies', 'Travel - Air', 'Hotel',
  'Software', 'Marketing'
]

const descriptions = [
  'TRTI - Uber Trip', 'TRTI - Grand Aire, Inc.', 'GADU - PWA Atlantic',
  'AMZN - AWS Services', 'DELTA - Flight 441', 'HILTON - Chicago',
  'ADOBE - Creative Cloud', 'GOOGLE - Workspace', 'SLACK - Team Plan',
  'ZOOM - Pro Account'
]

const transactions = ref<Transaction[]>(
  Array.from({ length: 317 }, (_, i) => {
    const d = new Date(2021, 3, Math.floor(Math.random() * 30) + 1)
    return {
      id: i + 1,
      date: d.toISOString().slice(0, 10),
      transactionNumber: `1134${5678 + i}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      category: categories[Math.floor(Math.random() * categories.length)],
      status: randomStatus(),
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
)

function onRowClick(tx: Transaction) {
  console.log('Row clicked:', tx)
}

function onCreate() {
  console.log('Create transaction')
}

function onImport() {
  console.log('Import')
}

function onExport() {
  console.log('Export')
}

function onSelectionChange(selected: Transaction[]) {
  console.log('Selected:', selected.length)
}
</script>
