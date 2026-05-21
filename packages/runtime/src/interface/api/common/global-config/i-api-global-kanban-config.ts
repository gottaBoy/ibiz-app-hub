/**
 * @description 全局看板配置
 * @export
 * @interface IApiGlobalKanbanConfig
 */
export interface IApiGlobalKanbanConfig {
  /**
   * @description 启用全屏
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalKanbanConfig
   */
  enableFullScreen: boolean;
  /**
   * @description 启用分组隐藏
   * @type {boolean}
   * @default false
   * @platform web
   * @memberof IApiGlobalKanbanConfig
   */
  enableGroupHidden: boolean;
}
