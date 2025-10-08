import {
  PanelItemController,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';
import { PanelAppTitleState } from './panel-app-title.state';

/**
 * 面板应用标题控制器
 *
 * @export
 * @class PanelAppTitleController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class PanelAppTitleController extends PanelItemController<IPanelRawItem> {
  declare state: PanelAppTitleState;

  protected createState(): PanelAppTitleState {
    return new PanelAppTitleState(this.parent?.state);
  }

  /**
   * @description 面板控制器
   * @exposedoc
   * @type {ViewLayoutPanelController}
   * @memberof PanelAppTitleController
   */
  declare panel: ViewLayoutPanelController;

  /**
   * @description 自定义补充参数
   * @exposedoc
   * @type {IData}
   * @memberof PanelAppTitleController
   */
  rawItemParams: IData = {};

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof PanelAppTitleController
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    const viewModel = this.panel.view.model;
    const app = ibiz.hub.getApp(viewModel.appId);
    this.state.caption = ibiz.env.AppTitle || app.model.caption || '';

    // 抬头
    if (viewModel.title && !document.title) {
      document.title = viewModel.title;
    }

    // 应用图标
    if (this.model.sysImage && this.model.sysImage.rawContent) {
      this.state.icon = this.model.sysImage.rawContent;
    }

    // 是否为 svg 图标
    if (this.state.icon.endsWith('.svg') || this.state.icon2.endsWith('.svg')) {
      this.state.isSvg = true;
    }
  }

  /**
   * 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   *
   * @author zk
   * @date 2023-09-27 03:09:55
   * @protected
   * @memberof NavPosController
   */
  protected handleRawItemParams(): void {
    const rawItemParams = this.model.rawItem?.rawItemParams;
    if (Array.isArray(rawItemParams)) {
      rawItemParams.forEach(item => {
        const key = item.key;
        const value = item.value;
        if (key && value) {
          this.rawItemParams[key.toLowerCase()] = value;
        }
      });
    }
  }
}
