import {
  IApiContext,
  IApiData,
  IApiParams,
  IHttpResponse,
} from '@ibiz-template/core';
import { IAppDataEntity } from '@ibiz/model-core';
import { IApiAppService } from '../app';

/**
 * @description 实体数据服务接口
 * @export
 * @interface IApiAppDEService
 */
export interface IApiAppDEService {
  /**
   * @description 是否本地模式(临时数据模式)，由 method.dto.ts 在 DTO 填充，根据是否为子嵌套数据进行设置
   * @type {boolean}
   * @memberof IApiAppDEService
   */
  isLocalMode: boolean;

  /**
   * @description 当前实体服务对应的实体模型
   * @type {IAppDataEntity}
   * @memberof IApiAppDEService
   */
  readonly model: IAppDataEntity;

  /**
   * @description 应用服务
   * @type {IApiAppService}
   * @memberof IApiAppDEService
   */
  readonly app: IApiAppService;

  /**
   * @description 执行实体服务方法
   * @param {string} id 数据集标识
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @param {IApiParams} [header] Axios 原生请求头类型
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  exec(
    id: string,
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
    header?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取草稿数据[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  getDraft(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取草稿数据[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  getDraftTemp(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 创建数据[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  create(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 创建数据[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  createTemp(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取数据[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  get(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取数据[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  getTemp(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 更新数据[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  update(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 更新数据[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  updateTemp(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 删除数据[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  remove(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 删除数据[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  removeTemp(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取默认数据集[系统预置]
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  fetchDefault(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取默认数据集[系统预置](临时数据)
   * @param {IApiContext} context 应用上下文
   * @param {(IApiData | IApiData[])} [params] 实体数据
   * @param {IApiParams} [params2] 请求参数
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  fetchTempDefault(
    context: IApiContext,
    params?: IApiData | IApiData[],
    params2?: IApiParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 创建下载凭证
   * @param {IApiContext} context 应用上下文
   * @param {{
   *  srfossfileid: string
   * }} [params] 请求参数：{ 文件标识 }
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IApiAppDEService
   */
  createDownloadTicket(
    context: IApiContext,
    params: { srfossfileid: string },
  ): Promise<IHttpResponse>;
}
