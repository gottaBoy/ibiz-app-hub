/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import {
  NOOP,
  Namespace,
  eventPath,
  listenJSEvent,
  recursiveIterate,
} from '@ibiz-template/core';
import {
  Srfuf,
  ControlVO,
  GridRowState,
  IColumnState,
  IGridRowState,
  ScriptFactory,
  GridController,
  IControlProvider,
} from '@ibiz-template/runtime';
import {
  IDEGrid,
  IDEGridColumn,
  IDEGridFieldColumn,
  IDEGridGroupColumn,
} from '@ibiz/model-core';
import { TableColumnCtx } from 'element-plus';
import { chunk, orderBy } from 'lodash-es';
import {
  Ref,
  ref,
  watch,
  computed,
  nextTick,
  onUnmounted,
  watchEffect,
} from 'vue';

/**
 * 通过回车聚焦元素
 *
 * @export
 * @param {(HTMLElement | Document)} [target=document] 聚焦元素范围 默认document
 * @param {string[]} [querySelects=[
 *     'a',
 *     'input',
 *     'button',
 *     'textarea',
 *     'select',
 *     '[tabindex]:not([tabindex="-1"])',
 *   ]] 可聚焦元素选择器
 * @param {() => void} [callback] 最后一个可聚焦元素回车事件回调
 * @return {*}  {{
 *   cleanup: () => void;
 * }}
 */
function useFocusByEnter(
  target: HTMLElement | Document = document,
  querySelects: string[] = [
    'a',
    'input',
    'button',
    'textarea',
    'select',
    '[tabindex]:not([tabindex="-1"])',
  ],
  callback?: () => void,
): {
  cleanup: () => void;
} {
  const querySelector = querySelects.join(',');
  const listener = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') {
      // 阻止默认行为
      event.preventDefault();
      const currentElement = document.activeElement as HTMLElement;
      // 获取所有可聚焦元素
      const focusableElements = Array.from(
        target.querySelectorAll(querySelector),
      ) as HTMLElement[];
      const currentIndex = focusableElements.indexOf(currentElement);
      const nextElement = focusableElements[currentIndex + 1];
      if (nextElement) {
        // 聚焦到下一个元素
        nextElement.focus();
      } else {
        callback?.();
      }
    }
  };
  const cleanup = listenJSEvent(window, 'keydown', listener, {
    capture: true,
  });
  return { cleanup };
}

/**
 * 表格部件props接口
 *
 * @author zk
 * @date 2023-09-26 06:09:51
 * @export
 * @interface IGridProps
 */
export interface IGridProps {
  // 模型
  modelData: IDEGrid;
  // 上下文
  context: IContext;
  // 视图参数
  params: IParams;
  // 适配器
  provider: IControlProvider;
  // 部件行数据默认激活模式
  mdctrlActiveMode?: number;
  // 是否单选
  singleSelect?: boolean;
  // 是否开启行编辑
  rowEditOpen?: boolean;
  // 是否是本地数据模式
  isSimple: boolean;
  // 本地数据模式data
  data: Array<IData>;
  // 默认加载
  loadDefault: boolean;
}

/**
 * 排序合并数据
 *
 * @param {string[]} rowSpanKeys
 * @param {IData[]} items
 * @return {*}
 */
function sortMergeData(rowSpanKeys: string[], items: IData[]) {
  const otherItems: IData[] = [];
  const firstKey: string = rowSpanKeys[0] || '';
  const sortedItems = items.filter((item: IData) => {
    if (!item[firstKey]) {
      otherItems.push(item);
    }
    return item[firstKey];
  });
  sortedItems.sort((a: IData, b: IData) => {
    for (const key of rowSpanKeys) {
      if (a[key] !== b[key]) {
        return a[key] > b[key] ? 1 : -1;
      }
    }
    return 0;
  });
  sortedItems.push(...otherItems);
  return sortedItems;
}

/**
 * 适配element的table的事件
 *
 * @author lxm
 * @date 2022-09-05 21:09:42
 * @export
 * @param {GridController} c
 * @returns {*}
 */
export function useITableEvent(c: GridController): {
  tableRef: Ref<IData | undefined>;
  onRowClick: (
    data: ControlVO,
    _column: IData,
    event: MouseEvent,
  ) => Promise<void>;
  onDbRowClick: (data: ControlVO) => void;
  onSelectionChange: (selection: ControlVO[]) => void;
  onSortChange: (opts: {
    _column: IData;
    prop: string;
    order: 'ascending' | 'descending';
  }) => void;
  handleRowClassName: ({ row }: { row: IData }) => string;
  handleHeaderCellClassName: ({
    _row,
    column,
    _rowIndex,
    _columnIndex,
  }: {
    _row: IData;
    column: IData;
    _rowIndex: number;
    _columnIndex: number;
  }) => string;
  cleanClick: () => void;
  cleanEnter: () => void;
  cleanTab: () => void;
} {
  const tableRef = ref<IData>();
  let forbidChange = false;

  // 是否正在设置elementPlus表格排序回显效果
  let isGridUISort = false;

  let cleanClick = NOOP;
  let cleanEnter = NOOP;
  let cleanTab = NOOP;

  if (c.state.isAutoGrid) {
    // 行编辑模式才监听
    if (c.editShowMode === 'row') {
      cleanClick = listenJSEvent(window, 'click', async event => {
        const classList: string[] = [];
        eventPath(event).forEach(e => {
          if (e && (e as IData).classList) {
            classList.push(...(e as IData).classList);
          }
        });
        // 排除 popper，行，滚动条点击的情况
        if (
          classList.includes('el-popper') ||
          classList.includes('el-scrollbar') ||
          classList.includes('el-table__row')
        )
          return;
        const editingRow = c.state.rows.find(item => item.showRowEdit);
        if (editingRow) await c.switchRowEdit(editingRow);
      });
    }

    const timer = setInterval(() => {
      const tableEl = tableRef.value?.$el;
      if (tableEl) {
        clearInterval(timer);
        const querySelect: string[] = [
          'tbody select',
          'tbody textarea',
          'tbody input:not([type="checkbox"])',
        ];
        const callback = async () => {
          if (c.editShowMode === 'row') {
            const editingRow = c.state.rows.find(item => item.showRowEdit);
            if (editingRow) await c.switchRowEdit(editingRow);
          }
        };
        const { cleanup } = useFocusByEnter(tableEl, querySelect, callback);
        cleanEnter = cleanup;
      }
    }, 300);
  }

  // 所有表格列
  const allGridColumns: IDEGridColumn[] = [];
  recursiveIterate(
    c.model,
    (column: IDEGridColumn) => {
      allGridColumns.push(column);
    },
    { childrenFields: ['degridColumns'] },
  );

  c.evt.on('onToggleRowExpansion', event => {
    const { row, expand } = event as IData;
    if (tableRef.value) {
      if (tableRef.value.lazy) {
        const { store } = tableRef.value;
        const { treeData } = tableRef.value.store.states;
        const data = treeData.value[row.srfkey];
        if (data && data.expanded !== expand) {
          store.loadOrToggle(row);
        }
      } else {
        tableRef.value.toggleRowExpansion(row, expand);
      }
    }
  });

  // 可编辑属性列
  const editColumn = computed(() => {
    const columns: IDEGridFieldColumn[] = [];
    recursiveIterate({ children: c.state.columnStates }, columnState => {
      if (!columnState.uaColumn && !columnState.hidden) {
        const model = c.columns[columnState.key].model;
        if (model.enableRowEdit) columns.push(model);
      }
    });
    return columns;
  });

  const tabListener = (event: KeyboardEvent): void => {
    const tableEl = tableRef.value!.$el;
    const currentElement = document.activeElement as HTMLElement;
    // 焦点在当前表格，表格启用编辑时才启用
    if (event.key === 'Tab' && tableEl.contains(currentElement)) {
      // 阻止默认
      event.preventDefault();
      // 单元格编辑模式
      const classList: string[] = [];
      eventPath(event as any).forEach(e => {
        if (e && (e as IData).classList) {
          classList.push(...(e as IData).classList);
        }
      });
      // 获取主键
      const key = classList
        .filter(className => className.startsWith('id-'))[0]
        ?.substring(3);
      const columnName = classList
        .filter(className => className.startsWith('defgridcolumn-'))[0]
        ?.substring(14);
      const columnIndex = editColumn.value.findIndex(
        column => column.id!.toLowerCase() === columnName?.toLowerCase(),
      );
      // 不存在主键为新建行
      const rowIndex = c.state.rows.findIndex(
        item => key && item.data.srfkey === key,
      );
      const row = rowIndex !== -1 ? c.state.rows[rowIndex] : undefined;
      // 如果当前行为新建行，则下一行默认为第一个非新建行
      const nextRow =
        rowIndex !== -1
          ? c.state.rows[rowIndex + 1]
          : c.state.rows.find(_row => _row.data.srfuf === Srfuf.UPDATE);
      if (row) {
        // 有下一个可编辑单元格或下一行 先关闭之前的编辑单元格
        if (nextRow || columnIndex < editColumn.value.length - 1) {
          Object.keys(row.editColStates).forEach(fieldName => {
            row.editColStates[fieldName].editable = false;
          });
        }
        // 打开下一个可编辑单元格
        if (columnIndex < editColumn.value.length - 1) {
          row.editColStates[
            editColumn.value[columnIndex + 1].id!.toLowerCase()
          ].editable = true;
        } else if (nextRow) {
          // 如果是这一行最后一个单元格则打开下一行第一个单元格
          nextRow.editColStates[
            editColumn.value[0].id!.toLowerCase()
          ].editable = true;
        }
      } else {
        // 新建行直接聚焦元素即可
        // 获取当前表格所有可聚焦元素
        const focusableElements = Array.from(
          tableEl.querySelectorAll(
            'tbody select, tbody textarea, tbody input:not([type="checkbox"])',
          ),
        ) as HTMLElement[];
        const currentIndex = focusableElements.indexOf(currentElement);
        // 下一个可聚焦元素
        const nextElement = focusableElements[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
        } else if (nextRow) {
          // 没有可聚焦元素时，下一行非新建行的首项启用编辑态
          nextRow.editColStates[
            editColumn.value[0].id!.toLowerCase()
          ].editable = true;
        }
      }
    }
  };

  watch(
    () => tableRef.value,
    table => {
      const { enableRowEdit } = c.model;
      if (table && enableRowEdit && c.editShowMode === 'cell') {
        cleanTab = listenJSEvent(window, 'keydown', tabListener, {
          capture: true,
        });
      }
    },
  );

  /**
   * 处理ctrl+click选中
   *
   * @param {ControlVO} data
   */
  function handleCtrlSelect(data: ControlVO): void {
    const selection = [...c.state.selectedData];
    const index = selection.findIndex(x => x.srfkey === data.srfkey);
    if (index !== -1) {
      selection.splice(index, 1);
      c.setSelection(selection);
    } else {
      c.setSelection([...selection, data]);
    }
  }

  // 上一次选中数据索引
  let lastSelectedIndex: number | null = null;

  /**
   * 处理shift+click选中
   *
   * @param {ControlVO} data
   */
  function handleShiftSelect(data: ControlVO): void {
    // 清除shift的默认选中样式
    window.getSelection()?.removeAllRanges();
    const index = c.findRowStateIndex(data);
    const selection = [...c.state.selectedData];
    const isSelected = selection.includes(data);
    if (lastSelectedIndex !== null) {
      // Shift+点击，执行范围选择
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      if (isSelected) {
        // 如果点击的是已选中项，则取消该范围内的选中
        for (let i = start; i <= end; i++) {
          const itemIndex = selection.indexOf(c.state.items[i]);
          if (itemIndex !== -1) {
            selection.splice(itemIndex, 1);
          }
        }
      } else {
        // 否则选中该范围内的所有项
        for (let i = start; i <= end; i++) {
          if (!selection.includes(c.state.items[i])) {
            selection.push(c.state.items[i]);
          }
        }
      }
      c.setSelection(selection);
    } else {
      c.setSelection([data]);
    }
    lastSelectedIndex = index;
  }

  async function onRowClickDynamic(
    data: ControlVO,
    _column: IData,
    event: MouseEvent,
  ): Promise<void> {
    // 新建行拦截行点击事件
    if (data.srfuf === Srfuf.CREATE) {
      if (c.editShowMode === 'row' && !data.isGroupRow) {
        const row = c.findRowState(data);
        // 新建行值被修改过就保存，否则取消
        if (row) await c.switchRowEdit(row);
      }
      return;
    }
    if (event.ctrlKey && !c.state.singleSelect) return handleCtrlSelect(data);
    if (event.shiftKey && !c.state.singleSelect) return handleShiftSelect(data);
    // 单行编辑模式下，行点击会触发
    if (c.editShowMode === 'row' && c.allowRowEdit) {
      const row = c.findRowState(data);
      if (row) {
        // 切换行编辑
        await c.switchRowEdit(row);
      }
    } else {
      await c.onRowClick(data as ControlVO);
    }
  }

  let forbidClick: boolean = false;

  async function onRowClick(
    data: ControlVO,
    _column: IData,
    event: MouseEvent,
  ): Promise<void> {
    if (data.isGroupRow) {
      tableRef.value?.store.loadOrToggle(data);
      return;
    }
    // 非shift点击时需标记选中数据
    if (!event.shiftKey) {
      const index = c.findRowStateIndex(data);
      const isSelected = c.state.selectedData.includes(data);
      lastSelectedIndex = isSelected ? null : index;
    }
    if (c.state.isAutoGrid) {
      await onRowClickDynamic(data, _column, event);
      return;
    }
    // 新建行拦截行点击事件
    if (data.srfuf === Srfuf.CREATE || forbidClick) return;
    if (event.ctrlKey && !c.state.singleSelect) return handleCtrlSelect(data);
    if (event.shiftKey && !c.state.singleSelect) return handleShiftSelect(data);
    const target = event.target as HTMLElement;
    const { classList } = target.parentElement || {};
    if (classList && classList.contains('el-table-column--selection')) {
      tableRef.value!.toggleRowSelection(data);
      return;
    }
    // 单行编辑模式下，行点击会触发
    if (c.editShowMode === 'row' && c.model.enableRowEdit) {
      const row = c.findRowState(data);
      if (row && row.showRowEdit !== true) {
        // 开启行编辑
        await c.switchRowEdit(row, true);
      }
    } else {
      await c.onRowClick(data as ControlVO);
    }
    forbidClick = true;
    setTimeout(() => {
      forbidClick = false;
    }, 200);
  }

  function onDbRowClick(data: ControlVO): void {
    // 新建行拦截行双击事件
    if (data.srfuf === Srfuf.CREATE || data.isGroupRow) return;
    c.onDbRowClick(data);
  }

  function onSelectionChange(selection: ControlVO[]): void {
    // 选中数据在回显的时候屏蔽值变更事件，否则会递归。
    if (!forbidChange && !c.state.isLoading) c.setSelection(selection);
  }

  // element表格选中数据
  const elSelection = computed(() => {
    const items: IData[] = [];
    const keys = c.state.selectedData.map(selected => selected.srfkey);
    if (tableRef.value)
      recursiveIterate(
        { children: tableRef.value.store.states.data.value },
        item => {
          if (keys.includes(item.srfkey)) items.push(item);
        },
      );
    return items;
  });

  // 监听选中数据，操作表格来界面回显选中效果。
  watch(
    [
      () => tableRef.value,
      (): boolean => c.state.isLoaded,
      (): IData[] => c.state.selectedData,
    ],
    ([table, isLoaded, _newVal]) => {
      if (!isLoaded || !table) return;
      forbidChange = true;
      setTimeout(() => {
        if (c.state.singleSelect) {
          table.setCurrentRow(elSelection.value[0]);
        } else {
          // 修复选中值中有父值时导致子全选中问题
          table.store.states.selection.value = elSelection.value;
        }
        forbidChange = false;
      });
    },
  );

  // 排序变更回调。
  function onSortChange(opts: {
    _column: IData;
    prop: string;
    order: 'ascending' | 'descending';
  }): void {
    if (isGridUISort) {
      isGridUISort = false;
      return;
    }
    const { prop, order } = opts;
    const fieldName = c.fieldColumns[prop].model.appDEFieldId;
    let order1: 'asc' | 'desc' | undefined;
    if (order === 'ascending') {
      order1 = 'asc';
    } else if (order === 'descending') {
      order1 = 'desc';
    }
    // 如果排序条件相同，不触发查询。
    const sortQuery = `${fieldName},${order1}`;
    if (sortQuery === c.state.sortQuery) {
      return;
    }
    if (c.runMode === 'DESIGN') {
      c.state.items = orderBy(
        c.state.items,
        [item => item?.[fieldName || '']?.length || 0],
        [order1 || 'asc'],
      );
      c.state.rows = c.state.items.map(item => {
        const row = new GridRowState(new ControlVO(item), c);
        return row;
      });
      return;
    }
    c.setSort(fieldName, order1);
    // 非本地模式才走远程
    if (c.model.sortMode !== 'LOCAL')
      c.load({
        isInitialLoad: c.model.pagingMode === 2 || c.model.pagingMode === 3,
      });
  }

  // todo 用自己的ns类名去压制，把element原来的样式清除
  function handleRowClassName({ row }: { row: IData }): string {
    let activeClassName = '';
    if (c.state.selectedData.length > 0) {
      c.state.selectedData.forEach((data: IData) => {
        // current-row用于多选激活样式与单选保持一致，有背景色
        if (data === row || data.srfkey === row.srfkey)
          activeClassName = 'current-row';
      });
    }
    const rowState = c.findRowState(row);
    if (rowState?.showRowEdit) {
      activeClassName += ' editing-row';
    }
    if (row.srfkey) {
      activeClassName += ` id-${row.srfkey}`;
    }
    if (c.enableRowEditOrder) {
      activeClassName += ` enable-order`;
    }
    return activeClassName;
  }

  // 表头单元格的 className 的回调方法
  function handleHeaderCellClassName({
    _row,
    column,
    _rowIndex,
    _columnIndex,
  }: {
    _row: IData;
    column: IData;
    _rowIndex: number;
    _columnIndex: number;
  }): string {
    const columnModel = allGridColumns.find(gridColumn => {
      return gridColumn.codeName === column.property;
    });
    if (
      columnModel &&
      columnModel.headerSysCss &&
      columnModel.headerSysCss.cssName
    ) {
      return columnModel.headerSysCss.cssName;
    }
    return '';
  }

  watch(
    () => c.state.sortQuery,
    newVal => {
      // 监听排序查询条件，手动触发element-plus表格的排序以回显样式
      if (newVal) {
        const prop = c.state.sortQuery.split(',')[0];
        const sortDir = c.state.sortQuery.split(',')[1];
        const column = c.model.degridColumns?.find(_column => {
          return _column.codeName?.toLowerCase() === prop.toLowerCase();
        });
        if (column && sortDir) {
          const order = sortDir === 'desc' ? 'descending' : 'ascending';
          const sortTable = () => {
            if (tableRef.value) {
              nextTick(() => {
                if (newVal !== c.state.sortQuery) return;
                isGridUISort = true;
                tableRef.value!.sort(column.codeName, order);
              });
            } else {
              setTimeout(sortTable, 500);
            }
          };
          sortTable();
        }
      } else {
        tableRef.value?.clearSort();
      }
    },
  );

  return {
    tableRef,
    onRowClick,
    onDbRowClick,
    onSelectionChange,
    onSortChange,
    handleRowClassName,
    handleHeaderCellClassName,
    cleanClick,
    cleanEnter,
    cleanTab,
  };
}

/**
 * 使用表格分页组件
 *
 * @author lxm
 * @date 2022-09-06 17:09:09
 * @export
 * @param {GridController} c
 * @returns {*}
 */
export function useAppGridPagination(c: GridController): {
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onPageRefresh: () => void;
} {
  function onPageChange(page: number): void {
    if (!page || page === c.state.curPage) {
      return;
    }
    c.state.curPage = page;
    c.load();
  }

  function onPageSizeChange(size: number): void {
    if (!size || size === c.state.size) {
      return;
    }
    c.state.size = size;

    // 当page为第一页的时候切换size不会触发pageChange，需要自己触发加载
    if (c.state.curPage === 1) {
      c.load();
    }
  }

  function onPageRefresh(): void {
    c.load();
  }
  return { onPageChange, onPageSizeChange, onPageRefresh };
}

export function useAppGridBase(
  c: GridController,
  props: IGridProps,
  tableRef: Ref<IData | undefined>,
): {
  tableData: Ref<IData>;
  renderColumns: Ref<IDEGridColumn[]>;
  defaultSort: Ref<IData>;
  summaryMethod: ({
    columns,
  }: {
    columns: TableColumnCtx<IData>[];
    data: IData[];
  }) => string[];
  spanMethod: ({
    row,
    column,
    rowIndex,
    columnIndex,
  }: {
    row: IData;
    column: IData;
    rowIndex: number;
    columnIndex: number;
  }) => IData | void;
  headerDragend: (newWidth: number, oldWidth: number, column: IData) => void;
} {
  const initSimpleData = (): void => {
    if (!props.data) return;
    const items = (props.data as IData[]).map(item => new ControlVO(item));
    c.state.items = items;
    if (c.runMode === 'DESIGN') {
      c.state.simpleData = items;
      c.state.total = props.data.length;
      c.state.curPage = 1;
      c.state.items =
        chunk(c.state.simpleData, c.state.size)[c.state.curPage - 1] || [];
    }
    c.afterLoad({ isInitialLoad: true }, c.state.items as ControlVO[]);
  };

  const defaultSort = computed(() => {
    const fieldColumn = Object.values(c.fieldColumns).find(
      item => item.model.appDEFieldId === c.model.minorSortAppDEFieldId,
    );
    return {
      prop: fieldColumn?.model.codeName,
      order:
        c.model.minorSortDir?.toLowerCase() === 'desc'
          ? 'descending'
          : 'ascending',
    };
  });

  // 选中数据回显
  c.evt.on('onCreated', async () => {
    if (props.isSimple) {
      initSimpleData();
      c.state.isLoaded = true;
    }
  });

  watch(
    () => props.data,
    () => {
      if (props.isSimple) initSimpleData();
    },
    {
      deep: true,
    },
  );

  // 表格数据，items和rows更新有时间差，用rows来获取items
  const tableData = computed(() => {
    const state = c.state;
    if (c.state.enableGroup) {
      const grouprowmode = c.controlParams.grouprowmode;
      const result: IData[] = [];
      state.groups.forEach(item => {
        if (!item.children.length) return;
        if (grouprowmode === 'NEWROW') {
          result.push({
            ...item,
            srfkey: item.key,
            tempsrfkey: item.key,
            isGroupRow: true,
          });
        } else {
          const children = [...item.children];
          const first = children.shift();
          result.push({
            tempsrfkey: first?.tempsrfkey || item.caption,
            srfkey: first?.srfkey || item.caption,
            isGroupData: true,
            caption: item.caption,
            first,
            children,
          });
        }
      });
      return result;
    }
    const { rowspankeys = [] } = c.controlParams;
    // 合并行单元格时计算合并数据，合并列则不用
    if (rowspankeys.length > 0) {
      return sortMergeData(
        rowspankeys,
        state.rows.map(row => row.data),
      );
    }
    return state.rows.map(row => row.data);
  });

  /**
   * @description 计算分组列状态
   * @param {IDEGridGroupColumn} groupColumn
   * @returns {*}  {IDEGridGroupColumn}
   */
  const calcGroupColumns = (
    groupColumn: IDEGridGroupColumn,
  ): IDEGridGroupColumn => {
    const result: IDEGridGroupColumn = { ...groupColumn };
    const columns: IDEGridColumn[] = [];
    const degridColumns = groupColumn.degridColumns || [];
    degridColumns.forEach(column => {
      if (column.columnType === 'GROUPGRIDCOLUMN') {
        const children = calcGroupColumns(column as IDEGridGroupColumn);
        if (children.degridColumns && children.degridColumns.length) {
          columns.push(children);
        }
      } else {
        const columnState = c.state.columnStates.find(
          item => item.key === column.codeName,
        );
        if (columnState && !columnState.hidden) {
          const columnModel =
            c.fieldColumns[columnState.key]?.model ||
            c.uaColumns[columnState.key]?.model;
          if (columnModel) {
            columns.push(columnModel);
          }
        }
      }
    });
    result.degridColumns = columns;
    return result;
  };

  // 实际绘制的表格列
  const renderColumns = computed(() => {
    const columns: IDEGridColumn[] = [];
    if (c.isMultistageHeader) {
      const degridColumns = c.model.degridColumns || [];
      degridColumns.forEach((column: IDEGridColumn) => {
        if (column.columnType === 'GROUPGRIDCOLUMN') {
          const groupColumn = calcGroupColumns(column as IDEGridGroupColumn);
          if (groupColumn.degridColumns && groupColumn.degridColumns.length) {
            columns.push(groupColumn);
          }
        } else {
          const columnState = c.state.columnStates.find(
            item => item.key === column.codeName,
          );
          if (columnState && !columnState.hidden) {
            const columnModel =
              c.fieldColumns[columnState.key]?.model ||
              c.uaColumns[columnState.key]?.model;
            if (columnModel) {
              columns.push(columnModel);
            }
          }
        }
      });
      return columns;
    }
    c.state.columnStates.forEach(item => {
      if (item.hidden) {
        return;
      }
      const columnModel =
        c.fieldColumns[item.key]?.model || c.uaColumns[item.key]?.model;
      if (columnModel) {
        columns.push(columnModel);
      }
    });
    return columns;
  });

  /**
   * 求和计算回调
   * @author lxm
   * @date 2023-08-07 05:21:31
   * @return {*}  {string[]}
   */
  const summaryMethod = ({
    columns,
  }: {
    columns: TableColumnCtx<IData>[];
    data: IData[];
  }): string[] => {
    return columns.map((item, index) => {
      if (index === 0) {
        return c.aggTitle;
      }
      return c.state.aggResult[item.property];
    });
  };

  /**
   * 表格合并单元格方法
   *
   * @return {*}
   */
  const spanMethod = ({
    row,
    column,
    rowIndex,
    columnIndex,
  }: {
    row: IData;
    column: IData;
    rowIndex: number;
    columnIndex: number;
  }) => {
    const spanMethodAttribute = c.model.controlAttributes?.find(item => {
      return item.attrName === 'span-method' && item.attrValue;
    });
    if (spanMethodAttribute) {
      return ScriptFactory.execScriptFn(
        {
          ...c.getEventArgs(),
          metadata: {
            row,
            column,
            rowIndex,
            columnIndex,
            items: tableRef.value!.store.states.data.value,
          },
        },
        spanMethodAttribute.attrValue!,
        { isAsync: false },
      ) as IData;
    }
    const { property } = column;
    const { rowspankeys = [], colspankeys = [] } = c.controlParams;
    // 合并行
    if (rowspankeys.length > 0 && rowspankeys.includes(property)) {
      // 只有第一列或有值时才和并
      const allow = columnIndex === 0 || row[property];
      // 第二行开始合并
      if (
        rowIndex > 0 &&
        allow &&
        row[property] === tableData.value[rowIndex - 1][property]
      ) {
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
      // 第一行计算出合并长度
      let rowspan = 1;
      for (let i = rowIndex + 1; i < tableData.value.length; i++) {
        if (allow && tableData.value[i][property] === row[property]) {
          rowspan += 1;
        } else {
          break;
        }
      }
      return {
        rowspan,
        colspan: 1,
      };
    }
    // 合并列
    if (colspankeys.length > 0 && colspankeys.includes(property)) {
      // 第二列开始合并
      const preProperty = renderColumns.value[columnIndex - 1].codeName;
      if (
        columnIndex > 0 &&
        colspankeys.includes(preProperty) &&
        row[property] === row[preProperty!]
      ) {
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
      // 第一列计算出合并长度
      let colspan = 1;
      for (let i = columnIndex + 1; i < renderColumns.value.length; i++) {
        const nextProperty = renderColumns.value[i].codeName!;
        if (
          colspankeys.includes(nextProperty) &&
          row[nextProperty] === row[property]
        ) {
          colspan += 1;
        } else {
          break;
        }
      }
      return {
        rowspan: 1,
        colspan,
      };
    }
    // 设置分组行的合并
    if (row.isGroupRow) {
      const total = c.state.singleSelect
        ? renderColumns.value.length
        : renderColumns.value.length + 1;
      const index = c.state.singleSelect ? 0 : 1;
      if (columnIndex === index) return { rowspan: 1, colspan: total };
      return {
        rowspan: 0,
        colspan: 0,
      };
    }
  };

  /**
   * 表格列拖动
   *
   * @return {*}
   */
  const headerDragend = (
    newWidth: number,
    oldWidth: number,
    column: IData,
  ): void => {
    const { property } = column;
    const columnC = c.columns[property!];
    const columnState = c.state.columnStates.find((item: IColumnState) => {
      return item.key === property;
    });
    if (columnC.isAdaptiveColumn) {
      if (columnState) {
        columnState.adaptive = false;
      }
      columnC.isAdaptiveColumn = false;
      columnC.model.width = newWidth;
      const index = renderColumns.value.findIndex(renderColumn => {
        const renderColumnC = c.columns[renderColumn.codeName!];
        return renderColumnC.isAdaptiveColumn;
      });
      c.hasAdaptiveColumn = index !== -1;
    }

    // 列宽持久化

    if (columnState) {
      columnState.columnWidth = newWidth;
      c.saveColumnStates();
    }
  };

  return {
    tableData,
    renderColumns,
    defaultSort,
    summaryMethod,
    spanMethod,
    headerDragend,
  };
}

/**
 * 监听表格头部高度变化，计算css变量
 */
export function useGridHeaderStyle(
  tableRef: IData,
  ns: Namespace,
): {
  headerCssVars: IData;
} {
  // 浏览器ResizeObserver对象
  let resizeObserver: ResizeObserver | null = null;

  // 上次表格头高度
  let lastGridHeaderHeight = 0;

  // 样式变量
  const headerCssVars = ref({});

  const calcGridHeaderHeight = () => {
    if (window.ResizeObserver) {
      const gridHeaderDom = tableRef.value!.$el.querySelector(
        '.el-table__header-wrapper',
      );
      if (gridHeaderDom) {
        // 监听表格头高度变化动态去算css
        resizeObserver = new ResizeObserver(entries => {
          const height = entries[0].contentRect.height;
          if (height !== lastGridHeaderHeight) {
            const tempCssVars = {
              'now-header-height': `${height}px`,
            };
            headerCssVars.value = ns.cssVarBlock(tempCssVars);
            lastGridHeaderHeight = height;
          }
        });
        resizeObserver.observe(gridHeaderDom);
      }
    }
  };

  const stop = watchEffect(() => {
    if (tableRef.value) {
      calcGridHeaderHeight();
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    stop();
  });

  return {
    headerCssVars,
  };
}

export function useGridDraggable(
  tableRef: IData,
  ns: Namespace,
  c: GridController,
): {
  cleanup?: () => void;
  setDragEvent?: () => void;
} {
  // 表格不启用次序调整
  if (!c.enableRowEditOrder) {
    return {};
  }

  // 拖拽下标
  let dragIndex = 0;

  // 目标下标
  let dropIndex = 0;

  // 拖拽数据
  let draggingData: IGridRowState | null = null;

  // 目标数据
  let dropData: IGridRowState | null = null;

  // eslint-disable-next-line @typescript-eslint/ban-types
  const cleanups: Function[] = [];

  const calcSrfKeyByClass = (classList: DOMTokenList): string => {
    let result = '';
    classList.forEach((className: string) => {
      if (className.startsWith('id-')) {
        result = className.replace('id-', '');
      }
    });
    return result;
  };

  const setRowDragEvent = (item: HTMLTableRowElement) => {
    item.setAttribute('draggable', 'true');
    const cleanDragStart = listenJSEvent(
      item,
      'dragstart',
      (event: DragEvent) => {
        if (event.target) {
          const draggingDom = event.target as HTMLElement;
          event.dataTransfer!.effectAllowed = 'move';
          const draggingKey = calcSrfKeyByClass(draggingDom.classList);
          dragIndex = c.state.rows.findIndex(
            row => row.data.srfkey === draggingKey,
          );
          draggingData = c.state.rows[dragIndex];
        }
      },
    );
    const cleanDragEnter = listenJSEvent(
      item,
      'dragenter',
      (event: DragEvent) => {
        event.preventDefault();
        const targetDom = event.currentTarget as HTMLElement;
        const targetKey = calcSrfKeyByClass(targetDom.classList);
        dropIndex = c.state.rows.findIndex(
          row => row.data.srfkey === targetKey,
        );
        if (draggingData?.data.srfkey === targetKey || dropIndex === -1) {
          return;
        }
        dropData = c.state.rows[dropIndex];
      },
    );
    const cleanDragOver = listenJSEvent(
      item,
      'dragover',
      (event: DragEvent) => {
        event.preventDefault();
      },
    );
    const cleanDragEnd = listenJSEvent(item, 'dragend', (event: DragEvent) => {
      event.preventDefault();
      if (draggingData && dropData) {
        c.onDragChange(
          draggingData,
          dropData,
          dropIndex > dragIndex ? 'next' : 'prev',
        );
      }
    });
    cleanups.push(cleanDragStart);
    cleanups.push(cleanDragEnter);
    cleanups.push(cleanDragOver);
    cleanups.push(cleanDragEnd);
  };

  const cleanup = () => {
    cleanups.forEach(cleanupF => {
      cleanupF();
    });
  };

  const setDragEvent = () => {
    cleanup();
    const grid = tableRef.value!.$el;
    if (grid) {
      const rows = grid.getElementsByClassName('el-table__row');
      rows.forEach((item: HTMLTableRowElement) => {
        setRowDragEvent(item);
      });
    }
  };

  watch(
    [() => tableRef.value, (): boolean => c.state.isLoaded],
    (table, isLoaded) => {
      if (!isLoaded || !table) {
        return;
      }
      setDragEvent();
    },
  );

  return {
    cleanup,
    setDragEvent,
  };
}
