import {
  IAppBICube,
  IAppBIReport,
  IAppBIScheme,
  IAppCodeList,
  IAppDataEntity,
  IAppView,
  IApplication,
  ISubAppRef,
} from '@ibiz/model-core';

/**
 * 模型加载适配器
 *
 * @author chitanda
 * @date 2023-04-17 22:04:06
 * @export
 * @interface ModelLoaderProvider
 */
export interface ModelLoaderProvider {
  /**
   * 初始化应用
   *
   * @author chitanda
   * @date 2023-12-06 17:12:31
   * @param {string} [id]
   * @return {*}  {Promise<boolean>}
   */
  initApp(id?: string): Promise<boolean>;

  /**
   * 获取应用模型
   *
   * @author chitanda
   * @date 2023-04-17 22:04:15
   */
  getApp(id?: string): Promise<IApplication>;

  /**
   * 获取子应用模型
   *
   * @author tony001
   * @date 2024-06-23 15:06:43
   * @param {string} appId
   * @return {*}  {(Promise<ISubAppRef | undefined>)}
   */
  getSubAppRef(appId: string): Promise<ISubAppRef | undefined>;

  /**
   * 根据 id 获取视图模型
   *
   * @author chitanda
   * @date 2023-04-20 18:04:33
   * @param {string} appId 应用标识
   * @param {string} codeName 视图 codeName
   * @return {*}  {Promise<IAppView>}
   */
  getAppView(appId: string, codeName: string): Promise<IAppView>;

  /**
   * 根据参数加载请求视图模型，用于后台根据运行时参数加载视图
   *
   * @author chitanda
   * @date 2024-01-08 10:01:43
   * @param {string} appId
   * @param {string} viewId
   * @param {IParams} params
   * @return {*}  {Promise<IAppView>}
   */
  loadAppView(
    appId: string,
    viewId: string,
    params: IParams,
  ): Promise<IAppView>;

  /**
   * 根据 id 获取应用实体模型
   *
   * @author chitanda
   * @date 2023-04-20 18:04:13
   * @param {string} appId
   * @param {string} id
   * @return {*}  {Promise<IAppDataEntity>}
   */
  getAppDataEntity(appId: string, id: string): Promise<IAppDataEntity>;

  /**
   * 根据 codeName 获取实体模型
   *
   * @author chitanda
   * @date 2023-04-20 18:04:27
   * @param {string} appId
   * @param {string} codeName
   * @return {*}  {Promise<IAppDataEntity>}
   */
  getAppDataEntityByCodeName(
    appId: string,
    codeName: string,
  ): Promise<IAppDataEntity>;

  /**
   * 获取应用样式表
   *
   * @author chitanda
   * @date 2023-09-06 10:09:14
   * @param {string} appId
   * @return {*}  {(Promise<string | null>)}
   */
  getAppStyle(appId: string): Promise<string | null>;

  /**
   * 获取应用智能报表体系集合
   *
   * @author tony001
   * @date 2024-06-04 15:06:46
   * @param {string} appId 应用标识
   * @param {string[]} ids 智能报表体系标识集合
   * @return {*}  {Promise<IAppBIScheme[]>}
   */
  getAppBISchemes(appId: string, ids: string[]): Promise<IAppBIScheme[]>;

  /**
   * 通过应用智能报表体系获取立方体数据
   *
   * @author tony001
   * @date 2024-06-04 15:06:31
   * @param {string} appId 应用标识
   * @param {string[]} ids 立方体数据标识集合
   * @return {*}  {Promise<IAppBICube[]>}
   */
  getAppAppBICubes(appId: string, ids: string[]): Promise<IAppBICube[]>;

  /**
   * 通过应用智能报表体系获取报表数据
   *
   * @author tony001
   * @date 2024-06-04 15:06:39
   * @param {string} appId 应用标识
   * @param {string[]} ids 智能报表数据标识集合
   * @return {*}  {Promise<IAppBIReport[]>}
   */
  getAppBIReports(appId: string, ids: string[]): Promise<IAppBIReport[]>;

  /**
   * 原始模型转化为dsl对象
   *
   * @author tony001
   * @date 2024-06-27 17:06:28
   * @param {IData} data
   * @param {('APP' | 'VIEW' | 'CTRL' | 'APPENTITY' | 'APPBIREPORT')} type
   * @return {*}  {(Promise<IData | undefined>)}
   */
  translationModelToDsl(
    data: IData,
    type: 'APP' | 'VIEW' | 'CTRL' | 'APPENTITY' | 'APPBIREPORT',
  ): Promise<IModel | undefined>;

  /**
   * 合并子应用代码表
   *
   * @author tony001
   * @param {IAppCodeList} codeList
   */
  mergeSubAppCodeList(codeList: IAppCodeList): void;
}
