import {
  IAppDEMethod,
  IAppDEMethodDTO,
  IAppDataEntity,
} from '@ibiz/model-core';
import {
  HttpError,
  IBizContext,
  IHttpResponse,
  IPortalAsyncAction,
  ModelError,
  RuntimeError,
  RuntimeModelError,
} from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import { DECache, DeMethodProcesser, calcResPath } from '../../utils';
import { WorkFlowService } from '../work-flow/work-flow.service';
import { Method } from './method/method';
import { FileService } from '../file/file.service';
import { findAppDEMethod } from '../../../model';
import {
  IAppDEService,
  IAppService,
  IDataEntity,
  IDeMethodProcesser,
} from '../../../interface';
import { ConfigService } from '../config/config.service';
import { getDEMethodProvider } from '../../../register';
import { AppDataEntity } from '../../app-data-entity/app-data-entity';
import { MethodDto } from '../../dto/method.dto';

/**
 * 实体服务
 *
 * @author chitanda
 * @date 2022-08-17 22:08:21
 * @export
 * @class DEService
 */
export class DEService implements IAppDEService {
  /**
   * 实体配置存储服务
   *
   * @author chitanda
   * @date 2023-09-22 10:09:55
   * @type {ConfigService}
   */
  readonly configCache: ConfigService;

  /**
   * 工作流相关服务
   *
   * @author lxm
   * @date 2022-09-29 11:09:28
   * @type {WorkFlowService}
   */
  readonly wf: WorkFlowService;

  /**
   * 文件相关服务
   *
   * @author lxm
   * @date 2022-11-25 13:11:11
   * @type {FileService}
   */
  readonly file: FileService;

  /**
   * @description 应用服务
   * @type {IAppService}
   * @memberof DEService
   */
  readonly app: IAppService;

  /**
   * 请求方法实例
   *
   * @author chitanda
   * @date 2022-10-10 12:10:13
   * @protected
   * @type {Map<string, Method>}
   */
  protected readonly methodMap: Map<string, Method> = new Map();

  /**
   * 数据缓存
   *
   * @author chitanda
   * @date 2022-08-18 19:08:40
   * @type {DECache}
   */
  readonly local: DECache;

  /**
   * @description 方法处理器
   * @type {IDeMethodProcesser}
   * @memberof DEService
   */
  readonly methodProcesser: IDeMethodProcesser;

  /**
   * 是否为本地模式(临时数据模式)服务
   *
   * @author chitanda
   * @date 2023-12-22 16:12:13
   * @type {boolean}
   */
  isLocalMode: boolean = false;

  /**
   * Creates an instance of DEService.
   *
   * @author chitanda
   * @date 2023-12-22 13:12:21
   * @param {string} srfSessionId 当前实体会话标识
   * @param {IAppDataEntity} model 实体模型
   */
  constructor(
    protected srfSessionId: string,
    public readonly model: IAppDataEntity,
  ) {
    this.local = new DECache(model);
    this.configCache = new ConfigService(
      model.appId!,
      'PSAppDataEntity',
      model.codeName!,
    );
    this.wf = new WorkFlowService(model);
    this.file = new FileService(model);
    this.app = ibiz.hub.getApp(model.appId);
    this.methodProcesser = new DeMethodProcesser(srfSessionId);
  }

  /**
   * @description 根据上下文计算当前请求路径
   * @protected
   * @param {IContext} context
   * @returns {*}  {string} 拼接结果说明: /祖父实体/祖父实体主键/爷爷实体/爷爷实体主键/父实体/父实体主键/当前实体
   * @memberof DEService
   */
  protected calcPath(context: IContext): string {
    const curPath = `/${this.model.deapicodeName2}`;
    const resPath = calcResPath(context, this.model);
    return resPath + curPath;
  }

  /**
   * 获取实体服务方法实例
   *
   * @author chitanda
   * @date 2023-10-12 17:10:10
   * @protected
   * @param {string} id
   * @param {boolean} [acMode=false]
   * @return {*}  {Method}
   */
  protected async getMethod(
    id: string,
    acMode: boolean = false,
  ): Promise<Method> {
    const cacheId = acMode ? `ac-${id}` : id;
    if (this.methodMap.has(cacheId)) {
      return this.methodMap.get(cacheId)!;
    }
    const model = findAppDEMethod(this.model, id) as IAppDEMethod;

    if (!model) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.service.noFoundServiceMethod', { id }),
      );
    }

    // 获取适配器
    const provider = await getDEMethodProvider(model);
    if (!provider) {
      throw new ModelError(
        model,
        ibiz.i18n.t('runtime.service.UnsupportedServiceMethod', {
          methodType: model.methodType,
        }),
      );
    }
    const method: Method = provider.create(this, this.model, model, {
      acMode,
      localMode: this.isLocalMode,
    });
    this.methodMap.set(cacheId, method);
    return method;
  }

  /**
   * 执行服务方法
   *
   * @author chitanda
   * @date 2022-09-13 19:09:55
   * @param {string} id 执行服务方法标识
   * @param {IContext} context
   * @param {IData} [params={}] 请求参数
   * @param {IParams} [params2={}] 查询参数
   * @return {*}  {Promise<IHttpResponse>}
   */
  async exec(
    id: string,
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
    header?: IData,
  ): Promise<IHttpResponse> {
    // 和原上下文解除关联，冻结当前行为上下文，方便后续判断上下文是否销毁
    const result: IData = {};
    Object.keys(context).forEach(key => {
      result[key] = context[key];
    });
    const tempContext = IBizContext.create(result);

    const method = await this.getMethod(id);
    if (method) {
      const processTag: string = createUUID();
      this.methodProcesser.increment(processTag, method);
      try {
        const response = await method.exec(
          tempContext,
          params,
          params2,
          header,
        );
        this.methodProcesser.decrement(processTag);
        return response;
      } catch (error) {
        this.methodProcesser.decrement(processTag);
        if (error instanceof HttpError) {
          error.tag = context.srfviewid;
        }
        throw error;
      }
    }
    throw new RuntimeError(
      ibiz.i18n.t('runtime.service.noSupportedMethod', {
        codeName: this.model.codeName,
        id,
      }),
    );
  }

  getDraft(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('GetDraft', context, params, params2);
  }

  create(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('Create', context, params, params2);
  }

  get(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('Get', context, params, params2);
  }

  update(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('Update', context, params, params2);
  }

  remove(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('Remove', context, params, params2);
  }

  fetchDefault(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('FetchDefault', context, params, params2);
  }

  getDraftTemp(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('GetDraftTemp', context, params, params2);
  }

  createTemp(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('CreateTemp', context, params, params2);
  }

  getTemp(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('GetTemp', context, params, params2);
  }

  updateTemp(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('UpdateTemp', context, params, params2);
  }

  removeTemp(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('RemoveTemp', context, params, params2);
  }

  fetchTempDefault(
    context: IContext,
    params?: IData | IData[],
    params2?: IParams,
  ): Promise<IHttpResponse<IData>> {
    return this.exec('FetchTempDefault', context, params, params2);
  }

  /**
   * @description 创建下载凭证
   * @param {IContext} context
   * @param {{ srfossfileid: string }} params
   * @returns {*}  {Promise<IHttpResponse<IData>>}
   * @memberof DEService
   */
  async createDownloadTicket(
    context: IContext,
    params: { srfossfileid: string },
  ): Promise<IHttpResponse<IData>> {
    let path = this.calcPath(context);
    const srfkey = context[this.model.codeName!.toLowerCase()];
    if (srfkey) {
      path = `${path}/createdownloadticket/${srfkey}`;
    }
    const res = await this.app.net.get(path, params);
    if (!res.data) {
      ibiz.log.error(ibiz.i18n.t('runtime.deAction.responseDataError'), res);
    }
    return res;
  }

  /**
   * 执行服务方法 ac 模式
   *
   * @author chitanda
   * @date 2022-09-13 19:09:55
   * @param {string} id 执行服务方法标识
   * @param {IContext} context
   * @param {IData} [params={}] 请求参数
   * @param {IParams} [params2={}] 查询参数
   * @return {*}  {Promise<IHttpResponse>}
   */
  async execAc(
    id: string,
    context: IContext,
    params?: IData | IData[],
    params2: IParams = {},
  ): Promise<IHttpResponse> {
    const method = await this.getMethod(id, true);
    if (method) {
      return method.exec(context, params, params2);
    }
    throw new RuntimeError(
      ibiz.i18n.t('runtime.service.noSupportedMethod', {
        codeName: this.model.codeName,
        id,
      }),
    );
  }

  /**
   * 实体级别 AI 聊天会话
   *
   * @author chitanda
   * @date 2023-10-16 16:10:16
   * @param {(data: IPortalAsyncAction) => void} onmessage
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IData} [data={}]
   * @return {*}  {Promise<void>}
   */
  aiChatSse(
    onmessage: (data: IPortalAsyncAction) => void,
    controller: AbortController,
    context: IContext,
    params: IParams = {},
    data: IData = {},
  ): Promise<void> {
    const { signal } = controller;
    const app = ibiz.hub.getApp(this.model.appId);
    const path = this.calcSsePath(context);
    return new Promise((resolve, reject) => {
      app.net.sse(
        `${path}`,
        { srfactag: 'AIChat', ...params },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          onmessage: e => {
            if (e.data) {
              const json = JSON.parse(e.data);
              onmessage(json as IPortalAsyncAction);
            }
          },
          onclose: () => {
            resolve();
          },
          onerror: (e: unknown) => {
            reject(e);
          },
          signal,
        },
      );
    });
  }

  /**
   * 获取 AI 聊天会话推荐提示
   *
   * @author tony001
   * @date 2025-03-19 10:03:55
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IData} [data={}]
   * @return {*}  {Promise<IHttpResponse>}
   */
  aiChatRecommendPrompt(
    context: IContext,
    params: IParams = {},
    data: IData = {},
  ): Promise<IHttpResponse> {
    const app = ibiz.hub.getApp(this.model.appId);
    const srfkey = context[this.model.codeName!.toLowerCase()];
    const curPath = `/${this.model.deapicodeName2}/chatsuggestion${srfkey ? `/${srfkey}` : ''}`;
    const resPath = calcResPath(context, this.model);
    const path = resPath ? `/${resPath}${curPath}` : `${curPath}`;
    return app.net.post(path, data, { srfactag: 'AIChat', ...params });
  }

  /**
   * 获取 AI 聊天会话历史记录
   *
   * @author chitanda
   * @date 2023-10-26 14:10:58
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @param {IData} [data={}]
   * @return {*}  {Promise<IHttpResponse>}
   */
  aiChatHistory(
    context: IContext,
    params: IParams = {},
    data: IData = {},
  ): Promise<IHttpResponse> {
    const app = ibiz.hub.getApp(this.model.appId);
    const path = this.calcSsePath(context, true);
    return app.net.post(path, data, { srfactag: 'AIChat', ...params });
  }

  /**
   * 计算 AI 请求路径
   *
   * @author chitanda
   * @date 2023-10-26 14:10:25
   * @protected
   * @param {IContext} context
   * @param {boolean} [isHistories=false]
   * @return {*}  {string}
   */
  protected calcSsePath(
    context: IContext,
    isHistories: boolean = false,
  ): string {
    const srfkey = context[this.model.codeName!.toLowerCase()];
    const curPath = `/${this.model.deapicodeName2}/ssechatcompletion${
      isHistories ? '/histories' : ''
    }${srfkey ? `/${srfkey}` : ''}`;
    const resPath = calcResPath(context, this.model);
    return resPath ? `/${resPath}${curPath}` : `${curPath}`;
  }

  protected newEntity(data: IData | IDataEntity): IDataEntity {
    if (data instanceof AppDataEntity) {
      return data.clone();
    }
    return new AppDataEntity(this.model, data);
  }

  /**
   * 创建数据对象实例
   *
   * @author chitanda
   * @date 2023-12-23 19:12:57
   * @param {(IData[] | IDataEntity[] | IData | IDataEntity)} data
   * @return {*}  {(IDataEntity | IDataEntity[])}
   */
  createEntity(
    data: IData[] | IDataEntity[] | IData | IDataEntity,
  ): IDataEntity | IDataEntity[] {
    if (Array.isArray(data)) {
      return data.map(item => this.newEntity(item));
    }
    return this.newEntity(data);
  }

  /**
   * 服务实例销毁
   *
   * @author chitanda
   * @date 2023-12-22 14:12:11
   * @return {*}  {Promise<void>}
   */
  async destroy(): Promise<void> {
    this.local.clear();
    this.methodProcesser.destroy();
  }

  createMethodDto(
    dto?: IAppDEMethodDTO,
    opts?: {
      isLocalMode?: boolean;
    },
  ): MethodDto {
    return new MethodDto(this, this.model, opts?.isLocalMode, dto);
  }
}
