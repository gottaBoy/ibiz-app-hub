import { PanelItemState } from '@ibiz-template/runtime';

/**
 * 面板应用标题状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class PanelAppTitleState
 * @extends {PanelItemState}
 */
export class PanelAppTitleState extends PanelItemState {
  /**
   * @description 应用标题
   * @exposedoc
   * @type {string}
   */
  caption: string = '';

  /**
   * @description  应用标题(收缩时)
   * @exposedoc
   * @type {string}
   */
  caption2: string = '';

  /**
   * @description 应用子标题
   * @exposedoc
   * @type {string}
   */
  subCaption?: string = '';

  /**
   * @description 应用子标题(收缩时)
   * @exposedoc
   * @type {string}
   */
  subCaption2?: string = '';

  /**
   * @description 应用 logo 图片地址
   * @exposedoc
   * @type {string}
   */
  icon: string = '';

  /**
   * @description 应用 logo 图片2地址(收缩时)
   * @exposedoc
   * @type {string}
   */
  icon2: string = '';

  /**
   * @description 是否为 svg 图标
   * @exposedoc
   * @type {boolean}
   */
  isSvg: boolean = false;
}
