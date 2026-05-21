import { IMicroAppConfig } from '../common';

/**
 * @description 微应用配置中心(仅供全代码使用)
 * @export
 * @interface IMicroAppConfigCenter
 */
export interface IMicroAppConfigCenter {
  /**
   * @description 注册微应用
   * @param {IMicroAppConfig[]} apps 微应用列表
   * @memberof IMicroAppConfigCenter
   */
  registerMicroApps(apps: IMicroAppConfig[]): void;

  /**
   * @description 获取微应用列表
   * @returns {*}  {IMicroAppConfig[]}
   * @memberof IMicroAppConfigCenter
   */
  getMicroApps(): IMicroAppConfig[];

  /**
   * @description 获取指定名称的微应用
   * @param {string} name 微应用名称
   * @returns {*}  {(IMicroAppConfig | undefined)}
   * @memberof IMicroAppConfigCenter
   */
  getMicroApp(name: string): IMicroAppConfig | undefined;

  /**
   * @description 获取插件基础路径
   * @param {string} name 微应用名称
   * @returns {*}  {string}
   * @memberof IMicroAppConfigCenter
   */
  getPluginBaseUrl(name: string): string;
}
