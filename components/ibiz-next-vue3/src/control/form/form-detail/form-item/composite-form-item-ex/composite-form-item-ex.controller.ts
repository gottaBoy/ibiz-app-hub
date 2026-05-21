import {
  FormItemController,
  filterValueRules,
  generateEditorRules,
  generateRules,
  getEditorProvider,
} from '@ibiz-template/runtime';
import {
  ICodeListEditor,
  IEditor,
  IEditorItem,
  ISysImage,
} from '@ibiz/model-core';
import Schema from 'async-validator';
import { CompositeFormItemExState } from './composite-form-item-ex.state';

export class CompositeFormItemExController extends FormItemController {
  declare state: CompositeFormItemExState;

  protected createState(): CompositeFormItemExState {
    return new CompositeFormItemExState(this.parent?.state);
  }

  /**
   * @description 默认显示的编辑器类型
   * @type {string}
   * @memberof CompositeFormItemExController
   */
  defaultType: string = '';

  /**
   * @description 组件内部自己绘制切换菜单，而非外部绘制的编辑器类型
   * @type {string[]}
   * @memberof CompositeFormItemExController
   */
  includesList: string[] = ['HTMLEDITOR_DEFAULT', 'MARKDOWN_DEFAULT'];

  /**
   * @description 代码表id
   * @type {string}
   * @memberof CompositeFormItemExController
   */
  codeListId: string = '';

  /**
   * @description 是否禁止切换菜单选项
   * @type {boolean}
   * @memberof CompositeFormItemExController
   */
  disableSwitch: boolean = false;

  /**
   * @description 是否隐藏切换菜单
   * @type {boolean}
   * @memberof CompositeFormItemExController
   */
  hiddenSwitch: boolean = false;

  /**
   * @description 切换菜单选项
   * @type {{ id: string; name: string; icon?: ISysImage, editor?: IData }[]}
   * @memberof CompositeFormItemExController
   */
  switchOptions: {
    id: string;
    name: string;
    icon?: ISysImage;
    editor?: IData;
  }[] = [];

  /**
   * @description 值项
   * @type {(IEditorItem | undefined)}
   * @memberof CompositeFormItemExController
   */
  valueItem: IEditorItem | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    const editor = this.model.editor as ICodeListEditor;
    if (!editor) {
      return;
    }
    this.codeListId = editor.appCodeListId || '';
    if (editor.editorParams?.codelistid) {
      this.codeListId = editor.editorParams.codelistid;
    }
    if (this.codeListId) {
      const app = ibiz.hub.getApp(this.context.srfappid);
      const items = await app.codeList.get(
        this.codeListId,
        this.context,
        this.params,
      );
      if (items && items.length) {
        this.switchOptions = items.map(item => {
          return {
            id: item.value as string,
            name: item.text,
            icon: item.sysImage,
            editor: item.data,
          };
        });
        this.defaultType = this.switchOptions[0]?.id || '';
      }
    }
    if (editor.editorParams?.defaulttype) {
      this.defaultType = editor.editorParams.defaulttype;
    }
    if (editor.editorParams?.includes) {
      this.includesList = JSON.parse(editor.editorParams.includes);
    }
    if (editor.editorParams?.disableswitch) {
      this.disableSwitch = editor.editorParams.disableswitch === 'true';
    }
    if (editor.editorParams?.hiddenswitch) {
      this.hiddenSwitch = editor.editorParams.hiddenswitch === 'true';
    }
    if (editor.editorItems && editor.editorItems.length) {
      this.valueItem = editor.editorItems[0];
    }
    await this.updateEditor(this.defaultType);
  }

  /**
   * @description 更新编辑器模型
   * @param {string} id
   * @returns {*}  {Promise<void>}
   * @memberof CompositeFormItemExController
   */
  async updateEditor(id: string): Promise<void> {
    if (!id || id === this.state.editorId) {
      return;
    }
    const option = this.switchOptions.find(item => item.id === id);
    if (!option) {
      return;
    }
    const editorModel = {
      ...this.createEditorModel(),
      ...option.editor,
    } as IEditor;
    this.editorProvider = await getEditorProvider(editorModel);
    if (this.editorProvider) {
      this.editor = await this.editorProvider.createController(
        editorModel,
        this,
      );
      this.rules = [];
      const formItemsVRs = filterValueRules(
        this.form.model.deformItemVRs || [],
        this.name,
      );
      if (formItemsVRs) {
        this.rules.push(
          ...generateRules(formItemsVRs, this.name, this.valueItemName),
        );
      }
      if (editorModel) {
        this.rules.push(...generateEditorRules(editorModel));
      }
      if (this.rules.length > 0) {
        this.validator = new Schema({ [this.name]: this.rules });
      } else {
        this.validator = undefined;
      }
    } else {
      this.editor = undefined;
      this.rules = [];
      this.validator = undefined;
    }
    this.state.editorId = id;
  }

  /**
   * @description 处理编辑器切换
   * @param {string} id
   * @returns {*}  {Promise<void>}
   * @memberof CompositeFormItemExController
   */
  async handleEditorSwitch(id: string): Promise<void> {
    if (this.disableSwitch) {
      return;
    }
    if (!id || id === this.state.editorId) {
      return;
    }
    if (this.value) {
      const result = await ibiz.confirm.warning({
        title: ibiz.i18n.t('control.form.compositeFormItemEx.confirmTitle'),
        desc: ibiz.i18n.t('control.form.compositeFormItemEx.confirmDesc'),
      });
      if (!result) {
        return;
      }
    }
    this.setDataValue('', this.name);
    if (this.valueItem && this.valueItem.id) {
      this.setDataValue(id, this.valueItem.id);
    }
  }
}
