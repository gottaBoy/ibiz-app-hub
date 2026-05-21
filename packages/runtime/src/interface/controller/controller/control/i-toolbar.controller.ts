import { IDEToolbar } from '@ibiz/model-core';
import { IToolbarEvent } from '../../event';
import { IToolbarState } from '../../state';
import { IControlController } from './i-control.controller';
import { AppCounter } from '../../../../service';
import { IApiToolbarController } from '../../../api';
import { IViewController } from '../view';
import { IToolbarItemProvider } from '../../../provider';
import { ControlController } from '../../../../controller';

/**
 * @description 工具栏控制器接口
 * @export
 * @interface IToolbarController
 * @extends {IControlController<T, S, E>}
 * @extends {IApiToolbarController<T, S>}
 * @template T
 * @template S
 * @template E
 */
export interface IToolbarController<
  T extends IDEToolbar = IDEToolbar,
  S extends IToolbarState = IToolbarState,
  E extends IToolbarEvent = IToolbarEvent,
> extends IControlController<T, S, E>,
    IApiToolbarController<T, S> {
  /**
   * @description 视图控制器
   * @type {IViewController}
   * @memberof IToolbarController
   */
  view: IViewController;

  /**
   * @description 工具栏项适配器集合
   * @type {{ [key: string]: IToolbarItemProvider }}
   * @memberof IToolbarController
   */
  itemProviders: { [key: string]: IToolbarItemProvider };

  /**
   * @description 根据数据计算工具栏权限和状态
   * @param {IData} [data]
   * @param {string} [appDeId]
   * @param {IParams} [params]
   * @returns {*}  {Promise<void>}
   * @memberof IToolbarController
   */
  calcButtonState(
    data?: IData,
    appDeId?: string,
    params?: IParams,
  ): Promise<void>;

  /**
   * @description  计数器对象
   * @type {AppCounter}
   * @memberof IToolbarController
   */
  counter?: AppCounter;

  /**
   * @description 界面行为数据部件
   * @type {ControlController}
   * @memberof IToolbarController
   */
  xdataControl?: ControlController;
}
