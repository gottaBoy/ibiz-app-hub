import {
  EditorController,
  getDeACMode,
  IAppDEService,
} from '@ibiz-template/runtime';
import { IAppDEACMode, ITextArea, ITextBox } from '@ibiz/model-core';
import { toNumber } from 'lodash-es';

/**
 * 输入框编辑器控制器
 *
 * @author lxm
 * @date 2022-08-24 20:08:25
 * @export
 * @class TextBoxEditorController
 * @extends {EditorController}
 */
export class TextBoxEditorController extends EditorController<ITextBox> {
  /**
   * 精度
   * @author lxm
   * @date 2023-09-26 10:22:47
   * @type {number}
   */
  precision?: number;

  /**
   * @description 应用实体服务
   * @type {IAppDEService}
   * @memberof TextBoxEditorController
   */
  deService?: IAppDEService;

  /**
   * @description 自填模式
   * @type {IAppDEACMode}
   * @memberof TextBoxEditorController
   */
  deACMode?: IAppDEACMode;

  /**
   * @description AI 聊天自填模式
   * @type {boolean}
   * @memberof TextBoxEditorController
   */
  chatCompletion: boolean = false;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.precision = this.editorParams.precision
      ? toNumber(this.editorParams.precision)
      : this.model.precision;
    if (
      this.model.editorType &&
      ['TEXTAREA', 'TEXTAREA_10', 'MOBTEXTAREA'].includes(this.model.editorType)
    ) {
      const model = this.model as ITextArea;
      if (model.appDEACModeId) {
        this.deACMode = await getDeACMode(
          model.appDEACModeId,
          model.appDataEntityId!,
          this.context.srfappid,
        );
        if (this.deACMode) {
          if (this.deACMode.actype === 'CHATCOMPLETION' && ibiz.env.enableAI) {
            this.deService = await ibiz.hub
              .getApp(model.appId)
              .deService.getService(this.context, model.appDataEntityId!);
            this.chatCompletion = true;
          }
        }
      }
    }
  }
}
