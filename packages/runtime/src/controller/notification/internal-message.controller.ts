import {
  IInternalMessage,
  IPortalMessage,
  Namespace,
} from '@ibiz-template/core';
import { QXEvent } from 'qx-util';
import {
  IInternalMessageController,
  IInternalMessageEvent,
  IInternalMessageProvider,
} from '../../interface';
import { InternalMessageService } from '../../service';

function isHTML(str: string): boolean {
  if (str === '') return false;
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
}

export class InternalMessageController implements IInternalMessageController {
  readonly evt: QXEvent<IInternalMessageEvent> = new QXEvent();

  total: number = 0;

  unreadCount: number = 0;

  /**
   * 当前分页
   * @author lxm
   * @date 2024-01-26 10:06:28
   * @type {number}
   */
  page: number = 0;

  size: number = 20;

  messages: IInternalMessage[] = [];

  unreadOnly = false;

  protected service = new InternalMessageService();

  ns: Namespace | null = null;

  provider: IInternalMessageProvider | null = null;

  async init(): Promise<void> {
    this.listenMqtt();
    await this.refreshUnreadCount();
  }

  async load(): Promise<void> {
    try {
      await this.fetch(false);
    } catch (error) {
      ibiz.log.error(error);
    }
  }

  async loadMore(): Promise<void> {
    await this.fetch(true);
  }

  async refreshUnreadCount(): Promise<void> {
    try {
      this.unreadCount = await this.service.getUnreadNum();
      this.evt.emit('unreadCountChange', this.unreadCount);
    } catch (error) {
      ibiz.log.error(error);
    }
  }

  /**
   * 切换是否只读
   * @author lxm
   * @date 2024-02-04 10:21:22
   * @param {val} [boolean] 是否只读
   */
  toggleUnReadOnly(val?: boolean): void {
    const nextVal = val === undefined ? !this.unreadOnly : val;
    if (this.unreadOnly === nextVal) {
      return;
    }
    this.unreadOnly = nextVal;
    this.evt.emit('unreadOnlyChange', this.unreadOnly);
    this.load();
  }

  protected async fetch(loadMore: boolean = false): Promise<void> {
    // *计算查询参数
    if (loadMore === false) {
      this.page = 0;
    } else {
      this.page += 1;
    }

    const fetchParams: IParams = {
      page: this.page,
      size: this.size,
      sort: 'timestamp,desc',
      searchconds: [
        {
          condtype: 'GROUP',
          condop: 'AND',
          bnotmode: false,
          searchconds: [],
        },
      ],
    };
    // 不是门户应用只查询当前系统数据
    if (!ibiz.env.isPortalApp) {
      fetchParams.searchconds[0].searchconds.push({
        condop: 'EQ',
        condtype: 'DEFIELD',
        fieldname: 'system_id',
        value: ibiz.appData?.context.srfsystemid,
      });
    }
    // 是否只搜索未读
    if (this.unreadOnly) {
      fetchParams.searchconds[0].searchconds.push({
        condop: 'EQ',
        condtype: 'DEFIELD',
        fieldname: 'status',
        value: 'RECEIVED',
      });
    }

    const res = await this.service.fetch(fetchParams);
    this.total = res.total!;

    if (loadMore) {
      this.messages.push(...res.data);
    } else {
      this.messages = res.data;
    }

    this.evt.emit('dataChange');
  }

  /**
   * 监听mqtt消息
   * @author lxm
   * @date 2024-01-30 01:53:44
   * @protected
   */
  protected listenMqtt(): void {
    ibiz.mc.command.internalMessage.on(async (msg: IPortalMessage) => {
      ibiz.log.debug('mqtt internalMessage: ', msg);
      if (msg.subtype !== 'INTERNALMESSAGE') {
        return;
      }

      // todo 目前会有一种情况，不带data，弹右下角消息提示
      if (msg.content) {
        // todo 目前工作流中todo对象字符串传递回来，界面显示，临时排除，待后续完善
        let isExclude: boolean = false;
        try {
          const contentObj = JSON.parse(msg.content);
          if (
            Object.prototype.toString.call(contentObj) === '[object Object]'
          ) {
            ibiz.log.error(`接收站内信数据不合法,接收数据：${msg.content}`);
            isExclude = true;
          }
          // eslint-disable-next-line no-empty
        } catch (error) {}

        if (!isExclude) {
          ibiz.notification.default({
            isHtmlDesc: isHTML(msg.content),
            desc: msg.content,
            position: 'bottom-right',
            class: this.ns?.b('notice'),
            onClick: () => {
              const redirectUrl = ibiz.env.isMob ? msg.mobileurl : msg.url;
              if (this.provider) {
                this.provider.openViewByUrl(redirectUrl);
              }
            },
          });
        }
      }

      this.refreshUnreadCount();
    });
  }

  async markRead(message: IInternalMessage): Promise<void> {
    const find = this.messages.find(msg => msg.id === message.id);
    if (!find || find.status !== 'RECEIVED') {
      return;
    }

    await this.service.markRead(message.id);
    find.status = 'READ';
    this.unreadCount -= 1;
    this.evt.emit('unreadCountChange', this.unreadCount);
    // 查询未读的消息时，标记信息已读需刷新数据
    if (this.unreadOnly) {
      this.load();
    } else {
      this.evt.emit('dataChange');
    }
  }

  /**
   * 把所有未读消息标记为已读
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-02-21 15:38:25
   */
  async batchMarkRead(): Promise<void> {
    await this.service.batchMarkRead();
    await this.fetch();
    this.unreadCount = 0;
    this.evt.emit('unreadCountChange', this.unreadCount);
  }

  /**
   * 获取完整信息
   * @author lxm
   * @date 2024-01-30 05:03:25
   * @param {string} id
   * @return {*}  {Promise<IInternalMessage>}
   */
  async get(id: string): Promise<IInternalMessage> {
    const res = await this.service.get(id);
    return res.data;
  }
}
