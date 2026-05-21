/**
 * @primary
 * @description 可以调用force的控制器接口
 * @export
 * @interface IApiEnforceableController
 */
export interface IApiEnforceableController {
  /**
   * @description 强制更新，触发render函数
   * @param {() => void} [_callback] 回调函数
   * @memberof IApiEnforceableController
   */
  force(_callback?: () => void): void;
}
