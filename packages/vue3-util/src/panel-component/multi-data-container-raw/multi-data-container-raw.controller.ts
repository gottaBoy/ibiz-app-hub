import {
  ModelError,
  RuntimeError,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  convertNavData,
  execDELogicById,
  getPanelItemProvider,
  IPanelController,
  IPanelDataContainerController,
  IPanelItemContainerController,
  IPanelItemController,
  IPanelItemProvider,
  isDataContainer,
  IViewController,
  PanelContainerController,
  PanelNotifyState,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { IPanelContainer, IPanelItem, IPanelTabPanel } from '@ibiz/model-core';
import { MultiDataContainerRawState } from './multi-data-container-raw.state';

/**
 * 多项数据容器控制器
 *
 * @export
 * @class MultiDataContainerRawController
 * @extends {PanelContainerController}
 */
export class MultiDataContainerRawController
  extends PanelContainerController<IPanelContainer>
  implements IPanelDataContainerController
{
  /**
   * @description 多项数据容器控制器状态
   * @exposedoc
   * @type {MultiDataContainerRawState}
   * @memberof MultiDataContainerRawController
   */
  declare state: MultiDataContainerRawState;

  /**
   * @description 是否为数据容器
   * @exposedoc
   * @memberof MultiDataContainerRawController
   */
  readonly isDataContainer = true;

  /**
   * @description 面板子项的控制器
   * @exposedoc
   * @type {{ [key: string]: IPanelItemController }}
   * @memberof MultiDataContainerRawController
   */
  panelItems: { [key: string]: IPanelItemController } = {};

  /**
   * @description 所有面板成员的适配器
   * @type {{ [key: string]: IPanelItemProvider }}
   * @memberof MultiDataContainerRawController
   */
  providers: { [key: string]: IPanelItemProvider } = {};

  /**
   * @description 多项数据容器，根据数据模式
   * @exposedoc
   * @readonly
   * @type {IData}
   * @memberof MultiDataContainerRawController
   */
  get data(): IData {
    return this.state.items;
  }

  protected createState(): MultiDataContainerRawState {
    return new MultiDataContainerRawState(this.parent?.state);
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
   * @memberof MultiDataContainerRawController
   */
  async panelStateNotify(_state: PanelNotifyState): Promise<void> {
    super.panelStateNotify(_state);
    if (_state === PanelNotifyState.LOAD) {
      this.initContainerData();
    }
  }

  /**
   *  初始化面板子项控制器
   *
   * @protected
   * @param {(IPanelItem[] | undefined)} [panelItems=this.model.panelItems]
   * @param {IPanelController} [panel=this.panel]
   * @param {(IPanelItemContainerController | undefined)} [parent=this]
   * @return {*}  {Promise<void>}
   * @memberof MultiDataContainerRawController
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
   * @protected
   * @return {*}  {IData}
   * @memberof MultiDataContainerRawController
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
   *
   * @protected
   * @memberof MultiDataContainerRawController
   */
  protected initContainerData(): void {
    const { dataSourceType, dataName, scriptCode } = this.model;
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
        ) as IData[];
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
   * @param {PanelNotifyState} state
   * @memberof MultiDataContainerRawController
   */
  childrenStateNotify(state: PanelNotifyState): void {
    Object.values(this.panelItems).forEach(panelItem => {
      panelItem.panelStateNotify(state);
    });
  }

  /**
   * @description 设置数据集合
   * @exposedoc
   * @param {IData[]} items
   * @return {*}  {Promise<void>}
   * @memberof MultiDataContainerRawController
   */
  async setData(items: IData[]): Promise<void> {
    // 清空上一个，如果存在的话。
    this.data.destroy?.();
    this.state.items = items;
    this.childrenStateNotify(PanelNotifyState.LOAD);
  }

  /**
   * 通过实体设置视图逻辑
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof MultiDataContainerRawController
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

    this.setData(data as IData[]);
  }

  /**
   * 设置全局变量为当前容器数据
   *
   * @protected
   * @memberof MultiDataContainerRawController
   */
  protected setDataByAppGlobalParam(): void {
    const { dataName } = this.model;
    const originData = dataName ? ibiz.appData![dataName] : ibiz.appData!;
    if (originData) {
      this.setData(originData as IData[]);
    } else {
      ibiz.log.error(
        ibiz.i18n.t('vue3Util.panelComponent.noAttribute', { dataName }),
      );
    }
  }

  /**
   * 请求实体行为并把返回值设置为当前容器的数据
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof MultiDataContainerRawController
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
      this.setData(res.data as IData[]);
    }
  }

  /**
   * 绑定指定视图会话的变量
   *
   * @protected
   * @param {IViewController} view 绑定视图控制器
   * @param {string} dataName 变量名称
   * @return {*}  {void}
   * @memberof MultiDataContainerRawController
   */
  protected bindViewData(view: IViewController, dataName: string): void {
    if (!Object.prototype.hasOwnProperty.call(view.state, dataName)) {
      ibiz.log.error(
        ibiz.i18n.t('vue3Util.panelComponent.sessionView', { dataName }),
      );
      return;
    }
    const updateData = (): void => {
      const originData = (view.state as IData)[dataName] as IData[];
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

  setDataValue(_name: string, _value: unknown): Promise<void> {
    throw new Error(ibiz.i18n.t('vue3Util.panelComponent.noImplementMethod'));
  }

  /**
   * @description 销毁
   * @memberof MultiDataContainerRawController
   */
  destroy(): void {
    super.destroy();
    this.data.destroy?.();
    Object.values(this.panelItems).forEach(item => {
      item.destroy?.();
    });
  }
}
