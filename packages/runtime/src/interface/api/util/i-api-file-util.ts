import {
  IApiContext,
  IApiData,
  IApiParams,
  IHttpResponse,
} from '@ibiz-template/core';
import { IApiDownloadTicket } from '../common';

/**
 * @description 扩展参数接口，用于计算附件的上传和下载路径
 * @export
 * @interface IApiFileUpDownExtraParams
 */
export interface IApiFileUpDownExtraParams {
  /**
   * @description 上传附件参数，用于计算上传路径
   * @type {IApiData}
   * @memberof IApiFileUpDownExtraParams
   */
  uploadParams?: IApiData;
  /**
   * @description 下载附件参数，用于计算下载路径
   * @type {IApiData}
   * @memberof IApiFileUpDownExtraParams
   */
  exportParams?: IApiData;
  /**
   * @description 用于计算上传和下载路径的OSS参数
   * @type {string}
   * @memberof IApiFileUpDownExtraParams
   */
  osscat?: string;
  /**
   * @description 启用无权限模式。启用后，上传文件夹需拼接'$'字符，也不需要计算下载凭证
   * @type {boolean}
   * @memberof IApiFileUpDownExtraParams
   */
  enableNoAccess?: boolean;
  /**
   * @description 是否启用全局下载文件前缀
   * @type {boolean}
   * @memberof IApiFileUpDownExtraParams
   */
  globalDownloadPrifix?: boolean;
}

/**
 * @description 文件工具类
 * @export
 * @interface IApiFileUtil
 */
export interface IApiFileUtil {
  /**
   * @description 设置文件上传请求头数据
   * @param {Record<string, string>} args 请求头数据
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
   * @param {IApiFileUpDownExtraParams} [extraParams] 扩展参数（包含上传附件参数、下载附加参数、自定义oss分类名称、启用无权限模式）
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
    extraParams?: IApiFileUpDownExtraParams,
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
  getFileName(response: IHttpResponse): string;

  /**
   * @description 文件下载
   * @param {string} url 下载地址
   * @param {string} [name] 文件名
   * @param {({
   *       context: IApiContext;
   *       params: IApiParams;
   *       data: IApiData;
   *       file: { fileId: string } & IApiData;
   *       extraParams?: IApiFileUpDownExtraParams;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams] {应用上下文；视图参数；数据；文件信息；扩展参数（包含上传附件参数、下载附加参数、自定义oss分类名称、启用无权限模式）;下载凭证参数}
   * @param {boolean} [enableDownloadTicket] 启用下载凭证
   * @param {boolean} [enableNoAccess] 启用无权限模式
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
      extraParams?: IApiFileUpDownExtraParams;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
    enableNoAccess?: boolean,
  ): Promise<void>;

  /**
   * @description 获取下载凭证
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} data 业务数据
   * @param {({ fileId: string } & IApiData)} file 文件信息
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
   * @param {string} fileId 文件标识
   * @param {IApiData} downloadTicket 下载凭证数据
   * @memberof IApiFileUtil
   */
  setDownloadTicket(fileId: string, downloadTicket: IApiData): void;

  /**
   * @description 文件上传
   * @param {string} uploadUrl 上传地址
   * @param {Blob} file 文件
   * @param {IApiData} headers 请求头
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
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} data 业务数据
   * @param {{
   *       accept: string;
   *       multiple?: boolean;
   *       showUploadManager?: boolean;
   *       extraParams?: IApiFileUpDownExtraParams;
   *     }} [option] {上传文件类型；是否多选；是否展示文件管理器；扩展参数（包含上传附件参数、下载附加参数、自定义oss分类名称、启用无权限模式）}
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
      extraParams?: IApiFileUpDownExtraParams;
    },
  ): Promise<IApiData[] | undefined>;

  /**
   * @description 选择文件
   * @param {string} [accept] 选择文件类型
   * @param {boolean} [multiple] 是否多选，默认为false
   * @returns {*}  {Promise<FileList | undefined>}
   * @memberof IApiFileUtil
   */
  chooseFile(accept: string, multiple?: boolean): Promise<FileList | undefined>;

  /**
   * @description 通用请求文件方法，可自定义 responseType（默认获取Blob类型的文件流，responseType 的配置决定了请求服务时返回的文件数据格式）
   * @param {string} url 请求地址
   * @param {({
   *       context: IApiContext;
   *       params: IApiParams;
   *       data: IApiData;
   *       file: { fileId: string } & IApiData;
   *       extraParams?: IApiFileUpDownExtraParams;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams] {应用上下文；视图参数；数据；文件信息；扩展参数（包含上传附件参数、下载附加参数、自定义oss分类名称、启用无权限模式）;下载凭证参数}
   * @param {boolean} [enableDownloadTicket] 启用下载凭证
   * @param {boolean} [enableNoAccess] 启用无权限模式
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
      extraParams?: IApiFileUpDownExtraParams;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
    enableNoAccess?: boolean,
  ): Promise<IApiData>;

  /**
   * @description 图片压缩
   * @param {File} file 原始文件
   * @param {number} maxW 最大宽度（默认 1280）
   * @param {number} quality 压缩质量 0~1（默认 0.8）
   * @returns {*}  {Promise<File>} 压缩后的新文件
   * @memberof IApiFileUtil
   */
  compressImg(file: File, maxW: number, quality: number): Promise<File>;

  /**
   * @description base64转Blob对象
   * @param {string} base64 base64 字符串
   * @returns {*}  {Blob} Blob对象
   * @memberof IApiFileUtil
   */
  base64ToBlob(base64: string): Blob;
}
