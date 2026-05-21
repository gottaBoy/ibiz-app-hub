import { QXEvent } from 'qx-util';
import { IPortalAsyncAction, IPortalMessage } from '@ibiz-template/core';
import { clone } from 'ramda';
import { isNil, isNumber } from 'lodash-es';
import dayjs from 'dayjs';
import { AsyncActionService } from '../../service';
import { IAsyncActionController, IAsyncActionEvent } from '../../interface';

export class AsyncActionController implements IAsyncActionController {
  readonly evt: QXEvent<IAsyncActionEvent> = new QXEvent();

  total: number = 0;

  actions: IPortalAsyncAction[] = [];

  /**
   * 正在处理中的数量
   * @author lxm
   * @date 2024-01-25 04:51:18
   * @type {number}
   */
  doingNum: number = 0;

  /**
   * 结束的状态值集合
   * @author lxm
   * @date 2024-01-25 05:08:26
   * @protected
   */
  protected finishedStates = [30, 40];

  /**
   * 请求服务
   * @author lxm
   * @date 2024-01-25 04:50:12
   * @protected
   */
  protected service = new AsyncActionService();

  async init(): Promise<void> {
    this.listenMessage();
  }

  /**
   * 监听全局的实时消息
   * @author lxm
   * @date 2024-01-25 04:47:36
   */
  protected listenMessage(): void {
    ibiz.mc.command.asyncAction.on(async (msg: IPortalMessage) => {
      if (!msg.data || msg.subtype !== 'ASYNCACTION') {
        return;
      }
      // 异步交谈补全操作拦截,不做异步消息通用处理
      if (
        (msg.data as IPortalAsyncAction).actiontype &&
        (msg.data as IPortalAsyncAction).actiontype === 'ASYNCCHATCOMPLETION'
      ) {
        return;
      }

      const asyncAction = this.formatAsyncAction(
        msg.data as IPortalAsyncAction,
      );

      const findIndex = this.actions.findIndex(
        item => item.asyncacitonid === asyncAction.asyncacitonid,
      );

      if (findIndex === -1) {
        this.add(asyncAction);
      } else {
        this.update(asyncAction);
      }
    });
  }

  /**
   * 格式化数据
   * @author lxm
   * @date 2024-01-25 05:03:47
   * @protected
   * @param {IPortalAsyncAction} data
   * @return {*}  {IPortalAsyncAction}
   */
  protected formatAsyncAction(data: IPortalAsyncAction): IPortalAsyncAction {
    // 处理时间日期为毫秒值时，转换成字符串。
    const dateFields = [
      'begintime',
      'endtime',
      'createdate',
      'updatedate',
    ] as const;
    dateFields.forEach(key => {
      if (isNumber(data[key])) {
        data[key] = dayjs(data[key]).format('YYYY-MM-DD HH:mm:ss');
      }
    });

    if (!isNil(data.actionresult)) {
      try {
        const json = JSON.parse(data.actionresult as string);
        data.actionresult = json;
      } catch (error) {
        // 不是对象类型就是字符串。
      }
    }

    if (!isNil(data.completionrate)) {
      const num = Number(data.completionrate);
      if (Number.isNaN(num)) {
        data.completionrate = undefined;
      } else {
        data.completionrate = num;
      }
    }

    return data;
  }

  /**
   * 添加一条新消息
   * @author lxm
   * @date 2024-01-25 04:58:37
   * @protected
   * @param {IPortalAsyncAction} action
   */
  protected add(action: IPortalAsyncAction): void {
    this.actions.unshift(action);

    // 非结束状态的消息加一
    if (!this.finishedStates.includes(action.actionstate)) {
      this.doingNum += 1;
      if (ibiz.config.common.enableAsyncActionNotice) {
        ibiz.notice.showDoingNotice({ num: this.doingNum });
      }
    } else {
      this.noticeResult(action);
    }
    this.evt.emit('add', clone(action));
    this.evt.emit('dataChange');
  }

  /**
   * 添加一条新消息
   * @author lxm
   * @date 2024-01-25 04:58:37
   * @protected
   * @param {IPortalAsyncAction} action
   */
  protected update(action: IPortalAsyncAction): void {
    const index = this.actions.findIndex(
      item => item.asyncacitonid === action.asyncacitonid,
    );
    this.actions.splice(index, 1, action);

    // 执行结束的减一
    if (this.finishedStates.includes(action.actionstate)) {
      this.doingNum -= 1;
      if (this.doingNum <= 0) {
        if (ibiz.config.common.enableAsyncActionNotice) {
          ibiz.notice.closeDoingNotice();
        }
      }
      this.noticeResult(action);
    }
    this.evt.emit('change', clone(action));
    this.evt.emit('dataChange');
  }

  protected noticeResult(action: IPortalAsyncAction): void {
    if (ibiz.config.common.enableAsyncActionNotice) {
      ibiz.notice.showAsyncAction(action);
    }
  }
}
