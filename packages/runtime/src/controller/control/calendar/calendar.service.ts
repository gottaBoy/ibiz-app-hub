import { IHttpResponse, RuntimeError } from '@ibiz-template/core';
import { ISysCalendar, ISysCalendarItem } from '@ibiz/model-core';
import { clone } from 'ramda';
import { ICalendarItemData } from '../../../interface';
import { MDControlService, CalendarItemData } from '../../../service';

/**
 * 日历部件服务
 *
 * @author zk
 * @date 2023-08-08 10:08:54
 * @export
 * @class CalendarService
 * @extends {MDControlService<ISysCalendar>}
 */
export class CalendarService extends MDControlService<ISysCalendar> {
  /**
   * @description 删除单条数据
   * @param {string} appDataEntityId 实体标识
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @param {string} [removeAppDEActionId='remove'] 删除实体行为标识
   * @returns {*}  {Promise<IHttpResponse>}
   * @memberof CalendarService
   */
  async removeItem(
    appDataEntityId: string,
    context: IContext,
    params: IParams = {},
    removeAppDEActionId: string = 'remove',
  ): Promise<IHttpResponse> {
    const res = await this.app.deService.exec(
      appDataEntityId,
      removeAppDEActionId,
      context,
      undefined,
      params,
    );
    return res;
  }

  /**
   * 执行查询多条数据的方法
   *
   * @author zk
   * @date 2023-08-08 10:08:47
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @return {*}  Promise<ICalendarItemData[]>
   * @memberof CalendarService
   */
  async search(
    context: IContext,
    params: IParams = {},
  ): Promise<ICalendarItemData[]> {
    const { sysCalendarItems } = this.model;
    if (!sysCalendarItems) {
      return [];
    }
    const promises = sysCalendarItems.map(
      async (item): Promise<IHttpResponse> => {
        const fetchAction = item.appDEDataSetId || 'fetchdefault';
        const tempContext = context.clone();
        const tempParams: IParams = this.handleRequestParams(item, params);
        if (item.maxSize) {
          tempParams.size = item.maxSize;
        }
        return this.exec2(
          fetchAction,
          tempContext,
          tempParams,
          undefined,
          item.appDataEntityId!,
        );
      },
    );
    const resArray = await Promise.all(promises);
    // 二维数组
    const twoDimensionalArray = resArray.map(
      (res: IHttpResponse, index: number) => {
        return this.setCalendarConfigData(res.data as IData[], index);
      },
    );
    return twoDimensionalArray.flat();
  }

  /**
   * 设置日历项配置
   *
   * @author zk
   * @date 2023-08-08 06:08:14
   * @param {IData[]} items
   * @param {number} index
   * @return {*}  {ICalendarItemData[]}
   * @memberof CalendarService
   */
  private setCalendarConfigData(
    items: IData[],
    index: number,
  ): ICalendarItemData[] {
    const { sysCalendarItems } = this.model;
    if (!sysCalendarItems) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.calendar.noFoundModel'),
      );
    }
    const calendarItem = sysCalendarItems[index];
    if (!calendarItem) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.calendar.noFoundModel'),
      );
    }
    return items.map(item => {
      return new CalendarItemData(calendarItem, item);
    });
  }

  /**
   * 执行方法实体方法（通过实体id和方法名）
   *
   * @author zk
   * @date 2023-08-08 06:08:49
   * @param {string} methodName
   * @param {IContext} context
   * @param {IData} [data={}]
   * @param {IParams} [params={}]
   * @param {string} [appDataEntityId=this.model.appDataEntityId!]
   * @return {*}  {Promise<IHttpResponse>}
   * @memberof CalendarService
   */
  private async exec2(
    methodName: string,
    context: IContext,
    data: IData = {},
    params: IParams = {},
    appDataEntityId: string = this.model.appDataEntityId!,
  ): Promise<IHttpResponse> {
    const res = await this.app.deService.exec(
      appDataEntityId!,
      methodName,
      context,
      data,
      params,
    );
    return res;
  }

  /**
   * 获取查询条件参数
   *
   * @private
   * @param {ISysCalendarItem} item
   * @param {IParams} params
   * @return {*}  {IParams[]}
   * @memberof CalendarService
   */
  private getSearchConds(item: ISysCalendarItem, params: IParams): IParams[] {
    const { srfstartdate, srfenddate } = params;
    return [
      {
        condop: 'OR',
        condtype: 'GROUP',
        searchconds: [
          {
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: [
              {
                condtype: 'DEFIELD',
                fieldname: item.beginTimeAppDEFieldId,
                value: srfstartdate,
                condop: 'GTANDEQ',
              },
              {
                condtype: 'DEFIELD',
                fieldname: item.beginTimeAppDEFieldId,
                value: srfenddate,
                condop: 'LTANDEQ',
              },
            ],
          },
          {
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: [
              {
                condtype: 'DEFIELD',
                fieldname: item.endTimeAppDEFieldId,
                value: srfstartdate,
                condop: 'GTANDEQ',
              },
              {
                condtype: 'DEFIELD',
                fieldname: item.endTimeAppDEFieldId,
                value: srfenddate,
                condop: 'LTANDEQ',
              },
            ],
          },
          {
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: [
              {
                condtype: 'DEFIELD',
                fieldname: item.beginTimeAppDEFieldId,
                value: srfstartdate,
                condop: 'LT',
              },
              {
                condtype: 'DEFIELD',
                fieldname: item.endTimeAppDEFieldId,
                value: srfenddate,
                condop: 'GT',
              },
            ],
          },
        ],
      },
    ];
  }

  /**
   * 处理请求参数
   *
   * @private
   * @param {ISysCalendarItem} item
   * @param {IParams} params
   * @return {*}  {IParams}
   * @memberof CalendarService
   */
  private handleRequestParams(
    item: ISysCalendarItem,
    params: IParams,
  ): IParams {
    const tempParams: IParams = clone(params);
    const { srfstartdate, srfenddate } = tempParams;
    if (srfstartdate && srfenddate) {
      Object.assign(tempParams, {
        searchconds: this.getSearchConds(item, params),
      });
    }
    delete tempParams.srfstartdate;
    delete tempParams.srfenddate;
    return tempParams;
  }
}
