import { IApiData } from '@ibiz-template/core';

export interface IApiJsonRepairOption {
  /**
   * @description 是否返回对象
   * @type {boolean}
   * @memberof IApiJsonRepairOption
   */
  returnObjects?: boolean;

  /**
   * @description 是否跳过JSON.parse检查
   * @type {boolean}
   * @memberof IApiJsonRepairOption
   */
  skipJsonParse?: boolean;

  /**
   * @description 是否返回修复日志
   * @type {boolean}
   * @memberof IApiJsonRepairOption
   */
  logging?: boolean;

  /**
   * @description 是否保留Unicode字符
   * @type {boolean}
   * @memberof IApiJsonRepairOption
   */
  ensureAscii?: boolean;
}

export interface IApiJsonRepairResult {
  /**
   * @description 是否解析成功
   * @type {boolean}
   * @memberof IApiJsonRepairResult
   */
  success: boolean;

  /**
   * @description json数据
   * @type {(IApiData | IApiData[] | undefined)}
   * @memberof IApiJsonRepairResult
   */
  data: IApiData | IApiData[] | undefined;

  /**
   * @description 数据类型
   * @type {('jsonobject' | 'jsonarray' | 'unknown')}
   * @memberof IApiJsonRepairResult
   */
  data_type: 'jsonobject' | 'jsonarray' | 'unknown';

  /**
   * @description 解析信息
   * @type {string}
   * @memberof IApiJsonRepairResult
   */
  message: string;
}

/**
 * @description JSON工具类
 */
export interface IApiJsonUtil {
  /**
   * @description json修复，用于提取大语言模型中的json数据
   * @param {string} value json字符串
   * @param {IApiJsonRepairOption} [options] 修复配置
   * @returns {*}  {(IApiData | IApiData[] | string)}
   * @memberof IApiJsonUtil
   */
  repairJson(
    value: string,
    options?: IApiJsonRepairOption,
  ): IApiData | IApiData[] | string;

  /**
   * @description 加载字符串中的JSON数据，直接返回json数据对象
   * @param {string} value json字符串
   * @param {IApiJsonRepairOption} [options] 修复配置
   * @returns {*}  {IApiData | IApiData[]}
   * @memberof IApiJsonUtil
   */
  loads(value: string, options?: IApiJsonRepairOption): IApiData | IApiData[];

  /**
   * @description 判断是否为json对象
   * @param {*} value 待判断值
   * @returns {boolean}
   * @memberof IApiJsonUtil
   */
  isJsonObject(value: unknown): boolean;

  /**
   * @description 检测是否为json数组
   * @param {*} value 待检测值
   * @returns {boolean}
   * @memberof IApiJsonUtil
   */
  isJsonArray(value: unknown): boolean;

  /**
   * @description 解析字符串中的json数据，用于获取大语言模型中的json数据
   * @param {string} value json字符串
   * @param {IApiJsonRepairOption} [options] 修复配置
   * @returns {*}  {IApiJsonRepairResult}
   * @memberof IApiJsonUtil
   */
  parseJson(
    value: string,
    options?: IApiJsonRepairOption,
  ): IApiJsonRepairResult;
}
