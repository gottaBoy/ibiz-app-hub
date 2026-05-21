import { App, createApp } from 'vue';
import { IScreenShotUtil } from '@ibiz-template/runtime';
import { ScreenShot } from './screen-shot';

/**
 * @description 屏幕截图工具类
 * @export
 * @class ScreenShotUtil
 * @implements {IScreenShotUtil}
 */
export class ScreenShotUtil implements IScreenShotUtil {
  private currentApp: App | null = null;

  private container: HTMLElement | null = null;

  /**
   * Creates an instance of ScreenShotUtil.
   * @memberof ScreenShotUtil
   */
  constructor() {}

  /**
   * @description 销毁组件实例
   * @private
   * @memberof ScreenShotUtil
   */
  private destroyComponent(): void {
    // 卸载Vue应用
    if (this.currentApp && this.container) {
      this.currentApp.unmount();
      this.currentApp = null;
    }

    // 移除DOM元素
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
      this.container = null;
    }
  }

  /**
   * @description 开始截图
   * @param {HTMLElement} element 需要截图的元素
   * @param {{ container?: HTMLElement; itemClassName?: string }} opts 如果需针对dom内部滚动容器截图，则需配置：滚动容器，滚动容器项类名，用以排除非可视区元素
   * @returns {*}  {(Promise<string | undefined>)} 图片(png格式) base64 字符串
   * @memberof ScreenShotUtil
   */
  async onScreenShot(
    element: HTMLElement,
    opts: {
      container?: HTMLElement;
      itemClassName?: string;
    },
  ): Promise<string | undefined> {
    // 如果已有实例存在，先清理
    this.destroyComponent();
    const { container, itemClassName } = opts;
    return new Promise(resolve => {
      // 创建容器元素
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      // 创建Vue应用实例
      this.currentApp = createApp(ScreenShot, {
        element,
        container,
        itemClassName,
        onComplete: (base64: string) => {
          this.destroyComponent();
          resolve(base64);
        },
        onCancel: () => {
          this.destroyComponent();
          resolve(undefined);
        },
      });
      // 挂载组件
      this.currentApp.mount(this.container);
    });
  }
}
