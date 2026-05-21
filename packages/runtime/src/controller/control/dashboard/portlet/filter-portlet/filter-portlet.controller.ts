import { IDBFilterPortletPart, IDBPortletPart } from '@ibiz/model-core';
import { recursiveIterate } from '@ibiz-template/core';
import { PortletPartController } from '../portlet-part/portlet-part.controller';
import { FilterPortletState } from './filter-portlet-part.state';
import {
  IApiFilterPortletController,
  IPortletController,
  ISearchCondEx,
} from '../../../../../interface';
import { CustomDashboardController } from '../../custom-dashboard.controller';
import {
  filterNode2SearchCondEx,
  SearchCondEx2filterNode,
} from '../../../search-bar';
import {
  filterDEDQConditions2SearchConds,
  filterPortletByConfig,
  filterPortletByID,
  generateCacheKy,
  getFilterSearchConds,
} from '../../dashboard.util';
import { handleAllSettled } from '../../../../../utils';

/**
 * @description 门户部件控制器（过滤器）
 * @export
 * @class FilterPortletController
 * @extends {PortletPartController<IDBFilterPortletPart>}
 * @implements {IApiFilterPortletController}
 */
export class FilterPortletController
  extends PortletPartController<IDBFilterPortletPart>
  implements IApiFilterPortletController
{
  /**
   * 过滤器门户部件状态
   *
   * @type {FilterPortletState}
   * @memberof PortletPartController
   */
  declare state: FilterPortletState;

  /**
   * 过滤器配置
   *
   * @author tony001
   * @date 2024-07-26 21:07:13
   * @type {IData}
   */
  public filterConfig: IData = {};

  /**
   * jsonSchema属性组
   *
   * @author tony001
   * @date 2024-07-26 21:07:22
   * @type {IData[]}
   */
  public jsonSchemaFields: IData[] = [];

  /**
   * 搜索条件
   *
   * @author tony001
   * @date 2024-07-26 21:07:35
   * @type {(ISearchCondEx | undefined)}
   */
  public searchConds: ISearchCondEx | undefined;

  /**
   * 条件缓存key
   *
   * @author tony001
   * @date 2024-07-28 10:07:24
   * @protected
   * @type {string}
   */
  protected searchCondCacheKey: string = '';

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-07-26 21:07:31
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.searchCondCacheKey = generateCacheKy(
      this.context,
      this.dashboard,
      this.model.id!,
    );
    const customDashboard =
      this.dashboard.getCustomDashboard() as CustomDashboardController;
    this.jsonSchemaFields = await ibiz.util.jsonSchema.getEntitySchemaFields(
      this.model.appDataEntityId!,
      this.context,
      this.params,
    );
    if (customDashboard) {
      this.filterConfig =
        customDashboard.portletFilter[this.model.id!]?.config || {};
      const cacheSearchConds = localStorage.getItem(this.searchCondCacheKey);
      this.searchConds =
        cacheSearchConds && cacheSearchConds !== 'undefined'
          ? JSON.parse(cacheSearchConds)
          : customDashboard.portletFilter[this.model.id!]?.searchconds;
      // 如果没有自定义条件，存在预置条件，则界面需绘制预置条件
      if (this.searchConds) {
        this.state.filterNode = SearchCondEx2filterNode(this.searchConds);
      } else if (this.model.filterDEDQConditions) {
        const modelSearchConds = filterDEDQConditions2SearchConds(
          this.model.filterDEDQConditions,
        );
        if (modelSearchConds && modelSearchConds.length > 0) {
          const tempFieldSearchConds: ISearchCondEx[] = [];
          recursiveIterate(
            modelSearchConds[0],
            (item: ISearchCondEx) => {
              if (item.condtype === 'DEFIELD') {
                tempFieldSearchConds.push(item);
              }
            },
            {
              childrenFields: ['searchconds'],
            },
          );
          this.state.filterNode = SearchCondEx2filterNode({
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: tempFieldSearchConds,
          });
        }
      }
    }
  }

  /**
   * 获取搜索条件
   *
   * @author tony001
   * @date 2024-07-28 09:07:49
   * @return {*}  {(ISearchCondEx | undefined)}
   */
  getSearchConds(): ISearchCondEx | undefined {
    return getFilterSearchConds(
      this.searchConds,
      this.model.filterDEDQConditions,
    );
  }

  /**
   * 计算受影响的门户部件标识
   *
   * @author tony001
   * @date 2024-08-01 17:08:40
   * @protected
   * @return {*}  {string[]}
   */
  protected computeEffectivePortletIDs(): string[] {
    const items: IDBPortletPart[] = [];
    Object.values(this.dashboard.portlets).forEach(
      (portlet: IPortletController) => {
        if (
          portlet.model &&
          portlet.model.portletType !== 'FILTER' &&
          portlet.model.portletType !== 'RAWITEM' &&
          portlet.model.portletType !== 'CONTAINER'
        ) {
          items.push(portlet.model as IDBPortletPart);
        }
      },
    );
    const allPortlets = filterPortletByID(
      this.model.id!,
      this.context,
      items,
      this.dashboard.model.dashboardStyle === 'BIREPORTDASHBOARD' ||
        this.dashboard.model.dashboardStyle === 'BIREPORTDASHBOARD2',
    );
    const effectivePortletIDs: string[] = filterPortletByConfig(
      this.filterConfig || {},
      allPortlets.map(portlet => {
        return portlet.id!;
      }),
    );
    return effectivePortletIDs;
  }

  /**
   * 重置过滤器
   *
   * @author tony001
   * @date 2024-07-26 22:07:10
   * @return {*}  {Promise<boolean>}
   */
  async resetFilter(): Promise<boolean> {
    // 清空缓存
    localStorage.removeItem(this.searchCondCacheKey);
    // 重置searchConds
    const customDashboard =
      this.dashboard.getCustomDashboard() as CustomDashboardController;
    this.searchConds =
      customDashboard.portletFilter[this.model.id!]?.searchconds;
    if (this.searchConds) {
      this.state.filterNode = SearchCondEx2filterNode(this.searchConds);
    }
    // 刷新数据
    const effectivePortletIDs = this.computeEffectivePortletIDs();
    await handleAllSettled(
      effectivePortletIDs.map(async id => {
        return this.dashboard.portlets[id].refresh();
      }),
    );
    return true;
  }

  /**
   * 搜索
   *
   * @author tony001
   * @date 2024-07-26 22:07:14
   * @return {*}  {Promise<boolean>}
   */
  async search(): Promise<boolean> {
    // 本地缓存条件
    if (!this.state.filterNode) {
      this.state.filterNode = {
        nodeType: 'GROUP',
        logicType: 'AND',
        children: [],
      };
    }
    this.searchConds = filterNode2SearchCondEx(this.state.filterNode);
    localStorage.setItem(
      this.searchCondCacheKey,
      JSON.stringify(this.searchConds),
    );
    // 刷新数据
    const effectivePortletIDs = this.computeEffectivePortletIDs();
    await handleAllSettled(
      effectivePortletIDs.map(async id => {
        return this.dashboard.portlets[id].refresh();
      }),
    );
    return true;
  }

  /**
   * 显示影响部件
   *
   * @author tony001
   * @date 2024-07-26 22:07:48
   * @return {*}  {Promise<void>}
   */
  async showEffectiveCtrl(): Promise<void> {
    const effectivePortletIDs = this.computeEffectivePortletIDs();
    await handleAllSettled(
      effectivePortletIDs.map(async id => {
        return this.dashboard.portlets[id].hightLight();
      }),
    );
  }
}
