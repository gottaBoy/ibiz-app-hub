import { IApiUIActionResult, IApiUILogicParams } from '../common';

/**
 * @description 界面行为工具类
 * @export
 * @interface IApiUIActionUtil
 */
export interface IApiUIActionUtil {
  /**
   * @description 执行界面行为
   * @param {string} actionId 界面行为id
   * @param {IApiUILogicParams} params 界面行为参数
   * @param {string} appId 应用标识
   * @returns {*}  {Promise<IApiUIActionResult>}
   * @memberof IApiUIActionUtil
   */
  exec(
    actionId: string,
    params: IApiUILogicParams,
    appId: string,
  ): Promise<IApiUIActionResult>;

  /**
   * @description 执行界面逻辑
   * @param {string} appDEUILogicId 界面逻辑id
   * @param {string} appDataEntityId 实体标识
   * @param {IApiUILogicParams} args 界面逻辑参数
   * @returns {*}  {Promise<unknown>}
   * @memberof IApiUIActionUtil
   */
  execUILogic(
    appDEUILogicId: string,
    appDataEntityId: string,
    args: IApiUILogicParams,
  ): Promise<unknown>;

  /**
   * @description 执行界面行为并处理返回值
   * @param {string} actionId 界面行为id
   * @param {IApiUILogicParams} params 界面行为参数
   * @param {string} appId 应用标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiUIActionUtil
   */
  execAndResolved(
    actionId: string,
    params: IApiUILogicParams,
    appId: string,
  ): Promise<void>;
}
