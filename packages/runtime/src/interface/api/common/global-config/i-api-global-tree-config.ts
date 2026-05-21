/**
 * @description 全局树配置
 * @export
 * @interface IApiGlobalTreeConfig
 */
export interface IApiGlobalTreeConfig {
  /**
   * @description 右键单击树节点时，是否显示上下文菜单
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalTreeConfig
   */
  contextMenuRightClickInvoke: boolean;

  /**
   * @description 是否启用点击导航（点击节点时直接打开导航视图）,仅移动端生效
   * @type {boolean}
   * @default false
   * @platform mob
   * @memberof IApiGlobalTreeConfig
   */
  enableClickNav: boolean;
}
