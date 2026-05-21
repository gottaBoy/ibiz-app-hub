import { IHttpResponse, IPortalAsyncAction } from '@ibiz-template/core';
import { IAppDEMethodDTO } from '@ibiz/model-core';
import { DECache } from '../../../service/utils';
import { IFileService } from './i-file.service';
import { IWorkFlowService } from './i-wf.service';
import { IConfigService } from './i-config.service';
import { IDataEntity } from '../i-data-entity/i-data-entity';
import { MethodDto } from '../../../service';
import { IApiAppDEService } from '../../api';
import { IDeMethodProcesser } from '../i-method-processer';

/**
 * @description 实体服务接口
 * @export
 * @interface IAppDEService
 */
export interface IAppDEService extends IApiAppDEService {
  /**
   * @description 实体本地缓存工具
   * @type {DECache}
   * @memberof IAppDEService
   */
  readonly local: DECache;

  /**
   * @description 实体配置存储服务
   * @type {IConfigService}
   * @memberof IAppDEService
   */
  readonly configCache: IConfigService;

  /**
   * @description 工作流相关服务
   * @type {IWorkFlowService}
   * @memberof IAppDEService
   */
  readonly wf: IWorkFlowService;

  /**
   * @description 文件相关服务
   * @type {IFileService}
   * @memberof IAppDEService
   */
  readonly file: IFileService;

  /**
   * @description 方法处理器
   * @type {IDeMethodProcesser}
   * @memberof IAppDEService
   */
  readonly methodProcesser: IDeMethodProcesser;

  /**
   * @description 触发实体服务方法 ac 模式
   * @param {string} id
   * @param {IContext} context
   * @param {(IData | IData[])} [params]
   * @param {IParams} [params2]
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IAppDEService
   */
  execAc(
    id: string,
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse>;

  /**
   * @description 实体级别 AI 聊天单次会话
   * @param {(data: IPortalAsyncAction) => void} onmessage
   * @param {AbortController} controller
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {IData} [data]
   * @returns {*}  {Promise<void>}
   * @memberof IAppDEService
   */
  aiChatSse(
    onmessage: (data: IPortalAsyncAction) => void,
    controller: AbortController,
    context: IContext,
    params?: IParams,
    data?: IData,
  ): Promise<void>;

  /**
   * @description 获取 AI 聊天会话推荐提示
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {IData} [data]
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IAppDEService
   */
  aiChatRecommendPrompt(
    context: IContext,
    params?: IParams,
    data?: IData,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取 AI 聊天会话摘要
   * @param context
   * @param params
   * @param data
   */
  aiChatChatDigest(
    context: IContext,
    params?: IParams,
    data?: IData,
  ): Promise<IHttpResponse>;

  /**
   * @description 获取 AI 聊天会话历史记录
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {IData} [data]
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IAppDEService
   */
  aiChatHistory(
    context: IContext,
    params?: IParams,
    data?: IData,
  ): Promise<IHttpResponse>;

  /**
   * @description 取消 AI 聊天会话
   * @param context
   * @param params
   * @param data
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof IAppDEService
   */
  aiChatCancel(
    context: IContext,
    params: IParams,
    data: IData,
  ): Promise<IHttpResponse>;

  /**
   * @description 创建当前数据对象实例
   * @param {(IData[] | IDataEntity[] | IData | IDataEntity)} data
   * @returns {*}  {(IDataEntity | IDataEntity[])}
   * @memberof IAppDEService
   */
  createEntity(
    data: IData[] | IDataEntity[] | IData | IDataEntity,
  ): IDataEntity | IDataEntity[];

  /**
   * @description 当前实体服务销毁时调用
   * @memberof IAppDEService
   */
  destroy(): void;

  /**
   * @description 创建DTO实例
   * @param {IAppDEMethodDTO} [dto] dto模型对象
   * @param {{
   *       isLocalMode?: boolean; 是否是临时模式
   *     }} [opts]
   * @returns {*}  {MethodDto}
   * @memberof IAppDEService
   */
  createMethodDto(
    dto?: IAppDEMethodDTO,
    opts?: {
      isLocalMode?: boolean;
    },
  ): MethodDto;
}
