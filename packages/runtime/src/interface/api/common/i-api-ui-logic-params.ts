import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IApiControlController, IApiViewController } from '../controller';

/**
 * @description 界面逻辑通用参数(界面行为，事件，界面逻辑，实体逻辑等)
 * @export
 * @interface IApiUILogicParams
 */
export interface IApiUILogicParams {
  /**
   * @description 上下文参数
   * @type {IApiContext}
   * @memberof IApiUILogicParams
   */
  context: IApiContext;

  /**
   * @description 视图参数
   * @type {IApiParams}
   * @memberof IApiUILogicParams
   */
  params: IApiParams;

  /**
   * @description 数据集合
   * @type {IApiData[]}
   * @memberof IApiUILogicParams
   */
  data: IApiData[];

  /**
   * @description 当前上下文对应的视图控制器
   * @type {IApiViewController}
   * @memberof IApiUILogicParams
   */
  view: IApiViewController;

  /**
   * @description 当前部件控制器
   * @type {IApiControlController}
   * @memberof IApiUILogicParams
   */
  ctrl?: IApiControlController;

  /**
   * @description 鼠标事件
   * @type {MouseEvent}
   * @memberof IApiUILogicParams
   */
  event?: MouseEvent;

  /**
   * @description 是否不等待路由打开
   * @type {boolean}
   * @memberof IApiUILogicParams
   */
  noWaitRoute?: boolean;
}
