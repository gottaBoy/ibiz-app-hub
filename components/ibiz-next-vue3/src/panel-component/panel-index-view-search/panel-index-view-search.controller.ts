import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';

/**
 * 面板首页搜索控制器
 *
 * @export
 * @class PanelIndexViewSearchController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class PanelIndexViewSearchController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 自定义补充参数
   * @exposedoc
   * @type {IData}
   * @memberof PanelIndexViewSearchController
   */
  rawItemParams: IData = {};

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof PanelIndexViewSearchController
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
  }

  /**
   * @description 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   * @protected
   * @memberof PanelIndexViewSearchController
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
