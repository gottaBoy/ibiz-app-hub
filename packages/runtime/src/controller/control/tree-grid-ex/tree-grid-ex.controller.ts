import {
  IDETreeColumn,
  IDETreeGridEx,
  IDETreeDataSetNode,
  IDEUIActionGroup,
  IDETreeNodeFieldColumn,
  IDETreeNodeUAColumn,
} from '@ibiz/model-core';
import {
  RuntimeError,
  awaitTimeout,
  recursiveIterate,
  RuntimeModelError,
} from '@ibiz-template/core';
import { clone } from 'ramda';
import {
  ITreeNodeData,
  ITreeGridExState,
  ITreeGridExEvent,
  MDCtrlLoadParams,
  ITreeGridExRowState,
  IButtonContainerState,
  ITreeGridExController,
  ITreeGridExColumnProvider,
} from '../../../interface';
import { getTreeGridExColumnProvider } from '../../../register';
import { TreeGridExService } from './tree-grid-ex.service';
import { TreeController } from '../tree/tree.controller';
import {
  TreeGridExColumnController,
  TreeGridExUAColumnController,
  TreeGridExFieldColumnController,
} from './tree-grid-ex-column';
import { TreeGridExRowState } from './tree-grid-ex-row.state';
import { Srfuf } from '../../../service';
import { calcDeCodeNameById, calcUIActionGroup } from '../../../model';
import { TreeGridExNotifyState } from '../../constant';
import { handleAllSettled } from '../../../utils';
import { ControllerEvent, getDefaultValue, isValueChange } from '../../utils';

/**
 * 树表格（增强）部件控制器
 *
 * @author zk
 * @date 2023-09-21 06:09:46
 * @export
 * @class TreeGridExController
 * @extends {MDControlController<IDETree, ITreeGridState, ITreeGridEvent>}
 * @implements {ITreeGridExController}
 */
export class TreeGridExController<
    T extends IDETreeGridEx = IDETreeGridEx,
    S extends ITreeGridExState = ITreeGridExState,
    E extends ITreeGridExEvent = ITreeGridExEvent,
  >
  extends TreeController<T, S, E>
  implements ITreeGridExController<T, S, E>
{
  declare service: TreeGridExService;

  protected get _evt(): ControllerEvent<ITreeGridExEvent> {
    return this.evt;
  }

  /**
   * 单元格超出呈现模式
   * @author lxm
   * @date 2023-11-17 01:56:26
   * @readonly
   * @type {('wrap' | 'ellipsis')}
   */
  get overflowMode(): 'wrap' | 'ellipsis' {
    if (this.controlParams.overflowmode) {
      return this.controlParams.overflowmode;
    }
    return ibiz.config.grid.overflowMode;
  }

  /**
   * @description 行编辑模式
   * @readonly
   * @type {('cell' | 'row' | 'all')}
   * @memberof TreeGridExController
   */
  get editShowMode(): 'cell' | 'row' | 'all' {
    if (this.controlParams.editshowmode) {
      return this.controlParams.editshowmode;
    }
    return ibiz.config.grid.editShowMode;
  }

  /**
   * 隐藏无值的单位
   *
   * @readonly
   * @type {boolean}
   * @memberof TreeGridExController
   */
  get emptyHiddenUnit(): boolean {
    if (this.controlParams.emptyhiddenunit) {
      return (
        this.controlParams.emptyhiddenunit === 'true' ||
        this.controlParams.emptyhiddenunit === true
      );
    }
    return ibiz.config.grid.emptyHiddenUnit;
  }

  /**
   * 行编辑保存模式
   *
   * @readonly
   * @type {('cell-blur' | 'auto' | 'manual')}
   * @memberof GridController
   */
  get editSaveMode(): 'cell-blur' | 'auto' | 'manual' {
    if (this.controlParams.editsavemode) {
      return this.controlParams.editsavemode;
    }
    return ibiz.config.grid.editSaveMode;
  }

  /**
   * 树表格（增强）列的适配器
   *
   * @author zk
   * @date 2023-09-21 06:09:04
   * @type {{ [key: string]: ITreeGridExColumnProvider }}
   * @memberof TreeGridExController
   */
  providers: { [key: string]: ITreeGridExColumnProvider } = {};

  /**
   * 所有树表格（增强）列控制器集合
   *
   * @author zk
   * @date 2023-09-21 06:09:10
   * @type {{ [key: string]: TreeGridExColumnController }}
   * @memberof TreeGridExController
   */
  columns: { [key: string]: TreeGridExColumnController } = {};

  /**
   * 所有树表格（增强）属性列的控制器
   *
   * @author zk
   * @date 2023-09-21 06:09:16
   * @type {{ [key: string]: TreeGridExFieldColumnController }}
   * @memberof TreeGridExController
   */
  fieldColumns: { [key: string]: TreeGridExFieldColumnController } = {};

  /**
   * 所有树表格（增强）操作列的控制器
   *
   * @author zk
   * @date 2023-09-21 06:09:21
   * @type {{ [key: string]: TreeGridExUAColumnController }}
   * @memberof TreeGridExController
   */
  uaColumns: { [key: string]: TreeGridExUAColumnController } = {};

  /**
   * 是否有配置宽度自适应列
   *
   * @type {boolean}
   * @memberof GridController
   */
  get hasAdaptiveColumn(): boolean {
    return !!Object.values(this.columns).find(item => item.isAdaptiveColumn);
  }

  /**
   * 允许使用行编辑
   * @author lxm
   * @date 2023-08-17 02:52:07
   * @readonly
   * @type {boolean}
   */
  get allowRowEdit(): boolean {
    return this.state.rowEditOpen;
  }

  protected initState(): void {
    super.initState();
    this.state.columnStates = [];
    this.state.rootNodes = [];
    this.state.rows = {};
    // this.state.rowEditOpen = false;
    this.state.rowEditOpen = true;
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();

    await this.initGridColumns();
    this.initColumnStates();
  }

  protected async initService(): Promise<void> {
    this.service = new TreeGridExService(this.model);
    await this.service.init(this.context);
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof TreeGridExController
   */
  protected async initUIActions(): Promise<void> {
    await super.initUIActions();
    // 收集所有遍历过程中的异步任务
    const asyncTasks: Promise<IDEUIActionGroup>[] = [];
    // 属性列界面行为组与操作列界面行为组
    this.model.detreeNodes?.forEach(node => {
      if (node.detreeNodeColumns?.length) {
        node.detreeNodeColumns.forEach(
          (column: IDETreeNodeFieldColumn | IDETreeNodeUAColumn) => {
            if (column.deuiactionGroup) {
              const task = calcUIActionGroup(
                column.deuiactionGroup,
                this.context,
                this.params,
              );
              asyncTasks.push(task);
            }
          },
        );
      }
    });
    await Promise.all(asyncTasks);
  }

  /**
   * 初始化树表格（增强）属性列，操作列，编辑项控制器
   *
   * @author zk
   * @date 2023-09-21 06:09:28
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof TreeGridExController
   */
  protected async initGridColumns(): Promise<void> {
    if (this.model.detreeColumns) {
      await Promise.all(
        this.model.detreeColumns.map(async column =>
          this.initColumnsController(column),
        ),
      );
    }
  }

  /**
   * 初始化树表格（增强）属性列，操作列，编辑项控制器
   *
   * @author zk
   * @date 2023-09-21 06:09:37
   * @protected
   * @param {IDETreeColumn} column
   * @return {*}  {Promise<void>}
   * @memberof TreeGridExController
   */
  protected async initColumnsController(column: IDETreeColumn): Promise<void> {
    // 初始化适配器
    const provider = await getTreeGridExColumnProvider(column);
    if (!provider) {
      return;
    }
    this.providers[column.codeName!] = provider;

    // 初始化树表格（增强）列控制器
    const controller = await provider.createController(column, this);

    // 分类存放控制器
    this.columns[column.codeName!] = controller as TreeGridExColumnController;
    if (column.columnType === 'DEFGRIDCOLUMN') {
      this.fieldColumns[column.codeName!] =
        controller as TreeGridExFieldColumnController;
    } else if (column.columnType === 'UAGRIDCOLUMN') {
      this.uaColumns[column.codeName!] =
        controller as TreeGridExUAColumnController;
    }
  }

  /**
   * 加载之后
   *
   * @param {MDCtrlLoadParams} args
   * @param {IData[]} items
   * @return {*}  {Promise<IData[]>}
   * @memberof TreeGridExController
   */
  async afterLoad(args: MDCtrlLoadParams, items: IData[]): Promise<IData[]> {
    await super.afterLoad(args, items);
    await this.updateRows(this.state.rows);
    return items;
  }

  /**
   * 更新列状态
   *
   * @param {IData} rows
   * @return {*}  {Promise<void>}
   * @memberof TreeGridExController
   */
  async updateRows(rows: IData): Promise<void> {
    Object.values(rows).forEach((row: ITreeGridExRowState) => {
      Object.values(row.columnActionsStates).forEach(
        (uaState: IButtonContainerState) => {
          uaState.update(
            this.context,
            row.data._deData,
            this.model.appDataEntityId,
          );
        },
      );
    });
  }

  /**
   * 初始化树表格（增强）列状态
   *
   * @author zk
   * @date 2023-09-21 06:09:43
   * @protected
   * @memberof TreeGridExController
   */
  protected initColumnStates(): void {
    this.model.detreeColumns?.forEach(column => {
      // 列隐藏模式为始终隐藏则不初始化到表格列数据中
      if (column.hideMode !== 2) {
        this.state.columnStates.push({
          key: column.codeName!,
          caption: column.caption!,
          hidden: !!column.hideDefault,
          hideMode: column.hideMode || 0,
          uaColumn: column.columnType === 'UAGRIDCOLUMN',
          columnWidth: column.width,
        });
      }
    });

    this.calcColumnFixed();
  }

  /**
   * 计算列的固定状态
   *
   * @author zk
   * @date 2023-09-21 06:09:50
   * @protected
   * @memberof TreeGridExController
   */
  protected calcColumnFixed(): void {
    // 过滤出当前显示的列
    const showColumns = this.state.columnStates.filter(
      column => !column.hidden,
    );
    const allNum = showColumns.length;
    showColumns.forEach((column, index) => {
      if (column.uaColumn) {
        // 操作列根据在中间列的那一侧，固定在最左侧或最右侧
        column.fixed = index + 1 <= Math.floor(allNum / 2) ? 'left' : 'right';
      }
    });
  }

  /**
   * 获取树表格行数据
   * @author lxm
   * @date 2023-12-22 02:23:44
   * @param {string} key 可以是节点id也可以是_uuid
   * @return {*}  {(ITreeGridExRowState | undefined)}
   */
  getRowState(key: string): ITreeGridExRowState | undefined {
    const nodeData = this.getNodeData(key);
    if (nodeData) {
      return this.state.rows[nodeData._uuid];
    }
  }

  async afterLoadNodes(nodes: ITreeNodeData[]): Promise<void> {
    await super.afterLoadNodes(nodes);

    // 封装更新树表格行数据
    recursiveIterate(
      { _children: nodes },
      (node: ITreeNodeData) => {
        this.state.rows[node._uuid] = new TreeGridExRowState(node, this);
      },
      { childrenFields: ['_children'] },
    );

    await this.updateRows(this.state.rows);
  }

  /**
   * 转换各类多语言
   *
   * @date 2023-05-18 02:57:00
   * @protected
   */
  protected convertMultipleLanguages(): void {
    // *转换列标题的多语言
    const convertColumnCaption = (columns: IDETreeColumn[]): void => {
      columns.forEach((column: IDETreeColumn) => {
        if (column.capLanguageRes && column.capLanguageRes.lanResTag) {
          column.caption = ibiz.i18n.t(
            column.capLanguageRes.lanResTag,
            column.caption,
          );
        }
      });
    };
    if (this.model.detreeColumns && this.model.detreeColumns.length > 0) {
      convertColumnCaption(this.model.detreeColumns);
    }
  }

  async save(nodeData: ITreeNodeData): Promise<void> {
    if (this.state.isSimple) {
      ibiz.log.debug(ibiz.i18n.t('runtime.controller.common.md.simpleMode'));
      return;
    }

    if (nodeData._nodeType !== 'DE') {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.gantt.nonentity'),
      );
    }

    const rowState = this.state.rows[nodeData._uuid];
    if (!rowState) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.common.md.rowData'),
      );
    }

    if (!rowState.modified) {
      ibiz.log.debug(ibiz.i18n.t('runtime.controller.common.md.noChange'));
      return;
    }

    // const isValid = await this.validate(rowState);
    // if (!isValid) {
    //   throw new RuntimeError('行数据校验不通过，保存取消');
    // }

    // 如果数据正在处理中，则延迟保存
    if (rowState.processing) {
      await awaitTimeout(500, this.save.bind(this), [nodeData]);
      return;
    }

    const nodeModel = this.getNodeModel(nodeData._nodeId)!;
    const { appDataEntityId, updateAppDEActionId } =
      nodeModel as IDETreeDataSetNode;
    const isCreate = nodeData._deData!.srfuf === Srfuf.CREATE;

    if (isCreate) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.treeGridEx.noSupportCreation'),
      );
    }

    if (!updateAppDEActionId) {
      throw new RuntimeModelError(
        nodeModel,
        ibiz.i18n.t('runtime.controller.control.treeGridEx.updateBehavior'),
      );
    }

    // 处理接口
    const deName = calcDeCodeNameById(appDataEntityId!);
    const tempContext = this.context.clone();
    tempContext[deName] = nodeData._deData!.srfkey;

    const app = ibiz.hub.getApp(this.context.srfappid);

    let res;

    try {
      res = await app.deService.exec(
        appDataEntityId!,
        updateAppDEActionId,
        tempContext,
        nodeData._deData,
      );
    } catch (error) {
      await this._evt.emit('onSaveError', undefined);
      this.actionNotification(`${isCreate ? 'CREATE' : 'UPDATE'}ERROR`, {
        error: error as Error,
        data: rowState.data,
      });
      throw error;
    }
    // 后续处理
    rowState.data._deData = res.data;
    rowState.modified = false;

    this.gridStateNotify(rowState, TreeGridExNotifyState.SAVE);
    await this.updateRows(this.state.rows);
    await this._evt.emit('onSaveSuccess', undefined);
  }

  async saveAll(): Promise<void> {
    const needSaveData = Object.values(this.state.rows)
      .filter(row => row.modified)
      .map(row => row.data);
    if (!needSaveData.length) {
      return;
    }

    await handleAllSettled(
      needSaveData.map(data => {
        return this.save(data);
      }),
    );
  }

  /**
   * 树表格状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  gridStateNotify(row: TreeGridExRowState, state: TreeGridExNotifyState): void {
    // 通知表格编辑列
    Object.values(this.columns).forEach(column => {
      column.gridStateNotify(row, state);
    });
  }

  /**
   * 设置行属性的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {GridRowState} row 行状态控制器
   * @param {unknown} value 要设置的值
   * @param {string} name 要设置的表单数据的属性名称
   * @param {boolean} ignore 忽略脏值检查
   */
  async setRowValue(
    row: TreeGridExRowState,
    name: string,
    value: unknown,
    ignore: boolean = false,
  ): Promise<void> {
    if (
      Object.prototype.hasOwnProperty.call(row.data, name) &&
      !isValueChange((row.data as IData)[name], value)
    ) {
      // `表格行数据里没有属性${name}或者${name}的值未发生改变`
      return;
    }
    // 改变值
    (row.data as IData)[name] = value;
    if (!ignore) {
      row.modified = true;
    }
    row.processing = true;

    try {
      await this.dataChangeNotify(row, [name]);
      // await this._evt.emit('onGridDataChange', {
      //   data: this.state.rows.map(_row => {
      //     return _row.data;
      //   }),
      // });
    } finally {
      row.processing = false;
    }
  }

  /**
   * 通知所有表格编辑项成员表格编辑项数据变更
   *
   * @author lxm
   * @date 2022-09-20 22:09:49
   * @param {GridRowState} row 行数据
   * @param {string[]} names 更新的属性
   */
  async dataChangeNotify(
    row: TreeGridExRowState,
    names: string[],
  ): Promise<void> {
    // 通知所有编辑项去处理编辑项相关逻辑
    await handleAllSettled(
      Object.values(this.columns).map(async column => {
        return column.dataChangeNotify(row, names);
      }),
    );
  }

  async toggleRowEdit(): Promise<void> {
    this.state.rowEditOpen = !this.state.rowEditOpen;
  }

  /**
   * 计算默认值并返回一个对象，对象里的属性就是要填充的默认值
   * 没有的属性就是不需要填充默认值的属性
   * @author lxm
   * @date 2023-09-18 04:01:06
   * @param {IData} data
   * @param {boolean} isCreate
   * @return {*}  {IData}
   */
  calcDefaultValue(data: ITreeNodeData, isCreate: boolean): IData {
    const result: IData = {};
    Object.values(this.fieldColumns).forEach(c => {
      const nodeColumn = c.nodeColumnControllerMap.get(data._nodeId);
      if (!nodeColumn || !nodeColumn.nodeEditItem) {
        return;
      }
      const { createDV, createDVT, updateDV, updateDVT } =
        nodeColumn.nodeEditItem;
      const valueType = isCreate ? createDVT : updateDVT;
      const defaultValue = isCreate ? createDV : updateDV;
      const defaultVal = getDefaultValue(
        {
          name: c.name,
          valueType,
          defaultValue,
          valueFormat: nodeColumn.valueFormat,
        },
        { data, context: this.context, params: this.params },
      );
      if (defaultVal !== undefined) {
        result[c.name] = defaultVal;
      }
    });
    return result;
  }

  /**
   * 切换单行的编辑状态
   * @author lxm
   * @date 2023-08-08 06:45:54
   * @param {GridRowState} row
   * @param {boolean} [editable]
   */
  async switchRowEdit(
    row: TreeGridExRowState,
    editable?: boolean,
    isSave: boolean = true,
  ): Promise<void> {
    if (!this.allowRowEdit) {
      return;
    }
    if (row.data._nodeType !== 'DE') {
      return;
    }

    const toState = editable === undefined ? !row.showRowEdit : editable;
    // 一样的状态不处理
    if (row.showRowEdit === toState) {
      return;
    }

    if (toState === false) {
      // * 处理关闭行编辑
      if (isSave) {
        // 校验并保存
        await this.save(row.data);
      } else if (row.data._deData!.srfuf === Srfuf.CREATE) {
        // 新建的行取消时删除这一行的数据
        row.showRowEdit = false;
        this._evt.emit('onRowEditChange', { row });
        return this.remove({ data: [row.data], silent: true });
      } else if (row.cacheData) {
        // 取消的时候，还原编辑前的数据
        row.data = row.cacheData;
        delete row.cacheData;
      }
    } else {
      // * 处理显示行编辑
      // 如果已经有一行处于行编辑了，不开起另一行。
      const editingRow = Object.values(this.state.rows).find(
        item => item.showRowEdit,
      );
      if (editingRow) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.control.grid.lineEditing'),
        );
      }

      if (row.data._deData!.srfuf === Srfuf.UPDATE) {
        // 打开时先缓存一下
        row.cacheData = clone(row.data);

        // 填充更新默认值
        const defaultVal = this.calcDefaultValue(row.data, false);
        Object.assign(row.data, defaultVal);
      }
    }

    // 修改行的编辑状态和编辑列的编辑状态。
    row.showRowEdit = toState;
    Object.values(this.fieldColumns).forEach(column => {
      row.editColStates[column.name].editable = toState;
    });

    this._evt.emit('onRowEditChange', { row });
  }

  /**
   * 树节点点击事件
   *
   * @param {ITreeNodeData} nodeData
   * @returns {*}  {Promise<void>}
   * @memberof TreeController
   */
  async onTreeNodeClick(
    _nodeData: ITreeNodeData,
    event: MouseEvent,
  ): Promise<void> {
    const nodeData = this.getNodeData(_nodeData._id);
    if (!nodeData) {
      return;
    }
    // 设置导航数据
    this.setNavData(nodeData);
    // 节点有配置常用操作的上下文菜单时，触发界面行为，后续逻辑都不走
    const clickActionItem =
      this.contextMenuInfos[nodeData._nodeId]?.clickTBUIActionItem;
    const onlyOneActionItem =
      this.contextMenuInfos[nodeData._nodeId]?.onlyOneActionItem;
    if (clickActionItem && onlyOneActionItem) {
      return this.doUIAction(
        clickActionItem.uiactionId!,
        nodeData,
        event,
        clickActionItem.appId,
      );
    }

    // 导航的时候，没有导航视图的时候，节点后续点击逻辑都不走，也不选中
    if (this.state.navigational) {
      const nodeModel = this.getNodeModel(nodeData._nodeId);
      if (!nodeModel?.navAppViewId) {
        return;
      }
    }

    // 单选时，单击才会触发选中逻辑,禁止选择的时候不触发
    if (this.state.singleSelect && !nodeData._disableSelect) {
      // 选中相关处理
      const { selectedData } = this.state;
      // 选中里没有则添加，有则删除
      const filterArr = selectedData.filter(item => item._id !== nodeData._id);
      if (filterArr.length === selectedData.length) {
        this.setSelection(
          this.state.singleSelect
            ? [nodeData]
            : selectedData.concat([nodeData]),
        );
      } else {
        this.setSelection(filterArr);
      }
    }
    // 激活事件--（树表格增强暂无法设置激活模式）
    if (this.state.mdctrlActiveMode === 1) {
      await this.setActive(nodeData);
    }
    // 执行opendata逻辑事件
    await this.openData(nodeData, event);
  }
}
