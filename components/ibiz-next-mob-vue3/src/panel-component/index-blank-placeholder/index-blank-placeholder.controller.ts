import { AppMenuController, PanelItemController } from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { IndexBlankPlaceholderState } from './index-blank-placeholder.state';
import { NavPosIndexController } from '../nav-pos-index';

/**
 * 首页空白占位控制器
 *
 * @export
 * @class IndexBlankPlaceholderController
 * @extends {PanelItemController<IPanelContainer>}
 */
export class IndexBlankPlaceholderController extends PanelItemController<IPanelContainer> {
  declare state: IndexBlankPlaceholderState;

  protected createState(): IndexBlankPlaceholderState {
    return new IndexBlankPlaceholderState(this.parent?.state);
  }

  /**
   * @description 当前视图路由层级
   * @exposedoc
   * @readonly
   * @type {(number | undefined)}
   * @memberof IndexBlankPlaceholderController
   */
  get routeDepth(): number | undefined {
    return this.panel.view.modal.routeDepth;
  }

  /**
   * @description 应用菜单
   * @exposedoc
   * @readonly
   * @type {(AppMenuController | undefined)}
   * @memberof IndexBlankPlaceholderController
   */
  get appmenu(): AppMenuController | undefined {
    return this.panel.getController('appmenu') as AppMenuController;
  }

  /**
   * @description 首页导航栏
   * @exposedoc
   * @readonly
   * @type {(NavPosIndexController | undefined)}
   * @memberof IndexBlankPlaceholderController
   */
  get navPos(): NavPosIndexController | undefined {
    return this.panel.panelItems.nav_pos_index as NavPosIndexController;
  }

  /**
   * 初始化
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof IndexBlankPlaceholderController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.state.keepAlive = true;
    // 默认不显示防止闪烁
    this.state.visible = false;
    // 如果应用菜单有默认打开的路由视图则默认不显示
    this.panel.evt.on('onMounted', async () => {
      if (this.navPos) this.navPos.state.keepAlive = true;
      const appViewId = this.appmenu?.getDefaultOpenView();
      if (appViewId) {
        const appView = await ibiz.hub.config.view.get(appViewId!);
        const { openMode = 'INDEXVIEWTAB' } = appView;
        this.state.visible = !openMode.startsWith('INDEXVIEWTAB');
      }
    });
  }

  /**
   * @description 设置显示状态
   * @exposedoc
   * @param {boolean} state
   * @memberof IndexBlankPlaceholderController
   */
  setVisible(state: boolean): void {
    this.state.visible = state;
    if (this.navPos) this.navPos.state.visible = !state;
  }
}
