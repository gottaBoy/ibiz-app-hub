/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IAppPortlet,
  IDashboard,
  IDBContainerPortletPart,
  IDBFilterPortletPart,
  IDBPortletPart,
} from '@ibiz/model-core';
import { clone } from 'ramda';
import { ControlType } from '../../../constant';
import {
  IDashboardState,
  IDashboardEvent,
  IDashboardController,
  IPortletProvider,
  IPortletController,
  IPortletContainerController,
  IModalData,
  ISearchCond,
  IApiPortletTypeMapping,
} from '../../../interface';
import { getPortletProvider } from '../../../register';
import { handleAllSettled } from '../../../utils';
import { ControlController } from '../../common';
import { getOriginData } from '../../utils';
import { FilterPortletController } from './portlet';
import { CustomDashboardController } from './custom-dashboard.controller';
import {
  deepFillSubAppId,
  filterPortletByConfig,
  filterPortletByID,
  generateCacheKy,
  getFilterSearchConds,
  getPortletModelByID,
} from './dashboard.util';
import { MobCustomDashboardController } from './mob-custom-dashboard.controller';

/**
 * 数据看板部件控制器
 * @author lxm
 * @date 2023-07-07 03:27:29
 * @export
 * @class DashboardController
 * @extends {ControlController<IDashboard, IDashboardState, IDashboardEvent>}
 * @implements {IDashboardController}
 */
export class DashboardController
  extends ControlController<IDashboard, IDashboardState, IDashboardEvent>
  implements IDashboardController
{
  /**
   * 所有数据看板成员的适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: IPortletProvider }}
   */
  providers: { [key: string]: IPortletProvider } = {};

  /**
   * 门户部件控制器
   *
   * @author lxm
   * @date 2022-10-20 22:10:26
   * @type {{ [key: string]: IPortletController }}
   */
  portlets: { [key: string]: IPortletController } = {};

  /**
   * 动态门户部件Map
   *
   * @author tony001
   * @date 2024-07-09 17:07:57
   * @type {Map<string, IData>}
   */
  dynaPortletMap: Map<string, IData> = new Map();

  /**
   * 自定义数据看板部件控制器
   *
   * @author tony001
   * @date 2024-07-26 14:07:38
   * @type {(CustomDashboardController | undefined)}
   */
  customDashboard: CustomDashboardController | undefined;

  /**
   * @description 移动端自定义数据看板部件控制器
   * @type {(MobCustomDashboardController | undefined)}
   * @memberof DashboardController
   */
  mobCustomDashboard: MobCustomDashboardController | undefined;

  public enableAnchorCtrls: IData[] = [];

  /**
   * 初始化状态
   *
   * @author tony001
   * @date 2024-07-26 14:07:19
   * @protected
   */
  protected initState(): void {
    super.initState();
  }

  // 创建完成
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initPortlets(this.model.controls!);
    // 实体门户视图监听视图数据变更，刷新界面行为组的状态。
    const { appDataEntityId } = this.view.model;
    if (appDataEntityId) {
      this.view.evt.on('onDataChange', event => {
        const data = getOriginData(event.data);
        if (data) {
          this.dataChangeNotify(data);
        }
      });
    }
  }

  /**
   * 设置自定义数据看板部件控制器
   *
   * @author tony001
   * @date 2024-07-26 14:07:21
   * @param {CustomDashboardController} customDashboard
   */
  setCustomDashboard(customDashboard: CustomDashboardController): void {
    this.customDashboard = customDashboard;
  }

  /**
   * 获取自定义数据看板部件控制器
   *
   * @author tony001
   * @date 2024-07-26 21:07:32
   * @return {*}  {(CustomDashboardController | undefined)}
   */
  getCustomDashboard(): CustomDashboardController | undefined {
    return this.customDashboard;
  }

  /**
   * @description 设置移动端自定义数据看板部件控制器
   * @param {MobCustomDashboardController} mobCustomDashboard
   * @memberof DashboardController
   */
  setMobCustomDashboard(
    mobCustomDashboard: MobCustomDashboardController,
  ): void {
    this.mobCustomDashboard = mobCustomDashboard;
  }

  /**
   * @description 获取移动端自定义数据看板部件控制器
   * @returns {*}  {(MobCustomDashboardController | undefined)}
   * @memberof DashboardController
   */
  getMobCustomDashboard(): MobCustomDashboardController | undefined {
    return this.mobCustomDashboard;
  }

  /**
   * 初始化子门户部件
   *
   * @author lxm
   * @date 2022-10-21 03:10:49
   * @param {PortletPartModel[]} portletModels
   * @param {ContainerPortletController} [parent]
   * @returns {*}  {Promise<void>}
   */
  async initPortlets(
    portletModels: IDBPortletPart[],
    parent?: IPortletContainerController,
  ): Promise<void> {
    if (!portletModels?.length) {
      return;
    }
    // 这块只初始化子门户部件，忽略子门户部件里面嵌入的部件
    const ignorePortletTypes: string[] = [
      ControlType.CHART,
      ControlType.APP_MENU,
      ControlType.TOOLBAR,
      ControlType.LIST,
      ControlType.REPORT_PANEL,
    ];
    await Promise.all(
      portletModels.map(async portlet => {
        if (
          portlet.controlType &&
          ignorePortletTypes.includes(portlet.controlType)
        ) {
          return;
        }
        if (portlet.enableAnchor) {
          this.enableAnchorCtrls.push(portlet);
        }
        const provider = await getPortletProvider(portlet);
        if (provider) {
          this.providers[portlet.id!] = provider;
          const controller = await provider.createController(
            portlet,
            this,
            parent,
          );
          this.portlets[portlet.id!] = controller;
          if ((portlet as IDBContainerPortletPart).controls?.length) {
            await this.initPortlets(
              (portlet as IDBContainerPortletPart).controls!,
              controller as IPortletContainerController,
            );
          }
        }
      }),
    );
    if (!parent) {
      this.evt.emit('onInitPortlets', undefined);
    }
  }

  /**
   * 初始化
   *
   * @param {IData} [config={}]
   * @return {*}  {Promise<void>}
   * @memberof DashboardController
   */
  async initPortletsConfig(config: IData = {}): Promise<void> {
    Object.keys(config).forEach((key: string) => {
      const portlet = this.portlets[key];
      if (portlet) {
        portlet.config = config[key];
        portlet.state.title = portlet.config.srftitle;
        Object.assign(portlet.params, portlet.config);
      }
    });
  }

  /**
   * 重置门户
   *
   * @return {*}  {Promise<void>}
   * @memberof DashboardController
   */
  async resetPortlets(): Promise<void> {
    Object.keys(this.portlets).forEach((key: string) => {
      const portlet = this.portlets[key];
      portlet.resetConfig();
    });
    this.evt.emit('onResetPortlet', undefined);
  }

  /**
   * 加载动态
   *
   * @author tony001
   * @date 2024-06-27 16:06:21
   * @return {*}  {Promise<IData[]>}
   */
  async loadAllDynaPortlet(): Promise<IData[]> {
    const app = ibiz.hub.getApp(this.model.appId);
    const result: IData[] = [];
    // 存在动态代码表标识
    if (this.controlParams.dynamiccodelist) {
      const dynamicCodeListTag = this.controlParams.dynamiccodelist;
      const codeListItems = await app.codeList.get(
        dynamicCodeListTag,
        this.context,
        this.params,
      );
      if (codeListItems && codeListItems.length > 0) {
        codeListItems.forEach(item => {
          result.push({
            ...item.data,
            psappportletid: item.value,
            psappportletname: item.text,
          });
        });
      }
    } else {
      const res = await app.deService.exec(
        'psappportlet',
        'fetchdefault',
        this.context,
        {
          size: 1000,
          n_pssysappid_eq: app.model.codeName,
          n_dynamodelflag_noteq: 0,
        },
      );
      if (res && res.data?.length > 0) {
        res.data.forEach((item: IData) => {
          result.push({
            psappportletid: item.psappportletid,
            codename: item.codename,
            psappportletname: item.psappportletname,
            groupcodename: 'Ungroup',
            groupname: ibiz.i18n.t(
              'runtime.controller.control.dashboard.unGroup',
            ),
          });
        });
      }
    }
    return result;
  }

  /**
   * 通过指定标识加载门户部件
   *
   * @author tony001
   * @date 2024-06-27 17:06:12
   * @param {string} id
   * @return {*}  {(Promise<IDBPortletPart | undefined>)}
   */
  async loadDynaPortletById(id: string): Promise<IDBPortletPart | undefined> {
    const app = ibiz.hub.getApp(this.model.appId);
    const tempContext = clone(this.context);
    Object.assign(tempContext, { psappportlet: id });
    const res = await app.deService.exec(
      'psappportlet',
      'get',
      tempContext,
      this.params,
    );
    this.dynaPortletMap.set(id, res.data);
    if (res && res.data && res.data.controlmodel) {
      const controlModel = JSON.parse(res.data.controlmodel);
      const result = (await ibiz.hub.translationModelToDsl(
        controlModel,
        'CTRL',
      )) as any;
      const appId = res.data.pssysappid;
      if (appId) {
        const mainApp = ibiz.hub.getApp(ibiz.env.appId);
        const targetApp = mainApp.model.subAppRefs?.find(subAppRef => {
          return subAppRef.id?.endsWith(appId);
        });
        if (targetApp && targetApp.id) {
          deepFillSubAppId(result, targetApp.id);
        }
      }
      return result;
    }
  }

  /**
   * 通知所有表单成员表单操作过程中的数据变更
   *
   * @author lxm
   * @date 2022-09-20 18:09:40
   * @param {string[]} names
   */
  async dataChangeNotify(data: IData): Promise<void> {
    // 通知所有成员项去处理成员项相关逻辑
    await handleAllSettled(
      Object.values(this.portlets).map(async portlet => {
        return portlet.dataChangeNotify(data);
      }),
    );
  }

  /**
   * 打开过滤器设计界面
   *
   * @author tony001
   * @date 2024-07-26 11:07:02
   * @param {{ id: string }} { id } 过滤部件标识
   * @return {*}  {Promise<void>}
   */
  async openFilterDesignPage(args?: { id: string }): Promise<void> {
    let isNewFilter: boolean = true;
    const filterDesignParams: IData = {};
    if (args && args.id) {
      isNewFilter = false;
      const targetPorlet = this.portlets[args.id];
      if (targetPorlet) filterDesignParams.filter = targetPorlet;
    }
    if (this.model.dashboardStyle) {
      filterDesignParams.dashboardStyle = this.model.dashboardStyle;
    }
    const items: IModel[] = [];
    Object.values(this.portlets).forEach((portlet: IPortletController) => {
      if (
        portlet.model &&
        portlet.model.portletType !== 'FILTER' &&
        portlet.model.portletType !== 'RAWITEM' &&
        portlet.model.portletType !== 'CONTAINER'
      ) {
        items.push(portlet.model);
      }
    });
    filterDesignParams.items = items;
    const modal = ibiz.overlay.createModal(
      'iBizFilterPortletDesign',
      {
        dismiss: (_data?: IModalData) => modal.dismiss(_data),
        context: this.context,
        viewParams: this.params,
        ...filterDesignParams,
      },
      {
        width: '90%',
        height: '90%',
        footerHide: true,
      },
    );
    modal.present();
    const result: IModalData = await modal.onWillDismiss();
    const { ok, data } = result;
    if (!ok || !data) return;
    const { model, config, searchconds } = data[0];
    await this.saveFilterData(model, config, searchconds, isNewFilter);
  }

  /**
   * 保存过滤器数据
   *
   * @author tony001
   * @date 2024-07-26 16:07:01
   * @protected
   * @param {IModel} model
   * @param {IData} config
   * @param {boolean} isNewFilter
   */
  protected async saveFilterData(
    model: IModel,
    config: IData,
    searchconds: ISearchCond,
    isNewFilter: boolean,
  ): Promise<void> {
    if (!this.customDashboard) return;
    const app = ibiz.hub.getApp(this.model.appId);
    // 新建
    if (isNewFilter) {
      // 仿真过滤器占位
      const portletCat = app.model.appPortletCats?.find(
        cat => cat.codeName === model.appPortletCat?.codeName,
      );
      const mockFilter: IData = {
        type: 'app',
        portletCodeName: model.codeName!,
        portletName: model.title!,
        groupCodeName: portletCat?.codeName || '',
        groupName: portletCat?.name || '',
        appCodeName: model.appDataEntityId,
        appName: app.model.name!,
        w: 12,
        h: 3,
        x: 0,
        y: 0,
        i: model.codeName!,
      };
      // 修改原门户部件占位位置,统一下调3个单元
      const { customModelData } = this.customDashboard;
      if (customModelData && customModelData.length > 0) {
        customModelData.forEach((item: IData) => {
          item.y += 3;
        });
      }
      this.customDashboard.customModelData.unshift(mockFilter);
    }
    // 设置缓存
    const searchCondCacheKey = generateCacheKy(this.context, this, model.id);
    if (searchconds) {
      localStorage.setItem(searchCondCacheKey, JSON.stringify(searchconds));
    } else {
      localStorage.removeItem(searchCondCacheKey);
    }

    // 存数
    const result = await this.customDashboard.saveCustomModelData(
      this.customDashboard.customModelData,
      { [model.id!]: { srftitle: model.title! } },
      { [model.id]: { config, searchconds } },
    );
    this.evt.emit('onSavePortlet', result);
  }

  /**
   * 刷新数据
   *
   * @author tony001
   * @date 2024-07-28 09:07:21
   * @return {*}  {Promise<void>}
   */
  async refresh(args?: IData): Promise<void> {
    Object.assign(this.params, args);
    await handleAllSettled(
      Object.values(this.portlets).map(async portlet => {
        return portlet.refresh();
      }),
    );
  }

  /**
   * 通过门户部件标识获取参数
   *
   * @author tony001
   * @date 2024-07-28 12:07:41
   * @param {string} id
   * @return {*}  {IParams}
   */
  getExtendParamsById(id: string): IParams {
    const params: IParams = {
      condop: 'AND',
      condtype: 'GROUP',
      searchconds: [],
    };
    const result: IParams = {};
    if (this.customDashboard) {
      const targetPorlet = this.portlets[id];
      const portletFilterkeys = Object.keys(this.customDashboard.portletFilter);
      if (!targetPorlet) {
        // 未初始化完成
        if (portletFilterkeys && portletFilterkeys.length > 0) {
          portletFilterkeys.forEach((key: string) => {
            const filterParam = this.customDashboard!.portletFilter[key];
            const { config, searchconds } = filterParam;
            const app = ibiz.hub.getApp(this.model.appId);
            const targetFilter = app.model.appPortlets?.find(
              (portletModel: IAppPortlet) => {
                return portletModel.id === key;
              },
            );
            if (targetFilter && targetFilter.control) {
              const targetFilterModel =
                targetFilter.control as IDBFilterPortletPart;
              // 计算用户定义过滤参数
              const searchCondCacheKey = generateCacheKy(
                this.context,
                this,
                targetFilterModel.id!,
              );
              const cacheSearchConds = localStorage.getItem(searchCondCacheKey);
              const userSearchConds = cacheSearchConds
                ? JSON.parse(cacheSearchConds)
                : searchconds;
              // 聚合所有条件
              const allSearchConds = getFilterSearchConds(
                userSearchConds,
                targetFilterModel.filterDEDQConditions,
              );
              if (config && allSearchConds) {
                const model = getPortletModelByID(
                  id,
                  this.context,
                  this.customDashboard?.customModelData,
                ) as IDBPortletPart;
                if (model) {
                  const effectivePortlets = filterPortletByID(
                    key,
                    this.context,
                    [model],
                    this.model.dashboardStyle === 'BIREPORTDASHBOARD' ||
                      this.model.dashboardStyle === 'BIREPORTDASHBOARD2',
                  );
                  if (
                    effectivePortlets &&
                    effectivePortlets.find(item => {
                      return item.id === id;
                    })
                  ) {
                    const effectivePortletIDs = filterPortletByConfig(config, [
                      id,
                    ]);
                    if (
                      effectivePortletIDs &&
                      effectivePortletIDs.length === 1
                    ) {
                      params.searchconds.push(allSearchConds);
                    }
                  }
                }
              }
            }
          });
        }
      } else {
        // 初始化完成
        // 过滤器类型或者找不到不做处理
        if (targetPorlet.model.portletType === 'FILTER') {
          return result;
        }
        const filterPortlets = Object.values(this.portlets).filter(
          (portlet: IPortletController) => {
            return portlet.model.portletType === 'FILTER';
          },
        ) as FilterPortletController[];
        if (filterPortlets.length > 0) {
          filterPortlets.forEach((portlet: FilterPortletController) => {
            const { filterConfig, model } = portlet;
            const filterSearchConds = portlet.getSearchConds();
            if (filterConfig && filterSearchConds) {
              const models = Object.values(this.portlets).map(item => {
                return item.model;
              }) as IDBPortletPart[];
              const effectivePortlets = filterPortletByID(
                model.id!,
                this.context,
                models,
                this.model.dashboardStyle === 'BIREPORTDASHBOARD' ||
                  this.model.dashboardStyle === 'BIREPORTDASHBOARD2',
              );
              if (
                effectivePortlets &&
                effectivePortlets.find(item => {
                  return item.id === id;
                })
              ) {
                const effectivePortletIDs = filterPortletByConfig(
                  filterConfig,
                  [id],
                );
                if (effectivePortletIDs && effectivePortletIDs.length === 1) {
                  params.searchconds.push(filterSearchConds);
                }
              }
            }
          });
        }
      }
    }
    if (params.searchconds && params.searchconds.length > 0) {
      result.params = [params];
    }
    return result;
  }

  /**
   * @description 获取门户部件
   * @template K
   * @param {K} type 门户部件类型
   * @param {string} id 门户部件标识
   * @returns {*}  {IApiPortletTypeMapping[K]}
   * @memberof IDashboardController
   */
  getPortlet<K extends keyof IApiPortletTypeMapping>(
    type: K,
    id: string,
  ): IApiPortletTypeMapping[K] {
    return this.portlets[id] as unknown as IApiPortletTypeMapping[K];
  }
}
