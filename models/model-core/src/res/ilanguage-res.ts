import { IModelObject } from '../imodel-object';

/**
 *
 * @export
 * @interface ILanguageRes
 */
export interface ILanguageRes extends IModelObject {
  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 默认内容
   * @type {string}
   * 来源  getDefaultContent
   */
  defaultContent?: string;

  /**
   * 语言资源标记
   * @type {string}
   * 来源  getLanResTag
   */
  lanResTag?: string;

  /**
   * 语言资源类型
   * @description 值模式 [平台语言资源类型] {DE.LNAME：实体逻辑名称（DE.LNAME.*）、 DEF.LNAME：属性逻辑名称（DEF.LNAME.*）、 CL.ITEM.LNAME：代码表项（CL.ITEM.LNAME.*）、 CL.ITEM.TOOLTIP：代码表项提示（CL.ITEM.TOOLTIP.*）、 TBB.TEXT：工具栏按钮文本（TBB.TEXT.*）、 TBB.TOOLTIP：工具栏按钮提示（TBB.TOOLTIP.*）、 MENUITEM.CAPTION：菜单项文本（MENUITEM.CAPTION.*）、 PAGE.HEADER：界面头部标题（PAGE.HEADER.*）、 PAGE.COMMON：界面常规（PAGE.COMMON.*）、 PAGE：界面文本（PAGE.*）、 CONTROL：控件文本（CONTROL.*）、 ERROR.STD：标准错误（ERROR.STD.*）、 CTRL：处理逻辑（CTRL.*）、 COMMON：通用（COMMON.*）、 OTHER：其它（OTHER.*） }
   * @type {( string | 'DE.LNAME' | 'DEF.LNAME' | 'CL.ITEM.LNAME' | 'CL.ITEM.TOOLTIP' | 'TBB.TEXT' | 'TBB.TOOLTIP' | 'MENUITEM.CAPTION' | 'PAGE.HEADER' | 'PAGE.COMMON' | 'PAGE' | 'CONTROL' | 'ERROR.STD' | 'CTRL' | 'COMMON' | 'OTHER')}
   * 来源  getLanResType
   */
  lanResType?:
    | string
    | 'DE.LNAME'
    | 'DEF.LNAME'
    | 'CL.ITEM.LNAME'
    | 'CL.ITEM.TOOLTIP'
    | 'TBB.TEXT'
    | 'TBB.TOOLTIP'
    | 'MENUITEM.CAPTION'
    | 'PAGE.HEADER'
    | 'PAGE.COMMON'
    | 'PAGE'
    | 'CONTROL'
    | 'ERROR.STD'
    | 'CTRL'
    | 'COMMON'
    | 'OTHER';

  /**
   * 引用标志
   * @type {boolean}
   * @default false
   * 来源  getRefFlag
   */
  refFlag?: boolean;
}
