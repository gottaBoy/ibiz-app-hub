import { IApiUILogicParams } from '../../api';
import { IControlController, IViewController } from '../../controller';

/**
 * 界面逻辑通用参数(界面行为，事件，界面逻辑，实体逻辑等)
 * @author lxm
 * @date 2023-05-08 09:31:01
 * @export
 * @interface IUILogicParams
 * @extends {IApiUILogicParams}
 */
export interface IUILogicParams extends IApiUILogicParams {
  /**
   * 当前上下文对应的视图控制器
   * @author lxm
   * @date 2023-03-21 05:58:31
   * @type {Neuron}
   */
  view: IViewController;

  /**
   * 当前部件控制器
   * @author lxm
   * @date 2023-06-14 07:45:34
   * @type {IController}
   */
  ctrl?: IControlController;
}
