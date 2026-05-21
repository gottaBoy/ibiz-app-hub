/**
 * @description 部件引擎接口
 * @export
 * @interface ICtrlEngine
 */
export interface ICtrlEngine {
  /**
   * @description 视图created生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof ICtrlEngine
   */
  onCreated(): Promise<void>;

  /**
   * @description 视图mounted生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof ICtrlEngine
   */
  onMounted(): Promise<void>;

  /**
   * @description 视图destroyed生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof ICtrlEngine
   */
  onDestroyed(): Promise<void>;
}
