import { IApiErrorHandler } from '../common';

/**
 * @description 错误处理工具类
 * @export
 * @interface IApiErrorHandlerCenter
 */
export interface IApiErrorHandlerCenter {
  /**
   * @description 注册处理器（后注册的优先级更高）
   * @param {IApiErrorHandler} handler 错误处理器
   * @memberof IApiErrorHandlerCenter
   */
  register(handler: IApiErrorHandler): void;

  /**
   * @description 按顺序检测处理器，最先满足条件的处理该异常
   * @param {unknown} error
   * @memberof IApiErrorHandlerCenter
   */
  handle(error: unknown): void;
}
