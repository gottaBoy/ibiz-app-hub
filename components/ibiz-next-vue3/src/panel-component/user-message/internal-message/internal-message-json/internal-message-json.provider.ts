import { IBizContext, IInternalMessage } from '@ibiz-template/core';
import { toLocalOpenWFRedirectView } from '@ibiz-template/runtime';
import { InternalMessageJSON } from './internal-message-json';
import { InternalMessageDefaultProvider } from '../common';

export class InternalMessageJSONtProvider extends InternalMessageDefaultProvider {
  component = InternalMessageJSON;

  // 待办
  private PREKEY_WFINST: string = 'WFINST__';

  // 已完成
  private PREKEY_TODOHIS: string = 'TODOHIS__';

  // 抄送
  private PREKEY_CARBONCOPY: string = 'CARBONCOPY__';

  /**
   * 计算工作流参数
   * @param json
   * @returns
   */
  private computeWFParams(json: IData): {
    preKey: string;
    subType: string;
  } {
    switch (json.todostate) {
      case 'ACTIVE':
        return {
          preKey: '',
          subType: 'Todo',
        };
      case 'COMPLETED':
        return {
          preKey: this.PREKEY_TODOHIS,
          subType: 'Done',
        };
      default:
        return {
          preKey: '',
          subType: '',
        };
    }
  }

  async onClick(
    message: IInternalMessage,
    event: MouseEvent,
  ): Promise<boolean> {
    const result = await super.onClick(message, event);

    // 没有url的时候看json里的redirecturl跳转
    if (!result && message.content_type === 'JSON' && message.content) {
      const json = JSON.parse(message.content);
      if (json.redirecturl) {
        this.openRedirectView(message, json.redirecturl);
        return true;
      }
      // 工作流跳转
      if (json.todoid && json.biztype) {
        if (ibiz.env.isPortalApp) {
          ibiz.log.error('门户应用暂不支持跳转工作流');
        } else {
          const mainApp = ibiz.hub.getApp();
          const { preKey, subType } = this.computeWFParams(json);
          const res = await ibiz.net.post(
            `/systodos/${preKey}${json.todoid}/getlinkurl`,
            {
              srfapptype: 'pc',
              srfapp: mainApp.model.codeName,
              todosubtype: subType,
              todourltype: 'RouterUrl',
            },
          );
          if (res.data && res.data.linkurl) {
            const context = IBizContext.create(ibiz.appData?.context || {});
            toLocalOpenWFRedirectView(context, res.data.linkurl);
          }
        }
      }
    }

    return true;
  }
}
