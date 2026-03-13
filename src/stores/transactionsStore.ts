import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Transaction,
  PaginationState,
  SortState,
  TransactionFilter,
  TransactionStatus,
} from '../types'

export const useTransactionsStore = defineStore('transactions', () => {
  // --- State ---
  const allTransactions = ref<Transaction[]>([])
  const selectedIds = ref<Set<string | number>>(new Set())
  const activeTab = ref<string>('all')
  const loading = ref(false)

  const pagination = ref<PaginationState>({
    currentPage: 1,
    rowsPerPage: 10,
    totalItems: 0,
  })

  const sort = ref<SortState>({
    field: null,
    direction: 'asc',
  })

  const filters = ref<TransactionFilter>({
    status: [],
    category: [],
    dateFrom: '',
    dateTo: '',
    search: '',
  })

  // --- Getters ---
  const filteredByTab = computed(() => {
    if (activeTab.value === 'all') return allTransactions.value
    if (activeTab.value === 'pending-review')
      return allTransactions.value.filter((t) => t.status === 'pending-review')
    if (activeTab.value === 'pending-approval')
      return allTransactions.value.filter((t) => t.status === 'pending-approval')
    if (activeTab.value === 'approved')
      return allTransactions.value.filter((t) => t.status === 'approved')
    return allTransactions.value.filter((t) => t.status === activeTab.value)
  })

  const filteredTransactions = computed(() => {
    let result = [...filteredByTab.value]

    if (filters.value.search) {
      const q = filters.value.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.transactionNumber.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }

    if (filters.value.status && filters.value.status.length > 0) {
      result = result.filter((t) => filters.value.status!.includes(t.status))
    }

    if (filters.value.category && filters.value.category.length > 0) {
      result = result.filter((t) => filters.value.category!.includes(t.category))
    }

    if (filters.value.dateFrom) {
      result = result.filter((t) => t.date >= filters.value.dateFrom!)
    }

    if (filters.value.dateTo) {
      result = result.filter((t) => t.date <= filters.value.dateTo!)
    }

    if (sort.value.field) {
      const field = sort.value.field
      result.sort((a, b) => {
        let av = a[field]
        let bv = b[field]
        if (typeof av === 'string') av = av.toLowerCase()
        if (typeof bv === 'string') bv = bv.toLowerCase()
        if (av < bv) return sort.value.direction === 'asc' ? -1 : 1
        if (av > bv) return sort.value.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  })

  const paginatedTransactions = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage
    const end = start + pagination.value.rowsPerPage
    return filteredTransactions.value.slice(start, end)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredTransactions.value.length / pagination.value.rowsPerPage),
  )

  const isAllSelected = computed(
    () =>
      paginatedTransactions.value.length > 0 &&
      paginatedTransactions.value.every((t) => selectedIds.value.has(t.id)),
  )

  const isIndeterminate = computed(
    () =>
      paginatedTransactions.value.some((t) => selectedIds.value.has(t.id)) &&
      !isAllSelected.value,
  )

  const tabCounts = computed(() => ({
    all: allTransactions.value.length,
    'pending-review': allTransactions.value.filter((t) => t.status === 'pending-review').length,
    'pending-approval': allTransactions.value.filter((t) => t.status === 'pending-approval')
      .length,
    approved: allTransactions.value.filter((t) => t.status === 'approved').length,
  }))

  const selectedTransactions = computed(() =>
    allTransactions.value.filter((t) => selectedIds.value.has(t.id)),
  )

  const uniqueCategories = computed(() => [
    ...new Set(allTransactions.value.map((t) => t.category)),
  ])

  // --- Actions ---
  function setTransactions(data: Transaction[]) {
    allTransactions.value = data
    pagination.value.totalItems = data.length
    pagination.value.currentPage = 1
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setActiveTab(tab: string) {
    activeTab.value = tab
    pagination.value.currentPage = 1
    selectedIds.value.clear()
  }

  function toggleSelect(id: string | number) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function toggleSelectAll() {
    if (isAllSelected.value) {
      paginatedTransactions.value.forEach((t) => selectedIds.value.delete(t.id))
    } else {
      paginatedTransactions.value.forEach((t) => selectedIds.value.add(t.id))
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function setPage(page: number) {
    pagination.value.currentPage = page
  }

  function setRowsPerPage(rows: number) {
    pagination.value.rowsPerPage = rows
    pagination.value.currentPage = 1
  }

  function setSort(field: keyof Transaction) {
    if (sort.value.field === field) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.field = field
      sort.value.direction = 'asc'
    }
  }

  function setFilter(newFilters: Partial<TransactionFilter>) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
  }

  function resetFilters() {
    filters.value = { status: [], category: [], dateFrom: '', dateTo: '', search: '' }
    pagination.value.currentPage = 1
  }

  function addTransaction(transaction: Transaction) {
    allTransactions.value.unshift(transaction)
    pagination.value.totalItems = allTransactions.value.length
  }

  function updateTransaction(id: string | number, updates: Partial<Transaction>) {
    const idx = allTransactions.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      allTransactions.value[idx] = { ...allTransactions.value[idx], ...updates }
    }
  }

  function deleteTransaction(id: string | number) {
    allTransactions.value = allTransactions.value.filter((t) => t.id !== id)
    pagination.value.totalItems = allTransactions.value.length
    selectedIds.value.delete(id)
  }

  function updateStatus(id: string | number, status: TransactionStatus) {
    updateTransaction(id, { status })
  }

  return {
    // State
    allTransactions,
    selectedIds,
    activeTab,
    loading,
    pagination,
    sort,
    filters,
    // Getters
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    isAllSelected,
    isIndeterminate,
    tabCounts,
    selectedTransactions,
    uniqueCategories,
    // Actions
    setTransactions,
    setLoading,
    setActiveTab,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    setPage,
    setRowsPerPage,
    setSort,
    setFilter,
    resetFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateStatus,
  }
})
