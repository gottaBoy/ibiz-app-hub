import { IDEGridFieldColumn, IDETreeGrid } from '@ibiz/model-core';
import { RuntimeModelError } from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import {
  ITreeGridEvent,
  ITreeGridState,
  MDCtrlLoadParams,
  ITreeGridController,
} from '../../../interface';
import { GridController } from '../grid';
import { ControlVO } from '../../../service';

export class TreeGridController<
    T extends IDETreeGrid = IDETreeGrid,
    S extends ITreeGridState = ITreeGridState,
    E extends ITreeGridEvent = ITreeGridEvent,
  >
  extends GridController<T, S, E>
  implements ITreeGridController<T, S, E>
{
  /**
   * 树表格值属性名称
   *
   */
  treeGridValueField: string = '';

  /**
   * 树表格父属性名称
   *
   */
  treeGridParentField: string = '';

  protected initState(): void {
    super.initState();
    this.state.showTreeGrid = true;
    this.state.treeGirdData = [];
    this.state.tableKey = '';
  }

  /**
   * 初始化方法
   *
   * @author lxm
   * @date 2022-08-18 22:08:17
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.initTreeGridField();
  }

  /**
   * 初始化树表格字段
   * @return {*}
   * @author: zhujiamin
   */
  protected initTreeGridField(): void {
    const treeGridParent: IDEGridFieldColumn | undefined =
      this.model.degridColumns?.find((item: IDEGridFieldColumn) => {
        return item.treeColumnMode === 4 || item.treeColumnMode === 12;
      });
    if (!treeGridParent)
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.treeGrid.columnMode'),
      );
    const treeGridValue: IDEGridFieldColumn | undefined =
      this.model.degridColumns?.find((item: IDEGridFieldColumn) => {
        return item.treeColumnMode === 2 || item.treeColumnMode === 3;
      });
    if (!treeGridValue)
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.treeGrid.columnsSchema'),
      );
    this.treeGridValueField = treeGridValue.appDEFieldId!.toLowerCase();
    this.treeGridParentField = treeGridParent.appDEFieldId!.toLowerCase();
  }

  /**
   * @description  处理刷新模式
   * @protected
   * @param {MDCtrlLoadParams} args
   * @memberof TreeGridController
   */
  protected handleRefreshMode(args: MDCtrlLoadParams): void {
    super.handleRefreshMode(args);
    // 缓存模式时需排除没有的数据
    if (this.refreshMode === 'cache')
      this.state.expandRowKeys = this.state.expandRowKeys.filter(key =>
        this.state.items.some(item => item.srfkey === key),
      );
    // 树表格是懒加载的必须强制更新组件
    this.state.tableKey = createUUID();
  }

  async afterLoad(
    args: MDCtrlLoadParams,
    items: ControlVO[],
  ): Promise<ControlVO[]> {
    this.calcTreeGridData(this.state.items);
    await super.afterLoad(args, items);
    return items;
  }

  /**
   * @description 获取树表格数据项
   * @param {IData} data
   * @return {*}  {IData}
   * @memberof TreeGridController
   */
  getTreeGridDataItem(data: IData): IData {
    const tempData = data.clone();
    // 判断是否有子 （显示下拉图标）
    tempData.hasChildren = this.state.items.some(
      item =>
        data[this.treeGridValueField!] === item[this.treeGridParentField!],
    );
    tempData.children = [];
    return tempData;
  }

  /**
   * @description 计算树表格数据
   * @param {IData[]} items
   * @memberof TreeGridController
   */
  calcTreeGridData(items: IData[]): void {
    const treeGirdItems: IData[] = items.map(data =>
      this.getTreeGridDataItem(data),
    );
    const rootNodes: IData[] = [];
    const ids: string[] = [];
    treeGirdItems.forEach(item => {
      const id = item[this.treeGridValueField!];
      if (id) ids.push(id);
    });
    treeGirdItems.forEach(item => {
      if (!ids.includes(item[this.treeGridParentField!])) rootNodes.push(item);
    });

    this.state.treeGirdData = rootNodes;
  }

  /**
   * 切换树表格显示
   * @return {*}
   * @author: zhujiamin
   */
  switchTreeGridShow(): void {
    this.state.showTreeGrid = !this.state.showTreeGrid;
  }

  /**
   * @description 切换折叠,其中tag表示操作指定表格分组行标识，若不传则操作当前表格的所有分组展开状态，expand表示是否展开，若不传则以当前分组状态为基准切换
   * @param {{ tag?: string; expand?: boolean }} [params={}]
   * @memberof TreeGridController
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    // 存在分组id则展开/收缩分组
    if (tag) {
      const row = this.state.items.find(x => x.srfkey === tag);
      if (row) {
        this._evt.emit('onToggleRowExpansion', { row, expand });
      }
    } else {
      // 不存在分组id时全展开/全收缩
      const groups = this.state.treeGirdData.filter(item => item.hasChildren);
      groups.forEach(item => {
        this._evt.emit('onToggleRowExpansion', { row: item, expand });
      });
    }
  }
}
