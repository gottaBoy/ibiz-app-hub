import {
  IApiContext,
  IApiData,
  IApiParams,
  IHttpResponse,
} from '@ibiz-template/core';
import { IApiAppDEService } from './i-api-app-de.service';
/**
 * @description 实体服务构造工具接口
 * @export
 * @interface IApiDEServiceUtil
 */
export interface IApiDEServiceUtil {
  /**
   * @description 根据实体标识获取实体服务
   * @param {IApiContext} context 应用上下文
   * @param {string} id 实体标识，通常是应用标识.实体标识，如：checkinweb.shift
   * @returns {*}  {Promise<IApiAppDEService>}
   * @memberof IApiDEServiceUtil
   */
  getService(context: IApiContext, id: string): Promise<IApiAppDEService>;

  /**
   * @description 重置服务, 删除指定域下的所有服务缓存
   * @param {IApiContext} context 应用上下文
   * @memberof IApiDEServiceUtil
   */
  reset(context: IApiContext): void;

  /**
   * @description 执行服务方法
   * @param {string} appDataEntityId 实体标识，通常是应用标识.实体标识，如：checkinweb.shift
   * @param {string} methodName 方法名
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {(IApiParams)} [params2] 请求参数
   * @param {IApiData} [header]
   * @returns {*}  {Promise<IHttpResponse<IApiData>>}
   * @memberof IApiDEServiceUtil
   */
  exec(
    appDataEntityId: string,
    methodName: string,
    context: IApiContext,
    params?: IApiData | IApiData[] | undefined,
    params2?: IApiParams | undefined,
    header?: IApiData,
  ): Promise<IHttpResponse<IApiData>>;

  /**
   * @description 记录当前域变更
   * @param {string} srfsessionid 域标识
   * @param {('ADD' | 'RESET' | 'UNDO' | 'REDO')} actionType 行为类型：添加数据 | 重置数据
   * @returns {*}  {void}
   * @memberof IApiDEServiceUtil
   */
  recordUIDomainChanges(
    srfsessionid: string,
    actionType: 'ADD' | 'RESET',
  ): void;

  /**
   * @description 取消当前域变更，'UNDO' | 'REDO'暂未支持
   * @param {string} srfsessionid 域标识
   * @param {('INIT' | 'UNDO' | 'REDO')} targetState 目标状态：初始化状态 | 撤销上一步操作 | 重做下一步操作
   * @returns {*}  {void}
   * @memberof IApiDEServiceUtil
   */
  cancelUIDomainDChanges(
    srfsessionid: string,
    targetState: 'INIT' | 'UNDO' | 'REDO',
  ): void;
}
