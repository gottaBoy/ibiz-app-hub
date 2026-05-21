import { RuntimeError } from '@ibiz-template/core';
import { PresetIdentifier, SysUIActionTag, ViewCallTag } from '../constant';
import { IUILogicParams, IUIActionResult } from '../interface';
import { getUIActionById } from '../model';
import { getUIActionProvider } from '../register';
import { execUILogic } from '../ui-logic';

/**
 * @description 界面行为工具类
 * @export
 * @class UIActionUtil
 * @implements {IApiUiActionUtil}
 */
export class UIActionUtil {
  /**
   * @description 执行界面行为
   * @static
   * @param {string} actionId
   * @param {IUILogicParams} params
   * @param {string} appId
   * @returns {*}  {Promise<IUIActionResult>}
   * @memberof UIActionUtil
   */
  static async exec(
    actionId: string,
    params: IUILogicParams,
    appId: string,
  ): Promise<IUIActionResult> {
    const action = await getUIActionById(actionId, appId);
    if (!action) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.uiAction.noFoundBehaviorModel', { actionId }),
      );
    }
    // 单项数据的界面行为执行前校验表单的数据，不通过则拦截
    if (action.actionTarget === 'SINGLEDATA') {
      const validateResult = await params.view.call(ViewCallTag.VALIDATE);
      if (validateResult === false) {
        return { cancel: true };
      }
    }
    const provider = await getUIActionProvider(action);
    return provider.exec(action, params);
  }

  /**
   * 执行界面逻辑
   * @param appDEUILogicId
   * @param appDataEntityId
   * @param args
   * @returns
   */
  static async execUILogic(
    appDEUILogicId: string,
    appDataEntityId: string,
    args: IUILogicParams,
  ): Promise<unknown> {
    const result = await execUILogic(appDEUILogicId, appDataEntityId, {
      ...args,
    });
    return result;
  }

  /**
   * @description 执行界面行为并处理返回值
   * @static
   * @param {string} actionId
   * @param {IUILogicParams} params
   * @param {string} appId
   * @returns {*}  {Promise<void>}
   * @memberof UIActionUtil
   */
  static async execAndResolved(
    actionId: string,
    params: IUILogicParams,
    appId: string,
  ): Promise<void> {
    const result = await this.exec(actionId, params, appId);
    // 先处理刷新引用视图，再处理关闭，避免关闭时刷新无效
    if (result.refresh) {
      switch (result.refreshMode) {
        case 1:
          await params.view.callUIAction(SysUIActionTag.REFRESH);
          break;
        case 2:
          await params.view.parentView?.callUIAction(SysUIActionTag.REFRESH);
          break;
        case 3:
          await params.view.getTopView()?.callUIAction(SysUIActionTag.REFRESH);
          break;
        default:
      }
    }
    if (result.closeView) {
      // 编辑器失焦后，调整数据后直接点击关闭按钮导致无法触发自动保存通过modal中preDismiss钩子执行，shouldDismiss钩子仅负责计算是否可关闭视图参数，不能混为一谈
      params.view.modal.ignoreDismissCheck = true;
      params.view.closeView({ ok: true });
    }
    const action = await getUIActionById(actionId, appId);
    // 异步行为模型配置方式:
    // 界面行为模型基于选择的实体行为的返回值类型计算异步行为（asyncAction）模型
    // 1、配置实体行为 返回值类型选择为 异步操作对象
    // 2、配置界面行为 界面行为类型选择 后台调用 、配置实体行为
    // 3、界面行为有配置界面行为参数srfasyncaction=true
    if (
      (action!.asyncAction && !result.cancel) ||
      action!.uiactionParamJO?.srfasyncaction
    ) {
      this.handleAsyncAction(params.event);
    }
  }

  /**
   * @description 处理异步行为
   * @private
   * @static
   * @param {(Event | undefined)} event
   * @returns {*}  {Promise<void>}
   * @memberof UIActionUtil
   */
  private static async handleAsyncAction(
    event: Event | undefined,
  ): Promise<void> {
    this.handleAsyncActionAnime(event);
  }

  /**
   * @description 处理异步行为动画
   * @private
   * @static
   * @param {(Event | undefined)} event
   * @returns {*}  {Promise<void>}
   * @memberof UIActionUtil
   */
  private static async handleAsyncActionAnime(
    event: Event | undefined,
  ): Promise<void> {
    if (!event || !event.target) {
      return;
    }
    await ibiz.util.anime.moveAndResize(
      event.target as HTMLElement,
      `#${PresetIdentifier.MESSAGE}`,
    );
  }
}
