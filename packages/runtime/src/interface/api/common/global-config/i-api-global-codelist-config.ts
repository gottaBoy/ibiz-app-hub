/**
 * @description 全局代码表配置
 * @export
 * @interface IApiGlobalCodeListConfig
 */
export interface IApiGlobalCodeListConfig {
  /**
   * @description 默认代码表超时时间(单位：毫秒)，为避免动态代码表重复加载，当代码表没有配置缓存超时时长时，使用该参数设置代码表超时时间。
   * @type {number}
   * @default 3600000
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCodeListConfig
   */
  timeout: number;
}
