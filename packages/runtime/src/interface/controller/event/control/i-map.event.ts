import { EventBase } from '../argument';
import { IMDControlEvent } from './i-md-control.event';

/**
 * @descriptio 地图部件事件
 * @primary
 * @export
 * @interface IMapEvent
 * @extends {IMDControlEvent}
 */
export interface IMapEvent extends IMDControlEvent {
  /**
   * @description 地图变更事件（下探，返回）
   * @type {{
   *     event: EventBase;
   *     emitArgs: { data: IData };
   *   }}
   * @memberof IMapEvent
   */
  onMapChange: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 地图区域点击事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: { data: IData };
   *   }}
   * @memberof IMapEvent
   */
  onAreaClick: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 地图散点点击事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: { data: IData };
   *   }}
   * @memberof IMapEvent
   */
  onPointClick: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 点击返回
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof IMapEvent
   */
  onBackClick: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * @description 更新之前
   * @type {{
   *     event: EventBase;
   *     emitArgs: { data: IData };
   *   }}
   * @memberof IMapEvent
   */
  onBeforeUpdate: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 鼠标移入
   * @type {{
   *     event: EventBase;
   *     emitArgs: { params: IData };
   *   }}
   * @memberof IMapEvent
   */
  onMouseOver: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 鼠标移出
   * @type {{
   *     event: EventBase;
   *     emitArgs: { params: IData };
   *   }}
   * @memberof IMapEvent
   */
  onMouseOut: {
    event: EventBase;
    emitArgs: { data: IData };
  };

  /**
   * @description 下钻
   * @type {({
   *     event: EventBase;
   *     emitArgs: { data: IData };
   *   })}
   * @memberof IMapEvent
   */
  onDrillDown: {
    event: EventBase;
    emitArgs: { data: IData };
  };
}
