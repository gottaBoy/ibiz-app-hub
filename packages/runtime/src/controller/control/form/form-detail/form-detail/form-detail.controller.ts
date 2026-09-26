import { isOverlap } from '@ibiz-template/core';
import { IDEFDCatGroupLogic, IDEFormDetail } from '@ibiz/model-core';
import {
  IFormDetailController,
  IFormDetailContainerController,
  FormDetailEventName,
} from '../../../../../interface';
import { calcLayoutHeightWidth, calcDynaClass } from '../../../../../model';
import { ScriptFactory, verifyFormGroupLogic } from '../../../../../utils';
import { FormNotifyState } from '../../../../constant';
import { FormDetailState } from './form-detail.state';
import { FormController } from '../../form';
import { AppCounter } from '../../../../../service';

export class FormDetailController<T extends IDEFormDetail = IDEFormDetail>
  implements IFormDetailController
{
  /**
   * 表单成员模型
   *
   * @author lxm
   * @date 2022-08-24 20:08:19
   * @type {T}
   */
  readonly model: T;

  /**
   * @description 是否为自定义代码
   * @type {boolean}
   * @memberof FormDetailController
   */
  isCustomCode: boolean = false;

  /**
   * 表单项状态
   *
   * @author chitanda
   * @date 2023-01-04 09:01:04
   * @type {FormDetailState}
   */
  state: FormDetailState;

  /**
   * 表单控制器
   *
   * @author lxm
   * @date 2022-08-24 22:08:59
   * @type {FormController}
   */
  readonly form: FormController;

  /**
   * 父容器控制器(除了表单分页都存在)
   *
   * @author lxm
   * @date 2022-08-24 22:08:59
   * @type {IFormDetailContainerController}
   */
  readonly parent?: IFormDetailContainerController;

  /**
   * 表单数据
   *
   * @author lxm
   * @date 2022-09-01 22:09:48
   * @readonly
   */
  get data(): IData {
    return this.form.data;
  }

  /**
   * 上下文
   *
   * @author lxm
   * @date 2023-11-22 11:43:47
   * @readonly
   * @type {IContext}
   */
  get context(): IContext {
    return this.form.context;
  }

  /**
   *  视图参数
   * @author lxm
   * @date 2023-11-22 11:43:41
   * @readonly
   * @type {IParams}
   */
  get params(): IParams {
    return this.form.params;
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
   * @description 计数器对象
   * @type {AppCounter}
   * @memberof FormDetailController
   */
  counter?: AppCounter;

  /**
   * Creates an instance of FormDetailController.
   * @author lxm
   * @date 2022-08-24 20:08:22
   * @param {T} model
   */
  constructor(
    model: T,
    form: FormController,
    parent?: IFormDetailContainerController,
  ) {
    this.model = model;
    this.form = form;
    this.parent = parent;
    this.state = this.createState();
    this.state.context = this.context;

    // 如果有项显示逻辑默认隐藏
    const tag = this.model.defdgroupLogics?.findIndex(
      (item: IDEFDCatGroupLogic) => {
        return item.logicCat === 'PANELVISIBLE';
      },
    );
    if (tag !== undefined && tag > -1) {
      this.state.visible = false;
    }
    const renderCode = this.getRenderCode();
    if (renderCode) this.isCustomCode = true;
  }

  /**
   * 子类不可覆盖或重写此方法，在 init 时需要重写的使用 onInit 方法。
   *
   * @author lxm
   * @date 2022-08-18 22:08:30
   * @returns {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    await this.onInit();
  }

  protected async onInit(): Promise<void> {
    await this.initUIActions();

    this.state.showMoreMode = this.model.showMoreMode!;

    // 初始化布局参数
    const { layoutPos, sysCss, labelSysCss, capLanguageRes } = this.model;

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

    // 初始化多语言
    if (capLanguageRes && capLanguageRes.lanResTag) {
      this.model.caption = ibiz.i18n.t(
        capLanguageRes.lanResTag,
        this.model.caption,
      );
    }
    this.handleCounterChange = this.handleCounterChange.bind(this);
    this.initCounter();
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormDetailController
   */
  protected async initUIActions(): Promise<void> {}

  /**
   * @description 初始化计数器
   * @protected
   * @returns {*}  {void}
   * @memberof FormDetailController
   */
  protected initCounter(): void {
    const { counters } = this.form;
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
   * @returns {*}  {void}
   * @memberof FormDetailController
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
   * 创建表单状态对象
   *
   * @author chitanda
   * @date 2023-01-04 10:01:00
   * @protected
   * @return {*}  {FormDetailState}
   */
  protected createState(): FormDetailState {
    return new FormDetailState(this.parent?.state);
  }

  /**
   * 表单数据变更通知(由表单控制器调用)
   *
   * @author lxm
   * @date 2022-09-20 18:09:56
   * @param {string[]} names
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    // 计算动态控制逻辑（单单基于变更项计算相关动态逻辑不够，其关联项存在动态逻辑，可能会导致界面计算动态逻辑异常，因此需整体计算一遍）
    this.calcDynamicLogic(names, true);

    // 计算显示，禁用，必填状态
    this.calcDetailDisabled(this.data);
    this.calcDetailVisible(this.data);
    this.calcDetailRequired(this.data);

    // 计算动态样式表
    this.calcDynaClass(this.data);
  }

  /**
   * 表单状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  async formStateNotify(_state: FormNotifyState): Promise<void> {
    // 计算动态控制逻辑
    this.calcDynamicLogic([], true);

    // 计算显示，禁用，必填状态
    this.calcDetailDisabled(this.data);
    this.calcDetailVisible(this.data);
    this.calcDetailRequired(this.data);

    // 计算动态样式表
    this.calcDynaClass(this.data);
  }

  /**
   * 计算动态逻辑
   *
   * @author lxm
   * @date 2022-09-20 19:09:20
   * @protected
   * @param {string[]} names 变更的属性集合
   * @param {boolean} [mustCalc=false] 是否强制计算一遍动态逻辑
   * @returns {*}  {void}
   */
  protected calcDynamicLogic(names: string[], mustCalc: boolean = false): void {
    // 逻辑优化，当父容器存在且为不显示时，不去计算自己的动态逻辑
    if (this.parent && !this.parent.state.visible && !mustCalc) {
      return;
    }

    // 根据自身的动态逻辑计算
    this.model.defdgroupLogics?.forEach(logic => {
      const relatedNames = logic.relatedDetailNames || [];
      // name是动态逻辑涉及到的时或state存在时
      if (
        logic.logicCat &&
        ['ITEMBLANK', 'ITEMENABLE', 'PANELVISIBLE'].includes(logic.logicCat) &&
        (mustCalc || isOverlap(relatedNames, names))
      ) {
        try {
          const ok = verifyFormGroupLogic(this.data, logic);
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
   * 强制更新视图
   *
   * @author lxm
   * @date 2022-09-15 09:09:05
   * @param {() => void} [_callback] 更新之后，组件渲染完成后的回调
   */
  force(_callback?: () => void): void {
    // 在界面数据发生变更时，会调用此方法。
    // 可外部覆盖实例的此方法，实现自定义的数据更新逻辑。
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
   * 计算项的禁用状态
   *
   * @param {IData} data
   */
  calcDetailDisabled(data: IData): void {
    let { disabled } = this.dynaLogicResult;

    // 上层计算为启用时计算预定义项启用逻辑
    if (disabled !== true && this.form.scheduler) {
      const itemEnable = this.form.scheduler.triggerItemEnable(this.model.id!, {
        data: [data],
      });
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
   *
   * @param {IData} data
   */
  calcDetailVisible(data: IData): void {
    let { visible } = this.dynaLogicResult;

    // 上层计算为显示时计算预定义项显示逻辑
    if (visible !== false && this.form.scheduler) {
      const itemVIsible = this.form.scheduler.triggerItemVisible(
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
   *
   * @param {IData} data
   */
  calcDetailRequired(data: IData): void {
    let { required } = this.dynaLogicResult;

    // 上层计算为启用时计算预定义项空输入逻辑
    if (required !== true && this.form.scheduler) {
      const itemAllowEmpty = this.form.scheduler.triggerItemBlank(
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
   * 执行脚本代码
   * - 表单项值变更，点击，获取焦点，失去焦点时触发
   * @protected
   * @param {('SCRIPTCODE_CHANGE'
   *       | 'SCRIPTCODE_CLICK'
   *       | 'SCRIPTCODE_FOCUS'
   *       | 'SCRIPTCODE_BLUR')} logicCat 逻辑类型 SCRIPTCODE_CHANGE：表单项值变更（脚本处理）、 SCRIPTCODE_CLICK：表单项点击（脚本处理）、 SCRIPTCODE_FOCUS：表单项获取焦点（脚本处理）、 SCRIPTCODE_BLUR：表单项失去焦点（脚本处理）
   * @memberof FormDetailController
   */
  protected executeScriptCode(
    logicCat:
      | 'SCRIPTCODE_CHANGE'
      | 'SCRIPTCODE_CLICK'
      | 'SCRIPTCODE_FOCUS'
      | 'SCRIPTCODE_BLUR',
    args: IData = {},
  ): void {
    this.model.defdgroupLogics?.forEach(logic => {
      const child: IData | undefined = logic.defdlogics?.[0];
      if (logic.logicCat === logicCat && child && child.value) {
        ScriptFactory.execScriptFn(
          {
            ctrl: this.form,
            view: this.form.view,
            data: this.form.data,
            params: this.params,
            context: this.context,
            args,
          },
          child.value,
        );
      }
    });
  }

  /**
   * 点击事件
   * @author lxm
   * @date 2023-10-11 05:03:26
   */
  async onClick(event?: MouseEvent): Promise<void> {
    if (event) {
      // 阻止冒泡
      event.stopPropagation();
    }
    this.executeScriptCode('SCRIPTCODE_CLICK');
    this.form.evt.emit('onFormDetailEvent', {
      formDetailName: this.model.id!,
      formDetailEventName: FormDetailEventName.CLICK,
      event,
    });
  }

  /**
   * @description 获取脚本代码html
   * @param {IData} data
   * @returns {*}  {(Promise<string | undefined>)}
   * @memberof FormDetailController
   */
  async getCustomHtml(data: IData): Promise<string | undefined> {
    let renderCode = this.getRenderCode();
    if (renderCode) {
      // 兼容单行脚本
      if (!renderCode.includes('return')) {
        renderCode = `return (${renderCode})`;
      }
      return (await ScriptFactory.asyncExecScriptFn(
        {
          data,
          context: this.context,
          params: this.params,
          controller: this,
          ctrl: this.form,
          view: this.form.view,
          metadata: { model: this.model },
        },
        renderCode,
      )) as string;
    }
  }

  /**
   * @description 获取绘制器模型代码
   * @returns {*}  {string}
   * @memberof FormDetailController
   */
  getRenderCode(): string {
    let result = '';
    const { controlRenders = [], id } = this.model;
    const item = controlRenders.find(
      renderItem =>
        renderItem.renderType === 'LAYOUTPANEL_MODEL' &&
        renderItem.id !== `${id?.toLowerCase()}_tooltip`,
    );
    if (item) result = item.layoutPanelModel || '';
    return result;
  }
}
