import {
  StringUtil,
  RuntimeModelError,
  ModelError,
  RuntimeError,
  PartialWithObject,
} from '@ibiz-template/core';
import {
  IAppDEDataSet,
  IAppDEUIAction,
  IDEEditForm,
  IDEFormDetail,
  IUIAction,
} from '@ibiz/model-core';
import { clone, mergeRight } from 'ramda';
import { OpenAppViewCommand } from '../../command';
import {
  IUILogicParams,
  IUIActionResult,
  IModalData,
  EventBase,
  EditFormEvent,
  IMDControlController,
} from '../../interface';
import { ScriptFactory } from '../../utils';
import { UIActionProviderBase } from './ui-action-provider-base';
import { openDataImport } from '../../controller/utils';
import { SysUIActionTag } from '../../constant';
import { calcResPath } from '../../service';

/**
 * 前台调用界面行为适配器
 *
 * @export
 * @class FrontUIActionProvider
 * @implements {IUIActionProvider}
 */
export class FrontUIActionProvider extends UIActionProviderBase {
  async execAction(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const { context, params, data, event, noWaitRoute, view } = args;
    let actionResult: IUIActionResult = {};
    switch (action.frontProcessType) {
      case 'OPENHTMLPAGE': {
        const url = StringUtil.fill(
          action.htmlPageUrl!,
          context,
          params,
          data?.[0],
        );
        window.open(url, '_blank');
        break;
      }
      case 'TOP':
      case 'WIZARD': {
        const frontPSAppView = action.frontAppViewId;
        if (!frontPSAppView) {
          throw new RuntimeModelError(
            action,
            ibiz.i18n.t('runtime.uiAction.noConfiguredopenView'),
          );
        }
        // 处理参数
        const { resultContext, resultParams, resultData } =
          await this.handleParams(action, context, data, params);

        // 获取视图数据能力部件
        const { xdataControlName = '' } = view.model as IData;
        const xdataControl = view.getController(
          xdataControlName,
        ) as IMDControlController;
        if (xdataControl) {
          // 添加srfnavctrlid到上下文，适配上一条，下一条，第一条，最后一条相关功能
          resultContext.srfnavctrlid = xdataControl.ctrlId;
        }
        //  解析自定义 视图 option 参数
        const options = this.handleViewOptionParams(resultParams);
        const res: IModalData | undefined = await ibiz.commands.execute(
          OpenAppViewCommand.TAG,
          frontPSAppView,
          resultContext,
          resultParams,
          {
            ctx: view.getCtx(),
            event,
            noWaitRoute,
            parentData: resultData,
            ...options,
          },
        );
        // 打开视图取消操作
        if (!res?.ok) {
          actionResult.cancel = true;
        }

        if (res?.ok && res.data) {
          actionResult.data = res.data;
          actionResult.nextContext = resultContext;
          actionResult.nextParams = { ...params, ...resultParams };
        }

        break;
      }
      case 'PRINT':
        await this.executePrint(action, args);
        break;
      case 'DATAIMP':
        actionResult = await this.executeDataImport(action, args);
        break;
      case 'DATAEXP':
        await this.executeDataExport(action, args);
        break;
      case 'OTHER':
        actionResult = await this.doOther(action, args);
        break;
      case 'EDITFORM':
        actionResult = await this.openEditForm(action, args);
        break;
      case 'QUICKEDIT':
        actionResult = await this.openQuickEdit(action, args);
        break;
      case 'CHAT':
        actionResult = await this.openAiChat(action, args);
        break;
      default:
        throw new ModelError(
          action,
          ibiz.i18n.t('runtime.uiAction.frontProcessingModes', {
            frontProcessType: action.frontProcessType,
          }),
        );
    }
    return actionResult;
  }

  /**
   * 处理模式：用户自定义
   * @author lxm
   * @date 2023-07-25 02:39:48
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}
   */
  protected async doOther(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const { context, params, data, event, view, ctrl } = args;
    const { resultContext, resultParams } = await this.handleParams(
      action,
      context,
      data,
      params,
    );
    const { scriptCode, uiactionTag } = action as IUIAction;
    if (uiactionTag === SysUIActionTag.SHOTR_CUT) {
      const result = await view.callUIAction(uiactionTag, args);
      return result || {};
    }
    if (scriptCode) {
      const result = (await ScriptFactory.asyncExecScriptFn(
        {
          context: resultContext,
          params: { ...params, ...resultParams },
          data,
          el: event?.target,
          view,
          ctrl,
          action,
        },
        scriptCode,
      )) as IUIActionResult | undefined;
      return result || {};
    }
    throw new RuntimeModelError(
      action,
      ibiz.i18n.t('runtime.uiAction.missingConfigurationScriptCode'),
    );
  }

  /**
   * 执行打印行为
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}
   */
  protected async executePrint(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<void> {
    // 处理参数
    const { resultContext, resultParams } = await this.handleParams(
      action,
      args.context,
      args.data,
      args.params,
    );
    const appDataEntity = await ibiz.hub.getAppDataEntity(
      action.appDataEntityId!,
      action.appId,
    );
    const appDEPrint = appDataEntity.appDEPrints?.find(print => {
      return print.id === action.appDEPrintId;
    });
    if (appDEPrint) {
      let requestUrl: string = '';
      if (
        resultContext &&
        resultContext[appDataEntity.codeName!.toLowerCase()]
      ) {
        // TODO 临时写死printdata， 非标准，后续优化
        const resPath = calcResPath(resultContext, appDataEntity);
        requestUrl += `${resPath}/${appDataEntity.deapicodeName2}/printdata/${encodeURIComponent(
          resultContext[appDataEntity.codeName!.toLowerCase()],
        )}`;
      } else {
        throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.dataPrimaryKey'));
      }
      const app = await ibiz.hub.getAppAsync(action.appId);
      const res = await app.net.request(requestUrl, {
        method: 'get',
        responseType: 'blob',
        params: {
          srfprinttag: appDEPrint.codeName,
          ...resultParams,
        },
      });
      if (res.ok) {
        const success = await ibiz.printPreview.execPrint(
          resultContext,
          resultParams,
          res.data as Blob,
        );
        if (success) return;
        // 存在srfcontenttype参数需响应文件
        if (resultParams && resultParams.srfcontenttype) {
          const fileName = ibiz.util.file.getFileName(res);
          const href = URL.createObjectURL(res.data as Blob);
          const a = document.createElement('a');
          a.href = href;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(href);
        } else {
          const link = window.URL.createObjectURL(res.data as Blob);
          window.open(link, '_blank');
        }
      } else {
        throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.printFailure'));
      }
    } else {
      throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.physicalPrint'));
    }
  }

  /**
   * 执行导入行为
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}
   */
  protected async executeDataImport(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    // 处理参数
    const { resultContext, resultParams, presetParams } =
      await this.handleParams(action, args.context, args.data, args.params);

    const { appDataEntityId, appDEDataImportId, frontAppViewId } = action;
    if (!appDataEntityId || !appDEDataImportId) {
      throw new RuntimeModelError(
        action,
        ibiz.i18n.t('runtime.controller.common.control.noImportModel'),
      );
    }

    await openDataImport({
      appDataEntityId,
      deDataImportId: appDEDataImportId,
      dataImportViewId: frontAppViewId,
      context: resultContext,
      params: resultParams,
      event: args.event,
      viewOption: presetParams.viewoption,
    });

    return {
      refresh: true,
      refreshMode: 1,
    };
  }

  /**
   * 执行导出行为
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}
   */
  protected async executeDataExport(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<void> {
    // 处理参数
    const { resultContext, resultParams, presetParams } =
      await this.handleParams(action, args.context, args.data, args.params);

    const appDataEntity = await ibiz.hub.getAppDataEntity(
      action.appDataEntityId!,
      action.appId,
    );
    const appDEDataExport = appDataEntity.appDEDataExports?.find(dataExport => {
      return dataExport.id === action.appDEDataExportId;
    });
    if (appDEDataExport) {
      // 导出数据集优先通过界面行为参数srfexportdataset获取，然后再从导出对象数据集合获取，都没有则获取当前界面行为实体默认数据集，最后则抛出异常
      let exportDatasetCodeName: string = presetParams.srfexportdataset;
      if (!exportDatasetCodeName && appDEDataExport.appDEDataSetId) {
        exportDatasetCodeName = appDEDataExport.appDEDataSetId;
      }
      if (!exportDatasetCodeName) {
        const defaultDataset = appDataEntity.appDEMethods?.find(appDEMethod => {
          return (appDEMethod as IAppDEDataSet).dataSetTag === 'Default';
        });
        if (defaultDataset) {
          exportDatasetCodeName = defaultDataset.codeName!;
        }
      }
      if (!exportDatasetCodeName) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.uiAction.exportWithNoDataSet'),
        );
      }

      // 异步导出
      const isAsyncAction: boolean = presetParams.srfasyncaction === 'true';
      const resPath = calcResPath(resultContext, appDataEntity);
      const url: string = `${resPath}/${appDataEntity.deapicodeName2}/${isAsyncAction ? 'asyncexportdata' : 'exportdata'}/${exportDatasetCodeName}`;
      //  查询参数
      const queryParam: IParams = { srfexporttag: appDEDataExport.codeName };
      if (resultContext?.srfdatatype) {
        Object.assign(queryParam, { srfdatatype: resultContext.srfdatatype });
      }

      //  参数
      const params: IData = {
        page: 0,
        size: appDEDataExport.maxRowCount ? appDEDataExport.maxRowCount : 1000,
        ...args.params,
        ...resultParams,
      };
      const app = await ibiz.hub.getAppAsync(action.appId);
      const res = await app.net.request(url, {
        method: 'post',
        responseType: 'blob',
        params: queryParam,
        data: params,
      });
      if (isAsyncAction) return;
      if (res.status === 200) {
        const fileName = ibiz.util.file.getFileName(res);
        const blob = new Blob([res.data as Blob], {
          type: 'application/vnd.ms-excel',
        });
        const elink = document.createElement('a');
        elink.download = fileName;
        elink.style.display = 'none';
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
      } else {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.uiAction.exportRequestFailed'),
        );
      }
    } else {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.uiAction.noEntityExportsFound'),
      );
    }
  }

  /**
   * 打开编辑表单
   * @author lxm
   * @date 2024-03-21 03:54:01
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}  {IUIActionResult}
   */
  protected async openEditForm(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const actionResult: IUIActionResult = {};
    const { context, params, data, event } = args;

    if (!event) {
      throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.lackNativeEvent'));
    }

    // 自定义模型
    let tempModel = null;
    if (params.customeditormodel) {
      tempModel = params.customeditormodel;
    }
    // 处理参数
    const { resultContext, resultParams } = await this.handleParams(
      action,
      context,
      data,
      params,
    );
    //  解析自定义 视图 option 参数
    const options = this.handleViewOptionParams(resultParams).modalOption || {};
    const popoverOpts = mergeRight(
      {
        autoClose: true,
      },
      options,
    );
    let hasSave = false;

    const overlay = ibiz.overlay.createPopover(
      'IBizControlShell',
      {
        context: resultContext,
        params: resultParams,
        modelData: this.mergeFormItemModel(action.deeditForm, tempModel),
        onSaveSuccess: (
          eventArgs: PartialWithObject<EditFormEvent, EventBase>,
        ) => {
          actionResult.data = [eventArgs.args];
          if (overlay) {
            overlay.dismiss();
          }
          hasSave = true;
        },
        onFinish: (_eventArgs: PartialWithObject<EditFormEvent, EventBase>) => {
          overlay?.dismiss();
        },
      },
      popoverOpts,
    );

    overlay.present(event.target as HTMLElement);
    await overlay.onWillDismiss();

    // 打开表单没有保存，取消操作
    if (!hasSave) {
      actionResult.cancel = true;
    }

    return actionResult;
  }

  /**
   * 打开快速编辑
   *
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}  {Promise<IUIActionResult>}
   * @memberof FrontUIActionProvider
   */
  protected async openQuickEdit(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const actionResult: IUIActionResult = {
      cancel: true,
    };
    const { context, params, data, event } = args;

    if (!event) {
      throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.lackNativeEvent'));
    }

    // 自定义模型
    let tempModel = null;
    if (params.customeditormodel) {
      tempModel = params.customeditormodel;
    }

    // 处理参数
    const { resultContext, resultParams } = await this.handleParams(
      action,
      context,
      data,
      params,
    );
    //  解析自定义 视图 option 参数
    const options = this.handleViewOptionParams(resultParams).modalOption || {};
    const popoverOpts = mergeRight(
      {
        autoClose: true,
      },
      options,
    );
    const overlay = ibiz.overlay.createPopover(
      'IBizQuickEdit',
      {
        context: resultContext,
        params: { ...params, ...resultParams },
        modelData: this.mergeFormItemModel(action.deeditForm, tempModel),
        onClose: (modalData: IModalData) => {
          if (modalData.ok) {
            actionResult.data = modalData.data;
            actionResult.cancel = false;
          }
          if (overlay) {
            overlay.dismiss();
          }
        },
      },
      popoverOpts,
    );

    overlay.present(event.target as HTMLElement);
    await overlay.onWillDismiss();
    return actionResult;
  }

  /**
   * 合并自定义表单项模型到表单模型里
   *
   * @protected
   * @param {IData} formModel 表单模型
   * @param {IData} EditorForm 表单项模型
   * @return {*}
   * @memberof FrontUIActionProvider
   */
  protected mergeFormItemModel(
    formModel: IDEEditForm | undefined,
    editorModel?: IDEFormDetail,
  ): IDEEditForm | undefined {
    const tempFormModel = clone(formModel);
    if (
      tempFormModel &&
      editorModel &&
      tempFormModel.deformPages &&
      tempFormModel.deformPages.length > 0
    ) {
      const { deformDetails } = tempFormModel.deformPages[0];
      deformDetails?.push(editorModel);
    }
    return tempFormModel;
  }

  /**
   * 打开AI聊天框
   *
   * @protected
   * @param {IAppDEUIAction} action
   * @param {IUILogicParams} args
   * @return {*}  {Promise<IUIActionResult>}
   * @memberof FrontUIActionProvider
   */
  protected async openAiChat(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    if (!ibiz.env.enableAI)
      throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.noEnableAI'));
    const { appDEACModeId, appDataEntityId, appId } = action;
    const { resultContext, resultParams } = await this.handleParams(
      action,
      args.context,
      args.data,
      args.params,
    );
    const context = Object.assign(resultContext, { srfappid: appId });
    if (!appDataEntityId || !appDEACModeId) {
      throw new RuntimeError(ibiz.i18n.t('runtime.uiAction.noEntityOrAcMode'));
    }
    const data = await ibiz.appUtil.openAiChat({
      appDEACModeId,
      appDataEntityId,
      context,
      view: args.view,
      ctrl: args.ctrl,
      params: resultParams,
      data: args.data?.[0],
    });

    return { data };
  }
}
