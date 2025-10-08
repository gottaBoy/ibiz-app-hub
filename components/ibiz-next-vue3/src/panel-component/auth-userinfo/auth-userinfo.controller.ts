import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';

/**
 * 面板用户信息控制器
 *
 * @export
 * @class AuthUserinfoController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class AuthUserinfoController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 自定义补充参数
   * @exposedoc
   * @type {IData}
   * @memberof AuthUserinfoController
   */
  rawItemParams: IData = {};

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof AuthUserinfoController
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
  }

  /**
   * @description 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   * @protected
   * @memberof AuthUserinfoController
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
