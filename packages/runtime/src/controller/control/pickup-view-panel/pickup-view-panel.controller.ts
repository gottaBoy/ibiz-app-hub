import { IAppDEGridView, IDEPickupViewPanel } from '@ibiz/model-core';
import { ViewCallTag } from '../../../constant';
import {
  IViewController,
  IPickupGridViewState,
  IPickupGridViewEvent,
  IPickupViewPanelState,
  IPickupViewPanelEvent,
  IPickupViewPanelController,
} from '../../../interface';
import { convertNavData } from '../../../utils';
import { ControlController } from '../../common';

/**
 * 选择面板控制器
 *
 * @export
 * @class PickupViewPanelController
 * @extends {ControlController<IDEPickupViewPanel, IPickupViewPanelState, IPickupViewPanelEvent>}
 * @implements {IPickupViewPanelController}
 */
export class PickupViewPanelController
  extends ControlController<
    IDEPickupViewPanel,
    IPickupViewPanelState,
    IPickupViewPanelEvent
  >
  implements IPickupViewPanelController
{
  /**
   * 嵌入视图控制器
   *
   * @type {IViewController}
   * @memberof PickupViewPanelController
   */
  embedView!: IViewController<
    IAppDEGridView,
    IPickupGridViewState,
    IPickupGridViewEvent
  >;

  /**
   * 生命周期-创建完成
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PickupViewPanelController
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    // 等待嵌入视图mounted完成，选择视图面板才mounted
    this.mountCounter.enroll(this.model.embeddedAppDEViewId!);
  }

  updateContextParams(opts: {
    context?: IContext | undefined;
    params?: IParams | undefined;
  }): void {
    super.updateContextParams(opts);
    this.initNavParam();
  }

  /**
   * 初始化导航参数
   *
   * @memberof PickupViewPanelController
   */
  initNavParam(): void {
    const { navigateContexts, navigateParams } = this.model;
    const context = this.context.clone();
    const params = { ...this.params };
    if (navigateContexts) {
      Object.assign(
        context,
        convertNavData(navigateContexts, this.params, this.context),
      );
    }
    if (navigateParams) {
      Object.assign(
        params,
        convertNavData(navigateParams, this.params, this.context),
      );
    }
    this.state.context = context;
    this.state.params = params;
  }

  /**
   * 设置嵌入视图
   *
   * @param {IViewController} view
   * @memberof PickupViewPanelController
   */
  setEmbedView(
    view: IViewController<
      IAppDEGridView,
      IPickupGridViewState,
      IPickupGridViewEvent
    >,
  ): void {
    this.embedView = view;

    // 视图面板的mounted等待嵌入视图的mounted之后
    if (this.embedView.state.isMounted) {
      this.mountCounter.attend(this.model.embeddedAppDEViewId!);
    } else {
      this.embedView.evt.on('onMounted', () => {
        this.mountCounter.attend(this.model.embeddedAppDEViewId!);
      });
    }
    this.embedView.evt.on('onSelectionChange', event => {
      this.evt.emit('onSelectionChange', event);
    });
    this.embedView.evt.on('onDataActive', event => {
      this.evt.emit('onDataActive', {
        data: event.data,
      });
    });
  }

  /**
   * 获取选中数据
   *
   * @author zk
   * @date 2023-05-26 03:05:53
   * @return {*}  {Promise<IData[]>}
   * @memberof PickupViewPanelController
   */
  async getSelectedData(): Promise<IData[]> {
    const items: IData[] = await this.embedView.call(ViewCallTag.GET_DATA);
    return items;
  }

  /**
   * @description 设置选中数据
   * @param {IData[]} items
   * @returns {*}  {Promise<void>}
   * @memberof PickupViewPanelController
   */
  async setSelectedData(items: IData[]): Promise<void> {
    await this.embedView.call(ViewCallTag.SET_SELECTED_DATA, { data: items });
  }

  /**
   * 获取全部数据
   *
   * @author zk
   * @date 2023-05-26 03:05:49
   * @return {*}  {Promise<IData[]>}
   * @memberof PickupViewPanelController
   */
  async getAllData(): Promise<IData[]> {
    const items: IData[] = await this.embedView.call(ViewCallTag.GET_ALL_DATA);
    return items;
  }
}
