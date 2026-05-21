/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  IViewEvent,
  IViewState,
  ViewEngineBase,
  SysUIActionTag,
  IViewController,
  getControlsByView,
  IToolbarController,
  IMDControlController,
  IApiCustomViewCall,
} from '@ibiz-template/runtime';
import {
  IControl,
  IDEToolbar,
  IMDControl,
  IAppDECustomView,
} from '@ibiz/model-core';

export class CustomViewEngine extends ViewEngineBase {
  declare protected view: IViewController<
    IAppDECustomView,
    IViewState,
    IViewEvent
  >;

  /**
   * 部件集合
   *
   * @type {IControl[]}
   * @memberof CustomViewEngine
   */
  controls: IControl[] = [];

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof CustomViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    this.controls = getControlsByView(this.view.model);
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof CustomViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.calcToolbarState = this.calcToolbarState.bind(this);
    this.controls.forEach(ctrl => {
      const control = this.view.getController(
        ctrl.name!,
      ) as IMDControlController;
      control?.evt.on('onLoadSuccess', evt =>
        this.calcToolbarButtonState(ctrl, undefined, evt),
      );
      control?.evt.on('onSelectionChange', evt =>
        this.calcToolbarButtonState(ctrl, evt.data[0], evt),
      );
      control?.evt.on('onRefreshSuccess', evt =>
        this.calcToolbarButtonState(ctrl, evt.data[0], evt),
      );
    });
  }

  /**
   * 计算工具栏按钮状态
   *
   * @param {IMDControl} control 数据部件模型
   * @param {(IData | undefined)} data 数据
   * @memberof CustomViewEngine
   */
  calcToolbarButtonState(
    control: IMDControl,
    data: IData | undefined,
    _params?: IParams,
  ): void {
    const model = this.controls.find(
      ctrl =>
        ctrl.controlType === 'TOOLBAR' &&
        (ctrl as IDEToolbar).xdataControlName?.toLowerCase() === control.name,
    );
    if (model) {
      const toolbar = this.view.getController(
        model.name!,
      ) as IToolbarController;
      toolbar?.calcButtonState(data, control.appDataEntityId, _params);
    }
  }

  async call(
    key: keyof IApiCustomViewCall,
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      await this.viewLayoutPanel?.load();
      return null;
    }
    return super.call(key, args);
  }
}
