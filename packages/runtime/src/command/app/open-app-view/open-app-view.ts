import { ModelError, RuntimeError } from '@ibiz-template/core';
import { IAppRedirectView } from '@ibiz/model-core';
import { clone } from 'ramda';
import { IModalData, IOpenViewOptions, IViewConfig } from '../../../interface';
import { calcDeCodeNameById } from '../../../model';
import { openRedirectView, stringifyObj } from '../../../utils';
import { Srfuf } from '../../../service';

/**
 * 打开应用视图
 *
 * @author chitanda
 * @date 2022-07-25 18:07:20
 * @export
 * @class OpenAppViewCommand
 */
export class OpenAppViewCommand {
  static readonly TAG = 'ibiz.app-view.open';

  constructor() {
    ibiz.commands.register(OpenAppViewCommand.TAG, this.exec.bind(this));
  }

  /**
   * xhr模式打开
   *
   * @author chitanda
   * @date 2022-08-25 23:08:08
   * @param {string} appViewId
   * @param {IContext} [context]
   * @param {IParams} [params={}]
   * @param {IData} [_opts={}]
   * @return {*}  {(Promise<IModalData | void>)}
   */
  async exec(
    appViewId: string,
    _context: IContext,
    params: IParams = {},
    opts: IOpenViewOptions = {},
  ): Promise<IModalData | void> {
    const context = clone(_context);
    if (context.srfsimple) {
      delete context.srfsimple;
    }
    const appView = await ibiz.hub.config.view.get(appViewId!);
    if (!appView) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.command.app.noFindApplicationView', {
          appViewId,
        }),
      );
    }

    if (
      (context.srfkey || params.srfuf === Srfuf.CREATE) &&
      appView.appDataEntityId
    ) {
      const deName = calcDeCodeNameById(appView.appDataEntityId);
      // 识别上下文的srfkey并转成对应视图实体名称，然后置空srfkey
      if (context.srfkey) {
        context[deName] = context.srfkey;
        context.srfkey = undefined;
      }
      // 识别参数的 srfuf=0 时为新建。置空和当前要打开视图同实体的主键，避免同上下文导致后一个页面识别为了编辑。然后置空srfuf
      if (params.srfuf === Srfuf.CREATE) {
        context[deName] = undefined;
        delete params.srfuf;
      }
    }

    if (appView.redirectView) {
      const fullViewModel = await ibiz.hub.getAppView(appViewId);
      return openRedirectView(
        fullViewModel as IAppRedirectView,
        context,
        params,
        opts,
      );
    }
    const { openMode = 'INDEXVIEWTAB' } = appView;
    const viewOpenMode = opts.openMode || openMode;
    if (viewOpenMode !== undefined && viewOpenMode !== 'INDEXVIEWTAB') {
      // 除了走路由的，其他情况toRouteDepth转为undefined，避免影响后续操作
      if (context.toRouteDepth) {
        context.toRouteDepth = undefined;
      }
    }
    switch (viewOpenMode) {
      case 'INDEXVIEWTAB':
      case 'INDEXVIEWTAB_POPUP':
        if (opts.noWaitRoute) {
          this.openIndexViewTab(appView, context, params, opts);
          return { ok: true };
        }
        return this.openIndexViewTab(appView, context, params, opts);
      case 'INDEXVIEWTAB_POPUPMODAL':
        return this.openIndexViewTabByModal(appView, context, params);
      case 'POPUP':
        throw new ModelError(
          appView,
          ibiz.i18n.t('runtime.command.app.unsupportedPopup'),
        );
      case 'POPUPMODAL':
        return this.openModal(appView, context, params, opts);
      case 'POPUPAPP':
        return this.openPopupApp(appView, context, params);
      case 'POPOVER':
        return this.openPopover(appView, context, params, opts);
      case 'DRAWER_LEFT':
      case 'DRAWER_RIGHT':
      case 'DRAWER_TOP':
      case 'DRAWER_BOTTOM':
        return this.openDrawer(appView, context, params, opts);
      case 'USER':
        return this.openUserCustom(appView, context, params);
      default:
        return this.openIndexViewTab(appView, context, params, opts);
    }
  }

  /**
   * 首页导航模式打开
   *
   * @author chitanda
   * @date 2022-07-25 20:07:43
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} [context]
   * @param {IParams} [params={}]
   */
  protected openIndexViewTab(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
    modalOptions: IData = {},
  ): Promise<IModalData> {
    const { modalOption } = modalOptions;
    return ibiz.openView.root(appView.id, context, params, { ...modalOption });
  }

  /**
   * 模态路由打开视图，路由拼接于当前视图路由后。再由特殊解析呈现
   *
   * @author chitanda
   * @date 2024-01-23 11:01:07
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @return {*}  {Promise<IModalData>}
   */
  protected openIndexViewTabByModal(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
  ): Promise<IModalData> {
    return ibiz.openView.rootByModal(appView.id, context, params);
  }

  /**
   * 模态窗口打开
   *
   * @author tony001
   * @date 2025-03-24 17:03:01
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IOpenViewOptions} [opts={}]
   * @return {*}  {Promise<IModalData>}
   */
  protected async openModal(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
    opts: IOpenViewOptions = {},
  ): Promise<IModalData> {
    const { modalOption } = opts;
    if (opts.parentData) {
      params.parentData = stringifyObj(opts.parentData);
    }
    return ibiz.openView.modal(appView.id, context, params, {
      ...modalOption,
      ctx: opts.ctx,
    });
  }

  /**
   * 气泡模式打开
   *
   * @author tony001
   * @date 2025-03-24 17:03:14
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IOpenViewOptions} [opts={}]
   * @return {*}  {Promise<IModalData>}
   */
  protected async openPopover(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
    opts: IOpenViewOptions = {},
  ): Promise<IModalData> {
    const { event, modalOption } = opts;
    if (!event) {
      throw new RuntimeError(ibiz.i18n.t('runtime.command.app.missingEvent'));
    }
    if (opts.parentData) {
      params.parentData = stringifyObj(opts.parentData);
    }
    return ibiz.openView.popover(appView.id, event, context, params, {
      ...modalOption,
      ctx: opts.ctx,
    });
  }

  /**
   * 抽屉模式打开
   *
   * @author tony001
   * @date 2025-03-24 17:03:25
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IOpenViewOptions} [opts={}]
   * @return {*}  {Promise<IModalData>}
   */
  protected async openDrawer(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
    opts: IOpenViewOptions = {},
  ): Promise<IModalData> {
    const { modalOption } = opts;
    if (opts.parentData) {
      params.parentData = stringifyObj(opts.parentData);
    }
    return ibiz.openView.drawer(appView.id, context, params, {
      ...modalOption,
      ctx: opts.ctx,
    });
  }

  /**
   * 用户自定义
   *
   * @author chitanda
   * @date 2022-07-25 20:07:41
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} [context]
   * @param {IParams} [params={}]
   * @return {*}  {Promise<void>}
   */
  protected async openUserCustom(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
  ): Promise<IModalData> {
    return ibiz.openView.custom(appView.id, context, params);
  }

  /**
   * 独立程序弹出
   *
   * @author zzq
   * @date 2024-07-19 20:07:55
   * @protected
   * @param {IViewConfig} appView
   * @param {IContext} [context]
   * @param {IParams} [params={}]
   * @return {*}  {Promise<void>}
   */
  protected async openPopupApp(
    appView: IViewConfig,
    context: IContext,
    params: IParams = {},
  ): Promise<void> {
    return ibiz.openView.popupApp(appView.id, context, params);
  }
}
