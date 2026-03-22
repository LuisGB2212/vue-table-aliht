// ─────────────────────────────────────────────
// Row / record types
// ─────────────────────────────────────────────
export type TransactionStatus =
  | 'new' | 'pending-approval' | 'pending-review'
  | 'approved' | 'finalized' | 'in-progress' | 'rejected'

export type TransactionCategory = string

export interface Transaction {
  id: string | number
  date: string
  transactionNumber: string
  description: string
  amount: number
  category: TransactionCategory
  status: TransactionStatus
  [key: string]: unknown
}

// Generic row — the table works with any record that has an id
export type DataRow = Record<string, unknown> & { id: string | number }

// ─────────────────────────────────────────────
// Column definition
// ─────────────────────────────────────────────
export type ColumnAlign = 'left' | 'center' | 'right'
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'status' | 'custom' | 'actions'

export interface DataColumn {
  field: string
  label: string
  type?: ColumnType
  sortable?: boolean
  align?: ColumnAlign
  width?: string
  minWidth?: string
  truncate?: boolean
  tooltip?: boolean
  cellClass?: string
  headerClass?: string
  /** Default true. If false column is hidden but still listed in Columns panel */
  visible?: boolean
  format?: (value: unknown, row: DataRow) => string
}

export interface ActionsColumn {
  type: 'actions'
  label?: string
  align?: ColumnAlign
  width?: string
  cellClass?: string
  headerClass?: string
  visible?: boolean
}

export type ColumnDefinition = DataColumn | ActionsColumn

// ─────────────────────────────────────────────
// Display mode
// ─────────────────────────────────────────────

/**
 * 'paginated' — classic page buttons (default)
 * 'infinite'  — infinite scroll: when user reaches the end, next page
 *               is appended to the existing rows automatically.
 */
export type DisplayMode = 'paginated' | 'infinite'

/** One option inside a filter group */
export interface FilterOption {
  label: string
  value: string
}

/**
 * A group of checkbox options targeting one row field.
 * @example
 * { title: 'Estado', field: 'status', options: [
 *   { label: 'Aprobado', value: 'approved' },
 * ]}
 */
export interface FilterGroup {
  title: string
  field: string
  options: FilterOption[]
}

/**
 * Date filter config for one row field.
 * @example range  → { field: 'date',      mode: 'range',  labelFrom: 'Desde', labelTo: 'Hasta' }
 * @example single → { field: 'createdAt', mode: 'single', label: 'Fecha exacta' }
 */
export interface FilterDateConfig {
  field: string
  mode: 'range' | 'single'
  title?: string
  label?: string
  labelFrom?: string
  labelTo?: string
}

// ─────────────────────────────────────────────
// API contract
// ─────────────────────────────────────────────
export interface ApiPaginatedResponse<T = DataRow> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiQueryParams {
  page: number
  perPage: number
  search?: string
  sortField?: string
  sortDir?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}

// ─────────────────────────────────────────────
// Section source
// ─────────────────────────────────────────────
export interface SectionLocal {
  mode: 'local'
  data: DataRow[]
}

export interface SectionApi {
  mode: 'api'
  endpoint: string
  headers?: Record<string, string>
  transform?: (raw: unknown) => ApiPaginatedResponse
}

export interface SectionDefinition {
  key: string
  title: string
  color?: 'default' | 'red' | 'yellow' | 'green' | 'blue'
  source: SectionLocal | SectionApi
}

// ─────────────────────────────────────────────
// Runtime state
// ─────────────────────────────────────────────
export interface DataTableFilter {
  search?: string
  /**
   * Dynamic multi-value filters per field.
   * e.g. { status: ['approved', 'rejected'], category: ['Fuel'] }
   */
  fields?: Record<string, string[]>
  /**
   * Dynamic date filters per field.
   * range  → { date: { from: '2024-01-01', to: '2024-12-31' } }
   * single → { createdAt: { exact: '2024-06-15' } }
   */
  dates?: Record<string, { from?: string; to?: string; exact?: string }>
}

export interface SortState {
  field: string | null
  direction: 'asc' | 'desc'
}

export interface PaginationState {
  currentPage: number
  rowsPerPage: number
  total: number
  totalPages: number
}

export interface SectionState {
  definition: SectionDefinition
  rows: DataRow[]
  /** In infinite mode, all accumulated rows so far */
  accumulatedRows: DataRow[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  pagination: PaginationState
  sort: SortState
  filters: DataTableFilter
  selectedIds: Set<string | number>
  filteredRows: DataRow[]
}

// ─────────────────────────────────────────────
// Component props
// ─────────────────────────────────────────────
export interface DataTableProps {
  sections: SectionDefinition[]
  columns: ColumnDefinition[]
  /**
   * 'paginated' (default) — classic pagination controls
   * 'infinite'            — infinite scroll, appends rows on scroll end
   */
  displayMode?: DisplayMode
  title?: string
  showImport?: boolean
  showExport?: boolean
  showCreateButton?: boolean
  createButtonLabel?: string
  currency?: string
  locale?: string
  /** Unique ID to persist table settings to localStorage. If omitted, persistence is disabled. */
  storageId?: string
  /** Whether to show the selection column. Default true. */
  selectable?: boolean
  /** Optional function to determine if a row is selectable. */
  isRowSelectable?: (row: DataRow) => boolean,
  size?: 'sm' | 'md' | 'lg',
  /**
   * Text for the search input. Pass null to hide the search box entirely.
   * Default: shows search with generic placeholder.
   */
  searchPlaceholder?: string | null
  /**
   * Groups of checkbox filters. Each group targets one row field.
   */
  filterGroups?: FilterGroup[]
  /**
   * Date filter configuration. Each entry targets one row field.
   */
  filterDates?: FilterDateConfig[]
}

// Legacy compat alias
export type TransactionsTableProps = DataTableProps
export interface TransactionTab {
  key: string
  label: string
  count?: number
  color?: string
}
