/**
 * @description 全局通用配置
 * @export
 * @interface IApiGlobalCommonConfig
 */
export interface IApiGlobalCommonConfig {
  /**
   * @description 无值显示文本,当值为空时显示此文本
   * @type {string}
   * @default '-'
   * @memberof IApiGlobalCommonConfig
   */
  emptyText: string;

  /**
   * @description 无值显示模式，值为 'PLACEHOLDER' 时显示占位文本内容，值为 'DEFAULT' 或占位文本无值时显示`emptyText`
   * @type {'DEFAULT' | 'PLACEHOLDER'}
   * @default 'DEFAULT'
   * @memberof IApiGlobalCommonConfig
   */
  emptyShowMode: 'DEFAULT' | 'PLACEHOLDER';

  /**
   * @description 模态参数，打开模态弹框时默认配置，pc端为element-plus 的dialog配置,移动端为vant的dialog配置
   * @type {string}
   * @memberof IApiGlobalCommonConfig
   */
  modalOption?: string;

  /**
   * @description 抽屉参数，打开抽屉时默认配置，pc端为element-plus 的drawer配置，移动端为vant的popup配置
   * @type {string}
   * @memberof IApiGlobalCommonConfig
   */
  drawerOption?: string;

  /**
   * @description 快速搜索提示分隔符
   * @type {string}
   * @default '、'
   * @memberof IApiGlobalCommonConfig
   */
  searchPhSeparator: string;

  /**
   * @description 是否启用传入下载凭证
   * @type {boolean}
   * @memberof IApiGlobalCommonConfig
   */
  enableDownloadTicket: boolean;
}
