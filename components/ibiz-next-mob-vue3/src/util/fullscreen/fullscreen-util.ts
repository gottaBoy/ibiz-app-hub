/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createApp } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IBizFullscreenHeader } from '../../common/fullscreen-header/fullscreen-header';

/**
 * 全屏全局工具类
 *
 * @export
 * @class FullscreenUtil
 */
export class FullscreenUtil {
  /**
   * Creates an instance of FullscreenUtil.
   * @memberof FullscreenUtil
   */
  constructor() {}

  /**
   * @description 全屏dom
   * @type {(HTMLElement | null)}
   * @memberof FullscreenUtil
   */
  fullscreenElement: HTMLElement | null = null;

  /**
   *是否全屏状态
   *
   * @readonly
   * @memberof FullscreenUtil
   */
  get isFullScreen() {
    return (
      !!this.fullscreenElement &&
      document.fullscreenElement === this.fullscreenElement
    );
  }

  /**
   * 全屏样式
   * @author fzh
   * @date 2024-07-15 19:39:40
   */
  public FullscreenClass: string = 'full-screen';

  /**
   * 指定元素全屏
   * @author fzh
   * @date 2024-07-09 19:39:40
   */
  public openElementFullscreen(div: HTMLDivElement, data?: IParams): void {
    if (data?.class) {
      this.FullscreenClass = data.class;
    }
    if (!this.isFullScreen && div) {
      const ns = useNamespace(this.FullscreenClass);
      if (this.FullscreenClass) {
        div.classList.add(ns.b());
      }

      const content = document.createElement('div');
      content.classList.add(ns.e('header'));
      const app = createApp(IBizFullscreenHeader, {
        title: data?.srftitle,
      });
      app.mount(content);
      // 直接操作传进来的元素
      div.insertBefore(content, div.children[0]);
      this.fullscreenElement = div;
    }
  }

  /**
   * 页面退出全屏
   * @author fzh
   * @date 2024-07-09 19:39:40
   */
  public closeElementFullscreen(): void {
    // 退出前移除全屏元素的全屏样式
    if (!this.fullscreenElement) {
      return;
    }
    const ns = useNamespace(this.FullscreenClass);
    this.fullscreenElement.classList.remove(ns.b());
    const header = this.fullscreenElement.querySelector(`.${ns.e('header')}`);
    if (header) {
      header.remove();
    }
    this.fullscreenElement = null;
  }
}
