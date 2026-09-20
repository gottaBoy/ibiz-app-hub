/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  h,
  ref,
  watch,
  VNode,
  PropType,
  computed,
  renderSlot,
  onUnmounted,
  defineComponent,
  resolveComponent,
  VNodeArrayChildren,
} from 'vue';
import {
  IDEGrid,
  IDEGridColumn,
  IDEGridGroupColumn,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  GridRowState,
  ScriptFactory,
  GridController,
  IControlProvider,
  GridFieldColumnController,
} from '@ibiz-template/runtime';
import { NOOP, showTitle } from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import { isNotNil } from 'ramda';
import {
  IGridProps,
  useAppGridBase,
  useITableEvent,
  useGridDraggable,
  useGridHeaderStyle,
} from './utils/grid-control.util';
import { useRowEditPopover } from './utils/use-row-edit-popover';
import { usePagination } from './utils/use-pagination';
import { EntityFieldGridController } from './entity-field-grid.controller';
import { entityFieldGridT } from './locale';
import './entity-field-grid.scss';

/**
 * 绘制成员的attrs
 * @author lxm
 * @date 2024-03-19 03:48:00
 * @param {IDEFormDetail} model
 * @return {*}  {IParams}
 */
function renderAttrs(model: IDEGridColumn | IDEGrid, params: IParams): IParams {
  const attrs: IParams = {};
  model.controlAttributes?.forEach(item => {
    // 表格合并行列应该排除由表格内置合并单元格方法处理
    if (item.attrName !== 'span-method') {
      if (item.attrName && item.attrValue) {
        attrs[item.attrName!] = ScriptFactory.execSingleLine(item.attrValue!, {
          ...params,
        });
      }
    }
  });
  return attrs;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderFieldColumn(
  c: GridFieldColumnController,
  row: GridRowState,
) {
  const ns = useNamespace('grid-field-column');
  const fieldValue = row.data[c.fieldName];
  let actionToolbar;
  if (c.model.deuiactionGroup) {
    const onActionClick = (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      return c.onActionClick(detail, row, event);
    };
    const zIndex = c.grid.state.zIndex;
    actionToolbar = (
      <iBizActionToolbar
        class={ns.e('toolbar')}
        action-details={c.model.deuiactionGroup.uiactionGroupDetails}
        actions-state={row.uiActionGroupStates[c.model.codeName!]}
        groupLevelKeys={[50, 100]}
        actionCallBack={onActionClick}
        zIndex={zIndex}
      ></iBizActionToolbar>
    );
  } else {
    actionToolbar = null;
  }

  let content = null;
  const { controlRenders = [] } = c.model;
  const panel = controlRenders.find(
    renderItem => renderItem.renderType === 'LAYOUTPANEL',
  )?.layoutPanel;
  const columnType = c.model.userParam?.columntype;
  if (panel) {
    content = (
      <iBizControlShell
        data={row.data}
        modelData={panel}
        context={c.context}
        params={c.params}
      ></iBizControlShell>
    );
    // 特殊处理附件列
  } else if (columnType === 'attachment') {
    content = (
      <iBizAttachmentColumn data={row.data} value={fieldValue} controller={c} />
    );
  } else {
    const showValue = c.formatValue(fieldValue);
    const tooltip = computed(() => {
      if (
        c.grid.overflowMode === 'ellipsis' &&
        isNotNil(fieldValue) &&
        fieldValue !== ''
      ) {
        return showValue + (c.model.unitName || '');
      }
      return undefined;
    });
    const hiddenEmpty = computed(() => {
      if (fieldValue) {
        if (c.grid.emptyHiddenUnit) {
          if (showValue) {
            return true;
          }
          return false;
        }
        return true;
      }
      return false;
    });
    const percent = computed(() => {
      const { grid, fieldName } = c;
      if (!grid.percentkeys.includes(fieldName)) {
        return '';
      }
      const percentValue = Number(fieldValue);
      if (!Number.isNaN(percentValue)) {
        const { totalResult = {} } = grid.state;
        const total = totalResult[fieldName];
        if (total && !Number.isNaN(total)) {
          return ibiz.util.text.format(`${percentValue / total}`, '0.##%');
        }
      }
      return '';
    });
    const onTextClick = (event: MouseEvent): void => {
      // 阻止触发行点击
      if (c.isLinkColumn) {
        event.stopPropagation();
        c.openLinkView(row, event);
      }
    };
    content = (
      <span
        class={ns.e('text')}
        title={showTitle(tooltip.value)}
        onClick={onTextClick}
      >
        {showValue}
        {hiddenEmpty.value && c.model.unitName}
        {percent.value && `(${percent.value})`}
      </span>
    );
  }
  const onCellClick = (event: MouseEvent): void => {
    if (c.hasAction) {
      event.stopPropagation();
      // 阻止触发行点击
      c.triggerAction(row, event);
    }
  };

  return (
    <div
      class={[
        ns.b(),
        c.clickable(row) && ns.m('clickable'),
        ns.m(c.grid.overflowMode),
        c.model.cellSysCss?.cssName,
        ns.is('has-action', !!c.model.deuiactionGroup),
      ]}
      onClick={onCellClick}
    >
      {c.model.deuiactionGroup
        ? [
            <div class={ns.b('text-container')}>{content}</div>,
            <div class={ns.b('toolbar-container')}>{actionToolbar}</div>,
          ]
        : content}
    </div>
  );
}

// 绘制除分组列之外的表格列
export function renderColumn(
  c: GridController,
  model: IDEGridColumn,
  renderColumns: IDEGridColumn[],
  index: number,
): VNode | null {
  const { codeName: columnName, width } = model;

  // 查缓存，有缓存用缓存，没缓存的用模型
  const columnC = c.columns[columnName!];
  const columnState = c.state.columnStates.find(
    item => item.key === columnName,
  )!;

  // 如果没有配置自适应列，则最后一列变为自适应列
  const widthFlexGrow =
    columnC.isAdaptiveColumn ||
    (!c.hasAdaptiveColumn && index === renderColumns.length - 1);

  const widthName = widthFlexGrow ? 'min-width' : 'width';

  const tempWidth = columnState?.columnWidth || width;
  // 表格列自定义
  return (
    <el-table-column
      className={`${model.columnType?.toLowerCase()} ${model.columnType?.toLowerCase()}-${columnName}`}
      label={model.caption}
      prop={columnName}
      {...{ [widthName]: tempWidth }}
      fixed={columnState.fixed}
      sortable={
        model.enableSort ? c.model.sortMode === 'LOCAL' || 'custom' : false
      }
      sortMethod={(a: IData, b: IData) => {
        const fieldName = model.id!.toLowerCase();
        if (a[fieldName] < b[fieldName] || !a[fieldName]) return -1;
        if (a[fieldName] > b[fieldName] || !b[fieldName]) return 1;
        return 0;
      }}
      align={model.align?.toLowerCase() || 'center'}
    >
      {{
        header: ({ column }: IData) => {
          return (
            <iBizGridColumnHeader key={column.property} controller={columnC} />
          );
        },
        default: ({ row }: IData): VNode | null => {
          let elRow = row; // element表格数据
          if (elRow.isGroupRow)
            return (
              <div class='ibiz-grid-field-column'>
                <span class='ibiz-grid-field-column__text'>{row.caption}</span>
              </div>
            );
          if (row.isGroupData) elRow = row.first;
          const rowState = c.findRowState(elRow);
          if (rowState) {
            // 常规非业务单元格由表格绘制（性能优化）
            if (
              model.columnType === 'DEFGRIDCOLUMN' ||
              model.columnType === 'DEFTREEGRIDCOLUMN'
            ) {
              if (
                c.providers[columnName!].component === 'IBizGridFieldColumn' &&
                !columnC.isCustomCode &&
                !(columnC as GridFieldColumnController).codeList
              ) {
                return renderFieldColumn(
                  columnC as GridFieldColumnController,
                  rowState,
                );
              }
            }
            const comp = resolveComponent(c.providers[columnName!].component);
            return h(comp, {
              controller: columnC,
              row: rowState,
              key: elRow.tempsrfkey + columnName,
              attrs: renderAttrs(model, {
                ...c.getEventArgs(),
                data: rowState.data,
              }),
            });
          }
          return null;
        },
      }}
    </el-table-column>
  );
}

// 绘制表格列
export function renderChildColumn(
  c: GridController,
  model: IDEGridColumn,
  renderColumns: IDEGridColumn[],
  index: number,
): VNode | null {
  if (model.columnType === 'GROUPGRIDCOLUMN') {
    const childColumns =
      (model as IDEGridGroupColumn).degridColumns?.filter(
        item => !item.hideDefault && !item.hiddenDataItem,
      ) || [];
    const { width, codeName } = model;
    const columnC = c.columns[codeName!];
    const align = model.align?.toLowerCase() || 'center';
    return (
      <el-table-column
        prop={model.codeName}
        label={model.caption}
        min-width={width}
        align={align}
      >
        {{
          header: ({ column }: IData) => {
            return (
              <iBizGridColumnHeader
                key={column.property}
                controller={columnC}
              />
            );
          },
          default: (): VNodeArrayChildren => {
            return childColumns.map((column, index2) => {
              return renderChildColumn(c, column, renderColumns, index2);
            });
          },
        }}
      </el-table-column>
    );
  }
  return renderColumn(c, model, renderColumns, index);
}

export const EntityFieldGrid = defineComponent({
  name: 'IBizEntityFieldGrid',
  props: {
    /**
     * @description 表格模型数据
     */
    modelData: { type: Object as PropType<IDEGrid>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否单选
     */
    singleSelect: { type: Boolean, default: undefined },
    /**
     * @description 是否启用行编辑
     */
    rowEditOpen: { type: Boolean, default: undefined },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const c: EntityFieldGridController =
      useControlController<EntityFieldGridController>(
        (...args) => new EntityFieldGridController(...args),
      );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const ns2 = useNamespace('entity-field-grid');

    useControlPopoverzIndex(c);

    const { sysCss } = c.model;
    const sysCssName = sysCss?.cssName;

    const {
      tableRef,
      onRowClick,
      onDbRowClick,
      onSelectionChange,
      onSortChange,
      handleRowClassName,
      handleHeaderCellClassName,
      cleanClick = NOOP,
      cleanEnter = NOOP,
      cleanTab = NOOP,
    } = useITableEvent(c);
    const { onPageChange, onPageRefresh, onPageSizeChange } = usePagination(c);

    const { headerCssVars } = useGridHeaderStyle(tableRef, ns);
    const { cleanup = NOOP, setDragEvent } = useGridDraggable(tableRef, ns, c);

    c.evt.on('onLoadSuccess', () => {
      if (setDragEvent) {
        setDragEvent();
      }
    });

    const renderNoData = (): VNode | null => {
      // 未加载不显示无数据
      const { isLoaded } = c.state;
      if (isLoaded) {
        const quickToolbar = c.model.controls?.find(
          item => item.name === `${c.model.name}_quicktoolbar`,
        );
        if (quickToolbar) {
          return (
            <iBizToolbarControl
              modelData={quickToolbar}
              context={c.context}
              params={c.params}
              class={ns.b('quick-toolbar')}
            ></iBizToolbarControl>
          );
        }
        const noDataSlots: IParams = {};
        if (hasEmptyPanelRenderer(c)) {
          Object.assign(noDataSlots, {
            customRender: () => (
              <IBizCustomRender controller={c}></IBizCustomRender>
            ),
          });
        }
        return (
          <iBizNoData
            text={c.model.emptyText || entityFieldGridT('empty')}
            hideNoDataImage={c.state.hideNoDataImage}
          >
            {noDataSlots}
          </iBizNoData>
        );
      }
      // 给null 表格会绘制默认的无数据
      return <div></div>;
    };
    const {
      tableData,
      renderColumns,
      defaultSort,
      summaryMethod,
      spanMethod,
      headerDragend,
    } = useAppGridBase(c, props as IGridProps, tableRef);

    const { renderPopover } = useRowEditPopover(tableRef, c);

    // 绘制批操作工具栏
    const renderBatchToolBar = (): VNode | undefined => {
      const batchToolbar = c.model.controls?.find(item => {
        return item.name === `${c.model.name!}_batchtoolbar`;
      });
      if (!batchToolbar || c.state.singleSelect) {
        return;
      }
      return (
        <div
          class={[
            ns.b('batch-toolbar'),
            ns.is('show', c.state.selectedData.length > 0),
          ]}
        >
          <div class={ns.b('batch-toolbar-content')}>
            <div class={ns.b('batch-toolbar-text')}>
              {entityFieldGridT('itemsSelected', {
                length: c.state.selectedData.length,
              })}
            </div>
            <div class={ns.b('batch-toolbar-separator')}>|</div>
            <iBizToolbarControl
              modelData={batchToolbar}
              context={c.context}
              params={c.params}
              class={ns.b('batch-toolbar-items')}
            ></iBizToolbarControl>
          </div>
        </div>
      );
    };

    // 绘制表格列
    const renderTableColumn = (
      model: IDEGridColumn,
      index: number,
    ): VNode | null => {
      if (slots[model.id!]) {
        return renderSlot(slots, model.id!, {
          model,
          data: c.state.items,
        });
      }
      return renderChildColumn(c, model, renderColumns.value, index);
    };

    // 绘制拖动图标列
    const renderDragIconColumn = () => {
      return (
        <el-table-column
          class-name={ns.e('drag-icon')}
          type='default'
          width='16'
        >
          {{
            default: () => {
              return (
                <svg
                  viewBox='0 0 16 16'
                  class='icon'
                  xmlns='http://www.w3.org/2000/svg'
                  height='1em'
                  width='1em'
                  focusable='false'
                >
                  <g id='drag-icon/drag--' stroke-width='1' fill-rule='evenodd'>
                    <g
                      id='drag-icon'
                      transform='translate(5 1)'
                      fill-rule='nonzero'
                    >
                      <path
                        d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'
                        id='drag-icon-air'
                      ></path>
                    </g>
                  </g>
                </svg>
              );
            },
          }}
        </el-table-column>
      );
    };

    /**
     * 绘制行明细
     *
     * @return {*}
     */
    const renderRowDetail = () => {
      const { navAppViewId, navViewHeight } = c.model;
      if (navAppViewId && c.state.showRowDetail)
        return (
          <el-table-column type='expand'>
            {{
              default: ({ row }: IData): VNode | null => {
                const { context, params } = c.calcNavParams(row);
                const style = {
                  height: navViewHeight ? `${navViewHeight}px` : 'auto',
                };
                return h(resolveComponent('IBizViewShell'), {
                  style,
                  params,
                  context,
                  viewId: navAppViewId,
                  class: ns.b('row-detail-view'),
                });
              },
            }}
          </el-table-column>
        );
    };

    onUnmounted(() => {
      if (cleanup !== NOOP) cleanup();
      if (cleanClick !== NOOP) cleanClick();
      if (cleanEnter !== NOOP) cleanEnter();
      if (cleanTab !== NOOP) cleanTab();
    });

    // 是否可以加载更多
    const isLodeMoreDisabled = computed(() => {
      if (c.model.pagingMode !== 2) {
        return true;
      }
      return (
        c.state.items.length >= c.state.total ||
        c.state.isLoading ||
        c.state.total <= c.state.size
      );
    });

    // 无限滚动元素
    const infiniteScroll = ref<IData>();
    // 无限滚动元素标识
    const infiniteScrollKey = ref<string>(createUUID());

    watch(
      () => c.state.curPage,
      () => {
        if (
          c.state.curPage === 1 &&
          (c.model.pagingMode === 2 || c.model.pagingMode === 3)
        ) {
          infiniteScrollKey.value = createUUID();
          const containerEl =
            infiniteScroll.value?.ElInfiniteScroll?.containerEl;
          if (containerEl) {
            containerEl.lastScrollTop = 0;
            containerEl.scrollTop = 0;
          }
        }
      },
    );

    return {
      c,
      ns,
      ns2,
      tableRef,
      tableData,
      sysCssName,
      defaultSort,
      renderColumns,
      headerCssVars,
      infiniteScroll,
      infiniteScrollKey,
      isLodeMoreDisabled,
      onRowClick,
      spanMethod,
      onSortChange,
      onDbRowClick,
      onPageChange,
      renderNoData,
      summaryMethod,
      headerDragend,
      renderPopover,
      onPageRefresh,
      renderRowDetail,
      onPageSizeChange,
      renderTableColumn,
      onSelectionChange,
      handleRowClassName,
      renderBatchToolBar,
      renderDragIconColumn,
      handleHeaderCellClassName,
    };
  },
  render() {
    if (!this.c.state.isCreated) {
      return;
    }
    const state = this.c.state;
    const defaultExpandAll = this.c.controlParams.defaultexpandall === 'true';

    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          class={[
            this.ns.b(),
            this.ns2.b(),
            this.ns.is('dynamic-grid', this.c.state.isAutoGrid),
            this.ns.is('show-header', !this.c.state.hideHeader),
            this.ns.is('enable-page', this.c.state.enablePagingBar),
            this.ns.is('enable-group', this.c.state.enableGroup),
            this.ns.is('single-select', state.singleSelect),
            this.ns.is('empty', state.items.length === 0),
            this.ns.is('enable-customized', this.c.model.enableCustomized),
            this.ns.is(
              'group-row-mode',
              this.c.controlParams.grouprowmode === 'NEWROW',
            ),
          ]}
          controller={this.c}
          style={this.headerCssVars}
        >
          {
            <el-table
              border
              ref={'tableRef'}
              data={this.tableData}
              row-key={'tempsrfkey'}
              tooltip-effect={'light'}
              class={this.ns.e('table')}
              scrollbar-always-on={true}
              onRowClick={this.onRowClick}
              span-method={this.spanMethod}
              default-sort={this.defaultSort}
              show-summary={this.c.enableAgg}
              onSortChange={this.onSortChange}
              onRowDblclick={this.onDbRowClick}
              summary-method={this.summaryMethod}
              onHeaderDragend={this.headerDragend}
              default-expand-all={defaultExpandAll}
              show-header={!this.c.state.hideHeader}
              row-class-name={this.handleRowClassName}
              highlight-current-row={state.singleSelect}
              expandRowKeys={this.c.state.expandRowKeys}
              onSelectionChange={this.onSelectionChange}
              header-cell-class-name={this.handleHeaderCellClassName}
              onExpandChange={(row: IData, expanded: boolean) =>
                this.c.expandChange(row, expanded)
              }
              {...this.$attrs}
              {...renderAttrs(this.c.model, {
                ...this.c.getEventArgs(),
              })}
            >
              {{
                empty: this.renderNoData,
                default: (): VNodeArrayChildren => {
                  return [
                    this.c.enableRowEditOrder && this.renderDragIconColumn(),
                    !state.singleSelect && (
                      <el-table-column
                        width='55'
                        align='center'
                        type='selection'
                        reserve-selection={true}
                        class-name={this.ns.e('selection')}
                      ></el-table-column>
                    ),
                    this.renderRowDetail(),
                    this.renderColumns.map((model, index) => {
                      return this.renderTableColumn(model, index);
                    }),
                  ];
                },
                append: () => {
                  return [
                    <div
                      ref={'infiniteScroll'}
                      key={this.infiniteScrollKey}
                      v-infinite-scroll={() => this.c.loadMore()}
                      infinite-scroll-distance={10}
                      infinite-scroll-disabled={this.isLodeMoreDisabled}
                    ></div>,
                    this.c.model.pagingMode === 3 &&
                      !(
                        this.c.state.items.length >= this.c.state.total ||
                        this.c.state.isLoading ||
                        this.c.state.total <= this.c.state.size
                      ) && (
                        <div class={this.ns.e('load-more-button')}>
                          <el-button text onClick={() => this.c.loadMore()}>
                            {entityFieldGridT('loadMore')}
                          </el-button>
                        </div>
                      ),
                    this.c.state.isAutoGrid ? (
                      <el-button
                        type='info'
                        class={this.ns.e('add')}
                        onClick={() => this.c.newRow()}
                      >
                        <ion-icon name='add-outline'></ion-icon>
                        {entityFieldGridT('add')}
                      </el-button>
                    ) : (
                      this.renderPopover()
                    ),
                  ];
                },
              }}
            </el-table>
          }
          {this.c.state.enablePagingBar && (
            <iBizPagination
              total={state.total}
              curPage={state.curPage}
              size={state.size}
              totalPages={state.totalPages}
              onChange={this.onPageChange}
              popperClass={`${this.sysCssName}--popper`}
              onPageSizeChange={this.onPageSizeChange}
              onPageRefresh={this.onPageRefresh}
            ></iBizPagination>
          )}
          {this.c.model.enableCustomized && !this.c.state.hideHeader && (
            <div class={this.ns.b('setting-box')}>
              <iBizGridSetting
                columnStates={state.columnStates}
                controller={this.c}
              ></iBizGridSetting>
            </div>
          )}
          {this.renderBatchToolBar()}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
