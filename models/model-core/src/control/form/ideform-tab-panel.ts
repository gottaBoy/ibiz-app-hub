import { IDEFormDetail } from './ideform-detail';
import { IDEFormTabPage } from './ideform-tab-page';

/**
 *
 * 继承父接口类型值[TABPANEL]
 * @export
 * @interface IDEFormTabPanel
 */
export interface IDEFormTabPanel extends IDEFormDetail {
  /**
   * 实体数据关系标记
   * @type {string}
   * 来源  getDataRelationTag
   */
  dataRelationTag?: string;

  /**
   * 分页集合
   *
   * @type {IDEFormTabPage[]}
   * 来源  getPSDEFormTabPages
   */
  deformTabPages?: IDEFormTabPage[];
}
