import { IApiDataViewControlState } from '../../../api';
import { IButtonContainerState } from '../../common';
import { IMDControlState } from './i-md-control.state';

/**
 * @description 数据视图（卡片）部件状态接口
 * @export
 * @interface IDataViewControlState
 * @extends {IMDControlState}
 * @extends {IApiDataViewControlState}
 */
export interface IDataViewControlState
  extends IMDControlState,
    IApiDataViewControlState {
  /**
   * @description 操作项状态
   * @type {{ [p: string]: IButtonContainerState }}
   * @memberof IKanbanState
   */
  uaState: { [p: string]: IButtonContainerState };
  /**
   * @description 分组界面行为组状态
   * @type {IButtonContainerState}
   * @memberof IDataViewControlState
   */
  groupActionGroupState?: IButtonContainerState;

  /**
   * @description 多数视图可设置排序的数据项集合（移动端使用）
   * @type {Array<{
   *     value: string;
   *     label: string;
   *   }>}
   * @memberof IDataViewControlState
   */
  sortDelistItems: Array<{
    value: string;
    label: string;
  }>;
}
