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
   * @platform mob
   * @memberof IApiGlobalConfig
   */
  mobShowAppTitle: boolean;

  /**
   * @description 移动端home视图路由替换模式，为replace时将会使用router.replace进行路由跳转，为default时使用router.push进行路由跳转
   * @type {('default' | 'replace')}
   * @default default
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobHomeRouteMode: 'default' | 'replace';

  /**
   * @description 获取微信授权签名请求路径
   * @type {string}
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobGetSignUrl: string;

  /**
   * @description 获取微信授权签名请求方式
   * @type {string}
   * @default post
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobGetSignMethod: string;

  /**
   * @description 是否开启微信调试模式
   * @type {boolean}
   * @default false
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobWeChatDebug: boolean;

  /**
   * @description 是否显示文件上传loading
   * @type {boolean}
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  showUploadLoading: boolean;

  /**
   * @description 是否显示移动端返回顶部按钮
   * @type {boolean}
   * @default false
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobShowBackTop: boolean;

  /**
   * @description 是否启用移动端搜索栏搜索历史记录功能
   * @type {boolean}
   * @default false
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  mobEnableStoredQuery: boolean;

  /**
   * @description 移动端工具栏的显示模式，可选值包含IMMEDIATE（即时渲染模式）、COLLAPSIBLE（可折叠模式）
   * @type {('IMMEDIATE' | 'COLLAPSIBLE')}
   * @default IMMEDIATE
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  toolbarShowMode: 'IMMEDIATE' | 'COLLAPSIBLE';

  /**
   * @description 移动端工具栏分组与行为组的展示模式，可选值包含DEFAULT（气泡模式，组内容以悬浮气泡形式展示）、ACTIONSHEET（行为列表模式，组内容以下拉抽屉形式展示）
   * @type {('DEFAULT' | 'ACTIONSHEET')}
   * @default ACTIONSHEET
   * @platform mob
   * @memberof IApiGlobalMobConfig
   */
  toolbarGroupShowMode: 'DEFAULT' | 'ACTIONSHEET';
}
