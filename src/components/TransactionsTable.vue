<template>
  <div class="vtt-scope vtt-root vtt-bg-white vtt-rounded-2xl vtt-border vtt-border-neutral-200 vtt-shadow-table vtt-overflow-hidden">

    <!-- Header -->
    <div class="vtt-px-6 vtt-pt-6 vtt-pb-0">
      <div class="vtt-flex vtt-items-center vtt-justify-between vtt-mb-5">
        <h2 class="vtt-text-2xl vtt-font-bold vtt-text-neutral-900 vtt-tracking-tight">{{ title }}</h2>
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <!-- Filter -->
          <FilterDropdown />

          <!-- Columns toggle (slot or default) -->
          <button class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="11.5" width="6" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
            Columns
            <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400" fill="none" viewBox="0 0 12 12">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="vtt-flex vtt-items-center vtt-gap-0 vtt-border-b vtt-border-neutral-100">
        <button
          v-for="tab in computedTabs"
          :key="tab.key"
          @click="store.setActiveTab(tab.key)"
          :class="[
            'vtt-relative vtt-flex vtt-items-center vtt-gap-2 vtt-px-4 vtt-py-3 vtt-text-sm vtt-font-medium vtt-transition-colors vtt-whitespace-nowrap',
            store.activeTab === tab.key
              ? 'vtt-text-neutral-900'
              : 'vtt-text-neutral-500 hover:vtt-text-neutral-700'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="tab.count !== undefined"
            :class="[
              'vtt-text-xs vtt-px-2 vtt-py-0.5 vtt-rounded-full vtt-font-semibold vtt-tabular-nums vtt-leading-none',
              store.activeTab === tab.key
                ? tab.activeColor || 'vtt-bg-neutral-900 vtt-text-white'
                : 'vtt-bg-neutral-100 vtt-text-neutral-500'
            ]"
          >{{ tab.count }}</span>
          <!-- Active indicator -->
          <span
            v-if="store.activeTab === tab.key"
            class="vtt-absolute vtt-bottom-0 vtt-left-0 vtt-right-0 vtt-h-0.5 vtt-bg-neutral-900 vtt-rounded-t-full"
          />
        </button>
      </div>
    </div>

    <!-- Toolbar: action buttons -->
    <div class="vtt-flex vtt-items-center vtt-justify-between vtt-px-6 vtt-py-3 vtt-border-b vtt-border-neutral-100 vtt-bg-neutral-50/50">
      <div class="vtt-flex vtt-items-center vtt-gap-2">
        <!-- Selection info -->
        <Transition name="fade">
          <span v-if="store.selectedIds.size > 0" class="vtt-text-xs vtt-font-medium vtt-text-neutral-600 vtt-bg-neutral-100 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg">
            {{ store.selectedIds.size }} selected
          </span>
        </Transition>
      </div>
      <div class="vtt-flex vtt-items-center vtt-gap-2">
        <slot name="actions">
          <!-- Import -->
          <button
            v-if="showImport"
            @click="emit('import')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all"
          >
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Import
            <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400" fill="none" viewBox="0 0 12 12">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Create -->
          <button
            v-if="showCreateButton"
            @click="emit('create')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3.5 vtt-py-2 vtt-rounded-lg vtt-bg-neutral-900 vtt-text-white vtt-text-sm vtt-font-medium hover:vtt-bg-neutral-700 vtt-transition-all vtt-shadow-sm"
          >
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ createButtonLabel }}
          </button>

          <!-- Export -->
          <button
            v-if="showExport"
            @click="emit('export')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all"
          >
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
              <path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Export
          </button>
        </slot>
      </div>
    </div>

    <!-- Table -->
    <div class="vtt-overflow-x-auto">
      <table class="vtt-w-full vtt-text-sm vtt-border-collapse">
        <thead>
          <tr class="vtt-bg-white vtt-border-b vtt-border-neutral-100">
            <!-- Checkbox all -->
            <th class="vtt-w-10 vtt-px-4 vtt-py-3">
              <input
                type="checkbox"
                :checked="store.isAllSelected"
                :indeterminate="store.isIndeterminate"
                @change="store.toggleSelectAll()"
                class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500 vtt-cursor-pointer"
              />
            </th>

            <th
              v-for="col in columns"
              :key="col.field"
              @click="col.sortable !== false && store.setSort(col.field as any)"
              :class="[
                'vtt-px-4 vtt-py-3 vtt-text-left vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider vtt-whitespace-nowrap',
                col.sortable !== false ? 'vtt-cursor-pointer hover:vtt-text-neutral-800 vtt-select-none' : '',
                col.align === 'right' ? 'vtt-text-right' : ''
              ]"
            >
              <div :class="['vtt-inline-flex vtt-items-center vtt-gap-1', col.align === 'right' ? 'vtt-flex-row-reverse' : '']">
                {{ col.label }}
                <span v-if="col.sortable !== false" class="vtt-flex vtt-flex-col vtt-gap-px">
                  <svg
                    :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', store.sort.field === col.field && store.sort.direction === 'asc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']"
                    fill="currentColor" viewBox="0 0 8 5"
                  ><path d="M4 0L8 5H0L4 0z"/></svg>
                  <svg
                    :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', store.sort.field === col.field && store.sort.direction === 'desc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']"
                    fill="currentColor" viewBox="0 0 8 5"
                  ><path d="M4 5L0 0H8L4 5z"/></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading skeleton -->
          <template v-if="store.loading">
            <tr v-for="n in store.pagination.rowsPerPage" :key="n" class="vtt-border-b vtt-border-neutral-50">
              <td class="vtt-px-4 vtt-py-3"><div class="vtt-w-4 vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse"/></td>
              <td v-for="col in columns" :key="col.field" class="vtt-px-4 vtt-py-3">
                <div :class="['vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse', col.field === 'description' ? 'vtt-w-48' : 'vtt-w-24']"/>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <template v-else-if="store.paginatedTransactions.length === 0">
            <tr>
              <td :colspan="columns.length + 1" class="vtt-px-4 vtt-py-16 vtt-text-center">
                <div class="vtt-flex vtt-flex-col vtt-items-center vtt-gap-3">
                  <div class="vtt-w-12 vtt-h-12 vtt-rounded-full vtt-bg-neutral-100 vtt-flex vtt-items-center vtt-justify-center">
                    <svg class="vtt-w-6 vtt-h-6 vtt-text-neutral-400" fill="none" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p class="vtt-text-sm vtt-font-medium vtt-text-neutral-500">No transactions found</p>
                  <p class="vtt-text-xs vtt-text-neutral-400">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else>
            <tr
              v-for="tx in store.paginatedTransactions"
              :key="tx.id"
              :class="[
                'vtt-border-b vtt-border-neutral-50 vtt-transition-colors vtt-cursor-pointer vtt-group',
                store.selectedIds.has(tx.id) ? 'vtt-bg-neutral-50' : 'hover:vtt-bg-neutral-50/70'
              ]"
              @click="emit('vtt-row-click', tx)"
            >
              <!-- Checkbox -->
              <td class="vtt-px-4 vtt-py-3.5" @click.stop>
                <input
                  type="checkbox"
                  :checked="store.selectedIds.has(tx.id)"
                  @change="store.toggleSelect(tx.id)"
                  class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500 vtt-cursor-pointer"
                />
              </td>

              <td class="vtt-px-4 vtt-py-3.5 vtt-text-neutral-600 vtt-text-xs vtt-whitespace-nowrap">{{ formatDate(tx.date) }}</td>
              <td class="vtt-px-4 vtt-py-3.5 vtt-text-neutral-500 vtt-text-xs vtt-whitespace-nowrap">{{ tx.transactionNumber }}</td>
              <td class="vtt-px-4 vtt-py-3.5 vtt-text-neutral-800 vtt-font-medium">{{ tx.description }}</td>
              <td class="vtt-px-4 vtt-py-3.5 vtt-text-neutral-800 vtt-font-semibold vtt-whitespace-nowrap">
                {{ formatAmount(tx.amount) }}
              </td>
              <td class="vtt-px-4 vtt-py-3.5 vtt-text-neutral-600 vtt-whitespace-nowrap">{{ tx.category }}</td>
              <td class="vtt-px-4 vtt-py-3.5">
                <StatusBadge :status="tx.status" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <TablePagination
      :current-page="store.pagination.currentPage"
      :total-pages="store.totalPages"
      :total="store.filteredTransactions.length"
      :rows-per-page="store.pagination.rowsPerPage"
      @page="store.setPage"
      @rows-per-page="store.setRowsPerPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'
import StatusBadge from './StatusBadge.vue'
import TablePagination from './TablePagination.vue'
import FilterDropdown from './FilterDropdown.vue'
import type { Transaction, TransactionTab, TransactionsTableProps } from '../types'

const props = withDefaults(defineProps<TransactionsTableProps>(), {
  transactions: () => [],
  loading: false,
  showImport: true,
  showExport: true,
  showCreateButton: true,
  createButtonLabel: 'Create transaction',
  title: 'Transactions',
  currency: 'USD',
  locale: 'en-US',
})

const emit = defineEmits<{
  (e: 'vtt-row-click', tx: Transaction): void
  (e: 'create'): void
  (e: 'import'): void
  (e: 'export'): void
  (e: 'selection-change', selected: Transaction[]): void
}>()

const store = useTransactionsStore()

const columns = [
  { field: 'date', label: 'Date', sortable: true },
  { field: 'transactionNumber', label: 'Transaction Number', sortable: true },
  { field: 'description', label: 'Description', sortable: true },
  { field: 'amount', label: 'Amount', sortable: true, align: 'vtt-right' },
  { field: 'category', label: 'Category', sortable: true },
  { field: 'status', label: 'Status', sortable: true },
]

const defaultTabs: TransactionTab[] = [
  { key: 'all', label: 'All transactions' },
  { key: 'pending-review', label: 'Pending review', color: 'red' },
  { key: 'pending-approval', label: 'Pending approval', color: 'yellow' },
  { key: 'approved', label: 'Approved', color: 'green' },
]

const tabColorMap: Record<string, string> = {
  red: 'vtt-bg-red-500 vtt-text-white',
  yellow: 'vtt-bg-amber-500 vtt-text-white',
  green: 'vtt-bg-emerald-500 vtt-text-white',
  blue: 'vtt-bg-blue-500 vtt-text-white',
}

const computedTabs = computed(() => {
  const tabs = props.tabs ?? defaultTabs
  return tabs.map((tab) => ({
    ...tab,
    count: store.tabCounts[tab.key as keyof typeof store.tabCounts],
    activeColor: tab.color ? tabColorMap[tab.color] : undefined,
  }))
})

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat(props.locale, {
      month: '2-digit', day: '2-digit', year: 'numeric'
    }).format(new Date(date.replace(/-/g, '/')))
  } catch {
    return date
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Sync external transactions prop → store
watch(() => props.transactions, (val) => { store.setTransactions(val) }, { immediate: true, deep: true })
watch(() => props.loading, (val) => { store.setLoading(val) }, { immediate: true })

// Emit selection changes
watch(() => store.selectedIds.size, () => { emit('selection-change', store.selectedTransactions) })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
