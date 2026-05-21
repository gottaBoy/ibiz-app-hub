/**
 * @description 错误处理器接口
 * @export
 * @interface IApiErrorHandler
 */
export interface IApiErrorHandler {
  /**
   * @description 处理错误，如果处理了该异常则返回true，后续的处理器就不会处理该异常
   * @param {unknown} error 错误
   * @returns {*}  {(boolean | undefined)}
   * @memberof IApiErrorHandler
   */
  handle(error: unknown): boolean | undefined;
}
