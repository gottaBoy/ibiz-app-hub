import {
  IEditorContainerController,
  IEditorProvider,
} from '@ibiz-template/runtime';
import { IFileUploader } from '@ibiz/model-core';
import { UploadEditorController } from './upload-editor.controller';

/**
 * 文件上传编辑器适配器
 *
 * @author lxm
 * @date 2022-09-19 22:09:03
 * @export
 * @class FileUploaderEditorProvider
 * @implements {EditorProvider}
 */
export class FileUploaderEditorProvider implements IEditorProvider {
  formEditor: string = 'IBizFileUpload';

  gridEditor: string = 'IBizGridFileUpload';

  constructor(editorType: string) {
    let componentName = 'IBizFileUpload';
    switch (editorType) {
      case 'MOBPICTURE':
      case 'MOBPICTURELIST':
      case 'PICTURE_ONE':
      case 'PICTURE':
        componentName = 'IBizImageUpload';
        break;
      case 'MOBPICTURE_RAW':
      case 'PICTURE_ONE_RAW':
        componentName = 'IBizImageSelect';
        break;
      case 'MOBPICTURE_CROPPING':
      case 'PICTURE_CROPPING':
        componentName = 'IBizImageCropping';
        break;
      case 'CAROUSEL':
        componentName = 'IBizEditorCarousel';
        break;
      default:
    }
    this.formEditor = componentName;
  }

  async createController(
    editorModel: IFileUploader,
    parentController: IEditorContainerController,
  ): Promise<UploadEditorController> {
    const c = new UploadEditorController(editorModel, parentController);
    await c.init();
    return c;
  }
}
