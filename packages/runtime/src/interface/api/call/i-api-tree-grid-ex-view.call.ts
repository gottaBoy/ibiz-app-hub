import { IApiTreeViewCall } from './i-api-tree-view.call';
import { IApiTreeNodeData } from '../state';

/**
 * @description 实体树表格视图（增强）能力
 * @export
 * @interface IApiTreeGridExViewCall
 * @extends {IApiTreeViewCall}
 */
export interface IApiTreeGridExViewCall extends IApiTreeViewCall {
  /**
   * @description 行编辑
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeGridExViewCall
   */
  ToggleRowEdit: {
    args: undefined;
  };
  /**
   * @description 保存行
   * @type {{
   *     args: { data: IApiTreeNodeData[] };
   *   }}
   * @memberof IApiTreeGridExViewCall
   */
  SaveRow: {
    args: { data: IApiTreeNodeData[] };
  };
  /**
   * @description 保存
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeGridExViewCall
   */
  Save: {
    args: undefined;
  };
}
