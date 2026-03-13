import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Transaction,
  SectionDefinition,
  SectionState,
  TransactionFilter,
  SortState,
  PaginationState,
  ApiPaginatedResponse,
  ApiQueryParams,
  TransactionStatus,
} from '../types'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function defaultPagination(): PaginationState {
  return { currentPage: 1, rowsPerPage: 10, total: 0, totalPages: 0 }
}

function defaultSort(): SortState {
  return { field: null, direction: 'asc' }
}

function defaultFilters(): TransactionFilter {
  return { search: '', status: [], category: [], dateFrom: '', dateTo: '' }
}

function applyLocalFilters(data: Transaction[], filters: TransactionFilter, sort: SortState): Transaction[] {
  let result = [...data]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.transactionNumber.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q),
    )
  }
  if (filters.status?.length) {
    result = result.filter(t => filters.status!.includes(t.status))
  }
  if (filters.category?.length) {
    result = result.filter(t => filters.category!.includes(t.category))
  }
  if (filters.dateFrom) result = result.filter(t => t.date >= filters.dateFrom!)
  if (filters.dateTo)   result = result.filter(t => t.date <= filters.dateTo!)

  if (sort.field) {
    const f = sort.field
    result.sort((a, b) => {
      let av: unknown = a[f]
      let bv: unknown = b[f]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av === bv) return 0
      const cmp = av! < bv! ? -1 : 1
      return sort.direction === 'asc' ? cmp : -cmp
    })
  }
  return result
}

function buildQueryString(params: ApiQueryParams): string {
  const q = new URLSearchParams()
  q.set('page', String(params.page))
  q.set('perPage', String(params.perPage))
  if (params.search)    q.set('search', params.search)
  if (params.status)    q.set('status', params.status)
  if (params.category)  q.set('category', params.category)
  if (params.dateFrom)  q.set('dateFrom', params.dateFrom)
  if (params.dateTo)    q.set('dateTo', params.dateTo)
  if (params.sortField) q.set('sortField', params.sortField)
  if (params.sortDir)   q.set('sortDir', params.sortDir)
  return q.toString()
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useTransactionsStore = defineStore('transactions', () => {

  // Map of sectionKey → SectionState
  const sections = ref<Map<string, SectionState>>(new Map())
  const activeKey = ref<string>('')

  // ── Getters ──────────────────────────────────

  const activeSection = computed<SectionState | undefined>(
    () => sections.value.get(activeKey.value),
  )

  const sectionList = computed(() => Array.from(sections.value.values()))

  // ── Internal: create a blank section state ────

  function _createState(def: SectionDefinition): SectionState {
    return {
      definition: def,
      rows: [],
      loading: false,
      error: null,
      pagination: defaultPagination(),
      sort: defaultSort(),
      filters: defaultFilters(),
      selectedIds: new Set(),
      filteredRows: [],
    }
  }

  // ── Init ──────────────────────────────────────

  function initSections(defs: SectionDefinition[]) {
    // Keep existing states if keys match (avoids resetting on re-render)
    const next = new Map<string, SectionState>()
    for (const def of defs) {
      const existing = sections.value.get(def.key)
      if (existing) {
        existing.definition = def
        next.set(def.key, existing)
      } else {
        next.set(def.key, _createState(def))
      }
    }
    sections.value = next

    // Set active to first section if not set or key no longer exists
    if (!activeKey.value || !next.has(activeKey.value)) {
      activeKey.value = defs[0]?.key ?? ''
    }

    // Load initial data for all sections
    for (const def of defs) {
      loadSection(def.key)
    }
  }

  // ── Load data ─────────────────────────────────

  async function loadSection(key: string) {
    const s = sections.value.get(key)
    if (!s) return

    if (s.definition.source.mode === 'local') {
      _applyLocal(s)
    } else {
      await _fetchApi(s)
    }
  }

  function _applyLocal(s: SectionState) {
    const all = (s.definition.source as { mode: 'local'; data: Transaction[] }).data
    s.filteredRows = applyLocalFilters(all, s.filters, s.sort)
    s.pagination.total = s.filteredRows.length
    s.pagination.totalPages = Math.ceil(s.filteredRows.length / s.pagination.rowsPerPage)
    // Clamp page
    if (s.pagination.currentPage > s.pagination.totalPages) s.pagination.currentPage = 1

    const start = (s.pagination.currentPage - 1) * s.pagination.rowsPerPage
    s.rows = s.filteredRows.slice(start, start + s.pagination.rowsPerPage)
    s.loading = false
    s.error = null
  }

  async function _fetchApi(s: SectionState) {
    const src = s.definition.source as { mode: 'api'; endpoint: string; headers?: Record<string, string>; transform?: (r: unknown) => ApiPaginatedResponse }

    const params: ApiQueryParams = {
      page:      s.pagination.currentPage,
      perPage:   s.pagination.rowsPerPage,
      search:    s.filters.search,
      status:    s.filters.status?.join(','),
      category:  s.filters.category?.join(','),
      dateFrom:  s.filters.dateFrom,
      dateTo:    s.filters.dateTo,
      sortField: s.sort.field ?? undefined,
      sortDir:   s.sort.direction,
    }

    const url = `${src.endpoint}?${buildQueryString(params)}`

    s.loading = true
    s.error = null

    try {
      const res = await fetch(url, { headers: src.headers ?? {} })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const raw = await res.json()

      // Use transform if provided, otherwise expect standard ApiPaginatedResponse shape
      const parsed: ApiPaginatedResponse = src.transform ? src.transform(raw) : raw

      s.rows = parsed.data
      s.pagination.total = parsed.pagination.total
      s.pagination.totalPages = parsed.pagination.totalPages
      s.pagination.currentPage = parsed.pagination.page
      s.pagination.rowsPerPage = parsed.pagination.perPage
      s.filteredRows = parsed.data
      s.error = null
    } catch (err) {
      s.error = err instanceof Error ? err.message : 'Unknown error'
      s.rows = []
    } finally {
      s.loading = false
    }
  }

  // ── Navigation ────────────────────────────────

  function setActiveSection(key: string) {
    if (!sections.value.has(key)) return
    activeKey.value = key
    // Lazy load if no rows yet
    const s = sections.value.get(key)!
    if (s.rows.length === 0 && !s.loading) loadSection(key)
  }

  // ── Pagination ────────────────────────────────

  function setPage(key: string, page: number) {
    const s = sections.value.get(key)
    if (!s) return
    s.pagination.currentPage = page
    loadSection(key)
  }

  function setRowsPerPage(key: string, rows: number) {
    const s = sections.value.get(key)
    if (!s) return
    s.pagination.rowsPerPage = rows
    s.pagination.currentPage = 1
    loadSection(key)
  }

  // ── Sort ──────────────────────────────────────

  function setSort(key: string, field: string) {
    const s = sections.value.get(key)
    if (!s) return
    if (s.sort.field === field) {
      s.sort.direction = s.sort.direction === 'asc' ? 'desc' : 'asc'
    } else {
      s.sort.field = field
      s.sort.direction = 'asc'
    }
    s.pagination.currentPage = 1
    loadSection(key)
  }

  // ── Filters ───────────────────────────────────

  function setFilter(key: string, newFilters: Partial<TransactionFilter>) {
    const s = sections.value.get(key)
    if (!s) return
    s.filters = { ...s.filters, ...newFilters }
    s.pagination.currentPage = 1
    loadSection(key)
  }

  function resetFilters(key: string) {
    const s = sections.value.get(key)
    if (!s) return
    s.filters = defaultFilters()
    s.pagination.currentPage = 1
    loadSection(key)
  }

  // ── Selection ─────────────────────────────────

  function toggleSelect(key: string, id: string | number) {
    const s = sections.value.get(key)
    if (!s) return
    if (s.selectedIds.has(id)) s.selectedIds.delete(id)
    else s.selectedIds.add(id)
  }

  function toggleSelectAll(key: string) {
    const s = sections.value.get(key)
    if (!s) return
    const allSelected = s.rows.every(t => s.selectedIds.has(t.id))
    if (allSelected) s.rows.forEach(t => s.selectedIds.delete(t.id))
    else s.rows.forEach(t => s.selectedIds.add(t.id))
  }

  function clearSelection(key: string) {
    sections.value.get(key)?.selectedIds.clear()
  }

  // Helpers for template
  function isAllSelected(key: string): boolean {
    const s = sections.value.get(key)
    if (!s || s.rows.length === 0) return false
    return s.rows.every(t => s.selectedIds.has(t.id))
  }

  function isIndeterminate(key: string): boolean {
    const s = sections.value.get(key)
    if (!s) return false
    return s.rows.some(t => s.selectedIds.has(t.id)) && !isAllSelected(key)
  }

  function getSelectedTransactions(key: string): Transaction[] {
    const s = sections.value.get(key)
    if (!s) return []
    return s.rows.filter(t => s.selectedIds.has(t.id))
  }

  // ── CRUD ──────────────────────────────────────

  function addTransaction(key: string, tx: Transaction) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    ;(s.definition.source as { mode: 'local'; data: Transaction[] }).data.unshift(tx)
    _applyLocal(s)
  }

  function updateTransaction(key: string, id: string | number, updates: Partial<Transaction>) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    const arr = (s.definition.source as { mode: 'local'; data: Transaction[] }).data
    const idx = arr.findIndex(t => t.id === id)
    if (idx !== -1) arr[idx] = { ...arr[idx], ...updates }
    _applyLocal(s)
  }

  function deleteTransaction(key: string, id: string | number) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    const src = s.definition.source as { mode: 'local'; data: Transaction[] }
    src.data = src.data.filter(t => t.id !== id)
    s.selectedIds.delete(id)
    _applyLocal(s)
  }

  function updateStatus(key: string, id: string | number, status: TransactionStatus) {
    updateTransaction(key, id, { status })
  }

  // ── Refresh (API) ─────────────────────────────

  function refresh(key: string) {
    loadSection(key)
  }

  return {
    // State
    sections,
    activeKey,
    // Getters
    activeSection,
    sectionList,
    // Actions
    initSections,
    loadSection,
    setActiveSection,
    setPage,
    setRowsPerPage,
    setSort,
    setFilter,
    resetFilters,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
    getSelectedTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateStatus,
    refresh,
  }
})
