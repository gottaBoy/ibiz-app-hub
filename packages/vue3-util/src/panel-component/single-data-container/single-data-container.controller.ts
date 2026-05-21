import {
  ModelError,
  RuntimeError,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  convertNavData,
  execDELogicById,
  getAllPanelField,
  getPanelItemProvider,
  IPanelController,
  IPanelDataContainerController,
  IPanelItemContainerController,
  IPanelItemController,
  IPanelItemProvider,
  isDataContainer,
  IViewController,
  PanelData,
  PanelContainerController,
  PanelNotifyState,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { IPanelContainer, IPanelItem, IPanelTabPanel } from '@ibiz/model-core';
import { SingleDataContainerState } from './single-data-container.state';

/**
 * @description 单项数据容器控制器
 * @export
 * @class SingleDataContainerController
 * @extends {PanelContainerController<IPanelContainer>}
 * @implements {IPanelDataContainerController}
 */
export class SingleDataContainerController
  extends PanelContainerController<IPanelContainer>
  implements IPanelDataContainerController
{
  /**
   * @description 单项数据容器状态
   * @exposedoc
   * @type {SingleDataContainerState}
   * @memberof SingleDataContainerController
   */
  declare state: SingleDataContainerState;

  /**
   * @description 是否是数据父容器
   * @exposedoc
   * @memberof SingleDataContainerController
   */
  readonly isDataContainer = true;

  /**
   * @description 所有面板成员的控制器
   * @exposedoc
   * @type {{ [key: string]: IPanelItemController }}
   * @memberof SingleDataContainerController
   */
  panelItems: { [key: string]: IPanelItemController } = {};

  /**
   * @description 所有面板成员的适配器
   * @type {{ [key: string]: IPanelItemProvider }}
   * @memberof SingleDataContainerController
   */
  providers: { [key: string]: IPanelItemProvider } = {};

  /**
   * @description 单项数据容器数据，根据配置的数据模式计算后返回的数据
   * @exposedoc
   * @readonly
   * @type {IData}
   * @memberof SingleDataContainerController
   */
  get data(): IData {
    return this.state.data;
  }

  protected createState(): SingleDataContainerState {
    return new SingleDataContainerState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    await this.initPanelItemControllers();
  }

  /**
   * 面板状态变更通知
   *
   * @param {PanelNotifyState} _state
   * @return {*}  {Promise<void>}
   * @memberof SingleDataContainerController
   */
  async panelStateNotify(_state: PanelNotifyState): Promise<void> {
    super.panelStateNotify(_state);
    if (_state === PanelNotifyState.LOAD) {
      this.initContainerData();
    }
  }

  /**
   * 初始化面板成员控制器
   *
   * @author lxm
   * @date 2022-08-24 21:08:48
   * @protected
   */
  protected async initPanelItemControllers(
    panelItems: IPanelItem[] | undefined = this.model.panelItems,
    panel: IPanelController = this.panel,
    parent: IPanelItemContainerController | undefined = this,
  ): Promise<void> {
    if (!panelItems) {
      return;
    }
    await Promise.all(
      panelItems.map(async panelItem => {
        // 生成面板成员控制器
        const panelItemProvider = await getPanelItemProvider(
          panelItem,
          panel.model,
          panel.view.model,
        );
        if (!panelItemProvider) {
          return;
        }
        this.providers[panelItem.id!] = panelItemProvider;
        const panelItemController = await panelItemProvider.createController(
          panelItem,
          panel,
          parent,
        );
        this.panelItems[panelItem.id!] = panelItemController;
        // 有子成员的,且不是数据容器的。生成子控制器
        if (
          (panelItem as IPanelContainer).panelItems?.length &&
          !isDataContainer(panelItem)
        ) {
          await this.initPanelItemControllers(
            (panelItem as IPanelContainer).panelItems,
            panel,
            panelItemController as IPanelItemContainerController,
          );
        }
        if ((panelItem as IPanelTabPanel).panelTabPages?.length) {
          await this.initPanelItemControllers(
            (panelItem as IPanelTabPanel).panelTabPages,
            panel,
            panelItemController as IPanelItemContainerController,
          );
        }
      }),
    );
  }

  /**
   * 计算导航参数
   *
   * @author tony001
   * @date 2024-07-30 18:07:52
   * @protected
   * @return {*}  {IData}
   */
  protected computeNavParams(): IData {
    const { navigateContexts, navigateParams } = this.model;
    const context = this.panel.context.clone();
    Object.assign(
      context,
      convertNavData(navigateContexts, this.panel.params, this.panel.context),
    );
    const params = convertNavData(
      navigateParams,
      this.panel.params,
      this.panel.context,
    );
    Object.assign(params, this.panel.params);
    return { context, params };
  }

  /**
   * 根据来源类型初始化容器数据
   * @author lxm
   * @date 2023-08-04 03:05:59
   * @protected
   */
  protected initContainerData(): void {
    const { dataSourceType, dataName, dataRegionType, scriptCode } = this.model;
    // 登录表单
    if (dataRegionType === 'LOGINFORM') {
      this.setLoginForm();
      return;
    }
    switch (dataSourceType) {
      case 'DEACTION':
      case 'DEDATASET':
        this.setDataByDeMethod();
        break;
      case 'APPGLOBALPARAM':
        this.setDataByAppGlobalParam();
        break;
      case 'DELOGIC':
        this.setDataByDeLogic();
        break;
      case 'TOPVIEWSESSIONPARAM': {
        if (!dataName) {
          throw new RuntimeModelError(
            this.model,
            ibiz.i18n.t('vue3Util.panelComponent.noConfiguardDataObject'),
          );
        }
        this.bindViewData(this.panel.getTopView(), dataName);
        break;
      }
      case 'VIEWSESSIONPARAM': {
        if (!dataName) {
          throw new RuntimeModelError(
            this.model,
            ibiz.i18n.t('vue3Util.panelComponent.noConfiguardDataObject'),
          );
        }
        this.bindViewData(this.panel.view, dataName);
        break;
      }
      case 'ACTIVEDATAPARAM': {
        if (!dataName) {
          throw new RuntimeModelError(
            this.model,
            ibiz.i18n.t('vue3Util.panelComponent.noConfiguardDataObject'),
          );
        }
        this.setData(this.dataParent.data[dataName]);
        break;
      }
      case 'CUSTOM': {
        if (!scriptCode) {
          throw new RuntimeModelError(
            this.model,
            ibiz.i18n.t('vue3Util.panelComponent.noConfiguredScript'),
          );
        }
        const computeData = ScriptFactory.execScriptFn(
          {
            ...this.panel.getEventArgs(),
            data: this.dataParent.data,
          },
          scriptCode,
          {
            isAsync: false,
            singleRowReturn: true,
          },
        ) as IData;
        this.setData(computeData);
        break;
      }
      default:
        throw new ModelError(
          this.model,
          ibiz.i18n.t('vue3Util.panelComponent.noSupportedDataSourceType', {
            dataSourceType,
          }),
        );
    }
  }

  /**
   * 面板状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  childrenStateNotify(state: PanelNotifyState): void {
    Object.values(this.panelItems).forEach(panelItem => {
      panelItem.panelStateNotify(state);
    });
  }

  /**
   * @description 设置单项数据容器数据
   * @exposedoc
   * @param {IData} data 单项数据容器数据
   * @returns {*}  {Promise<void>}
   * @memberof SingleDataContainerController
   */
  async setData(data: IData): Promise<void> {
    const fields = getAllPanelField(this.model);
    const fieldKeys = fields.map(item => item.id!);
    const panelData = new PanelData(fields, data);

    // 面板属性变更的触发变更通知
    panelData._evt.on('change', key => {
      if (fieldKeys.includes(key)) {
        this.childDataChangeNotify([key]);
      }
    });
    // 清空上一个，如果存在的话。
    this.data.destroy?.();
    this.state.data = panelData;
    this.childrenStateNotify(PanelNotifyState.LOAD);
  }

  /**
   * 设置登录表单数据
   *
   * @protected
   * @memberof SingleDataContainerController
   */
  protected setLoginForm(): void {
    this.setData({});
  }

  /**
   * 通过实体设置视图逻辑
   * @author lxm
   * @date 2023-08-04 03:00:31
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async setDataByDeLogic(): Promise<void> {
    const { appDataEntityId, appDELogicId } = this.model;
    if (!appDELogicId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('vue3Util.panelComponent.noConfiguredEntityLogic'),
      );
    }
    if (!appDataEntityId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('vue3Util.panelComponent.noConfiguredEntity'),
      );
    }
    const { context, params } = this.computeNavParams();
    const data = await execDELogicById(
      appDELogicId,
      appDataEntityId,
      context,
      this.panel.data,
      params,
    );

    if (!data) {
      throw new RuntimeError(
        ibiz.i18n.t('vue3Util.panelComponent.noReturnValue', { appDELogicId }),
      );
    }

    this.setData(data as IData);
  }

  /**
   * 设置全局变量为当前容器数据
   * @author lxm
   * @date 2023-08-04 01:55:07
   * @protected
   */
  protected setDataByAppGlobalParam(): void {
    const { dataName } = this.model;
    const originData = dataName ? ibiz.appData![dataName] : ibiz.appData!;
    if (originData) {
      this.setData(originData as IData);
    } else {
      ibiz.log.error(
        ibiz.i18n.t('vue3Util.panelComponent.noAttribute', { dataName }),
      );
    }
  }

  /**
   * 请求实体行为并把返回值设置为当前容器的数据
   * @author lxm
   * @date 2023-08-04 11:47:17
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async setDataByDeMethod(): Promise<void> {
    const { appDEMethodId, appDataEntityId } = this.model;
    if (!appDEMethodId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('vue3Util.panelComponent.noConfiguerdEntityBehanior'),
      );
    }
    if (!appDataEntityId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('vue3Util.panelComponent.noConfiguredEntity'),
      );
    }
    const app = ibiz.hub.getApp(this.panel.context.srfappid);
    const { context, params } = this.computeNavParams();
    const res = await app.deService.exec(
      appDataEntityId,
      appDEMethodId,
      context,
      undefined,
      params,
    );
    if (res.ok && res.data) {
      this.setData(res.data as IData);
    }
  }

  /**
   * 绑定指定视图会话的变量
   * @author lxm
   * @date 2023-07-14 02:03:56
   * @protected
   * @param {IViewController} view 绑定视图控制器
   * @param {string} dataName 变量名称
   */
  protected bindViewData(view: IViewController, dataName: string): void {
    if (!Object.prototype.hasOwnProperty.call(view.state, dataName)) {
      ibiz.log.error(
        ibiz.i18n.t('vue3Util.panelComponent.sessionView', { dataName }),
      );
      return;
    }
    const updateData = (): void => {
      const originData = (view.state as IData)[dataName] as IData;
      if (originData) {
        this.setData(originData);
      } else {
        ibiz.log.error(
          ibiz.i18n.t('vue3Util.panelComponent.viewStateAttribute', {
            dataName,
          }),
        );
      }
    };
    updateData(); // 先绑定一次

    // 每次视图数据变更之后更新一下
    view.evt.on('onDataChange', () => {
      updateData();
    });
  }

  /**
   * 通知所有子面板成员面板操作过程中的数据变更
   *
   * @author lxm
   * @date 2022-09-20 18:09:40
   * @param {string[]} names
   */
  childDataChangeNotify(names: string[]): void {
    Object.values(this.panelItems).forEach(panelItem => {
      panelItem.dataChangeNotify(names);
    });
  }

  /**
   * @description 设置面板数据的值
   * @exposedoc
   * @param {string} name 要设置的数据的属性名称
   * @param {unknown} value 要设置的值
   * @returns {*}  {Promise<void>}
   * @memberof SingleDataContainerController
   */
  async setDataValue(name: string, value: unknown): Promise<void> {
    if (
      Object.prototype.hasOwnProperty.call(this.state.data, name) &&
      this.state.data[name] === value
    ) {
      // *`面板里没有属性${name}或者${name}的值未发生改变`
      return;
    }

    // 改变值
    this.state.data[name] = value;
  }

  /**
   * @description 销毁
   * @memberof SingleDataContainerController
   */
  destroy(): void {
    super.destroy();
    this.data.destroy?.();
    Object.values(this.panelItems).forEach(item => {
      item.destroy();
    });
  }
}
