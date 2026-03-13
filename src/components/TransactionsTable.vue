<template>
  <div class="vtt-scope vtt-root vtt-bg-white vtt-rounded-2xl vtt-border vtt-border-neutral-200 vtt-shadow-table vtt-overflow-hidden">

    <!-- Header -->
    <div class="vtt-px-6 vtt-pt-6 vtt-pb-0">
      <div class="vtt-flex vtt-items-center vtt-justify-between vtt-mb-5">
        <h2 class="vtt-text-2xl vtt-font-bold vtt-text-neutral-900 vtt-tracking-tight">{{ title }}</h2>
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <FilterDropdown
            v-if="activeState"
            :filters="activeState.filters"
            @update:filter="onFilterUpdate"
            @reset="onFilterReset"
          />
          <button class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="11.5" width="6" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
            Columns
            <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400" fill="none" viewBox="0 0 12 12">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Section Tabs -->
      <div class="vtt-flex vtt-items-center vtt-border-b vtt-border-neutral-100">
        <button
          v-for="section in store.sectionList"
          :key="section.definition.key"
          @click="store.setActiveSection(section.definition.key)"
          :class="[
            'vtt-relative vtt-flex vtt-items-center vtt-gap-2 vtt-px-4 vtt-py-3 vtt-text-sm vtt-font-medium vtt-transition-colors vtt-whitespace-nowrap',
            store.activeKey === section.definition.key
              ? 'vtt-text-neutral-900'
              : 'vtt-text-neutral-500 hover:vtt-text-neutral-700'
          ]"
        >
          {{ section.definition.title }}
          <span
            v-if="section.pagination.total > 0"
            :class="[
              'vtt-text-xs vtt-px-2 vtt-py-0.5 vtt-rounded-full vtt-font-semibold vtt-tabular-nums vtt-leading-none',
              store.activeKey === section.definition.key
                ? tabActiveColor(section.definition.color)
                : 'vtt-bg-neutral-100 vtt-text-neutral-500'
            ]"
          >{{ section.pagination.total }}</span>
          <span
            v-if="store.activeKey === section.definition.key"
            class="vtt-absolute vtt-bottom-0 vtt-left-0 vtt-right-0 vtt-h-0.5 vtt-bg-neutral-900 vtt-rounded-t-full"
          />
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="vtt-flex vtt-items-center vtt-justify-between vtt-px-6 vtt-py-3 vtt-border-b vtt-border-neutral-100 vtt-bg-neutral-50/50">
      <div class="vtt-flex vtt-items-center vtt-gap-2">
        <span v-if="activeState?.error" class="vtt-text-xs vtt-font-medium vtt-text-red-600 vtt-bg-red-50 vtt-border vtt-border-red-200 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg vtt-flex vtt-items-center vtt-gap-1.5">
          <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          {{ activeState.error }}
          <button @click="store.refresh(store.activeKey)" class="vtt-underline hover:vtt-no-underline">Retry</button>
        </span>
        <Transition name="fade">
          <span v-if="activeState && activeState.selectedIds.size > 0" class="vtt-text-xs vtt-font-medium vtt-text-neutral-600 vtt-bg-neutral-100 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg">
            {{ activeState.selectedIds.size }} selected
          </span>
        </Transition>
      </div>
      <div class="vtt-flex vtt-items-center vtt-gap-2">
        <!-- Named slot for toolbar actions -->
        <slot name="toolbar-actions">
          <button v-if="showImport" @click="emit('import')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Import
            <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400" fill="none" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-if="showCreateButton" @click="emit('create')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3.5 vtt-py-2 vtt-rounded-lg vtt-bg-neutral-900 vtt-text-white vtt-text-sm vtt-font-medium hover:vtt-bg-neutral-700 vtt-transition-all vtt-shadow-sm">
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            {{ createButtonLabel }}
          </button>
          <button v-if="showExport" @click="emit('export')"
            class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
            <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16"><path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Export
          </button>
        </slot>
      </div>
    </div>

    <!-- Table -->
    <div class="vtt-overflow-x-auto">
      <table class="vtt-w-full vtt-text-sm vtt-border-collapse">
        <thead>
          <tr class="vtt-bg-white vtt-border-b vtt-border-neutral-100">
            <!-- Checkbox -->
            <th class="vtt-w-10 vtt-px-4 vtt-py-3">
              <input
                type="checkbox"
                :checked="store.isAllSelected(store.activeKey)"
                :indeterminate="store.isIndeterminate(store.activeKey)"
                @change="store.toggleSelectAll(store.activeKey)"
                class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500 vtt-cursor-pointer"
              />
            </th>

            <!-- Column headers -->
            <th
              v-for="col in visibleColumns"
              :key="colKey(col)"
              @click="isSortable(col) && store.setSort(store.activeKey, (col as DataColumn).field)"
              :style="colStyle(col)"
              :class="[
                'vtt-px-4 vtt-py-3 vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider',
                alignClass(col.align ?? 'left'),
                isSortable(col) ? 'vtt-cursor-pointer hover:vtt-text-neutral-800 vtt-select-none' : '',
                col.headerClass ?? '',
              ]"
            >
              <div :class="['vtt-inline-flex vtt-items-center vtt-gap-1', col.align === 'right' ? 'vtt-flex-row-reverse' : '']">
                {{ col.label ?? '' }}
                <!-- Sort arrows for sortable data columns -->
                <span v-if="isSortable(col)" class="vtt-flex vtt-flex-col vtt-gap-px">
                  <svg :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'asc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']" fill="currentColor" viewBox="0 0 8 5"><path d="M4 0L8 5H0L4 0z"/></svg>
                  <svg :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'desc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']" fill="currentColor" viewBox="0 0 8 5"><path d="M4 5L0 0H8L4 5z"/></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading skeleton -->
          <template v-if="activeState?.loading">
            <tr v-for="n in activeState.pagination.rowsPerPage" :key="n" class="vtt-border-b vtt-border-neutral-50">
              <td class="vtt-px-4 vtt-py-3"><div class="vtt-w-4 vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse"/></td>
              <td v-for="col in visibleColumns" :key="colKey(col)" class="vtt-px-4 vtt-py-3">
                <div class="vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse vtt-w-24"/>
              </td>
            </tr>
          </template>

          <!-- Empty -->
          <template v-else-if="!activeState?.rows.length">
            <tr>
              <td :colspan="visibleColumns.length + 1" class="vtt-px-4 vtt-py-16 vtt-text-center">
                <div class="vtt-flex vtt-flex-col vtt-items-center vtt-gap-3">
                  <div class="vtt-w-12 vtt-h-12 vtt-rounded-full vtt-bg-neutral-100 vtt-flex vtt-items-center vtt-justify-center">
                    <svg class="vtt-w-6 vtt-h-6 vtt-text-neutral-400" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <p class="vtt-text-sm vtt-font-medium vtt-text-neutral-500">No transactions found</p>
                  <p class="vtt-text-xs vtt-text-neutral-400">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else>
            <tr
              v-for="row in activeState.rows"
              :key="row.id"
              :class="[
                'vtt-border-b vtt-border-neutral-50 vtt-transition-colors vtt-cursor-pointer vtt-group',
                activeState.selectedIds.has(row.id) ? 'vtt-bg-neutral-50' : 'hover:vtt-bg-neutral-50/70'
              ]"
              @click="emit('row-click', row)"
            >
              <!-- Checkbox -->
              <td class="vtt-px-4 vtt-py-3.5" @click.stop>
                <input
                  type="checkbox"
                  :checked="activeState.selectedIds.has(row.id)"
                  @change="store.toggleSelect(store.activeKey, row.id)"
                  class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500 vtt-cursor-pointer"
                />
              </td>

              <!-- Data cells -->
              <td
                v-for="col in visibleColumns"
                :key="colKey(col)"
                :style="colStyle(col)"
                :class="[
                  'vtt-px-4 vtt-py-3.5',
                  alignClass(col.align ?? 'left'),
                  (col as DataColumn).truncate ? 'vtt-truncate vtt-max-w-0' : 'vtt-whitespace-nowrap',
                  col.cellClass ?? '',
                ]"
                @click.stop="col.type === 'actions' && null"
              >
                <!-- ACTIONS column — slot: col-actions -->
                <template v-if="col.type === 'actions'">
                  <slot name="col-actions" :row="row" :section-key="store.activeKey">
                    <!-- Default action menu -->
                    <ActionMenu :row="row" @action="(a) => emit('action', a, row)" />
                  </slot>
                </template>

                <!-- CUSTOM column — slot: col-{field} -->
                <template v-else-if="col.type === 'custom'">
                  <slot :name="`col-${(col as DataColumn).field}`" :value="row[(col as DataColumn).field]" :row="row" :section-key="store.activeKey">
                    {{ row[(col as DataColumn).field] }}
                  </slot>
                </template>

                <!-- STATUS column -->
                <template v-else-if="col.type === 'status'">
                  <StatusBadge :status="(row[(col as DataColumn).field] as TransactionStatus)" />
                </template>

                <!-- FORMAT function -->
                <template v-else-if="(col as DataColumn).format">
                  {{ (col as DataColumn).format!(row[(col as DataColumn).field], row) }}
                </template>

                <!-- CURRENCY column -->
                <template v-else-if="col.type === 'currency'">
                  <span class="vtt-font-semibold vtt-font-mono">{{ formatCurrency(row[(col as DataColumn).field] as number) }}</span>
                </template>

                <!-- DATE column -->
                <template v-else-if="col.type === 'date'">
                  <span class="vtt-font-mono">{{ formatDate(row[(col as DataColumn).field] as string) }}</span>
                </template>

                <!-- NUMBER column -->
                <template v-else-if="col.type === 'number'">
                  <span class="vtt-font-mono">{{ formatNumber(row[(col as DataColumn).field] as number) }}</span>
                </template>

                <!-- TEXT (default) -->
                <template v-else>
                  <span :title="(col as DataColumn).tooltip ? String(row[(col as DataColumn).field] ?? '') : undefined">
                    {{ row[(col as DataColumn).field] ?? '—' }}
                  </span>
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <TablePagination
      v-if="activeState"
      :current-page="activeState.pagination.currentPage"
      :total-pages="activeState.pagination.totalPages"
      :total="activeState.pagination.total"
      :rows-per-page="activeState.pagination.rowsPerPage"
      @page="p => store.setPage(store.activeKey, p)"
      @rows-per-page="r => store.setRowsPerPage(store.activeKey, r)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'
import StatusBadge from './StatusBadge.vue'
import TablePagination from './TablePagination.vue'
import FilterDropdown from './FilterDropdown.vue'
import ActionMenu from './ActionMenu.vue'
import type {
  Transaction,
  TransactionsTableProps,
  TransactionFilter,
  ColumnDefinition,
  DataColumn,
  TransactionStatus,
} from '../types'

const props = withDefaults(defineProps<TransactionsTableProps>(), {
  title: 'Transactions',
  showImport: true,
  showExport: true,
  showCreateButton: true,
  createButtonLabel: 'Create transaction',
  currency: 'USD',
  locale: 'en-US',
})

const emit = defineEmits<{
  (e: 'row-click', row: Transaction): void
  (e: 'create'): void
  (e: 'import'): void
  (e: 'export'): void
  (e: 'action', action: string, row: Transaction): void
  (e: 'selection-change', selected: Transaction[]): void
  (e: 'section-change', key: string): void
}>()

const store = useTransactionsStore()

// ── Column helpers ────────────────────────────

/** Only visible columns */
const visibleColumns = computed<ColumnDefinition[]>(() =>
  props.columns.filter(c => c.visible !== false)
)

function colKey(col: ColumnDefinition): string {
  return col.type === 'actions' ? '__actions__' : (col as DataColumn).field
}

function isSortable(col: ColumnDefinition): boolean {
  if (col.type === 'actions' || col.type === 'custom') return false
  return (col as DataColumn).sortable !== false
}

function colStyle(col: ColumnDefinition): Record<string, string> {
  const s: Record<string, string> = {}
  if (col.width)    s.width    = col.width
  if ((col as DataColumn).minWidth) s.minWidth = (col as DataColumn).minWidth!
  return s
}

function alignClass(align: string): string {
  if (align === 'right')  return 'vtt-text-right'
  if (align === 'center') return 'vtt-text-center'
  return 'vtt-text-left'
}

const tabColorMap: Record<string, string> = {
  red:     'vtt-bg-red-500 vtt-text-white',
  yellow:  'vtt-bg-amber-500 vtt-text-white',
  green:   'vtt-bg-emerald-500 vtt-text-white',
  blue:    'vtt-bg-blue-500 vtt-text-white',
  default: 'vtt-bg-neutral-900 vtt-text-white',
}

function tabActiveColor(color?: string) {
  return tabColorMap[color ?? 'default'] ?? tabColorMap.default
}

// ── Formatters ────────────────────────────────

function formatDate(val: string): string {
  try {
    return new Intl.DateTimeFormat(props.locale, { month: '2-digit', day: '2-digit', year: 'numeric' })
      .format(new Date(val.replace(/-/g, '/')))
  } catch { return val }
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat(props.locale, {
    style: 'currency', currency: props.currency, minimumFractionDigits: 2,
  }).format(val)
}

function formatNumber(val: number): string {
  return new Intl.NumberFormat(props.locale).format(val)
}

// ── Active section ────────────────────────────

const activeState = computed(() => store.activeSection)

function onFilterUpdate(partial: Partial<TransactionFilter>) {
  store.setFilter(store.activeKey, partial)
}
function onFilterReset() {
  store.resetFilters(store.activeKey)
}

// ── Watchers ──────────────────────────────────

watch(() => props.sections, defs => store.initSections(defs), { immediate: true, deep: true })
watch(() => store.activeKey, key => emit('section-change', key))
watch(
  () => activeState.value?.selectedIds.size,
  () => { if (activeState.value) emit('selection-change', store.getSelectedTransactions(store.activeKey)) }
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
