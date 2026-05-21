import { IExpBar } from '@ibiz/model-core';
import { IExpBarControlEvent } from '../../event';
import { IExpBarControlState } from '../../state';
import { IControlController } from './i-control.controller';
import { IApiExpBarControlController } from '../../../api';
import { IViewController } from '../view';

/**
 * @description 导航栏控制器接口
 * @export
 * @interface IExpBarControlController
 * @extends {IControlController<T, S, E>}
 * @extends {IApiExpBarControlController<T, S>}
 * @template T
 * @template S
 * @template E
 */
export interface IExpBarControlController<
  T extends IExpBar = IExpBar,
  S extends IExpBarControlState = IExpBarControlState,
  E extends IExpBarControlEvent = IExpBarControlEvent,
> extends IControlController<T, S, E>,
    IApiExpBarControlController<T, S> {
  /**
   * @description 视图控制器
   * @type {IViewController}
   * @memberof IExpBarControlController
   */
  view: IViewController;

  /**
   * @description 获取导航视图消息
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @returns {*}  {INavViewMsg}
   * @memberof IExpBarControlController
   */
  getNavViewMsg(data: IData, context: IContext, params: IParams): IData;

  /**
   * @description 路由变更处理回调
   * @param {{ srfnav: string; path: string }} info
   * @returns {*}  {Promise<void>}
   * @memberof IExpBarControlController
   */
  onRouterChange(info: { srfnav: string; path: string }): Promise<void>;
}
