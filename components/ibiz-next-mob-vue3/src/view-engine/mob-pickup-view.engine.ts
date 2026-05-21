import {
  ViewController,
  IPickupViewPanelController,
  SysUIActionTag,
  IPickupViewState,
  IPickupViewEvent,
  ViewEngineBase,
  IApiMobPickupViewCall,
} from '@ibiz-template/runtime';
import { IAppDEMobPickupView } from '@ibiz/model-core';

export class MobPickupViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEMobPickupView, IPickupViewState, IPickupViewEvent>}
   * @memberof MobPickupViewEngine
   */
  declare protected view: ViewController<
    IAppDEMobPickupView,
    IPickupViewState,
    IPickupViewEvent
  >;

  /**
   * 选中数据
   *
   * @type {IData[]}
   * @memberof MobPickupViewEngine
   */
  selectedData: IData[] = [];

  /**
   * 选择视图面板
   *
   * @readonly
   * @memberof MobPickupViewEngine
   */
  get pickupViewPanel(): IPickupViewPanelController {
    return this.view.getController(
      'pickupviewpanel',
    ) as IPickupViewPanelController;
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof MobPickupViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('pickupviewpanel');
    if (!this.view.slotProps.pickupviewpanel) {
      this.view.slotProps.pickupviewpanel = {};
    }
    this.view.slotProps.pickupviewpanel.singleSelect = true;
    if (this.view.params.selecteddata) {
      this.selectedData = JSON.parse(this.view.params.selecteddata);
      delete this.view.params.selecteddata;
    }
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof MobPickupViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.pickupViewPanel.evt.on('onSelectionChange', event => {
      this.selectedData = event.data;
    });
    this.pickupViewPanel.evt.on('onDataActive', event => {
      this.pickupViewPanelDataActive(event.data);
    });
    this.setSelectedData(this.selectedData);
  }

  /**
   * @description 设置选中数据
   * @protected
   * @param {IData[]} items
   * @memberof PickupViewEngine
   */
  protected setSelectedData(items: IData[]): void {
    this.selectedData = items;
    this.pickupViewPanel.setSelectedData(items);
  }

  /**
   *  选则面板激活数据
   *
   * @author zk
   * @date 2023-05-26 05:05:13
   * @param {*} data
   * @memberof MobPickupViewEngine
   */
  public pickupViewPanelDataActive(data: IData[]): void {
    this.selectedData = data;
    this.view.closeView({ ok: true, data: this.selectedData });
  }

  async call(
    key: keyof IApiMobPickupViewCall,
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
    return super.call(key, args);
  }

  /**
   * 确认
   *
   * @memberof MobPickupViewEngine
   */
  confirm(): void {
    this.view.closeView({ ok: true, data: this.selectedData });
  }

  /**
   * 取消
   *
   * @memberof MobPickupViewEngine
   */
  cancel(): void {
    this.view.closeView({ ok: false, data: [] });
  }

  /**
   * 计算底部的显示与否
   * @author lxm
   * @date 2023-06-20 02:45:17
   * @protected
   * @return {*}  {boolean}
   */
  protected calcViewFooterVisible(): boolean {
    return true;
  }
}
