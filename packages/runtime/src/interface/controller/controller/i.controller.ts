import { IModelObject } from '@ibiz/model-core';
import { ControllerEvent } from '../../../controller/utils';
import { IComponentEvent } from '../event';
import { IEnforceableController } from './common';
import { CTX } from '../../../controller';
import { IApiController } from '../../api';
import { IViewController } from './view';

/**
 * @description 视图，部件控制器基类
 * @export
 * @interface IController
 * @extends {IEnforceableController}
 * @extends {IApiController<T, S>}
 * @template T
 * @template S
 * @template E
 */
export interface IController<
  T extends IModelObject = IModelObject,
  S extends object = object,
  E extends IComponentEvent = IComponentEvent,
> extends IEnforceableController,
    IApiController<T, S> {
  /**
   * @description 事件触发器
   * @type {ControllerEvent<E>}
   * @memberof IController
   */
  evt: ControllerEvent<E>;

  /**
   * @description 子组件的名称，会监听指定子组件的生命周期，影响自身的声明周期。
   * @type {string[]}
   * @memberof IController
   */
  childNames: string[];

  /**
   * @description 获取指定名称的控制器
   * @param {string} name 控制器名称
   * @param {boolean} [traceRoot] 是否跨越视图作用域，一路向根上找。
   * @returns {*}  {(IController | undefined)}
   * @memberof IController
   */
  getController(name: string, traceRoot?: boolean): IController | undefined;

  /**
   * @description 获取上下文环境对象
   * @returns {*}  {CTX}
   * @memberof IController
   */
  getCtx(): CTX;

  /**
   * @description 获取顶级视图的控制器
   * @returns {*}  {IViewController}
   * @memberof IController
   */
  getTopView(): IViewController;

  /**
   * @description 生命周期-创建完成
   * @returns {*}  {Promise<void>}
   * @memberof IController
   */
  created(): Promise<void>;

  /**
   * @description 生命周期-销毁完成
   * @returns {*}  {Promise<void>}
   * @memberof IController
   */
  destroyed(): Promise<void>;

  /**
   * @description 当前视图上下文内有新的控制器产生时触发回调
   * @param {(name: string, c: IController) => void} cb
   * @memberof IController
   */
  listenNewController(cb: (name: string, c: IController) => void): void;
}
