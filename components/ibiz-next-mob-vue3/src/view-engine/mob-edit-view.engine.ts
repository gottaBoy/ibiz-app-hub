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
  ViewEngineBase,
  IToolbarController,
  OpenAppViewCommand,
  getAppViewRef,
  IModalData,
  ViewCallTag,
  FormSaveParams,
  IApiMobEditViewCall,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';

export class MobEditViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   */
  declare protected view: ViewController<
    IAppDEEditView,
    IEditViewState,
    IEditViewEvent
  >;

  get form(): IEditFormController {
    return this.view.getController('form') as IEditFormController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames, modal } = this.view;
    childNames.push('form');

    modal.hooks.shouldDismiss.tapPromise(async context => {
      if (this.form.state.modified) {
        const isAllow = await ibiz.modal.confirm({
          title: ibiz.i18n.t('viewEngine.closeRemind'),
          desc: ibiz.i18n.t('viewEngine.confirmClosePrompt'),
        });
        if (!isAllow) {
          context.allowClose = false;
          // return null;
        }
      }
    });

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
  }

  /**
   * 获取所有的工具栏控制器
   * @author lxm
   * @date 2023-06-30 04:06:17
   * @protected
   * @return {*}  {IToolbarController[]}
   */
  protected getAllToolbars(): IToolbarController[] {
    const toolbars: IToolbarController[] = [];
    if (this.leftToolbar) {
      toolbars.push(this.leftToolbar);
    }
    if (this.rightToolbar) {
      toolbars.push(this.rightToolbar);
    }
    if (this.footerToolbar) {
      toolbars.push(this.footerToolbar);
    }
    return toolbars;
  }

  /**
   * 更新工具栏状态
   * @author lxm
   * @date 2023-06-30 04:04:15
   * @protected
   * @param {IData} data
   * @param {string} appDeId
   */
  protected updateToolbarState(data: IData, appDeId?: string): void {
    this.getAllToolbars().forEach(toolbar => {
      toolbar.calcButtonState(data, appDeId);
    });
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model, evt } = this.view;

    // 监控form事件
    const formDeId = this.form.model.appDataEntityId;
    const formDataStateChange = (event: EventBase) => {
      const data = event.data[0];
      this.updateToolbarState(data, formDeId);
      const info: IData = {};
      info.dataInfo = data.srfmajortext || '';
      evt.emit('onViewInfoChange', info);
    };

    this.form.evt.on('onLoadSuccess', event => {
      formDataStateChange(event);
      // 更新视图作用域数据和srfreadonly数据
      const data = event.data[0];
      this.view.state.srfactiveviewdata = data;
      if (Object.prototype.hasOwnProperty.call(data, 'srfreadonly')) {
        this.view.context.srfreadonly = data.srfreadonly;
      }
      evt.emit('onDataChange', { ...event, actionType: 'LOAD' });
    });
    this.form.evt.on('onLoadDraftSuccess', event => {
      formDataStateChange(event);
      evt.emit('onDataChange', { ...event, actionType: 'LOADDRAFT' });
    });
    this.form.evt.on('onSaveSuccess', event => {
      const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
      const formData = event.data[0];
      if (this.view.context[deName] !== formData.srfkey) {
        this.view.context[deName] = formData.srfkey;
      }
      formDataStateChange(event);
      evt.emit('onDataChange', { ...event, actionType: 'SAVE' });
    });
    this.form.evt.on('onRemoveSuccess', event => {
      formDataStateChange(event);
      evt.emit('onDataChange', { ...event, actionType: 'REMOVE' });
    });

    if (!this.view.state.noLoadDefault && model.loadDefault) {
      this.load();
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
    await this.load();
    // this.view.evt.emit('refreshed', [data]);
  }

  async call(
    key: keyof IApiMobEditViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
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
    if (key === SysUIActionTag.VIEW_WF_STEP) {
      await this.wfSubmit();
      return null;
    }
    if (key === ViewCallTag.WF_WITHDRAW) {
      await this.wfWithdraw();
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
   * @memberof MobEditViewEngine
   */
  async saveAndNew(): Promise<null> {
    await this.form.save();
    this.form.state.data = new ControlVO();
    // 置空主键
    this.view.context[calcDeCodeNameById(this.view.model.appDataEntityId!)] =
      undefined;
    await this.form.load();
    return null;
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

    const app = ibiz.hub.getApp(this.view.context.srfappid);
    const entityService = await app.deService.getService(
      this.view.context,
      this.view.model.appDataEntityId!,
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
    await entityService.wf.wfWithdraw(
      this.view.context,
      {
        ...this.view.params,
        taskId: this.view.params.taskId || this.view.params.srftaskid,
      },
      data instanceof ControlVO ? data.getOrigin() : data,
    );
    // 刷新预定义todo实体数据
    ibiz.mc.command.send({ srfdecodename: 'SysTodo' }, 'OBJECTUPDATED');
  }

  /**
   * @description 取消变更
   * @param {({
   *       targetState: 'INIT' | 'UNDO' | 'REDO';
   *     })} [_args={ targetState: 'INIT' }] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof MobEditViewEngine
   */
  async cancelChanges(
    _args: {
      targetState: 'INIT' | 'UNDO' | 'REDO';
    } = { targetState: 'INIT' },
  ): Promise<void> {
    await super.cancelChanges(_args);
    await this.form.cancelChanges(_args.targetState);
  }
}
