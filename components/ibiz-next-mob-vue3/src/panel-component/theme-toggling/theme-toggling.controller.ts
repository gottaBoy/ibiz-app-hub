import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';
import { ThemeTogglingState } from './theme-toggling.state';

/**
 * @description 主题切换控制器
 * @export
 * @class ThemeTogglingController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class ThemeTogglingController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 状态
   * @type {ThemeTogglingState}
   * @memberof ThemeTogglingController
   */
  declare state: ThemeTogglingState;

  /**
   * @description 媒体查询
   * @protected
   * @type {MediaQueryList}
   * @memberof ThemeTogglingController
   */
  protected mediaQuery!: MediaQueryList;

  /**
   * @description 创建状态对象
   * @protected
   * @returns {*}  {ThemeTogglingState}
   * @memberof ThemeTogglingController
   */
  protected createState(): ThemeTogglingState {
    return new ThemeTogglingState(this.parent?.state);
  }

  /**
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof ThemeTogglingController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.state.theme = ibiz.util.theme.getTheme();
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  /**
   * @description 获取系统主题
   * @protected
   * @returns {*}  {('light' | 'dark')}
   * @memberof ThemeTogglingController
   */
  protected getSystemTheme(): 'light' | 'dark' {
    // 检测系统当前是否使用深色主题
    const isDarkMode = this.mediaQuery.matches;
    if (isDarkMode) return 'dark';
    // 系统没有明确偏好 默认为亮色
    return 'light';
  }

  /**
   * @description 处理系统主题变更
   * @protected
   * @param {MediaQueryListEvent} ev
   * @memberof ThemeTogglingController
   */
  protected handleSystemThemeChange(ev: MediaQueryListEvent): void {
    const themeName = ev.matches ? 'dark' : 'light';
    if (this.state.theme === 'auto') ibiz.util.theme.setTheme(themeName);
  }

  /**
   * @description 切换主题
   * @param {string} theme
   * @memberof ThemeTogglingController
   */
  switchTheme(theme: string): void {
    if (theme === this.state.theme) return;
    this.state.theme = theme;
    const themeName = theme === 'auto' ? this.getSystemTheme() : theme;
    ibiz.util.theme.setTheme(themeName);
  }

  /**
   * @description 销毁
   * @memberof ThemeTogglingController
   */
  destroy(): void {
    super.destroy();
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
  }
}
