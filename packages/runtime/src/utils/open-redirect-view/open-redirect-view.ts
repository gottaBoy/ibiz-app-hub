/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IAppDERedirectView,
  IAppDataEntity,
  IAppRedirectView,
} from '@ibiz/model-core';
import { RuntimeError, RuntimeModelError } from '@ibiz-template/core';
import { isNilOrEmpty, notNilEmpty } from 'qx-util';
import qs from 'qs';
import { isNumber } from 'lodash-es';
import { IModalData, IOpenViewOptions } from '../../interface';
import { OpenAppViewCommand } from '../../command';
import { convertNavData, parseSearchParams } from '../nav-params/nav-params';
import { calcDeCodeNameById, findFieldById } from '../../model';

/**
 * 解析view://协议的字符串
 * @author lxm
 * @date 2024-02-06 09:26:20
 * @export
 * @param {string} urlStr
 * @return {*}  {{
 *   context: IParams;
 *   params: IParams;
 *   viewId: string;
 * }}
 */
export function parseViewProtocol(urlStr: string): {
  context: IParams;
  params: IParams;
  viewId: string;
} {
  const url = new URL(urlStr);
  const context: IParams = {};
  const params: IParams = {};
  let viewId = '';
  if (url.searchParams.size > 0) {
    const navCtx = url.searchParams.get('srfnavctx');
    if (navCtx) {
      try {
        Object.assign(context, JSON.parse(navCtx));
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t(
            'runtime.utils.openRedirectView.parseSrfnavctxParameter',
            { urlStr },
          ),
          error,
        );
      }
      url.searchParams.delete('srfnavctx');
    }
    url.searchParams.forEach((value, _key) => {
      params[_key] = value;
    });
    // 路径中存在search但searchParams为空，说明浏览器不支持URLSearchParams对象
  } else if (url.search) {
    const searchParams = parseSearchParams(url.search);
    const navCtx: string = searchParams.srfnavctx;
    if (navCtx) {
      try {
        const value = decodeURIComponent(navCtx);
        Object.assign(context, JSON.parse(value));
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t(
            'runtime.utils.openRedirectView.parseSrfnavctxParameter',
            { urlStr },
          ),
          error,
        );
      }
      delete searchParams.srfnavctx;
    }
    Object.keys(searchParams).forEach(key => {
      params[key] = searchParams[key];
    });
  }
  // 兼容edge浏览器
  const pathname = url.pathname || url.hostname;
  const rdTagItems = pathname.replace('//', '').split('/');
  // 当只有一个时，为视图标识。当有两个时，第二个是视图标识
  const [appOrViewTag, viewTag] = rdTagItems;
  if (viewTag) {
    viewId = viewTag;
  } else {
    viewId = appOrViewTag;
  }

  return {
    context,
    params,
    viewId,
  };
}

type ToViewParams = {
  context: IContext;
  params: IParams;
  opts: IOpenViewOptions;
  viewId: string;
};

/**
 * 打开重定向视图
 *
 * @author chitanda
 * @date 2022-09-28 16:09:13
 * @export
 * @param {IAppRedirectView} appView 应用重定向视图
 * @param {IContext}
 * @param {IParams} [params={}]
 * @param {IData} [data={}]
 * @return {*}  {Promise<IModalData>}
 */
export async function openRedirectView(
  appView: IAppRedirectView,
  context: IContext,
  params: IParams = {},
  opts: IOpenViewOptions = {},
): Promise<IModalData> {
  return openDERedirectView(
    appView as IAppDERedirectView,
    context,
    params,
    opts,
  );
}

/**
 * 本地打开工作流重定向视图
 *
 * @description 工作流 appredirectview 特殊处理，全局通过 appredirectview 跳转工作流重定向，均使用此方法
 * @author zk
 * @date 2024-01-02 11:01:16
 * @export
 * @param {IContext} context
 * @param {string} linkUrl
 * @param {IOpenViewOptions} [opts={}]
 * @return {*}  {Promise<void>}
 */
export async function toLocalOpenWFRedirectView(
  context: IContext,
  linkUrl: string,
  opts: IOpenViewOptions = {},
): Promise<void> {
  const toView = await getLocalOpenWFRedirectView(context, linkUrl, opts);
  await ibiz.commands.execute(
    OpenAppViewCommand.TAG,
    toView.viewId,
    toView.context,
    toView.params,
    toView.opts,
  );
}

/**
 * 获取本地打开工作流重定向视图的相关信息
 *
 * @author zk
 * @date 2024-01-02 11:01:38
 * @export
 * @param {IContext} context
 * @param {string} linkUrl
 * @param {IOpenViewOptions} [opts={}]
 * @return {*}  {Promise<ToViewParams>}
 */
export async function getLocalOpenWFRedirectView(
  context: IContext,
  linkUrl: string,
  opts: IOpenViewOptions = {},
): Promise<ToViewParams> {
  const i = linkUrl.lastIndexOf('?');
  const queryStr: string = decodeURIComponent(
    linkUrl.substring(i + 1, linkUrl.length),
  );
  const params = qs.parse(queryStr, { delimiter: ';' }) as IData;

  // 工作流给的实体name名称（小写）
  const deName: string = params.srfdename || '';
  if (!deName) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.utils.openRedirectView.missingEntityName'),
    );
  }
  const app = ibiz.hub.getApp(context.srfappid);
  let deCodeName: string | undefined = app.deName2DeCodeName.get(
    deName.toUpperCase(),
  ); // 实体codeName

  if (!deCodeName) {
    deCodeName = deName.toLowerCase();
  }

  // 把视图参数里的实体name主键换成codeName主键
  params[deCodeName!] = params[deName.toLowerCase()];

  // 实体的默认重定向视图codeName
  let deRdViewCodeName = '';
  let deRdView;
  try {
    deRdViewCodeName = `${deCodeName}${
      ibiz.env.isMob ? 'Mob' : ''
    }RedirectView`;
    deRdView = await ibiz.hub.getAppView(deRdViewCodeName);
  } catch (error) {
    deRdViewCodeName = `${deCodeName}${
      ibiz.env.isMob ? '_mob' : ''
    }_redirect_view`;
    deRdView = await ibiz.hub.getAppView(deRdViewCodeName);
  }

  // 删除跳转用参数
  delete params.srfdename;
  // 转换 processDefinitionKey 中的工作流流程以及版本到参数中
  if (params.srfwf !== 'undo') {
    const tags = params.processDefinitionKey.split('-');
    const wfTag = tags[3] as string;
    const wf = wfTag.substring(0, wfTag.lastIndexOf('v'));
    const wfVersion = wfTag.substring(wfTag.lastIndexOf('v'));
    params.wf = wf;
    params.wfVersion = wfVersion;
  }
  // 工作流附加参数转到上下文里
  if (params.srfprocessinstanceid) {
    context.srfprocessinstanceid = params.srfprocessinstanceid;
    delete params.srfprocessinstanceid;
  }
  // 修正视图上下文appid（适配多应用）
  if (deRdView && deRdView.appId !== context.srfappid) {
    context.srfappid = deRdView.appId;
  }

  return {
    context,
    params,
    opts,
    viewId: deRdView.id!,
  };
}

/**
 * 获取处理后的重定向视图最终要跳转视图的相关信息
 * @author lxm
 * @date 2023-12-26 11:16:02
 * @export
 * @param {IAppDERedirectView} appView
 * @param {IContext} context
 * @param {IParams} [params={}]
 * @param {IOpenViewOptions} [opts={}]
 * @return {*}  {(Promise<({ type: 'view' } & ToViewParams) | { type: 'url'; url: string }>)}
 */
export async function getDERedirectToView(
  appView: IAppDERedirectView,
  context: IContext,
  params: IParams = {},
  opts: IOpenViewOptions = {},
): Promise<({ type: 'view' } & ToViewParams) | { type: 'url'; url: string }> {
  // 计算重定向视图上下文参数转换
  const navContext = appView.appViewNavContexts || [];
  const navContextData = convertNavData(navContext, params, context);
  context = Object.assign(context.clone(), navContextData);
  // 计算重定向视图视图参数转换
  const navParams = appView.appViewNavParams || [];
  const navParamsData = convertNavData(navParams, params, context);
  Object.assign(params, navParamsData);

  // 重定向视图对应应用实体
  const entityId = appView.appDataEntityId!;
  const key = calcDeCodeNameById(entityId);
  let curData: IData = opts.data?.[0] || {};
  // 将数据主键转换到上下文当中
  context[key] = curData[key] || context[key] || params[key];
  // 实体重定向视图获取数据行为
  const actionId = appView.getDataAppDEActionId;
  const app = ibiz.hub.getApp(appView.appId);
  const service = await app.deService.getService(context, entityId);
  ibiz.loading.showRedirect();
  try {
    // 获取数据，未配置行为时，默认走 Get 行为
    const res = await service.exec(actionId || 'get', context, params);
    if (res.ok) {
      curData = res.data;
      let linkUrl: string = curData.linkurl;
      if (linkUrl) {
        // 工作流 param09 转的 srfprocessinstanceid 传递
        if (context.srfprocessinstanceid) {
          linkUrl += `;srfprocessinstanceid=${context.srfprocessinstanceid}`;
        }

        // 开发时把前面的路径删掉，走本地跳转。
        if (ibiz.env.dev && linkUrl.indexOf('appredirectview?') !== -1) {
          linkUrl = linkUrl.slice(linkUrl.indexOf('appredirectview?'));
        }

        if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
          return { type: 'url', url: linkUrl };
        }
        if (linkUrl.startsWith('view://')) {
          const result = parseViewProtocol(linkUrl);
          Object.assign(context, result.context);
          Object.assign(params, result.params);
          return {
            type: 'view',
            viewId: result.viewId,
            context,
            params,
            opts: { ...opts, data: [curData] },
          };
        }
        if (linkUrl.startsWith('route://')) {
          const routeUrl = `/${linkUrl.split('route://')[1]}`;
          return { type: 'url', url: routeUrl };
        }
        if (linkUrl.startsWith('appredirectview?')) {
          const toView = await getLocalOpenWFRedirectView(
            context,
            linkUrl,
            opts,
          );
          return { type: 'view', ...toView };
        }
        throw new RuntimeError(
          ibiz.i18n.t('runtime.utils.openRedirectView.unsupportedLinkUrl', {
            linkUrl,
          }),
        );
      }
    }
  } catch (error) {
    throw error;
  } finally {
    ibiz.loading.hideRedirect();
  }
  const entity = await ibiz.hub.getAppDataEntity(entityId, appView.appId);
  const rdTag = await calcDERdTag(entity, appView, params, curData);
  let viewId = '';
  // view://协议开头处理,值示例: view://{app}/{viewcodename}?srfnavctx={"work_item":"6c797b6a6dfbd8f38652fe3ea3220fc1","project":"ee11e5a96002f4f3937ddba025ec7d44"}&srfwftag={wftag}
  if (rdTag.startsWith('view://')) {
    const result = parseViewProtocol(rdTag);
    Object.assign(context, result.context);
    Object.assign(params, result.params);
    viewId = result.viewId;
  } else {
    // !!!工作流临时补充特殊处理标识, 避免补充了工作流流程匹配不上, 再从默认tag匹配!!!
    const rdTagItems = rdTag.split(':');
    const wfRdTag =
      rdTagItems.length === 2 ? rdTag : rdTagItems.slice(0, 2).join(':');
    // 拼接当前重定向视图所在应用实体名称为前缀
    const deRdTag = `${entity.name!.toUpperCase()}:${rdTag}`;
    // TODO 编辑视图重定向标识
    const editRdTag = `EDITVIEW:${rdTag}`;
    // 所有重定向引用视图
    const allRefViews = [];
    if (appView.redirectAppViewRefs) {
      allRefViews.push(...appView.redirectAppViewRefs);
    }
    if (appView.appViewRefs) {
      allRefViews.push(...appView.appViewRefs);
    }
    const refView = allRefViews.find(view => {
      const matchKey = view.name || view.id;
      // 特殊补充 wfRdTag 匹配，子流程应用特殊模式
      return (
        matchKey === deRdTag ||
        matchKey === rdTag ||
        matchKey === wfRdTag ||
        matchKey === editRdTag
      );
    });
    if (refView) {
      viewId = refView.refAppViewId!;
      // 解析关系所配置的视图上下文和视图参数
      const targetContext = refView.navigateContexts || [];
      const targetParam = refView.navigateParams || [];
      const targetContextData = convertNavData(
        targetContext,
        params,
        context,
        curData,
      );
      const targetParamData = convertNavData(
        targetParam,
        params,
        context,
        curData,
      );
      context = Object.assign(context.clone(), targetContextData);
      params = { ...params, ...targetParamData };
      if (!opts.openMode && refView.openMode) {
        opts.openMode = refView.openMode;
      }
      if (viewId) {
        return {
          type: 'view',
          viewId,
          context,
          params,
          opts: { ...opts, data: [curData] },
        };
      }
      throw new RuntimeModelError(
        refView,
        ibiz.i18n.t(
          'runtime.utils.openRedirectView.noConfiguredActualReference',
        ),
      );
    } else {
      ibiz.log.error(
        ibiz.i18n.t('runtime.utils.openRedirectView.redirectingViewReferences'),
        allRefViews?.map(({ refAppViewId, name, realTitle }) => ({
          viewId: refAppViewId,
          tag: name,
          title: realTitle,
        })),
      );
      throw new RuntimeModelError(
        appView,
        ibiz.i18n.t('runtime.utils.openRedirectView.redirectionIdentifier', {
          rdTag,
          deRdTag,
          wfRdTag,
        }),
      );
    }
  }
  if (viewId) {
    return {
      type: 'view',
      viewId,
      context,
      params,
      opts: { ...opts, data: [curData] },
    };
  }
  throw new RuntimeModelError(
    appView,
    ibiz.i18n.t('runtime.utils.openRedirectView.noMatchActualReferenceView', {
      rdTag,
    }),
  );
}

/**
 * 打开实体重定向视图
 *
 * @author chitanda
 * @date 2022-09-28 16:09:15
 * @export
 * @param {IAppDERedirectView} appView
 * @param {IContext}
 * @param {IParams} [params={}]
 * @param {IData[]} [data=[]]
 * @return {*}  {Promise<IModalData>}
 */
export async function openDERedirectView(
  appView: IAppDERedirectView,
  context: IContext,
  params: IParams = {},
  opts: IOpenViewOptions = {},
): Promise<IModalData> {
  let toView: ({ type: 'view' } & ToViewParams) | { type: 'url'; url: string };
  try {
    toView = await getDERedirectToView(appView, context, params, opts);
  } catch (error) {
    ibiz.log.error(error);
    throw error;
  }

  // 返回路径，则用window打开
  if (toView.type === 'url') {
    const openUrl = toView.url;
    return new Promise(resolve => {
      const newWindow = window.open(openUrl, '_blank');
      if (newWindow) {
        (newWindow as IData).callback = (): void => {
          resolve({ ok: true, data: [] });
        };
      }
    });
  }

  // 返回视图相关信息，则打开视图
  const result = await ibiz.commands.execute(
    OpenAppViewCommand.TAG,
    toView.viewId,
    toView.context,
    toView.params,
    toView.opts,
  );
  return result || { ok: true, data: [] };
}

/**
 * 计算重定向标识
 *
 * @author chitanda
 * @date 2022-10-25 16:10:48
 * @export
 * @param {IAppDataEntity} entity 重定向视图所在应用实体
 * @param {IAppDERedirectView} rdView 重定向视图
 * @param {string} wfStep 流程步骤
 * @param {IData} data 当前数据
 * @return {*}  {Promise<string>}
 */
export async function calcDERdTag(
  entity: IAppDataEntity,
  rdView: IAppDERedirectView,
  params: IParams,
  data: IData,
): Promise<string> {
  let rdTag = '';
  // 重定向视图自定义类别属性
  const typeFieldId = rdView.typeAppDEFieldId;
  // 自定义重定向
  if (typeFieldId) {
    const { codeName } = findFieldById(entity, typeFieldId)!;
    let value: string = data[codeName!.toLowerCase()];
    if (isNumber(value)) {
      value = `${value}`;
    }
    if (notNilEmpty(value)) {
      // 如果是 view://协议开头直接返回,示例: view://{app}/{viewcodename}?srfwftag={wftag}
      if (value.startsWith('view://')) {
        return value;
      }
      // 因为平台发布出来的标识全都是大写，所以这里也全部转大写
      return `${value.toUpperCase()}`;
    }
    ibiz.log.warn(
      ibiz.i18n.t('runtime.utils.openRedirectView.redirectionView', {
        name: rdView.name,
        typeFieldId,
      }),
      data,
    );
  }
  const defView = `${ibiz.env.isMob ? 'MOB' : ''}EDITVIEW`;
  // 如果流程步骤存在，按照工作流优先
  const srfWf = params.srfwf;
  if (notNilEmpty(srfWf)) {
    if (notNilEmpty(params.wf)) {
      return `${defView}:${srfWf.toUpperCase()}:${params.wf.toUpperCase()}`;
    }
    return `${defView}:${srfWf.toUpperCase()}`;
  }
  let typeValue = '';
  // 从索引属性获取重定向视图类型
  if (entity.indexTypeAppDEFieldId) {
    const { codeName } = findFieldById(entity, entity.indexTypeAppDEFieldId)!;
    typeValue = data[codeName!.toLowerCase()];
    if (isNumber(typeValue)) {
      typeValue = `${typeValue}`;
    }
  }
  if (isNilOrEmpty(typeValue)) {
    // 从多表单属性判断重定向视图类型
    if (entity.formTypeAppDEFieldId) {
      const { codeName } = findFieldById(entity, entity.formTypeAppDEFieldId)!;
      typeValue = data[codeName!.toLowerCase()];
      if (isNumber(typeValue)) {
        typeValue = `${typeValue}`;
      }
    }
  }
  if (notNilEmpty(typeValue)) {
    rdTag = `${defView}:${typeValue.toString().toUpperCase()}`;
  } else {
    rdTag = `${defView}`;
  }
  return rdTag;
}
