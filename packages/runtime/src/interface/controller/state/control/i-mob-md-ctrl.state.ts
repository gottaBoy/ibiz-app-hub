import { ControlVO } from '../../../../service';
import { IApiMobMDCtrlRowState, IApiMobMdCtrlState } from '../../../api';
import { IButtonContainerState } from '../../common';
import { IMobMDCtrlController } from '../../controller';
import { IMDControlState } from './i-md-control.state';

/**
 * @description 多数据视图行状态接口
 * @export
 * @interface IMobMDCtrlRowState
 * @extends {IApiMobMDCtrlRowState}
 */
export interface IMobMDCtrlRowState extends IApiMobMDCtrlRowState {
  /**
   * @description 界面行为状态
   * @type {{ [p: string]: IApiButtonContainerState }}
   * @memberof IMobMDCtrlRowState
   */
  uaColStates: { [p: string]: IButtonContainerState };

  /**
   * @description 行数据
   * @type {ControlVO}
   * @memberof IMobMDCtrlRowState
   */
  data: ControlVO;

  /**
   * @description 多数据部件控制器
   * @type {IMobMDCtrlController}
   * @memberof IMobMDCtrlRowState
   */
  controller: IMobMDCtrlController;
}

/**
 * @description 移动端多数据部件状态接口
 * @export
 * @interface IMobMdCtrlState
 * @extends {IMDControlState}
 * @extends {IApiMobMdCtrlState}
 */
export interface IMobMdCtrlState extends IMDControlState, IApiMobMdCtrlState {
  /**
   * @description 多数据视图行数据
   * @type {IMobMDCtrlRowState[]}
   * @memberof IMobMdCtrlState
   */
  rows: IMobMDCtrlRowState[];
}
