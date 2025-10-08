import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IApiDownloadTicket } from '../common';

/**
 * @description 文件工具类
 * @export
 * @interface IApiFileUtil
 */
export interface IApiFileUtil {
  /**
   * @description 设置文件上传请求头数据
   * @param {Record<string, string>} args
   * @memberof IApiFileUtil
   */
  setUploadHeaders(args: Record<string, string>): void;

  /**
   * @description 获取文件上传请求头数据
   * @returns {*}  {Record<string, string>}
   * @memberof IApiFileUtil
   */
  getUploadHeaders(): Record<string, string>;

  /**
   * @description 计算文件的上传路径和下载路径,下载路径文件id用%fileId%占位，替换即可;配置编辑器参数uploadParams和exportParams时，会像导航参数一样动态添加对应的参数到url上
   * @param {IApiContext} context 应用上下文对象
   * @param {IApiParams} params 视图参数对象
   * @param {IApiData} [data] 业务数据对象，默认给{}
   * @param {{
   *       uploadParams?: IApiData;
   *       exportParams?: IApiData;
   *       osscat?: string;
   *     }} [extraParams] 上传附件参数;下载附加参数；自定义oss分类名称
   * @returns {*}  {{
   *     uploadUrl: string;
   *     downloadUrl: string;
   *   }}
   * @memberof IApiFileUtil
   */
  calcFileUpDownUrl(
    context: IApiContext,
    params: IApiParams,
    data?: IApiData,
    extraParams?: {
      uploadParams?: IApiData;
      exportParams?: IApiData;
      osscat?: string;
    },
  ): {
    uploadUrl: string;
    downloadUrl: string;
  };

  /**
   * @description 获取响应文件名
   * @param {IApiData} response 响应对象
   * @returns {*}  {string}
   * @memberof IApiFileUtil
   */
  getFileName(response: IApiData): string;

  /**
   * @description 文件下载
   * @param {string} url
   * @param {string} [name]
   * @param {({
   *       context: IApiContext;
   *       params: IApiParams;
   *       data: IApiData;
   *       file: { fileId: string } & IApiData;
   *       extraParams?: IApiData;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams] 下载参数
   * @param {boolean} [enableDownloadTicket] 启用下载凭证
   * @returns {*}  {Promise<void>}
   * @memberof IApiFileUtil
   */
  fileDownload(
    url: string,
    name?: string,
    downloadParams?: {
      context: IApiContext;
      params: IApiParams;
      data: IApiData;
      file: { fileId: string } & IApiData;
      extraParams?: IApiData;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
  ): Promise<void>;

  /**
   * @description 获取下载凭证
   * @param {IApiContext} context
   * @param {IApiParams} params
   * @param {IApiData} data
   * @param {({ fileId: string } & IApiData)}
   * @param {{ appEntityTag?: string; dataFieldTag?: string }} [downloadTicketParams] 存在appEntityTag，则调用appEntityTag映射的实体服务创建下载凭证能力，否则调用当前界面域主实体的实体服务；存在dataFieldTag，则按照业务数据（data）、上下文（context）、视图参数（params）顺序找对应的属性值作为创建下载凭证数据主键，没有则使用上下文中找对应的数据主键
   * @returns {*}  {(Promise<IApiDownloadTicket | undefined>)}
   * @memberof IApiFileUtil
   */
  getDownloadTicket(
    context: IApiContext,
    params: IApiParams,
    data: IApiData,
    file: { fileId: string } & IApiData,
    downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string },
  ): Promise<IApiDownloadTicket | undefined>;

  /**
   * @description 设置下载票据
   * @param {string} fileId
   * @param {IApiData} downloadTicket
   * @memberof IApiFileUtil
   */
  setDownloadTicket(fileId: string, downloadTicket: IApiData): void;

  /**
   * @description 文件上传
   * @param {string} uploadUrl
   * @param {Blob} file
   * @param {IApiData} headers
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiFileUtil
   */
  fileUpload(
    uploadUrl: string,
    file: Blob,
    headers: IApiData,
  ): Promise<IApiData>;

  /**
   * @description 选择并上传文件
   * @param {IApiContext} context
   * @param {IApiParams} params
   * @param {IApiData} data
   * @param {{
   *       accept: string;
   *       multiple?: boolean;
   *       showUploadManager?: boolean;
   *       extraParams?: {
   *         uploadParams?: IApiData;
   *         exportParams?: IApiData;
   *         osscat?: string;
   *       };
   *     }} [option] {上传文件类型,是否多选，是否展示文件管理器，扩展参数（包含上传附件参数、下载附加参数、自定义oss分类名称）}
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiFileUtil
   */
  chooseFileAndUpload(
    context: IApiContext,
    params: IApiParams,
    data: IApiData,
    option?: {
      accept: string;
      multiple?: boolean;
      showUploadManager?: boolean;
      extraParams?: {
        uploadParams?: IApiData;
        exportParams?: IApiData;
        osscat?: string;
      };
    },
  ): Promise<IApiData[]>;

  /**
   * @description 选择文件
   * @param {string} [accept] 选择文件类型
   * @param {boolean} [multiple] 是否多选，默认为false
   * @returns {*}  {Promise<FileList>}
   * @memberof IApiFileUtil
   */
  chooseFile(accept: string, multiple?: boolean): Promise<FileList>;

  /**
   * @description 通用请求文件方法，可自定义 responseType（默认获取Blob类型的文件流，responseType 的配置决定了请求服务时返回的文件数据格式）
   * @param {string} url 请求地址
   * @param {({
   *       context: IApiContext;
   *       params: IApiParams;
   *       data: IApiData;
   *       file: { fileId: string } & IApiData;
   *       extraParams?: IApiData;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams] 下载参数
   * @param {boolean} [enableDownloadTicket] 启用下载凭证
   * @returns {*}  {Promise<IApiData>}
   * @memberof FileUtil
   */
  requestFile(
    url: string,
    responseType?: XMLHttpRequestResponseType,
    downloadParams?: {
      context: IApiContext;
      params: IApiParams;
      data: IApiData;
      file: { fileId: string } & IApiData;
      extraParams?: IApiData;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
  ): Promise<IApiData>;
}
