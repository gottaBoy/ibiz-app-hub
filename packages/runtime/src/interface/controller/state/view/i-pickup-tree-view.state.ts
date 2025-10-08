import { IApiPickupTreeViewState } from '../../../api';
import { IPickupMDViewState } from './i-pickup-md-view.state';
import { ITreeViewState } from './i-tree-view.state';

/**
 * @description  实体选择树视图（部件视图）UI状态
 * @export
 * @interface IPickupTreeViewState
 * @extends {ITreeViewState}
 * @extends {IApiPickupTreeViewState}
 */
export interface IPickupTreeViewState
  extends ITreeViewState,
    IPickupMDViewState,
    IApiPickupTreeViewState {
  /**
   * 在多选的情况下，树节点是否严格的遵循父子不互相关联
   *
   * @author zhanghengfeng
   * @date 2024-07-01 14:07:56
   * @type {boolean}
   */
  checkStrictly?: boolean;
}
