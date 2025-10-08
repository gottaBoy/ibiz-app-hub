/* eslint-disable no-param-reassign */
import {
  RuntimeModelError,
  debounceAndAsyncMerge,
  recursiveIterate,
  EntityError,
  RuntimeError,
} from '@ibiz-template/core';
import {
  IControlLogic,
  IDEForm,
  IDEFormDetail,
  IDEFormItem,
} from '@ibiz/model-core';
import { isBoolean } from 'qx-util';
import { clone } from 'ramda';
import {
  IFormState,
  IFormEvent,
  IFormController,
  IFormDetailController,
  IFormDetailProvider,
  IApiFormDetailMapping,
} from '../../../../interface';
import {
  calcDeCodeNameById,
  findChildFormDetails,
  isFormDataContainer,
} from '../../../../model';
import { getFormDetailProvider } from '../../../../register';
import {
  AppCounter,
  ControlVO,
  CounterService,
  Srfuf,
} from '../../../../service';
import { handleAllSettled } from '../../../../utils';
import { ControlController } from '../../../common';
import { FormNotifyState } from '../../../constant';
import { ControllerEvent, isValueChange } from '../../../utils';
import type {
  FormDRUIPartController,
  FormDetailController,
  FormGroupPanelController,
  FormItemController,
  FormItemState,
  FormMDCtrlController,
  FormTabPanelController,
} from '../form-detail';
import { FormService } from './form.service';

/**
 * 表单控制器
 *
 * @author chitanda
 * @date 2022-08-03 11:08:29
 * @export
 * @class FormController
 * @extends {ControlController<T>}
 * @template T
 */
export abstract class FormController<
    T extends IDEForm = IDEForm,
    S extends IFormState = IFormState,
    E extends IFormEvent = IFormEvent,
  >
  extends ControlController<T, S, E>
  implements IFormController<T, S, E>
{
  service!: FormService;

  protected get _evt(): ControllerEvent<IFormEvent> {
    return this.evt;
  }

  /**
   * 所有表单项成员的控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: IFormDetailController }}
   */
  details: { [key: string]: IFormDetailController } = {};

  /**
   * 所有表单项成员的适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: IFormDetailProvider }}
   */
  providers: { [key: string]: IFormDetailProvider } = {};

  /**
   * 表单项控制器的集合
   *
   * @author lxm
   * @date 2022-09-05 00:09:52
   * @type {FormItemController[]}
   */
  formItems: FormItemController[] = [];

  /**
   * 表单多数据部件控制器的集合
   *
   * @author lxm
   * @date 2022-09-05 00:09:52
   * @type {FormMDCtrlController[]}
   */
  formMDCtrls: FormMDCtrlController[] = [];

  /**
   * @description 表单关系界面
   * @type {FormDRUIPartController[]}
   * @memberof FormController
   */
  formDruipart: FormDRUIPartController[] = [];

  /**
   * 计数器对象
   * @author lxm
   * @date 2024-01-18 05:12:35
   * @type {AppCounter}
   */
  counters: { [key: string]: AppCounter } = {};

  /**
   * 表单数据
   *
   * @author chitanda
   * @date 2023-01-04 10:01:46
   * @readonly
   * @type {IData}
   */
  get data(): IData {
    return this.state.data;
  }

  protected initState(): void {
    super.initState();
    this.state.activeTab = this.model.deformPages?.[0]?.id || '';
    this.state.data = new ControlVO();
    this.state.isLoaded = false;
    this.state.processing = false;
    this.state.modified = false;
    this.state.formIsDestroyed = false;
    this.state.simpleDataIndex = 0;
    this.state.mdCtrlFormIndex = 0;
  }

  /**
   * 设置激活分页
   *
   * @param {string} name
   * @memberof FormController
   */
  public setActiveTab(name: string): void {
    this.state.activeTab = name;
  }

  /**
   * @description 设置简单模式数据索引
   * @param {number} [index]
   * @memberof EditFormController
   */
  setSimpleDataIndex(index?: number): void {
    this.state.simpleDataIndex = index || 0;
  }

  /**
   * @description 获取简单模式数据索引
   * @returns {*}  {number}
   * @memberof EditFormController
   */
  getSimpleDataIndex(): number {
    return this.state.simpleDataIndex;
  }

  /**
   * @description 获取多数据部件表单模式下当前表单索引
   * @returns {*}  {number}
   * @memberof FormController
   */
  getMdCtrlFormIndex(): number {
    return this.state.mdCtrlFormIndex;
  }

  /**
   * @description 设置多数据部件表单模式下当前表单的索引
   * @param {number} index
   * @memberof FormController
   */
  setMdCtrlFormIndex(index: number): void {
    this.state.mdCtrlFormIndex = index;
  }

  /**
   * 更新表单分页面板
   *
   * @author zhanghengfeng
   * @date 2025-02-05 20:02:12
   */
  updateFormTabPanel(): void {
    Object.values(this.details).forEach(detail => {
      if ((detail as FormDetailController).model.detailType === 'TABPANEL') {
        (detail as FormTabPanelController).updateActiveTab?.();
      }
    });
  }

  /**
   * 通知所有表单成员表单操作过程中的数据变更
   *
   * @author lxm
   * @date 2022-09-20 18:09:40
   * @param {string[]} names
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    // 通知所有成员项去处理成员项相关逻辑
    await handleAllSettled(
      Object.values(this.details).map(async detail => {
        return detail.dataChangeNotify(names);
      }),
    );
    this.updateFormTabPanel();
  }

  /**
   * 表单状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  formStateNotify(state: FormNotifyState): void {
    Object.values(this.details).forEach(detail => {
      detail.formStateNotify(state);
    });
    this.updateFormTabPanel();
  }

  /**
   * 初始化
   *
   * @author lxm
   * @date 2022-08-24 20:08:59
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initDetailControllers();
    // 初始化计数器
    await this.initCounter();

    // 数据变更通知防抖，且合并参数
    this.dataChangeNotify = debounceAndAsyncMerge(
      this.dataChangeNotify.bind(this),
      (arr1, arr2): [string[]] => {
        return [Array.from(new Set([...arr1[0], ...arr2[0]]))];
      },
      200,
    );

    // 监听表单成员事件，触发对应部件逻辑
    this._evt.on('onFormDetailEvent', event => {
      if (this.state.formIsDestroyed) return;
      this.scheduler?.triggerControlEvent(
        event.formDetailName,
        event.formDetailEventName,
        event,
      );
    });
  }

  /**
   * 初始化表单成员控制器
   *
   * @author lxm
   * @date 2022-08-24 21:08:48
   * @protected
   */
  protected async initDetailControllers(
    details: IDEFormDetail[] = this.model.deformPages!,
    form: FormController = this,
    parent: FormGroupPanelController | undefined = undefined,
  ): Promise<void> {
    await Promise.all(
      details.map(async detail => {
        // 生成表单成员控制器
        const detailProvider = await getFormDetailProvider(detail, this.model);
        if (!detailProvider) {
          return;
        }
        if (form.details[detail.id!]) {
          throw new RuntimeModelError(
            detail,
            ibiz.i18n.t(
              'runtime.controller.control.form.initializationException',
              {
                id: detail.id,
                detailType: detail.detailType,
              },
            ),
          );
        }
        form.providers[detail.id!] = detailProvider;
        const detailController = await detailProvider.createController(
          detail,
          form,
          parent,
        );
        form.details[detail.id!] = detailController;
        if (detail.detailType === 'FORMITEM') {
          if ((detail as IDEFormItem).compositeItem) {
            const { editorItems = [] } = (detail as IDEFormItem).editor || {};
            await Promise.all(
              editorItems.map(async (editorItem: IData) => {
                const childrenController =
                  await detailProvider.createController(
                    { ...detail, id: editorItem.id },
                    form,
                    parent,
                  );
                form.details[editorItem.id!] = childrenController;
                form.formItems.push(childrenController as FormItemController);
              }),
            );
          } else {
            form.formItems.push(detailController as FormItemController);
          }
        }
        if (detail.detailType === 'MDCTRL') {
          form.formMDCtrls.push(detailController as FormMDCtrlController);
        }
        if (detail.detailType === 'DRUIPART') {
          form.formDruipart.push(detailController as FormDRUIPartController);
        }

        // 数据容器的子不递归了
        if (isFormDataContainer(detail)) {
          return;
        }

        // 有子成员的生成子控制器
        const childDetails = findChildFormDetails(detail);
        if (childDetails.length) {
          await this.initDetailControllers(
            childDetails,
            form,
            detailController as FormGroupPanelController,
          );
        }
      }),
    );
  }

  /**
   * 加载
   *
   * @author lxm
   * @date 2022-09-22 17:09:04
   * @returns {*}  {Promise<IData>}
   */
  abstract load(): Promise<IData>;

  /**
   * 获取表单数据
   *
   * @author lxm
   * @date 2022-08-30 19:08:11
   * @returns {*}
   */
  getData(): IData[] {
    return [this.state.data];
  }

  /**
   * @description 获取原始实体数据
   * @returns {*}  {IData[]}
   * @memberof FormController
   */
  getReal(): IData[] {
    let formData = this.getData()[0] || {};
    formData = this.checkIgnoreInput(formData);
    const originData =
      formData instanceof ControlVO ? formData.getOrigin() : formData;
    const filterData = this.service.getFilteredData(formData);
    Object.assign(originData, filterData);
    return [originData];
  }

  /**
   * 设置表单数据的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {string} name 要设置的表单数据的属性名称
   * @param {unknown} value 要设置的值
   * @param {boolean} ignore 忽略脏值检查
   */
  async setDataValue(
    name: string,
    value: unknown,
    ignore: boolean = false,
  ): Promise<void> {
    if (
      Object.prototype.hasOwnProperty.call(this.state.data, name) &&
      !isValueChange(this.state.data[name], value)
    ) {
      // *`表单里没有属性${name}或者${name}的值未发生改变`
      return;
    }
    const oldValue = this.state.data[name];
    // 改变值
    this.state.data[name] = value;

    // 设置正在处理状态
    this.state.processing = true;
    if (!ignore) {
      this.state.modified = true;
    }

    await this._evt.emit('onFormDataChange', { name, value, oldValue });
    if (this.state.formIsDestroyed) return;
    try {
      await this.dataChangeNotify([name]);
    } finally {
      this.state.processing = false;
    }
  }

  async updateFormItem(_formItemUpdateId: string): Promise<void> {
    // 子类实现
  }

  /**
   * 检查忽略输入值(解除表单项和实体属性之间的联系，方便表单服务过滤)
   *
   * @author tony001
   * @date 2025-01-09 16:01:29
   * @param {IData} data
   * @return {*}  {IData}
   */
  checkIgnoreInput(data: IData): IData {
    const formData = clone(data);
    const formDataUIMap = formData.$dataUIMap;
    const isCreate = formData.srfuf === Srfuf.CREATE;
    this.formItems.forEach((formItem: FormItemController) => {
      const { ignoreInput } = formItem.model;
      switch (ignoreInput) {
        // 建立（数据建立时忽略）
        case 1:
          if (isCreate) formDataUIMap.delete(formItem.name);
          break;
        // 更新（数据更新时忽略）
        case 2:
          if (!isCreate) formDataUIMap.delete(formItem.name);
          break;
        // 建立及更新（数据建立及更新时都忽略）
        case 3:
          formDataUIMap.delete(formItem.name);
          break;
        // 表单项禁用（表单项处于禁用状态时忽略）
        case 4:
          if (formItem.state.disabled) formDataUIMap.delete(formItem.name);
          break;
        default:
          ibiz.log.debug(`[${ignoreInput}]类型忽略输入值暂未支持`);
          break;
      }
    });
    return formData;
  }

  /**
   * 校验表单的全部表单项
   *
   * @author lxm
   * @date 2022-09-05 00:09:53
   * @returns {*}  {Promise<boolean>}
   */
  async validate(): Promise<boolean> {
    const values = await Promise.all(
      [...this.formItems, ...this.formMDCtrls, ...this.formDruipart].map(
        formItem => formItem.validate(),
      ),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  /**
   * 静默校验
   * - 只校验无提示信息
   *
   * @return {*}  {Promise<boolean>}
   * @memberof FormController
   */
  async silentValidate(): Promise<boolean> {
    const values = await Promise.all(
      [...this.formItems, ...this.formMDCtrls, ...this.formDruipart].map(
        formItem => formItem.silentValidate(),
      ),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  /**
   * 执行对应部件行为消息提示
   * @author zzq
   * @date 2024-04-03 15:51:21
   * @param {string} tag
   * @param {({ default?: string; data?: IData | IData[]; error?: Error })} [opts]
   * @return {*}  {void}
   */
  actionNotification(
    tag: string,
    opts?: { default?: string; error?: Error },
  ): void {
    if (opts?.error && opts.error instanceof EntityError) {
      const { details } = opts.error;
      details.forEach(detail => {
        this.setDetailError(detail.name, detail.errorInfo);
      });
    }
    super.actionNotification(tag, { data: this.data, ...(opts || {}) });
  }

  /**
   * 初始化部件逻辑调度器
   * @author lxm
   * @date 2023-08-21 11:53:37
   * @param {IControlLogic[]} logics
   * @return {*}  {void}
   */
  protected initControlScheduler(logics: IControlLogic[] = []): void {
    const actualLogics = [...logics];
    // 遍历所有的项，如果有逻辑的话加入
    recursiveIterate(
      this.model,
      (item: IDEFormDetail) => {
        if (item.controlLogics) {
          actualLogics.push(...item.controlLogics);
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
      },
    );
    super.initControlScheduler(actualLogics);
  }

  protected async onDestroyed(): Promise<void> {
    this.state.formIsDestroyed = true;
    await super.onDestroyed();
    // 销毁视图计数器
    Object.values(this.counters).forEach(counter => counter.destroy());
  }

  /**
   * 初始化计数器
   * @author lxm
   * @date 2024-01-18 05:12:02
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initCounter(): Promise<void> {
    this.counters = {};
    const { appCounterRefs } = this.model;
    if (appCounterRefs && appCounterRefs.length > 0) {
      const dataKey: string =
        this.context[calcDeCodeNameById(this.model.appDataEntityId!)];
      try {
        await Promise.all(
          appCounterRefs.map(async counterRef => {
            const counter = await CounterService.getCounterByRef(
              counterRef,
              this.context,
              dataKey
                ? { srfcustomtag: dataKey, ...this.params }
                : { ...this.params },
            );
            this.counters[counterRef.id!] = counter;
          }),
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * @description 设置表单项错误信息
   * @param {string} name
   * @param {string} message
   * @memberof FormController
   */
  setDetailError(name: string, message: string): void {
    const detail = this.details[name];
    const state = detail?.state as FormItemState;
    if (state) {
      state.error = message;
    }
  }

  /**
   * 刷新
   * - 表单刷新时刷新所有数据（表单数据，计数器数据）
   * @return {*}  {Promise<void>}
   * @memberof FormController
   */
  async refresh(): Promise<void> {
    this.doNextActive(
      async () => {
        await Promise.all(
          Object.values(this.counters).map(counter =>
            counter.refresh(this.context, this.params),
          ),
        );
        await this.load();
      },
      {
        key: 'refresh',
      },
    );
  }

  /**
   * @description 切换折叠，其中tag表示操作指定分组标识，若不传则操作当前表单的所有分组展开状态，expand表示是否展开，若不传则以当前分组状态为基准切换
   * @param {{ tag?: string; expand?: boolean }} [params={}]
   * @memberof FormController
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    // 存在分组id则展开/收缩分组
    if (tag) {
      const group = this.details[tag] as FormGroupPanelController;
      if (!group) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.control.form.noFoundFormGroup'),
        );
      }
      group.state.collapse = isBoolean(expand)
        ? !expand
        : !group.state.collapse;
      // 表单分组收缩与展开默认操作子分组
      const { deformDetails } = group.model;
      if (deformDetails && deformDetails.length > 0) {
        deformDetails.forEach(item => {
          if (item.detailType === 'GROUPPANEL') {
            this.changeCollapse({ tag: item.codeName, expand });
          }
        });
      }
    } else {
      // 不存在分组id时全展开/全收缩
      Object.values(this.details).forEach(group => {
        if ((group as IData).model.detailType === 'GROUPPANEL') {
          (group as FormGroupPanelController).state.collapse = isBoolean(expand)
            ? !expand
            : !(group as FormGroupPanelController).state.collapse;
        }
      });
    }
  }

  /**
   * @description 获取表单成员
   * @template K
   * @param {K} type
   * @param {string} id
   * @returns {*}  {IApiFormDetailMapping[K]}
   * @memberof FormController
   */
  getFormDetail<K extends keyof IApiFormDetailMapping>(
    type: K,
    id: string,
  ): IApiFormDetailMapping[K] {
    return this.details[id] as unknown as IApiFormDetailMapping[K];
  }
}
