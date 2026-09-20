/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useUIStore,
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
} from '@ibiz-template/vue3-util';
import { VNode, PropType, onUnmounted, defineComponent } from 'vue';
import { IDEGrid } from '@ibiz/model-core';
import {
  ControlVO,
  GridController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { IColumn, useVirtualizedTable } from './virtualized-table.util';
import { usePagination } from '../../../util';
import './virtualized-table.scss';

export const VirtualizedTableControl = defineComponent({
  name: 'IBizVirtualizedTableControl',
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
  setup(props) {
    const c = useControlController<GridController>(
      (...args) => new GridController(...args),
    );
    const ns = useNamespace(`control-virtualized-table`);

    const { zIndex } = useUIStore();
    c.state.zIndex = zIndex.increment();

    const {
      tableRef,
      tableData,
      sortValue,
      columnModel,
      isSelected,
      isAllSelected,
      handleRowClick,
      handleSortClick,
      handleSelectAll,
      calcColumnWidth,
      handleDbRowClick,
      handleHeaderCellClick,
      handleSelectionChange,
    } = useVirtualizedTable(c, props);

    const { onPageChange, onPageRefresh, onPageSizeChange } = usePagination(c);

    onUnmounted(() => {
      zIndex.decrement();
    });

    /**
     * @description 计算行样式
     * @param {IParams} params
     * @returns {*}  {string}
     */
    const calcRowClass = (params: IParams): string => {
      const { rowData } = params;
      return `${ns.is('selected', rowData && isSelected(rowData))}`;
    };

    /**
     * @description 绘制无数据
     * @returns {*}  {(VNode | null)}
     */
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
              class={ns.e('quick-toolbar')}
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
            hideNoDataImage={c.state.hideNoDataImage}
          >
            {noDataSlots}
          </iBizNoData>
        );
      }
      // 给null 表格会绘制默认的无数据
      return <div></div>;
    };

    /**
     * @description 绘制批操作工具栏
     * @returns {*}  {(VNode | undefined)}
     */
    const renderBatchToolBar = (): VNode | undefined => {
      const batchToolbar = c.model.controls?.find(item => {
        return item.name === `${c.model.name!}_batchtoolbar`;
      });
      if (!batchToolbar || c.state.singleSelect || !c.state.selectedData.length)
        return;
      return (
        <div
          class={[
            ns.e('batch-toolbar'),
            ns.is('show', c.state.selectedData.length > 0),
          ]}
        >
          <div class={ns.em('batch-toolbar', 'content')}>
            <div class={ns.em('batch-toolbar', 'text')}>
              {ibiz.i18n.t('control.common.itemsSelected', {
                length: c.state.selectedData.length,
              })}
            </div>
            <div class={ns.em('batch-toolbar', 'separator')}>|</div>
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

    /**
     * @description 绘制头部单元格
     * @param {IParams} params
     * @returns {*}
     */
    const renderHeaderCell = (params: IParams) => {
      const { column } = params;
      const { type, enableSort, key, title, align } = column as IColumn;
      const { prop, order } = sortValue.value;
      // 预置选择列
      if (type === 'selection')
        return (
          <div
            class={[
              ns.e('cell'),
              ns.e('header-cell'),
              ns.em('cell', align || 'left'),
            ]}
          >
            <el-checkbox
              modelValue={isAllSelected()}
              onChange={(val: boolean) => handleSelectAll(val)}
              indeterminate={
                c.state.selectedData.length > 0 && !isAllSelected()
              }
            />
          </div>
        );
      return (
        <div
          class={[
            ns.e('cell'),
            ns.e('header-cell'),
            ns.is('sortable', !!enableSort),
            ns.em('cell', align || 'left'),
          ]}
          onClick={(e: MouseEvent) => handleHeaderCellClick(e, column)}
        >
          <span class={ns.em('header-cell', 'caption')}>{title}</span>
          {enableSort && (
            <span class={ns.e('caret-wrapper')}>
              <i
                class={[
                  ns.em('caret-wrapper', 'asc'),
                  ns.em('caret-wrapper', 'sort-caret'),
                  ns.is('active', prop === key && order === 'asc'),
                ]}
                onClick={e => handleSortClick(e, column, 'asc')}
              />
              <i
                class={[
                  ns.em('caret-wrapper', 'desc'),
                  ns.em('caret-wrapper', 'sort-caret'),
                  ns.is('active', prop === key && order === 'desc'),
                ]}
                onClick={e => handleSortClick(e, column, 'desc')}
              />
            </span>
          )}
        </div>
      );
    };

    /**
     * @description 绘制内容区单元格
     * @param {IParams} params
     * @returns {*}
     */
    const renderBodyCell = (params: IParams) => {
      const { column, rowData } = params;
      const { type, key, align } = column as IColumn;
      // 预置选择列
      if (type === 'selection')
        return (
          <div
            class={[
              ns.e('cell'),
              ns.e('body-cell'),
              ns.em('cell', align || 'left'),
            ]}
            onClick={(evt: MouseEvent) => evt.stopPropagation()}
          >
            <el-checkbox
              onChange={() => handleSelectionChange(rowData)}
              modelValue={isSelected(rowData)}
            />
          </div>
        );
      const controller = c.columns[key];
      const { columnType } = controller.model;
      const row = c.findRowState(rowData);
      return (
        <div
          class={[
            ns.e('cell'),
            ns.e('body-cell'),
            ns.em('cell', align || 'left'),
          ]}
        >
          {columnType === 'DEFGRIDCOLUMN' ? (
            <iBizGridFieldColumn controller={controller} row={row} />
          ) : (
            <iBizGridUAColumn controller={controller} row={row} />
          )}
        </div>
      );
    };

    return {
      c,
      ns,
      tableRef,
      tableData,
      columnModel,
      onPageChange,
      onPageRefresh,
      onPageSizeChange,
      renderNoData,
      calcRowClass,
      renderBodyCell,
      handleRowClick,
      calcColumnWidth,
      handleDbRowClick,
      renderHeaderCell,
      renderBatchToolBar,
    };
  },
  render() {
    if (!this.c.state.isCreated) return null;
    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          controller={this.c}
          class={[
            this.ns.b(),
            this.ns.m(this.c.overflowMode),
            this.ns.is('dynamic-grid', this.c.state.isAutoGrid),
            this.ns.is('show-header', !this.c.state.hideHeader),
            this.ns.is('enable-page', this.c.state.enablePagingBar),
            this.ns.is('enable-group', this.c.model.enableGroup),
            this.ns.is('single-select', this.c.state.singleSelect),
            this.ns.is('empty', this.c.state.items.length === 0),
            this.ns.is('enable-customized', this.c.model.enableCustomized),
          ]}
        >
          <el-auto-resizer>
            {{
              default: ({
                height,
                width,
              }: {
                height: number;
                width: number;
              }) => {
                const columns = this.calcColumnWidth(this.columnModel, width);
                return (
                  <el-table-v2
                    fixed
                    ref='tableRef'
                    width={width}
                    height={height}
                    row-height={54}
                    columns={columns}
                    header-height={54}
                    hScrollbarSize={4}
                    vScrollbarSize={4}
                    data={this.tableData}
                    class={this.ns.e('table')}
                    row-class={this.calcRowClass}
                    row-event-handlers={{
                      onClick: ({
                        event,
                        rowData,
                      }: {
                        event: MouseEvent;
                        rowData: ControlVO;
                      }) => this.handleRowClick(event, rowData),
                      onDblclick: ({
                        event,
                        rowData,
                      }: {
                        event: MouseEvent;
                        rowData: ControlVO;
                      }) => this.handleDbRowClick(event, rowData),
                    }}
                  >
                    {{
                      empty: this.renderNoData,
                      cell: this.renderBodyCell,
                      'header-cell': this.renderHeaderCell,
                    }}
                  </el-table-v2>
                );
              },
            }}
          </el-auto-resizer>
          {/* {this.c.state.enablePagingBar && (
            <iBizPagination
              size={this.c.state.size}
              total={this.c.state.total}
              curPage={this.c.state.curPage}
              totalPages={this.c.state.totalPages}
              popperClass={`${this.c.model.sysCss?.cssName}--popper`}
              onChange={this.onPageChange}
              onPageRefresh={this.onPageRefresh}
              onPageSizeChange={this.onPageSizeChange}
            ></iBizPagination>
          )} */}
          {this.c.model.enableCustomized && !this.c.state.hideHeader && (
            <div class={this.ns.e('setting-box')}>
              <iBizGridSetting
                controller={this.c}
                columnStates={this.c.state.columnStates}
              ></iBizGridSetting>
            </div>
          )}
          {this.renderBatchToolBar()}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
