import {
  IViewController,
  ViewEngineBase,
  IIndexViewState,
  IViewEvent,
  IAppMenuController,
  ViewCallTag,
  OpenAppViewCommand,
  IApiIndexViewCall,
} from '@ibiz-template/runtime';
import { IAppIndexView } from '@ibiz/model-core';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';

export class IndexViewEngine extends ViewEngineBase {
  declare protected view: IViewController<
    IAppIndexView,
    IIndexViewState,
    IViewEvent
  >;

  get appmenu(): IAppMenuController {
    return this.view.getController('appmenu') as IAppMenuController;
  }

  /**
   * 启用折叠
   * @author lxm
   * @date 2023-10-18 12:09:36
   * @readonly
   * @type {boolean}
   */
  get enableCollapse(): boolean {
    return (
      this.view.model.mainMenuAlign === 'LEFT' ||
      this.view.model.mainMenuAlign === undefined
    );
  }

  /**
   * @description 路由对象
   * @type {RouteLocationNormalizedLoaded}
   * @memberof IndexViewEngine
   */
  route: RouteLocationNormalizedLoaded = useRoute();

  initViewState(): void {
    super.initViewState();
    this.view.state.isCollapse = false;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    this.view.childNames.push('appmenu');

    if (!this.view.slotProps.appmenu) {
      this.view.slotProps.appmenu = {};
    }
    this.view.slotProps.appmenu.collapse = this.view.state.isCollapse;
    ibiz.util.hiddenAppLoading();
  }

  async onMounted(): Promise<void> {
    await super.onMounted();

    // 判断是否存在首页菜单模型, 存在二级路由时不调整
    if (!this.isExistAndInLayout('appmenu') && !this.route.params.view2) {
      // 没有则跳转默认视图
      const { model, context, params } = this.view;
      const { defAppViewId } = model;
      if (defAppViewId) {
        // 打开视图
        ibiz.commands.execute(
          OpenAppViewCommand.TAG,
          defAppViewId,
          context,
          params,
        );
      }
    }

    // 屏幕宽度小于1200时折叠
    if (window.innerWidth <= 1200 || ibiz.config.appMenu.defaultCollapse) {
      this.toggleCollapse();
    }
  }

  async call(
    key: keyof IApiIndexViewCall,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    _args: any,
  ): Promise<IData | null | undefined> {
    if (key === ViewCallTag.TOGGLE_COLLAPSE) {
      this.toggleCollapse();
      return null;
    }
  }

  /**
   * 切换首页视图的折叠
   * @author lxm
   * @date 2023-10-17 05:31:37
   * @protected
   */
  protected toggleCollapse(): void {
    // 非左侧菜单模式折叠功能不生效
    if (!this.enableCollapse) {
      ibiz.log.error('非左侧菜单模式折叠功能不启用');
      return;
    }

    // 修改视图和给应用菜单的控制变量
    this.view.state.isCollapse = !this.view.state.isCollapse;
    this.view.slotProps.appmenu.collapse = this.view.state.isCollapse;

    // 修改首页左侧容器宽度
    const leftContainer =
      this.view.layoutPanel?.panelItems.container_scroll_left;
    if (leftContainer) {
      if (this.view.state.isCollapse) {
        leftContainer.state.layout.width = '56px';
      } else {
        leftContainer.state.layout.width = `${leftContainer.model.width}px`;
      }
    }
  }

  protected calcViewHeaderVisible(): boolean {
    return true;
  }
}
