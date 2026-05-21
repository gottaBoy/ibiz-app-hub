import { IApiErrorHandlerCenter, IErrorHandler } from '../../interface';

/**
 * 事件处理工具
 *
 * @author lxm
 * @date 2022-09-21 18:09:31
 * @export
 * @class ErrorHandler
 * @implements {IApiErrorHandlerCenter}
 */
export class ErrorHandlerCenter implements IApiErrorHandlerCenter {
  /**
   * 处理器集合
   * @author lxm
   * @date 2023-09-26 04:56:29
   * @type {IErrorHandler[]}
   */
  protected handlers: IErrorHandler[] = [];

  /**
   * 注册处理器（后注册的优先级更高）
   * @author lxm
   * @date 2023-09-26 04:59:06
   * @param {IErrorHandler} handler
   */
  register(handler: IErrorHandler): void {
    this.handlers.unshift(handler);
  }

  /**
   * 处理单个报错
   * @author lxm
   * @date 2023-09-26 05:18:18
   * @protected
   * @param {unknown} error
   */
  protected handleSingle(error: unknown): void {
    const find = this.handlers.find(item => {
      return !!item.handle(error);
    });
    if (!find) {
      ibiz.log.error(
        ibiz.i18n.t('runtime.utils.errorHandler.noProcessor'),
        error,
      );
    }
  }

  /**
   * 按顺序检测处理器，最先满足条件的处理该异常
   * @author lxm
   * @date 2023-09-26 05:01:08
   * @param {unknown} error
   */
  handle(error: unknown): void {
    if (error instanceof Array) {
      error.forEach(item => {
        this.handleSingle(item);
      });
    } else {
      this.handleSingle(error);
    }
  }
}
