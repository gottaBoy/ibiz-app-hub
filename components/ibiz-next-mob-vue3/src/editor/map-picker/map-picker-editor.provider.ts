import {
  IEditorContainerController,
  IEditorProvider,
} from '@ibiz-template/runtime';
import { IMapPicker } from '@ibiz/model-core';
import { MapPickerEditorController } from './map-picker-editor.controller';

/**
 * @description 地图选择器编辑器适配器
 * @export
 * @class MapPickerEditorProvider
 * @implements {IEditorProvider}
 */
export class MapPickerEditorProvider implements IEditorProvider {
  formEditor: string = 'IBizMapPicker';

  gridEditor: string = 'IBizMapPicker';

  async createController(
    editorModel: IMapPicker,
    parentController: IEditorContainerController,
  ): Promise<MapPickerEditorController> {
    const c = new MapPickerEditorController(editorModel, parentController);
    await c.init();
    return c;
  }
}
