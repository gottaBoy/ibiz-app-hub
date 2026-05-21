import { isOverlap } from '@ibiz-template/core';
import { IPanelItem } from '@ibiz/model-core';
import {
  IPanelItemState,
  IPanelController,
  PanelItemEventName,
  IPanelItemController,
  IPanelDataContainerController,
} from '../../../../interface';
import { calcLayoutHeightWidth, calcDynaClass } from '../../../../model';
import { verifyPanelGroupLogic } from '../../../../utils';
import { PanelNotifyState } from '../../../constant';
import { PanelItemState } from './panel-item.state';
import { AppCounter } from '../../../../service';

export class PanelItemController<T extends IPanelItem = IPanelItem>
  implements IPanelItemController
{
  /**
   * 面板项状态
   *
   * @author chitanda
   * @date 2023-01-04 09:01:04
   * @type {IPanelItemState}
   */
  state: IPanelItemState;

  /**
   * 数据父容器
   * @author lxm
   * @date 2023-07-15 11:35:18
   * @readonly
   * @type {(IPanelController | IPanelDataContainerController)}
   */
  get dataParent(): IPanelController | IPanelDataContainerController {
    return this.findDataParent(this);
  }

  /**
   * 父容器数据对象数据
   * @author lxm
   * @date 2023-07-15 01:33:58
   * @readonly
   * @type {IData}
   */
  get data(): IData {
    return this.dataParent.data;
  }

  /**
   * 获取容器类名集合
   * @author lxm
   * @date 2023-08-02 06:06:12
   * @readonly
   * @type {string[]}
   */
  get containerClass(): string[] {
    return [...this.state.class.container, ...this.state.class.containerDyna];
  }

  /**
   * 获取标题类名集合
   * @author lxm
   * @date 2023-08-02 06:16:48
   * @readonly
   * @type {string[]}
   */
  get labelClass(): string[] {
    return [...this.state.class.label, ...this.state.class.labelDyna];
  }

  /**
   * @description 计数器对象
   * @type {AppCounter}
   * @memberof PanelItemController
   */
  counter?: AppCounter;

  /**
   * Creates an instance of PanelItemController.
   * @author lxm
   * @date 2023-04-27 06:37:12
   * @param {T} model 面板成员模型
   * @param {IPanelController} panel 面板控制器
   * @param {IPanelItemController} [parent] 父容器控制器
   */
  constructor(
    public readonly model: T,
    public readonly panel: IPanelController,
    public readonly parent?: IPanelItemController,
  ) {
    this.state = this.createState();
    this.state.context = this.panel.context;
  }

  /**
   * 子类不可覆盖或重写此方法，在 init 时需要重写的使用 onInit 方法。
   *
   * @author lxm
   * @date 2022-08-18 22:08:30
   * @returns {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    const hasVisibleLogic = !!this.model.panelItemGroupLogics?.find(
      logic => logic.logicCat === 'PANELVISIBLE',
    );
    if (hasVisibleLogic) {
      this.state.visible = false;
    }
    this.panel.hooks.validate.tapPromise(async context => {
      if (!context.parentId || context.parentId === this.dataParent.model.id) {
        context.result.push(await this.validate());
      }
    });
    await this.onInit();
  }

  protected async onInit(): Promise<void> {
    // 初始化布局参数
    const { layoutPos, sysCss, labelSysCss } = this.model;

    // 初始化高宽
    if (layoutPos) {
      const { width, height } = calcLayoutHeightWidth(layoutPos);
      this.state.layout.width = `${width}`;
      this.state.layout.height = `${height}`;
    }

    if (sysCss?.cssName) {
      this.state.class.container.push(sysCss.cssName);
    }

    if (labelSysCss?.cssName) {
      this.state.class.label.push(labelSysCss.cssName);
    }
    this.handleCounterChange = this.handleCounterChange.bind(this);
    this.initCounter();
  }

  /**
   * @description 初始化计数器
   * @protected
   * @returns {*}  {void}
   * @memberof PanelItemController
   */
  protected initCounter(): void {
    const { counters } = this.panel;
    const { appCounterRefId } = this.model;
    if (appCounterRefId) {
      this.counter = counters[appCounterRefId];
      this.counter?.onChange(this.handleCounterChange);
    }
  }

  /**
   * @description 处理计数器改变，并根据计数器模式计算显示状态
   * @protected
   * @param {IData} data
   * @memberof PanelItemController
   */
  protected handleCounterChange(data: IData): void {
    this.state.counterData = data;
    let state: boolean = true;
    const { counterId, counterMode } = this.model;
    if (counterId) {
      const count = this.counter?.getCounter(counterId);
      if (counterMode === 1 && count === 0) state = false;
      this.state.visible = state;
    }
  }

  destroy(): void {
    this.counter?.offChange(this.handleCounterChange);
  }

  /**
   * 值校验
   * 由子类具体实现
   * @return {*}  {Promise<boolean>}
   * @memberof PanelItemController
   */
  async validate(): Promise<boolean> {
    return true;
  }

  /**
   * 创建面板状态对象
   *
   * @author chitanda
   * @date 2023-01-04 10:01:00
   * @protected
   * @return {*}  {PanelItemState}
   */
  protected createState(): PanelItemState {
    return new PanelItemState(this.parent?.state);
  }

  /**
   * 面板数据变更通知(由面板控制器调用)
   *
   * @author lxm
   * @date 2022-09-20 18:09:56
   * @param {string[]} names
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    // 计算动态控制逻辑
    this.calcDynamicLogic(names);

    // 计算显示，禁用，必填状态
    this.calcItemDisabled(this.data);
    this.calcItemVisible(this.data);
    this.calcItemRequired(this.data);

    // 计算动态样式表
    this.calcDynaClass(this.data);
  }

  /**
   * 面板状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  async panelStateNotify(_state: PanelNotifyState): Promise<void> {
    // 计算动态控制逻辑
    this.calcDynamicLogic([], true);

    // 计算显示，禁用，必填状态
    this.calcItemDisabled(this.data);
    this.calcItemVisible(this.data);
    this.calcItemRequired(this.data);

    // 计算动态样式表
    this.calcDynaClass(this.data);
  }

  /**
   * 计算项的禁用状态
   * @author lxm
   * @date 2023-06-26 06:19:00
   * @param {IData} data
   */
  calcItemDisabled(data: IData): void {
    let { disabled } = this.dynaLogicResult;

    // 上层计算为启用时计算预定义项启用逻辑
    if (disabled !== true && this.panel.scheduler) {
      const itemEnable = this.panel.scheduler.triggerItemEnable(
        this.model.id!,
        {
          data: [data],
        },
      );
      if (itemEnable !== undefined) {
        disabled = !itemEnable;
      }
    }

    // 有值的时候才会去修改state
    if (disabled !== undefined) {
      this.state.disabled = disabled;
    }
  }

  /**
   * 计算项的显示状态
   * @author lxm
   * @date 2023-06-26 06:19:00
   * @param {IData} data
   */
  calcItemVisible(data: IData): void {
    let { visible } = this.dynaLogicResult;

    // 上层计算为显示时计算预定义项显示逻辑
    if (visible !== false && this.panel.scheduler) {
      const itemVIsible = this.panel.scheduler.triggerItemVisible(
        this.model.id!,
        {
          data: [data],
        },
      );
      if (itemVIsible !== undefined) {
        visible = itemVIsible;
      }
    }

    // 有值的时候才会去修改state
    if (visible !== undefined) {
      this.state.visible = visible;
    }
  }

  /**
   * 计算项的必填状态
   * @author lxm
   * @date 2023-06-26 06:19:00
   * @param {IData} data
   */
  calcItemRequired(data: IData): void {
    let { required } = this.dynaLogicResult;

    // 上层计算为启用时计算预定义项启用逻辑
    if (required !== true && this.panel.scheduler) {
      const itemAllowEmpty = this.panel.scheduler.triggerItemBlank(
        this.model.id!,
        {
          data: [data],
        },
      );
      if (itemAllowEmpty !== undefined) {
        required = !itemAllowEmpty;
      }
    }

    // 有值的时候才会去修改state
    if (required !== undefined) {
      this.state.required = required;
    }
  }

  /**
   * 动态逻辑结果
   * @author lxm
   * @date 2023-09-21 03:36:37
   * @protected
   */
  protected dynaLogicResult: {
    visible?: boolean;
    disabled?: boolean;
    required?: boolean;
  } = {
    visible: undefined,
    disabled: undefined,
    required: undefined,
  };

  /**
   * 计算动态逻辑
   *
   * @author lxm
   * @date 2023-02-13 09:42:07
   * @protected
   * @param {string[]} names 变更的属性集合
   * @param {boolean} [mustCalc=false] 是否强制计算一遍动态逻辑
   * @returns {*}  {void}
   * @memberof PanelItemController
   */
  protected calcDynamicLogic(names: string[], mustCalc: boolean = false): void {
    // 逻辑优化，当父容器存在且为不显示时，不去计算自己的动态逻辑
    if (this.parent && !this.parent.state.visible) {
      return;
    }

    // 根据自身的动态逻辑计算
    this.model.panelItemGroupLogics?.forEach(logic => {
      const relatedNames = logic.relatedItemNames || [];
      // name是动态逻辑涉及到的时或state存在时
      if (mustCalc || isOverlap(relatedNames, names)) {
        try {
          const ok = verifyPanelGroupLogic(this.data, logic);
          switch (logic.logicCat) {
            // 动态空输入，不满足则必填
            case 'ITEMBLANK':
              this.dynaLogicResult.required = !ok;
              break;
            // 动态启用，满足则启用
            case 'ITEMENABLE':
              this.dynaLogicResult.disabled = !ok;
              break;
            // 动态显示，满足则显示
            case 'PANELVISIBLE':
              this.dynaLogicResult.visible = ok;
              break;
            default:
          }
        } catch (error) {
          ibiz.log.error(error);
        }
      }
    });
  }

  /**
   * 找到指定成员的数据父容器
   * @author lxm
   * @date 2023-07-15 11:26:49
   * @param {IPanelItemController} panel
   * @return {*}  {(IPanelController | IPanelDataContainerController)}
   */
  findDataParent(
    panel: IPanelItemController,
  ): IPanelController | IPanelDataContainerController {
    const { parent } = panel;
    if (!parent) {
      return panel.panel;
    }
    if (parent.isDataContainer) {
      return parent as IPanelDataContainerController;
    }
    return this.findDataParent(parent);
  }

  /**
   * 计算动态样式表
   * @author lxm
   * @date 2023-08-02 06:15:08
   * @param {IData} data
   */
  protected calcDynaClass(data: IData): void {
    if (this.model.dynaClass) {
      const dynaClass = calcDynaClass(this.model.dynaClass, data);
      this.state.class.containerDyna = dynaClass;
    }
    if (this.model.labelDynaClass) {
      const dynaClass = calcDynaClass(this.model.labelDynaClass, data);
      this.state.class.labelDyna = dynaClass;
    }
  }

  /**
   * 点击事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  onClick(event?: MouseEvent): void {
    this.panel.evt.emit('onPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: PanelItemEventName.CLICK,
      event,
      data: [this.data],
    });
  }
}
