/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { defaultNamespace } from '@ibiz-template/core';
import { IBizFullscreenToolbar } from '../../common/fullscreen-toolbar/fullscreen-toolbar';

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
   *是否全屏状态
   *
   * @readonly
   * @memberof FullscreenUtil
   */
  get isFullScreen() {
    return !!document.fullscreenElement;
  }

  /**
   * 全屏样式
   * @author fzh
   * @date 2024-07-15 19:39:40
   */
  public FullscreenClass: string = '';

  /**
   * 指定元素全屏
   * @author fzh
   * @date 2024-07-09 19:39:40
   */
  public openElementFullscreen(div: HTMLDivElement, data?: IData): void {
    if (!this.FullscreenClass && data) {
      if (data.class) {
        this.FullscreenClass = data.class;
      }
    }
    if (!document.fullscreenElement && div) {
      div.requestFullscreen();
      if (this.FullscreenClass) {
        div.classList.toggle(this.FullscreenClass);
      }
      div.style.background = `var(--${defaultNamespace}-color-bg-1)`;
      const content = document.createElement('div');
      content.id = 'fullscreen';
      content.style.position = 'absolute';
      content.style.bottom = '20px';
      content.style.left = '45%';
      div.appendChild(content);
      const app = createApp(IBizFullscreenToolbar);
      app.use(ElementPlus);
      app.mount(content);
    }
  }

  /**
   * 页面退出全屏
   * @author fzh
   * @date 2024-07-09 19:39:40
   */
  public closeElementFullscreen(): void {
    document.exitFullscreen();
  }
}
