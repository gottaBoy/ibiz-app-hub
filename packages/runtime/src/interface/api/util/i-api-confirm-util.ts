import { IApiParams } from '@ibiz-template/core';

/**
 * @description 确认框参数
 * @export
 * @interface IApiConfirmParams
 */
export interface IApiConfirmParams {
  /**
   * @description 标题
   * @type {string}
   * @memberof IApiConfirmParams
   */
  title: string;
  /**
   * @description 描述
   * @type {string}
   * @memberof IApiConfirmParams
   */
  desc?: string;

  /**
   * @description 传递额外参数，详情参见：https://element-plus.org/zh-CN/component/message-box.html#%E9%85%8D%E7%BD%AE%E9%A1%B9
   * @type {IApiParams}
   * @memberof IApiConfirmParams
   */
  options?: IApiParams;
}

/**
 * @description 确认消息，提示用户确认其已经触发的动作，并询问是否进行此操作时会用到此对话框。
 * @export
 * @interface IApiConfirmUtil
 */
export interface IApiConfirmUtil {
  /**
   * @description 弹出普通信息
   * @param {IApiConfirmParams} params 确认框参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiConfirmUtil
   */
  info(params: IApiConfirmParams): Promise<boolean>;
  /**
   * @description 弹出成功信息
   * @param {IApiConfirmParams} params 确认框参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiConfirmUtil
   */
  success(params: IApiConfirmParams): Promise<boolean>;
  /**
   * @description 弹出警告信息
   * @param {IApiConfirmParams} params 确认框参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiConfirmUtil
   */
  warning(params: IApiConfirmParams): Promise<boolean>;
  /**
   * @description 弹出错误信息
   * @param {IApiConfirmParams} params 确认框参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiConfirmUtil
   */
  error(params: IApiConfirmParams): Promise<boolean>;
}
