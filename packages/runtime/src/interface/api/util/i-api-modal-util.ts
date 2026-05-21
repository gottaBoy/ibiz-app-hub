import { IApiParams } from '@ibiz-template/core';

/**
 * @description 简洁确认框参数
 * @export
 * @interface IApiModalParams
 */
export interface IApiModalParams {
  /**
   * @description 标题
   * @type {string}
   * @memberof IApiModalParams
   */
  title: string;
  /**
   * @description 描述
   * @type {string}
   * @memberof IApiModalParams
   */
  desc?: string;
  /**
   * @description 显示确认按钮（默认显示）
   * @type {boolean}
   * @memberof IApiModalParams
   */
  showConfirmButton?: boolean;

  /**
   * @description 是否显示取消按钮
   * @type {boolean}
   * @memberof IApiModalParams
   */
  showCancelButton?: boolean;

  /**
   * @description 确认按钮显示文本
   * @type {string}
   * @memberof IApiModalParams
   */
  confirmButtonText?: string;

  /**
   * @description 取消按钮显示文本
   * @type {string}
   * @memberof IApiModalParams
   */
  cancelButtonText?: string;

  /**
   * @description 消息类型
   * @type {('success' | 'info' | 'warning' | 'error')}
   * @memberof IApiModalParams
   */
  type?: 'success' | 'info' | 'warning' | 'error';

  /**
   * @description 传递额外参数，详情参见：https://element-plus.org/zh-CN/component/message-box.html#%E9%85%8D%E7%BD%AE%E9%A1%B9
   * @type {IApiParams}
   * @memberof IApiModalParams
   */
  options?: IApiParams;
}

/**
 * @description 消息提示，当用户进行操作时会被触发，该对话框中断用户操作，直到用户确认知晓后才可关闭。
 * @export
 * @interface IApiModalUtil
 */
export interface IApiModalUtil {
  /**
   * @description 弹出普通信息
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiModalUtil
   */
  info(params: IApiModalParams): Promise<void>;
  /**
   * @description 弹出成功信息
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiModalUtil
   */
  success(params: IApiModalParams): Promise<void>;
  /**
   * @description 弹出警告信息
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiModalUtil
   */
  warning(params: IApiModalParams): Promise<void>;
  /**
   * @description 弹出错误信息
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiModalUtil
   */
  error(params: IApiModalParams): Promise<void>;
  /**
   * @description 弹出确认操作
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiModalUtil
   */
  confirm(params: IApiModalParams): Promise<boolean>;
  /**
   * @description 弹出确认操作，返回确认结果（yes | no | cancel）
   * @param {IApiModalParams} params 确认框参数
   * @returns {*}  {(Promise<'yes' | 'no' | 'cancel'>)}
   * @memberof IApiModalUtil
   */
  extendConfirm(params: IApiModalParams): Promise<'yes' | 'no' | 'cancel'>;
}
