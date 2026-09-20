/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppUtil, IDashboard } from '@ibiz/model-core';
import { clone } from 'ramda';
import { ConfigService, UtilService } from '../../../service';
import { DashboardController } from './dashboard.controller';
import { ICustomDesign } from '../../../interface';
import {
  deepDeleteSubAppId,
  deepFillSubAppId,
  isMissingUtilDataError,
} from './dashboard.util';

/**
 * 自定义数据看板部件控制器
 * @author lxm
 * @date 2023-07-07 03:27:29
 * @export
 * @class CustomDashboardController
 */
export class CustomDashboardController implements ICustomDesign {
  /**
   * 自定义布局模型数据
   *
   * @author: zhujiamin
   * @Date: 2023-09-20 16:42:36
   */
  customModelData: IData[] = [];

  /**
   * 动态设计水平列数
   *
   * @author: zhujiamin
   * @Date: 2023-09-20 16:43:39
   */
  layoutColNum: number = 12;

  /**
   * 动态设计单元格高度，80px
   *
   * @author: zhujiamin
   * @Date: 2023-09-20 16:43:39
   */
  layoutRowH: number = 80;

  /**
   * 门户配置
   *
   * @type {IData}
   * @memberof CustomDashboardController
   */
  portletConfig: IData = {};

  /**
   * 门户过滤器参数
   *
   * @author tony001
   * @date 2024-07-26 21:07:22
   * @type {IData}
   */
  portletFilter: IData = {};

  /**
   * 应用配置存储服务
   *
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-09-22 18:07:42
   */
  config: ConfigService | undefined;

  /**
   * 应用功能组件服务
   *
   * @author tony001
   * @date 2024-04-24 14:04:46
   * @type {UtilService}
   */
  util: UtilService | undefined;

  /**
   * 上下文对象
   *
   * @author tony001
   * @date 2024-04-24 14:04:35
   * @type {IContext}
   */
  context: IContext;

  /**
   * 视图参数
   *
   * @author tony001
   * @date 2024-04-24 14:04:42
   * @type {IParams}
   */
  params: IParams;

  /**
   * 自定义定制范围类型（public：公开，personal：个人，data：数据，默认是按照个人区分，配置了应用功能组件才生效）
   *
   * @author tony001
   * @date 2024-04-24 19:04:47
   * @type {('public' | 'personal' | 'data')}
   */
  type: 'public' | 'personal' | 'data' = 'personal';

  /**
   * 所属数据类型（仅限自定义定制为data类型时生效，配置了应用功能组件才生效）
   *
   * @author tony001
   * @date 2024-04-24 19:04:06
   * @type {string}
   */
  ownerType: string = '';

  /**
   * 所属数据标识（仅限自定义定制为data类型时生效，配置了应用功能组件才生效）
   *
   * @author tony001
   * @date 2024-04-24 19:04:18
   * @type {string}
   */
  ownerId: string = '';

  /**
   * 多数据模式，启用时请求参数从上下文中获取srfdynadashboardid的值
   *
   * @author tony001
   * @date 2024-07-08 14:07:51
   * @type {boolean}
   */
  multiMode: boolean = false;

  /**
   * 展示设计按钮，启用定制默认会展示
   *
   * @author tony001
   * @date 2024-07-08 14:07:15
   * @type {boolean}
   */
  showDesignBtn: boolean = true;

  /**
   * Creates an instance of BaseController.
   * @author lxm
   * @date 2023-04-26 06:46:21
   * @param {CTX} ctx 跨组件上下文环境，内部机制不暴露
   */
  constructor(
    public model: IDashboard,
    public dashboard: DashboardController,
  ) {
    this.context = dashboard.context;
    this.params = dashboard.params;
    this.init(dashboard.controlParams);
  }

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-04-24 20:04:14
   * @private
   */
  private init(controlParams: IData): void {
    // 默认走个人
    this.type = 'personal';
    this.ownerId = this.context.srfpersonid;
    // 识别动态控件参数
    if (controlParams.type) {
      this.type = controlParams.type;
    }
    if (controlParams.owner_type) {
      this.ownerType = controlParams.owner_type;
    }
    if (controlParams.owner_id) {
      this.ownerId = this.context[controlParams.owner_id];
    }
    if (controlParams.multimode === 'true') {
      this.multiMode = true;
    }
    if (controlParams.showdesignbtn === 'false') {
      this.showDesignBtn = false;
    }
    // 配置了应用功能组件则走应用功能组件服务存储，否则走rt的config存储
    if (this.model.appDynaDashboardUtilId) {
      const app = ibiz.hub.getApp(this.context.srfappid);
      this.util = new UtilService(
        app.getAppUtil(this.model.appDynaDashboardUtilId) as IAppUtil,
      );
    } else {
      this.config = new ConfigService(
        this.model.appId!,
        'dynadashboard',
        `dashboard_${
          this.model.appDataEntityId?.toLowerCase() || 'app'
        }_${this.model.codeName?.toLowerCase()}`,
      );
    }
  }

  /**
   * 获取资源标识（仅用于功能组件服务）
   *
   * @author tony001
   * @date 2024-04-24 14:04:55
   * @private
   * @return {*}  {string}
   */
  private getResourceTag(): string {
    // 启用多数据模式，直接返回上下文中srfdynadashboardid作为路径参数
    if (this.multiMode) {
      return this.context.srfdynadashboardid;
    }
    const base: string = `${this.context.srfappid}_dashboard_${
      this.model.appDataEntityId?.toLowerCase() || 'app'
    }_${this.model.codeName?.toLowerCase()}`;
    switch (this.type) {
      case 'personal':
        return `${base}_${this.context.srfpersonid}`;
      case 'data':
        return `${base}_${this.ownerType}_${this.ownerId}`;
      default:
        return base;
    }
  }

  /**
   * 加载自定义布局模型数据
   *
   * @author: zhujiamin
   * @Date: 2023-09-20 16:22:49
   */
  async loadCustomModelData(): Promise<IData> {
    if (this.multiMode && !this.context.srfdynadashboardid) {
      return { model: this.customModelData, config: this.portletConfig };
    }
    let res;
    if (this.util) {
      try {
        res = await this.util.load(
          this.getResourceTag(),
          this.context,
          this.params,
          { silent: false },
        );
      } catch (error) {
        if (isMissingUtilDataError(error)) {
          return this.saveCustomModelData([]);
        }
        throw error;
      }
    } else {
      res = await this.config!.load();
    }
    if (res.model) {
      for (let i = 0; i < res.model.length; i++) {
        const item = res.model[i];
        const mainApp = ibiz.hub.getApp(ibiz.env.appId);
        if (item.orignModel) {
          item.portletModel = (await ibiz.hub.translationModelToDsl(
            item.portletModel,
            'CTRL',
          )) as any;
          delete item.orignModel;
        }
        const targetApp = mainApp.model.subAppRefs?.find(app => {
          return app.id?.endsWith(item.appCodeName);
        });
        if (targetApp && targetApp.id) {
          deepFillSubAppId(item.portletModel, targetApp.id);
        }
      }
      this.customModelData = res.model;
    }
    if (res.colNum) {
      this.layoutColNum = res.colNum;
    }
    if (res.rowH) {
      this.layoutRowH = res.rowH;
    }
    if (res.config) {
      this.portletConfig = res.config;
    }
    if (res.filter) {
      this.portletFilter = res.filter;
    }
    return { model: this.customModelData, config: this.portletConfig };
  }

  /**
   * 重置自定义布局模型
   *
   * @memberof CustomDashboardController
   */
  async resetCustomModelData(): Promise<IData> {
    this.portletConfig = {};
    return this.saveCustomModelData([]);
  }

  /**
   * 保存自定义布局模型数据
   *
   * @author tony001
   * @date 2024-07-26 16:07:30
   * @param {IData[]} model
   * @param {IData} [config={}]
   * @param {IData} [filter={}]
   * @return {*}  {Promise<IData>}
   */
  async saveCustomModelData(
    model: IData[],
    config: IData = {},
    filter: IData = {},
  ): Promise<IData> {
    Object.assign(this.portletConfig, config);
    let res;
    // 合并条件
    const cloneFilter = clone(this.portletFilter);
    if (Object.keys(filter).length > 0) {
      Object.assign(cloneFilter, filter);
    }
    // 根据存入model动态筛选过滤器数据
    if (cloneFilter && Object.keys(cloneFilter).length > 0) {
      const keys = Object.keys(cloneFilter);
      keys.forEach((key: string) => {
        if (model && model.length > 0) {
          const targetPorlet = model.find((item: IData) => {
            return item.portletCodeName === key;
          });
          if (!targetPorlet) {
            delete cloneFilter[key];
          }
        }
      });
    }
    const cloneModel = clone(model);
    // 删除无用的数据(appId，仅界面使用)
    cloneModel.forEach((item: IData) => {
      if (item.portletModel) {
        deepDeleteSubAppId(item.portletModel);
      }
    });
    const data: IData = {
      model: cloneModel,
      colNum: this.layoutColNum,
      rowH: this.layoutRowH,
      config: this.portletConfig,
      filter: cloneFilter,
    };
    if (this.util) {
      res = await this.util!.save(
        this.getResourceTag(),
        this.context,
        {
          ...this.params,
          type: this.type,
          ownerType: this.ownerType,
          ownerId: this.ownerId,
          modelId: this.model.id,
        },
        data,
      );
    } else {
      res = await this.config!.save(data);
    }
    if (res) {
      this.customModelData = model;
      this.portletFilter = cloneFilter;
    }
    return { model, config: this.portletConfig };
  }
}
