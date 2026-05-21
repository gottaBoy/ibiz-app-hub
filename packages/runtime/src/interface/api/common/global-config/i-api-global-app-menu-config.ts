/**
 * @description 全局菜单配置
 * @export
 * @interface IApiGlobalAppMenuConfig
 */
export interface IApiGlobalAppMenuConfig {
  /**
   * @description 菜单是否根据路由回显激活项，true：回显/false：不回显
   * @type {boolean}
   * @default true
   * @platform web
   * @platform mob
   * @memberof IApiGlobalAppMenuConfig
   */
  enableEcho: boolean;

  /**
   * @description 菜单回显激活模式，'VIEW'：根据视图标识计算 \| 'MENUITEM'：根据菜单项计算
   * @type {boolean}
   * @default VIEW
   * @platform web
   * @memberof IApiGlobalAppMenuConfig
   */
  echoMode: 'VIEW' | 'MENUITEM';

  /**
   * @description 菜单默认收缩
   * @type {boolean}
   * @platform web
   * @memberof IApiGlobalAppMenuConfig
   */
  defaultCollapse: boolean;
}
