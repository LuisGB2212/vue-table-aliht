import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DataRow,
  SectionDefinition,
  SectionState,
  DataTableFilter,
  SortState,
  PaginationState,
  ApiPaginatedResponse,
  ApiQueryParams,
  TransactionStatus,
  DisplayMode,
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
function defaultFilters(): DataTableFilter {
  return { search: '', status: [], category: [], dateFrom: '', dateTo: '' }
}

function applyLocalFilters(data: DataRow[], filters: DataTableFilter, sort: SortState): DataRow[] {
  let result = [...data]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(t =>
      Object.values(t).some(v => String(v ?? '').toLowerCase().includes(q))
    )
  }
  if (filters.status?.length) {
    result = result.filter(t => filters.status!.includes(t.status as TransactionStatus))
  }
  if (filters.category?.length) {
    result = result.filter(t => filters.category!.includes(t.category as string))
  }
  if (filters.dateFrom) result = result.filter(t => String(t.date ?? '') >= filters.dateFrom!)
  if (filters.dateTo)   result = result.filter(t => String(t.date ?? '') <= filters.dateTo!)

  if (sort.field) {
    const f = sort.field
    result.sort((a, b) => {
      let av: unknown = a[f]
      let bv: unknown = b[f]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av === bv) return 0
      const cmp = (av as string) < (bv as string) ? -1 : 1
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
export const useDataTableStore = defineStore('dataTable', () => {

  const sections   = ref<Map<string, SectionState>>(new Map())
  const activeKey  = ref<string>('')
  const displayMode = ref<DisplayMode>('paginated')

  // ── Getters ──────────────────────────────────
  const activeSection = computed<SectionState | undefined>(
    () => sections.value.get(activeKey.value)
  )
  const sectionList = computed(() => Array.from(sections.value.values()))

  // ── Init ──────────────────────────────────────
  function _createState(def: SectionDefinition): SectionState {
    return {
      definition: def,
      rows: [],
      accumulatedRows: [],
      loading: false,
      loadingMore: false,
      hasMore: false,
      error: null,
      pagination: defaultPagination(),
      sort: defaultSort(),
      filters: defaultFilters(),
      selectedIds: new Set(),
      filteredRows: [],
    }
  }

  function initSections(defs: SectionDefinition[]) {
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
    if (!activeKey.value || !next.has(activeKey.value)) {
      activeKey.value = defs[0]?.key ?? ''
    }
    for (const def of defs) loadSection(def.key)
  }

  function setDisplayMode(mode: DisplayMode) {
    displayMode.value = mode
    // Reset accumulated rows when switching modes
    for (const s of sections.value.values()) {
      s.accumulatedRows = []
      s.pagination.currentPage = 1
      loadSection(s.definition.key)
    }
  }

  // ── Load ──────────────────────────────────────
  async function loadSection(key: string, append = false) {
    const s = sections.value.get(key)
    if (!s) return
    if (s.definition.source.mode === 'local') {
      _applyLocal(s, append)
    } else {
      await _fetchApi(s, append)
    }
  }

  function _applyLocal(s: SectionState, append = false) {
    const all = (s.definition.source as { mode: 'local'; data: DataRow[] }).data
    s.filteredRows = applyLocalFilters(all, s.filters, s.sort)
    s.pagination.total = s.filteredRows.length
    s.pagination.totalPages = Math.max(1, Math.ceil(s.filteredRows.length / s.pagination.rowsPerPage))
    if (s.pagination.currentPage > s.pagination.totalPages) s.pagination.currentPage = 1

    const start = (s.pagination.currentPage - 1) * s.pagination.rowsPerPage
    const page  = s.filteredRows.slice(start, start + s.pagination.rowsPerPage)

    if (displayMode.value === 'infinite' && append) {
      s.accumulatedRows = [...s.accumulatedRows, ...page]
      s.rows = s.accumulatedRows
    } else {
      s.accumulatedRows = page
      s.rows = page
    }

    s.hasMore = s.pagination.currentPage < s.pagination.totalPages
    s.loading = false
    s.loadingMore = false
    s.error = null
  }

  async function _fetchApi(s: SectionState, append = false) {
    const src = s.definition.source as {
      mode: 'api'
      endpoint: string
      headers?: Record<string, string>
      transform?: (r: unknown) => ApiPaginatedResponse
    }

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

    if (append) s.loadingMore = true
    else        s.loading = true
    s.error = null

    try {
      const res = await fetch(`${src.endpoint}?${buildQueryString(params)}`, {
        headers: src.headers ?? {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const raw    = await res.json()
      const parsed: ApiPaginatedResponse = src.transform ? src.transform(raw) : raw

      if (displayMode.value === 'infinite' && append) {
        s.accumulatedRows = [...s.accumulatedRows, ...parsed.data]
        s.rows = s.accumulatedRows
      } else {
        s.accumulatedRows = parsed.data
        s.rows = parsed.data
      }

      s.pagination.total      = parsed.pagination.total
      s.pagination.totalPages = parsed.pagination.totalPages
      s.pagination.currentPage = parsed.pagination.page
      s.pagination.rowsPerPage = parsed.pagination.perPage
      s.filteredRows           = s.rows
      s.hasMore = s.pagination.currentPage < s.pagination.totalPages
      s.error = null
    } catch (err) {
      s.error = err instanceof Error ? err.message : 'Unknown error'
      if (!append) s.rows = []
    } finally {
      s.loading = false
      s.loadingMore = false
    }
  }

  // ── Infinite scroll: load next page ──────────
  async function loadNextPage(key: string) {
    const s = sections.value.get(key)
    if (!s || s.loadingMore || !s.hasMore) return
    s.pagination.currentPage++
    await loadSection(key, true)
  }

  // ── Navigation ────────────────────────────────
  function setActiveSection(key: string) {
    if (!sections.value.has(key)) return
    activeKey.value = key
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
    // In infinite mode reset accumulated rows
    if (displayMode.value === 'infinite') s.accumulatedRows = []
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
    if (displayMode.value === 'infinite') s.accumulatedRows = []
    loadSection(key)
  }

  // ── Filters ───────────────────────────────────
  function setFilter(key: string, newFilters: Partial<DataTableFilter>) {
    const s = sections.value.get(key)
    if (!s) return
    s.filters = { ...s.filters, ...newFilters }
    s.pagination.currentPage = 1
    if (displayMode.value === 'infinite') s.accumulatedRows = []
    loadSection(key)
  }

  function resetFilters(key: string) {
    const s = sections.value.get(key)
    if (!s) return
    s.filters = defaultFilters()
    s.pagination.currentPage = 1
    if (displayMode.value === 'infinite') s.accumulatedRows = []
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
    const all = s.rows.every(t => s.selectedIds.has(t.id))
    if (all) s.rows.forEach(t => s.selectedIds.delete(t.id))
    else     s.rows.forEach(t => s.selectedIds.add(t.id))
  }

  function clearSelection(key: string) {
    sections.value.get(key)?.selectedIds.clear()
  }

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

  function getSelectedRows(key: string): DataRow[] {
    const s = sections.value.get(key)
    if (!s) return []
    return s.rows.filter(t => s.selectedIds.has(t.id))
  }

  // ── CRUD (local mode) ─────────────────────────
  function addRow(key: string, row: DataRow) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    ;(s.definition.source as { mode: 'local'; data: DataRow[] }).data.unshift(row)
    _applyLocal(s)
  }

  function updateRow(key: string, id: string | number, updates: Partial<DataRow>) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    const arr = (s.definition.source as { mode: 'local'; data: DataRow[] }).data
    const idx = arr.findIndex(t => t.id === id)
    if (idx !== -1) arr[idx] = { ...arr[idx], ...updates }
    _applyLocal(s)
  }

  function deleteRow(key: string, id: string | number) {
    const s = sections.value.get(key)
    if (!s || s.definition.source.mode !== 'local') return
    const src = s.definition.source as { mode: 'local'; data: DataRow[] }
    src.data = src.data.filter(t => t.id !== id)
    s.selectedIds.delete(id)
    _applyLocal(s)
  }

  function refresh(key: string) {
    const s = sections.value.get(key)
    if (!s) return
    if (displayMode.value === 'infinite') s.accumulatedRows = []
    s.pagination.currentPage = 1
    loadSection(key)
  }

  return {
    sections, activeKey, displayMode,
    activeSection, sectionList,
    initSections, setDisplayMode,
    loadSection, loadNextPage,
    setActiveSection,
    setPage, setRowsPerPage,
    setSort,
    setFilter, resetFilters,
    toggleSelect, toggleSelectAll, clearSelection,
    isAllSelected, isIndeterminate, getSelectedRows,
    addRow, updateRow, deleteRow, refresh,
  }
})

// Legacy alias
export { useDataTableStore as useTransactionsStore }
