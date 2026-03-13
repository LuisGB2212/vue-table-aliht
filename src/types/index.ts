// ─────────────────────────────────────────────
// Transaction core types
// ─────────────────────────────────────────────
export type TransactionStatus =
  | 'new'
  | 'pending-approval'
  | 'pending-review'
  | 'approved'
  | 'finalized'
  | 'in-progress'
  | 'rejected'

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

// ─────────────────────────────────────────────
// Column definition
// ─────────────────────────────────────────────

export type ColumnAlign = 'left' | 'center' | 'right'
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'status' | 'custom' | 'actions'

/**
 * A regular data column — bound to a field in the row.
 */
export interface DataColumn {
  /** Field name in the Transaction object. */
  field: string
  /** Header label shown in the table. */
  label: string
  /**
   * Column type. Controls default rendering:
   * - 'text'     → plain string
   * - 'number'   → formatted number
   * - 'currency' → formatted with currency symbol
   * - 'date'     → formatted date
   * - 'status'   → renders <StatusBadge>
   * - 'custom'   → you provide a slot named after `field`
   */
  type?: ColumnType
  /** Whether the column header is clickable to sort. Default: true */
  sortable?: boolean
  /** Text alignment. Default: 'left' */
  align?: ColumnAlign
  /** Fixed pixel or CSS width, e.g. '120px' or '10%' */
  width?: string
  /** Min width, e.g. '80px' */
  minWidth?: string
  /** Truncate content with ellipsis when overflowing */
  truncate?: boolean
  /** Show a tooltip with the full cell value on hover */
  tooltip?: boolean
  /** CSS class(es) applied to every cell in this column */
  cellClass?: string
  /** CSS class(es) applied to the header cell */
  headerClass?: string
  /** Whether the column is visible. Default: true */
  visible?: boolean
  /** Format function — called with the raw value, returns display string */
  format?: (value: unknown, row: Transaction) => string
}

/**
 * An action column — no field, renders a slot or default action menu.
 * Must set type: 'actions'
 */
export interface ActionsColumn {
  type: 'actions'
  /** Label shown in the header. Default: '' */
  label?: string
  /** Align the actions. Default: 'right' */
  align?: ColumnAlign
  /** Fixed width. Default: '60px' */
  width?: string
  /** CSS class(es) applied to every cell */
  cellClass?: string
  /** CSS class(es) applied to the header cell */
  headerClass?: string
  /** Whether the column is visible. Default: true */
  visible?: boolean
}

export type ColumnDefinition = DataColumn | ActionsColumn

// ─────────────────────────────────────────────
// API contract
// ─────────────────────────────────────────────

export interface ApiPaginatedResponse<T = Transaction> {
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
  status?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  sortField?: string
  sortDir?: 'asc' | 'desc'
}

// ─────────────────────────────────────────────
// Section source
// ─────────────────────────────────────────────

export interface SectionLocal {
  mode: 'local'
  data: Transaction[]
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

export interface TransactionFilter {
  search?: string
  status?: TransactionStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
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
  rows: Transaction[]
  loading: boolean
  error: string | null
  pagination: PaginationState
  sort: SortState
  filters: TransactionFilter
  selectedIds: Set<string | number>
  filteredRows: Transaction[]
}

// ─────────────────────────────────────────────
// Component props
// ─────────────────────────────────────────────

export interface TransactionsTableProps {
  sections: SectionDefinition[]
  /**
   * Column definitions. The order here is the order rendered.
   *
   * @example
   * :columns="[
   *   { field: 'date',        label: 'Date',   type: 'date',     sortable: true },
   *   { field: 'description', label: 'Desc',   type: 'text',     truncate: true, width: '200px' },
   *   { field: 'amount',      label: 'Amount', type: 'currency', align: 'right' },
   *   { field: 'status',      label: 'Status', type: 'status',   sortable: false },
   *   { field: 'voucher',     label: 'Voucher',type: 'custom' },  // uses slot name="col-voucher"
   *   { type: 'actions',      label: '',       width: '60px' },   // uses slot name="col-actions"
   * ]"
   */
  columns: ColumnDefinition[]
  title?: string
  showImport?: boolean
  showExport?: boolean
  showCreateButton?: boolean
  createButtonLabel?: string
  currency?: string
  locale?: string
}

// Legacy compat
export interface TransactionTab {
  key: string
  label: string
  count?: number
  color?: string
}
