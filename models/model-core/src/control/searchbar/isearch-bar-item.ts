import { IControlItem } from '../icontrol-item';
import { ILanguageRes } from '../../res/ilanguage-res';
import { ISysCss } from '../../res/isys-css';
import { ISysImage } from '../../res/isys-image';

/**
 *
 * @export
 * @interface ISearchBarItem
 */
export interface ISearchBarItem extends IControlItem {
  /**
   * 标题多语言资源对象
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
   * 项数据
   * @type {string}
   * 来源  getData
   */
  data?: string;

  /**
   * 动态样式表
   * @type {string}
   * 来源  getDynaClass
   */
  dynaClass?: string;

  /**
   * 项类型
   * @description 值模式 [搜索栏项类型] {FILTER：过滤项、 GROUP：分组项、 QUICKSEARCH：快速搜索项 }
   * @type {( string | 'FILTER' | 'GROUP' | 'QUICKSEARCH')}
   * 来源  getItemType
   */
  itemType?: string | 'FILTER' | 'GROUP' | 'QUICKSEARCH';

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
   * 项样式表对象
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
   * 应用实体属性
   *
   * @type {string}
   * 来源  getPSAppDEField
   */
  appDEFieldId?: string;

  /**
   * 过滤项界面样式表
   *
   * @type {ISysCss}
   * 来源  getPSSysCss
   */
  sysCss?: ISysCss;

  /**
   * 项图片对象
   *
   * @type {ISysImage}
   * 来源  getPSSysImage
   */
  sysImage?: ISysImage;
}
