/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAppDataEntity, IAppUtil } from '@ibiz/model-core';
import { IAppDEService } from '../../../interface';

/**
 * 应用功能组件服务
 *
 * @author tony001
 * @date 2024-04-23 11:04:58
 * @export
 * @class UtilService
 */
export class UtilService {
  /**
   * 存储实体模型
   *
   * @author tony001
   * @date 2024-04-24 15:04:36
   * @type {(IAppDataEntity | null)}
   */
  protected stoageAppDataEntity: IAppDataEntity | null = null;

  /**
   * 存储服务
   *
   * @author tony001
   * @date 2024-04-24 14:04:36
   * @type {(IAppDEService | null)}
   */
  protected appDEService: IAppDEService | null = null;

  /**
   * Creates an instance of UtilService.
   * @author tony001
   * @date 2024-04-24 14:04:41
   * @param {IAppUtil} appUtil
   */
  constructor(protected appUtil: IAppUtil) {}

  /**
   * 获取存储服务
   *
   * @author tony001
   * @date 2024-04-24 14:04:21
   * @private
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {Promise<IAppDEService>}
   */
  private async getAppDEService(context: IContext): Promise<IAppDEService> {
    if (this.appDEService) {
      return this.appDEService;
    }
    const {
      appId,
      name,
      stoageAppDataEntityId,
      utilTag,
      utilType,
      utilDEName,
    } = this.appUtil as IModel;
    // 自定义功能类型且功能标记不走DYNAMENU获取utilDEName作为实体标识
    const appDataEntityTag =
      utilType === 'USER' && utilTag !== 'DYNAMENU'
        ? utilDEName
        : stoageAppDataEntityId;
    if (appId && appDataEntityTag) {
      const app = ibiz.hub.getApp(appId);

      this.stoageAppDataEntity = await ibiz.hub.getAppDataEntity(
        appDataEntityTag,
        appId,
      );
      const cloneContext = context.clone();
      cloneContext.srfappid = appId;
      const appDEService = await app.deService.getService(
        cloneContext,
        appDataEntityTag,
      );

      if (appDEService) {
        this.appDEService = appDEService;
        return appDEService;
      }
      throw new Error(
        ibiz.i18n.t('runtime.service.noFoundStorageEntity', {
          name,
          stoageAppDataEntityId: appDataEntityTag,
        }),
      );
    }
    throw new Error(ibiz.i18n.t('runtime.service.noExist', { name }));
  }

  /**
   * 加载指定数据
   *
   * @author tony001
   * @date 2024-04-23 11:04:22
   * @param {string} tag
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {Promise<IData>}
   */
  async load(tag: string, context: IContext, params: IParams): Promise<IData> {
    const { utilType, utilTag } = this.appUtil as IModel;
    if (utilType === 'USER' && utilTag !== 'DYNAMENU') {
      try {
        const { getAppDEActionId } = this.parseUserUtilParams();
        const dataService = await this.getAppDEService(context);
        const res: IData = await dataService.exec(
          getAppDEActionId,
          context,
          params,
        );
        return this.handleUserResponse(res);
      } catch (error) {
        return {};
      }
    } else {
      const tempContext = context.clone();
      const dataService = await this.getAppDEService(tempContext);
      // 设置数据主键
      tempContext[this.stoageAppDataEntity!.codeName!.toLowerCase()] = tag;
      const { getAppDEActionId } = this.appUtil as IModel;
      try {
        const res: IData = await dataService.exec(
          getAppDEActionId || 'get',
          tempContext,
          params,
        );
        return this.handleResponse(res);
      } catch (error) {
        return {};
      }
    }
  }

  /**
   * 保存指定数据
   *
   * @author tony001
   * @date 2024-04-23 12:04:36
   * @param {string} tag
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} data
   * @return {*}  {Promise<IData>}
   */
  async save(
    tag: string,
    context: IContext,
    params: IParams,
    data: IData,
  ): Promise<IData> {
    const dataService = await this.getAppDEService(context);
    const { utilType, utilTag } = this.appUtil as IModel;
    if (utilType === 'USER' && utilTag !== 'DYNAMENU') {
      const { saveAppDEActionId } = this.parseUserUtilParams();
      const tempData = this.handleUserRequestData(data);
      const res: IData = await dataService.exec(
        saveAppDEActionId,
        context,
        tempData,
        params,
      );
      return this.handleUserResponse(res);
    }
    const {
      context: tempContext,
      params: tempParams,
      data: tempData,
    } = this.handleRequestData(tag, context, params, data);
    return dataService.exec('save', tempContext, tempData, tempParams);
  }

  /**
   * 处理请求数据
   *
   * @author tony001
   * @date 2024-04-24 15:04:02
   * @private
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} data
   * @return {*}  {{ context: IContext; params: IParams; data: IData }}
   */
  private handleRequestData(
    tag: string,
    context: IContext,
    params: IParams,
    data: IData,
  ): { context: IContext; params: IParams; data: IData } {
    const {
      modelIdAppDEFieldId,
      modelAppDEFieldId,
      appIdAppDEFieldId,
      userIdAppDEFieldId,
      stoageAppDataEntityId,
    } = this.appUtil as IModel;
    if (!this.stoageAppDataEntity) {
      throw new Error(
        ibiz.i18n.t('runtime.service.noFoundEntity', { stoageAppDataEntityId }),
      );
    }
    const tempContext = context.clone();
    const tempData: IData = {};
    // 设置数据主键
    tempContext[this.stoageAppDataEntity!.codeName!.toLowerCase()] = tag;
    const { keyAppDEFieldId } = this.stoageAppDataEntity;
    tempData[keyAppDEFieldId as string] = tag;
    // 设置数据
    tempData[modelIdAppDEFieldId as string] = params?.modelId;
    tempData[modelAppDEFieldId as string] = JSON.stringify(data);
    // 应用中appid为应用codeName，适配多应用情况
    const app = ibiz.hub.getApp(tempContext.srfappid);
    tempData[appIdAppDEFieldId as string] = app.model.codeName;
    tempData[userIdAppDEFieldId as string] = tempContext.srfpersonid;
    tempData.type = params?.type;
    tempData.owner_type = params?.ownerType;
    tempData.owner_id = params?.ownerId;
    return { context: tempContext, params, data: tempData };
  }

  /**
   * @description 处理自定义类型请求数据
   * @private
   * @param {(IData | IData[])} data
   * @returns {*}  IData | IData[]
   * @memberof UtilService
   */
  private handleUserRequestData(data: IData | IData[]): IData | IData[] {
    const { modelMapping } = this.parseUserUtilParams();
    let result;
    const convertData = (sourceObj: IData): IData => {
      const targetObj: IData = {};
      if (Object.keys(modelMapping).length === 0) {
        return sourceObj;
      }
      Object.keys(modelMapping).forEach(key => {
        targetObj[modelMapping[key]] = sourceObj[key];
      });
      return targetObj;
    };
    if (!data) {
      throw new Error(ibiz.i18n.t('runtime.service.dataException'));
    }
    if (Array.isArray(data) && data.length > 0) {
      result = data.map(item => {
        return convertData(item);
      });
      return result;
    }
    result = convertData(data);
    return result;
  }

  /**
   * @description 解析用户自定义功能参数(getAppDEActionId|saveAppDEActionId|modelMapping),分别表示获取行为|保存行为|数据映射关系
   * @private
   * @returns {*}  {IParams}
   * @memberof UtilService
   */
  private parseUserUtilParams(): IParams {
    const { utilParams } = this.appUtil as IModel;
    const result: IParams = {
      getAppDEActionId: 'fetchDefault',
      saveAppDEActionId: 'save',
      modelMapping: {},
    };
    if (utilParams && Object.keys(utilParams).length > 0) {
      Object.keys(utilParams).forEach(key => {
        if (key !== 'appId') {
          // 数据映射关系格式如：id:appid|caption:display_name|order:order|dataId:id|indexViewName:index_id",key为界面定义字段名称，value为数据源字段名称
          if (key === 'modelMapping') {
            const modelMapping: IParams = {};
            if (utilParams.modelMapping) {
              const pairs = utilParams.modelMapping.split('|');
              pairs.forEach((pair: string) => {
                const [tempKey, tempVal] = pair.split(':');
                if (tempKey && tempVal) {
                  modelMapping[tempKey] = tempVal;
                }
              });
            }
            Object.assign(result, { [key]: modelMapping });
          } else {
            Object.assign(result, { [key]: utilParams[key] });
          }
        }
      });
    }
    return result;
  }

  /**
   * 处理响应数据
   *
   * @author tony001
   * @date 2024-04-24 16:04:45
   * @private
   * @param {IData} response
   * @return {*}  {IData}
   */
  private handleResponse(response: IData): IData {
    const { data } = response;
    const { modelAppDEFieldId } = this.appUtil as IModel;
    return JSON.parse(data[modelAppDEFieldId]);
  }

  /**
   * @description 处理自定义类型响应数据
   * @private
   * @param {IData[]} response
   * @returns {*}  {IData | IData[]}
   * @memberof UtilService
   */
  private handleUserResponse(response: IData): IData | IData[] {
    const { data } = response;
    const { modelMapping } = this.parseUserUtilParams();
    let result;
    const convertData = (sourceObj: IData): IData => {
      const targetObj: IData = {};
      if (Object.keys(modelMapping).length === 0) {
        return sourceObj;
      }
      Object.keys(modelMapping).forEach(key => {
        targetObj[key] = sourceObj[modelMapping[key]];
      });
      return targetObj;
    };
    if (!data) {
      throw new Error(ibiz.i18n.t('runtime.service.dataException'));
    }
    if (Array.isArray(data) && data.length > 0) {
      result = data.map(item => {
        return convertData(item);
      });
      return result;
    }
    result = convertData(data);
    return result;
  }
}
