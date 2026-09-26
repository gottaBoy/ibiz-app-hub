import { IHttpResponse } from '@ibiz-template/core';
import { IDEDataExport } from '@ibiz/model-core';

/**
 * 文件服务
 * @author lxm
 * @date 2023-05-15 10:44:11
 * @export
 * @interface IFileService
 */
export interface IFileService {
  /**
   * @description 后台导出数据，返回文件流
   * @param {IDEDataExport} dataExport 导出模型
   * @param {string} fetchAction 查询方法
   * @param {IContext} context 上下文
   * @param {IParams} params 请求参数
   * @deprecated 已弃用，请使用 export 方法，参数一致
   * @returns {*}  {Promise<IHttpResponse<Blob>>}
   * @memberof IFileService
   */
  exportData(
    dataExport: IDEDataExport,
    fetchAction: string,
    context: IContext,
    params: IParams,
  ): Promise<IHttpResponse<Blob>>;

  /**
   * @description 导出
   * @param {IDEDataExport} dataExport 导出模型
   * @param {string} fetchAction 查询方法
   * @param {IContext} context 上下文
   * @param {IParams} params 请求参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IFileService
   */
  export(
    dataExport: IDEDataExport,
    fetchAction: string,
    context: IContext,
    params: IParams,
  ): Promise<boolean>;
}
