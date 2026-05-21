/**
 * 移动端搭载平台适配器接口
 */
export interface IMobPlatformProvider {
  /**
   * @description 获取是否显示视图头部
   * @return {boolean}
   * @memberof IMobPlatformProvider
   */
  getShowViewHeader(): boolean;

  /**
   * @description 获取是否显示预置返回按钮
   * @return {boolean}
   * @memberof IMobPlatformProvider
   */
  getShowPresetBack(): boolean;
}
