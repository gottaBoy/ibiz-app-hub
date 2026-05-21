import { RuntimeModelError } from '@ibiz-template/core';
import {
  ViewController,
  SysUIActionTag,
  IListController,
  IMPickupViewState,
  IMPickupViewEvent,
  IApiMPickupViewCall,
} from '@ibiz-template/runtime';
import { IAppDEPickupView } from '@ibiz/model-core';
import { PickupViewEngine } from './pickup-view.engine';

/**
 * 多数据选择视图引擎
 *
 * @author zk
 * @date 2023-05-25 03:05:17
 * @export
 * @class MPickupViewEngine
 * @extends {ViewEngineBase}
 */
export class MPickupViewEngine extends PickupViewEngine {
  declare protected view: ViewController<
    IAppDEPickupView,
    IMPickupViewState,
    IMPickupViewEvent
  >;

  /**
   * @description 是否严格的遵循穿梭空左右互相关联
   * @type {boolean}
   * @memberof MPickupViewEngine
   */
  checkStrictly: boolean = false;

  /**
   * 简单列表控制器
   *
   * @author zk
   * @date 2023-05-26 03:05:43
   * @readonly
   * @memberof MPickupViewEngine
   */
  get simpleList(): IListController {
    return this.view.getController('simplelist') as IListController;
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @author zk
   * @date 2023-05-26 05:05:36
   * @return {*}  {Promise<void>}
   * @memberof MPickupViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    if (!this.view.providers.simplelist) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('viewEngine.missingConfigErr'),
      );
    }

    const { childNames } = this.view;
    childNames.push('simplelist');
    if (!this.view.slotProps.simplelist) {
      this.view.slotProps.simplelist = {};
    }
    if (!this.view.slotProps.pickupviewpanel) {
      this.view.slotProps.pickupviewpanel = {};
    }
    this.view.slotProps.simplelist.mdctrlActiveMode = 2;
    this.view.slotProps.simplelist.isSimple = true;
    this.view.slotProps.simplelist.singleSelect = false;
    this.view.slotProps.pickupviewpanel.singleSelect = false;
    if (this.view.params.checkstrictly) {
      this.checkStrictly =
        this.view.params.checkstrictly === 'true' ||
        this.view.params.checkstrictly === true;
      delete this.view.params.checkstrictly;
    }
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @author zk
   * @date 2023-05-26 05:05:27
   * @return {*}  {Promise<void>}
   * @memberof MPickupViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    // 列表激活取消选中
    this.simpleList.evt.on('onActive', event => {
      this.simpleListActive(event.data);
    });
    this.setSelectedData(this.selectData);
  }

  async call(
    key: keyof IApiMPickupViewCall,
    args: IData | undefined,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.CANCEL) {
      this.cancel();
      return null;
    }
    if (key === SysUIActionTag.OK) {
      this.confirm();
      return null;
    }
    if (key === SysUIActionTag.ADD_SELECTION) {
      this.addSelection();
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
    if (key === SysUIActionTag.REMOVE_SELECTION) {
      this.removeSelection();
      return null;
    }
    return super.call(key, args);
  }

  /**
   *  选则面板激活数据
   *
   * @author zk
   * @date 2023-05-26 05:05:13
   * @param {*} data
   * @memberof PickupViewEngine
   */
  protected async pickupViewPanelDataActive(data: IData[]): Promise<void> {
    await this.handlePushSimpleListItems(data);
  }

  /**
   * 列表激活
   *
   * @author zk
   * @date 2023-05-26 05:05:47
   * @param {IData[]} data
   * @memberof MPickupViewEngine
   */
  protected simpleListActive(data: IData[]): void {
    const items = this.simpleList.getAllData();
    data.forEach(item => {
      const index = items.findIndex(_item => _item.srfkey === item.srfkey);
      if (index !== -1) {
        items.splice(index, 1);
      }
    });
    this.setSelectedData(items);
  }

  /**
   * 添加选中
   *
   * @author zk
   * @date 2023-05-25 05:05:10
   * @memberof MPickupViewEngine
   */
  async addSelection(): Promise<void> {
    const selectItem = await this.pickupViewPanel.getSelectedData();
    await this.handlePushSimpleListItems(selectItem);
  }

  /**
   * @description 处理添加简单列表数据
   * @protected
   * @param {IData[]} data
   * @memberof MPickupViewEngine
   */
  protected async handlePushSimpleListItems(data: IData[]): Promise<void> {
    let selectItems: IData[] = [];
    if (this.checkStrictly) {
      // 每次添加的都是多数据部件当前页数据，因此需先将原来简单列表的当前页数据过滤掉
      const items = await this.pickupViewPanel.getAllData();
      // 过滤出非当前页数据
      selectItems = this.simpleList
        .getAllData()
        .filter(
          selected => !items.some(item => item.srfkey === selected.srfkey),
        );
      // 将多数据部件当前页数据加入简单列表选中
      selectItems.push(...data);
    } else {
      const allData = this.simpleList.getAllData();
      selectItems = [...allData, ...data];
    }
    // 去重items
    const uniqueItems = this.handleUniqueItems(selectItems);
    this.setSelectedData(uniqueItems);
  }

  /**
   * 去重数组
   *
   * @author zk
   * @date 2023-05-26 03:05:08
   * @param {IData[]} arr
   * @return {*}
   * @memberof MPickupViewEngine
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
   * @memberof MPickupViewEngine
   */
  async addAll(): Promise<void> {
    const allItems = await this.pickupViewPanel.getAllData();
    await this.handlePushSimpleListItems(allItems);
  }

  /**
   * 删除所有
   *
   * @author zk
   * @date 2023-05-25 05:05:14
   * @memberof MPickupViewEngine
   */
  removeAll(): void {
    this.setSelectedData([]);
  }

  /**
   * 删除选中
   *
   * @author zk
   * @date 2023-05-25 05:05:16
   * @memberof MPickupViewEngine
   */
  protected removeSelection(): void {
    const selectData = this.simpleList.getData();
    const items = this.simpleList.getAllData();
    selectData.forEach((_item: IData) => {
      const index = items.findIndex(
        (item: IData) => _item.srfkey === item.srfkey,
      );
      if (index !== -1) items.splice(index, 1);
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
    // 严格检查模式时需同步穿梭框左右的选中数据
    if (this.checkStrictly) super.setSelectedData(items);
    this.simpleList.setData(items);
  }

  /**
   * 提交
   *
   * @author zk
   * @date 2023-05-25 06:05:42
   * @memberof MPickupViewEngine
   */
  confirm(): void {
    const items = this.simpleList.getAllData();
    this.view.closeView({ ok: true, data: items });
  }
}
