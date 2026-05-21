import { EventBase } from './base.event';

/* eslint-disable no-shadow */
export enum FormDetailEventName {
  /**
   * 点击
   */
  CLICK = 'onClick',
  /**
   * 聚焦
   */
  FOCUS = 'onFocus',
  /**
   * 失焦
   */
  BLUR = 'onBlur',
  /**
   * 值变更
   */
  CHANGE = 'onChange',
  /**
   * 回车
   */
  ENTER = 'onEnter',
}

/**
 * 表单成员事件
 * @author lxm
 * @date 2023-08-09 10:52:48
 * @export
 * @interface FormDetailEvent
 * @extends {EventBase}
 */
export interface FormDetailEvent extends EventBase {
  /**
   * 触发的表单成员名称
   * @author lxm
   * @date 2023-03-26 02:02:16
   * @type {string}
   */
  formDetailName: string;

  /**
   * 触发的表单成员事件的名称
   * @author lxm
   * @date 2023-07-26 11:00:37
   * @type {FormDetailEventName}
   */
  formDetailEventName: FormDetailEventName;

  /**
   * 额外参数
   */
  args?: IData;
}
