/* eslint-disable no-unused-expressions */
import { ModelError, recursiveIterate } from '@ibiz-template/core';
import { IDEEditFormItem, IDEForm } from '@ibiz/model-core';
import { clone, isNil } from 'ramda';
import {
  FormDetailEventName,
  IEditFormController,
  IFormMDCtrlRepeaterController,
} from '../../../../../interface';
import { FormMDCtrlController } from './form-mdctrl.controller';
import { EditFormController } from '../../edit-form';
import { getDefaultValue } from '../../../../utils';
import { FormNotifyState } from '../../../../constant';

/**
 * @description 表单多数据部件(重复器)控制器
 * @export
 * @class FormMDCtrlRepeaterController
 * @extends {FormMDCtrlController}
 * @implements {IFormMDCtrlRepeaterController}
 */
export class FormMDCtrlRepeaterController
  extends FormMDCtrlController
  implements IFormMDCtrlRepeaterController
{
  /**
   * @description 多数据重复器对应的表单里的值
   * @readonly
   * @type {(IData[] | IData | null)}
   * @memberof FormMDCtrlRepeaterController
   */
  get value(): IData[] | IData | null {
    return this.data[this.model.id!];
  }

  /**
   * @description 是否允许排序
   * @readonly
   * @type {boolean}
   * @memberof FormMDCtrlRepeaterController
   */
  get enableSort(): boolean {
    return !!(
      this.model.ctrlParams &&
      (this.model.ctrlParams.ENABLESORT === 'true' ||
        this.model.ctrlParams.enablesort === 'true')
    );
  }

  /**
   * @description 重复器样式
   * @type {('Grid' | 'MultiForm' | 'SingleForm')}
   * @memberof FormMDCtrlRepeaterController
   */
  repeaterStyle: 'Grid' | 'MultiForm' | 'SingleForm' = 'MultiForm';

  /**
   * @description 重复器的值是否是单项数据类型，true为对象格式，false为数组格式
   * @type {boolean}
   * @memberof FormMDCtrlRepeaterController
   */
  isSingleData: boolean = false;

  /**
   * @description 重复表单
   * @type {IDEForm}
   * @memberof FormMDCtrlRepeaterController
   */
  repeatedForm!: IDEForm;

  /**
   * @description 重复器map
   * @memberof FormMDCtrlRepeaterController
   */
  repeaterMap = new Map<string, IEditFormController>();

  /**
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlRepeaterController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();

    // 初始化样式类型和数据类型
    switch (this.model.detailStyle) {
      // 表单
      case 'DEFAULT':
        this.repeaterStyle = 'MultiForm';
        this.isSingleData = false;
        break;
      // 表格
      case 'STYLE2':
        this.repeaterStyle = 'Grid';
        this.isSingleData = false;
        break;
      // 1：1表单
      case 'STYLE3':
        this.repeaterStyle = 'SingleForm';
        this.isSingleData = true;
        break;
      default:
        if (this.context?.srfrunmode === 'DESIGN') {
          return;
        }
        throw new ModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.control.form.repeaterNoSupported', {
            detailStyle: this.model.detailStyle,
          }),
        );
    }

    this.prepareRepeatedForm();
  }

  /**
   * @description 准备重复器表单模型
   * @memberof FormMDCtrlRepeaterController
   */
  prepareRepeatedForm(): void {
    const id = `${this.model.id}repeatedform`;
    const tempForm: IDEForm = {
      appId: this.model.appId,
      id,
      codeName: id,
      name: id,
      deformPages: [
        {
          appId: this.model.appId,
          id: 'formpage1',
          deformDetails: this.model.deformDetails,
          detailType: 'FORMPAGE',
          detailStyle: 'DEFAULT',
          layout: this.model.layout,
        },
      ],
    };

    const copyFields: Array<keyof IDEForm> = [
      'appId',
      'controlType',
      'deformItemVRs',
    ];
    copyFields.forEach(key => {
      (tempForm as IData)[key] = (this.form.model as IData)[key];
    });

    this.repeatedForm = clone(tempForm);
  }

  /**
   * @description 设置重复器控制器
   * @param {string} id
   * @param {IEditFormController} controller
   * @memberof FormMDCtrlRepeaterController
   */
  setRepeaterController(id: string, controller: IEditFormController): void {
    this.repeaterMap.set(id, controller);
    if (this.value && this.repeaterMap.size === this.value.length) {
      (this.form as EditFormController).evt.emit('onMDCtrlChange', {
        name: this.name,
        args: this,
      });
    }
  }

  /**
   * @description 校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormMDCtrlRepeaterController
   */
  async validate(): Promise<boolean> {
    const values = await Promise.all(
      Array.from(this.repeaterMap.values()).map(form => form.validate()),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  /**
   * @description 静默校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormMDCtrlRepeaterController
   */
  async silentValidate(): Promise<boolean> {
    const values = await Promise.all(
      Array.from(this.repeaterMap.values()).map(form => form.silentValidate()),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  /**
   * @description 设置重复器数据（修改主表单里重复器对应属性）
   * @param {(IData[] | IData | null)} value
   * @memberof FormMDCtrlRepeaterController
   */
  setValue(value: IData[] | IData | null): void {
    this.form.setDataValue(this.name, value);
    this.executeScriptCode('SCRIPTCODE_CHANGE');
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.name || this.model.id!,
      formDetailEventName: FormDetailEventName.CHANGE,
    });
  }

  /**
   * @description 添加或创建一条数据
   * @param {number} [index]
   * @memberof FormMDCtrlRepeaterController
   */
  create(index?: number): void {
    const item = {};
    // 设置新建默认值
    this.setDefaultValue(item, 'create');
    if (this.isSingleData) {
      this.setValue(item);
    } else {
      // 多数据，拷贝数组再添加新对象
      let tempValue = this.value as IData[] | null;
      tempValue = tempValue ? [...tempValue] : [];
      if (index !== undefined) {
        tempValue.splice(index, 0, item);
      } else {
        tempValue.push(item);
      }
      this.setValue(tempValue);
    }
    (this.form as EditFormController).evt.emit('onMDCtrlNew', {
      args: item,
    });
  }

  /**
   * @description 删除数据
   * @param {number} [index]
   * @returns {*}  {void}
   * @memberof FormMDCtrlRepeaterController
   */
  remove(index?: number): void {
    if (this.isSingleData) {
      // 单项数据的时候删除就是清空
      this.setValue(null);
      return;
    }
    const newArr = (this.value! as IData[]).filter((_, i) => {
      return index !== i;
    });

    this.setValue(newArr);
    (this.form as EditFormController).evt.emit('onMDCtrlRemove', {
      args: newArr,
    });
  }

  /**
   * @description 拖拽变更
   * @param {number} _draggedIndex 当前拖拽元素的下标
   * @param {number} _targetIndex 拖拽元素放入位置的下标
   * @memberof FormMDCtrlRepeaterController
   */
  dragChange(_draggedIndex: number, _targetIndex: number): void {
    if (this.isSingleData) return;
    const arrData = [...(this.value as IData[])];
    const movedItem = arrData.splice(_draggedIndex, 1)[0];
    arrData.splice(_targetIndex, 0, movedItem);
    this.setValue(arrData);
  }

  /**
   * @description 表单数据变更通知
   * @param {string[]} names
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlRepeaterController
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    await super.dataChangeNotify(names);
    const { resetItemNames } = this.model;

    // 重置项，变更时自己的值置空
    let isReset = false;
    if (resetItemNames && resetItemNames.length > 0) {
      resetItemNames.forEach((resetItemName: string) => {
        if (names.includes(resetItemName)) {
          isReset = true;
        }
      });
    }
    if (isReset) {
      this.setValue(null);
    }

    // 自身对应属性变更时，触发表单项更新
    if (names.includes(this.name)) {
      await this.updateFormItem();
    }
  }

  /**
   * @description 表单状态变更通知
   * @param {FormNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlRepeaterController
   */
  async formStateNotify(state: FormNotifyState): Promise<void> {
    super.formStateNotify(state);
    // 初始化完成之后设置更新默认值
    if (state === FormNotifyState.LOAD && this.value) {
      Array.isArray(this.value)
        ? this.value.forEach((item: IData) =>
            this.setDefaultValue(item, 'update'),
          )
        : this.setDefaultValue(this.value, 'update');
    }
  }

  /**
   * @description 设置默认值
   * @param {IData} data
   * @param {('create' | 'update')} type
   * @memberof FormMDCtrlRepeaterController
   */
  setDefaultValue(data: IData, type: 'create' | 'update'): void {
    // 递归所有的表单项，设置默认值
    recursiveIterate(
      this.model,
      (item: IDEEditFormItem) => {
        if (item.detailType === 'FORMITEM') {
          const { createDVT, createDV, updateDVT, updateDV, valueFormat } =
            item;
          const valueType = type === 'create' ? createDVT : updateDVT;
          const defaultValue = type === 'create' ? createDV : updateDV;
          const name = item.id!.toLowerCase();
          const defaultVal = getDefaultValue(
            {
              name,
              valueType,
              defaultValue,
              valueFormat,
            },
            { data, context: this.context, params: this.params },
          );
          // 没有值的才赋值默认值
          if (isNil(data[name]) && defaultVal !== undefined)
            data[name] = defaultVal;
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
      },
    );
  }
}
