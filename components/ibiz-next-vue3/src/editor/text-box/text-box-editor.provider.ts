/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IEditorContainerController,
  IEditorProvider,
} from '@ibiz-template/runtime';
import { ITextBox } from '@ibiz/model-core';
import { TextBoxEditorController } from './text-box-editor.controller';

/**
 * 输入框编辑器适配器
 *
 * @author lxm
 * @date 2022-09-19 22:09:03
 * @export
 * @class TextBoxEditorProvider
 * @implements {EditorProvider}
 */
export class TextBoxEditorProvider implements IEditorProvider {
  formEditor: string = 'IBizInput';

  gridEditor: string = 'IBizInput';

  constructor(editorType?: string) {
    if (editorType === 'NUMBER') {
      this.formEditor = 'IBizInputNumber';
      this.gridEditor = 'IBizInputNumber';
    }
    if (editorType === 'IPADDRESSTEXTBOX') {
      this.formEditor = 'IBizInputIP';
      this.gridEditor = 'IBizInputIP';
    }
    if (editorType === 'SIGNATURE') {
      this.formEditor = 'IBizSignature';
      this.gridEditor = 'IBizSignature';
    }
  }

  async createController(
    editorModel: ITextBox,
    parentController: IEditorContainerController,
  ): Promise<TextBoxEditorController> {
    const c = new TextBoxEditorController(editorModel, parentController);
    await c.init();
    return c;
  }
}
