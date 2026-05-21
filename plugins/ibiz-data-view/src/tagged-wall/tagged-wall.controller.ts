import { ListController } from '@ibiz-template/runtime';
import { isNumber } from 'lodash-es';

export class TaggedWallController extends ListController {
  /**
   *   字体大小是否为随机
   *
   * @author fangZhiHao
   * @date 2024-08-22 15:08:22
   * @type {boolean}
   */
  enableFontSizeRandom: boolean = true;

  /**
   *  字体最大字号
   *
   * @author fangZhiHao
   * @date 2024-08-22 16:08:47
   * @type {number}
   */
  maxFontSize: number = 16;

  /**
   *  字体最小字号
   *
   * @author fangZhiHao
   * @date 2024-08-22 16:08:06
   * @type {number}
   */
  minFontSize: number = 8;

  /**
   *  默认字号
   *
   * @author fangZhiHao
   * @date 2024-08-22 16:08:51
   * @type {number}
   */
  defaultFontSize: number = 16;

  /**
   *  自定义字体颜色组
   *
   * @author fangZhiHao
   * @date 2024-08-26 10:08:45
   * @type {string[]}
   */
  customColorGroup: string[] = [];

  protected async onCreated(): Promise<void> {
    await super.onCreated();
    if (!this.model.controlParam?.ctrlParams) {
      return;
    }
    const {
      ENABLEFONTSIZERANDOM,
      RANDOMFONTSIZERANGE,
      DEFAULTFONTSIZE,
      CUSTOMCOLORGROUP,
    } = this.model.controlParam?.ctrlParams as IData;
    if (ENABLEFONTSIZERANDOM) {
      this.enableFontSizeRandom = JSON.parse(ENABLEFONTSIZERANDOM);
    }
    if (RANDOMFONTSIZERANGE) {
      const range = JSON.parse(RANDOMFONTSIZERANGE);
      const { min, max } = range;
      if (isNumber(min)) {
        this.minFontSize = min;
      }
      if (isNumber(max)) {
        this.maxFontSize = max;
      }
    }
    if (isNumber(DEFAULTFONTSIZE)) {
      this.defaultFontSize = DEFAULTFONTSIZE;
    }
    if (CUSTOMCOLORGROUP) {
      this.customColorGroup = JSON.parse(CUSTOMCOLORGROUP);
    }
  }
}
