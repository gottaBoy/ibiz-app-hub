import { IHttpResponse } from '@ibiz-template/core';
import { INavigateParam } from '@ibiz/model-core';
import { DownloadTicket } from './download-ticket';
import { calcDeCodeNameById } from '../../../model';
import { convertNavData } from '../../nav-params/nav-params';

/**
 * @description 下载票据功能服务
 * @export
 * @class DownloadTicketUtil
 */
export class DownloadTicketUtil {
  /**
   * @description 下载票据缓存
   * @protected
   * @type {Map<string, DownloadTicket>} 键为文件id，值为下载票据对象
   * @memberof DownloadTicketUtil
   */
  protected cache: Map<string, DownloadTicket> = new Map();

  /**
   * @description 执行中缓存（防止短时间重复请求）
   * @protected
   * @type {Map<string, Promise<IHttpResponse<IData>>>}
   * @memberof DownloadTicketUtil
   */
  protected processCache: Map<string, Promise<IHttpResponse<IData>>> =
    new Map();

  /**
   * @description 设置下载票据
   * @param {string} fileId
   * @param {DownloadTicket} downloadTicket
   * @memberof DownloadTicketUtil
   */
  public setDownloadTicket(
    fileId: string,
    downloadTicket: DownloadTicket,
  ): void {
    this.cache.set(fileId, downloadTicket);
  }

  /**
   * @description 获取下载票据
   * @param {string} fileId
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} data
   * @param {{ appEntityTag?: string; dataFieldTag?: string }} [downloadTicketParams={}]
   * @returns {*}  {(Promise<DownloadTicket | undefined>)}
   * @memberof DownloadTicketUtil
   */
  async getDownloadTicket(
    fileId: string,
    context: IContext,
    params: IParams,
    data: IData,
    downloadTicketParams: { appEntityTag?: string; dataFieldTag?: string } = {},
  ): Promise<DownloadTicket | undefined> {
    const tryDownloadTicket = this.cache.get(fileId);
    if (tryDownloadTicket && !tryDownloadTicket.isExpirein) {
      return tryDownloadTicket;
    }
    let result;
    const processDownloadTicket = this.processCache.get(fileId);
    if (processDownloadTicket) {
      result = await processDownloadTicket;
    } else {
      const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
      if (!uiDomain) {
        ibiz.log.warn(
          ibiz.i18n.t('runtime.utils.uiDomainManager.invalidInterfaceDomain', {
            id: context.srfsessionid,
          }),
        );
        return;
      }
      const app = ibiz.hub.getApp(context.srfappid);
      // 矫正实体服务及应用上下文数据
      const resultContext = context.clone();
      const { appEntityTag, dataFieldTag } = downloadTicketParams;
      if (dataFieldTag) {
        const navContexts: INavigateParam[] = [];
        const key: string = calcDeCodeNameById(
          appEntityTag || uiDomain.appDataEntityId!,
        );
        navContexts.push({
          key,
          value: dataFieldTag.toLowerCase(),
          rawValue: false,
        } as INavigateParam);
        const tempContext = convertNavData(navContexts, data, context, params);
        Object.assign(resultContext, tempContext);
      }
      const entityService = await app.deService.getService(
        resultContext,
        appEntityTag || uiDomain.appDataEntityId!,
      );
      const res = entityService.createDownloadTicket(resultContext, {
        srfossfileid: fileId,
      });
      this.processCache.set(fileId, res);
      try {
        result = await res;
      } finally {
        this.processCache.delete(fileId);
      }
    }
    if (!result.ok || !result.data) return;
    const downloadTicket = new DownloadTicket(result.data);
    this.setDownloadTicket(fileId, downloadTicket);
    return downloadTicket;
  }
}
