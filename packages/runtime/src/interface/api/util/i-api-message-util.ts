/**
 * @description 消息提示参数接口
 * @export
 * @interface IApiMessageParams
 */
export interface IApiMessageParams {
  /**
   * @description 类型（默认info）
   * @type {('success' | 'info' | 'warning' | 'error')}
   * @memberof IApiMessageParams
   */
  type?: 'success' | 'info' | 'warning' | 'error';
  /**
   * @description 消息内容
   * @type {string}
   * @memberof IApiMessageParams
   */
  message: string;

  /**
   * @description 持续时间，单位：秒，默认：1.5
   * @type {number}
   * @memberof IApiMessageParams
   */
  duration?: number;

  /**
   * @description 显示关闭按钮，默认：false
   * @type {boolean}
   * @memberof IApiMessageParams
   */
  showClose?: boolean;

  /**
   * @description 预置的样式类型
   * @type {'alert'}
   * @memberof IApiMessageParams
   */
  styleType?: 'alert';
}

/**
 * @description 主动操作后的反馈提示，顶部居中显示，并自动消失
 * @export
 * @interface IApiMessageUtil
 */
export interface IApiMessageUtil {
  /**
   * @description 弹出普通消息
   * @param {string} msg 消息内容
   * @param {number} [duration] 持续时间，单位：秒，默认：1.5
   * @param {boolean} [closable] 显示关闭按钮，默认：false
   * @memberof IApiMessageUtil
   */
  info(msg: string, duration?: number, closable?: boolean): void;

  /**
   * @description 弹出成功消息
   * @param {string} msg 消息内容
   * @param {number} [duration] 持续时间，单位：秒，默认：1.5
   * @param {boolean} [closable] 显示关闭按钮，默认：false
   * @memberof IApiMessageUtil
   */
  success(msg: string, duration?: number, closable?: boolean): void;

  /**
   * @description 弹出警告消息
   * @param {string} msg 消息内容
   * @param {number} [duration] 持续时间，单位：秒，默认：1.5
   * @param {boolean} [closable] 显示关闭按钮，默认：false
   * @memberof IApiMessageUtil
   */
  warning(msg: string, duration?: number, closable?: boolean): void;
  /**
   * @description 弹出错误消息
   * @param {string} msg 消息内容
   * @param {number} [duration] 持续时间，单位：秒，默认：1.5
   * @param {boolean} [closable] 显示关闭按钮，默认：false
   * @memberof IApiMessageUtil
   */
  error(msg: string, duration?: number, closable?: boolean): void;
  /**
   * @description 通用消息方法
   * @param {IApiMessageParams} params 配置详细的参数，详情参见：https://element-plus.org/zh-CN/component/message.html#message-%E9%85%8D%E7%BD%AE%E9%A1%B9
   * @memberof IApiMessageUtil
   */
  notice(params: IApiMessageParams): void;
}
