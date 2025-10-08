/* eslint-disable no-param-reassign */
import {
  recursiveExecute,
  recursiveIterate,
  RuntimeError,
} from '@ibiz-template/core';
import {
  IControlLogic,
  IPanel,
  IPanelContainer,
  IPanelItem,
  IPanelTabPanel,
} from '@ibiz/model-core';
import { AsyncSeriesHook } from 'qx-util';
import {
  IPanelState,
  IPanelEvent,
  IPanelController,
  IPanelItemController,
  IPanelItemProvider,
  IControlProvider,
  IPanelItemContainerController,
  IController,
  IUILogicParams,
} from '../../../../interface';
import { getAllPanelField } from '../../../../model';
import { getPanelItemProvider } from '../../../../register';
import { PanelData } from '../../../../service/vo';
import { ControlController } from '../../../common';
import { PanelNotifyState } from '../../../constant';
import { ControllerEvent } from '../../../utils';
import { CTX } from '../../../ctx';

/**
 * 面板部件控制器
 *
 * @author lxm
 * @date 2022-09-08 20:09:55
 * @export
 * @class PanelController
 * @extends {ControlController<PanelModel>}
 */
export class PanelController<
    T extends IPanel = IPanel,
    S extends IPanelState = IPanelState,
    E extends IPanelEvent = IPanelEvent,
  >
  extends ControlController<T, S, E>
  implements IPanelController<T, S, E>
{
  /**
   * 面板钩子
   *
   * @memberof PanelController
   */
  hooks = {
    validate: new AsyncSeriesHook<
      [],
      { result: boolean[]; parentId?: string }
    >(),
  };

  protected get _evt(): ControllerEvent<IPanelEvent> {
    return this.evt;
  }

  /**
   * 所有面板成员的控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: IPanelItemController }}
   */
  panelItems: { [key: string]: IPanelItemController } = {};

  /**
   * 所有面板成员的适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: IPanelItemProvider  | IControlProvider}}
   */
  providers: { [key: string]: IPanelItemProvider | IControlProvider } = {};

  /**
   * 外部输入数据
   *
   * @author lxm
   * @date 2023-02-09 03:16:52
   * @type {IData}
   * @memberof PanelController
   */
  inputData: IData | undefined;

  container?: IController;

  /**
   * 面板数据
   *
   * @author lxm
   * @date 2023-02-10 07:21:09
   * @readonly
   * @memberof PanelController
   */
  get data(): IData {
    return this.state.data;
  }

  constructor(
    model: T,
    context: IContext,
    params: IParams,
    ctx: CTX,
    container?: IController,
  ) {
    super(model, context, params, ctx);
    this.container = container;
  }

  protected initState(): void {
    super.initState();
    this.state.data = {};
  }

  setInputData(data: IData | undefined): void {
    this.inputData = data;
  }

  getData(): IData[] {
    return [this.data];
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initPanelItemControllers();

    if (this.scheduler?.hasControlEventTrigger) {
      // 监听部件事件触发部件事件触发器
      this._evt.on('onPanelItemEvent', event => {
        this.scheduler!.triggerControlEvent(
          event.panelItemName,
          event.panelItemEventName,
          event,
        );
      });
    }
  }

  protected async onMounted(): Promise<void> {
    await super.onMounted();
    this.load();
  }

  /**
   * 生命周期-销毁完成
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PanelController
   */
  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    this.data.destroy?.();
    this.hooks.validate.clear();
    Object.values(this.panelItems).forEach(item => {
      item.destroy();
    });
  }

  /**
   * 值校验
   *
   * @param {string} [parentId] 数据父容器标识
   * @return {*}  {Promise<boolean>}
   * @memberof PanelController
   */
  async validate(parentId?: string): Promise<boolean> {
    const result: boolean[] = [];
    await this.hooks.validate.call({ result, parentId });
    return result.every(value => value);
  }

  /**
   * 初始化面板成员控制器
   *
   * @author lxm
   * @date 2022-08-24 21:08:48
   * @protected
   */
  protected async initPanelItemControllers(
    panelItems: IPanelItem[] | undefined = this.model.rootPanelItems,
    panel: PanelController = this,
    parent: IPanelItemContainerController | undefined = undefined,
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
        panel.providers[panelItem.id!] = panelItemProvider;
        const panelItemController = await panelItemProvider.createController(
          panelItem,
          panel,
          parent,
        );
        panel.panelItems[panelItem.id!] = panelItemController;
        // 有子成员的,且不是数据容器的。生成子控制器
        if (
          (panelItem as IPanelContainer).panelItems?.length &&
          !(panelItemController as IPanelItemContainerController)
            .isDataContainer
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
   * 部件加载，获取数据，并执行一系列后续初始化逻辑
   *
   * @author lxm
   * @date 2023-02-10 01:46:24
   * @memberof PanelController
   */
  async load(): Promise<void> {
    // 准备面板数据
    const data = await this.prepareData();
    if (!data) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.panel.panelData'),
      );
    }
    // 转换数据，处理原始数据和面板项的映射。
    const panelData = this.convertData(data);

    // 清空上一个，如果存在的话。
    this.data.destroy?.();
    this.state.data = panelData;
    this.panelStateNotify(PanelNotifyState.LOAD);
  }

  /**
   * 根据获取模式准备原始数据
   *
   * @author lxm
   * @date 2023-02-10 02:04:39
   * @returns {*}  {(Promise<IData | undefined>)}
   * @memberof PanelController
   */
  async prepareData(): Promise<IData | undefined> {
    let data;
    // 根据数据获取模式获取数据
    switch (this.model.dataMode) {
      // 未传入时获取
      case 1:
        if (this.inputData) {
          data = this.inputData;
        }
        break;
      // 不获取（使用传入数据）
      default:
        data = this.inputData || {};
    }
    return data;
  }

  /**
   * 转换原始数据，映射面板属性
   *
   * @author lxm
   * @date 2023-02-10 02:10:41
   * @param {IData} data
   * @returns {*}  {IData}
   * @memberof PanelController
   */
  convertData(data: IData): PanelData {
    const fields = getAllPanelField(this.model);
    const fieldKeys = fields.map(item => item.id!);
    const panelData = new PanelData(fields, data);

    // 面板属性变更的触发变更通知
    panelData._evt.on('change', key => {
      if (fieldKeys.includes(key)) {
        this.dataChangeNotify([key]);
      }
    });
    return panelData;
  }

  /**
   * 通知所有面板成员面板操作过程中的数据变更
   *
   * @author lxm
   * @date 2022-09-20 18:09:40
   * @param {string[]} names
   */
  dataChangeNotify(names: string[]): void {
    Object.values(this.panelItems).forEach(panelItem => {
      panelItem.dataChangeNotify(names);
    });
  }

  /**
   * 面板状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  panelStateNotify(state: PanelNotifyState): void {
    Object.values(this.panelItems).forEach(panelItem => {
      panelItem.panelStateNotify(state);
    });
  }

  /**
   * 设置面板数据的值
   *
   * @param {string} name 要设置的数据的属性名称
   * @param {unknown} value 要设置的值
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

  protected initControlScheduler(logics: IControlLogic[] = []): void {
    const actualLogics = [...logics];
    // 遍历所有的项，如果有逻辑的话加入
    recursiveIterate(
      this.model,
      (item: IPanelItem) => {
        if (item.controlLogics) {
          actualLogics.push(...item.controlLogics);
        }
      },
      { childrenFields: ['rootPanelItems', 'panelItems', 'panelTabPages'] },
    );
    if (actualLogics.length === 0) {
      return;
    }
    this.scheduler = ibiz.scheduler.createControlScheduler(actualLogics, [
      // 面板部件事件参数
      'triggerControlName',
      'triggerEventName',
      'triggerEvent',
      // 面板成员事件参数
      'panelItemName',
      'panelItemEventName',
    ]);
    this.scheduler.defaultParamsCb = (): IUILogicParams => {
      return this.getEventArgs();
    };
  }

  /**
   * @description 获取面板成员控制器
   * @param {string} name 面板成员名称
   * @returns {*}  {(IPanelItemController | undefined)}
   * @memberof PanelController
   */
  findPanelItemByName(name: string): IPanelItemController | undefined {
    let result = this.panelItems[name];
    if (!result) {
      recursiveExecute(
        this,
        (item: IPanelItemController) => {
          if (name === item.model.id) {
            result = item;
            return true;
          }
        },
        {
          childrenFields: ['panelItems'],
        },
      );
    }
    return result;
  }
}
