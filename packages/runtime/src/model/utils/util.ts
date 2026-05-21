/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RuntimeModelError } from '@ibiz-template/core';
import {
  IPanel,
  IAppView,
  IControl,
  IAppViewRef,
  IModelObject,
  ISysPFPlugin,
  IAppDEAction,
  IAppDEMethod,
  IAppDEDataSet,
  IAppDataEntity,
  IControlRender,
  IDEUIActionGroupDetail,
  IUIActionGroupDetail,
  IAppDEUIActionGroupDetail,
  IDEUIActionGroup,
  ISysImage,
  ISysCss,
} from '@ibiz/model-core';
import { createUUID, isArray } from 'qx-util';
import { PredefinedControlRender } from '../../constant';

/**
 * 在数据模型中查找对应 id 模型
 *
 * @author chitanda
 * @date 2023-04-22 15:04:49
 * @export
 * @param {IModelObject[]} models
 * @param {string} id
 * @return {*}  {(IModelObject | null)}
 */
export function findModelChild(
  models: IModelObject[],
  id: string,
): IModelObject | null {
  if (models && id) {
    const model = models.find(item => {
      if (item.id) {
        return item.id.toLowerCase() === id.toLowerCase();
      }
      return false;
    });
    if (model) {
      return model;
    }
  }
  return null;
}

/**
 * 从视图里面获取部件模型
 * @author lxm
 * @date 2023-06-06 10:53:27
 * @export
 * @param {IAppView} view 视图模型
 * @param {string} key 先匹配name，后是codeName, 最后才是id
 * @return {*}
 */
export function getControl(view: IAppView, key: string): IControl | undefined {
  let controls = view.controls || [];
  if (view.viewLayoutPanel?.controls?.length) {
    controls = controls.concat(view.viewLayoutPanel.controls);
  }
  return controls.find(item => {
    return item.name === key || item.codeName === key || item.id === key;
  });
}

/**
 * 从视图里找关联视图引用
 * @author lxm
 * @date 2023-07-04 03:26:34
 * @export
 * @param {IAppView} view
 * @param {string} key
 * @return {*}
 */
export function getAppViewRef(
  view: IAppView,
  key: string,
): IAppViewRef | undefined {
  let appViewRefs = view.appViewRefs || [];
  if (view.viewLayoutPanel?.appViewRefs?.length) {
    appViewRefs = appViewRefs.concat(view.viewLayoutPanel.appViewRefs);
  }
  return appViewRefs.find(item => {
    return item.name === key || item.id === key;
  });
}

/**
 * 解析用户参数
 * @author lxm
 * @date 2023-07-05 06:11:27
 * @export
 * @param {Record<string, string>} userParams
 */
export function parseUserParams(userParams: Record<string, string>): {
  navigateContexts: IParams;
  navigateParams: IParams;
  other: IParams;
} {
  const navigateContexts: IParams = {};
  const navigateParams: IParams = {};
  const other: IParams = {};
  for (const key in userParams) {
    if (Object.prototype.hasOwnProperty.call(userParams, key)) {
      const param = userParams[key];
      if (key.indexOf('.') !== -1) {
        const splitArr: Array<string> = key.split('.');
        switch (splitArr[0]) {
          case 'SRFNAVPARAM':
            Object.assign(navigateParams, { [splitArr[1]]: param });
            break;
          case 'SRFNAVCTX':
            Object.assign(navigateContexts, { [splitArr[1]]: param });
            break;
          default:
            Object.assign(other, { key: param });
            break;
        }
      }
    }
  }

  return { navigateContexts, navigateParams, other };
}

/**
 * 从应用里面获取插件配置参数
 *
 * @author chitanda
 * @date 2023-11-21 14:11:06
 * @export
 * @param {string} id 插件标识
 * @param {string} [appId] 当前所在应用标识
 * @return {*}  {ISysPFPlugin}
 */
export function getPFPlugin(id: string, appId: string): ISysPFPlugin {
  const app = ibiz.hub.getApp(appId);
  if (!app) {
    throw new RuntimeModelError(
      app,
      ibiz.i18n.t('runtime.model.utils.noFoundApplication'),
    );
  }
  const { model } = app;
  if (!model.appPFPluginRefs) {
    throw new RuntimeModelError(
      model,
      ibiz.i18n.t('runtime.model.utils.unconfiguredPlugins'),
    );
  }
  const plugin = model.appPFPluginRefs.find(
    item => item.pluginCode!.toLowerCase() === id.toLowerCase(),
  );
  if (!plugin) {
    throw new Error(ibiz.i18n.t('runtime.model.utils.noFound', { id }));
  }
  return plugin;
}

/**
 * 获取部件布局面板
 * @author lxm
 * @date 2023-11-28 11:07:49
 * @export
 * @param {IControl} control
 * @return {*}  {(IPanel | undefined)}
 */
export function getControlPanel(control: {
  controlRenders?: IControlRender[];
}): IPanel | undefined {
  let layoutPanel: IPanel | undefined;
  if (control.controlRenders) {
    // 排除空数据显示内容绘制器
    const panelRender = control.controlRenders.find(
      item =>
        item.renderType === 'LAYOUTPANEL' &&
        !!item.layoutPanel &&
        !(Object.values(PredefinedControlRender) as string[]).includes(
          item.id!,
        ),
    );
    layoutPanel = panelRender?.layoutPanel;
  }
  return layoutPanel;
}

/**
 * 在应用实体模型中查找对应 id 应用方法
 * 解决应用实体方法名和行为，数据集方法不一致的问题
 * @author lionlau
 * @date 2024-03-09 18:04:21
 * @export
 * @param {IAppDataEntity} appDataEntity
 * @param {string} id
 * @return {*}  {(IAppDEMethod | null)}
 */
export function findAppDEMethod(
  appDataEntity: IAppDataEntity,
  id: string,
): IAppDEMethod | null {
  const models = appDataEntity.appDEMethods;
  if (models && id) {
    const model = findModelChild(models, id);
    if (model) {
      return model;
    }
    const model2 = models!.find(item => {
      switch (item.methodType) {
        case 'DEACTION': {
          const { actionTag } = item as IAppDEAction;
          return actionTag?.toLowerCase() === id.toLowerCase();
        }
        case 'FETCH': {
          const { dataSetTag } = item as IAppDEDataSet;
          return `fetch${dataSetTag?.toLowerCase()}` === id.toLowerCase();
        }
        default:
          return false;
      }
    });
    if (model2) {
      return model2;
    }
  }
  return null;
}

/**
 * 获取部件的Teleport参数
 * @author lxm
 * @date 2024-03-27 02:02:09
 * @export
 * @param {IControl} control
 * @return {*}  {(string | undefined)}
 */
export function getCtrlTeleportParams(control: IControl): {
  teleportTag: string | undefined;
  teleportFlag: boolean;
} {
  const teleportTag = control.controlParam?.ctrlParams?.TELEPORTTAG;
  const teleportFlag =
    control.controlParam?.ctrlParams?.TELEPORTFLAG === 'true';
  return {
    teleportTag,
    teleportFlag,
  };
}

/**
 * @description 计算图标模型对象
 * @param {string} appId
 * @param {string} [_str]
 * @returns {*}  {(ISysImage | undefined)}
 */
const calcSysImage = (appId: string, _str?: string): ISysImage | undefined => {
  if (!_str) return undefined;

  // 默认为FontAwesome
  return {
    cssClass: _str,
    glyph: `${createUUID()}@FontAwesome`,
    appId,
  };
};

/**
 * @description 计算
 * @param {string} appId
 * @param {string} [_str]
 * @returns {*}  {(ISysCss | undefined)}
 */
const calcSysCss = (appId: string, _str?: string): ISysCss | undefined => {
  if (!_str) return undefined;

  return {
    cssName: _str,
    appId,
  };
};

/**
 * @description 计算单个动态界面行为组项数据
 * @export
 * @param {IData} refUIActionGroup
 * @param {IContext} context
 * @param {IParams} params
 * @returns {*}  {Promise<IAppDEUIActionGroupDetail[]>}
 */
export async function calcDyUiactionGroup(
  refUIActionGroup: IData,
  context: IContext,
  params: IParams,
): Promise<IAppDEUIActionGroupDetail[]> {
  const {
    appId,
    detailAppDataEntityId,
    detailAppDEDataSetId,
    // 界面行为标记
    uiactionTagAppDEFieldId,
    // 文本属性
    textAppDEFieldId,
    // 提示值属性
    tipsAppDEFieldId,
    // 可见逻辑属性
    visibleScriptAppDEFieldId,
    // 图标样式属性
    iconClsAppDEFieldId,
    // 样式表属性
    clsAppDEFieldId,
    // 按钮样式属性
    buttonStyleAppDEFieldId,
    // 行为级别属性
    actionLevelAppDEFieldId,
    // 启用逻辑属性
    enableScriptAppDEFieldId,
  } = refUIActionGroup;

  const details: IAppDEUIActionGroupDetail[] = [];
  try {
    if (detailAppDEDataSetId && detailAppDataEntityId) {
      const response = await ibiz.hub
        .getApp(appId)
        .deService.exec(
          detailAppDataEntityId,
          detailAppDEDataSetId,
          context,
          params,
        );
      if (response.ok && isArray(response.data)) {
        response.data.forEach((_item: IData) => {
          const action: IAppDEUIActionGroupDetail = {
            uiactionId: _item[uiactionTagAppDEFieldId],
            caption: _item[textAppDEFieldId],
            tooltip: _item[tipsAppDEFieldId],
            visibleScriptCode: _item[visibleScriptAppDEFieldId],
            sysImage: calcSysImage(appId, _item[iconClsAppDEFieldId]),
            sysCss: calcSysCss(appId, _item[clsAppDEFieldId]),
            buttonStyle: _item[buttonStyleAppDEFieldId],
            actionLevel: _item[actionLevelAppDEFieldId],
            enableScriptCode: _item[enableScriptAppDEFieldId],
            // 适配显示逻辑
            showCaption: !!_item[textAppDEFieldId],
            showIcon: !!_item[iconClsAppDEFieldId],
            detailType: 'DEUIACTION',
            itemType: 'DEUIACTION',
            id: `${createUUID()}`,
            appId,
          } as IAppDEUIActionGroupDetail;

          // 界面行为标识不能为空
          if (action.uiactionId) details.push(action);
        });
      }
    }
  } catch (error) {
    ibiz.log.error(error);
  }
  return details;
}

/**
 * @description 处理界面行为组（替换动态行为组模型为实际的行为项集合）
 * @export
 * @param {IUIActionGroupDetail[]} uiactionGroupDetails
 * @param {IContext} context
 * @param {IParams} params
 * @returns {*}  {Promise<IUIActionGroupDetail[]>}
 */
export async function calcUIActionDetails(
  uiactionGroupDetails: IUIActionGroupDetail[],
  context: IContext,
  params: IParams,
): Promise<IUIActionGroupDetail[]> {
  // 筛选需要替换的项（保留原始索引）
  const refActionDetails: { detail: IData; index: number }[] = [];
  uiactionGroupDetails.forEach((detail: IData, index: number) => {
    // 过滤静态界面行为组
    if (
      detail.detailType === 'DEUIACTIONGROUP' &&
      detail.refUIActionGroup?.dynamicMode === 1 &&
      !detail.refUIActionGroup?.uiactionGroupDetails
    ) {
      refActionDetails.push({ detail, index });
    }
  });

  // 批量执行异步任务，获取所有动态界面行为组数据
  const asyncTasks: Promise<IUIActionGroupDetail[]>[] = [];
  refActionDetails.forEach(({ detail }) => {
    const { refUIActionGroup } = detail;
    const task = calcDyUiactionGroup(refUIActionGroup, context, params);
    asyncTasks.push(task);
  });

  // 将模型数据合并至引用界面行为组对象
  const actionGroupDataList = await Promise.all(asyncTasks);
  refActionDetails.forEach(({ index }, i) => {
    const _uiactionGroupDetails = actionGroupDataList[i];
    Object.assign((uiactionGroupDetails[index] as IData).refUIActionGroup, {
      uiactionGroupDetails: _uiactionGroupDetails,
    });
  });

  return uiactionGroupDetails;
}

/**
 * @description 递归获取所有界面行为项（处理多层嵌套的动态行为组、替换动态行为组模型为实际的行为项集合）
 * @export
 * @param {IDEUIActionGroupDetail[]} details
 * @param {IContext} context
 * @param {IParams} params
 * @returns {*}  {Promise<IDEUIActionGroupDetail[]>}
 */
export async function calcAllUIActionDetails(
  details: IDEUIActionGroupDetail[],
  context: IContext,
  params: IParams,
): Promise<IDEUIActionGroupDetail[]> {
  const actions: IDEUIActionGroupDetail[] = [];
  // 收集所有遍历过程中的异步任务
  const asyncTasks: Promise<IDEUIActionGroupDetail[]>[] = [];
  const addAction = (items: IDEUIActionGroupDetail[]) => {
    if (!isArray(items) || !items?.length) return;
    const task = calcUIActionDetails(items, context, params);
    asyncTasks.push(task);
    items.forEach(item => {
      if (item.detailType === 'DEUIACTIONGROUP') {
        if (item.refUIActionGroup?.uiactionGroupDetails?.length)
          addAction(item.refUIActionGroup!.uiactionGroupDetails);
      }
    });
  };
  addAction(details || []);

  const allActionDetails = await Promise.all(asyncTasks);
  allActionDetails.forEach(_details => {
    _details.forEach(detail => {
      actions.push(detail);
    });
  });

  return actions;
}

/**
 * @description 处理界面行为组，动态界面行为组需请求数据并生成成员项模型
 * @export
 * @param {IDEUIActionGroup} uiactionGroup
 * @param {IContext} context
 * @param {IParams} params
 * @returns {*}  {Promise<IDEUIActionGroup>}
 */
export async function calcUIActionGroup(
  uiactionGroup: IDEUIActionGroup,
  context: IContext,
  params: IParams,
): Promise<IDEUIActionGroup> {
  if (uiactionGroup.dynamicMode === 1 && !uiactionGroup.uiactionGroupDetails) {
    // 实体数据集模式
    const uiactionGroupDetails = await calcDyUiactionGroup(
      uiactionGroup,
      context,
      params,
    );
    Object.assign(uiactionGroup, {
      uiactionGroupDetails,
    });
  } else {
    // 静态模式
    // 收集所有遍历过程中的异步任务
    const asyncTasks: Promise<IUIActionGroupDetail[]>[] = [];
    if (uiactionGroup?.uiactionGroupDetails) {
      const task = calcAllUIActionDetails(
        uiactionGroup.uiactionGroupDetails,
        context,
        params,
      );
      asyncTasks.push(task);
    }
    await Promise.all(asyncTasks);
  }

  return uiactionGroup;
}

/**
 * @description 获取所有的界面行为项模型集合
 * @export
 * @param {IDEUIActionGroupDetail[]} details
 * @returns {*}  {IDEUIActionGroupDetail[]}
 */
export function getAllUIActionItems(
  details: IDEUIActionGroupDetail[] = [],
): IDEUIActionGroupDetail[] {
  const actions: IDEUIActionGroupDetail[] = [];
  const addAction = (items: IDEUIActionGroupDetail[]) => {
    items.forEach(item => {
      actions.push(item);
      if (item.detailType === 'DEUIACTIONGROUP') {
        const childrenDetails = item.refUIActionGroup?.uiactionGroupDetails;
        if (childrenDetails?.length) addAction(childrenDetails);
      }
    });
  };
  addAction(details);
  return actions;
}
