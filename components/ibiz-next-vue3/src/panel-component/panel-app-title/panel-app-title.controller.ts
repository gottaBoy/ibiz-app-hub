import {
  PanelItemController,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';
import { IPanelRawItem, IAppIndexView } from '@ibiz/model-core';
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
   * @description 分隔符，将标题以`\|`符分割，分隔符前面为caption，后面为caption2
   * @exposedoc
   * @return {*}
   * @memberof PanelAppTitleController
   */
  private captionSplit: string = '|';

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
    if (this.panel.view.model.viewType !== 'APPINDEXVIEW') {
      const viewModel = this.panel.view.model;
      const app = ibiz.hub.getApp(viewModel.appId);
      if (app) {
        this.state.caption = ibiz.env.AppTitle || app.model.caption || '';
      }
      return;
    }
    const indexViewModel: IAppIndexView = this.panel.view.model;
    // 抬头
    if (indexViewModel.title && !document.title) {
      document.title = indexViewModel.title;
    }
    if (this.model.sysImage && this.model.sysImage.rawContent) {
      this.state.icon = this.model.sysImage.rawContent;
    } else if (indexViewModel.appIconPath) {
      // 图标路径
      this.state.icon = indexViewModel.appIconPath;
    }

    // 图标路径2(收缩时)
    if (indexViewModel.sysImage && indexViewModel.sysImage.rawContent) {
      this.state.icon2 = indexViewModel.sysImage.rawContent;
    } else if (indexViewModel.appIconPath2) {
      this.state.icon2 = indexViewModel.appIconPath2;
    }

    // 标题
    if (indexViewModel.caption) {
      this.state.caption = indexViewModel.caption.split(this.captionSplit)[0];
      this.state.caption2 =
        indexViewModel.caption.split(this.captionSplit)[1] ||
        indexViewModel.caption.split(this.captionSplit)[0];
    }

    // 子标题
    if (indexViewModel.subCaption) {
      this.state.subCaption = indexViewModel.subCaption.split(
        this.captionSplit,
      )[0];
      this.state.subCaption2 =
        indexViewModel.subCaption.split(this.captionSplit)[1] ||
        indexViewModel.subCaption.split(this.captionSplit)[0];
    }

    // 是否为 svg 图标
    if (this.state.icon.endsWith('.svg') || this.state.icon2.endsWith('.svg')) {
      this.state.isSvg = true;
    }

    // 只有主应用才处理环境参数
    const defaultApp = ibiz.hub.getApp();
    if (defaultApp.model.appId === indexViewModel.appId) {
      // 环境变量中的系统标题权重最大
      if (ibiz.env.AppTitle) this.state.caption = ibiz.env.AppTitle;
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
