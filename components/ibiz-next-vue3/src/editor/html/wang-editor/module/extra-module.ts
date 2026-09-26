import { IButtonMenu, IDomEditor } from '@wangeditor/editor';

/**
 * 附加菜单项
 *
 * @export
 * @class ExtraButtonMenu
 * @implements {IButtonMenu}
 */
export class ExtraButtonMenu implements IButtonMenu {
  /**
   *
   *
   * @type {string}
   * @memberof ExtraButtonMenu
   */
  title: string = '自定义';

  /**
   *
   *
   * @type {string}
   * @memberof ExtraButtonMenu
   */
  iconSvg: string =
    '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fit="" height="1em" width="1em" preserveAspectRatio="xMidYMid meet" focusable="false"><g id="aucaction/plus-circle-fill" stroke-width="1" fill-rule="evenodd"><path d="M8 16A8 8 0 118 0a8 8 0 010 16zm-.6-8.6H4v1.2h3.4V12h1.2V8.6H12V7.4H8.6V4H7.4v3.4z" id="auc形状结合"></path></g></svg>';

  /**
   * @description 模型
   * @type {IData}
   * @memberof ExtraButtonMenu
   */
  model: IData;

  constructor(model: IData) {
    this.model = model;
    this.title = model.caption;
    if (model.sysImage) {
      this.iconSvg = model.sysImage.rawContent;
    }
  }

  /**
   *
   *
   * @type {string}
   * @memberof ExtraButtonMenu
   */
  tag: string = 'button';

  /**
   * 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
   *
   * @return {*}  {boolean}
   * @memberof ExtraButtonMenu
   */
  isActive(): boolean {
    return false;
  }

  /**
   * 获取菜单执行时的 value ，用不到则返回空 字符串或 false
   *
   * @return {*}  {(string | boolean)}
   * @memberof ExtraButtonMenu
   */
  getValue(): string | boolean {
    return 'custom';
  }

  /**
   * 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
   *
   * @return {*}  {boolean}
   * @memberof ExtraButtonMenu
   */
  isDisabled(): boolean {
    return false;
  }

  /**
   * 点击菜单时触发的函数
   *
   * @param {IDomEditor} editor
   * @memberof ExtraButtonMenu
   */
  exec(editor: IDomEditor): void {
    editor.emit('customAction', this.model);
  }
}
