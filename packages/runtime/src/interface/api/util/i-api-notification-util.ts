/* eslint-disable prettier/prettier */
/**
 * @description 全局通知参数
 * @export
 * @interface IApiNotificationParams
 */
export interface IApiNotificationParams {
  /**
   * @description 标题
   * @type {string}
   * @memberof IApiNotificationParams
   */
  title?: string;
  /**
   * @description 描述
   * @type {string}
   * @memberof IApiNotificationParams
   */
  desc?: string;
  /**
   * @description 描述是否是html字符串
   * @type {boolean}
   * @memberof IApiNotificationParams
   */
  isHtmlDesc?: boolean;
  /**
   * @description 自动关闭的延时，单位秒，不关闭可以写 0
   * @type {number}
   * @memberof IApiNotificationParams
   */
  duration?: number;
  /**
   * @description 位置
   * @type {('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')}
   * @memberof IApiNotificationParams
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /**
   * @description 自定义类名
   * @type {string}
   * @memberof IApiNotificationParams
   */
  class?: string;
  /**
   * @description 点击事件回调
   * @memberof IApiNotificationParams
   */
  onClick?: () => void;
}

/**
 * @description 悬浮出现在界面右上角，显示全局的通知
 * @export
 * @interface IApiNotificationUtil
 */
export interface IApiNotificationUtil {
  /**
   * @description 弹出默认通知
   * @param {IApiNotificationParams} params 通知参数
   * @memberof IApiNotificationUtil
   */
  default(params: IApiNotificationParams): void;
  /**
   * @description 弹出普通通知
   * @param {IApiNotificationParams} params 通知参数
   * @memberof IApiNotificationUtil
   */
  info(params: IApiNotificationParams): void;
  /**
   * @description 弹出成功通知
   * @param {IApiNotificationParams} params 通知参数
   * @memberof IApiNotificationUtil
   */
  success(params: IApiNotificationParams): void;
  /**
   * @description 弹出警告通知
   * @param {IApiNotificationParams} params 通知参数
   * @memberof IApiNotificationUtil
   */
  warning(params: IApiNotificationParams): void;
  /**
   * @description 弹出失败通知
   * @param {IApiNotificationParams} params 通知参数
   * @memberof IApiNotificationUtil
   */
  error(params: IApiNotificationParams): void;
}
