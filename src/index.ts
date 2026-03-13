import type { App } from 'vue'
import { createPinia } from 'pinia'
import DataTable from './components/DataTable.vue'
import StatusBadge from './components/StatusBadge.vue'
import TablePagination from './components/TablePagination.vue'
import FilterDropdown from './components/FilterDropdown.vue'
import ColumnsDropdown from './components/ColumnsDropdown.vue'
import ActionMenu from './components/ActionMenu.vue'
import { useDataTableStore } from './stores/dataTableStore'

export type {
  DataRow,
  DataTableFilter,
  DataTableProps,
  DisplayMode,
  SortState,
  PaginationState,
  SectionDefinition,
  SectionLocal,
  SectionApi,
  SectionState,
  ApiPaginatedResponse,
  ApiQueryParams,
  ColumnDefinition,
  DataColumn,
  ActionsColumn,
  ColumnType,
  ColumnAlign,
  // Legacy
  Transaction,
  TransactionStatus,
  TransactionCategory,
  TransactionsTableProps,
} from './types'

export {
  DataTable,
  StatusBadge,
  TablePagination,
  FilterDropdown,
  ColumnsDropdown,
  ActionMenu,
  useDataTableStore,
  // Legacy alias
  DataTable as TransactionsTable,
  useDataTableStore as useTransactionsStore,
}

export default {
  install(app: App, options?: { pinia?: ReturnType<typeof createPinia> }) {
    if (!app.config.globalProperties.$pinia) {
      const pinia = options?.pinia ?? createPinia()
      app.use(pinia)
    }
    app.component('DataTable', DataTable)
    app.component('TransactionsTable', DataTable) // legacy alias
    app.component('StatusBadge', StatusBadge)
    app.component('TablePagination', TablePagination)
    app.component('FilterDropdown', FilterDropdown)
    app.component('ColumnsDropdown', ColumnsDropdown)
    app.component('ActionMenu', ActionMenu)
  },
}
