import { IPortalAsyncAction } from '../../common';
import { ICommandBase } from '../i-command-base';

/**
 * @description 异步作业指令消息控制器
 * @export
 * @interface ICommandAsyncAction
 * @extends {ICommandBase}
 */
export interface ICommandAsyncAction extends ICommandBase {
  /**
   * @description 发送消息
   * @param {IPortalAsyncAction} data 异步作业数据
   * @memberof ICommandAsyncAction
   */
  send(data: IPortalAsyncAction): void;
}
