import { IAppCodeList } from '@ibiz/model-core';
import { IApiContext, IApiParams } from '@ibiz-template/core';
import { CodeListItem } from './code-list-item/code-list-item';

/**
 * @description 代码表服务接口
 * @export
 * @interface IApiCodeListService
 */
export interface IApiCodeListService {
  /**
   * @description 获取代码表模型
   * @param {string} tag 代码表标识
   * @returns {*}  {(IAppCodeList | undefined)}
   * @memberof IApiCodeListService
   */
  getCodeList(tag: string): IAppCodeList | undefined;

  /**
   * @description 获取指定代码表所有代码表项
   * @param {string} tag 代码表标识
   * @param {IApiContext} context 应用上下文
   * @param {IApiParams} [params] 视图参数
   * @returns {*}  {Promise<readonly}
   * @memberof IApiCodeListService
   */
  get(
    tag: string,
    context: IApiContext,
    params?: IApiParams,
  ): Promise<readonly CodeListItem[]>;

  /**
   * @description 获取指定代码表指定值对应的代码表项
   * @param {string} tag 代码表标识
   * @param {(string | number)} value 代码项值
   * @param {IApiContext} context 应用上下文
   * @param {IApiParams} [params] 视图参数
   * @returns {*}  {Promise<CodeListItem | undefined>}
   * @memberof IApiCodeListService
   */
  getItem(
    tag: string,
    value: string | number,
    context: IApiContext,
    params?: IApiParams,
  ): Promise<CodeListItem | undefined>;
}
