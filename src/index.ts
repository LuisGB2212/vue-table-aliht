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
  TransactionFilter,
  SortState,
  PaginationState,
  SectionDefinition,
  SectionLocal,
  SectionApi,
  SectionState,
  ApiPaginatedResponse,
  ApiQueryParams,
  TransactionsTableProps,
  TransactionTab,
} from './types'

export {
  TransactionsTable,
  StatusBadge,
  TablePagination,
  FilterDropdown,
  useTransactionsStore,
}

export default {
  install(app: App, options?: { pinia?: ReturnType<typeof createPinia> }) {
    if (!app.config.globalProperties.$pinia) {
      const pinia = options?.pinia ?? createPinia()
      app.use(pinia)
    }
    app.component('TransactionsTable', TransactionsTable)
    app.component('StatusBadge', StatusBadge)
    app.component('TablePagination', TablePagination)
    app.component('FilterDropdown', FilterDropdown)
  },
}
