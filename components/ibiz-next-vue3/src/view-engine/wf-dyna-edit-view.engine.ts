/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { RuntimeModelError } from '@ibiz-template/core';
import {
  ViewController,
  IWFDynaEditViewState,
  IWFDynaEditViewEvent,
  WFLink,
  IModalData,
  OpenAppViewCommand,
  IAppDEService,
  IEditFormController,
  getControl,
  getWFSubmitViewId,
} from '@ibiz-template/runtime';
import { IAppDEWFDynaEditView, IDEEditForm } from '@ibiz/model-core';
import { createUUID } from 'qx-util';
import { EditViewEngine } from './edit-view.engine';

export class WFDynaEditViewEngine extends EditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWFDynaEditView, IWFDynaEditViewState, IWFDynaEditViewEvent>}
   * @memberof WFDynaEditViewEngine
   */
  declare protected view: ViewController<
    IAppDEWFDynaEditView,
    IWFDynaEditViewState,
    IWFDynaEditViewEvent
  >;

  /**
   * 流程表单是否可编辑
   *
   * @author lxm
   * @date 2022-09-29 15:09:16
   * @type {boolean}
   */
  isEditable: boolean = false;

  /**
   * 是否计算工作流工具栏
   * @author lxm
   * @date 2023-06-20 06:33:37
   * @type {boolean}
   */
  isCalcWFToolbar: boolean = true;

  /**
   * 实体服务
   * @author lxm
   * @date 2023-06-19 07:09:38
   * @type {IAppDEService}
   */
  entityService!: IAppDEService;

  /**
   * 当前激活表单模型
   *
   * @author lxm
   * @date 2022-09-29 17:09:44
   * @type {IDEEditForm}
   */
  processForm!: IDEEditForm;

  get form(): IEditFormController {
    return this.view.getController(
      this.processForm.name!,
    ) as IEditFormController;
  }

  /**
   * 工作流links
   *
   * @author lxm
   * @date 2022-10-08 16:10:53
   * @type {WFLink[]}
   */
  wfLinks: WFLink[] = [];

  async onCreated(): Promise<void> {
    await super.onCreated();

    // 实体服务
    const app = ibiz.hub.getApp(this.view.context.srfappid);
    this.entityService = await app.deService.getService(
      this.view.context,
      this.view.model.appDataEntityId!,
    );

    // await this.prepareWFParams();

    // 第一次计算
    await this.calcProcessForm();
    const { childNames } = this.view;
    childNames.push(this.processForm.name!);
  }

  async onMounted(): Promise<void> {
    await super.onMounted();

    this.toolbar?.evt.on('onClick', async event => {
      if (event.buttonType === 'extra' && event.eventArg) {
        this.onLinkClick(event.eventArg);
      }
    });
  }

  async load(): Promise<IData> {
    const res = await super.load();
    if (this.isCalcWFToolbar) {
      this.calcWfToolbar();
    }
    return res;
  }

  /**
   * 刷新页面
   *
   * @author lxm
   * @date 2022-09-29 15:09:03
   * @returns {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    const previous = this.processForm;
    await this.calcProcessForm();
    // 表单没有变化的时候调用表单的刷新
    if (previous === this.processForm) {
      await super.refresh();
    }
  }

  /**
   * 计算流程步骤表单的名称
   * @author lxm
   * @date 2023-06-20 06:24:21
   * @return {*}  {Promise<string>}
   */
  async calcProcessFormName(): Promise<string> {
    const res = await this.entityService.wf.getWFStep(
      Object.assign(this.view.context.clone(), {
        ...this.view.params,
      }),
    );
    const data = res.data as IData;
    this.isEditable = data.isEditable === 'true';
    if (!this.isEditable) {
      if (
        data.hasOwnProperty('process-editmode') &&
        Number(data['process-editmode']) > 0
      ) {
        this.isEditable = true;
      }
    }
    const key = `process-${ibiz.env.isMob ? 'mob' : ''}form`;
    const processForm = data[key] ? `wfform_${data[key]}` : 'form';
    return processForm;
  }

  /**
   * 计算当前步骤的表单
   *
   * @author lxm
   * @date 2022-09-29 15:09:07
   * @returns {*}  {Promise<void>}
   */
  async calcProcessForm(): Promise<void> {
    const processForm = await this.calcProcessFormName();
    const formModel = getControl(this.view.model, processForm.toLowerCase());
    if (!formModel) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('viewEngine.noFoundFormModel', { name: processForm }),
      );
    }
    this.processForm = formModel;

    if (!this.view.slotProps.form) {
      this.view.slotProps.form = {};
    }
    this.view.slotProps.form.modelData = this.processForm;
  }

  /**
   * 计算工作流工具栏，需要在表单加载回来之后执行
   *
   * @author lxm
   * @date 2022-09-30 19:09:44
   * @returns {*}  {Promise<void>}
   */
  async calcWfToolbar(): Promise<void> {
    if (!this.toolbar) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('viewEngine.missingToolbarModel'),
      );
    }
    this.toolbar.clearExtraButtons();

    const app = ibiz.hub.getApp(this.view.context.srfappid);
    const entityService = await app.deService.getService(
      this.view.context,
      this.view.model.appDataEntityId!,
    );

    const res = await entityService.wf.getWFLink(
      Object.assign(this.view.context.clone(), {
        taskDefinitionKey: this.view.params.taskDefinitionKey,
      }),
      this.getData()[0].getOrigin(),
    );
    this.wfLinks = res.data as WFLink[];
    // 创建按钮唯一标识
    this.wfLinks.forEach((item: WFLink) => {
      item.id = createUUID();
    });
    const extraButtons = this.wfLinks.map(link => {
      return {
        id: link.id,
        appId: this.view.model.appId,
        caption: link.sequenceFlowName,
        buttonType: 'extra',
        tooltip: link.sequenceFlowName,
        showCaption: true,
      } as const;
    });
    this.toolbar.setExtraButtons('before', extraButtons);
  }

  /**
   * 工作流工具栏点击回调处理
   *
   * @author lxm
   * @date 2022-10-08 17:10:29
   * @param {id} link 点击按钮对应的id
   * @returns {*}  {Promise<void>}
   */
  async onLinkClick(id: string): Promise<void> {
    const link = this.wfLinks.find(wfLink => {
      return wfLink.id === id;
    });
    if (link) {
      return this.wfSubmitByLink(link);
    }
  }

  /**
   * 根据工作流link处理工作流提交
   *
   * @param {WFLink} link
   * @returns {*}
   * @memberof WFDynaEditViewController
   */
  async wfSubmitByLink(link: WFLink): Promise<void> {
    // 流程表单可以编辑才会先保存
    if (this.isEditable) {
      await this.save({ silent: true });
    }

    // 处理视图上下文
    const newContext = Object.assign(this.view.context.clone(), {
      isEditable: this.isEditable,
      processForm: link.sequenceflowform,
    });
    // 处理视图参数
    const newParams = {
      ...link,
    };

    const submitView = getWFSubmitViewId(this.view.model, link);

    // *没有工作流操作视图的，自己提交工作流
    if (!submitView) {
      await this.form.wfSubmit({ viewParam: newParams });
      await this.view.closeView({ ok: true, data: this.form.getData() });
      return;
    }

    // *有工作流操作视图的，由提交视图执行工作流提交
    const result: IModalData = await ibiz.commands.execute(
      OpenAppViewCommand.TAG,
      submitView,
      newContext,
      newParams,
    );

    // 提交视图正常关闭后关闭当前视图
    if (result.ok) {
      await this.view.closeView({ ok: true, data: this.form.getData() });
    }
  }
}
