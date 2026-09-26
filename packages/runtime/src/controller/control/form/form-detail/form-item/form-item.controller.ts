/* eslint-disable no-param-reassign */
import { IDEFormItem, IEditor, IValueItemEditor } from '@ibiz/model-core';
import Schema from 'async-validator';
import { isNilOrEmpty } from 'qx-util';
import { isObject } from 'lodash-es';
import { EditFormController } from '../../edit-form';
import { FormController } from '../../form/form.controller';
import { FormDetailController } from '../form-detail/form-detail.controller';
import { FormItemState } from './form-item.state';
import {
  FormDetailEventName,
  IApiFormItemController,
  IEditorContainerController,
  IEditorController,
  IEditorProvider,
  IFormDetailContainerController,
} from '../../../../../interface';
import { getEditorProvider } from '../../../../../register';
import { Srfuf } from '../../../../../service';
import { calcDeCodeNameById } from '../../../../../model';
import { filterValueRules } from '../../../../../utils';
import { FormNotifyState } from '../../../../constant';
import { generateEditorRules, generateRules } from '../../../../utils';
import { ControlType } from '../../../../../constant';

export class FormItemController
  extends FormDetailController<IDEFormItem>
  implements IEditorContainerController, IApiFormItemController
{
  declare state: FormItemState;

  protected createState(): FormItemState {
    return new FormItemState(this.parent?.state);
  }

  /**
   * 编辑器控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @type {IEditorController}
   */
  editor?: IEditorController;

  /**
   * 编辑器适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   */
  editorProvider?: IEditorProvider;

  /**
   * 表单项校验器实例
   *
   * @author lxm
   * @date 2022-09-04 18:09:56
   * @protected
   * @type {Schema}
   */
  protected validator?: Schema;

  /**
   * 值规则
   *
   * @author lxm
   * @date 2023-10-18 03:39:23
   * @type {IData[]}
   */
  rules: IData[] = [];

  /**
   * 表单项名称
   *
   * @author lxm
   * @date 2022-09-04 18:09:32
   * @readonly
   */
  get name(): string {
    return this.model.id!;
  }

  /**
   * 表单项值
   *
   * @author lxm
   * @date 2022-08-24 22:08:25
   * @readonly
   * @type {unknown}
   */
  get value(): unknown {
    return this.data?.[this.name];
  }

  /**
   * 值项
   * @author lxm
   * @date 2023-05-31 02:31:27
   * @readonly
   * @type {(string | undefined)}
   */
  get valueItemName(): string | undefined {
    if (this.model.editor) {
      return (this.model.editor as IValueItemEditor).valueItemName;
    }
    return undefined;
  }

  /**
   * 标签标题
   * @author lxm
   * @date 2023-12-12 09:48:21
   * @readonly
   * @type {(string | undefined)}
   */
  get labelCaption(): string | undefined {
    const { captionItemName } = this.model;
    if (captionItemName) {
      return this.data[captionItemName];
    }
    return this.model.caption;
  }

  /**
   * Creates an instance of FormItemController.
   *
   * @author chitanda
   * @date 2023-06-14 10:06:23
   * @param {IDEFormItem} model 表单模型
   * @param {FormController} form 表单控制器
   * @param {IFormDetailContainerController} [parent] 父容器控制器
   */
  constructor(
    model: IDEFormItem,
    form: FormController,
    parent?: IFormDetailContainerController,
  ) {
    super(model, form, parent);
    this.state.enableReadonly =
      this.form.getControlType() !== ControlType.SEARCHFORM;
  }

  /**
   * 单位
   * @author lxm
   * @date 2023-05-24 05:46:52
   * @readonly
   * @type {(string | undefined)}
   */
  get unitName(): string | undefined {
    return this.model.unitName;
  }

  /**
   * 值格式化
   * @author lxm
   * @date 2023-05-24 05:46:56
   * @readonly
   * @type {(string | undefined)}
   */
  get valueFormat(): string | undefined {
    return this.model.valueFormat;
  }

  /**
   * 数据类型
   *
   * @author zhanghengfeng
   * @date 2023-09-01 11:09:00
   * @readonly
   * @type {(number | undefined)}
   */
  get dataType(): number | undefined {
    return this.model.dataType;
  }

  /**
   * @description 隐藏无值的单位
   * @readonly
   * @type {boolean}
   * @memberof FormItemController
   */
  get emptyHiddenUnit(): boolean {
    if (this.form?.controlParams?.emptyhiddenunit) {
      return Object.is(this.form?.controlParams?.emptyhiddenunit, 'true');
    }
    return ibiz.config.form.emptyHiddenUnit;
  }

  /**
   * tips缓存标识
   *
   * @private
   * @memberof FormItemController
   */
  private TIPS_CACHE = `${calcDeCodeNameById(this.form.model.appDataEntityId || '')?.toUpperCase()}-${this.form.model.codeName?.toUpperCase()}`;

  /**
   * 初始化
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.initTips();
    // 空输入默认值
    this.state.required = !this.model.allowEmpty;
    const { enableCond } = this.model;
    if (!enableCond) {
      // enableCond为0省略为不存在了
      this.state.enableCondDisabled = true;
    }
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
        this.form.model,
      );
      if (this.editorProvider) {
        this.editor = await this.editorProvider.createController(
          this.createEditorModel(),
          this,
        );
        await this.initRules();
      }
    }
  }

  /**
   * @description 获取 enumOptions
   * @returns {*}  {(IParams | undefined)}
   * @memberof FormItemController
   */
  getEnumOptions(): IParams | undefined {
    const { jsonSchemaProperties } = this.form as IParams;
    const deField = this.model.fieldName || this.model.appDEFieldId!;
    if (!deField) return;
    return jsonSchemaProperties?.[deField]?.enumOptions;
  }

  /**
   * @description 创建编辑器模型
   * @returns {*}  {IEditor}
   * @memberof FormItemController
   */
  createEditorModel(): IEditor {
    const editorModel = { ...this.model.editor } as IParams;
    const enumOptions = this.getEnumOptions();
    if (isObject(enumOptions)) {
      const editorParams = { ...editorModel.editorParams };
      Object.assign(editorParams, {
        enumOptions: Object.keys(enumOptions).map(key => ({
          id: key,
          value: key,
          text: enumOptions[key],
        })),
      });
      editorModel.editorParams = editorParams;
    }

    return editorModel as IEditor;
  }

  /**
   * 初始化tips
   *
   * @protected
   * @memberof FormItemController
   */
  protected initTips(): void {
    const { enableInputTip, inputTip, inputTipUrl } = this.model;
    if (!enableInputTip) return;
    let _inputTip = inputTip;
    let _inputTipUrl = inputTipUrl;
    const cache = localStorage.getItem(this.TIPS_CACHE);
    if (cache) {
      const data: IData = JSON.parse(cache);
      if (data[this.name]) {
        _inputTip = data[this.name].inputTip;
        _inputTipUrl = data[this.name].inputTipUrl;
      }
    }
    this.state.inputTip = _inputTip;
    this.state.inputTipUrl = _inputTipUrl;
  }

  /**
   * 初始化值规则
   *
   * @author lxm
   * @date 2022-09-02 09:09:27
   * @protected
   * @returns {*}
   */
  protected async initRules(): Promise<void> {
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

    if (this.model.editor) {
      this.rules.push(...generateEditorRules(this.model.editor));
    }

    if (this.rules.length > 0) {
      // 初始化async-validator实例
      this.validator = new Schema({ [this.name]: this.rules });
    }
  }

  /**
   * 计算启用条件的禁用
   *
   * @author lxm
   * @date 2022-09-20 00:09:57
   * @param {(string | FormNotifyState)} name
   * @returns {*}
   */
  calcEnableCond(): void {
    const { enableCond } = this.model;
    const isNew = this.data.srfuf === Srfuf.CREATE;
    if ((isNew && enableCond === 2) || (!isNew && enableCond === 1)) {
      this.state.enableCondDisabled = true;
    }
  }

  async dataChangeNotify(name: string[]): Promise<void> {
    await super.dataChangeNotify(name);
    const { resetItemNames } = this.model;

    // 重置项，变更时自己的值置空
    let isReset = false;
    if (resetItemNames && resetItemNames.length > 0) {
      resetItemNames.forEach((resetItemName: string) => {
        if (name.includes(resetItemName)) {
          isReset = true;
        }
      });
    }
    if (isReset) {
      await this.setDataValue(null, this.name);
    }

    // 刚加载初始化时的值不校验,只校验值项和自身值变更
    if (name.includes(this.name) || name.includes(this.valueItemName!)) {
      const bol = await this.validate();
      // 值变更且未校验通过时提示错误信息
      if (
        this.form.validateMode === 'notification' &&
        !bol &&
        this.state.error
      ) {
        ibiz.notification.error({
          title: ibiz.i18n.t('runtime.controller.control.form.formCompletion'),
          desc: this.state.error,
        });
      }
    }

    // 有表单项更新，且是自身变更时，触发表单项更新
    if (name.includes(this.name) && this.model.deformItemUpdateId) {
      await (this.form as EditFormController).updateFormItem(
        this.model.deformItemUpdateId,
      );
    }
  }

  async formStateNotify(state: FormNotifyState): Promise<void> {
    super.formStateNotify(state);

    // 计算启用条件
    this.calcEnableCond();
  }

  /**
   * 表单项值规则校验(如果表单项不显示则不校验直接返回true)
   *
   * @author lxm
   * @date 2022-09-01 22:09:29
   */
  async validate(): Promise<boolean> {
    if (!this.state.visible) {
      this.state.error = null;
      return true;
    }

    // 必填校验
    if (
      this.state.required &&
      (typeof this.data[this.name] === 'string'
        ? isNilOrEmpty(this.data[this.name].trimEnd())
        : isNilOrEmpty(this.data[this.name]))
    ) {
      this.state.error = ibiz.i18n.t('runtime.controller.control.form.fillIn', {
        caption: this.model.caption || '',
      });
      return false;
    }

    if (this.validator) {
      try {
        await this.validator.validate(this.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch ({ errors, _fields }: any) {
        this.state.error = (errors as IData[])[0].message;
        return false;
      }
    }
    this.state.error = null;
    return true;
  }

  /**
   * 静默校验
   *
   * @return {*}  {Promise<boolean>}
   * @memberof FormItemController
   */
  async silentValidate(): Promise<boolean> {
    if (this.state.visible) {
      // 必填校验
      if (
        this.state.required &&
        (typeof this.data[this.name] === 'string'
          ? isNilOrEmpty(this.data[this.name].trimEnd())
          : isNilOrEmpty(this.data[this.name]))
      ) {
        return false;
      }
      if (this.validator) {
        try {
          await this.validator.validate(this.data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch ({ errors, _fields }: any) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 设置表单数据的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {unknown} value 要设置的值
   * @param {string} name 要设置的表单数据的属性名称
   * @param {boolean} ignore 忽略脏值检查
   */
  async setDataValue(
    value: unknown,
    name?: string,
    ignore: boolean = false,
  ): Promise<void> {
    name = name || this.name;
    const oldValue = this.data[name];
    await this.form.setDataValue(name, value, ignore);
    this.executeScriptCode('SCRIPTCODE_CHANGE', { oldValue });
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: name || this.model.id!,
      formDetailEventName: FormDetailEventName.CHANGE,
      args: { oldValue },
    });
  }

  /**
   * 聚焦事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onFocus(event: MouseEvent): void {
    this.executeScriptCode('SCRIPTCODE_FOCUS');
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.model.id!,
      formDetailEventName: FormDetailEventName.FOCUS,
      event,
    });
  }

  /**
   * 失焦事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onBlur(event: MouseEvent): void {
    this.executeScriptCode('SCRIPTCODE_BLUR');
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.model.id!,
      formDetailEventName: FormDetailEventName.BLUR,
      event,
    });
  }

  /**
   * 回车事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onEnter(event: MouseEvent): void {
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.model.id!,
      formDetailEventName: FormDetailEventName.ENTER,
      event,
    });
  }

  /**
   * 点击事件
   * @author ljx
   * @date 2024-08-06 10:03:26
   */
  async onClick(event?: MouseEvent, params: IParams = {}): Promise<void> {
    const { data } = params;
    event?.stopPropagation();
    this.executeScriptCode('SCRIPTCODE_CLICK');
    const clickEmitData = {
      formDetailName: this.model.id!,
      formDetailEventName: FormDetailEventName.CLICK,
      event,
    };
    if (data) {
      Object.assign(clickEmitData, { data: [data] });
    }
    this.form.evt.emit('onFormDetailEvent', clickEmitData);
  }

  /**
   * 自定义行为
   * @param value
   */
  async onCustomAction(value: IData): Promise<void> {
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.name || this.model.id!,
      formDetailEventName: FormDetailEventName.CUSTOMACTION,
      args: Object.assign({}, value),
    });
  }

  /**
   * 加载输入提示信息
   *
   * @return {*}  {Promise<void>}
   * @memberof FormItemController
   */
  async loadInputTip(): Promise<void> {
    const { appDEFInputTipSetId, appDataEntityId } = this.form.model;
    // 如果已经有提示或未配置输入提示集合就不远程加载
    if (this.state.inputTip || !appDEFInputTipSetId) return;
    const { appId, inputTipUniqueTag, appDEFieldId } = this.model;
    const app = ibiz.hub.getApp(appId);
    const inputTipsSet = app.getInputTipsSet(appDEFInputTipSetId);
    // 如果属性提示集合中没有配内容属性和链接属性则不发送请求
    if (
      !inputTipsSet ||
      (!inputTipsSet.linkAppDEFieldId && !inputTipsSet.contentAppDEFieldId)
    )
      return;
    try {
      const { linkAppDEFieldId, contentAppDEFieldId, uniqueTagAppDEFieldId } =
        inputTipsSet;
      const res = await app.deService.exec(
        inputTipsSet.appDataEntityId!,
        inputTipsSet.appDEDataSetId!,
        this.context,
        {
          [uniqueTagAppDEFieldId
            ? `n_${uniqueTagAppDEFieldId.toLowerCase()}_eq`
            : 'srftiptag']:
            inputTipUniqueTag ||
            `${calcDeCodeNameById(appDataEntityId!).toUpperCase()}__${appDEFieldId!.toUpperCase()}`,
        },
      );
      if (res.ok && Array.isArray(res.data)) {
        // 只获取第一条
        const data = res.data[0];
        if (contentAppDEFieldId)
          this.state.inputTip =
            data[contentAppDEFieldId] ||
            ibiz.i18n.t('runtime.common.noExplanation');
        if (linkAppDEFieldId) this.state.inputTipUrl = data[linkAppDEFieldId];
      }
    } catch (error) {
      this.state.inputTip = ibiz.i18n.t('runtime.common.noExplanation');
    } finally {
      const cache = localStorage.getItem(this.TIPS_CACHE);
      const data = cache ? JSON.parse(cache) : {};
      Object.assign(data, {
        [this.name]: {
          inputTip: this.state.inputTip,
          inputTipUrl: this.state.inputTipUrl,
        },
      });
      localStorage.setItem(this.TIPS_CACHE, JSON.stringify(data));
    }
  }

  /**
   * 清除tis缓存
   *
   * @memberof FormItemController
   */
  clearTipsCache(): void {
    localStorage.removeItem(this.TIPS_CACHE);
  }
}
