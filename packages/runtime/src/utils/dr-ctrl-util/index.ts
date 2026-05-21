import { IAppDERS } from '@ibiz/model-core';
import { execDELogicAction } from '../../de-logic';
import {
  IDRBarItemsState,
  IDRTabPagesState,
  ISearchCondField,
} from '../../interface';
import { calcDeCodeNameById, findDELogic } from '../../model';
import { AppCounter } from '../../service';
import { ScriptFactory } from '../script';
import { ValueOP } from '../../constant';

/**
 * 根据计数器数据，计算项显示状态
 *
 * @author zhanghengfeng
 * @date 2024-05-16 19:05:55
 * @export
 * @param {(IDRBarItemsState | IDRTabPagesState)} item
 * @param {AppCounter} [counter]
 * @return {*}  {(boolean | undefined)}
 */
export function calcItemVisibleByCounter(
  item: IDRBarItemsState | IDRTabPagesState,
  counter?: AppCounter,
): boolean | undefined {
  const { enableMode, counterId } = item;
  if (!counter || !counterId) {
    return;
  }
  if (enableMode === 'COUNT_GTE_ZERO') {
    if (counter.getCounter(counterId) >= 0) {
      return true;
    }
    return false;
  }
  if (enableMode === 'COUNT_GT_ZERO') {
    if (counter.getCounter(counterId) > 0) {
      return true;
    }
    return false;
  }
}

/**
 * 根据启用模式，计算项显示状态
 *
 * @author zhanghengfeng
 * @date 2024-05-16 19:05:46
 * @export
 * @param {(IDRBarItemsState | IDRTabPagesState)} item
 * @param {IContext} context
 * @param {IParams} params
 * @param {string} appDeId
 * @param {string} appId
 * @param {IData} [data]
 * @return {*}  {(Promise<boolean | undefined>)}
 */
export async function calcItemVisible(
  item: IDRBarItemsState | IDRTabPagesState,
  context: IContext,
  params: IParams,
  appDeId: string,
  appId: string,
  data?: IData,
): Promise<boolean | undefined> {
  const { enableMode, dataAccessAction, testAppDELogicId, testScriptCode } =
    item;
  if (enableMode === 'DEOPPRIV' && dataAccessAction) {
    const app = ibiz.hub.getApp(context.srfappid);
    const result = await app.authority.calcByDataAccessAction(
      dataAccessAction,
      context,
      data,
      appDeId,
    );
    return !!result;
  }
  if (enableMode === 'DELOGIC' && testAppDELogicId && appDeId && appId) {
    const entityModel = await ibiz.hub.getAppDataEntity(appDeId, appId);
    const deLogic = findDELogic(testAppDELogicId, entityModel);
    if (deLogic) {
      const result = await execDELogicAction(deLogic, context, data, params);
      return !!result.data;
    }
  }
  if (enableMode === 'SCRIPT' && testScriptCode) {
    const result = ScriptFactory.execScriptFn(
      {
        data,
        context,
        params,
      },
      testScriptCode,
      {
        isAsync: false,
        singleRowReturn: true,
      },
    );
    return !!result;
  }
}

/**
 * 获取指定实体数据的主实体数据
 *
 * @export
 * @param {IData} data
 * @param {string} appDataEntityId
 * @param {IContext} context
 * @return {*}  {Promise<IData>}
 */
export async function getDeDataMajorField(
  data: IData,
  context: IContext,
  appDataEntityId: string,
): Promise<IData> {
  const majorData: IData = {};
  const appDe = await ibiz.hub.getAppDataEntity(
    appDataEntityId,
    context.srfappid,
  );
  if (appDe && appDe.minorAppDERSs && appDe.minorAppDERSs.length > 0) {
    appDe.minorAppDERSs?.forEach((minorAppDERS: IAppDERS) => {
      if (
        minorAppDERS.majorAppDataEntityId &&
        minorAppDERS.parentAppDEFieldId
      ) {
        const majorAppDataEntityCodeName = calcDeCodeNameById(
          minorAppDERS.majorAppDataEntityId!,
        );
        if (
          majorAppDataEntityCodeName &&
          data[minorAppDERS.parentAppDEFieldId]
        ) {
          majorData[majorAppDataEntityCodeName] =
            data[minorAppDERS.parentAppDEFieldId];
        }
      }
    });
  }
  return majorData;
}

/**
 * 将对象格式的查询参数转换为结构化的搜索条件数组
 *
 * @export
 * @param {IParams} _params
 * @return {*}  {ISearchCondField[]}
 *
 * @example
 * 转换规则：
 * 1. 仅处理键以'N_'开头且包含有效操作符后缀的参数
 * 2. 从键中提取字段名（去除'N_'前缀和操作符后缀）
 * 3. 仅当参数值不为null、undefined或空字符串时才生成条件
 *
 * 示例：
 * 输入：{n_age_gt: 18, n_name_like: '慧', invalidKey: 'value'}
 * 输出：[
 *   {condtype: 'DEFIELD', fieldname: 'age', value: 18, condop: 'GT'},
 *   {condtype: 'DEFIELD', fieldname: 'name', value: '慧', condop: 'LIKE'}
 * ]
 */
export function paramsToSearchconds(_params: IParams): ISearchCondField[] {
  const valueOPs: string[] = [];
  for (const key in ValueOP) {
    if (key !== ValueOP.EXISTS && key !== ValueOP.NOT_EXISTS) {
      const value = ValueOP[key as keyof typeof ValueOP];
      valueOPs.push(value);
    }
  }
  const conds: ISearchCondField[] = [];
  Object.keys(_params).forEach(_key => {
    const value = _params[_key];
    const tempKey = _key.toLocaleUpperCase();
    let fieldname = '';

    // 检查键是否以'N_'开头
    const condop = valueOPs.find(filter => tempKey.endsWith(`_${filter}`));
    if (tempKey.startsWith('N_') && condop) {
      // 去除'N_'前缀与条件后缀
      fieldname = _key.slice(2).slice(0, -`_${condop}`.length);
    }
    const isValue = value !== null && value !== undefined && value !== '';
    if (fieldname && isValue && condop)
      conds.push({
        condtype: 'DEFIELD',
        fieldname,
        value,
        condop: condop.toLocaleUpperCase() as ValueOP,
      });
  });
  return conds;
}
