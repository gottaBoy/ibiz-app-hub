import { IPanel } from '@ibiz/model-core';
import { AsyncSeriesHook } from 'qx-util';
import { IPanelEvent } from '../../event';
import { IPanelState } from '../../state';
import { IControlController } from './i-control.controller';
import { IPanelItemController } from './panel-item';
import { IController } from '../i.controller';
import { IApiPanelController } from '../../../api';
import { IViewController } from '../view';
import { AppCounter } from '../../../../service';

/**
 * @description 面板控制器
 * @export
 * @interface IPanelController
 * @extends {IControlController<T, S, E>}
 * @extends {IApiPanelController}
 * @template T
 * @template S
 * @template E
 */
export interface IPanelController<
  T extends IPanel = IPanel,
  S extends IPanelState = IPanelState,
  E extends IPanelEvent = IPanelEvent,
> extends IControlController<T, S, E>,
    IApiPanelController<T, S> {
  /**
   * @description 当前上下文环境的视图控制器
   * @type {IViewController}
   * @memberof IControlController
   */
  view: IViewController;

  /**
   * @description 钩子
   * @type {{
   *     validate: AsyncSeriesHook<[], { result: boolean[]; parentId?: string }>;
   *   }}
   * @memberof IPanelController
   */
  hooks: {
    validate: AsyncSeriesHook<[], { result: boolean[]; parentId?: string }>;
  };

  /**
   * @description 所有面板成员的控制器
   * @type {{ [key: string]: IPanelItemController }}
   * @memberof IPanelController
   */
  panelItems: { [key: string]: IPanelItemController };

  /**
   * @description 容器控制器（可能是视图控制器，也可能是部件控制器）
   * @type {IController}
   * @memberof IPanelController
   */
  container?: IController;

  /**
   * @description 计数器
   * @type {{ [key: string]: AppCounter }}
   * @memberof IPanelController
   */
  counters: { [key: string]: AppCounter };

  /**
   * @description 值校验
   * @param {string} [parentId] 数据父容器标识
   * @returns {*}  {Promise<boolean>}
   * @memberof IPanelController
   */
  validate(parentId?: string): Promise<boolean>;
}
