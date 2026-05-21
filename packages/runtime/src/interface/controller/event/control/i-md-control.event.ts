import { PartialWithObject } from '@ibiz-template/core';
import { EventBase, LoadEvent } from '../argument';
import { IControlEvent } from './i-control.event';

/**
 * 多数据部件事件
 * @description 多数据部件事件
 * @primary
 * @export
 * @interface IMDControlEvent
 * @extends {IControlEvent}
 */
export interface IMDControlEvent extends IControlEvent {
  /**
   * 数据激活事件
   * @description 数据激活事件
   * @type {({
   *     event: EventBase;
   *     emitArgs: { data: IData[]; event?: MouseEvent | undefined };
   *   })}
   * @memberof IMDControlEvent
   */
  onActive: {
    event: EventBase;
    emitArgs: { data: IData[]; event?: MouseEvent | undefined };
  };

  /**
   * 选中数据变更事件
   * @description 选中数据变更事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: { data: IData[] };
   *   }}
   * @memberof IMDControlEvent
   */
  onSelectionChange: {
    event: EventBase;
    emitArgs: { data: IData[] };
  };

  /**
   * 保存之前
   * @description 保存之前
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onBeforeSave: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 保存成功后
   * @description 保存成功后
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onSaveSuccess: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 保存失败
   * @description 保存失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onSaveError: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 删除之前
   * @description 删除之前
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onBeforeRemove: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 删除成功之后
   * @description 删除成功之后
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onRemoveSuccess: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 删除失败
   * @description 删除失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onRemoveError: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 加载前事件
   * @description 加载前事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: Partial<EventBase>;
   *   }}
   * @memberof IMDControlEvent
   */
  onBeforeLoad: {
    event: EventBase;
    emitArgs: Partial<EventBase>;
  };

  /**
   * 加载后处理事件
   * @description 加载后处理事件
   * @type {{
   *     event: LoadEvent;
   *     emitArgs: PartialWithObject<LoadEvent, EventBase>;
   *   }}
   * @memberof IMDControlEvent
   */
  onLoadSuccess: {
    event: LoadEvent;
    emitArgs: PartialWithObject<LoadEvent, EventBase>;
  };

  /**
   * 加载失败
   * @description 加载失败
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMDControlEvent
   */
  onLoadError: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * 导航数据变更
   * @description 导航数据变更
   * @type {({
   *     event: EventBase & { navData: IData };
   *     emitArgs: { navData: IData };
   *   })}
   * @memberof IMDControlEvent
   */
  onNavDataChange: {
    event: EventBase & { navData: IData };
    emitArgs: { navData: IData };
  };
}
