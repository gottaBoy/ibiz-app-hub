import { IApiData } from '../../../global-param';
import { IMessageBase } from '../base';
import { IPortalMessage } from '../common';
import { ICommandAddInChanged } from './add-in-changed/i-command-add-in-changed';
import { ICommandAsyncAction } from './async-action/i-command-async-action';
import { ICommandChange } from './change/i-command-change';
import { ICommandCreate } from './create/i-command-create';
import { ICommandInternalMessage } from './internal-message/i-command-internal-message';
import { ICommandMarkOpenData } from './mark-open-data/i-command-mark-open-data';
import { ICommandRemove } from './remove/i-command-remove';
import { ICommandUpdate } from './update/i-command-update';

/**
 * @description 指令消息控制器
 * @export
 * @interface IMessageCommand
 * @extends {IMessageBase}
 */
export interface IMessageCommand extends IMessageBase {
  /**
   * @description 数据变更指令消息控制器
   * @type {ICommandChange}
   * @memberof IMessageCommand
   */
  readonly change: ICommandChange;

  /**
   * @description 数据新建指令消息控制器
   * @type {ICommandCreate}
   * @memberof IMessageCommand
   */
  readonly create: ICommandCreate;

  /**
   * @description 数据更新指令消息控制器
   * @type {ICommandUpdate}
   * @memberof IMessageCommand
   */
  readonly update: ICommandUpdate;

  /**
   * @description 数据删除指令消息控制器
   * @type {ICommandRemove}
   * @memberof IMessageCommand
   */
  readonly remove: ICommandRemove;
  /**
   * @description 异步作业指令消息控制器
   * @type {ICommandAsyncAction}
   * @memberof IMessageCommand
   */
  readonly asyncAction: ICommandAsyncAction;

  /**
   * @description 内部消息指令消息控制器
   * @type {ICommandInternalMessage}
   * @memberof IMessageCommand
   */
  readonly internalMessage: ICommandInternalMessage;

  /**
   * @description 协同指令消息控制器
   * @type {ICommandMarkOpenData}
   * @memberof IMessageCommand
   */
  readonly markOpenData: ICommandMarkOpenData;

  /**
   * @description 添加变更指令消息控制器
   * @type {ICommandAddInChanged}
   * @memberof IMessageCommand
   */
  readonly addInChanged: ICommandAddInChanged;

  /**
   * @description 推送指令消息
   * @param {IPortalMessage} msg 消息
   * @memberof IMessageCommand
   */
  next(msg: IPortalMessage): void;

  /**
   * @description 发送指令消息
   * @param {IApiData} data 数据
   * @param {IPortalMessage['subtype']} subtype 子类型
   * @param {string} [triggerKey] 触发源
   * @memberof IMessageCommand
   */
  send(
    data: IApiData,
    subtype: IPortalMessage['subtype'],
    triggerKey?: string,
  ): void;
}
