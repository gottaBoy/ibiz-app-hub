/* eslint-disable no-param-reassign */
import { RuntimeError } from '@ibiz-template/core';
import { IValueItemEditor, IDEGridEditItem } from '@ibiz/model-core';
import Schema from 'async-validator';
import { isNilOrEmpty } from 'qx-util';
import {
  IApiGridFieldEditColumnController,
  IEditorContainerController,
  IEditorController,
  IEditorProvider,
} from '../../../../../interface';
import { findEditItem } from '../../../../../model';
import { getEditorProvider } from '../../../../../register';
import { Srfuf } from '../../../../../service';
import { filterValueRules } from '../../../../../utils';
import { GridNotifyState } from '../../../../constant';
import { generateEditorRules, generateRules } from '../../../../utils';
import { GridRowState } from '../../grid/grid-row.state';
import { GridFieldColumnController } from '../grid-field-column';

/**
 * @description 表格编辑列控制器
 * @export
 * @class GridFieldEditColumnController
 * @extends {GridFieldColumnController}
 * @implements {IEditorContainerController}
 * @implements {IApiGridFieldEditColumnController}
 */
export class GridFieldEditColumnController
  extends GridFieldColumnController
  implements IEditorContainerController, IApiGridFieldEditColumnController
{
  /**
   * 表格编辑项模型
   *
   * @author lxm
   * @date 2022-11-14 15:11:57
   * @type {IDEGridEditItem}
   */
  editItem!: IDEGridEditItem;

  /**
   * 编辑器控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @type {IEditorController}
   */
  editor!: IEditorController;

  /**
   * 编辑器适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @type {EditorController}
   */
  editorProvider?: IEditorProvider;

  /**
   * 值规则
   *
   * @author lxm
   * @date 2023-10-18 03:39:40
   * @type {IData[]}
   */
  rules: IData[] = [];

  /**
   * 表格编辑项校验器实例
   *
   * @author lxm
   * @date 2022-09-04 18:09:56
   * @private
   * @type {Schema}
   */
  private validator!: Schema;

  /**
   * 单位
   * @author lxm
   * @date 2023-05-24 05:46:52
   * @readonly
   * @type {(string | undefined)}
   */
  get unitName(): string | undefined {
    return this.editItem.unitName;
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
   * 值项
   * @author lxm
   * @date 2023-05-31 02:31:27
   * @readonly
   * @type {(string | undefined)}
   */
  get valueItemName(): string | undefined {
    if (this.editItem.editor) {
      return (this.editItem.editor as IValueItemEditor).valueItemName;
    }
    return undefined;
  }

  /**
   * 初始化方法，生成表格编辑项控制器
   *
   * @author lxm
   * @date 2022-11-14 13:11:33
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onInit(): Promise<void> {
    await super.onInit();

    const editItem = findEditItem(this.grid.model, this.model.codeName!);
    if (editItem) {
      this.editItem = editItem;
      // 初始化操作,隐藏项不需要编辑器控制器
      if (
        this.editItem.editor &&
        this.editItem.editor.editorType !== 'HIDDEN'
      ) {
        this.editorProvider = await getEditorProvider(
          this.editItem.editor,
          this.model,
          this.grid.model,
        );
        if (this.editorProvider) {
          this.editor = await this.editorProvider.createController(
            this.editItem.editor,
            this,
          );
          await this.initRules();
        }
      }
    }
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
    const editItemsVRs = filterValueRules(
      this.grid.model.degridEditItemVRs || [],
      this.fieldName,
    );
    if (editItemsVRs) {
      this.rules.push(
        ...generateRules(editItemsVRs, this.fieldName, this.valueItemName),
      );
    }

    if (this.editItem.editor) {
      this.rules.push(...generateEditorRules(this.editItem.editor));
    }

    if (this.rules.length > 0) {
      // 初始化async-validator实例
      this.validator = new Schema({ [this.fieldName]: this.rules });
    }
  }

  /**
   * 设置行属性的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {GridRowState} row 行状态对象
   * @param {unknown} value 要设置的值
   * @param {string} name 要设置的表单数据的属性名称
   * @param {boolean} ignore 忽略脏值检查
   */
  async setRowValue(
    row: GridRowState,
    value: unknown,
    name?: string,
    ignore: boolean = false,
  ): Promise<void> {
    name = name || this.fieldName;
    await this.grid.setRowValue(row, name, value, ignore);
  }

  /**
   * 通知所有表格编辑项成员表格编辑项数据变更
   *
   * @author lxm
   * @date 2022-09-06 15:09:40
   * @param {GridRowState} row 行数据控制器
   * @param {string[]} names 变更属性名称
   */
  async dataChangeNotify(row: GridRowState, names: string[]): Promise<void> {
    // 重置项，变更时自己的值置空
    const { resetItemNames } = this.editItem;
    let isReset = false;
    if (resetItemNames && resetItemNames.length > 0) {
      resetItemNames.forEach((resetItemName: string) => {
        if (names.includes(resetItemName)) {
          isReset = true;
        }
      });
    }
    if (isReset) {
      this.setRowValue(row, null);
    }

    // 计算禁用状态
    this.calcColumnDisabled(row);

    // 计算必填状态
    const oldRequired = row.editColStates[this.fieldName].required;
    this.calcColumnRequired(row);
    const requiredChanged =
      oldRequired !== row.editColStates[this.fieldName].required;

    // 保存前由保存调用校验，其他只有值项和自身值变化时校验
    // 必填发生变更时也校验
    if (
      requiredChanged ||
      names.includes(this.fieldName) ||
      names.includes(this.valueItemName!)
    ) {
      const result = await this.validate(row);
      // todo校验不通过是否报错
      if (!result) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.control.grid.checksumErrors', {
            codeName: this.editItem.codeName,
            fieldName: row.errors[this.fieldName],
          }),
        );
      }
    }

    // 有编辑列更新，且是自身变更时，触发编辑列更新
    if (
      names.includes(this.fieldName) &&
      this.editItem.degridEditItemUpdateId
    ) {
      await this.grid.updateGridEditItem(
        row,
        this.editItem.degridEditItemUpdateId,
      );
    }
  }

  /**
   * 表格状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  gridStateNotify(row: GridRowState, _state: GridNotifyState): void {
    this.calcColumnDisabled(row);
    this.calcColumnReadonly(row);
    this.calcColumnRequired(row);
  }

  /**
   * 计算列的禁用状态
   * @author lxm
   * @date 2023-06-26 06:19:00
   * @param {GridRowState} row
   */
  calcColumnDisabled(row: GridRowState): void {
    let enable = this.calcEnableCond(row);

    // 上层计算为启用时计算预定义项启用逻辑
    if (enable && this.grid.scheduler) {
      const itemEnable = this.grid.scheduler.triggerItemEnable(this.fieldName, {
        data: [row.data],
      });
      if (itemEnable !== undefined) {
        enable = itemEnable;
      }
    }

    // 修改state
    row.editColStates[this.fieldName]!.disabled = !enable;
  }

  /**
   * 计算列的必填状态
   * @author lxm
   * @date 2023-06-26 06:23:25
   * @param {GridRowState} row
   */
  calcColumnRequired(row: GridRowState): void {
    // 允许为空无配置时或配置为是=>true,配置为否=>""
    let allowEmpty = this.editItem.allowEmpty === true;

    if (allowEmpty && this.grid.scheduler) {
      const itemBlank = this.grid.scheduler.triggerItemBlank(this.fieldName, {
        data: [row.data],
      });
      if (itemBlank !== undefined) {
        allowEmpty = itemBlank;
      }
    }
    // 修改state
    row.editColStates[this.fieldName]!.required = !allowEmpty;
  }

  /**
   * 计算列的只读状态
   * @author lxm
   * @date 2023-06-26 06:19:00
   * @param {GridRowState} row
   */
  calcColumnReadonly(row: GridRowState): void {
    const isReadOnly = !!this.editItem.editor?.readOnly;
    // 修改state
    if (isReadOnly) {
      row.editColStates[this.fieldName]!.readonly = isReadOnly;
    }
  }

  /**
   * 计算启用项的禁用
   * 启用返回true,不启用返回false
   *
   * @author lxm
   * @date 2022-09-20 00:09:57
   * @returns {*}
   */
  calcEnableCond(row: GridRowState): boolean {
    const { enableCond } = this.editItem;
    const isNew = row.data.srfuf === Srfuf.CREATE;
    switch (enableCond) {
      case 0: // 不启用
        return false;
      case 1: // 新建启用
        return isNew;
      case 2: // 更新启用
        return !isNew;
      default: // 全部启用
        return true;
    }
  }

  /**
   * 表格编辑项值规则校验（如果表格编辑项不显示则不校验直接返回true）
   *
   * @author lxm
   * @date 2022-09-01 22:09:29
   */
  async validate(row: GridRowState): Promise<boolean> {
    const editName = this.fieldName;
    // 表格单元格行编辑不支持必填校验
    const { editShowMode } = this.grid;
    if (
      editShowMode !== 'cell' &&
      row.editColStates[editName]!.required === true &&
      (typeof row.data[editName] === 'string'
        ? isNilOrEmpty(row.data[editName].trimEnd())
        : isNilOrEmpty(row.data[editName]))
    ) {
      row.errors[editName] = ibiz.i18n.t(
        'runtime.controller.control.form.fillIn',
        {
          caption: this.model.caption || '',
        },
      );
      return false;
    }

    if (this.rules.length && this.validator) {
      try {
        await this.validator.validate(row.data);
      } catch (error) {
        const { errors } = error as IData;
        row.errors[editName] = (errors as IData[])[0].message;
        return false;
      }
    }
    row.errors[editName] = null;
    return true;
  }
}
