import type { App } from 'vue'
import { createPinia } from 'pinia'
import TransactionsTable from './components/TransactionsTable.vue'
import StatusBadge from './components/StatusBadge.vue'
import TablePagination from './components/TablePagination.vue'
import FilterDropdown from './components/FilterDropdown.vue'
import { useTransactionsStore } from './stores/transactionsStore'

export type {
  Transaction,
  TransactionStatus,
  TransactionCategory,
  TransactionTab,
  PaginationState,
  SortState,
  TransactionFilter,
  TransactionsTableProps,
} from './types'

export {
  TransactionsTable,
  StatusBadge,
  TablePagination,
  FilterDropdown,
  useTransactionsStore,
}

// Vue plugin: registers components globally + installs Pinia if not present
export default {
  install(app: App, options?: { pinia?: ReturnType<typeof createPinia> }) {
    // Install Pinia if not already installed
    if (!app.config.globalProperties.$pinia) {
      const pinia = options?.pinia ?? createPinia()
      app.use(pinia)
    }

    // Register components globally
    app.component('TransactionsTable', TransactionsTable)
    app.component('StatusBadge', StatusBadge)
    app.component('TablePagination', TablePagination)
    app.component('FilterDropdown', FilterDropdown)
  },
}
