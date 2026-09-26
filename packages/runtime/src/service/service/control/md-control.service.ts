import { IHttpResponse } from '@ibiz-template/core';
import { IAppDEDataExport, IMDAjaxControl } from '@ibiz/model-core';
import { isArray } from 'qx-util';
import { ControlVO } from '../../vo/control.vo';
import { ControlService } from './control.service';

export class MDControlService<
  T extends IMDAjaxControl = IMDAjaxControl,
> extends ControlService<T> {
  /**
   * 执行查询多条数据的方法
   *
   * @author lxm
   * @date 2022-08-31 17:08:41
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse>}
   */
  async fetch(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO[]>> {
    const fetchAction =
      this.model.fetchControlAction?.appDEMethodId || 'fetchdefault';
    let res = await this.exec(fetchAction, context, params);
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO[]>;
  }

  /**
   * 执行获取单条数据方法
   *
   * @author lxm
   * @date 2022-08-31 17:08:41
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse>}
   */
  async get(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO>> {
    const getAction = this.model.getControlAction?.appDEMethodId || 'get';
    let res = await this.exec(getAction, context, undefined, params);
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 执行获取草稿方法
   *
   * @author lxm
   * @date 2022-08-31 17:08:41
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse>}
   */
  async getDraft(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO>> {
    const getDraftAction =
      this.model.getDraftControlAction?.appDEMethodId || 'getdraft';
    let res = await this.exec(getDraftAction, context, undefined, params);
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 删除单条数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:48
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}
   */
  async remove(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse> {
    const removeAction =
      this.model.removeControlAction?.appDEMethodId || 'remove';
    const res = await this.exec(removeAction, context, undefined, params);
    return res;
  }

  /**
   * 新建数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {ControlVO} data 数据
   * @returns {*}
   */
  async create(
    context: IContext,
    data: ControlVO,
  ): Promise<IHttpResponse<ControlVO>> {
    const createAction =
      this.model.createControlAction?.appDEMethodId || 'create';
    let res = await this.exec(createAction, context, data.getOrigin());
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 更新数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {ControlVO} data 数据
   * @returns {*}
   */
  async update(
    context: IContext,
    data: ControlVO,
  ): Promise<IHttpResponse<ControlVO>> {
    const updateAction =
      this.model.updateControlAction?.appDEMethodId || 'update';
    let res = await this.exec(updateAction, context, data.getOrigin());
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 批量更新数据
   *
   * @author chitanda
   * @date 2023-12-21 10:12:09
   * @param {IContext} context
   * @param {ControlVO[]} data
   * @return {*}  {Promise<void>}
   */
  async updateBatch(
    context: IContext,
    data: ControlVO[],
  ): Promise<IHttpResponse<ControlVO[]>> {
    const updateAction =
      this.model.updateControlAction?.appDEMethodId || 'update';
    let res = await this.exec(
      updateAction,
      context,
      data.map(item => item.getOrigin()),
    );
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO[]>;
  }

  /**
   * @description 导出数据
   * @param {IAppDEDataExport} dataExport 导出模型
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 请求参数
   * @returns {*}  {Promise<boolean>}
   * @memberof MDControlService
   */
  async exportData(
    dataExport: IAppDEDataExport,
    context: IContext,
    params: IParams = {},
  ): Promise<boolean> {
    const entityService = await this.app.deService.getService(
      context,
      this.model.appDataEntityId!,
    );
    return entityService.file.export(
      dataExport,
      dataExport.appDEDataSetId ||
        this.model.fetchControlAction!.appDEMethodId!,
      context,
      params,
    );
  }

  /**
   * 处理响应
   *
   * @author lxm
   * @date 2022-08-31 17:08:13
   * @param {IHttpResponse} res
   * @returns {*}  {IHttpResponse}
   */
  handleResponse(response: IHttpResponse): IHttpResponse {
    const res = super.handleResponse(response) as IHttpResponse<
      IData[] | IData
    >;
    if (res.headers) {
      if (res.headers['x-page']) {
        res.page = Number(res.headers['x-page']);
      }
      if (res.headers['x-per-page']) {
        res.size = Number(res.headers['x-per-page']);
      }
      if (res.headers['x-total']) {
        res.total = Number(res.headers['x-total']);
      }
      if (res.headers['x-totalx']) {
        res.totalx = Number(res.headers['x-totalx']);
      }
      if (res.headers['x-total-pages']) {
        res.totalPages = Number(res.headers['x-total-pages']);
      }
    }
    if (res.ok) {
      if (isArray(res.data)) {
        res.data = (res.data as IData[]).map(item => this.toUIData(item));
      } else {
        res.data = this.toUIData(res.data);
      }
    }
    return res;
  }
}
