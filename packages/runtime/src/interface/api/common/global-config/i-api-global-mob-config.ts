/**
 * @description 全局移动端配置
 * @export
 * @interface IApiGlobalMobConfig
 */
export interface IApiGlobalMobConfig {
  /**
   * @description 移动端是否显示应用标题，为false时设置浏览器标题时只设置视图标题，不添加应用标题
   * @type {boolean}
   * @default true
   * @memberof IApiGlobalConfig
   */
  mobShowAppTitle: boolean;

  /**
   * @description 移动端home视图路由替换模式，为replace时将会使用router.replace进行路由跳转，为default时使用router.push进行路由跳转
   * @type {('default' | 'replace')}
   * @default default
   * @memberof IApiGlobalMobConfig
   */
  mobHomeRouteMode: 'default' | 'replace';
}
