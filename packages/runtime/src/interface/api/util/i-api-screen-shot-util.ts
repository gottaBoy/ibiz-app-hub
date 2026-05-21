/**
 * @description 屏幕截图工具类
 * @export
 * @interface IApiScreenShotUtil
 */
export interface IApiScreenShotUtil {
  /**
   * @description 元素截图
   * @param {HTMLElement} element 需要截图的元素
   * @param {{ container?: HTMLElement; itemClassName?: string }} opts 如果需针对dom内部滚动容器截图，则需配置：滚动容器，滚动容器项类名，用以排除非可视区元素
   * @returns {*}  {(Promise<string | undefined>)} 图片(png格式) base64 字符串
   * @memberof IApiScreenShotUtil
   */
  onScreenShot(
    element: HTMLElement,
    opts: { container?: HTMLElement; itemClassName?: string },
  ): Promise<string | undefined>;
}
