import type { App, Plugin } from 'vue'
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

const DataTableLib: Plugin = {
  install(app: App, options?: { pinia?: ReturnType<typeof createPinia> }) {
    if (!app.config.globalProperties.$pinia) {
      const pinia = options?.pinia ?? createPinia()
      app.use(pinia)
    }
    app.component('DataTableCorporative', DataTable)
    app.component('StatusBadge', StatusBadge)
    app.component('TablePagination', TablePagination)
    app.component('FilterDropdown', FilterDropdown)
    app.component('ColumnsDropdown', ColumnsDropdown)
    app.component('ActionMenu', ActionMenu)
  },
}

export {
  DataTable,
  StatusBadge,
  TablePagination,
  FilterDropdown,
  ColumnsDropdown,
  ActionMenu,
  useDataTableStore,
}

export default DataTableLib
