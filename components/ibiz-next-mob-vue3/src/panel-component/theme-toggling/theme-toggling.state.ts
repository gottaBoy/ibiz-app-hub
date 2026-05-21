import { PanelItemState } from '@ibiz-template/runtime';

/**
 * @description 主题切换状态
 * @export
 * @class ThemeTogglingState
 * @extends {PanelItemState}
 */
export class ThemeTogglingState extends PanelItemState {
  /**
   * @description 主题
   * @type {('light' | 'dark' | 'auto' | string)}
   * @memberof ThemeTogglingState
   */
  theme: 'light' | 'dark' | 'auto' | string = '';
}
