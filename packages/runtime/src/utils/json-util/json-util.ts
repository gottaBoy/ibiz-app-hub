import { isNil } from 'ramda';
import {
  IApiJsonRepairOption,
  IApiJsonRepairResult,
  IApiJsonUtil,
} from '../../interface';
import { loads, repairJson } from './json-repair';

export class JsonUtil implements IApiJsonUtil {
  /**
   * @description json修复，用于提取大语言模型中的json数据
   * @param {string} value
   * @param {IApiJsonRepairOption} [options={}]
   * @returns {*}  {(IData | IData[] | string)}
   * @memberof JsonUtil
   */
  repairJson(
    value: string,
    options: IApiJsonRepairOption = {},
  ): IData | IData[] | string {
    return repairJson(value, options);
  }

  /**
   * @description 加载字符串中的JSON数据，直接返回json数据对象
   * @param {string} value
   * @param {IApiJsonRepairOption} [options={}]
   * @returns {*}  {(IData | IData[])}
   * @memberof JsonUtil
   */
  loads(value: string, options: IApiJsonRepairOption = {}): IData | IData[] {
    return loads(value, options);
  }

  /**
   * @description 判断给定的值是否为 JSON 对象
   * @param value
   * @returns boolean
   */
  isJsonObject(value: unknown): boolean {
    // 必须是 object 类型，不为 null，并且不是数组
    if (typeof value !== 'object' || isNil(value) || Array.isArray(value)) {
      return false;
    }
    // 排除常见的非纯对象类型，如 Date, RegExp, Function, DOM Element 等
    if (value.constructor && value.constructor !== Object) {
      return false;
    }
    return true;
  }

  /**
   * @description 判断给定的值是否为 JSON 数组
   * @param value
   * @returns boolean
   */
  isJsonArray(value: unknown): boolean {
    // 1. 检查是否为 null 或 undefined
    if (isNil(value)) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.every(item => this.isJsonObject(item));
    }
    return false;
  }

  /**
   * @description json修复，用于提取大语言模型中的json数据
   * @param {string} value
   * @param {IApiJsonRepairOption} [options={}]
   * @returns {*}  {IApiJsonRepairResult}
   * @memberof JsonUtil
   */
  parseJson(
    value: string,
    options: IApiJsonRepairOption = {},
  ): IApiJsonRepairResult {
    const data = loads(value, options);
    if (data) {
      let success: boolean = true;
      const type = Array.isArray(data) ? 'jsonarray' : 'jsonobject';
      if (type === 'jsonobject') {
        success = this.isJsonObject(data);
      } else if (type === 'jsonarray') {
        success = this.isJsonArray(data);
      }
      return {
        success,
        data: success ? data : undefined,
        data_type: success ? type : 'unknown',
        message: success
          ? ibiz.i18n.t('runtime.utils.jsonUtil.parseSuccess')
          : ibiz.i18n.t('runtime.utils.jsonUtil.parseError'),
      };
    }
    return {
      success: false,
      data: undefined,
      data_type: 'unknown',
      message: ibiz.i18n.t('runtime.utils.jsonUtil.parseError'),
    };
  }
}
