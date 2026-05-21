import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IApiGlobalWaterMarkConfig } from '../common';

/**
 * @description 水印工具类
 * @export
 * @interface IApiWaterMarkUtil
 */
export interface IApiWaterMarkUtil {
  /**
   * @description 挂载水印至指定元素上
   * @param {Partial<IApiGlobalWaterMarkConfig>} option 水印参数
   * @param {HTMLElement} [container] 指定html元素,无值则附加到body上
   * @param {IApiContext} [context] 上下文参数
   * @param {IApiParams} [params] 视图参数
   * @param {IApiData} [data] 视图数据
   * @returns {*}  {(null | (() => void))}
   * @memberof IApiWaterMarkUtil
   */
  mount(
    option: Partial<IApiGlobalWaterMarkConfig>,
    container?: HTMLElement,
    context?: IApiContext,
    params?: IApiParams,
    data?: IApiData,
  ): null | (() => void);
}
