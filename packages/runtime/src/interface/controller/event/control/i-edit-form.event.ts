import { PartialWithObject } from '@ibiz-template/core';
import { EventBase } from '../argument';
import { IFormEvent } from './i-form.event';
import { FormMDCtrlRepeaterController } from '../../../../controller';

export interface EditFormEvent extends EventBase {
  /**
   * 事件参数
   */
  args: IData;
}

/**
 * @primary
 * @description 编辑表单事件
 * @export
 * @interface IEditFormEvent
 * @extends {IFormEvent}
 */
export interface IEditFormEvent extends IFormEvent {
  /**
   * @description 数据加载前
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onBeforeLoad: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据加载成功
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onLoadSuccess: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据加载失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onLoadError: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据保存前
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onBeforeSave: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据保存成功
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onSaveSuccess: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据保存失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onSaveError: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据删除前
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onBeforeRemove: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据删除成功
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onRemoveSuccess: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 数据删除失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onRemoveError: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 表单多数据部件删除成功
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onMDCtrlRemove: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 表单多数据部件新建成功
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onMDCtrlNew: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };

  /**
   * @description 表单多数据部件值改变
   * @type {{
   *     event: EventBase;
   *     emitArgs: {
   *       name: string;
   *       args: FormMDCtrlRepeaterController;
   *     };
   *   }}
   * @memberof IEditFormEvent
   */
  onMDCtrlChange: {
    event: EventBase;
    emitArgs: {
      name: string;
      args: FormMDCtrlRepeaterController;
    };
  };

  /**
   * @description 表单操作完成事件，用于外部调用
   * @type {{
   *     event: EventBase;
   *     emitArgs: PartialWithObject<EditFormEvent, EventBase>;
   *   }}
   * @memberof IEditFormEvent
   */
  onFinish: {
    event: EventBase;
    emitArgs: PartialWithObject<EditFormEvent, EventBase>;
  };
}
