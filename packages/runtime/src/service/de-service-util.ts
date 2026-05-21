import { IAppDataEntity, IApplication } from '@ibiz/model-core';
import { IHttpResponse, RuntimeError } from '@ibiz-template/core';
import {
  IApiDEServiceUtil,
  IAppDEService,
  IMethodProcessState,
} from '../interface';
import { DEService } from './service';

/**
 * 实体服务构造方法
 */
export type DEServiceConstructor = (
  srfSessionId: string,
  entityModel: IAppDataEntity,
) => Promise<IAppDEService>;

/**
 * 应用服务工具类
 *
 * @author chitanda
 * @date 2022-08-17 23:08:12
 * @export
 * @class DEServiceUtil
 */
export class DEServiceUtil implements IApiDEServiceUtil {
  /**
   * 实体服务缓存
   *
   * @author chitanda
   * @date 2022-08-17 23:08:36
   * @protected
   * @type {Map<string, Map<string, IAppDEService>>} Map<域标识, Map<实体标识, 实体服务>>
   */
  protected cache: Map<string, Map<string, IAppDEService>> = new Map();

  /**
   * 创建中缓存
   *
   * @author tony001
   * @date 2024-07-24 22:07:21
   * @protected
   * @type {Map<string, Promise<IAppDEService>>}
   */
  protected creatingCache: Map<string, Promise<IAppDEService>> = new Map();

  /**
   * 实体服务构造方法缓存
   *
   * @author lxm
   * @date 2023-05-15 08:37:13
   * @protected
   */
  protected static constructorCache: Map<string, DEServiceConstructor> =
    new Map();

  /**
   * @description 执行中方法数量缓存
   * @protected
   * @type {Map<string, Method>} Map<域标识，{执行中数量,是否销毁}>
   * @memberof DEServiceUtil
   */
  protected processingCache: Map<
    string,
    { count: number; isDestoryed: boolean }
  > = new Map();

  /**
   * Creates an instance of DEServiceUtil.
   *
   * @author chitanda
   * @date 2023-04-18 14:04:01
   * @param {IApplication} appModel
   */
  constructor(protected appModel: IApplication) {
    this.handleMethodProcessStateChange =
      this.handleMethodProcessStateChange.bind(this);
  }

  /**
   * 注册服务工厂方法
   *
   * @author chitanda
   * @date 2023-06-14 10:06:31
   * @param {string} id 实体标识
   * @param {DEServiceConstructor} constructor
   */
  static register(id: string, constructor: DEServiceConstructor): void {
    this.constructorCache.set(id.toUpperCase(), constructor);
  }

  /**
   * @description 处理方法处理状态变更
   * @param {IMethodProcessState} data
   * @memberof DEServiceUtil
   */
  handleMethodProcessStateChange(data: IMethodProcessState): void {
    const { type, srfsessionid } = data;
    if (type === 'BEFORE') {
      // 方法执行前
      if (!this.processingCache.has(srfsessionid)) {
        this.processingCache.set(srfsessionid, {
          isDestoryed: false,
          count: 0,
        });
      }
      const processingState = this.processingCache.get(srfsessionid);
      processingState!.count += 1;
    } else {
      // 方法执行后
      const processingState = this.processingCache.get(srfsessionid);
      if (processingState) {
        processingState.count -= 1;
        if (processingState.isDestoryed && processingState.count === 0) {
          this.cleaUIDomainCache(srfsessionid);
        }
      }
    }
  }

  /**
   * 根据实体标识获取实体服务
   *
   * @author chitanda
   * @date 2023-12-22 10:12:47
   * @param {IContext} context 上下文,用于计算模型所属沙箱环境
   * @param {string} id 实体标识
   * @return {*}  {Promise<IAppDEService>}
   */
  async getService(context: IContext, id: string): Promise<IAppDEService> {
    // 优先处理开启应用实体服务映射情况
    const { targetApp, targetAppDataEntityId } =
      await this.computeAppDEMappingParam(context, id);
    if (targetApp && targetAppDataEntityId) {
      const targetService = await targetApp.deService.getService(
        context,
        targetAppDataEntityId,
      );
      // 订阅服务方法处理状态
      targetService.methodProcesser.on(this.handleMethodProcessStateChange);
      return targetService;
    }
    // 标准逻辑
    const sandboxId = context.srfsessionid || 'applocation';
    if (!this.cache.has(sandboxId)) {
      this.cache.set(sandboxId, new Map());
    }
    const map = this.cache.get(sandboxId)!;
    if (!map.has(id)) {
      const cacheKey: string = `${sandboxId}@${id}`;
      let result: IAppDEService;
      if (this.creatingCache.has(cacheKey)) {
        result = await this.creatingCache.get(cacheKey)!;
      } else {
        const service = this.createServiceInstance(
          sandboxId,
          id,
          context.srfappid,
        );
        this.creatingCache.set(cacheKey, service);
        result = await service;
        // 订阅服务方法处理状态
        result.methodProcesser.on(this.handleMethodProcessStateChange);
        this.creatingCache.delete(cacheKey);
      }
      map.set(id, result);
    }
    return map.get(id)!;
  }

  /**
   * 创建实体服务实例
   *
   * @author tony001
   * @date 2024-07-24 22:07:28
   * @param {string} sandboxId
   * @param {string} id
   * @return {*}  {Promise<IAppDEService>}
   */
  async createServiceInstance(
    sandboxId: string,
    id: string,
    appid?: string,
  ): Promise<IAppDEService> {
    const entityModel = await ibiz.hub.getAppDataEntity(
      id,
      appid || this.appModel.appId,
    );
    if (!entityModel) {
      throw new RuntimeError(ibiz.i18n.t('runtime.service.noFound', { id }));
    }
    const constructor = DEServiceUtil.constructorCache.get(id.toUpperCase());
    let service: IAppDEService;
    if (constructor) {
      service = await constructor(sandboxId, entityModel);
    } else {
      service = new DEService(sandboxId, entityModel);
    }
    return service;
  }

  /**
   * 重置服务, 删除指定域下的所有服务缓存
   *
   * @author chitanda
   * @date 2023-12-22 13:12:47
   * @param {IContext} context
   * @return {*}  {void}
   */
  reset(context: IContext): void {
    const sandboxId = context.srfsessionid;
    if (!this.cache.has(sandboxId)) {
      return;
    }
    const processingState = this.processingCache.get(sandboxId);
    // 无正在执行的方法，则直接清除当前界面域所有类型，反之，执行中的方法都执行完毕再清除
    if (!processingState || processingState.count === 0) {
      this.cleaUIDomainCache(sandboxId);
    } else {
      processingState.isDestoryed = true;
    }
  }

  /**
   * @description 清除当前界面域下所有缓存，包含当前服务缓存、当前执行状态缓存、服务数据缓存
   * @param {string} sandboxId 界面域标识
   * @returns {*}  {void}
   * @memberof DEServiceUtil
   */
  cleaUIDomainCache(sandboxId: string): void {
    if (!this.cache.has(sandboxId)) {
      return;
    }
    const map = this.cache.get(sandboxId)!;
    map.forEach(service => {
      service.destroy();
    });
    this.cache.delete(sandboxId);
    this.processingCache.delete(sandboxId);
  }

  /**
   * 清理所有服务, 当前临时域下的所有临时数据缓存
   *
   * @description 根据 srfsessionid 作为临时数据域
   * @author chitanda
   * @date 2022-08-18 14:08:48
   * @param {IContext} context
   */
  clearTempCache(context: IContext): void {
    const sandboxId = context.srfsessionid;
    if (!this.cache.has(sandboxId)) {
      return;
    }
    const map = this.cache.get(sandboxId)!;
    map.forEach(service => {
      service.local.clear();
    });
  }

  /**
   * 清理指定实体的临时数据缓存，并根据关系清理掉子实体的临时数据缓存
   *
   * @author chitanda
   * @date 2024-01-19 14:01:32
   * @param {IContext} context
   * @param {string} entityID
   * @param {string[]} [clearEntities=[]] 已经清理过的实体忽略，避免关系循环引用导致死循环
   * @return {*}  {void}
   */
  clearTempCacheByRs(
    context: IContext,
    entityID: string,
    clearEntities: string[] = [],
  ): void {
    if (clearEntities.includes(entityID) === true) {
      return;
    }
    clearEntities.push(entityID);
    const sandboxId = context.srfsessionid;
    if (!this.cache.has(sandboxId)) {
      return;
    }
    // 清理当前实体的临时数据缓存
    const map = this.cache.get(sandboxId)!;
    const service = map.get(entityID);
    if (service) {
      service.local.clear();
    }
    if (context.srfskipcleartmpres === true) {
      return;
    }
    // 根据关系清理掉子实体的临时数据缓存
    const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
    if (uiDomain) {
      const configs = uiDomain.getDERConfigByMajor(entityID);
      configs.forEach(config => {
        this.clearTempCacheByRs(
          context,
          config.minorAppDataEntityId!,
          clearEntities,
        );
      });
    }
  }

  /**
   * 执行服务方法
   * @author lxm
   * @date 2023-04-26 02:02:43
   * @param {string} appDataEntityId 实体名称
   * @param {string} methodName 方法名
   * @param {IContext} context 上下文
   * @param {(IData | undefined)} [params] 数据
   * @param {(IParams | undefined)} [params2] 视图参数
   * @return {*}  {Promise<IHttpResponse<IData>>}
   */
  async exec(
    appDataEntityId: string,
    methodName: string,
    context: IContext,
    params?: IData | IData[] | undefined,
    params2?: IParams | undefined,
    header?: IData,
  ): Promise<IHttpResponse<IData>> {
    // 优先处理开启应用实体服务映射情况
    const { targetApp, targetAppDataEntityId } =
      await this.computeAppDEMappingParam(context, appDataEntityId);
    if (targetApp && targetAppDataEntityId) {
      const result = await targetApp.deService.exec(
        targetAppDataEntityId,
        methodName,
        context,
        params,
        params2,
        header,
      );
      return result;
    }
    // 标准逻辑
    const service = await this.getService(context, appDataEntityId);
    const result = await service.exec(
      methodName,
      context,
      params,
      params2,
      header,
    );
    return result;
  }

  /**
   * 计算应用实体服务映射参数
   * srfappdemapping：是否开启应用实体服务映射
   * srfappmappingmap：应用映射表,与srfappdemapping搭配使用，原应用本身标识：目标应用本身标识，以冒号分割，多个应用以逗号隔开
   * 如:logicdesign:plmweb
   *
   * @author tony001
   * @date 2024-07-19 15:07:31
   * @param {IContext} context
   * @param {string} appDataEntityId
   * @return {*}  {Promise<IData>}
   */
  async computeAppDEMappingParam(
    context: IContext,
    appDataEntityId: string,
  ): Promise<IData> {
    const result: IData = {};
    if (
      context.srfappdemapping &&
      context.srfappdemapping === 'true' &&
      context.srfappmappingmap
    ) {
      const { srfappmappingmap } = context;
      const appMap: Map<string, string> = new Map();
      const appMappings = srfappmappingmap?.split(',') || [];
      for (const appMpping of appMappings) {
        const [sourceAppId, targetAppId] = appMpping.split(':');
        appMap.set(sourceAppId, targetAppId);
      }
      if (appMap.has(this.appModel.id!)) {
        // 通过id找到appId
        const targetId: string = appMap.get(this.appModel.id!) as string;
        const targetAppId = ibiz.hub.getAppById(targetId)?.appId;
        const targetApp = await ibiz.hub.getAppAsync(targetAppId);
        if (targetApp) {
          // 合入目标应用
          Object.assign(result, { targetApp });
          // 合入目标应用实体
          if (appDataEntityId.indexOf('.') !== -1) {
            Object.assign(result, {
              targetAppDataEntityId: `${targetApp.model.id}.${appDataEntityId.split('.').pop()}`,
            });
          } else {
            Object.assign(result, {
              targetAppDataEntityId: appDataEntityId,
            });
          }
        }
      }
    }
    return result;
  }

  /**
   * @description 记录当前域变更
   * @param {('ADD' | 'RESET' | 'UNDO' | 'REDO')} actionType 添加数据 | 重置数据
   * @returns {*}  {void}
   * @memberof DEServiceUtil
   */
  recordUIDomainChanges(
    srfsessionid: string,
    actionType: 'ADD' | 'RESET',
  ): void {
    if (!this.cache.has(srfsessionid)) {
      return;
    }
    const map = this.cache.get(srfsessionid)!;
    if (map.size > 0) {
      const services = Array.from(map.values());
      for (let i = 0; i < services.length; i++) {
        services[i].local.recordChanges(actionType);
      }
    }
  }

  /**
   * @description 取消当前域变更，'UNDO' | 'REDO'暂未支持
   * @param {string} srfsessionid 域标识
   * @param {('INIT' | 'UNDO' | 'REDO')} targetState 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {void}
   * @memberof DEServiceUtil
   */
  cancelUIDomainDChanges(
    srfsessionid: string,
    targetState: 'INIT' | 'UNDO' | 'REDO',
  ): void {
    // 后续需支持undo和redo后再行调整
    if (!this.cache.has(srfsessionid) || targetState !== 'INIT') {
      return;
    }
    // 还原界面域变更数据
    const map = this.cache.get(srfsessionid)!;
    if (map.size > 0) {
      const services = Array.from(map.values());
      for (let i = 0; i < services.length; i++) {
        services[i].local.cancelChanges(targetState);
      }
    }
    // 还原界面域变更状态
    const uiDomain = ibiz.uiDomainManager.get(srfsessionid);
    uiDomain?.dataChangeCompleted();
  }
}
