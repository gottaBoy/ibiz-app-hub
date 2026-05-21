/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IEditorContainerController,
  IEditorProvider,
} from '@ibiz-template/runtime';
import { IDropDownList } from '@ibiz/model-core';
import { DropDownListEditorController } from './dropdown-list-editor.controller';

/**
 * 多选框列表编辑器适配器
 *
 * @author lxm
 * @date 2022-09-19 22:09:03
 * @export
 * @class DropDownListEditorProvider
 * @implements {EditorProvider}
 */
export class DropDownListEditorProvider implements IEditorProvider {
  formEditor: string = 'IBizDropdown';

  gridEditor: string = 'IBizDropdown';

  constructor(editorType?: string) {
    let componentName = 'IBizDropdown';
    switch (editorType) {
      // 特殊识别标识MOBCHECKLIST 模型中文名称为：下拉列表多选
      case 'MOBCHECKLIST':
      case 'MDROPDOWNLIST':
        componentName = 'IBizDropdownList';
        break;
      // 模型中文名称为：表情选择
      case 'EMOJI_PICKER':
        componentName = 'IBizEmojiPicker';
        break;
      case 'MOBDROPDOWNLIST_CASCADER':
        componentName = 'IBizCascaderDropdown';
        break;
      default:
        break;
    }
    this.formEditor = componentName;
    this.gridEditor = componentName;
  }

  async createController(
    editorModel: IDropDownList,
    parentController: IEditorContainerController,
  ): Promise<DropDownListEditorController> {
    const c = new DropDownListEditorController(editorModel, parentController);
    await c.init();
    return c;
  }
}
