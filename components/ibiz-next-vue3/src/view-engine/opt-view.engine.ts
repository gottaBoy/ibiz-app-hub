import {
  ViewEngineBase,
  ViewController,
  IEditFormController,
  SysUIActionTag,
  EventBase,
  getControl,
  getControlsByView,
  IOptViewState,
  IOptViewEvent,
  ViewCallTag,
  IApiOptViewCall,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';
import { isNil } from 'ramda';

export class OptViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEEditView, IOptViewState, IOptViewEvent>}
   * @memberof OptViewEngine
   */
  declare protected view: ViewController<
    IAppDEEditView,
    IOptViewState,
    IOptViewEvent
  >;

  /**
   * 表单部件
   *
   * @readonly
   * @memberof OptViewEngine
   */
  get form(): IEditFormController {
    return this.view.getController('form') as IEditFormController;
  }

  protected init(): void {
    super.init();
    if (this.view.model.multiFormMode === 1 && this.view.params.srfdatatype) {
      const model = getControl(
        this.view.model,
        `_form_${this.view.params.srfdatatype}`,
      );
      if (model) {
        const controls = getControlsByView(this.view.model).filter(item => {
          return item.controlType !== 'FORM';
        });
        model.name = 'form';
        controls.push(model);
        if (this.view.model.viewLayoutPanel) {
          this.view.model.viewLayoutPanel.controls = controls;
        } else {
          this.view.model.controls = controls;
        }
      }
    }
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof OptViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    this.modalPreDismissHook = this.modalPreDismissHook.bind(this);
    this.modalShouldDismissHook = this.modalShouldDismissHook.bind(this);
    const { childNames, modal } = this.view;
    childNames.push('form');

    // 给表单加默认不加载
    if (!this.view.slotProps.form) {
      this.view.slotProps.form = {};
    }
    this.view.slotProps.form.loadDefault = false;

    // 给工具栏加默认不计算状态
    if (!this.view.slotProps.toolbar) {
      this.view.slotProps.toolbar = {};
    }
    this.view.slotProps.toolbar.manualCalcButtonState = true;

    modal.hooks.preDismiss.tapPromise(this.modalPreDismissHook);
    modal.hooks.shouldDismiss.tapPromise(this.modalShouldDismissHook);
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof OptViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model, evt } = this.view;

    // 监控form事件
    const formDeId = this.form.model.appDataEntityId;
    const formDataStateChange = (event: EventBase): void => {
      const data = event.data[0];
      this.toolbar?.calcButtonState(data, formDeId, event);
      if (data.srfkey) {
        evt.emit('onViewInfoChange', { dataInfo: data.srfmajortext });
      }
    };

    this.form.evt.on('onLoadSuccess', event => {
      // 更新视图作用域数据和srfreadonly数据
      const data = event.data[0];
      this.view.state.srfactiveviewdata = data;
      if (Object.prototype.hasOwnProperty.call(data, 'srfreadonly')) {
        if (data.srfreadonly) {
          this.view.context.srfreadonly = true;
        } else if (isNil(this.view.context.srfreadonly)) {
          this.view.context.srfreadonly = false;
        }
      }
      formDataStateChange(event);
    });
    this.form.evt.on('onLoadDraftSuccess', event => {
      formDataStateChange(event);
    });
    this.form.evt.on('onSaveSuccess', event => {
      formDataStateChange(event);
    });
    // 表单类型应用实体属性值变化且视图启用内置多表单模式时，重新绘制视图
    const appDe = await ibiz.hub.getAppDataEntity(
      this.view.model.appDataEntityId!,
      this.view.model.appId,
    );
    this.form.evt.on('onFormDataChange', event => {
      const { name, value } = event;
      if (
        name === appDe.formTypeAppDEFieldId &&
        this.view.model.multiFormMode === 1
      ) {
        this.view.redrawView({
          context: this.view.context,
          params: {
            ...this.view.params,
            srfdatatype: value,
            srfdefdata: event.data[0],
            [name]: value,
          },
          isReloadModel: true,
        });
      }
    });
    if (!this.view.state.noLoadDefault && model.loadDefault) {
      this.load();
    }
  }

  /**
   * 视图destroyed生命周期执行逻辑
   *
   * @author tony001
   * @date 2024-09-14 15:09:50
   * @return {*}  {Promise<void>}
   */
  async onDestroyed(): Promise<void> {
    super.onDestroyed();
    const { modal } = this.view;
    modal.hooks.preDismiss.removeTapPromise(this.modalPreDismissHook);
    modal.hooks.shouldDismiss.removeTapPromise(this.modalShouldDismissHook);
  }

  /**
   * @description 模态关闭前执行钩子
   * @param {{ allowNext?: boolean }} context
   * @returns {*}  {Promise<void>}
   * @memberof OptViewEngine
   */
  async modalPreDismissHook(context: { allowNext?: boolean }): Promise<void> {
    try {
      if (
        this.form &&
        this.form.state.modified &&
        this.form.model.enableAutoSave
      ) {
        await this.form.immediateAutoSave();
      }
    } catch (error) {
      context.allowNext = false;
    }
  }

  /**
   * 模态计算是否关闭钩子
   *
   * @author tony001
   * @date 2024-09-14 15:09:59
   * @param {{ allowClose?: boolean }} context
   * @return {*}  {Promise<void>}
   */
  async modalShouldDismissHook(context: {
    allowClose?: boolean;
  }): Promise<void> {
    const srfSessionid = this.view.context.srfsessionid;
    const uiDomain = ibiz.uiDomainManager.get(srfSessionid);
    // 顶层视图数据是否变更需要判断界面域数据是否变化和当前表单是否数据变化2个维度
    // 非顶层视图数据是否变更仅判断当前表单是否数据变化
    let isChange = this.view.model.enableDirtyChecking === true;
    // 若当前视图为顶层视图，则其srfsessionid等于当前视图id
    const isTopView = srfSessionid === this.view.id;
    if (isTopView) {
      const dataModification = uiDomain?.dataModification || false;
      isChange = isChange && (this.form?.state.modified || dataModification);
    } else {
      isChange = isChange && this.form?.state.modified;
    }
    if (isChange && context.allowClose == null) {
      const isAllow = await ibiz.confirm.error({
        title: ibiz.i18n.t('viewEngine.closeRemind'),
        desc: ibiz.i18n.t('viewEngine.confirmClosePrompt'),
      });
      if (!isAllow) {
        context.allowClose = false;
      } else {
        context.allowClose = true;
      }
    }
  }

  /**
   * 获取数据
   *
   * @return {*}  {IData[]}
   * @memberof OptViewEngine
   */
  getData(): IData[] {
    return this.form.getData();
  }

  /**
   * 加载
   *
   * @memberof OptViewEngine
   */
  load(): Promise<IData> {
    return this.form.load();
  }

  /**
   * @description 刷新
   * @returns {*}  {Promise<void>}
   * @memberof OptViewEngine
   */
  async refresh(): Promise<void> {
    await this.form.refresh();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  async call(key: keyof IApiOptViewCall, args: any): Promise<any> {
    if (key === SysUIActionTag.CANCEL) {
      this.cancel();
      return null;
    }
    if (key === SysUIActionTag.OK) {
      await this.confirm();
      return null;
    }
    if (key === ViewCallTag.LOAD) {
      this.load();
      return null;
    }
    if (key === ViewCallTag.VALIDATE) {
      return this.form.validate();
    }
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 确认
   *
   * @memberof OptViewEngine
   */
  async confirm(): Promise<void> {
    this.view.state.isClosing = true;
    try {
      await this.form.save();
      await this.view.closeView({ ok: true, data: this.getData() });
    } catch (error) {
      this.view.state.isClosing = false;
      throw error;
    }
  }

  /**
   * 取消
   *
   * @memberof OptViewEngine
   */
  cancel(): void {
    this.view.modal.ignoreDismissCheck = true;
    this.view.closeView({ ok: false, data: [] });
  }
}
