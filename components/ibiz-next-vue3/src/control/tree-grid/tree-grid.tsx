import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  VNode,
  watch,
  nextTick,
  PropType,
  renderSlot,
  defineComponent,
  VNodeArrayChildren,
} from 'vue';
import { recursiveIterate } from '@ibiz-template/core';
import { IDEGridColumn, IDETreeGrid } from '@ibiz/model-core';
import {
  IControlProvider,
  ScriptFactory,
  TreeGridController,
} from '@ibiz-template/runtime';
import { useRowEditPopover } from '../grid/row-edit-popover/use-row-edit-popover';
import {
  IGridProps,
  useAppGridBase,
  useITableEvent,
  useGridHeaderStyle,
  useAppGridPagination,
} from '../grid/grid';
import { renderChildColumn } from '../grid/grid/grid';

/**
 * @description 绘制树表格的注入属性，表格列注入属性由表格中计算绘制
 * @param {IDETreeGrid} model
 * @param {IParams} params
 * @returns {*}  {IParams}
 */
function renderAttrs(model: IDETreeGrid, params: IParams): IParams {
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

export const TreeGridControl = defineComponent({
  name: 'IBizTreeGridControl',
  props: {
    /**
     * @description 树表格模型数据
     */
    modelData: { type: Object as PropType<IDETreeGrid>, required: true },
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
     * @description 是否是单选
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
    const c: TreeGridController = useControlController<TreeGridController>(
      (...args) => new TreeGridController(...args),
    );
    useControlPopoverzIndex(c);

    // 继承表格部件样式
    const ns = useNamespace(`control-grid`);
    const ns2 = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const {
      tableRef,
      onRowClick,
      onDbRowClick,
      onSortChange,
      onSelectionChange,
      handleRowClassName,
      handleHeaderCellClassName,
    } = useITableEvent(c);
    const { onPageChange, onPageRefresh, onPageSizeChange } =
      useAppGridPagination(c);

    const {
      tableData,
      defaultSort,
      renderColumns,
      summaryMethod,
      headerDragend,
    } = useAppGridBase(c, props as IGridProps, tableRef);

    const { renderPopover } = useRowEditPopover(tableRef, c);

    const { headerCssVars } = useGridHeaderStyle(tableRef, ns);

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
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
          >
            {noDataSlots}
          </iBizNoData>
        );
      }
      return null;
    };

    /**
     * @description 处理默认选中
     * - 预加载完成后执行
     * @returns {*}  {void}
     */
    const handleDefaultSelect = (): void => {
      const { expandRowKeys, selectedData, singleSelect } = c.state;
      const table = tableRef.value;
      if (!table || !selectedData.length) return;
      const treeData = table.store.states.treeData.value;
      const expandKeys = Object.keys(treeData).filter(
        key => treeData[key].loaded,
      );
      // 如果elemnet表格维护的树展开和expandRowKeys相同，说明已经预加载完成了，这时在设置默认选中
      if (
        expandRowKeys.length === expandKeys.length &&
        expandRowKeys
          .sort()
          .every((item, index) => item === expandKeys.sort()[index])
      ) {
        const selection: IData[] = [];
        const selectKeys = selectedData.map(selected => selected.srfkey);
        recursiveIterate({ children: table.store.states.data.value }, item => {
          if (selectKeys.includes(item.srfkey)) selection.push(item);
        });
        nextTick(() => {
          if (singleSelect) {
            table.setCurrentRow(selection[0]);
          } else {
            table.store.states.selection.value = selection;
          }
        });
      }
    };

    /**
     * @description 处理节点默认展开
     * @param {IData[]} nodes
     * @returns {*}
     */
    const handleDefaultExpand = (nodes: IData[]) => {
      if (!tableRef.value || !c.state.expandRowKeys.length) return;
      c.state.expandRowKeys.forEach(key => {
        const node = nodes.find(item => item.srfkey === key);
        if (node)
          nextTick(() => {
            tableRef.value!.store.loadOrToggle(node);
          });
      });
      handleDefaultSelect();
    };

    watch(
      () => tableRef.value,
      () => {
        // 初始默认展开
        handleDefaultExpand(c.state.treeGirdData);
      },
    );

    //  触发节点加载数据
    const loadData = async (
      item: IData,
      _row: unknown,
      callback: (nodes: IData[]) => void,
    ) => {
      const treeGirdItems: IData[] = c.state.items.map(data =>
        c.getTreeGridDataItem(data),
      );
      const items = treeGirdItems.filter(
        data => item[c.treeGridValueField] === data[c.treeGridParentField],
      );
      item.children = items;
      callback(items);
      // 默认展开子节点
      handleDefaultExpand(items);
    };

    // 绘制批操作工具栏
    const renderBatchToolBar = (): VNode | undefined => {
      const batchToolbar = c.model.controls?.find(item => {
        return item.name === `${c.model.name!}_batchtoolbar`;
      });
      if (!batchToolbar || c.state.singleSelect) {
        return;
      }
      return (
        <div class={[ns.b('batch-toolbar'), ns.is('show', c.showBatchToolbar)]}>
          <div class={ns.b('batch-toolbar-content')}>
            <div class={ns.b('batch-toolbar-text')}>
              {ibiz.i18n.t('control.common.itemsSelected', {
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

    const renderColumn = (
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

    return {
      c,
      ns,
      ns2,
      tableRef,
      tableData,
      defaultSort,
      renderColumns,
      headerCssVars,
      loadData,
      onRowClick,
      renderColumn,
      onDbRowClick,
      onSortChange,
      onPageChange,
      renderNoData,
      onPageRefresh,
      summaryMethod,
      headerDragend,
      renderPopover,
      onPageSizeChange,
      onSelectionChange,
      handleRowClassName,
      renderBatchToolBar,
      handleHeaderCellClassName,
    };
  },
  render() {
    const state = this.c.state;
    const { hideHeader, enablePagingBar } = this.c.model;
    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          class={[
            this.ns.b(),
            this.ns2.b(),
            this.ns.is('show-header', !hideHeader),
            this.ns.is('enable-page', enablePagingBar),
            this.ns.is('enable-group', this.c.model.enableGroup),
            this.ns.is('enable-customized', this.c.model.enableCustomized),
          ]}
          controller={this.c}
          style={this.headerCssVars}
        >
          {this.c.state.isLoaded && (
            <el-table
              lazy
              border
              ref={'tableRef'}
              row-key={'srfkey'}
              load={this.loadData}
              tooltip-effect={'light'}
              show-header={!hideHeader}
              class={this.ns.e('table')}
              key={this.c.state.tableKey}
              onRowClick={this.onRowClick}
              default-sort={this.defaultSort}
              show-summary={this.c.enableAgg}
              onSortChange={this.onSortChange}
              onRowDblclick={this.onDbRowClick}
              summary-method={this.summaryMethod}
              onHeaderDragend={this.headerDragend}
              row-class-name={this.handleRowClassName}
              onSelectionChange={this.onSelectionChange}
              highlight-current-row={state.singleSelect}
              onExpandChange={(row: IData, expanded: boolean) =>
                this.c.expandChange(row, expanded)
              }
              header-cell-class-name={this.handleHeaderCellClassName}
              tree-props={{ children: 'children', hasChildren: 'hasChildren' }}
              data={
                this.c.state.showTreeGrid ? state.treeGirdData : this.tableData
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
                    !state.singleSelect && (
                      <el-table-column
                        width='55'
                        type='selection'
                        reserve-selection={true}
                        class-name={this.ns.e('selection')}
                      ></el-table-column>
                    ),
                    state.isCreated &&
                      this.renderColumns.map((model, index) => {
                        return this.renderColumn(model, index);
                      }),
                  ];
                },
                append: () => {
                  return this.renderPopover();
                },
              }}
            </el-table>
          )}
          {enablePagingBar && (
            <iBizPagination
              mode={this.c.paginationMode}
              total={state.total}
              curPage={state.curPage}
              size={state.size}
              totalPages={state.totalPages}
              onChange={this.onPageChange}
              onPageSizeChange={this.onPageSizeChange}
              onPageRefresh={this.onPageRefresh}
              popperClass={`${
                this.c.model.sysCss?.cssName || 'default'
              }--popper`}
            ></iBizPagination>
          )}
          {this.c.model.enableCustomized && !hideHeader && (
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
