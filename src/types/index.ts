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
}

export interface TransactionTab {
  key: string
  label: string
  count?: number
  color?: string
}

export interface PaginationState {
  currentPage: number
  rowsPerPage: number
  totalItems: number
}

export interface SortState {
  field: keyof Transaction | null
  direction: 'asc' | 'desc'
}

export interface TransactionFilter {
  status?: TransactionStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface TransactionsTableProps {
  transactions?: Transaction[]
  loading?: boolean
  tabs?: TransactionTab[]
  showImport?: boolean
  showExport?: boolean
  showCreateButton?: boolean
  createButtonLabel?: string
  title?: string
  currency?: string
  locale?: string
}
