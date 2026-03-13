# @devkit/vue-transactions-table

A fully-featured, reusable Vue 3 transactions table component powered by **Pinia**, styled with **Tailwind CSS**, and bundled with **Vite**.

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js)
![Pinia](https://img.shields.io/badge/Pinia-2.x-f7d336?logo=pinia)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)

## Features

- ✅ Paginated data table with configurable rows per page
- ✅ Multi-tab filtering (All, Pending Review, Pending Approval, Approved)
- ✅ Column sorting (asc/desc)
- ✅ Advanced filter panel (status, date range, search)
- ✅ Row & bulk checkbox selection
- ✅ Status badges with colored indicators
- ✅ Loading skeleton state
- ✅ Empty state
- ✅ Fully typed with TypeScript
- ✅ Slot-based customization
- ✅ Pinia store exposed for external control
- ✅ Accessible & responsive

---

## Installation

```bash
npm install @devkit/vue-transactions-table pinia
```

> **Peer dependencies:** `vue ^3.3`, `pinia ^2.1`

---

## Quick Start

### 1. Register as a plugin (global components)

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueTransactionsTable from '@devkit/vue-transactions-table'
import '@devkit/vue-transactions-table/style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(VueTransactionsTable, { pinia }) // pass your pinia instance
app.mount('#app')
```

```html
<!-- Any component -->
<TransactionsTable :transactions="myData" />
```

### 2. Import individually (tree-shaking)

```vue
<template>
  <TransactionsTable
    :transactions="transactions"
    title="Transactions"
    currency="USD"
    locale="en-US"
    :show-import="true"
    :show-export="true"
    :show-create-button="true"
    create-button-label="New Transaction"
    @row-click="handleRowClick"
    @create="handleCreate"
    @export="handleExport"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TransactionsTable } from '@devkit/vue-transactions-table'
import '@devkit/vue-transactions-table/style.css'
import type { Transaction } from '@devkit/vue-transactions-table'

const transactions = ref<Transaction[]>([
  {
    id: 1,
    date: '2021-05-05',
    transactionNumber: '11345678',
    description: 'TRTI - Uber Trip',
    amount: 31.10,
    category: 'Grand Trans - Cab',
    status: 'new',
  },
  // ...more
])

function handleRowClick(tx: Transaction) {
  console.log('Clicked:', tx)
}
</script>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transactions` | `Transaction[]` | `[]` | Array of transaction objects |
| `loading` | `boolean` | `false` | Show skeleton loading rows |
| `title` | `string` | `'Transactions'` | Table heading |
| `currency` | `string` | `'USD'` | Currency for amount formatting |
| `locale` | `string` | `'en-US'` | Locale for date & number formatting |
| `tabs` | `TransactionTab[]` | — | Custom tabs (overrides defaults) |
| `showImport` | `boolean` | `true` | Show Import button |
| `showExport` | `boolean` | `true` | Show Export button |
| `showCreateButton` | `boolean` | `true` | Show Create button |
| `createButtonLabel` | `string` | `'Create transaction'` | Label for Create button |

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-click` | `Transaction` | Row was clicked |
| `create` | — | Create button clicked |
| `import` | — | Import button clicked |
| `export` | — | Export button clicked |
| `selection-change` | `Transaction[]` | Selection changed |

---

## Slots

| Slot | Description |
|------|-------------|
| `actions` | Replace the default action buttons (Import / Create / Export) |

---

## Transaction Type

```ts
type TransactionStatus =
  | 'new'
  | 'pending-approval'
  | 'pending-review'
  | 'approved'
  | 'finalized'
  | 'in-progress'
  | 'rejected'

interface Transaction {
  id: string | number
  date: string          // 'YYYY-MM-DD'
  transactionNumber: string
  description: string
  amount: number
  category: string
  status: TransactionStatus
}
```

---

## Using the Pinia Store Directly

```ts
import { useTransactionsStore } from '@devkit/vue-transactions-table'

const store = useTransactionsStore()

// Programmatically update status
store.updateStatus(txId, 'approved')

// Add a new transaction
store.addTransaction({ id: 999, ... })

// Delete
store.deleteTransaction(txId)

// Set filters programmatically
store.setFilter({ search: 'Uber', status: ['pending-approval'] })

// Paginate
store.setPage(3)
store.setRowsPerPage(20)
```

---

## Development

```bash
git clone https://github.com/your-org/vue-transactions-table
cd vue-transactions-table
npm install
npm run dev        # Start dev server
npm run build:lib  # Build as npm package
```

---

## License

MIT
