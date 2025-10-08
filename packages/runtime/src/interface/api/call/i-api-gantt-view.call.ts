import { IApiMDCtrlLoadParams } from '../controller';
import { IApiTreeGridExViewCall } from './i-api-tree-grid-ex-view.call';

/**
 * @description 实体甘特视图能力
 * @export
 * @interface IApiGanttViewCall
 * @extends {IApiMDViewCall}
 */
export interface IApiGanttViewCall extends IApiTreeGridExViewCall {
  /**
   * @description 新建行
   * @type {{
   *     args?: IApiMDCtrlLoadParams;
   *   }}
   * @memberof IApiGanttViewCall
   */
  NewRow: {
    args?: IApiMDCtrlLoadParams;
  };
}
