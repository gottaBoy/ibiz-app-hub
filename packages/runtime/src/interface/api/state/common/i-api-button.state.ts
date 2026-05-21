/* eslint-disable @typescript-eslint/no-explicit-any */

import { IApiContext, IApiData } from '@ibiz-template/core';

/**
 * @description 按钮UI状态
 * @export
 * @interface IApiButtonState
 */
export interface IApiButtonState {
  /**
   * @description 是否禁用
   * @type {boolean}
   * @memberof IApiButtonState
   */
  disabled: boolean;

  /**
   * @description 显示与否
   * @type {boolean}
   * @memberof IApiButtonState
   */
  visible: boolean;

  /**
   * @description 是否显示loading状态
   * @type {boolean}
   * @memberof IApiButtonState
   */
  loading: boolean;

  /**
   * @description 按钮的唯一标识
   * @type {string}
   * @memberof IApiButtonState
   */
  name: string;

  /**
   * @description 更新自身状态
   * @param {IApiContext} context 上下文
   * @param {IApiData} [data] 实体数据
   * @param {string} [appDeId] 实体标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiButtonState
   */
  update(
    context: IApiContext,
    data?: IApiData,
    appDeId?: string,
  ): Promise<void>;
}
