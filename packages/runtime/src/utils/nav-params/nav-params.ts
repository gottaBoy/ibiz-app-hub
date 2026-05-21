import { INavigateParam } from '@ibiz/model-core';
import { isEmpty, isNil } from 'lodash-es';
import { isNilOrEmpty, notNilEmpty, createUUID } from 'qx-util';

/**
 * 把对象格式的导航参数转换成数组格式的导航参数
 * @author lxm
 * @date 2023-07-10 03:33:14
 * @export
 * @param {IData} navParams
 * @return {*}  {IPSNavigateParam[]}
 */
export function convertObjectToNavParams(navParams: IData): INavigateParam[] {
  const result: INavigateParam[] = [];
  const reg = /^%(.+)%$/;
  // eslint-disable-next-line guard-for-in
  for (const key in navParams) {
    let rawValue = true;
    let value = navParams[key];
    if (notNilEmpty(navParams[key]) && reg.test(navParams[key])) {
      rawValue = false;
      value = navParams[key].substring(1, navParams[key].length - 1);
    }
    result.push({
      key: key.toLowerCase(),
      rawValue,
      value,
    } as INavigateParam);
  }

  return result;
}

/**
 * 转换导航数据(如导航上下文，导航视图参数)
 * - 把%xxx%,转换成origins元素里对应叫xxx的值
 * - 按顺序查找origins的元素，且只要有xxx的属性就算找到，不管值是否为空。
 * - naviData里{a:%xxx%}，origins里找不到xxx则返回值里不存在a属性
 * - naviData里%a.b.c%,origins里找到origins.a.b.c,没找到则不做处理
 * - naviData里非%xxx%形式的，都当成直接值原样返回，包括空值。
 *
 * @author lxm
 * @date 2022-08-22 11:08:18
 * @export
 * @param {INavigateParam[]} navParams 导航参数
 * @param {...IData[]} origins 转换数据来源集合
 */
export function convertNavData(
  navParams: INavigateParam[] | IData | undefined | null,
  ...origins: IData[]
): IData {
  // 如果导航参数不存在或者为空对象，返回{}
  if (!navParams || isEmpty(navParams)) {
    return {};
  }

  // 把对象形式的导航参数转换成INavigateParam[]形式
  const navParamsArr: INavigateParam[] = Array.isArray(navParams)
    ? navParams
    : convertObjectToNavParams(navParams as IData);

  return convertNavDataByArray(navParamsArr, ...origins);
}

/**
 * 从origins每个元素里找到对应属性key的值
 * 如果都找不到抛异常。
 * @author lxm
 * @date 2023-09-13 11:38:43
 * @param {IData[]} origins 来源数据集合
 * @param {string} key 属性标识
 * @return {*}  {{ find: boolean; value: unknown }} 返回find是否找到值，value为找到的值，可以是空值
 */
function getVal(
  origins: IData[],
  key: string,
): { find: boolean; value: unknown } {
  // 特殊识别srfcurtime
  if (key === 'srfcurtime') {
    return {
      find: true,
      value: new Date().getTime(),
    };
  }
  // 特殊识别srfuniqueid
  if (key === 'srfuniqueid') {
    return {
      find: true,
      value: createUUID(),
    };
  }
  const keys = key.split('.');
  let currentVal: IData | undefined;
  // 找到origins里第一个有该属性的的项
  const findOrigin = origins.find(item => {
    if (isNilOrEmpty(item)) {
      return false;
    }
    // 处理%a.b.c%的情况
    if (keys.length > 1) {
      currentVal = item;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (
          currentVal &&
          (currentVal[k] ||
            Object.prototype.hasOwnProperty.call(currentVal, k!))
        ) {
          currentVal = currentVal[k];
        } else {
          currentVal = undefined;
          break;
        }
      }
      return currentVal !== undefined;
    }
    return (
      // proxy数据判断是否能拿到值
      item[key!] ||
      // 上下文等判断是否有这个属性，如果有且值为空，则赋该空值
      Object.prototype.hasOwnProperty.call(item, key!)
    );
  });
  return {
    find: !!findOrigin,
    value: keys.length > 1 ? currentVal : findOrigin?.[key],
  };
}

/**
 * 通过模型中的导航数组 转换导航数据(如导航上下文，导航视图参数)
 * - 把%xxx%,转换成origins元素里对应叫xxx的值
 * - 按顺序查找origins的元素，且只要有xxx的属性就算找到，不管值是否为空。
 * - naviData里{a:%xxx%}，origins里找不到xxx则返回值里不存在a属性
 * - naviData里%a.b.c%,origins里找到origins.a.b.c,没找到则不做处理
 * - naviData里非%xxx%形式的，都当成直接值原样返回，包括空值。
 *
 * @author lxm
 * @date 2022-08-22 11:08:18
 * @export
 * @param {INavigateParam[]} naviDatas 导航参数
 * @param {...IData[]} origins 转换数据来源集合
 */
export function convertNavDataByArray(
  naviDatas: INavigateParam[],
  ...origins: IData[]
): IData {
  const regex = /\$\{[^}]*\}/g; // 匹配${xxx}格式字符串
  const result: IData = {};
  for (const naviData of naviDatas) {
    if (!naviData.rawValue) {
      const matchArr = naviData.value!.match(regex);
      if (matchArr !== null) {
        // 有${xxx}的找每一个xxx的值，替换原始字符串里的值，最后赋值处理过的字符串
        let valueStr = naviData.value!;
        matchArr.forEach(key => {
          // 没有${xxx}
          const { find, value } = getVal(
            origins,
            // 去掉${}，适配平台模型转小写取值
            key.slice(2, -1).toLowerCase(),
          );
          if (find) {
            valueStr = valueStr.replace(key, `${isNil(value) ? '' : value}`);
          }
        });
        result[naviData.key!.toLowerCase()] = valueStr;
      } else {
        // 没有${xxx}，适配平台模型转小写取值
        const { find, value } = getVal(origins, naviData.value!.toLowerCase());
        if (find) {
          result[naviData.key!.toLowerCase()] = value;
        }
      }
    } else {
      // 直接值，空值时赋null
      result[naviData.key!.toLowerCase()] = naviData.value || null;
    }
  }
  return result;
}

/**
 * 根据导航参数把多条数据转换成单条数据，用 , 分隔
 * @author lxm
 * @date 2023-07-10 04:31:30
 * @export
 * @param {(IPSNavigateParam[] | IData | undefined | null)} navParams
 * @param {IData[]} dataArr
 * @return {*}  {IData}
 */
export function formatMultiData(
  navParams: INavigateParam[] | IData | undefined | null,
  dataArr: IData[],
): IData {
  const result: IData = {};
  if (!navParams) {
    return result;
  }
  const naviArr: INavigateParam[] = Array.isArray(navParams)
    ? navParams
    : convertObjectToNavParams(navParams as IData);

  const data1 = dataArr[0];
  naviArr.forEach(naviParam => {
    const { rawValue, value } = naviParam;
    // 非直接且取值的属性是数据的属性时，把多条数据的值合并到一起，用 , 分隔
    if (
      !rawValue &&
      value &&
      Object.prototype.hasOwnProperty.call(data1, value)
    ) {
      result[value] = dataArr.map(item => item[value]).join(',');
    }
  });
  return result;
}

/**
 * @description 解析url对象查询参数，防止浏览器不支持解析URL
 * @export
 * @param {string} search
 * @return {*}  {IData}
 */
export function parseSearchParams(search: string): IData {
  const result: IData = {};
  if (search.startsWith('?')) {
    search = search.substring(1);
  }
  const pairs: string[] = search.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const [key, value] = pairs[i].split('=');
    result[key] = value;
  }
  return result;
}
