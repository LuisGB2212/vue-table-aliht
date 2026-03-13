<template>
  <div
    class="vtt-scope vtt-root vtt-bg-white vtt-rounded-2xl vtt-border vtt-border-neutral-200 vtt-shadow-table vtt-overflow-hidden vtt-flex vtt-flex-col">

    <!-- ── Header ─────────────────────────── -->
    <div class="vtt-px-4 vtt-pt-4 vtt-pb-0 sm:vtt-px-6 sm:vtt-pt-6">

      <!-- Title row + Filter/Columns (always together) -->
      <div class="vtt-items-center vtt-justify-between vtt-gap-2 sm:vtt-mb-4 vtt-mb-2 vtt-block sm:vtt-flex">
        <h2 class="vtt-text-xl vtt-font-bold vtt-text-neutral-900 vtt-tracking-tight vtt-truncate sm:vtt-text-2xl">{{
          title }}</h2>
        <div class="vtt-flex vtt-items-center vtt-gap-2 vtt-flex-shrink-0 vtt-justify-end">
          <FilterDropdown v-if="activeState" :filters="activeState.filters" @update:filter="onFilterUpdate"
            @reset="onFilterReset" />
          <ColumnsDropdown :columns="localColumns" @update:columns="localColumns = $event" />
        </div>
      </div>

      <!-- Section Tabs — scrollable on mobile -->
    </div>
    <div v-if="store.sectionList.length > 1"
      class="vtt-p-1 vtt-bg-neutral-100 vtt-border vtt-border-neutral-200/80 vtt-shadow-inner">
      <nav role="tablist" class="vtt-flex vtt-items-center vtt-gap-1 vtt-overflow-x-auto vtt-scrollbar-none">
        <button v-for="section in store.sectionList" :key="section.definition.key" role="tab"
          :aria-selected="store.activeKey === section.definition.key"
          @click="store.setActiveSection(section.definition.key)" :class="[
            // Base: Botón tipo píldora, transiciones suaves
            'vtt-group vtt-relative vtt-flex vtt-items-center vtt-gap-2.5 vtt-px-4 vtt-py-2.5 vtt-text-sm vtt-font-medium vtt-transition-all vtt-duration-300 vtt-ease-out vtt-whitespace-nowrap vtt-flex-shrink-0 vtt-rounded-lg focus:vtt-outline-none focus-visible:vtt-ring-2 focus-visible:vtt-ring-neutral-950 focus-visible:vtt-ring-offset-2',

            // Estado Activo: Fondo blanco, Sombra, Texto oscuro
            store.activeKey === section.definition.key
              ? 'vtt-bg-white vtt-text-neutral-900 vtt-font-semibold vtt-shadow-md vtt-border vtt-border-neutral-300/80'
              : 'vtt-text-neutral-600 hover:vtt-text-neutral-900 hover:vtt-bg-white hover:vtt-border hover:vtt-border-neutral-200/80'
          ]">
          <span class="vtt-tracking-tight">
            {{ section.definition.title }}
          </span>

          <span v-if="section.pagination.total > 0" :class="[
            'vtt-inline-flex vtt-items-center vtt-justify-center vtt-min-w-[22px] vtt-h-5 vtt-px-1.5 vtt-text-[11px] vtt-rounded-md vtt-font-bold vtt-tabular-nums vtt-transition-colors',
            store.activeKey === section.definition.key
              ? [tabActiveColor(section.definition.color), 'vtt-shadow-inner'] // Pequeña sombra interna si está activo
              : 'vtt-bg-neutral-200 vtt-text-neutral-600 group-hover:vtt-bg-neutral-300'
          ]">
            {{ section.pagination.total }}
          </span>

        </button>
      </nav>
    </div>

    <!-- ── Toolbar ────────────────────────── -->
    <div class="vtt-border-b vtt-border-neutral-100 vtt-bg-neutral-500/10">

      <!-- Mobile toolbar: status + actions stacked -->
      <div class="vtt-flex vtt-flex-col vtt-gap-0 vtt-px-2 vtt-py-2 sm:vtt-hidden">
        <!-- Status info row -->
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <span v-if="activeState?.error"
            class="vtt-text-xs vtt-font-medium vtt-text-red-600 vtt-bg-red-50 vtt-border vtt-border-red-200 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg vtt-flex vtt-items-center vtt-gap-1.5">
            <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
              <path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ activeState.error }}
            <button @click="store.refresh(store.activeKey)" class="vtt-underline">Reintentar</button>
          </span>
          <span v-if="activeState && activeState.selectedIds.size > 0"
            class="vtt-text-xs vtt-font-medium vtt-text-neutral-600 vtt-bg-neutral-100 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg">
            {{ activeState.selectedIds.size }} seleccionados
          </span>
        </div>
        <!-- Action buttons row — all icon-only on mobile -->
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <slot name="toolbar-actions-mobile">
            <button v-if="showImport" @click="emit('import')"
              class="vtt-flex vtt-items-center vtt-justify-center vtt-gap-1.5 vtt-flex-1 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 vtt-transition-all">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Importar
            </button>
            <button v-if="showExport" @click="emit('export')"
              class="vtt-flex vtt-items-center vtt-justify-center vtt-gap-1.5 vtt-flex-1 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 vtt-transition-all">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Exportar
            </button>
            <button v-if="showCreateButton" @click="emit('create')"
              class="vtt-flex vtt-items-center vtt-justify-center vtt-gap-1.5 vtt-flex-1 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-bg-neutral-900 vtt-text-white vtt-text-sm vtt-font-semibold vtt-transition-all vtt-shadow-sm">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              {{ createButtonLabel }}
            </button>
          </slot>
        </div>
      </div>

      <!-- Desktop toolbar: single row -->
      <div class="vtt-hidden vtt-items-center vtt-justify-between vtt-px-6 vtt-py-3 sm:vtt-flex">
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <span v-if="activeState?.error"
            class="vtt-text-xs vtt-font-medium vtt-text-red-600 vtt-bg-red-50 vtt-border vtt-border-red-200 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg vtt-flex vtt-items-center vtt-gap-1.5">
            <svg class="vtt-w-3 vtt-h-3" fill="none" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
              <path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ activeState.error }}
            <button @click="store.refresh(store.activeKey)"
              class="vtt-underline hover:vtt-no-underline">Reintentar</button>
          </span>
          <Transition name="fade">
            <span v-if="activeState && activeState.selectedIds.size > 0"
              class="vtt-text-xs vtt-font-medium vtt-text-neutral-600 vtt-bg-neutral-100 vtt-px-2.5 vtt-py-1.5 vtt-rounded-lg">
              {{ activeState.selectedIds.size }} seleccionados
            </span>
          </Transition>
        </div>
        <div class="vtt-flex vtt-items-center vtt-gap-2">
          <slot name="toolbar-actions">
            <button v-if="showImport" @click="emit('import')"
              class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Importar
              <svg class="vtt-w-3 vtt-h-3 vtt-text-neutral-400" fill="none" viewBox="0 0 12 12">
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
            <button v-if="showCreateButton" @click="emit('create')"
              class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3.5 vtt-py-2 vtt-rounded-lg vtt-bg-neutral-900 vtt-text-white vtt-text-sm vtt-font-medium hover:vtt-bg-neutral-700 vtt-transition-all vtt-shadow-sm">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              {{ createButtonLabel }}
            </button>
            <button v-if="showExport" @click="emit('export')"
              class="vtt-flex vtt-items-center vtt-gap-2 vtt-px-3 vtt-py-2 vtt-rounded-lg vtt-border vtt-border-neutral-200 vtt-bg-white vtt-text-sm vtt-font-medium vtt-text-neutral-600 hover:vtt-border-neutral-300 hover:vtt-text-neutral-900 vtt-transition-all">
              <svg class="vtt-w-4 vtt-h-4" fill="none" viewBox="0 0 16 16">
                <path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Exportar
            </button>
          </slot>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         MOBILE: Expansion Tile Cards
    ══════════════════════════════════════ -->
    <div class="sm:vtt-hidden">

      <!-- Loading cards -->
      <template v-if="activeState?.loading">
        <div v-for="n in 4" :key="n" class="vtt-px-4 vtt-py-4 vtt-border-b vtt-border-neutral-100 vtt-animate-pulse">
          <div class="vtt-flex vtt-items-center vtt-justify-between vtt-mb-2">
            <div class="vtt-h-4 vtt-w-32 vtt-bg-neutral-100 vtt-rounded" />
            <div class="vtt-h-5 vtt-w-16 vtt-bg-neutral-100 vtt-rounded-full" />
          </div>
          <div class="vtt-h-3 vtt-w-48 vtt-bg-neutral-100 vtt-rounded" />
        </div>
      </template>

      <!-- Empty -->
      <template v-else-if="!activeState?.rows.length">
        <div class="vtt-py-16 vtt-flex vtt-flex-col vtt-items-center vtt-gap-3">
          <div
            class="vtt-w-12 vtt-h-12 vtt-rounded-full vtt-bg-neutral-100 vtt-flex vtt-items-center vtt-justify-center">
            <svg class="vtt-w-6 vtt-h-6 vtt-text-neutral-400" fill="none" viewBox="0 0 24 24">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="vtt-text-sm vtt-font-medium vtt-text-neutral-500">No se encontraron registros</p>
          <p class="vtt-text-xs vtt-text-neutral-400">Intente ajustar sus filtros</p>
        </div>
      </template>

      <!-- Expansion Tile Cards -->
      <template v-else>
        <div v-for="row in activeState.rows" :key="row.id"
          class="vtt-border-b vtt-border-neutral-100 vtt-last:vtt-border-0"
          :class="activeState.selectedIds.has(row.id) ? 'vtt-bg-neutral-50/80' : ''">
          <!-- Card Header (always visible — ListTile) -->
          <div class="vtt-flex vtt-items-center vtt-gap-3 vtt-px-4 vtt-py-3.5 vtt-cursor-pointer"
            @click="toggleCard(row.id)">
            <!-- Checkbox -->
            <div v-if="selectable" @click.stop>
              <input type="checkbox" :checked="activeState.selectedIds.has(row.id)"
                :disabled="isRowSelectable && !isRowSelectable(row)"
                @change="handleToggleSelect(row)"
                class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300"
                :class="(isRowSelectable && !isRowSelectable(row)) ? 'vtt-cursor-not-allowed vtt-opacity-50' : 'vtt-cursor-pointer'" />
            </div>

            <!-- Leading content: first two visible data columns -->
            <div class="vtt-flex-1 vtt-min-w-0">
              <div class="vtt-flex vtt-items-start vtt-justify-between vtt-gap-2">
                <!-- Primary field (first visible non-actions col) -->
                <span class="vtt-text-sm vtt-font-semibold vtt-text-neutral-900 vtt-truncate">
                  {{ renderCellText(row, primaryCol) }}
                </span>
                <!-- Status or currency in top-right -->
                <div class="vtt-flex-shrink-0">
                  <template v-if="badgeCol?.type === 'status'">
                    <StatusBadge :status="(row[(badgeCol as DataColumn).field] as TransactionStatus)" />
                  </template>
                  <template v-else-if="badgeCol?.type === 'currency'">
                    <span class="vtt-text-sm vtt-font-bold vtt-text-neutral-900 vtt-font-mono">
                      {{ formatCurrency(row[(badgeCol as DataColumn).field] as number) }}
                    </span>
                  </template>
                  <template v-else-if="badgeCol">
                    <span class="vtt-text-sm vtt-text-neutral-600">{{ renderCellText(row, badgeCol) }}</span>
                  </template>
                </div>
              </div>
              <!-- Secondary field (second visible non-actions col, not same as badge) -->
              <p v-if="secondaryCol" class="vtt-text-xs vtt-text-neutral-500 vtt-truncate vtt-mt-0.5">
                {{ renderCellText(row, secondaryCol) }}
              </p>
            </div>

            <!-- Expand chevron -->
            <svg
              :class="['vtt-w-4 vtt-h-4 vtt-text-neutral-400 vtt-flex-shrink-0 vtt-transition-transform vtt-duration-200', expandedCards.has(row.id) ? 'vtt-rotate-180' : '']"
              fill="none" viewBox="0 0 16 16">
              <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <!-- Expanded detail panel -->
          <Transition name="expand">
            <div v-if="expandedCards.has(row.id)" class="vtt-overflow-hidden">
              <div class="vtt-px-4 vtt-pb-4 vtt-pt-1">
                <div
                  class="vtt-rounded-xl vtt-bg-neutral-50 vtt-border vtt-border-neutral-100 vtt-divide-y vtt-divide-neutral-100">

                  <!-- All visible data columns except primary, secondary, badge (already shown) -->
                  <div v-for="col in detailColumns()" :key="colKey(col)"
                    class="vtt-flex vtt-items-center vtt-justify-between vtt-px-3 vtt-py-2.5 vtt-gap-4">
                    <span
                      class="vtt-text-xs vtt-font-semibold vtt-text-neutral-400 vtt-uppercase vtt-tracking-wider vtt-flex-shrink-0">
                      {{ (col as DataColumn).label }}
                    </span>
                    <div class="vtt-text-sm vtt-text-neutral-800 vtt-text-right vtt-min-w-0">
                      <template v-if="col.type === 'status'">
                        <StatusBadge :status="(row[(col as DataColumn).field] as TransactionStatus)" />
                      </template>
                      <template v-else-if="col.type === 'custom'">
                        <slot :name="`col-${(col as DataColumn).field}`" :value="row[(col as DataColumn).field]"
                          :row="row" :section-key="store.activeKey">
                          {{ row[(col as DataColumn).field] ?? '—' }}
                        </slot>
                      </template>
                      <template v-else>
                        <span
                          :class="col.type === 'currency' || col.type === 'number' ? 'vtt-font-mono vtt-font-semibold' : ''">
                          {{ renderCellText(row, col) }}
                        </span>
                      </template>
                    </div>
                  </div>

                  <!-- Actions row -->
                  <div v-if="hasActionsCol"
                    class="vtt-flex vtt-items-center vtt-justify-end vtt-px-3 vtt-py-2.5 vtt-gap-2">
                    <slot name="col-actions" :row="row" :section-key="store.activeKey">
                      <ActionMenu :row="(row as Transaction)" @action="(a) => emit('action', a, row)" />
                    </slot>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Infinite load-more (mobile) -->
        <template v-if="currentMode === 'infinite'">
          <div v-if="activeState?.loadingMore"
            class="vtt-flex vtt-items-center vtt-justify-center vtt-gap-2 vtt-py-5 vtt-text-sm vtt-text-neutral-500">
            <svg class="vtt-w-4 vtt-h-4 vtt-animate-spin" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28"
                stroke-dashoffset="10" />
            </svg>
            Cargando más...
          </div>
          <div v-else-if="activeState && !activeState.hasMore"
            class="vtt-py-5 vtt-text-center vtt-text-xs vtt-text-neutral-400">
            Todos los {{ activeState.pagination.total }} registros cargados
          </div>
          <div ref="sentinelMobileRef" class="vtt-h-1" />
        </template>
      </template>
    </div>

    <!-- ══════════════════════════════════════
         DESKTOP: Table
    ══════════════════════════════════════ -->
    <div ref="scrollContainerRef"
      :class="`vtt-hidden vtt-overflow-auto vtt-flex-1 sm:vtt-block ${currentMode === 'infinite' ? 'vtt-max-h-[65vh]' : ''}`">
      <table class="vtt-w-full vtt-text-sm vtt-border-collapse">
        <thead class="vtt-sticky vtt-top-0 vtt-z-10 vtt-bg-white">
          <tr class="vtt-border-b vtt-border-neutral-100">
            <th v-if="selectable" class="vtt-w-10 vtt-px-4 vtt-py-3">
              <input type="checkbox" :checked="store.isAllSelected(store.activeKey, isRowSelectable)"
                :indeterminate="store.isIndeterminate(store.activeKey, isRowSelectable)" @change="handleToggleSelectAll"
                class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500 vtt-cursor-pointer" />
            </th>
            <th v-for="col in visibleColumns" :key="colKey(col)"
              @click="isSortable(col) && store.setSort(store.activeKey, (col as DataColumn).field)"
              :style="colStyle(col)" :class="[
                'vtt-px-4 vtt-py-3 vtt-text-xs vtt-font-semibold vtt-text-neutral-500 vtt-uppercase vtt-tracking-wider',
                alignClass(col.align ?? 'left'),
                isSortable(col) ? 'vtt-cursor-pointer hover:vtt-text-neutral-800 vtt-select-none' : '',
                col.headerClass ?? '',
              ]">
              <div
                :class="['vtt-inline-flex vtt-items-center vtt-gap-1', col.align === 'right' ? 'vtt-flex-row-reverse' : '']">
                {{ col.label ?? '' }}
                <span v-if="isSortable(col)" class="vtt-flex vtt-flex-col vtt-gap-px">
                  <svg
                    :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'asc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']"
                    fill="currentColor" viewBox="0 0 8 5">
                    <path d="M4 0L8 5H0L4 0z" />
                  </svg>
                  <svg
                    :class="['vtt-w-2.5 vtt-h-2.5 vtt-transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'desc' ? 'vtt-text-neutral-900' : 'vtt-text-neutral-300']"
                    fill="currentColor" viewBox="0 0 8 5">
                    <path d="M4 5L0 0H8L4 5z" />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="activeState?.loading">
            <tr v-for="n in activeState.pagination.rowsPerPage" :key="n" class="vtt-border-b vtt-border-neutral-50">
              <td v-if="selectable" class="vtt-px-4 vtt-py-3">
                <div class="vtt-w-4 vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse" />
              </td>
              <td v-for="col in visibleColumns" :key="colKey(col)" class="vtt-px-4 vtt-py-3">
                <div class="vtt-h-4 vtt-bg-neutral-100 vtt-rounded vtt-animate-pulse"
                  :style="`width: ${60 + Math.random() * 60}px`" />
              </td>
            </tr>
          </template>

          <template v-else-if="!activeState?.rows.length">
            <tr>
              <td :colspan="visibleColumns.length + (selectable ? 1 : 0)" class="vtt-px-4 vtt-py-16 vtt-text-center">
                <div class="vtt-flex vtt-flex-col vtt-items-center vtt-gap-3">
                  <div
                    class="vtt-w-12 vtt-h-12 vtt-rounded-full vtt-bg-neutral-100 vtt-flex vtt-items-center vtt-justify-center">
                    <svg class="vtt-w-6 vtt-h-6 vtt-text-neutral-400" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <p class="vtt-text-sm vtt-font-medium vtt-text-neutral-500">No se encontraron registros</p>
                  <p class="vtt-text-xs vtt-text-neutral-400">Intente ajustar sus filtros</p>
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr v-for="row in activeState.rows" :key="row.id" :class="[
              'vtt-border-b vtt-border-neutral-50 vtt-transition-colors vtt-cursor-pointer vtt-group',
              activeState.selectedIds.has(row.id) ? 'vtt-bg-neutral-50' : 'hover:vtt-bg-neutral-50/70'
            ]" @click="emit('row-click', row)">
              <td v-if="selectable" class="vtt-px-4 vtt-py-3.5" @click.stop>
                <input type="checkbox" :checked="activeState.selectedIds.has(row.id)"
                  :disabled="isRowSelectable && !isRowSelectable(row)"
                  @change="handleToggleSelect(row)"
                  class="vtt-w-4 vtt-h-4 vtt-rounded vtt-border-neutral-300 vtt-text-neutral-900 focus:vtt-ring-neutral-500"
                  :class="(isRowSelectable && !isRowSelectable(row)) ? 'vtt-cursor-not-allowed vtt-opacity-50' : 'vtt-cursor-pointer'" />
              </td>
              <td v-for="col in visibleColumns" :key="colKey(col)" :style="colStyle(col)" :class="[
                'vtt-px-4 vtt-py-3.5',
                alignClass(col.align ?? 'left'),
                (col as DataColumn).truncate ? 'vtt-truncate vtt-max-w-0' : 'vtt-whitespace-nowrap',
                col.cellClass ?? '',
              ]">
                <template v-if="col.type === 'actions'">
                  <slot name="col-actions" :row="row" :section-key="store.activeKey">
                    <ActionMenu :row="(row as Transaction)" @action="(a) => emit('action', a, row)" />
                  </slot>
                </template>
                <template v-else-if="col.type === 'custom'">
                  <slot :name="`col-${(col as DataColumn).field}`" :value="row[(col as DataColumn).field]" :row="row"
                    :section-key="store.activeKey">
                    {{ row[(col as DataColumn).field] }}
                  </slot>
                </template>
                <template v-else-if="col.type === 'status'">
                  <StatusBadge :status="(row[(col as DataColumn).field] as TransactionStatus)" />
                </template>
                <template v-else-if="(col as DataColumn).format">
                  {{ (col as DataColumn).format!(row[(col as DataColumn).field], row) }}
                </template>
                <template v-else-if="col.type === 'currency'">
                  <span class="vtt-font-semibold vtt-font-mono">{{ formatCurrency(row[(col as DataColumn).field] as
                    number) }}</span>
                </template>
                <template v-else-if="col.type === 'date'">
                  <span class="vtt-font-mono">{{ formatDate(row[(col as DataColumn).field] as string) }}</span>
                </template>
                <template v-else-if="col.type === 'number'">
                  <span class="vtt-font-mono">{{ formatNumber(row[(col as DataColumn).field] as number) }}</span>
                </template>
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

      <!-- Desktop infinite scroll -->
      <template v-if="currentMode === 'infinite'">
        <div v-if="activeState?.loadingMore"
          class="vtt-flex vtt-items-center vtt-justify-center vtt-gap-2 vtt-py-5 vtt-text-sm vtt-text-neutral-500">
          <svg class="vtt-w-4 vtt-h-4 vtt-animate-spin" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28"
              stroke-dashoffset="10" />
          </svg>
          Cargando más...
        </div>
        <div v-else-if="activeState && !activeState.hasMore && activeState.rows.length > 0"
          class="vtt-py-5 vtt-text-center vtt-text-xs vtt-text-neutral-400">
          Todos los {{ activeState.pagination.total }} registros cargados
        </div>
        <div ref="sentinelRef" class="vtt-h-1" />
      </template>
    </div>

    <!-- ── Pagination bar ─────────────────── -->
    <TablePagination v-if="activeState" :current-page="activeState.pagination.currentPage"
      :total-pages="activeState.pagination.totalPages" :total="activeState.pagination.total"
      :rows-per-page="activeState.pagination.rowsPerPage" :mode="currentMode" :shown-count="activeState.rows.length"
      @page="p => store.setPage(store.activeKey, p)" @rows-per-page="r => store.setRowsPerPage(store.activeKey, r)"
      @mode-change="onModeChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useDataTableStore } from '../stores/dataTableStore'
import StatusBadge from './StatusBadge.vue'
import TablePagination from './TablePagination.vue'
import FilterDropdown from './FilterDropdown.vue'
import ColumnsDropdown from './ColumnsDropdown.vue'
import ActionMenu from './ActionMenu.vue'
import type {
  DataRow,
  DataTableProps,
  DataTableFilter,
  ColumnDefinition,
  DataColumn,
  TransactionStatus,
  DisplayMode,
  Transaction,
} from '../types'

const props = withDefaults(defineProps<DataTableProps>(), {
  title: 'Registros',
  showImport: true,
  showExport: true,
  showCreateButton: true,
  createButtonLabel: 'Crear',
  currency: 'USD',
  locale: 'es-MX',
  displayMode: 'paginated',
  storageId: '',
  selectable: true,
})

const emit = defineEmits<{
  (e: 'row-click', row: DataRow): void
  (e: 'create'): void
  (e: 'import'): void
  (e: 'export'): void
  (e: 'action', action: string, row: DataRow): void
  (e: 'selection-change', selected: DataRow[]): void
  (e: 'section-change', key: string): void
}>()

const store = useDataTableStore()

// ── Columns ───────────────────────────────────────────
const localColumns = ref<ColumnDefinition[]>([...props.columns])
watch(() => props.columns, cols => { localColumns.value = [...cols] }, { deep: true })

const visibleColumns = computed<ColumnDefinition[]>(() =>
  localColumns.value.filter(c => c.visible !== false)
)

// ── Mobile card column roles ──────────────────────────
// primaryCol   → title (first visible data col)
// badgeCol     → top-right badge (first status or currency col)
// secondaryCol → subtitle (second visible data col, not same as badge)
// detailColumns → everything else shown in the expanded panel

const visibleDataCols = computed(() =>
  visibleColumns.value.filter(c => c.type !== 'actions') as DataColumn[]
)

const primaryCol = computed<DataColumn | undefined>(() => visibleDataCols.value[0])

const badgeCol = computed<DataColumn | undefined>(() =>
  visibleDataCols.value.find(c => c.type === 'status' || c.type === 'currency')
)

const secondaryCol = computed<DataColumn | undefined>(() => {
  const skip = new Set([primaryCol.value?.field, badgeCol.value?.field])
  return visibleDataCols.value.find(c => !skip.has(c.field))
})

const hasActionsCol = computed(() =>
  visibleColumns.value.some(c => c.type === 'actions')
)

function detailColumns(): ColumnDefinition[] {
  const shown = new Set([
    primaryCol.value?.field,
    badgeCol.value?.field,
    secondaryCol.value?.field,
  ])
  return visibleColumns.value.filter(c => {
    if (c.type === 'actions') return false
    return !shown.has((c as DataColumn).field)
  })
}

// ── Expansion tile state ──────────────────────────────
const expandedCards = ref<Set<string | number>>(new Set())

function toggleCard(id: string | number) {
  if (expandedCards.value.has(id)) expandedCards.value.delete(id)
  else expandedCards.value.add(id)
}

// ── Cell text renderer (for mobile cards) ────────────
function renderCellText(row: DataRow, col: ColumnDefinition | undefined): string {
  if (!col || col.type === 'actions') return '—'
  const dc = col as DataColumn
  const val = row[dc.field]
  if (dc.format) return dc.format(val, row)
  if (dc.type === 'currency') return formatCurrency(val as number)
  if (dc.type === 'date') return formatDate(val as string)
  if (dc.type === 'number') return formatNumber(val as number)
  return String(val ?? '—')
}

// ── Display mode ──────────────────────────────────────
const currentMode = ref<DisplayMode>(props.displayMode)
watch(() => props.displayMode, m => { currentMode.value = m; store.setDisplayMode(m) })

function onModeChange(mode: DisplayMode) {
  currentMode.value = mode
  store.setDisplayMode(mode)
}

// ── Infinite scroll observers (desktop + mobile) ──────
const scrollContainerRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)
const sentinelMobileRef = ref<HTMLElement | null>(null)
let desktopObserver: IntersectionObserver | null = null
let mobileObserver: IntersectionObserver | null = null

function setupObservers() {
  desktopObserver?.disconnect()
  mobileObserver?.disconnect()
  if (currentMode.value !== 'infinite') return

  if (sentinelRef.value) {
    desktopObserver = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) store.loadNextPage(store.activeKey) },
      { root: scrollContainerRef.value, threshold: 0.1 }
    )
    desktopObserver.observe(sentinelRef.value)
  }

  if (sentinelMobileRef.value) {
    mobileObserver = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) store.loadNextPage(store.activeKey) },
      { threshold: 0.1 }
    )
    mobileObserver.observe(sentinelMobileRef.value)
  }
}

watch([currentMode, sentinelRef, sentinelMobileRef], setupObservers, { flush: 'post' })
onMounted(setupObservers)
onUnmounted(() => { desktopObserver?.disconnect(); mobileObserver?.disconnect() })

// ── Column helpers ────────────────────────────────────
function colKey(col: ColumnDefinition): string {
  return col.type === 'actions' ? '__actions__' : (col as DataColumn).field
}
function isSortable(col: ColumnDefinition): boolean {
  if (col.type === 'actions' || col.type === 'custom') return false
  return (col as DataColumn).sortable !== false
}
function colStyle(col: ColumnDefinition): Record<string, string> {
  const s: Record<string, string> = {}
  if (col.width) s.width = col.width
  if ((col as DataColumn).minWidth) s.minWidth = (col as DataColumn).minWidth!
  return s
}
function alignClass(align: string): string {
  if (align === 'right') return 'vtt-text-right'
  if (align === 'center') return 'vtt-text-center'
  return 'vtt-text-left'
}

const tabColorMap: Record<string, string> = {
  red: 'vtt-bg-red-500 vtt-text-white',
  yellow: 'vtt-bg-amber-500 vtt-text-white',
  green: 'vtt-bg-emerald-500 vtt-text-white',
  blue: 'vtt-bg-blue-500 vtt-text-white',
  default: 'vtt-bg-neutral-900 vtt-text-white',
}
function tabActiveColor(color?: string) {
  return tabColorMap[color ?? 'default'] ?? tabColorMap.default
}

// ── Formatters ────────────────────────────────────────
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

// ── State & filters ───────────────────────────────────
const activeState = computed(() => store.activeSection)

function onFilterUpdate(partial: Partial<DataTableFilter>) {
  store.setFilter(store.activeKey, partial)
}
function onFilterReset() {
  store.resetFilters(store.activeKey)
}

function handleToggleSelect(row: DataRow) {
  store.toggleSelect(store.activeKey, row.id, props.isRowSelectable)
}

function handleToggleSelectAll() {
  store.toggleSelectAll(store.activeKey, props.isRowSelectable)
}

watch(() => props.sections, defs => store.initSections(defs), { immediate: true, deep: true })
watch(() => store.activeKey, key => emit('section-change', key))
watch(
  () => activeState.value?.selectedIds.size,
  () => { if (activeState.value) emit('selection-change', store.getSelectedRows(store.activeKey)) }
)

// ── Persistence ───────────────────────────────────────
const STORAGE_KEY = computed(() => props.storageId ? `vtt-table-${props.storageId}` : null)

function saveSettings() {
  if (!STORAGE_KEY.value) return
  const settings = {
    displayMode: currentMode.value,
    columns: localColumns.value.map(c => ({
      ...c,
      format: undefined // Cannot serialize functions
    })),
    sections: {} as Record<string, any>
  }

  store.sectionList.forEach(s => {
    settings.sections[s.definition.key] = {
      filters: s.filters,
      rowsPerPage: s.pagination.rowsPerPage,
      sort: s.sort
    }
  })

  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(settings))
}

function loadSettings() {
  if (!STORAGE_KEY.value) return
  const saved = localStorage.getItem(STORAGE_KEY.value)
  if (!saved) return

  try {
    const settings = JSON.parse(saved)
    if (settings.displayMode) {
      currentMode.value = settings.displayMode
      store.setDisplayMode(settings.displayMode)
    }

    if (settings.columns) {
      // Merge saved visibility/order with current props.columns to keep format functions
      const merged = settings.columns.map((savedCol: any) => {
        const found = props.columns.find(c => colKey(c) === colKey(savedCol))
        if (found) {
          return { ...found, visible: savedCol.visible }
        }
        return null
      }).filter(Boolean)

      // Add any new columns from props that weren't in saved settings
      props.columns.forEach(c => {
        if (!merged.find((m: any) => colKey(m) === colKey(c))) {
          merged.push(c)
        }
      })
      localColumns.value = merged
    }

    if (settings.sections) {
      Object.keys(settings.sections).forEach(key => {
        const s = settings.sections[key]
        if (s.filters) store.setFilter(key, s.filters)
        if (s.rowsPerPage) store.setRowsPerPage(key, s.rowsPerPage)
        if (s.sort && s.sort.field) {
            // A bit hacky since store sort is toggle-based, but we can set it
            const section = store.sections.get(key)
            if (section) {
                section.sort = s.sort
                store.refresh(key)
            }
        }
      })
    }
  } catch (e) {
    console.error('[DataTable] Error loading persisted settings:', e)
  }
}

onMounted(() => {
  if (props.storageId) {
    loadSettings()
  }
})

// Watch for changes to save (debounced manually or just watch deep)
watch([currentMode, localColumns], saveSettings, { deep: true })
// Watch store for filters/pagination changes per section
watch(() => store.sectionList.map(s => ({
  key: s.definition.key,
  filters: s.filters,
  rowsPerPage: s.pagination.rowsPerPage,
  sort: s.sort
})), saveSettings, { deep: true })

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Expansion tile animation */
.expand-enter-active {
  transition: grid-template-rows 0.22s ease, opacity 0.18s ease;
  display: grid;
  grid-template-rows: 1fr;
}

.expand-leave-active {
  transition: grid-template-rows 0.18s ease, opacity 0.15s ease;
  display: grid;
  grid-template-rows: 1fr;
}

.expand-enter-from {
  grid-template-rows: 0fr;
  opacity: 0;
}

.expand-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.expand-enter-active>*,
.expand-leave-active>* {
  overflow: hidden;
}

/* Hide scrollbar on tab row */
.vtt-scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vtt-scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
