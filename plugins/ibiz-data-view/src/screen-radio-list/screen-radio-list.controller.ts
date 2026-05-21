import { CodeListEditorController } from '@ibiz-template/runtime';
import { IRadioButtonList } from '@ibiz/model-core';

/**
 * 单选项列表编辑器控制器
 * @return {*}
 * @author: zhujiamin
 * @Date: 2022-08-25 10:57:58
 */
export class ScreenRadioListEditorController extends CodeListEditorController<IRadioButtonList> {
  /**
   * @description 循环速度,单位毫秒
   * @type {number}
   * @memberof ScreenRadioListEditorController
   */
  speed: number = 3000;

  /**
   * 按钮间隔
   *
   * @type {number}
   * @memberof ScreenRadioListEditorController
   */
  btnSpace: number = 0;

  /**
   * @description 绘制模式(button: 按钮模式, radio: 单选框模式)
   * @type {('button' | 'radio')}
   * @memberof ScreenRadioListEditorController
   */
  renderMode: 'button' | 'radio' = 'button';

  protected async onInit(): Promise<void> {
    super.onInit();
    const { speed, renderMode, btnSpace } = this.editorParams;
    if (speed) {
      this.speed = Number(speed);
    }
    if (renderMode) {
      this.renderMode = renderMode;
    }
    if (btnSpace) {
      this.btnSpace = Number(btnSpace);
    }
  }
}
