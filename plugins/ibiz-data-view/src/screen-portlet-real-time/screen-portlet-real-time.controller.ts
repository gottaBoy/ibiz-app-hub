import { IDBToolbarPortlet } from '@ibiz/model-core';
import { PortletPartController } from '@ibiz-template/runtime';

/**
 * @description 实时时间
 * @export
 * @class DigitalFlopController
 * @extends {EditorController<ISpan>}
 */
export class ScreenPortletRealTimeController extends PortletPartController<IDBToolbarPortlet> {
  /**
   * 左侧时间
   *
   * @author fangZhiHao
   * @date 2024-08-08 13:08:33
   * @type {string}
   */
  public leftTime: string = 'YYYY-MM-DD';

  /**
   *  星期
   *
   * @author fangZhiHao
   * @date 2024-08-08 13:08:17
   * @type {string}
   */
  public showWeek: boolean = true;

  /**
   * 右侧时间
   *
   * @author fangZhiHao
   * @date 2024-08-08 13:08:33
   * @type {string}
   */
  public rightTime: string = 'HH:mm:ss';

  /**
   * 初始化
   */
  protected async onInit(): Promise<void> {
    super.onInit();
    if (this.model.controlParam) {
      const { ctrlParams } = this.model.controlParam;
      if (ctrlParams && ctrlParams.VALUEFORMAT) {
        const arr = ctrlParams.VALUEFORMAT.split(',');
        // 安全检查：确保至少有一个元素
        if (arr.length === 0) {
          return;
        }

        const index = arr.indexOf('week');

        if (index !== -1) {
          this.showWeek = true;
          arr.splice(index, 1);
        } else {
          this.showWeek = false;
        }
        // 按顺序赋值
        this.leftTime = arr[0] ?? '';
        this.rightTime = arr[1] ?? '';
      }
    }
  }
}
