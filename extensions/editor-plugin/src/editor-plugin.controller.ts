import { EditorController } from '@ibiz-template/runtime';
import { IEditor } from '@ibiz/model-core';

export class EditorPluginController extends EditorController<IEditor> {
  protected async onInit(): Promise<void> {
    ibiz.log.info('编辑器控制器初始化');
    await super.onInit();
  }
}
