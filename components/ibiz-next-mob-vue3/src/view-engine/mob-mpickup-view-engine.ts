import {
  ViewController,
  IMPickupViewState,
  IMPickupViewEvent,
  SysUIActionTag,
  IListController,
  IPanelItemController,
  IApiMobMPickupViewCall,
} from '@ibiz-template/runtime';
//   todo 缺失 IAppDEMobMPickupView
import { IAppDEMobPickupView } from '@ibiz/model-core';
import { MobPickupViewEngine } from './mob-pickup-view.engine';

/**
 * 多数据选择视图引擎
 *
 * @author zk
 * @date 2023-05-25 03:05:17
 * @export
 * @class MobMPickupViewEngine
 * @extends {MobViewBaseEngine}
 */
export class MobMPickupViewEngine extends MobPickupViewEngine {
  declare protected view: ViewController<
    IAppDEMobPickupView,
    IMPickupViewState,
    IMPickupViewEvent
  >;

  /**
   * 简单列表控制器
   *
   * @author zk
   * @date 2023-05-26 03:05:43
   * @readonly
   * @memberof MobMPickupViewEngine
   */
  get simpleList(): IListController {
    return this.view.getController('simplelist') as IListController;
  }

  /**
   * 底部按钮
   *
   * @author zk
   * @date 2023-11-08 04:11:41
   * @readonly
   * @type {PanelButtonController}
   * @memberof MobWFDynaEditViewEngine
   */
  get okButton(): IPanelItemController {
    return this.view.layoutPanel!.panelItems
      .button_okaction as IPanelItemController;
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @author zk
   * @date 2023-05-26 05:05:36
   * @return {*}  {Promise<void>}
   * @memberof MobMPickupViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    // 设置回显selectedData
    if (this.view.params.selectedData) {
      this.selectedData = JSON.parse(this.view.params.selectedData);
      delete this.view.params.selectedData;
    }
    if (this.view.params.selecteddata) {
      this.selectedData = JSON.parse(this.view.params.selecteddata);
      delete this.view.params.selecteddata;
    }
    if (!this.view.slotProps.simplelist) {
      this.view.slotProps.simplelist = {};
    }
    if (!this.view.slotProps.pickupviewpanel) {
      this.view.slotProps.pickupviewpanel = {};
    }
    this.view.slotProps.pickupviewpanel.singleSelect = false;
    this.view.slotProps.pickupviewpanel.selectedData = this.selectedData;
    this.view.slotProps.simplelist.singleSelect = false;
    this.view.slotProps.simplelist.mdctrlActiveMode = 2;
    this.view.slotProps.simplelist.mode = 'SELECT';
    this.view.slotProps.simplelist.loadDefault = false;
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @author zk
   * @date 2023-05-26 05:05:27
   * @return {*}  {Promise<void>}
   * @memberof MobMPickupViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.pickupViewPanel.evt.on('onSelectionChange', event => {
      this.pickupViewPanelSelectionChange(event.data);
    });

    // 列表激活取消选中
    this.simpleList.evt.on('onActive', event => {
      this.removeSelection(event.data);
      // this.simpleListActive(event.data);
    });
    // 默认回显选中数据
    this.simpleList.setData(this.selectedData);
    this.simpleList.setSelection(this.selectedData);
    // 隐藏simplelist
    if (this.simpleList) {
      this.view.layoutPanel!.panelItems.simplelist.state.visible = false;
    }
  }

  async call(
    key: keyof IApiMobMPickupViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.CANCEL) {
      this.cancel();
      return null;
    }
    if (key === SysUIActionTag.OK) {
      this.confirm();
      return null;
    }
    if (key === SysUIActionTag.ADD_ALL) {
      this.addAll();
      return null;
    }
    if (key === SysUIActionTag.REMOVE_ALL) {
      this.removeAll();
      return null;
    }
    if (key === SysUIActionTag.ADD_SELECTION) {
      this.addSelection();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 选择面板激活数据
   *
   * @memberof MobMPickupViewEngine
   */
  public async pickupViewPanelDataActive(): Promise<void> {
    const selectedData = await this.pickupViewPanel.getSelectedData();
    await this.handlePushSimpleListItems(selectedData);
  }

  /**
   *  选则面板激活数据
   *
   * @author zk
   * @date 2023-05-26 05:05:13
   * @param {*} data
   * @memberof PickupViewEngine
   */
  public pickupViewPanelSelectionChange(data: IData[]): void {
    this.simpleList.setData(data);
    this.simpleList.setSelection(data);
  }

  /**
   * 计算重复数据
   *
   * @author zk
   * @date 2023-07-03 04:07:48
   * @param {IData[]} items
   * @param {IData} data
   * @memberof MobMPickupViewEngine
   */
  calcDuplicateData(items: IData[], data: IData[]): IData[] {
    data.forEach(item => {
      const index = items.findIndex(
        _item =>
          (_item.srfkey && _item.srfkey === item.srfkey) ||
          _item.id === item.id,
      );
      if (index !== -1) {
        items.splice(index, 1);
      } else {
        items.push(item);
      }
    });
    return items;
  }

  /**
   * 处理添加简单列表数据
   *
   * @author zk
   * @date 2023-05-26 02:05:41
   * @param {IData[]} data
   * @memberof MobMPickupViewEngine
   */
  public async handlePushSimpleListItems(data: IData[]): Promise<void> {
    // 每次添加的都是多数据部件当前页数据，因此需先将原来简单列表的当前页数据过滤掉
    const items = await this.pickupViewPanel.getAllData();
    // 过滤出非当前页数据
    const selectItems = this.simpleList
      .getAllData()
      .filter(selected => !items.some(item => item.srfkey === selected.srfkey));
    // 将多数据部件当前页数据加入简单列表选中
    selectItems.push(...data);
    // 去重items
    const uniqueItems = this.handleUniqueItems(selectItems);
    this.setSelectedData(uniqueItems);
  }

  /**
   * 去重数组
   *
   * @protected
   * @param {IData[]} arr
   * @return {*}  {IData[]}
   * @memberof MobMPickupViewEngine
   */
  protected handleUniqueItems(arr: IData[]): IData[] {
    const res = new Map();
    return arr.filter(
      (item: IData) => !res.has(item.srfkey) && res.set(item.srfkey, 1),
    );
  }

  /**
   * 添加所有
   *
   * @author zk
   * @date 2023-05-25 05:05:12
   * @memberof MobMPickupViewEngine
   */
  public async addAll(): Promise<void> {
    const allItems = await this.pickupViewPanel.getAllData();
    this.handlePushSimpleListItems(allItems);
  }

  /**
   * 删除所有
   *
   * @author zk
   * @date 2023-05-25 05:05:14
   * @memberof MobMPickupViewEngine
   */
  public removeAll(): void {
    this.setSelectedData([]);
  }

  /**
   * 添加选中
   *
   * @author zk
   * @date 2023-05-25 05:05:10
   * @memberof MobMPickupViewEngine
   */
  public async addSelection(): Promise<void> {
    const selectItem = await this.pickupViewPanel.getSelectedData();
    this.handlePushSimpleListItems(selectItem);
  }

  /**
   * 删除选中
   *
   * @author zk
   * @date 2023-05-25 05:05:16
   * @memberof MobMPickupViewEngine
   */
  public removeSelection(selectedData: IData[]): void {
    const items = this.simpleList.getAllData();
    selectedData.forEach((_item: IData) => {
      const index = items.findIndex(
        (item: IData) => _item.srfkey === item.srfkey,
      );
      if (index !== -1) {
        items.splice(index, 1);
      }
    });
    this.setSelectedData(items);
  }

  /**
   * @description 设置选中数据
   * @protected
   * @param {IData[]} items
   * @memberof MPickupViewEngine
   */
  protected setSelectedData(items: IData[]): void {
    super.setSelectedData(items);
    this.simpleList.setData(items);
  }

  /**
   * 提交
   *
   * @author zk
   * @date 2023-05-25 06:05:42
   * @memberof MobMPickupViewEngine
   */
  confirm(): void {
    const items = this.simpleList.getAllData();
    this.view.closeView({ ok: true, data: items });
  }

  /**
   * 计算底部的显示与否
   * @author lxm
   * @date 2023-06-20 02:45:17
   * @protected
   * @return {*}  {boolean}
   */
  protected calcViewFooterVisible(): boolean {
    const showFooter: boolean = true;
    // 工具栏
    // if (this.simpleList) {
    //   showFooter = true;
    // }
    return showFooter;
  }
}
