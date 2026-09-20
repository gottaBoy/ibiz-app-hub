import { aiChatT } from '../../utils';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IChatToolbarItem } from '../../interface';
import { MaterialHelper } from './material-helper';

export class CommonHelper extends MaterialHelper {
  /**
   * 执行操作
   *
   * @author tony001
   * @date 2025-02-28 15:02:48
   * @return {*}  {Promise<void>}
   */
  async excuteAction(
    event: MouseEvent,
    item?: IChatToolbarItem,
  ): Promise<void> {
    let result: any;
    if (item && item.onClick && typeof item.onClick === 'function') {
      result = await item.onClick(
        event,
        item,
        this.aiChat.context,
        this.aiChat.params,
      );
    } else {
      const extendToolbarClick = this.aiChat.opts.extendToolbarClick;
      if (extendToolbarClick) {
        result = await extendToolbarClick(
          event,
          item!,
          this.aiChat.context,
          this.aiChat.params,
          {},
        );
      } else {
        console.error(aiChatT('noToolbarAction'));
      }
    }
    if (result && result.data && result.data.length > 0) {
      result.data.forEach((tempData: any) => {
        const material = {
          id: tempData.id,
          type: tempData.type,
          data: tempData.data || {},
          metadata: tempData.metadata || {},
        };
        if (item!.id) {
          Object.assign(material.metadata, { actionId: item!.id });
        }
        this.aiChat.addMaterial(material);
      });
    }
  }
}
