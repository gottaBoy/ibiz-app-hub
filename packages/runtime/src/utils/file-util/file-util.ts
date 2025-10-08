/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CoreConst,
  IApiContext,
  IHttpResponse,
  RuntimeError,
  downloadFileFromBlob,
  getAppCookie,
} from '@ibiz-template/core';
import qs from 'qs';
import { convertNavData } from '../nav-params/nav-params';
import { IApiDownloadTicket, IApiFileUtil } from '../../interface';
import { DownloadTicketUtil } from './download-ticket/download-ticket-util';
import { DownloadTicket } from './download-ticket/download-ticket';

/**
 * @description 文件工具类
 * @export
 * @class FileUtil
 * @implements {IApiFileUtil}
 */
export class FileUtil implements IApiFileUtil {
  /**
   * @description 下载凭证工具
   * @protected
   * @memberof FileUtil
   */
  protected downloadTicketUtil = new DownloadTicketUtil();

  /**
   * @description 自定义文件上传请求头数据
   * @protected
   * @type {Record<string, string>}
   * @memberof FileUtil
   */
  protected customUploadHeaders: Record<string, string> = {};

  /**
   * @description 设置文件上传请求头数据
   * @param {Record<string, string>} args
   * @memberof FileUtil
   */
  setUploadHeaders(args: Record<string, string>): void {
    Object.assign(this.customUploadHeaders, args);
  }

  /**
   * @description 获取是否启用下载凭证
   * @protected
   * @param {boolean} [enableDownloadTicket]
   * @returns {*}  {boolean}
   * @memberof FileUtil
   */
  protected getEnableDownloadTicket(enableDownloadTicket?: boolean): boolean {
    let tempEnableDownloadTicket = ibiz.config.common.enableDownloadTicket;
    if (enableDownloadTicket) {
      tempEnableDownloadTicket = enableDownloadTicket;
    }
    return tempEnableDownloadTicket;
  }

  /**
   * @description 获取文件上传请求头数据
   * @returns {*}  {Record<string, string>}
   * @memberof IFileUtil
   */
  getUploadHeaders(): Record<string, string> {
    const uploadHeaders: Record<string, string> = {};
    // 预定义请求头数据
    const token = getAppCookie(CoreConst.TOKEN);
    if (token) {
      Object.assign(uploadHeaders, {
        [`${ibiz.env.tokenHeader}Authorization`]: `${ibiz.env.tokenPrefix}Bearer ${token}`,
      });
    }
    // 自定义请求头数据
    if (
      this.customUploadHeaders &&
      Object.keys(this.customUploadHeaders).length > 0
    ) {
      Object.assign(uploadHeaders, {
        ...this.customUploadHeaders,
      });
    }
    return uploadHeaders;
  }

  /**
   * @description 计算OSSCat参数
   * @protected
   * @param {string} url
   * @param {IContext} context
   * @param {string} [OSSCatName]
   * @returns {*}  {string}
   * @memberof FileUtil
   */
  protected calcOSSCatUrl(
    url: string,
    context: IContext,
    OSSCatName?: string,
  ): string {
    let uploadUrl = `${ibiz.env.baseUrl}/${ibiz.env.appId}${url}`;
    const app = ibiz.hub.getApp(context.srfappid);
    const OSSCat =
      OSSCatName ||
      app.model.defaultOSSCat ||
      app.model.userParam?.DefaultOSSCat;
    uploadUrl = uploadUrl.replace('/{cat}', OSSCat ? `/${OSSCat}` : '');
    return uploadUrl;
  }

  /**
   * @description 计算文件的上传路径和下载路径,下载路径文件id用%fileId%占位，替换即可;配置编辑器参数uploadParams和exportParams时，会像导航参数一样动态添加对应的参数到url上
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} [data={}]
   * @param {IData} [extraParams={}]
   * @returns {*}  {{
   *     uploadUrl: string;
   *     downloadUrl: string;
   *   }}
   * @memberof FileUtil
   */
  calcFileUpDownUrl(
    context: IContext,
    params: IParams,
    data: IData = {},
    extraParams: IData = {},
  ): {
    uploadUrl: string;
    downloadUrl: string;
  } {
    const { uploadParams, exportParams, osscat: OSSCatName } = extraParams;
    // 计算文件上传路径
    let uploadUrl = this.calcOSSCatUrl(
      ibiz.env.uploadFileUrl,
      context,
      OSSCatName,
    );
    let downloadUrl = this.calcOSSCatUrl(
      `${ibiz.env.downloadFileUrl}/%fileId%`,
      context,
      OSSCatName,
    );
    let _uploadParams: IParams = {};
    let _exportParams: IParams = {};
    if (uploadParams) {
      _uploadParams = convertNavData(uploadParams, data, params, context);
    }
    if (exportParams) {
      _exportParams = convertNavData(exportParams, data, params, context);
    }
    uploadUrl += qs.stringify(_uploadParams, { addQueryPrefix: true });
    downloadUrl += qs.stringify(_exportParams, { addQueryPrefix: true });
    return { uploadUrl, downloadUrl };
  }

  /**
   * @description 获取下载凭证
   * @param {IApiContext} context
   * @param {IParams} params
   * @param {IData} data
   * @param {({ fileId: string } & IData)} file
   * @param {{ appEntityTag?: string; dataFieldTag?: string }} [downloadTicketParams]
   * @returns {*}  {(Promise<IApiDownloadTicket | undefined>)}
   * @memberof FileUtil
   */
  async getDownloadTicket(
    context: IApiContext,
    params: IParams,
    data: IData,
    file: { fileId: string } & IData,
    downloadTicketParams: { appEntityTag?: string; dataFieldTag?: string } = {},
  ): Promise<IApiDownloadTicket | undefined> {
    return this.downloadTicketUtil.getDownloadTicket(
      file.fileId,
      context,
      params,
      data,
      downloadTicketParams,
    );
  }

  /**
   * @description 设置下载票据
   * @param {string} fileId
   * @param {IData} downloadTicket
   * @memberof FileUtil
   */
  public setDownloadTicket(fileId: string, downloadTicket: IData): void {
    this.downloadTicketUtil.setDownloadTicket(
      fileId,
      new DownloadTicket(downloadTicket),
    );
  }

  /**
   * @description 请求url获取文件流，并用JS触发文件下载
   * @param {string} url
   * @param {string} [name]
   * @param {({
   *       context: IContext;
   *       params: IParams;
   *       data: IData;
   *       file: { fileId: string } & IData;
   *       extraParams?: IData;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams]
   * @param {boolean} [enableDownloadTicket]
   * @returns {*}  {Promise<void>}
   * @memberof FileUtil
   */
  async fileDownload(
    url: string,
    name?: string,
    downloadParams?: {
      context: IContext;
      params: IParams;
      data: IData;
      file: { fileId: string } & IData;
      extraParams?: IData;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
  ): Promise<void> {
    const tempEnableDownloadTicket =
      this.getEnableDownloadTicket(enableDownloadTicket);
    let tempDownloadUrl: string = url;
    // 应用启用传入下载凭证且外部传入下载参数才去计算凭证
    if (tempEnableDownloadTicket && downloadParams) {
      const { context, params, data, file, extraParams, downloadTicketParams } =
        downloadParams;
      const { downloadUrl } = this.calcFileUpDownUrl(
        context,
        params,
        data,
        extraParams,
      );
      const downloadTicket = await this.getDownloadTicket(
        context,
        params,
        data,
        file,
        downloadTicketParams,
      );
      if (!downloadTicket) {
        throw new RuntimeError(
          'runtime.utils.fileUtil.getDownloadTicketFailed',
        );
      }
      tempDownloadUrl = downloadUrl.replace('%fileId%', downloadTicket.ticket);
    }
    // 发送get请求
    const response = await ibiz.net.request(tempDownloadUrl, {
      method: 'get',
      responseType: 'blob',
      baseURL: '', // 已经有baseURL了，这里无需再写
    });

    if (response.status !== 200) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.failedDownload'));
    }
    // 请求成功，后台返回的是一个文件流
    if (!response.data) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.fileStreamData'));
    } else {
      // 获取文件名
      let fileName = ibiz.util.file.getFileName(response);
      // 外部传名称以外部为准，需要带文件后缀名
      if (name) fileName = name;
      downloadFileFromBlob(response.data as Blob, fileName);
    }
  }

  /**
   * @description 文件上传
   * @param {string} uploadUrl
   * @param {Blob} file
   * @param {IData} headers
   * @returns {*}  {Promise<IData>}
   * @memberof FileUtil
   */
  async fileUpload(
    uploadUrl: string,
    file: Blob,
    headers: IData,
  ): Promise<IData> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await ibiz.net.axios({
      url: uploadUrl,
      method: 'post',
      headers,
      data: formData,
    });
    if (res.status !== 200) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.utils.fileUtil.fileUploadFailed'),
      );
    }
    const result = res.data;
    // 启用传入下载凭证成功后设置下载票据
    if (ibiz.config.common.enableDownloadTicket && result.ticket) {
      ibiz.util.file.setDownloadTicket(result.id, result.ticket);
    }
    return result;
  }

  /**
   * @description 获取文件名
   * @param {IHttpResponse<IData>} response
   * @returns {*}  {string}
   * @memberof FileUtil
   */
  getFileName(response: IHttpResponse<IData>): string {
    let fileName = '';
    const contentDisposition = response.headers['content-disposition'];
    if (!contentDisposition) {
      return fileName;
    }
    const disposition = qs.parse(contentDisposition, {
      delimiter: ';',
    });
    if (disposition && disposition.filename) {
      fileName = disposition.filename as string;
    }
    // 特殊处理返回的文件名带有双引号
    if (fileName.startsWith('"') && fileName.endsWith('"')) {
      fileName = fileName.substring(1, fileName.length - 1);
    }
    return fileName;
  }

  /**
   * @description 选择文件并上传
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} data
   * @param {IData} [option={}]
   * @returns {*}  {Promise<IData[]>}
   * @memberof FileUtil
   */
  async chooseFileAndUpload(
    context: IContext,
    params: IParams,
    data: IData,
    option: IData = {},
  ): Promise<IData[]> {
    const { accept, multiple, showUploadManager, extraParams } = option;
    const urls = ibiz.util.file.calcFileUpDownUrl(
      context,
      params,
      data,
      extraParams,
    );
    const files = await ibiz.util.file.chooseFile(accept, multiple);
    let promises: IData[] = [];
    const headers = this.getUploadHeaders();
    if (showUploadManager) {
      promises = await ibiz.notification.uploadManager({
        uploadUrl: urls.uploadUrl,
        files,
        headers,
      });
      return promises;
    }
    for (let i = 0; i < files.length; i++) {
      const promise = await ibiz.util.file.fileUpload(
        urls.uploadUrl,
        files[i],
        headers,
      );
      promises.push(promise);
    }
    return Promise.all(promises);
  }

  /**
   * @description 选择文件
   * @param {string} [accept='']
   * @param {boolean} [multiple=false]
   * @returns {*}  {Promise<FileList>}
   * @memberof FileUtil
   */
  chooseFile(
    accept: string = '',
    multiple: boolean = false,
  ): Promise<FileList> {
    return new Promise(resolve => {
      // 创建 input 元素
      const inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.accept = accept;
      inputElement.multiple = multiple;
      inputElement.webkitdirectory = false;
      // 添加事件监听器，处理文件上传逻辑
      inputElement.addEventListener('change', (e: IData) => {
        resolve(e.target.files);
      });

      // 将 input 元素添加到页面中
      document.body.appendChild(inputElement);

      // 执行文件上传操作
      inputElement.click();

      // 方法结束后销毁 input 元素
      document.body.removeChild(inputElement);
    });
  }

  /**
   * @description 通用请求文件方法，可自定义 responseType（默认获取Blob类型的文件流，responseType 的配置决定了请求服务时返回的文件数据格式）
   * @param {string} url
   * @param {XMLHttpRequestResponseType} [responseType]
   * @param {({
   *       context: IContext;
   *       params: IParams;
   *       data: IData;
   *       file: { fileId: string } & IData;
   *       extraParams?: IData;
   *       downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
   *     })} [downloadParams]
   * @param {boolean} [enableDownloadTicket]
   * @returns {*}  {Promise<IData>}
   * @memberof FileUtil
   */
  async requestFile(
    url: string,
    responseType?: XMLHttpRequestResponseType,
    downloadParams?: {
      context: IContext;
      params: IParams;
      data: IData;
      file: { fileId: string } & IData;
      extraParams?: IData;
      downloadTicketParams?: { appEntityTag?: string; dataFieldTag?: string };
    },
    enableDownloadTicket?: boolean,
  ): Promise<IData> {
    let tempDownloadUrl: string = url;
    const tempEnableDownloadTicket =
      this.getEnableDownloadTicket(enableDownloadTicket);
    // 如果启用了下载凭证，并且传入了下载参数，则拼接带凭证的下载地址
    if (tempEnableDownloadTicket && downloadParams) {
      const { context, params, data, file, extraParams, downloadTicketParams } =
        downloadParams;
      const { downloadUrl } = ibiz.util.file.calcFileUpDownUrl(
        context,
        params,
        data,
        extraParams,
      );
      const downloadTicket = await ibiz.util.file.getDownloadTicket(
        context,
        params,
        data,
        file,
        downloadTicketParams,
      );

      if (!downloadTicket) {
        throw new RuntimeError(
          'runtime.utils.fileUtil.getDownloadTicketFailed',
        );
      }
      tempDownloadUrl = downloadUrl.replace('%fileId%', downloadTicket.ticket);
    }

    // 发送请求
    const response = await ibiz.net.request(tempDownloadUrl, {
      method: 'get',
      responseType: responseType || 'blob',
      baseURL: '', // 已经有 baseURL，不需要再写
    });

    if (response.status !== 200) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.failedDownload'));
    }

    if (!response.data) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.fileStreamData'));
    }

    return response.data;
  }
}
