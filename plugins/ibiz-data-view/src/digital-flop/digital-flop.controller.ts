import { ISpan } from '@ibiz/model-core';
import { EditorController } from '@ibiz-template/runtime';

/**
 * @description 数字翻牌器
 * @export
 * @class DigitalFlopController
 * @extends {EditorController<ISpan>}
 */
export class DigitalFlopController extends EditorController<ISpan> {
  /**
   * @description 卡片大小
   * @type {number}
   * @memberof DigitalFlopController
   */
  size: number = 32;

  /**
   * @description 字体大小
   * @type {number}
   * @memberof DigitalFlopController
   */
  fontSize: number = 16;

  protected async onInit(): Promise<void> {
    super.onInit();
    const { size, fontSize } = this.editorParams;
    if (size) {
      this.size = Number(size);
    }
    if (fontSize) {
      this.fontSize = Number(fontSize);
    }
  }
}
