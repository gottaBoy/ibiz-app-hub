import { IBizContext, IInternalMessage } from '@ibiz-template/core';
import {
  IInternalMessageProvider,
  OpenAppViewCommand,
  parseViewProtocol,
} from '@ibiz-template/runtime';
import { VNode, h } from 'vue';
import { useRouter } from 'vue-router';
import { InternalMessageDefault } from './internal-message-default';

export class InternalMessageDefaultProvider
  implements IInternalMessageProvider
{
  component: unknown = InternalMessageDefault;

  router: IData = useRouter();

  render(
    props: IData & {
      message: IInternalMessage;
    },
  ): VNode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return h(this.component as any as string, {
      provider: this,
      ...props,
    });
  }

  async onClick(
    message: IInternalMessage,
    _event: MouseEvent,
  ): Promise<boolean> {
    const redirectUrl = ibiz.env.isMob ? message.mobile_url : message.url;
    return this.openViewByUrl(redirectUrl);
  }

  /**
   * 解析url并打开对应视图，打开视图前会先标记已读
   * @author lxm
   * @date 2024-02-02 11:56:07
   * @param {IInternalMessage} msg
   * @param {string} redirectUrl
   * @return {*}  {Promise<void>}
   */
  async openRedirectView(
    msg: IInternalMessage,
    redirectUrl: string,
  ): Promise<void> {
    // 打开视图之前先标记已读
    await ibiz.hub.notice.internalMessage.markRead(msg);
    this.openViewByUrl(redirectUrl);
  }

  /**
   * 解析url并打开对应视图
   * @param {string} redirectUrl
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-03-04 11:16:40
   */
  openViewByUrl(redirectUrl: string | undefined): boolean {
    if (redirectUrl) {
      if (redirectUrl.startsWith('view://')) {
        const { viewId, context, params } = parseViewProtocol(redirectUrl);
        // 显式声明在路由计算参数时保留空值
        context.srfkeepnull = true;
        ibiz.commands.execute(
          OpenAppViewCommand.TAG,
          viewId,
          IBizContext.create(context),
          params,
        );
      } else if (redirectUrl.startsWith('route://')) {
        const routeUrl = `/${redirectUrl.split('route://')[1]}`;
        this.router.push(routeUrl);
      }
      return true;
    }

    return false;
  }
}
