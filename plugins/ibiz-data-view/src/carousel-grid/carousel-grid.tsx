import {
  useControlController,
  useNamespace,
  useUIStore,
} from '@ibiz-template/vue3-util';
import {
  defineComponent,
  PropType,
  computed,
  VNode,
  ref,
  watch,
  VNodeArrayChildren,
  resolveComponent,
  h,
  renderSlot,
  onUnmounted,
} from 'vue';
import { IDEGrid, IDEGridColumn, IDEGridGroupColumn } from '@ibiz/model-core';
import { createUUID } from 'qx-util';
import {
  GridController,
  IControlProvider,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { NOOP } from '@ibiz-template/core';
import './carousel-grid.scss';
import {
  IGridProps,
  useAppGridBase,
  useGridDraggable,
  useGridHeaderStyle,
  useITableEvent,
} from './grid-control.util';
import { CarouselGridController } from './carousel-grid.controller';

/**
 * 绘制成员的attrs
 * @author lxm
 * @date 2024-03-19 03:48:00
 * @param {IDEFormDetail} model
 * @return {*}  {IParams}
 */
function renderAttrs(model: IDEGridColumn, params: IParams): IParams {
  const attrs: IParams = {};
  model.controlAttributes?.forEach(item => {
    if (item.attrName && item.attrValue) {
      attrs[item.attrName!] = ScriptFactory.execSingleLine(item.attrValue!, {
        ...params,
      });
    }
  });
  return attrs;
}

// 绘制除分组列之外的表格列
export function renderColumn(
  c: GridController,
  model: IDEGridColumn,
  renderColumns: IDEGridColumn[],
  index: number,
): VNode | null {
  const { codeName: columnName, width } = model;
  const columnC = c.columns[columnName!];
  const columnState = c.state.columnStates.find(
    item => item.key === columnName,
  )!;

  // 如果没有配置自适应列，则最后一列变为自适应列
  const widthFlexGrow =
    columnC.isAdaptiveColumn ||
    (!c.hasAdaptiveColumn && index === renderColumns.length - 1);

  const widthName = widthFlexGrow ? 'min-width' : 'width';
  // 表格列自定义
  return (
    <el-table-column
      label={model.caption}
      prop={columnName}
      {...{ [widthName]: width }}
      fixed={columnState.fixed}
      sortable={model.enableSort ? 'custom' : false}
      align={model.align?.toLowerCase() || 'center'}
    >
      {{
        default: ({ row }: IData): VNode | null => {
          let elRow = row; // element表格数据
          if (row.isGroupData) {
            // 有第一条数据时，分组那一行绘制第一条数据
            elRow = row.first;
          }

          const rowState = c.findRowState(elRow);
          if (rowState) {
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
    const { width } = model;
    const align = model.align?.toLowerCase() || 'center';
    return (
      <el-table-column
        prop={model.codeName}
        label={model.caption}
        min-width={width}
        align={align}
      >
        {{
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

export const CarouselGrid = defineComponent({
  name: 'CarouselGrid',
  props: {
    modelData: { type: Object as PropType<IDEGrid>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * 部件行数据默认激活模式
     * - 0 不激活
     * - 1 单击激活
     * - 2 双击激活(默认值)
     *
     * @type {(number | 0 | 1 | 2)}
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    singleSelect: { type: Boolean, default: undefined },
    rowEditOpen: { type: Boolean, default: undefined },
    isSimple: { type: Boolean, required: false },
    data: { type: Array<IData>, required: false },
    loadDefault: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const c = useControlController<CarouselGridController>(
      (...args) => new CarouselGridController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const ns1 = useNamespace('carousel-grid');
    const timer = ref();
    const rollStyle = ref({});

    const allowRoll = ref(false);

    const { zIndex } = useUIStore();
    c.state.zIndex = zIndex.increment();

    const rowHeight = ref(48);

    const {
      tableRef,
      onRowClick,
      onDbRowClick,
      onSelectionChange,
      onSortChange,
      handleRowClassName,
      handleHeaderCellClassName,
    } = useITableEvent(c);

    const { headerCssVars } = useGridHeaderStyle(tableRef, ns);
    const { cleanup = NOOP } = useGridDraggable(tableRef, ns, c);

    const renderNoData = (): VNode | null => {
      return <div></div>;
    };
    const {
      tableData,
      renderColumns,
      defaultSort,
      summaryMethod,
      spanMethod,
      headerDragend,
    } = useAppGridBase(c, props as IGridProps);

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

    const handleResize = () => {
      if (tableRef.value?.$el) {
        const scrollers =
          tableRef.value.$el.getElementsByClassName('el-scrollbar__wrap');
        if (scrollers && scrollers.length) {
          const target = scrollers[0];
          const totalHeight = tableData.value.length * rowHeight.value;
          if (target.clientHeight && totalHeight > target.clientHeight) {
            allowRoll.value = true;
            if (allowRoll.value) {
              if (c.rollMode === 'STEP') {
                clearInterval(timer.value);
                let length = 1;
                timer.value = setInterval(() => {
                  target.scrollTo({
                    top: rowHeight.value * length,
                    behavior: 'smooth',
                  });
                  if (length >= tableData.value.length) {
                    setTimeout(() => {
                      target.scrollTo({
                        top: 0,
                        behavior: 'instant',
                      });
                    }, 500);
                    length = 1;
                  } else {
                    length += 1;
                  }
                }, c.speed * 1000);
              } else {
                rollStyle.value = {
                  '--speed': `${c.speed}s`,
                };
              }
            }
          }
        }
      }
    };

    onUnmounted(() => {
      zIndex.decrement();
      if (cleanup !== NOOP) {
        cleanup();
      }
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

    // 计算表格显示数据
    const conputedGridData = (items: IData[]) => {
      if (allowRoll.value) {
        return [...items, ...items];
      }
      return items;
    };

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
      ns1,
      tableRef,
      tableData,
      renderColumns,
      allowRoll,
      rollStyle,
      renderTableColumn,
      onDbRowClick,
      onRowClick,
      onSelectionChange,
      onSortChange,
      handleRowClassName,
      handleHeaderCellClassName,
      renderNoData,
      summaryMethod,
      spanMethod,
      headerDragend,
      handleResize,
      conputedGridData,
      defaultSort,
      headerCssVars,
      isLodeMoreDisabled,
      infiniteScroll,
      infiniteScrollKey,
    };
  },
  render() {
    if (!this.c.state.isCreated) {
      return;
    }
    this.handleResize();
    const state = this.c.state;
    const defaultExpandAll = this.c.controlParams.defaultexpandall === 'true';

    return (
      <iBizControlBase
        class={[
          this.ns1.b(),
          this.ns.is('show-header', !this.c.state.hideHeader),
          this.ns.is('enable-page', this.c.state.enablePagingBar),
          this.ns.is('enable-group', this.c.model.enableGroup),
          this.ns.is('single-select', state.singleSelect),
          this.ns.is('empty', state.items.length === 0),
          this.ns.is('enable-customized', this.c.model.enableCustomized),
        ]}
        controller={this.c}
        style={this.headerCssVars}
      >
        {
          <el-table
            ref={'tableRef'}
            class={[
              this.ns.e('table'),
              this.ns.is(
                'allow-roll',
                this.allowRoll && this.c.rollMode === 'DEFAULT',
              ),
            ]}
            default-sort={this.defaultSort}
            border
            show-header={!this.c.state.hideHeader}
            show-summary={this.c.enableAgg}
            summary-method={this.summaryMethod}
            highlight-current-row={state.singleSelect}
            row-class-name={this.handleRowClassName}
            header-cell-class-name={this.handleHeaderCellClassName}
            row-key={'tempsrfkey'}
            data={this.conputedGridData(this.tableData as IData[])}
            default-expand-all={defaultExpandAll}
            span-method={this.spanMethod}
            onRowClick={this.onRowClick}
            onRowDblclick={this.onDbRowClick}
            onSelectionChange={this.onSelectionChange}
            onSortChange={this.onSortChange}
            onHeaderDragend={this.headerDragend}
            tooltip-effect={'light'}
            scrollbar-always-on={true}
            {...this.$attrs}
            style={this.rollStyle}
          >
            {{
              empty: this.renderNoData,
              default: (): VNodeArrayChildren => {
                return [
                  this.renderColumns.map((model, index) => {
                    return this.renderTableColumn(model, index);
                  }),
                ];
              },
            }}
          </el-table>
        }
      </iBizControlBase>
    );
  },
});
