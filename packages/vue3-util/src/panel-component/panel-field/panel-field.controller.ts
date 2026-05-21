import {
  getEditorProvider,
  IEditorContainerController,
  IEditorController,
  IEditorProvider,
  PanelItemController,
  PanelItemEventName,
} from '@ibiz-template/runtime';
import { IPanelField } from '@ibiz/model-core';
import { PanelFieldState } from './panel-field.state';

/**
 * 面板属性项控制器
 *
 * @export
 * @class PanelFieldController
 * @extends {PanelItemController<IPanelField>}
 */
export class PanelFieldController
  extends PanelItemController<IPanelField>
  implements IEditorContainerController
{
  /**
   * @description 面板属性项控制器状态
   * @exposedoc
   * @type {PanelFieldState}
   * @memberof PanelFieldController
   */
  declare state: PanelFieldState;

  /**
   * @description 单位名称
   * @exposedoc
   * @type {(string | undefined)}
   * @memberof PanelFieldController
   */
  unitName: string | undefined = undefined;

  /**
   * @description 可冒泡点击事件的编辑器类型
   * @static
   * @memberof PanelFieldController
   */
  static enableClickType: string[] = [
    'SPAN',
    'SPAN_LINK',
    'RAW',
    'MOB2DBARCODEREADER',
    'FIELD_CAROUSEL_PICTURE',
    'FIELD_IMAGE_PICTURE_ONE',
  ];

  /**
   * @exposedoc
   * @description 值格式化
   * @readonly
   * @type {(string | undefined)}
   * @memberof PanelFieldController
   */
  get valueFormat(): string | undefined {
    return this.model.valueFormat;
  }

  /**
   * @exposedoc
   * @description 数据类型
   * @readonly
   * @type {(number | undefined)}
   * @memberof PanelFieldController
   */
  get dataType(): number | undefined {
    return undefined;
  }

  /**
   * @exposedoc
   * @description 上下文
   * @readonly
   * @type {IContext}
   * @memberof PanelFieldController
   */
  get context(): IContext {
    return this.panel.context;
  }

  /**
   * @exposedoc
   * @description 视图参数
   * @readonly
   * @type {IParams}
   * @memberof PanelFieldController
   */
  get params(): IParams {
    return this.panel.params;
  }

  /**
   * @exposedoc
   * @description 父容器数据对象数据
   * @readonly
   * @type {IData}
   * @memberof PanelFieldController
   */
  get data(): IData {
    return this.dataParent.data;
  }

  /**
   * @exposedoc
   * @description 面板属性成员的值
   * @readonly
   * @type {(string | number)}
   * @memberof PanelFieldController
   */
  get value(): string | number {
    return this.data[this.model.id!];
  }

  /**
   * @exposedoc
   * @description 编辑器控制器
   * @type {IEditorController}
   * @memberof PanelFieldController
   */
  editor?: IEditorController;

  /**
   * @description 编辑器适配器
   * @type {IEditorProvider}
   * @memberof PanelFieldController
   */
  editorProvider?: IEditorProvider;

  protected createState(): PanelFieldState {
    return new PanelFieldState(this.parent?.state);
  }

  /**
   * @description 值校验
   * @returns {*}  {Promise<boolean>}
   * @memberof PanelFieldController
   */
  async validate(): Promise<boolean> {
    // 目前仅支持空值校验
    if (this.state.visible && this.state.required && !this.value) {
      this.state.error =
        this.editor?.model.placeHolder ||
        ibiz.i18n.t('vue3Util.panelComponent.cannotEmpty', {
          caption: this.model.caption,
        });
      return false;
    }
    this.state.error = null;
    return true;
  }

  /**
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof PanelFieldController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    // 空输入默认值
    this.state.required = !this.model.allowEmpty;
    if (
      this.context.srfreadonly !== true &&
      this.context.srfreadonly !== 'true' &&
      this.model.editor?.readOnly
    ) {
      this.state.readonly = this.model.editor?.readOnly || false;
    }
    // 初始化编辑器控制器,除了隐藏都会需要适配器
    if (this.model.editor && this.model.editor.editorType !== 'HIDDEN') {
      this.editorProvider = await getEditorProvider(
        this.model.editor,
        this.model,
        this.panel.model,
      );
      if (this.editorProvider) {
        this.editor = await this.editorProvider.createController(
          this.model.editor,
          this,
        );
      }
    }
  }

  /**
   * @exposedoc
   * @description 设置面板数据的值
   * @param {unknown} value
   * @param {string} [name]
   * @returns {*}  {Promise<void>}
   * @memberof PanelFieldController
   */
  async setDataValue(value: unknown, name?: string): Promise<void> {
    const { id } = this.model;
    name = name || id;
    if (this.dataParent.setDataValue) {
      await this.dataParent.setDataValue(name!, value);
    }
    await this.validate();
    this.panel.evt.emit('onPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: PanelItemEventName.CHANGE,
    });
  }

  /**
   * 聚焦事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onFocus(event: MouseEvent): void {
    this.panel.evt.emit('onPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: PanelItemEventName.FOCUS,
      event,
    });
  }

  /**
   * 失焦事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onBlur(event: MouseEvent): void {
    this.panel.evt.emit('onPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: PanelItemEventName.BLUR,
      event,
    });
  }

  /**
   * 回车事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onEnter(event: MouseEvent): void {
    this.panel.evt.emit('onPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: PanelItemEventName.ENTER,
      event,
    });
  }

  /**
   * @description 点击事件
   * @param {MouseEvent} [event]
   * @memberof PanelFieldController
   */
  onClick(event?: MouseEvent): void {
    // 在移动端环境下，仅在以下情况下可向上冒泡
    // 只读，禁用态时
    // 或者编辑器不会抛值
    if (ibiz.env.isMob) {
      const disableEdit = this.state.readonly || this.state.disabled;
      if (
        !disableEdit &&
        this.editor?.model.editorType &&
        !PanelFieldController.enableClickType.includes(
          this.editor.model.editorType,
        )
      ) {
        event?.stopPropagation();
      }
    }
    super.onClick(event);
  }
}
