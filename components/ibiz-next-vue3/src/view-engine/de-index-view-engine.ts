import {
  ViewController,
  IDEIndexViewState,
  IDEIndexViewEvent,
  IDRBarController,
  EventBase,
} from '@ibiz-template/runtime';
import { IAppDEIndexView } from '@ibiz/model-core';
import { EditViewEngine } from './edit-view.engine';

export class DEIndexViewEngine extends EditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppView, IAppDEIndexViewState, IAppDEIndexViewEvent>}
   * @memberof DEIndexViewEngine
   */
  declare protected view: ViewController<
    IAppDEIndexView,
    IDEIndexViewState,
    IDEIndexViewEvent
  >;

  /**
   * 数据关系栏
   *
   * @author lxm
   * @date 2023-12-11 11:41:07
   * @readonly
   * @type {IDRBarController}
   */
  get drbar(): IDRBarController {
    return this.view.getController('drbar') as IDRBarController;
  }

  /**
   * 当前路由视图的层级
   *
   * @author zk
   * @date 2023-07-11 10:07:20
   * @readonly
   * @type {(number | undefined)}
   * @memberof ExpBarControlController
   */
  get routeDepth(): number | undefined {
    return this.view.modal.routeDepth;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('drbar');
    if (!this.view.slotProps.drbar) {
      this.view.slotProps.drbar = {};
    }
    this.view.slotProps.drbar.showMode = 'horizontal';
    this.view.slotProps.drbar.srfnav = this.view.state.srfnav;
    this.view.slotProps.drbar.hideEditItem = true;
  }

  /**
   * @description 监控form事件
   * @param {EventBase} event
   * @memberof DEIndexViewEngine
   */
  formDataStateChange(event: EventBase): void {
    const { evt } = this.view;
    const formDeId = this.form.model.appDataEntityId;
    const data = event.data[0];
    this.toolbar?.calcButtonState(data, formDeId, event);
    // 实体首页视图显示信息栏模型缺失，默认显示
    if (data.srfkey) {
      evt.emit('onViewInfoChange', { dataInfo: data.srfmajortext || '' });
    }
  }
}
