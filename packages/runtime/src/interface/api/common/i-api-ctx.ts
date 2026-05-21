import { IApiController, IApiViewController } from '../controller';

/**
 * @description 上下文环境对象
 * @export
 * @interface IApiCtx
 */
export interface IApiCtx {
  /**
   * @description 当前视图的控制器
   * @type {IApiViewController}
   * @memberof IApiCtx
   */
  view: IApiViewController;

  /**
   * @description 是否已经销毁
   * @type {boolean}
   * @memberof IApiCtx
   */
  isDestroyed: boolean;

  /**
   * @description 父级上下文环境对象
   * @type {IApiCtx}
   * @memberof IApiCtx
   */
  parentCtx?: IApiCtx;

  /**
   * @description 获取指定名称的控制器
   * @param {string} name 控制器名称
   * @param {boolean} [traceRoot] 是否跨越视图作用域，一路向根上找
   * @returns {*}  {(IApiController | undefined)}
   * @memberof IApiCtx
   */
  getController(name: string, traceRoot?: boolean): IApiController | undefined;

  /**
   * @description 获取顶级视图
   * @returns {*}  {IApiViewController}
   * @memberof IApiCtx
   */
  getTopView(): IApiViewController;
}
