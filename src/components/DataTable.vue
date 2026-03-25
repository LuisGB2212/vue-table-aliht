<template>
    <div class="scope root bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
        <!-- ── Header ─────────────────────────── -->
        <div class="px-4 pt-4 pb-0 sm:px-6 sm:pt-6">
            <!-- Title row + Filter/Columns (always together) -->
            <div class="items-center justify-between gap-2 sm:mb-4 mb-2 block sm:flex">
                <h2 class="text-xl font-bold text-neutral-900 tracking-tight truncate sm:text-2xl">{{
                    title }}</h2>
                <div class="flex items-center gap-2 flex-shrink-0 justify-end">
                    <FilterDropdown v-if="activeState" :filters="activeState.filters"
                        :filter-groups="filterGroups"
                        :filter-dates="filterDates"
                        :search-placeholder="searchPlaceholder"
                        @update:filter="onFilterUpdate"
                        @reset="onFilterReset" />
                    <ColumnsDropdown :columns="localColumns" @update:columns="localColumns = $event" />
                </div>
            </div>

            <!-- Section Tabs — scrollable on mobile -->
        </div>
        <div v-if="store.sectionList.length > 1" class="p-1 bg-neutral-100 border border-neutral-200/80 shadow-inner">
            <nav role="tablist" class="flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button v-for="section in store.sectionList" :key="section.definition.key" role="tab"
                    :aria-selected="store.activeKey === section.definition.key"
                    @click="store.setActiveSection(section.definition.key)" :class="[
                        // Base: Botón tipo píldora, transiciones suaves
                        'group relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap flex-shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',

                        // Estado Activo: Fondo blanco, Sombra, Texto oscuro
                        store.activeKey === section.definition.key
                            ? 'bg-white text-neutral-900 font-semibold shadow-md border border-neutral-300/80'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-white hover:border hover:border-neutral-200/80'
                    ]">
                    <span class="tracking-tight">
                        {{ section.definition.title }}
                    </span>

                    <span v-if="section.pagination.total > 0" :class="[
                        'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[11px] rounded-md font-bold tabular-nums transition-colors',
                        store.activeKey === section.definition.key
                            ? [tabActiveColor(section.definition.color), 'shadow-inner'] // Pequeña sombra interna si está activo
                            : 'bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300'
                    ]">
                        {{ section.pagination.total }}
                    </span>

                </button>
            </nav>
        </div>

        <!-- ── Toolbar ────────────────────────── -->
        <div class="border-b border-neutral-100 bg-neutral-500/10">
            <!-- Mobile toolbar: status + actions stacked -->
            <div class="flex flex-col gap-0 px-2 py-2 sm:hidden">
                <!-- Status info row -->
                <div class="flex items-center gap-2">
                    <span v-if="activeState?.error"
                        class="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 12 12">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
                            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                        {{ activeState.error }}
                        <button @click="store.refresh(store.activeKey)" class="underline">Reintentar</button>
                    </span>
                    <span v-if="activeState && activeState.selectedIds.size > 0"
                        class="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1.5 rounded-lg">
                        {{ activeState.selectedIds.size }} seleccionados
                    </span>
                </div>
                <!-- Action buttons row — all icon-only on mobile -->
                <div class="flex items-center gap-2">
                    <slot name="toolbar-actions-mobile">
                        <button v-if="showImport" @click="emit('import')"
                            class="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 transition-all">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                            Importar
                        </button>
                        <button v-if="showExport" @click="emit('export')"
                            class="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 transition-all">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                            Exportar
                        </button>
                        <button v-if="showCreateButton" @click="emit('create')"
                            class="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold transition-all shadow-sm">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
                                <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" />
                            </svg>
                            {{ createButtonLabel }}
                        </button>
                    </slot>
                </div>
            </div>

            <!-- Desktop toolbar: single row -->
            <div class="hidden items-center justify-between px-6 py-3 sm:flex">
                <div class="flex items-center gap-2">
                    <span v-if="activeState?.error"
                        class="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 12 12">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5" />
                            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                        {{ activeState.error }}
                        <button @click="store.refresh(store.activeKey)"
                            class="underline hover:no-underline">Reintentar</button>
                    </span>
                    <Transition name="fade">
                        <span v-if="activeState && activeState.selectedIds.size > 0"
                            class="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1.5 rounded-lg">
                            {{ activeState.selectedIds.size }} seleccionados
                        </span>
                    </Transition>
                </div>
                <div class="flex items-center gap-2">
                    <slot name="toolbar-actions">
                        <button v-if="showImport" @click="emit('import')"
                            class="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-all">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                            Importar
                            <svg class="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 12 12">
                                <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button v-if="showCreateButton" @click="emit('create')"
                            class="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-neutral-700 transition-all shadow-sm">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
                                <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" />
                            </svg>
                            {{ createButtonLabel }}
                        </button>
                        <button v-if="showExport" @click="emit('export')"
                            class="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-all">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 16 16">
                                <path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
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
        <div class="sm:hidden">

            <!-- Loading cards -->
            <template v-if="activeState?.loading">
                <div v-for="n in (activeState.pagination.rowsPerPage || 5)" :key="n" class="border-b border-neutral-100 last:border-0 pointer-events-none">
                    <div class="flex items-center gap-3 px-4 py-3.5">
                        <div v-if="selectable" class="flex-shrink-0 animate-pulse">
                            <div class="w-4 h-4 rounded border border-neutral-200 bg-neutral-100/50" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="h-4 bg-neutral-200/80 rounded animate-pulse" :class="['w-1/2', 'w-2/3', 'w-3/5', 'w-2/5'][n % 4]" />
                                <div class="flex-shrink-0">
                                    <div v-if="badgeCol?.type === 'status'" class="w-16 h-5 bg-neutral-200/80 rounded-full animate-pulse" />
                                    <div v-else class="w-12 h-4 bg-neutral-200/80 rounded animate-pulse" />
                                </div>
                            </div>
                            <div class="h-3 bg-neutral-200/50 rounded animate-pulse mt-2" :class="['w-1/3', 'w-1/4', 'w-2/5', 'w-1/2'][n % 4]" />
                        </div>
                        <div class="w-4 h-4 rounded flex-shrink-0 bg-neutral-200/80 animate-pulse" />
                    </div>
                </div>
            </template>

            <!-- Empty -->
            <template v-else-if="!activeState?.rows.length">
                <div class="py-16 flex flex-col items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                        <svg class="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24">
                            <path
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <p class="text-sm font-medium text-neutral-500">No se encontraron registros</p>
                    <p class="text-xs text-neutral-400">Intente ajustar sus filtros</p>
                </div>
            </template>

            <!-- Expansion Tile Cards -->
            <template v-else>
                <div v-for="row in activeState.rows" :key="row.id" class="border-b border-neutral-100 last:border-0"
                    :class="activeState.selectedIds.has(row.id) ? 'bg-neutral-50/80' : ''">
                    <!-- Card Header (always visible — ListTile) -->
                    <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer" @click="toggleCard(row.id)">
                        <!-- Checkbox -->
                        <div v-if="selectable" @click.stop>
                            <input type="checkbox" :checked="activeState.selectedIds.has(row.id)"
                                :disabled="isRowSelectable && !isRowSelectable(row)" @change="handleToggleSelect(row)"
                                class="w-4 h-4 rounded border-neutral-300"
                                :class="(isRowSelectable && !isRowSelectable(row)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'" />
                        </div>

                        <!-- Leading content: first two visible data columns -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <!-- Primary field (first visible non-actions col) -->
                                <span class="text-sm font-semibold text-neutral-900 truncate">
                                    {{ renderCellText(row, primaryCol) }}
                                </span>
                                <!-- Status or currency in top-right -->
                                <div class="flex-shrink-0">
                                    <template v-if="badgeCol?.type === 'status'">
                                        <StatusBadge
                                            :status="(row[(badgeCol as DataColumn).field] as TransactionStatus)" />
                                    </template>
                                    <template v-else-if="badgeCol?.type === 'currency'">
                                        <span class="text-sm font-bold text-neutral-900 font-mono">
                                            {{ formatCurrency(row[(badgeCol as DataColumn).field] as number) }}
                                        </span>
                                    </template>
                                    <template v-else-if="badgeCol">
                                        <span class="text-sm text-neutral-600">{{ renderCellText(row, badgeCol)
                                            }}</span>
                                    </template>
                                </div>
                            </div>
                            <!-- Secondary field (second visible non-actions col, not same as badge) -->
                            <p v-if="secondaryCol" class="text-xs text-neutral-500 truncate mt-0.5">
                                {{ renderCellText(row, secondaryCol) }}
                            </p>
                        </div>

                        <!-- Expand chevron -->
                        <svg :class="['w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200', expandedCards.has(row.id) ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 16 16">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>

                    <!-- Expanded detail panel -->
                    <Transition name="expand">
                        <div v-if="expandedCards.has(row.id)" class="overflow-hidden">
                            <div class="px-4 pb-4 pt-1">
                                <div
                                    class="rounded-xl bg-neutral-50 border border-neutral-100 divide-y divide-neutral-100">

                                    <!-- All visible data columns except primary, secondary, badge (already shown) -->
                                    <div v-for="col in detailColumns()" :key="colKey(col)"
                                        class="flex items-center justify-between px-3 py-2.5 gap-4">
                                        <span
                                            class="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-shrink-0">
                                            {{ (col as DataColumn).label }}
                                        </span>
                                        <div class="text-sm text-neutral-800 text-right min-w-0">
                                            <template v-if="col.type === 'status'">
                                                <StatusBadge
                                                    :status="(row[(col as DataColumn).field] as TransactionStatus)" />
                                            </template>
                                            <template v-else-if="col.type === 'custom'">
                                                <slot :name="`col-${(col as DataColumn).field}`"
                                                    :value="row[(col as DataColumn).field]" :row="row"
                                                    :section-key="store.activeKey">
                                                    {{ row[(col as DataColumn).field] ?? '—' }}
                                                </slot>
                                            </template>
                                            <template v-else>
                                                <span
                                                    :class="col.type === 'currency' || col.type === 'number' ? 'font-mono font-semibold' : ''">
                                                    {{ renderCellText(row, col) }}
                                                </span>
                                            </template>
                                        </div>
                                    </div>

                                    <!-- Actions row -->
                                    <div v-if="hasActionsCol" class="flex items-center justify-end px-3 py-2.5 gap-2">
                                        <slot name="col-actions" :row="row" :section-key="store.activeKey">
                                            <ActionMenu :row="(row as Transaction)"
                                                @action="(a) => emit('action', a, row)" />
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
                        class="flex items-center justify-center gap-2 py-5 text-sm text-neutral-500">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 16 16">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28"
                                stroke-dashoffset="10" />
                        </svg>
                        Cargando más...
                    </div>
                    <div v-else-if="activeState && !activeState.hasMore"
                        class="py-5 text-center text-xs text-neutral-400">
                        Todos los {{ activeState.pagination.total }} registros cargados
                    </div>
                    <div ref="sentinelMobileRef" class="h-1" />
                </template>
            </template>
        </div>

        <!-- ══════════════════════════════════════
         DESKTOP: Table
    ══════════════════════════════════════ -->
        <div ref="scrollContainerRef"
            :class="`hidden overflow-auto flex-1 sm:block ${currentMode === 'infinite' ? 'max-h-[65vh]' : ''}`">
            <table class="w-full text-sm border-collapse">
                <thead class="sticky top-0 z-10 bg-white">
                    <tr class="border-b border-neutral-300">
                        <th v-if="selectable" :class="`w-10 ${sizeTable[size]}`">
                            <input type="checkbox" :checked="store.isAllSelected(store.activeKey, isRowSelectable)"
                                :indeterminate="store.isIndeterminate(store.activeKey, isRowSelectable)"
                                @change="handleToggleSelectAll"
                                class="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500 cursor-pointer" />
                        </th>
                        <th v-for="col in visibleColumns" :key="colKey(col)"
                            @click="isSortable(col) && store.setSort(store.activeKey, (col as DataColumn).field)"
                            :style="colStyle(col)" :class="[
                                `${sizeTable[size]} text-xs font-bold text-neutral-900 uppercase`,
                                alignClass(col.align ?? 'left'),
                                isSortable(col) ? 'cursor-pointer hover:text-neutral-500 select-none' : '',
                                col.headerClass ?? '',
                            ]">
                            <div
                                :class="['inline-flex items-center gap-1', col.align === 'right' ? 'flex-row-reverse' : '']">
                                {{ col.label ?? '' }}
                                <span v-if="isSortable(col)" class="flex flex-col gap-px">
                                    <svg :class="['w-2.5 h-2.5 transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'asc' ? 'text-neutral-900' : 'text-neutral-300']"
                                        fill="currentColor" viewBox="0 0 8 5">
                                        <path d="M4 0L8 5H0L4 0z" />
                                    </svg>
                                    <svg :class="['w-2.5 h-2.5 transition-colors', activeState?.sort.field === (col as DataColumn).field && activeState?.sort.direction === 'desc' ? 'text-neutral-900' : 'text-neutral-300']"
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
                        <tr v-for="n in (activeState.pagination.rowsPerPage || 10)" :key="n" class="border-b border-neutral-100 pointer-events-none">
                            <td v-if="selectable" :class="sizeTable[size]">
                                <div class="w-4 h-4 rounded border border-neutral-200 bg-neutral-100/50 animate-pulse" />
                            </td>
                            <td v-for="(col, i) in visibleColumns" :key="colKey(col)" :style="colStyle(col)" :class="[
                                `${sizeTable[size]}`,
                                alignClass(col.align ?? 'left'),
                                col.cellClass ?? ''
                            ]">
                                <div class="flex w-full" :class="[
                                    col.align === 'center' ? 'justify-center' : (col.align === 'right' ? 'justify-end' : 'justify-start')
                                ]">
                                    <template v-if="col.type === 'actions'">
                                        <div class="flex items-center gap-2">
                                            <div class="w-5 h-5 bg-neutral-200/80 rounded animate-pulse" />
                                            <div class="w-5 h-5 bg-neutral-200/80 rounded animate-pulse" />
                                        </div>
                                    </template>
                                    <template v-else-if="col.type === 'status'">
                                        <div class="w-20 h-5 bg-neutral-200/80 rounded-full animate-pulse" />
                                    </template>
                                    <template v-else-if="col.type === 'currency'">
                                        <div class="w-16 h-4 bg-neutral-200/80 rounded animate-pulse" />
                                    </template>
                                    <template v-else-if="col.type === 'date'">
                                        <div class="w-20 h-4 bg-neutral-200/80 rounded animate-pulse" />
                                    </template>
                                    <template v-else>
                                        <div class="h-4 bg-neutral-200/80 rounded animate-pulse"
                                            :style="`width: ${['40%', '60%', '75%', '50%'][(n + i) % 4]}`" />
                                    </template>
                                </div>
                            </td>
                        </tr>
                    </template>

                    <template v-else-if="!activeState?.rows.length">
                        <tr>
                            <td :colspan="visibleColumns.length + (selectable ? 1 : 0)" class="px-4 py-16 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <div class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <svg class="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24">
                                            <path
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <p class="text-sm font-medium text-neutral-500">No se encontraron registros</p>
                                    <p class="text-xs text-neutral-400">Intente ajustar sus filtros</p>
                                </div>
                            </td>
                        </tr>
                    </template>

                    <template v-else>
                        <tr v-for="row in activeState.rows" :key="row.id" :class="[
                            'border-b border-neutral-100 transition-colors cursor-pointer group',
                            activeState.selectedIds.has(row.id) ? 'bg-neutral-100' : 'hover:bg-neutral-100'
                        ]" @click="emit('row-click', row)">
                            <td v-if="selectable" :class="`${sizeTable[size]}`" @click.stop>
                                <input type="checkbox" :checked="activeState.selectedIds.has(row.id)"
                                    :disabled="isRowSelectable && !isRowSelectable(row)"
                                    @change="handleToggleSelect(row)"
                                    class="w-4 h-4 rounded border-neutral-200 text-neutral-900 focus:ring-neutral-500"
                                    :class="(isRowSelectable && !isRowSelectable(row)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'" />
                            </td>
                            <td v-for="col in visibleColumns" :key="colKey(col)" :style="colStyle(col)" :class="[
                                `${sizeTable[size]}`,
                                alignClass(col.align ?? 'left'),
                                (col as DataColumn).truncate ? 'truncate max-w-0' : 'whitespace-nowrap',
                                col.cellClass ?? '',
                            ]">
                                <template v-if="col.type === 'actions'">
                                    <slot name="col-actions" :row="row" :section-key="store.activeKey">
                                        <ActionMenu :row="(row as Transaction)"
                                            @action="(a) => emit('action', a, row)" />
                                    </slot>
                                </template>
                                <template v-else-if="col.type === 'custom'">
                                    <slot :name="`col-${(col as DataColumn).field}`"
                                        :value="row[(col as DataColumn).field]" :row="row"
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
                                    <span class="font-semibold font-mono">{{ formatCurrency(row[(col as
                                        DataColumn).field] as
                                        number) }}</span>
                                </template>
                                <template v-else-if="col.type === 'date'">
                                    <span class="font-mono">{{ formatDate(row[(col as DataColumn).field] as string)
                                        }}</span>
                                </template>
                                <template v-else-if="col.type === 'number'">
                                    <span class="font-mono">{{ formatNumber(row[(col as DataColumn).field] as number)
                                        }}</span>
                                </template>
                                <template v-else>
                                    <span
                                        :title="(col as DataColumn).tooltip ? String(row[(col as DataColumn).field] ?? '') : undefined">
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
                    class="flex items-center justify-center gap-2 py-5 text-sm text-neutral-500">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28"
                            stroke-dashoffset="10" />
                    </svg>
                    Cargando más...
                </div>
                <div v-else-if="activeState && !activeState.hasMore && activeState.rows.length > 0"
                    class="py-5 text-center text-xs text-neutral-400">
                    Todos los {{ activeState.pagination.total }} registros cargados
                </div>
                <div ref="sentinelRef" class="h-1" />
            </template>
        </div>

        <!-- ── Pagination bar ─────────────────── -->
        <TablePagination v-if="activeState" :current-page="activeState.pagination.currentPage"
            :total-pages="activeState.pagination.totalPages" :total="activeState.pagination.total"
            :rows-per-page="activeState.pagination.rowsPerPage" :mode="currentMode"
            :shown-count="activeState.rows.length" @page="p => store.setPage(store.activeKey, p)"
            @rows-per-page="r => store.setRowsPerPage(store.activeKey, r)" @mode-change="onModeChange" />
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
    showImport: false,
    showExport: false,
    showCreateButton: false,
    createButtonLabel: 'Crear',
    currency: 'USD',
    locale: 'es-MX',
    displayMode: 'paginated',
    storageId: '',
    selectable: true,
    size: 'md',
    searchPlaceholder: undefined,   // undefined = show with default text; null = hide search box
    filterGroups: () => [],
    filterDates: () => [],
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

const sizeTable: Record<string, string> = {
    sm: "px-4 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3.5 text-md"
};

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
    if (align === 'right') return 'text-right'
    if (align === 'center') return 'text-center'
    return 'text-left'
}

const tabColorMap: Record<string, string> = {
    red: 'bg-red-500 text-white',
    yellow: 'bg-amber-500 text-white',
    green: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    default: 'bg-primary text-white',
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
const STORAGE_KEY = computed(() => props.storageId ? `table-${props.storageId}` : null)

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
.scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.scrollbar-none::-webkit-scrollbar {
    display: none;
}
</style>
