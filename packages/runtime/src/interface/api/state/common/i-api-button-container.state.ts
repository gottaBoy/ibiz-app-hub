/* eslint-disable @typescript-eslint/no-explicit-any */

import { IApiContext, IApiData } from '@ibiz-template/core';

/**
 * @description 按钮容器的状态
 * @export
 * @interface IApiButtonContainerState
 */
export interface IApiButtonContainerState {
  /**
   * @description 是否显示
   * @type {boolean}
   * @memberof IApiButtonContainerState
   */
  visible: boolean;

  /**
   * @description 是否禁用
   * @type {boolean}
   * @memberof IApiButtonContainerState
   */
  disabled: boolean;

  /**
   * @description 设置当前执行的按钮
   * @param {string} name
   * @memberof IApiButtonContainerState
   */
  setLoading(name: string): void;

  /**
   * @description 更新子的状态
   * @param {IApiContext} context 上下文
   * @param {IApiData} [data] 实体数据
   * @param {string} [appDeId] 实体标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiButtonContainerState
   */
  update(
    context: IApiContext,
    data?: IApiData,
    appDeId?: string,
  ): Promise<void>;

  [p: string]: any;
}
