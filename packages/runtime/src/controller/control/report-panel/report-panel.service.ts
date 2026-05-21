import { IDEReportPanel } from '@ibiz/model-core';
import { IHttpResponse } from '@ibiz-template/core';
import { ControlService, ControlVO } from '../../../service';

export class ReportPanelService<
  T extends IDEReportPanel = IDEReportPanel,
> extends ControlService<T> {
  /**
   * @description 查询报表数据
   * @param {string} reportTag 报表标识
   * @param {string} appDataEntityId 报表实体标识
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse<ControlVO[]>>}
   * @memberof ReportPanelService
   */
  async fetch(
    reportTag: string,
    appDataEntityId: string,
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO[]>> {
    const dataEntity = await ibiz.hub.getAppDataEntity(
      appDataEntityId!,
      this.model.appId,
    );
    const url = `${dataEntity.deapicodeName2}/report?srfreporttag=${reportTag}`;
    let res = await ibiz.net.request(url, {
      method: 'post',
      data: params,
    });
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO[]>;
  }
}
