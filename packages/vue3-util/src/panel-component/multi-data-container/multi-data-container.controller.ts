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
  IPanelDataContainerController,
  IPanelItemProvider,
  isDataContainer,
  IViewController,
  PanelData,
  PanelItemController,
  PanelNotifyState,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { IPanelContainer, IPanelItem, IPanelTabPanel } from '@ibiz/model-core';
import { MultiDataContainerItemController } from './multi-data-container-item.controller';
import { MultiDataContainerState } from './multi-data-container.state';

/**
 * 多项数据容器控制器
 *
 * @export
 * @class MultiDataContainerController
 * @extends {PanelItemController}
 */
export class MultiDataContainerController
  extends PanelItemController<IPanelContainer>
  implements IPanelDataContainerController
{
  /**
   * @description 数据容器控制器状态
   * @exposedoc
   * @type {MultiDataContainerState}
   * @memberof MultiDataContainerController
   */
  declare state: MultiDataContainerState;

  /**
   * @description 是否为数据容器
   * @exposedoc
   * @memberof MultiDataContainerController
   */
  readonly isDataContainer = true;

  /**
   * @description 数据项的控制器
   * @exposedoc
   * @type {MultiDataContainerItemController[]}
   */
  dataItems: MultiDataContainerItemController[] = [];

  /**
   * @description 所有面板成员的适配器
   * @type {{ [key: string]: IPanelItemProvider }}
   */
  providers: { [key: string]: IPanelItemProvider } = {};

  /**
   * @description 多项数据容器，根据数据模式
   * @exposedoc
   * @readonly
   * @type {IData}
   */
  get data(): IData[] {
    return this.state.items;
  }

  protected createState(): MultiDataContainerState {
    return new MultiDataContainerState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    await this.initPanelItemProviders();
  }

  /**
   * 面板状态变更通知
   * @param {PanelNotifyState} _state
   * @return {*}  {Promise<void>}
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
  protected async initPanelItemProviders(
    panelItems: IPanelItem[] | undefined = this.model.panelItems,
  ): Promise<void> {
    if (!panelItems) {
      return;
    }
    await Promise.all(
      panelItems.map(async panelItem => {
        // 生成面板成员控制器
        const panelItemProvider = await getPanelItemProvider(
          panelItem,
          this.panel.model,
          this.panel.view.model,
        );
        if (!panelItemProvider) {
          return;
        }
        this.providers[panelItem.id!] = panelItemProvider;
        // 有子成员的,且不是数据容器的。生成子控制器
        if (
          (panelItem as IPanelContainer).panelItems?.length &&
          !isDataContainer(panelItem)
        ) {
          await this.initPanelItemProviders(
            (panelItem as IPanelContainer).panelItems,
          );
        }
        if ((panelItem as IPanelTabPanel).panelTabPages?.length) {
          await this.initPanelItemProviders(
            (panelItem as IPanelTabPanel).panelTabPages,
          );
        }
      }),
    );
  }

  /**
   * 计算导航参数
   *
   * @author tony001
   * @date 2024-07-30 18:07:36
   * @protected
   * @return {*}  {IData}
   */
  protected computeNavParams(): IData {
    const parentData = this.dataParent.data || {};
    const { navigateContexts, navigateParams } = this.model;
    const context = this.panel.context.clone();
    Object.assign(
      context,
      convertNavData(
        navigateContexts,
        parentData,
        this.panel.context,
        this.panel.params,
      ),
    );
    const params = convertNavData(
      navigateParams,
      parentData,
      this.panel.context,
      this.panel.params,
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
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  childrenStateNotify(state: PanelNotifyState): void {
    this.dataItems.forEach(dataItem => {
      dataItem.panelStateNotify(state);
    });
  }

  /**
   * 值校验
   *
   * @return {*}  {Promise<boolean>}
   * @memberof MultiDataContainerController
   */
  async validate(): Promise<boolean> {
    const values = await Promise.all(
      this.dataItems.map(item => item.validate()),
    );
    return values.every(value => value);
  }

  /**
   * @description 设置数据集合
   * @exposedoc
   * @author lxm
   * @date 2023-09-05 05:42:09
   * @param {IData[]} items
   */
  async setData(items: IData[]): Promise<void> {
    const fields = getAllPanelField(this.model);
    const _items = items.map(item => new PanelData(fields, item));

    this.dataItems = _items.map(item => {
      return new MultiDataContainerItemController(
        this.model,
        this.panel,
        this,
        item,
      );
    });
    if (this.dataItems.length) {
      await Promise.all(
        this.dataItems.map(controller => {
          return controller.init();
        }),
      );
    }
    this.state.items = _items;
    this.childrenStateNotify(PanelNotifyState.LOAD);
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

    this.setData(data as IData[]);
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
      this.setData(originData as IData[]);
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
      this.setData(res.data as IData[]);
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
   * @memberof MultiDataContainerController
   */
  destroy(): void {
    super.destroy();
    this.dataItems.forEach(item => {
      item.destroy();
    });
  }
}
