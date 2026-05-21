import { isNil } from 'ramda';
import { RuntimeError } from '@ibiz-template/core';
import {
  ViewController,
  IEditFormController,
  SysUIActionTag,
  EventBase,
  IEditViewState,
  IEditViewEvent,
  ControlVO,
  calcDeCodeNameById,
  OpenAppViewCommand,
  IModalData,
  getAppViewRef,
  ViewCallTag,
  getControl,
  getControlsByView,
  getDeDataMajorField,
  calcDynaSysParams,
  convertNavData,
  DEMainViewEngine,
  FormSaveParams,
  IApiEditViewCall,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';

export class EditViewEngine extends DEMainViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDEEditView,
   *     IEditViewState,
   *     IEditViewEvent
   *   >}
   * @memberof EditViewEngine
   */
  declare protected view: ViewController<
    IAppDEEditView,
    IEditViewState,
    IEditViewEvent
  >;

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
   * @description 模态关闭前执行钩子
   * @param {{ allowNext?: boolean }} context
   * @returns {*}  {Promise<void>}
   * @memberof EditViewEngine
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
   * @param {{ allowClose?: boolean }} context
   * @return {*}  {Promise<void>}
   * @memberof EditViewEngine
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

  async onCreated(): Promise<void> {
    await super.onCreated();
    this.modalPreDismissHook = this.modalPreDismissHook.bind(this);
    this.modalShouldDismissHook = this.modalShouldDismissHook.bind(this);
    this.formDataStateChange = this.formDataStateChange.bind(this);
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
   * @description 监控form事件
   * @param {EventBase} event
   * @memberof EditViewEngine
   */
  formDataStateChange(event: EventBase): void {
    const { model, evt } = this.view;
    const formDeId = this.form.model.appDataEntityId;
    const data = event.data[0];
    this.toolbar?.calcButtonState(data, formDeId, event);
    if (model.showDataInfoBar) {
      if (data.srfkey) {
        evt.emit('onViewInfoChange', { dataInfo: data.srfmajortext || '' });
      } else {
        evt.emit('onViewInfoChange', {
          dataInfo: ibiz.i18n.t('app.newlyBuild'),
        });
      }
    }
  }

  async onMounted(): Promise<void> {
    await super.onMounted();

    const { model, evt } = this.view;
    if (this.form) {
      this.form.evt.on('onLoadSuccess', event => {
        this.formDataStateChange(event);
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
        evt.emit('onDataChange', { ...event, actionType: 'LOAD' });
      });
      this.form.evt.on('onLoadDraftSuccess', event => {
        this.formDataStateChange(event);
        evt.emit('onDataChange', { ...event, actionType: 'LOADDRAFT' });
      });
      this.form.evt.on('onSaveSuccess', event => {
        this.view.state.closeOK = true;
        const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
        const formData = event.data[0];
        if (this.view.context[deName] !== formData.srfkey) {
          this.view.context[deName] = formData.srfkey;
        }
        this.formDataStateChange(event);
        evt.emit('onDataChange', { ...event, actionType: 'SAVE' });
      });
      this.form.evt.on('onRemoveSuccess', event => {
        this.formDataStateChange(event);
        evt.emit('onDataChange', { ...event, actionType: 'REMOVE' });
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
            params: { srfdatatype: value, [name]: value },
            isReloadModel: true,
          });
        }
      });
      if (!this.view.state.noLoadDefault && model.loadDefault) {
        this.load();
      }
    }
  }

  getData(): IData[] {
    return this.form.getData();
  }

  async load(): Promise<IData> {
    return this.form.load();
  }

  async save(args?: FormSaveParams): Promise<IData> {
    return this.form.save(args);
  }

  async refresh(): Promise<void> {
    this.form.refresh();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  async call(key: keyof IApiEditViewCall, args: any): Promise<any> {
    if (key === SysUIActionTag.SAVE) {
      await this.form.save();
      return null;
    }
    if (key === SysUIActionTag.SAVE_AND_EXIT) {
      await this.form.save();
      return { closeView: true };
    }
    if (key === SysUIActionTag.REMOVE_AND_EXIT) {
      const res = await this.form.remove();
      return { closeView: res };
    }
    if (key === SysUIActionTag.SAVE_AND_NEW) {
      this.saveAndNew();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    if (key === SysUIActionTag.SAVE_AND_START) {
      await this.wfStart();
      return null;
    }
    if (
      key === SysUIActionTag.FIRST_RECORD ||
      key === SysUIActionTag.LAST_RECORD ||
      key === SysUIActionTag.PREV_RECORD ||
      key === SysUIActionTag.NEXT_RECORD
    ) {
      await this.changeRecord(key);
      return null;
    }
    if (key === SysUIActionTag.VIEW_WF_STEP) {
      await this.wfSubmit();
      return null;
    }
    if (key === ViewCallTag.LOAD) {
      this.load();
      return null;
    }
    if (key === ViewCallTag.VALIDATE) {
      return this.form.validate();
    }
    if (key === ViewCallTag.WF_WITHDRAW) {
      await this.wfWithdraw();
      return null;
    }
    if (key === SysUIActionTag.EXPAND) {
      const { srfcollapsetag, srfgroupid } = args.params || {};
      const tag = srfcollapsetag || srfgroupid;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.form.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { srfcollapsetag, srfgroupid } = args.params || {};
      const tag = srfcollapsetag || srfgroupid;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.form.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.form.changeCollapse({ expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.form.changeCollapse({ expand: false });
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 保存并新建
   *
   * @author zk
   * @date 2023-06-01 01:06:59
   * @return {*}
   * @memberof EditViewEngine
   */
  async saveAndNew(): Promise<void> {
    await this.form.save();
    this.form.state.data = new ControlVO();
    // 置空主键
    this.view.context[calcDeCodeNameById(this.view.model.appDataEntityId!)] =
      undefined;
    await this.form.load();
  }

  /**
   * @description 取消变更
   * @param {({
   *       targetState: 'INIT' | 'UNDO' | 'REDO';
   *     })} [_args={ targetState: 'INIT' }] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof EditViewEngine
   */
  async cancelChanges(
    _args: {
      targetState: 'INIT' | 'UNDO' | 'REDO';
    } = { targetState: 'INIT' },
  ): Promise<void> {
    await super.cancelChanges(_args);
    await this.form.cancelChanges(_args.targetState);
  }

  /**
   * 工作流启动
   *
   * @author lxm
   * @date 2022-09-29 20:09:27
   * @returns {*}  {Promise<void>}
   */
  async wfStart(): Promise<void> {
    // 先保存
    await this.save({ silent: true });

    const entityService = await ibiz.hub.getAppDEService(
      this.view.model.appId,
      this.view.model.appDataEntityId!,
      this.view.context,
    );

    const data = this.form.state.data;

    // *获取工作流版本信息
    const res = await entityService.wf.getWFVersion(
      data.srfwftag ?? this.view.params.srfwftag ?? this.view.context.srfwftag,
    );
    if (res.data.length === 0) {
      throw new RuntimeError(ibiz.i18n.t('viewEngine.noExistVersionErr'));
    }
    // todo 多个的情况要出一个确认框选择后走后续逻辑

    const wfInfo = res.data[0];
    const refKey = `WFSTART@${wfInfo.wfversion}`;

    // 处理视图上下文
    const newContext = Object.assign(this.view.context.clone(), {
      activeForm: wfInfo['process-form'],
    });
    // 处理视图参数
    const newParams = {
      processDefinitionKey: wfInfo.definitionkey,
    };

    // 查找工作流启动视图
    const startView = getAppViewRef(this.view.model, refKey);

    // *没有工作流启动视图的，自己启动工作流
    if (!startView) {
      await this.form.wfStart({ viewParam: newParams });
      await this.view.closeView();
      return;
    }

    // *有工作流启动视图的，由启动视图执行工作流启动
    const result: IModalData = await ibiz.commands.execute(
      OpenAppViewCommand.TAG,
      startView.refAppViewId,
      newContext,
      newParams,
    );

    // 启动视图正常关闭后关闭当前视图
    if (result.ok) {
      await this.view.closeView();
    }
  }

  /**
   * 工作流提交
   *
   * @author lxm
   * @date 2022-09-29 20:09:27
   * @returns {*}  {Promise<void>}
   */
  wfSubmit(): Promise<void> {
    return this.form.wfSubmit();
  }

  /**
   * 工作流撤回
   *
   * @author zk
   * @date 2023-11-22 11:11:55
   * @return {*}  {Promise<void>}
   * @memberof MobEditViewEngine
   */
  async wfWithdraw(): Promise<void> {
    const app = ibiz.hub.getApp(this.view.context.srfappid);
    const data = this.form.state.data;
    const entityService = await app.deService.getService(
      this.view.context,
      this.view.model.appDataEntityId!,
    );
    await entityService.wf.exec(
      'withdraw',
      this.view.context,
      {
        ...this.view.params,
        taskId: this.view.params.taskId || this.view.params.srftaskid,
      },
      data instanceof ControlVO ? data.getOrigin() : data,
    );
    // 刷新预定义todo实体数据
    ibiz.mc.command.send(
      { srfdecodename: 'SysTodo' },
      'OBJECTUPDATED',
      'WITHDRAW',
    );
  }

  /**
   * 执行数据标记行为
   *
   * @memberof EditViewEngine
   */
  doMarkDataAction(): void {
    super.doMarkDataAction();
    if (this.doActions.includes('VIEW')) {
      this.form.evt.on('onLoadSuccess', () => this.sendViewDataAction());
    }
    if (this.doActions.includes('EDIT')) {
      let isWait = false;
      this.form.evt.on('onFormDataChange', () => {
        const data = this.form.getData()[0];
        if (isWait) {
          return;
        }
        isWait = true;
        this.sendMarkDataAction('EDIT', data.srfkey);
        setTimeout(
          () => {
            isWait = false;
          },
          1000 * 60 * 5,
        );
      });
    }
    if (this.doActions.includes('UPDATE')) {
      this.form.evt.on('onSaveSuccess', () => {
        const data = this.form.getData()[0];
        this.sendMarkDataAction('UPDATE', data.srfkey);
      });
    }
    if (this.doActions.includes('CLOSE')) {
      this.view.evt.on('onCloseView', () => {
        const data = this.form.getData()[0];
        if (data?.srfkey) {
          this.sendMarkDataAction('CLOSE', data.srfkey);
        }
      });
    }
  }

  /**
   * 刷新确认
   * @author lxm
   * @date 2024-02-06 11:40:36
   * @return {*}  {Promise<boolean>}
   */
  async reloadConfirm(): Promise<boolean> {
    const result = await super.reloadConfirm();
    if (result && this.form.state.modified) {
      return ibiz.confirm.warning({
        title: ibiz.i18n.t('viewEngine.refreshRemind'),
        desc: ibiz.i18n.t('viewEngine.confirmRefreshPrompt'),
      });
    }
    return result;
  }

  /**
   * 变更当前页面的数据
   * @author lxm
   * @date 2024-04-01 01:11:58
   * @param {string} type
   */
  async changeRecord(type: string): Promise<void> {
    const controlId = `${this.view.context.srfnavctrlid}`;
    if (!controlId) {
      throw new RuntimeError(ibiz.i18n.t('viewEngine.missingErr'));
    }
    const dataKey = this.form.state.data.srfkey;
    let targetItem: IData | undefined;
    switch (type) {
      case SysUIActionTag.FIRST_RECORD:
        targetItem = await ibiz.util.record.getFirstRecord(controlId, dataKey);
        break;
      case SysUIActionTag.LAST_RECORD:
        targetItem = await ibiz.util.record.getLastRecord(controlId, dataKey);
        break;
      case SysUIActionTag.PREV_RECORD:
        targetItem = await ibiz.util.record.getPreviousRecord(
          controlId,
          dataKey,
        );
        break;
      case SysUIActionTag.NEXT_RECORD:
        targetItem = await ibiz.util.record.getNextRecord(controlId, dataKey);
        break;
      default:
        break;
    }

    // 变更主键并加载
    if (targetItem) {
      const appDataEntity = await ibiz.hub.getAppDataEntity(
        this.form.model.appDataEntityId!,
        this.form.context.srfappid,
      );

      // 获取当前的srfparentkey和srfparentdename
      const { srfparentkey, srfparentdename } = await calcDynaSysParams(
        this.form.model.appDataEntityId!,
        this.view.context,
        {
          viewParams: this.view.params,
        },
      );
      // 多表单类型属性名称
      const typeFileName =
        appDataEntity.formTypeAppDEFieldId ||
        appDataEntity.dataTypeAppDEFieldId;
      // 视图参数
      const params = {
        srfdatatype: typeFileName ? targetItem[typeFileName] : undefined,
      };

      // 合并当前实体主键
      const context = await getDeDataMajorField(
        targetItem,
        this.view.context,
        this.form.model.appDataEntityId!,
      );
      context[this.deName] = targetItem.srfkey;

      // 基于若触发源导航参数仿真设置参数
      const logicId = `${this.view.context.srfnavlogicid}`;
      if (logicId) {
        const logicParams = ibiz.util.record.getTriggerLogic(logicId);
        const targetControl = ibiz.util.record.getCtrl(controlId);
        if (logicParams) {
          const { navContexts, navParams } = logicParams;
          if (navContexts) {
            Object.assign(
              context,
              convertNavData(
                navContexts!,
                targetItem,
                targetControl?.params || params,
                targetControl?.context || {},
              ),
            );
          }
          if (navParams) {
            Object.assign(
              params,
              convertNavData(
                navParams!,
                targetItem,
                targetControl?.params || params,
                targetControl?.context || {},
              ),
            );
          }
        }
      }
      // 合并参数
      Object.assign(this.view.context, context);
      Object.assign(this.view.params, params);
      // 如果视图启用动态模式且srfparentdename发生变更，重绘视图，重载模型
      if (
        srfparentdename &&
        this.view.model.dynaSysMode === 1 &&
        this.view.context[srfparentdename] !== srfparentkey
      ) {
        return this.view.redrawView({
          params,
          context: context as IContext,
          data: [targetItem],
          isReloadModel: true,
        });
      }
      // 如果视图启用内置多表单模式且srfdatatype发生变更，重绘视图
      // if (
      //   this.view.model.multiFormMode === 1 &&
      //   oldParams.srfdatatype !== params.srfdatatype
      // ) {
      return this.view.redrawView({
        params,
        context: context as IContext,
        data: [targetItem],
      });
      // }
      // 重新处理导航参数并刷新视图
      // this.view.handleContextParams();
    }
  }

  /**
   * 视图destroyed生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof EditViewEngine
   */
  async onDestroyed(): Promise<void> {
    super.onDestroyed();
    const { modal } = this.view;
    modal.hooks.preDismiss.removeTapPromise(this.modalPreDismissHook);
    modal.hooks.shouldDismiss.removeTapPromise(this.modalShouldDismissHook);
  }
}
