/**
 * @description 全屏工具类
 * @export
 * @interface IApiFullscreenUtil
 */
export interface IApiFullscreenUtil {
  /**
   * @description 指定元素全屏
   * @param {HTMLDivElement} div 元素
   * @param {{ class?: string }} [data] 全屏配置，class: 全屏CSS类名
   * @memberof IApiFullscreenUtil
   */
  openElementFullscreen(div: HTMLDivElement, data?: { class?: string }): void;

  /**
   * @description 退出全屏
   * @memberof IApiFullscreenUtil
   */
  closeElementFullscreen(): void;
}
