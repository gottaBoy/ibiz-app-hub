import { IButtonMenu, IDomEditor } from '@wangeditor/editor';

/**
 * AI菜单项
 *
 * @export
 * @class AIButtonMenu
 * @implements {IButtonMenu}
 */
class AIButtonMenu implements IButtonMenu {
  /**
   *
   *
   * @type {string}
   * @memberof AIButtonMenu
   */
  title: string = 'AI';

  /**
   *
   *
   * @type {string}
   * @memberof AIButtonMenu
   */
  iconSvg: string =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" height="1em" width="1em" preserveAspectRatio="xMidYMid meet" focusable="false" class="cherry-menu-AIChart"><g id="aae1.Base基础/1.icon图标/2.normal/ai-star" stroke-width="1" fill-rule="evenodd"><path d="M5.817 1.53l3.158 8.797h.054v.152l1.443 4.021-1.402.001-1.041-2.982H2.495l-1.03 2.982L0 14.5 4.671 1.533l1.146-.003zm7.86 5.424V14.5h-1.213V6.954h1.212zM5.248 3.549l-2.342 6.778h4.706L5.249 3.55zM13.046 0c.075 0 .147.02.204.071a.318.318 0 01.094.181l.064.273c.097.417.17.727.255.968.084.24.177.4.31.523.134.124.318.218.599.306.281.088.65.166 1.15.265a.358.358 0 01.195.095c.056.057.083.13.083.213a.289.289 0 01-.083.21.362.362 0 01-.197.094c-.528.093-.918.167-1.214.255-.295.088-.485.187-.621.324-.137.138-.23.324-.31.606-.08.283-.145.651-.23 1.147a.329.329 0 01-.093.184.293.293 0 01-.206.075.308.308 0 01-.207-.072.322.322 0 01-.1-.188l-.006-.033c-.085-.486-.149-.845-.228-1.12-.079-.274-.17-.452-.305-.585-.135-.133-.323-.23-.618-.32s-.683-.168-1.21-.273a.353.353 0 01-.2-.096.29.29 0 01-.08-.208c0-.079.023-.153.079-.211a.35.35 0 01.2-.097c.5-.098.869-.176 1.15-.263.282-.087.465-.18.597-.302.132-.12.224-.278.306-.511.082-.236.151-.539.244-.947l.071-.312a.312.312 0 01.102-.183.311.311 0 01.205-.069z" id="aae形状结合"></path></g></svg>';

  /**
   *
   *
   * @type {string}
   * @memberof AIButtonMenu
   */
  tag: string = 'button';

  /**
   * 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
   *
   * @return {*}  {boolean}
   * @memberof AIButtonMenu
   */
  isActive(): boolean {
    return false;
  }

  /**
   * 获取菜单执行时的 value ，用不到则返回空 字符串或 false
   *
   * @return {*}  {(string | boolean)}
   * @memberof AIButtonMenu
   */
  getValue(): string | boolean {
    return 'aichart';
  }

  /**
   * 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
   *
   * @return {*}  {boolean}
   * @memberof AIButtonMenu
   */
  isDisabled(): boolean {
    return false;
  }

  /**
   * 点击菜单时触发的函数
   *
   * @param {IDomEditor} editor
   * @memberof AIButtonMenu
   */
  exec(editor: IDomEditor): void {
    editor.emit('aiClick');
  }
}

/**
 * Ai菜单
 */
export const AIMenu = {
  key: 'aichart',
  factory(): AIButtonMenu {
    return new AIButtonMenu();
  },
};
