import { notNilEmpty } from 'qx-util';
import { RuntimeError } from '@ibiz-template/core';
import qs from 'qs';
import { RouteLocationNormalizedLoaded as Route, useRoute } from 'vue-router';
import { watch } from 'vue';
import {
  calcDeCodeNameById,
  getMatchResPath,
  IViewConfig,
  RouteConst,
  ViewType,
} from '@ibiz-template/runtime';
import { isNil, isNotNil } from 'ramda';
import { IRoutePath, IRoutePathNode, IRouteViewData } from '../../interface';

/**
 * 路径字符串转换成路由路径对象
 *
 * @author lxm
 * @date 2022-08-18 11:08:08
 * @export
 * @param {string} pathStr 以/开头的路径，即router的path
 * @param {boolean} [isRouteModal=false]
 * @returns {*}  {IRoutePath}
 */
export function route2routePath(
  route: Route,
  isRouteModal: boolean = false,
): IRoutePath {
  // 一共匹配了几级路由
  const depth = route.matched.length;

  let path = route.path;
  if (isRouteModal) {
    path = path.replace(new RegExp(`/${RouteConst.ROUTE_MODAL_TAG}`, 'g'), '');
  }
  const items = path.split('/');

  // 解析路径节点
  const pathNodes: IRoutePathNode[] = [];
  for (let index = 1; index <= depth; index++) {
    const viewName = items[index * 2];
    const paramsStr = route.params[`params${index}`] as string;

    /** 路由参数，默认是视图参数 */
    let params: IParams | undefined;

    /** 上下文参数 */
    let context: IParams | undefined;
    let srfnav: string | undefined;
    // params为占位符时置空
    if (!paramsStr || paramsStr === ibiz.env.routePlaceholder) {
      params = undefined;
    } else {
      // 首页上下文要解析
      params = qs.parse(paramsStr, {
        strictNullHandling: true,
        delimiter: ';',
        depth: 8,
      });
    }

    // 路由参数存在的时候，解析里面的上下文。
    if (params) {
      if (index === 1) {
        // 首页的时候，路由上的参数是资源路径，属于上下文
        context = params;
        params = undefined;
      } else {
        if (params.srfnavctx) {
          // 解析额外上下文,这儿不需要使用decodeURIComponent解码，因为前面调用qs.parse时，内部已经做过解码处理，如果再次执行decodeURIComponent解码，数据里面有中文字符可能会报错
          context = JSON.parse(params.srfnavctx);
          delete params.srfnavctx;
        }
        if (params.srfnav) {
          // 解析额外自身视图导航参数
          srfnav = params.srfnav;
          delete params.srfnav;
        }
      }
    }

    pathNodes.push({ viewName, context, params, srfnav });
  }

  // 解析应用上下文
  let appContext;
  if (
    route.params.appContext &&
    route.params.appContext !== ibiz.env.routePlaceholder
  ) {
    appContext = qs.parse(route.params.appContext as string, {
      strictNullHandling: true,
      delimiter: ';',
    });
  }

  return { appContext, pathNodes };
}

/**
 * 路由路径对象转路径字符串
 *
 * @author lxm
 * @date 2022-08-18 13:08:57
 * @export
 * @param {IRoutePath} routePath 路由路径对象
 * @returns {*}  {string}
 */
export function routePath2string(routePath: IRoutePath): string {
  let pathStr = '';
  // 应用上下文
  if (routePath.appContext) {
    pathStr += `/${qs.stringify(routePath.appContext, {
      delimiter: ';',
      strictNullHandling: true,
    })}`;
  } else {
    pathStr += `/${ibiz.env.routePlaceholder}`;
  }

  // 每一层级的视图路由的拼装
  routePath.pathNodes.forEach((pathNode: IRoutePathNode, index: number) => {
    pathStr += `/${pathNode.viewName}/`;
    let routeParams: IParams = {};
    // 首页路由
    if (index === 0) {
      if (notNilEmpty(pathNode.context)) {
        // 对象转成a=11;b=222的格式，字符串直接附加在后面
        routeParams = pathNode.context!;
      }
    } else {
      // 非首页路由,视图参数直接放到路由参数上，上下文转换后放到路由参数的srfnavctx上
      routeParams = notNilEmpty(pathNode.params) ? pathNode.params! : {};

      // 合并视图上下文
      if (notNilEmpty(pathNode.context)) {
        const objStr = JSON.stringify(pathNode.context);
        // undefined 的vlaue会被JSON.stringify删除,可能会转成{}
        if (objStr !== '{}') {
          routeParams!.srfnavctx = encodeURIComponent(objStr);
        }
      }

      // 合并视图导航参数
      if (pathNode.srfnav) {
        routeParams.srfnav = pathNode.srfnav;
      }
    }

    const paramsStr = qs.stringify(routeParams, {
      delimiter: ';',
      strictNullHandling: true,
      skipNulls: true,
    });
    // 把路由参数转换到路由路径上去
    if (notNilEmpty(paramsStr)) {
      pathStr += paramsStr;
    } else {
      pathStr += ibiz.env.routePlaceholder;
    }
  });

  return pathStr;
}

/**
 * 获取自身的路由上下文，排除了部分不需要路由携带的参数
 *
 * @author lxm
 * @date 2023-03-14 02:07:41
 * @export
 * @param {IContext} context
 * @returns {*}  {IParams}
 */
export function getOwnRouteContext(context: IContext): IParams {
  const ownContext = context.getOwnContext();
  const excludeKeys = [
    'srfsessionid',
    'srfappid',
    'currentSrfNav',
    'toRouteDepth',
  ];
  // 附加路由透传参数(显示声明在路由上),与导航占位自定义参数映射,多个值用|分隔
  if (ownContext.attributekeys) {
    const attributeKeys = ownContext.attributekeys.split('|');
    if (attributeKeys && attributeKeys.length > 0) {
      attributeKeys.forEach((key: string) => {
        if (isNotNil(context[key])) {
          ownContext[key] = context[key];
        }
      });
    }
    delete ownContext.attributekeys;
  }
  // 附加路由保留空值参数,目前全局通知有使用
  let srfKeepNull: boolean = false;
  if (Object.prototype.hasOwnProperty.call(ownContext, 'srfkeepnull')) {
    srfKeepNull =
      ownContext.srfkeepnull === true || ownContext.srfkeepnull === 'true';
    delete ownContext.srfkeepnull;
  }
  Object.keys(ownContext).forEach(key => {
    if (excludeKeys.includes(key) || (!srfKeepNull && isNil(ownContext[key]))) {
      delete ownContext[key];
    }
  });
  return ownContext;
}

/**
 * 附加预置参数
 *
 * @author tony001
 * @date 2024-05-19 16:05:02
 * @param {IContext} context
 * @param {IRoutePathNode[]} pathNodes
 */
function attachPresetParams(
  context: IContext,
  pathNodes: IRoutePathNode[],
): void {
  // 处理预置参数srfreadonly,设置上下文srfreadonly参数
  // 祖先存在srfreadonly=true则不需处理；如果都没有，当前父环境srfreadonly=true，则需给当前环境设置srfreadonly=true
  let index = -1;
  if (pathNodes && pathNodes.length > 0) {
    index = pathNodes.findIndex(pathNode => {
      return pathNode.context?.srfreadonly === true;
    });
  }
  if (
    context.srfreadonly &&
    !context.getOwnContext().srfreadonly &&
    index === -1
  ) {
    context.srfreadonly = true;
  }
}

/**
 * 计算资源上下文时，需要排除自身实体codeName的视图（导航类视图和多数据视图）
 * @return {*}
 * @author: zhujiamin
 * @Date: 2023-02-20 15:45:46
 */
export const excludeViewTypes: string[] = [
  ViewType.DE_GRID_VIEW,
  ViewType.DE_GRID_EXP_VIEW,
  ViewType.DE_LIST_VIEW,
  ViewType.DE_LIST_EXP_VIEW,
  ViewType.DE_DATA_VIEW,
  ViewType.DE_DATAVIEW_EXP_VIEW,
  ViewType.DE_CALENDAR_VIEW,
  ViewType.DE_CALENDAR_EXP_VIEW,
  ViewType.DE_CHART_VIEW,
  ViewType.DE_CHART_EXP_VIEW,
  ViewType.DE_KANBAN_VIEW,
];

/**
 * 计算资源路径,把首页后面的资源路径上下文算出来，并把第二层中对应的上下文删掉。
 * @author lxm
 * @date 2023-07-13 06:37:10
 * @export
 * @param {IRoutePath} routePath
 * @param {IContext} context
 * @param {string} appDataEntityId
 * @return {*}  {Promise<void>}
 */
export async function calcResRoutePath(
  routePath: IRoutePath,
  context: IContext,
  appDataEntityId?: string,
  appId?: string,
): Promise<void> {
  if (!appDataEntityId) {
    // 无实体的视图清空资源上下文
    routePath.pathNodes[0].context = undefined;
  } else {
    const entity = await ibiz.hub.getAppDataEntity(appDataEntityId, appId);
    let match = getMatchResPath(context, entity);
    // 有实体有没有匹配到的，补一个包含自身实体主键的match
    if (!match) {
      match = { path: '', keys: [entity.codeName!.toLowerCase()] };
    }
    if (match) {
      const currentContext = routePath.pathNodes[1].context;
      const resContext: IParams = {};
      // 资源路径不为空,二级视图的上下文删掉多余的资源上下文
      match.keys.forEach(key => {
        if (context && Object.prototype.hasOwnProperty.call(context, key)) {
          resContext[key] = context[key];
          if (currentContext) {
            delete currentContext[key];
          }
        }
      });
      // 把资源路径填充到一级路由上
      routePath.pathNodes[0].context = resContext;
    }
  }
}

/**
 * 生成route路径
 *
 * @author lxm
 * @date 2022-08-17 21:08:00
 * @export
 * @param {IAppView} appView 视图模型
 * @param {Route} route 路由对象
 * @param {IContext} [context] 上下文对象
 * @param {(IParams | undefined)} [params] 视图参数
 * @returns {*}  {string}
 */
export async function generateRoutePath(
  appView: IViewConfig,
  route: Route,
  context: IContext,
  params?: IParams,
): Promise<{ path: string }> {
  const routePath = route2routePath(route);
  // 如果上下文存在toRouteDepth时，使用上下文的层级，否则使用默认层级
  let depth = context.srfdefaulttoroutedepth || 2; // 默认层级看上下文的srfdefaulttoroutedepth，如果没有就是2
  if (context.toRouteDepth) {
    depth = context.toRouteDepth;
    // 使用完后转为undefined，避免添加到上下文里
    context.toRouteDepth = undefined;
  } else if (ibiz.env.isMob) {
    // 移动端默认补充home层级
    if (ibiz.env.mobMenuShowMode === 'DEFAULT') {
      routePath.pathNodes[0] = {
        viewName: 'home',
      };
    }
  }

  let srfmenuitem = params?.srfmenuitem;
  if (!srfmenuitem && routePath.pathNodes.length > 1) {
    srfmenuitem = routePath.pathNodes[1].params?.srfmenuitem;
  }

  // 删除目标层级和之后的路由，保留之前层级的路由
  routePath.pathNodes.splice(depth - 1, routePath.pathNodes.length - depth + 1);

  // 导航视图的导航参数,加在目标层级之前的一个层级的视图参数里
  if (context.currentSrfNav) {
    const currentNode = routePath.pathNodes[routePath.pathNodes.length - 1];
    currentNode.params = currentNode.params || {};
    currentNode.srfnav = context.currentSrfNav;
    // 使用完后转为undefined，避免添加到上下文里
    context.currentSrfNav = undefined;
  }

  // 附加当前环境上下文的srfreadonly
  attachPresetParams(context, routePath.pathNodes);

  // 重定向视图跳转的一级首页路由
  if (route.fullPath.startsWith('/appredirectview')) {
    if (params?.srfindexname) {
      routePath.pathNodes[0].viewName = params.srfindexname;
      delete params.srfindexname;
    } else {
      routePath.pathNodes[0].viewName = 'index';
    }
  }

  // 计算目标视图path路径
  routePath.pathNodes.push({
    viewName: appView.codeName!.toLowerCase(),
    context: getOwnRouteContext(context),
    params,
  });

  // 计算二级视图的资源路径加到index后面
  if (depth === 2) {
    await calcResRoutePath(
      routePath,
      context,
      appView.appDataEntityId,
      appView.appId,
    );

    // 多数据和导航视图，删除自身的主键上下文
    if (excludeViewTypes.includes(appView.viewType)) {
      const deName = calcDeCodeNameById(appView.appDataEntityId!);
      delete routePath.pathNodes[0].context![deName];
    }
  }

  if (srfmenuitem && routePath.pathNodes.length > 1) {
    const tempParams = routePath.pathNodes[1].params || {};
    routePath.pathNodes[1].params = { ...tempParams, srfmenuitem };
  }

  return { path: routePath2string(routePath) };
}

/**
 * 生成route路径
 *
 * @author lxm
 * @date 2022-08-17 21:08:00
 * @export
 * @param {IAppView} appView 视图模型
 * @param {Route} route 路由对象
 * @param {IContext} [context] 上下文对象
 * @param {(IParams | undefined)} [params] 视图参数
 * @returns {*}  {string}
 */
export async function generateRoutePathByModal(
  appView: IViewConfig,
  route: Route,
  context: IContext,
  params?: IParams,
): Promise<{ path: string }> {
  const routePath = route2routePath(route);

  // 特殊处理 RouteConst.ROUTE_MODAL_TAG，因为只能有一级避免多次或重复点击，导致路由计算错误。再次点击时把之前的modal路由删除
  const findIndex = routePath.pathNodes.findIndex(
    item => item.viewName === RouteConst.ROUTE_MODAL_TAG,
  );

  if (findIndex !== -1) {
    routePath.pathNodes = routePath.pathNodes.slice(0, findIndex);
  }

  // 导航视图的导航参数,加在目标层级之前的一个层级的视图参数里
  if (context.currentSrfNav) {
    const currentNode = routePath.pathNodes[routePath.pathNodes.length - 1];
    currentNode.params = currentNode.params || {};
    currentNode.srfnav = context.currentSrfNav;
    // 使用完后转为undefined，避免添加到上下文里
    context.currentSrfNav = undefined;
  }

  // 附加当前环境上下文的srfreadonly
  attachPresetParams(context, routePath.pathNodes);

  // 计算目标视图path路径
  routePath.pathNodes.push({
    viewName: `${
      RouteConst.ROUTE_MODAL_TAG
    }/${appView.codeName!.toLowerCase()}`,
    context: getOwnRouteContext(context),
    params,
  });

  return { path: routePath2string(routePath) };
}

/**
 * 解析路由获取对应视图数据
 *
 * @author lxm
 * @date 2022-08-17 22:08:51
 * @export
 * @param {Route} route 路由对象
 * @param {number} depth 层级
 * @param {boolean} [isRouteModal=false]
 * @returns {*}  {IRouteViewData}
 */
export async function parseRouteViewData(
  route: Route,
  depth: number,
  isRouteModal: boolean = false,
): Promise<IRouteViewData> {
  // 解析路由的视图参数
  const routePath = route2routePath(route, isRouteModal);

  // 获取对应层级的视图名称参数
  let viewCodeName = routePath.pathNodes[depth - 1].viewName;
  if (!viewCodeName) {
    throw new RuntimeError(
      ibiz.i18n.t('vue3Util.util.viewIdentifiers', { depth }),
    );
  }
  if (viewCodeName === RouteConst.ROUTE_MODAL_TAG) {
    viewCodeName = routePath.pathNodes[depth].viewName;
  }
  if (viewCodeName === 'index') {
    viewCodeName = ibiz.hub.defaultAppIndexViewName;
  }

  // 根据路由视图名称参数查询视图模型
  const viewConfig = await ibiz.hub.config.view.get(viewCodeName);

  // 找不到视图模型的返回空对象
  if (!viewConfig) {
    throw new RuntimeError(
      ibiz.i18n.t('vue3Util.util.noFoundView', { viewCodeName }),
    );
  }

  // !解析上下文参数,整合当前层级之前所有的上下文参数
  const context: IParams = {};
  // 合并appData里的应用上下文
  if (ibiz.appData?.context) {
    Object.assign(context, ibiz.appData.context);
  }

  // 合并路由上下文
  // 合并路由应用上下文
  if (routePath.appContext) {
    Object.assign(context, routePath.appContext);
  }

  // 逐层合并视图上下文,第一层首页不合，它的上下文是资源路径属于子视图。
  if (depth !== 1) {
    for (let index = 0; index < depth; index++) {
      const pathNode = routePath.pathNodes[index];
      if (notNilEmpty(pathNode.context)) {
        Object.assign(context, pathNode.context);
      }
      // 预置处理srfnavctrlid参数防止上一条，下一条数据异常
      // 自身路由节点上没有srfnavctrlid，则当前路由上下文就不应有
      if (
        index === depth - 1 &&
        (!pathNode.context || isNil(pathNode.context.srfnavctrlid))
      ) {
        delete context.srfnavctrlid;
      }
    }
  }

  // 最后一级路由对应的视图才会解析视图参数
  const { params, srfnav } = routePath.pathNodes[depth - 1];

  return {
    viewConfig,
    context,
    params,
    srfnav,
  };
}

/**
 * 获取指定层级的路由路径
 * @author lxm
 * @date 2023-06-21 06:08:32
 * @export
 * @param {Route} route
 * @param {number} depth
 * @return {*}  {string}
 */
export function getNestedRoutePath(
  route: Route,
  depth: number,
  noSrfNav: boolean = true,
): string {
  // 当前路由层级低于指定层级的返回空
  if (route.matched.length < depth) {
    return '';
  }

  // 只有当前层级的路由的代名称的路由如login，404等直接返回path
  if (route.matched.length === depth && route.name) {
    return route.path;
  }
  const routePath = route2routePath(route);
  if (routePath.pathNodes.length < depth) {
    // 当前路由层级比指定层级少时，直接返回空字符串
    return route.path;
  }
  if (routePath.pathNodes.length > depth) {
    // 删除depth后面的节点
    routePath.pathNodes = routePath.pathNodes.slice(0, depth);
  }
  const pathNode = routePath.pathNodes[depth - 1];
  if (noSrfNav) {
    // 删除至nav
    delete pathNode.srfnav;
  }
  if (pathNode.context) {
    delete pathNode.context.srfnavctrlid;
  }
  return routePath2string(routePath);
}

/**
 * 监听路由的变更，每次变更后都会触发回调
 * 回调函数提供根据视图层级计算好的唯一标识currentKey，只有变了视图才需要刷新
 * @author lxm
 * @date 2023-05-09 12:52:36
 * @param {(args: { currentKey: string; fullPath: string }) => void} callback
 * @param {number} depth
 */
export function onRouteChange(
  callback: (args: { currentKey: string; fullPath: string }) => void,
  depth: number,
): void {
  const route = useRoute();
  if (!route) {
    throw new RuntimeError(ibiz.i18n.t('vue3Util.util.routeCorrectly'));
  }
  watch(
    // fix: odoo脚本触发路径query变更未触发路由变更事件
    () => route?.fullPath,
    () => {
      const currentKey = getNestedRoutePath(route, depth);
      callback({ currentKey, fullPath: route.fullPath });
    },
    { immediate: true },
  );
}
