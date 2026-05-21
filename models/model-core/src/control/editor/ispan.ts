import { ITextBase } from '../itext-base';
import { ICodeListEditor } from './icode-list-editor';

/**
 *
 * 继承父接口类型值[SPAN,SPANEX,SPAN_LINK]
 * @export
 * @interface ISpan
 */
export interface ISpan extends ICodeListEditor, ITextBase {
  /**
   * 数据链接视图
   *
   * @type {string}
   * 来源  getLinkPSAppView
   */
  linkAppViewId?: string;

  /**
   * 浮点精度[PRECISION]
   * @type {number}
   * 来源  getPrecision
   */
  precision?: number;

  /**
   * 小数点位数[SCALE]
   * @type {number}
   * 来源  getScale
   */
  scale?: number;

  /**
   * 支持链接视图[LINKVIEW]
   * @type {boolean}
   * 来源  isEnableLinkView
   */
  enableLinkView?: boolean;
}
