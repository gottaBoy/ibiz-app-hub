import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';

export class ViewMsgPosController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 直接内容项参数
   * @exposedoc
   * @type {IData}
   */
  rawItemParams: IData = {};

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
  }

  /**
   * 处理直接内容项参数
   *
   * @author zhanghengfeng
   * @date 2024-04-08 19:04:59
   * @protected
   */
  protected handleRawItemParams(): void {
    const rawItemParams = this.model.rawItem?.rawItemParams;
    if (Array.isArray(rawItemParams)) {
      rawItemParams.forEach(item => {
        const key = item.key;
        const value = item.value;
        if (key && value) {
          this.rawItemParams[key.toLowerCase()] = value;
        }
      });
    }
  }
}
