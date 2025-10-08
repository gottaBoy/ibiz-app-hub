import {
  IEditorContainerController,
  IEditorProvider,
} from '@ibiz-template/runtime';
import { IEditor } from '@ibiz/model-core';
import { EditorPluginController } from './editor-plugin.controller';

export class EditorPluginProvider implements IEditorProvider {
  formEditor: string = 'IBizEditorPlugin';

  gridEditor: string = 'IBizEditorPlugin';

  async createController(
    editorModel: IEditor,
    parentController: IEditorContainerController,
  ): Promise<EditorPluginController> {
    const c = new EditorPluginController(editorModel, parentController);
    await c.init();
    return c;
  }
}
