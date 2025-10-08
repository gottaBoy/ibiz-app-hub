import { IControlItem } from '../icontrol-item';
import { ILayout } from '../layout/ilayout';
import { ILayoutItem } from '../layout/ilayout-item';
import { ILayoutPos } from '../layout/ilayout-pos';
import { IPanelItemCatGroupLogic } from './ipanel-item-cat-group-logic';
import { ILanguageRes } from '../../res/ilanguage-res';
import { ISysCss } from '../../res/isys-css';
import { ISysImage } from '../../res/isys-image';

/**
 *
 * 面板项模型对象基础接口
 * 子接口类型识别属性[itemType]
 * @export
 * @interface IPanelItem
 */
export interface IPanelItem extends IControlItem, ILayoutItem {
  /**
   * 标题语言资源
   *
   * @type {ILanguageRes}
   * 来源  getCapPSLanguageRes
   */
  capLanguageRes?: ILanguageRes;

  /**
   * 标题
   * @type {string}
   * 来源  getCaption
   */
  caption?: string;

  /**
   * 内容高度
   * @type {number}
   * @default 0.0
   * 来源  getContentHeight
   */
  contentHeight?: number;

  /**
   * 内容宽度
   * @type {number}
   * @default 0.0
   * 来源  getContentWidth
   */
  contentWidth?: number;

  /**
   * 计数器标识
   * @type {string}
   * 来源  getCounterId
   */
  counterId?: string;

  /**
   * 计数器模式
   * @description 值模式 [计数器显示模式] {0：默认、 1：0 值时隐藏 }
   * @type {( number | 0 | 1)}
   * @default 0
   * 来源  getCounterMode
   */
  counterMode?: number | 0 | 1;

  /**
   * 项直接样式
   * @type {string}
   * 来源  getCssStyle
   */
  cssStyle?: string;

  /**
   * 动态样式表
   * @type {string}
   * 来源  getDynaClass
   */
  dynaClass?: string;

  /**
   * 高度
   * @type {number}
   * @default 0.0
   * 来源  getHeight
   */
  height?: number;

  /**
   * 成员样式
   * @description 值模式 [部件成员样式] {DEFAULT：默认样式、 STYLE2：样式2、 STYLE3：样式3、 STYLE4：样式4 }
   * @type {( string | 'DEFAULT' | 'STYLE2' | 'STYLE3' | 'STYLE4')}
   * 来源  getItemStyle
   */
  itemStyle?: string | 'DEFAULT' | 'STYLE2' | 'STYLE3' | 'STYLE4';

  /**
   * 成员类型
   * @type {string}
   * 来源  getItemType
   */
  itemType?: string;

  /**
   * 标签直接样式
   * @type {string}
   * 来源  getLabelCssStyle
   */
  labelCssStyle?: string;

  /**
   * 标签动态样式表
   * @type {string}
   * 来源  getLabelDynaClass
   */
  labelDynaClass?: string;

  /**
   * 标签样式表对象
   *
   * @type {ISysCss}
   * 来源  getLabelPSSysCss
   */
  labelSysCss?: ISysCss;

  /**
   * 应用计数器引用
   *
   * @type {string}
   * 来源  getPSAppCounterRef
   */
  appCounterRefId?: string;

  /**
   * 布局设置
   *
   * @type {ILayout}
   * 来源  getPSLayout
   */
  layout?: ILayout;

  /**
   * 位置
   *
   * @type {ILayoutPos}
   * 来源  getPSLayoutPos
   */
  layoutPos?: ILayoutPos;

  /**
   * 面板成员动态逻辑
   *
   * @type {IPanelItemCatGroupLogic[]}
   * 来源  getPSPanelItemGroupLogics
   */
  panelItemGroupLogics?: IPanelItemCatGroupLogic[];

  /**
   * 界面样式表
   *
   * @type {ISysCss}
   * 来源  getPSSysCss
   */
  sysCss?: ISysCss;

  /**
   * 图片对象
   *
   * @type {ISysImage}
   * 来源  getPSSysImage
   */
  sysImage?: ISysImage;

  /**
   * 前端扩展插件
   *
   * @type {string}
   * 来源  getPSSysPFPlugin
   */
  sysPFPluginId?: string;

  /**
   * 宽度
   * @type {number}
   * @default 0.0
   * 来源  getWidth
   */
  width?: number;

  /**
   * 显示标题
   * @type {boolean}
   * @default false
   * 来源  isShowCaption
   */
  showCaption?: boolean;
}
