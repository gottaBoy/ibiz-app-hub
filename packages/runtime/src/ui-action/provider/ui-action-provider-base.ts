/* eslint-disable no-prototype-builtins */
import { RuntimeModelError } from '@ibiz-template/core';
import { IAppDEUIAction, ILanguageRes, INavigateParam } from '@ibiz/model-core';
import {
  IUIActionProvider,
  IUIActionResult,
  IUILogicParams,
  IViewController,
} from '../../interface';
import { calcDeCodeNameById } from '../../model';
import { execUILogic } from '../../ui-logic';
import { convertNavData, formatMultiData, ScriptFactory } from '../../utils';
import { UIActionUtil } from '../uiaction-util';

/**
 * 界面行为处理器基类
 *
 * @author lxm
 * @date 2022-10-25 14:10:31
 * @export
 * @class UIActionProviderBase
 */
export abstract class UIActionProviderBase implements IUIActionProvider {
  /**
   * 界面行为执行入口，处理公共逻辑，子类一般不要重写
   * @author lxm
   * @date 2023-05-08 10:02:10
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} params
   * @return {*}  {Promise<IUIActionResult>}
   */
  async exec(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const result: IUIActionResult = {
      refresh: action.reloadData,
      refreshMode: action.refreshMode,
      closeView: action.closeEditView,
    };

    const { context, params, data, view } = args;
    if (action.closeEditView) {
      view.state.isClosing = true;
    }

    // ** 界面逻辑替换执行界面行为
    const { appDEUILogicId, appDataEntityId, uilogicAttachMode } = action;
    if (uilogicAttachMode === 'REPLACE') {
      if (!appDEUILogicId) {
        throw new RuntimeModelError(
          action,
          ibiz.i18n.t('runtime.logicScheduler.executor.noConfiguredLogic'),
        );
      }
      const { resultContext, resultParams } = await this.handleParams(
        action,
        context,
        data,
        params,
      );
      const res = await execUILogic(appDEUILogicId, appDataEntityId!, {
        ...args,
        context: resultContext,
        params: { ...params, ...resultParams },
      });
      if (res) result.data = Array.isArray(res) ? res : [res];
      return result;
    }

    // **用户操作确认**
    if (!(await this.isConfirm(action, args))) {
      result.cancel = true;
      return this.returnError(result, view);
    }

    // ** 执行不同类型的界面行为独有逻辑，并且合并result
    const _result = await this.execAction(action, args);

    // 预置属性相关处理
    const { presetParams } = await this.handleParams(
      action,
      context,
      data,
      params,
    );
    if (presetParams.ignoredirtycheck === 'true') {
      view.modal.ignoreDismissCheck = true;
    }

    Object.assign(result, _result);
    // 如果是取消操作则中断后续处理逻辑。
    if (result.cancel === true) {
      return this.returnError(result, view);
    }

    // ** 界面行为执行之后，执行界面逻辑
    if (action.uilogicAttachMode === 'AFTER') {
      if (!appDEUILogicId) {
        throw new RuntimeModelError(
          action,
          ibiz.i18n.t('runtime.logicScheduler.executor.noConfiguredLogic'),
        );
      }
      await execUILogic(
        appDEUILogicId,
        appDataEntityId!,
        this.mergeArgsByResult(args, result),
      );
    }

    // ** 后续界面行为
    const nextActionParams = this.mergeArgsByResult(args, result);
    if (action.closeEditView) {
      // 关闭视图的情况下，不等待后续界面行为
      this.doNextAction(action, nextActionParams, action.appId);
    } else {
      const nextResult = await this.doNextAction(
        action,
        nextActionParams,
        action.appId,
      );
      if (nextResult) {
        // 合并非空项
        Object.keys(nextResult).forEach(key => {
          if ((nextResult as IData)[key] !== undefined)
            (result as IData)[key] = (nextResult as IData)[key];
        });
        if (nextResult.cancel === true) {
          return this.returnError(result, view);
        }
      }
    }

    return result;
  }

  /**
   * 根据界面行为逻辑返回值，合并参数获得后续逻辑要用的参数
   * @author lxm
   * @date 2023-12-25 02:42:23
   * @protected
   * @param {IUILogicParams} args 当前环境的参数
   * @param {IUIActionResult} result 上一次逻辑执行的结果
   * @return {*}  {IUILogicParams}
   */
  protected mergeArgsByResult(
    args: IUILogicParams,
    result: IUIActionResult,
  ): IUILogicParams {
    return {
      ...args,
      context: result.nextContext || args.context,
      data: result.data || args.data,
      params: result.nextParams || args.params,
    };
  }

  /**
   * 有错误和取消时对result做的处理
   * @author lxm
   * @date 2023-03-15 07:43:21
   * @protected
   * @param {IUIActionResult} result
   * @returns {*}  {IUIActionResult}
   * @memberof UIActionHandler
   */
  protected returnError(
    result: IUIActionResult,
    view: IViewController,
  ): IUIActionResult {
    if (view) {
      view.state.isClosing = false;
    }
    return Object.assign(result, {
      refresh: false,
      closeView: false,
    });
  }

  /**
   * 用户操作确认
   *
   * @author lxm
   * @date 2022-10-25 14:10:55
   * @param {IAppDEUIAction} action 界面行为模型
   * @returns {*}  {Promise<boolean>}
   */
  async isConfirm(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<boolean> {
    const confirmMsg = this.calcMessage('confirm', action, args);
    if (action.enableConfirm && confirmMsg) {
      return ibiz.confirm.warning({
        title: ibiz.i18n.t('runtime.uiAction.operationConfirmation'),
        desc: confirmMsg,
      });
    }
    return true;
  }

  /**
   * 执行具体界面行为的独有逻辑(子类重写)
   *
   * @author lxm
   * @date 2022-10-25 15:10:03
   * @abstract
   * @param {IAppDEUIAction} action
   * @param {IContext} context
   * @param {(IData[])} data
   * @param {IParams} params
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<IUIActionResult>}
   */
  abstract execAction(
    action: IAppDEUIAction,
    params: IUILogicParams,
  ): Promise<IUIActionResult>;

  /**
   * 执行后续界面行为
   *
   * @author lxm
   * @date 2022-10-25 15:10:54
   * @param {IAppDEUIAction} action
   * @param {IContext} context
   * @param {(IData[])} data
   * @param {IParams} params
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<void>}
   */
  async doNextAction(
    action: IAppDEUIAction,
    params: IUILogicParams,
    appId: string,
  ): Promise<IUIActionResult | undefined> {
    const nextActionId = action.nextId;
    if (nextActionId) {
      return UIActionUtil.exec(nextActionId, params, appId);
    }
  }

  /**
   * 参数处理(根据数据目标和数据参数，导航参数)
   *
   * @author lxm
   * @date 2022-08-29 17:08:00
   * @protected
   * @static
   * @param {IAppDEUIAction} action 界面行为
   * @param {IContext} context 上下文
   * @param {(IData[])} data 数据集合
   * @param {IParams} params 视图参数
   * @returns {*}  {Promise<{
   *     resultContext: IContext; 处理后的上下文
   *     resultData: IData[]; 处理后的数据集合
   *     resultParams: IParams; 处理后的视图参数
   *   }>}
   */
  protected async handleParams(
    action: IAppDEUIAction,
    context: IContext,
    data: IData[],
    params: IParams,
  ): Promise<{
    resultContext: IContext;
    resultData: IData[];
    resultParams: IParams;
    presetParams: IParams;
  }> {
    let resultData: IData[] = [];

    // 准备实体名称
    const deName = action.appDataEntityId
      ? calcDeCodeNameById(action.appDataEntityId)
      : undefined;
    const entity = action.appDataEntityId
      ? await ibiz.hub.getAppDataEntity(action.appDataEntityId, action.appId)
      : undefined;
    const keyField = entity?.keyAppDEFieldId; // 主键属性名称

    // 根据数据目标处理数据集合
    switch (action.actionTarget) {
      // 数据目标为无数据时，清空数据
      case 'NONE':
        resultData = [];
        break;
      // 单项数据给单个数据
      case 'SINGLEDATA':
        resultData = [data[0]];
        break;
      // 多项数据传递数组
      case 'MULTIDATA':
        resultData = data;
        break;
      // 多项数据主键传递数组，数组内只有一个主键
      case 'MULTIKEY':
        resultData =
          deName && keyField && data.length > 0
            ? data.map(item => ({ [keyField]: item.srfkey || item[keyField] }))
            : [{}];
        break;
      // 单项数据主键，传递包含一个对象的数组，对象里只含有一个主键
      case 'SINGLEKEY':
        {
          const originData = data[0] || {};
          resultData =
            deName && keyField
              ? [{ [keyField]: originData.srfkey || originData[keyField] }]
              : [{}];
        }
        break;
      default:
        break;
    }

    // 处理上下文导航参数
    const resultContext = context.clone();
    const navContexts = [...(action.navigateContexts || [])];

    // 非无数据时，在导航参数开头加一个主键的导航参数，可以被配置的同名导航参数覆盖。
    // 数据项名称替换主键的取值属性，参数项名称替换处理后主键在上下文的名称
    // 配置的值项和参数项可以改变这个默认导航参数。
    if (deName && action.actionTarget !== 'NONE') {
      const { valueItem, paramItem } = action;
      const key = paramItem || deName;
      const valueKey = valueItem || 'srfkey';
      navContexts.unshift({
        key,
        value: valueKey,
        rawValue: false,
      } as INavigateParam);
    }

    // 是否是多数据
    const isMultiData =
      ['MULTIKEY', 'MULTIDATA'].includes(action.actionTarget!) &&
      data.length > 0;

    // 处理自定义导航上下文
    const tempContext = convertNavData(
      navContexts,
      isMultiData ? formatMultiData(navContexts, data) : data[0] || {},
      params,
      context,
    );
    Object.assign(resultContext, tempContext);

    // 处理自定义导航视图参数
    const navParams = action.navigateParams;
    const resultParams = convertNavData(
      navParams,
      isMultiData ? formatMultiData(navParams, data) : data[0] || {},
      params,
      resultContext,
    );

    // 添加触发源
    ibiz.util.record.addTriggerLogic(
      context.srfviewid,
      {
        navContexts,
        navParams,
      },
      tempContext,
    );

    // 预置属性处理
    // ignoredirtycheck(忽略脏值检查)
    const presetParams: IParams = {};
    if (resultParams.hasOwnProperty('ignoredirtycheck')) {
      presetParams.ignoredirtycheck = resultParams.ignoredirtycheck;
      delete resultParams.ignoredirtycheck;
    }
    // srfexportdataset（指定数据导出数据集标识）
    if (resultParams.hasOwnProperty('srfexportdataset')) {
      presetParams.srfexportdataset = resultParams.srfexportdataset;
      delete resultParams.srfexportdataset;
    }

    // srfasyncaction（指定当前界面行为是否异步（目前仅数据导出使用））
    if (resultParams.hasOwnProperty('srfasyncaction')) {
      presetParams.srfasyncaction = resultParams.srfasyncaction;
      delete resultParams.srfasyncaction;
    }

    // viewoption（指定导入视图的打开方式与宽高，参数值格式为viewoption={"modalOption":{"width":"80%","height":"80%"},"openMode":"POPUPMODAL"}，openMode打开方式的可选值有：INDEXVIEWTAB（顶级容器分页）、INDEXVIEWTAB_POPUP（顶级容器分页（非模态弹出））、INDEXVIEWTAB_POPUPMODAL（顶级容器分页（模态弹出））、POPUP（非模式弹出）、POPUPMODAL（模式弹出）、POPOVER（气泡卡片）、DRAWER_LEFT（模态左侧抽屉弹出）、DRAWER_RIGHT（模态右侧抽屉弹出）、DRAWER_TOP（模态上方抽屉弹出）、DRAWER_BOTTOM（模态下方抽屉弹出））
    if (resultParams.hasOwnProperty('viewoption')) {
      if (resultParams.viewoption) {
        presetParams.viewoption = JSON.parse(resultParams.viewoption);
      }
      delete resultParams.viewoption;
    }
    return { resultContext, resultData, resultParams, presetParams };
  }

  /**
   * 计算消息信息（动态，多语言资源）
   * @author lxm
   * @date 2023-09-25 03:03:01
   * @protected
   * @param {('confirm' | 'success')} type
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}
   */
  protected calcMessage(
    type: 'confirm' | 'success',
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): string | undefined {
    let msg: string | undefined;
    let msgRes: ILanguageRes | undefined;
    const { confirmMsg, cmlanguageRes, successMsg, smlanguageRes } = action;
    switch (type) {
      case 'confirm':
        msg = confirmMsg;
        msgRes = cmlanguageRes;
        break;
      case 'success':
        msg = successMsg;
        msgRes = smlanguageRes;
        break;
      default:
    }

    // 多语言资源转换
    if (msgRes) {
      const msgResContent = ibiz.i18n.t(
        msgRes.lanResTag!,
        msgRes.defaultContent || msg,
      );
      if (msgResContent !== msgRes.lanResTag) {
        msg = msgResContent;
      }
    }

    if (msg) {
      const { data } = args;
      const scriptParams: IParams = { ...args };
      if (data.length === 1) {
        // 单数据
        [scriptParams.data] = data;
      } else if (data.length === 0) {
        // 无数据
        delete scriptParams.data;
      }
      return ScriptFactory.execScriptFn(scriptParams, `\`${msg}\``, {
        isAsync: false,
        singleRowReturn: true,
      }) as string;
    }
  }

  /**
   * 处理打开视图配置自定义参数 modalOption
   *
   * @author zk
   * @date 2024-02-01 01:02:28
   * @param {IData} param
   * @return {*}  {IData}
   * @memberof FrontUIActionProvider
   */
  handleViewOptionParams(param: IData): IData {
    if (param.modaloption) {
      try {
        const modalOption = JSON.parse(param.modaloption);
        delete param.modaloption;
        return { modalOption };
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t('runtime.uiAction.viewParameterModalOption', { error }),
        );
      }
    }
    return {};
  }
}
