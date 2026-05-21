/* eslint-disable array-callback-return */
import {
  IDBPortletPart,
  IDEDQCondition,
  IDEDQCustomCondition,
  IDEDQFieldCondition,
  IDEDQGroupCondition,
} from '@ibiz/model-core';
import { clone } from 'ramda';
import {
  IDashboardController,
  ISearchCondEx,
  ISearchCondExCustom,
  ISearchCondExField,
  ISearchCondExGroup,
} from '../../../interface';
import { ValueOP } from '../../../constant';

/**
 * 过滤器条件转化为查询条件
 *
 * @author tony001
 * @date 2024-07-28 13:07:37
 * @export
 * @param {IDEDQCondition[]} filterDEDQConditions
 * @return {*}  {ISearchCondEx[]}
 */
export function filterDEDQConditions2SearchConds(
  filterDEDQConditions: IDEDQCondition[],
): ISearchCondEx[] {
  const result: ISearchCondEx[] = [];
  filterDEDQConditions.forEach((filterDEDQCondition: IDEDQCondition) => {
    if (filterDEDQCondition.condType === 'GROUP') {
      // 分组
      const temp: ISearchCondExGroup = {
        condop: filterDEDQCondition.condOp as 'AND' | 'OR',
        condtype: 'GROUP',
      };
      const { dedqconditions, notMode } =
        filterDEDQCondition as IDEDQGroupCondition;
      if (dedqconditions && dedqconditions.length > 0) {
        temp.searchconds = filterDEDQConditions2SearchConds(dedqconditions);
      }
      result.push(temp);
      if (notMode) {
        temp.notmode = notMode;
      }
    } else if (filterDEDQCondition.condType === 'SINGLE') {
      // 属性
      const { condOp, condValue, fieldName } =
        filterDEDQCondition as IDEDQFieldCondition;
      const temp: ISearchCondExField = {
        condtype: 'DEFIELD',
        fieldname: fieldName!.toLowerCase(),
        value: condValue,
        condop: condOp! as ValueOP,
      };
      result.push(temp);
    } else if (filterDEDQCondition.condType === 'CUSTOM') {
      // 自定义条件
      const { condition, customType } =
        filterDEDQCondition as IDEDQCustomCondition;
      const temp: ISearchCondExCustom = {
        condtype: 'CUSTOM',
        customtype: customType!,
        customcond: condition!,
      };
      result.push(temp);
    }
  });
  return result;
}

/**
 * 生成缓存key
 *
 * @author tony001
 * @date 2024-07-28 13:07:15
 * @export
 * @param {IContext} context
 * @param {IDashboardController} dashboard
 * @param {string} key
 * @return {*}  {string}
 */
export function generateCacheKy(
  context: IContext,
  dashboard: IDashboardController,
  key: string,
): string {
  return `${context.srfappid}@${context.srfuserid}@${dashboard.getTopView().model.id}@${key}`;
}

/**
 * 获取过滤器搜索参数
 *
 * @author tony001
 * @date 2024-07-28 13:07:26
 * @export
 * @param {(IData | undefined)} searchConds
 * @param {(IDEDQCondition[] | undefined)} filterDEDQConditions
 * @return {*}  {(ISearchCondEx | undefined)}
 */
export function getFilterSearchConds(
  searchConds: IData | undefined,
  filterDEDQConditions: IDEDQCondition[] | undefined,
): ISearchCondEx | undefined {
  let result: ISearchCondEx | undefined;
  // 存在自定义条件时，以自定义条件为准；若无自定义条件，则以过滤器自带的默认过滤参数为准
  if (searchConds) {
    result = clone(searchConds) as ISearchCondEx;
  } else if (filterDEDQConditions) {
    result = { condop: 'AND', condtype: 'GROUP', searchconds: [] };
    const modelSearchConds =
      filterDEDQConditions2SearchConds(filterDEDQConditions);
    if (modelSearchConds && modelSearchConds.length > 0) {
      (result as ISearchCondExGroup).searchconds!.push(...modelSearchConds);
    }
  }
  return result;
}

/**
 * 通过id获取指定门户部件模型,先从传入模型中找，找不到从应用中找
 *
 * @author tony001
 * @date 2024-08-01 16:08:14
 * @export
 * @param {string} id
 * @param {IContext} context
 * @param {(IData[] | undefined)} models
 * @return {*}  {(IModel | undefined)}
 */
export function getPortletModelByID(
  id: string,
  context: IContext,
  models: IData[] | undefined,
): IModel | undefined {
  let target = models?.find(model => {
    return model.portletCodeName === id;
  });
  if (target && target.portletModel) {
    return target.portletModel;
  }
  const app = ibiz.hub.getApp(context.srfappid);
  const appPortlets = app.model.appPortlets || [];
  target = appPortlets.find(portlet => portlet.id === id);
  if (target && target.control) {
    return target.control;
  }
}

/**
 * 通过过滤器门户部件标识过滤生效门户部件
 *
 * @author tony001
 * @date 2024-08-01 11:08:36
 * @export
 * @param {string} id
 * @param {IContext} context
 * @param {IDBPortletPart[]} items
 * @param {boolean} [biMode=false]
 * @return {*}  {IDBPortletPart[]}
 */
export function filterPortletByID(
  id: string,
  context: IContext,
  items: IDBPortletPart[],
  biMode: boolean = false,
): IDBPortletPart[] {
  let result: IDBPortletPart[] = [];
  const filterGroupMap = new Map();
  const app = ibiz.hub.getApp(context.srfappid);
  const appPortlets = app.model.appPortlets || [];
  const filtePortlet = appPortlets.find(x => x.id === id);
  if (filtePortlet) {
    const filtergroup = filtePortlet.portletParams?.filtergroup;
    if (!filtergroup) {
      return items;
    }
    items.forEach((item: IDBPortletPart) => {
      const porlet = appPortlets.find(x => x.id === item.codeName);
      if (porlet && porlet.portletParams && porlet.portletParams.filtergroup) {
        filterGroupMap.set(item.codeName!, porlet.portletParams.filtergroup);
      }
    });
    // bi模式基于报表的cube标识过滤，非bi模式基于门户部件配置的filtergroup控件参数过滤
    if (biMode) {
      result = items.filter((item: IDBPortletPart) => {
        const controls: IData[] = item.controls || [];
        if (controls.length > 0 && controls[0].appDEReport) {
          const { appBIReport } = controls[0].appDEReport;
          return (
            `${appBIReport.appBISchemeId}.${appBIReport.appBICubeId}`.toLowerCase() ===
            filtergroup.toLowerCase()
          );
        }
      });
    } else {
      result = items.filter((item: IDBPortletPart) => {
        if (filterGroupMap.has(item.codeName!)) {
          const filterTag = filterGroupMap.get(item.codeName!)!;
          return filtergroup.toLowerCase() === filterTag.toLowerCase();
        }
      });
    }
  }
  return result;
}

/**
 * 基于scope和scopedata过滤门户部件
 *
 * @author tony001
 * @date 2024-08-01 14:08:14
 * @export
 * @param {IData} config
 * @param {string[]} items
 * @return {*}  {string[]}
 */
export function filterPortletByConfig(
  config: IData,
  items: string[],
): string[] {
  let effectivePortlets: string[] = [];
  const { scope, scopedata } = config || {};
  if (!scope || (scope && scope === 'all')) {
    effectivePortlets = items;
  } else if (scope && scope === 'custom' && scopedata) {
    const keys = scopedata.split(',');
    effectivePortlets = items.filter(id => keys.includes(id));
  }
  return effectivePortlets;
}

/**
 * 递归填充子门户部件的子应用标识
 * @param model
 * @param appId
 */
export function deepFillSubAppId(model: IModel, appId: string): void {
  model.appId = appId;
  const keys = Object.keys(model);
  keys.forEach(key => {
    const value = model[key];
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') {
            deepFillSubAppId(item, appId);
          }
        });
      } else {
        deepFillSubAppId(value, appId);
      }
    }
  });
}

/**
 * 递归删除子门户部件的子应用标识
 * @param model
 */
export function deepDeleteSubAppId(model: IModel): void {
  delete model.appId;
  const keys = Object.keys(model);
  keys.forEach(key => {
    const value = model[key];
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') {
            deepDeleteSubAppId(item);
          }
        });
      } else {
        deepDeleteSubAppId(value);
      }
    }
  });
}
