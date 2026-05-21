/**
 * @description 全局视图配置
 * @export
 * @interface IApiGlobalViewConfig
 */
export interface IApiGlobalViewConfig {
  /**
   * @description 是否启用信息栏，只有该参数为 true 后才会识别模型的 isShowDataInfoBar 来控制是否显示信息栏，为 false 则一律不显示信息栏。
   * @default true
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  enableDataInfoBar: boolean;

  /**
   * @description 用于控制全局哪些导航部件启用缓存，全大写。TABEXPPANEL:GRIDEXPBAR: - :分隔每个导航部件的缓存开关，必须用:结尾，如：TABEXPPANEL:开启表格导航部件缓存，GRIDEXPBAR:开启分页导航部件缓存。
   * @default TABEXPPANEL:
   * @type {string}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  expCacheMode: string;

  /**
   * @description 是否禁用分页导航栏，该参数为true时首页不显示分页导航栏
   * @default false
   * @type {boolean}
   * @platform web
   * @memberof IApiGlobalViewConfig
   */
  disableHomeTabs: boolean;

  /**
   * @description 移动端是否展示返回按键
   * @default true
   * @type {boolean}
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  mobShowPresetBack: boolean;

  /**
   * @description 移动端是否显示视图头
   * @default true
   * @type {boolean}
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  mobShowViewHeader: boolean;

  /**
   * @description 用户操作超时周期（单位：毫秒），超出该时间将刷新用户访问状态，用于协同编辑场景
   * @default 300000
   * @type {number}
   * @platform web
   * @memberof IApiGlobalViewConfig
   */
  timeoutDuration: number;

  /**
   * @description 是否只显示信息栏，为true时，存在主数据信息则只显示信息栏，无主数据信息时显示标题
   * @type {boolean}
   * @default false
   * @platform web
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  onlyShowDataInfo: boolean;

  /**
   * @description 全局视图访问权限定义，1：未登录用户、 2：登录用户、 3：未登录用户及登录用户、 4：登录用户且拥有指定资源能力
   * @type {1 | 2 | 3 | 4}
   * @default 3
   * @platform web
   * @platform mob
   * @memberof IApiGlobalViewConfig
   */
  viewAccUserMode: 1 | 2 | 3 | 4;
}
