import { RuntimeModelError } from '@ibiz-template/core';
import {
  ViewController,
  IEditFormController,
  IWFDynaEditViewEvent,
  IWFDynaEditViewState,
  getControl,
  WFLink,
  IModalData,
  OpenAppViewCommand,
  IAppDEService,
  IToolbarController,
  getWFSubmitViewId,
  IApiMobWFDynaEditViewCall,
} from '@ibiz-template/runtime';
import { IAppDEMobWFDynaEditView, IDEEditForm } from '@ibiz/model-core';
import { createUUID } from 'qx-util';
import { WFActionButtonController } from '../panel-component/wf-action-button';
import { MobEditViewEngine } from './mob-edit-view.engine';

export class MobWFDynaEditViewEngine extends MobEditViewEngine {
  protected declare view: ViewController<
    IAppDEMobWFDynaEditView,
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
   * 当前激活表单模型
   *
   * @author lxm
   * @date 2022-09-29 17:09:44
   * @type {IDEEditForm}
   */
  processForm!: IDEEditForm;

  /**
   * 实体服务
   * @author lxm
   * @date 2023-06-19 07:09:38
   * @type {IAppDEService}
   */
  entityService!: IAppDEService;

  /**
   * 工作流links
   *
   * @author lxm
   * @date 2022-10-08 16:10:53
   * @type {WFLink[]}
   */
  wfLinks: WFLink[] = [];

  /**
   * 编辑表单控制器
   * @author lxm
   * @date 2023-06-19 06:39:59
   * @readonly
   * @type {IEditFormController}
   */
  get form(): IEditFormController {
    return this.view.getController(
      this.processForm.name!,
    ) as IEditFormController;
  }

  /**
   * 底部按钮
   *
   * @author zk
   * @date 2023-11-08 04:11:41
   * @readonly
   * @type {PanelButtonController}
   * @memberof MobWFDynaEditViewEngine
   */
  get footerButton(): WFActionButtonController {
    return this.view.layoutPanel!.panelItems
      .wf_action_button as WFActionButtonController;
  }

  /**
   * 工作流按钮所在的工具栏控制器
   * @author lxm
   * @date 2023-07-07 05:32:20
   * @readonly
   * @type {(IToolbarController | undefined)}
   */
  get wfToolbar(): IToolbarController | undefined {
    return this.rightToolbar;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();

    // 实体服务
    const app = ibiz.hub.getApp(this.view.context.srfappid);
    this.entityService = await app.deService.getService(
      this.view.context,
      this.view.model.appDataEntityId!,
    );

    // 第一次计算
    await this.calcProcessForm();
    const { childNames } = this.view;
    childNames.push(this.processForm.name!);
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    // 监听工具栏的额外按钮并执行
    this.wfToolbar?.evt.on('onClick', async event => {
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
    this.isEditable = res.data.isEditable === 'true';
    const processForm = res.data['process-mobform']
      ? `wfform_${res.data['process-mobform']}`
      : 'form';
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

    // 变更传给form插槽的模型prop
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
    if (!this.wfToolbar) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('viewEngine.missingToolbarModel'),
      );
    }
    this.wfToolbar?.clearExtraButtons();

    const res = await this.entityService.wf.getWFLink(
      Object.assign(this.view.context.clone(), {
        taskDefinitionKey: this.view.params.taskDefinitionKey,
      }),
      this.getData()[0].getOrigin(),
    );
    this.wfLinks = res.data as WFLink[];
    // 创建按钮唯一标识
    this.wfLinks.forEach((item: WFLink) => {
      item.id = item.id ? item.id : createUUID();
    });
    this.initFooterButton();
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

    const { sequenceflowmobform } = link;

    // 处理视图上下文
    const newContext = Object.assign(this.view.context.clone(), {
      isEditable: this.isEditable,
      processForm: sequenceflowmobform,
    });
    // 处理视图参数
    const newParams = {
      ...link,
    };

    // 查找工作流提交视图
    const submitView = getWFSubmitViewId(this.view.model, link);

    // *没有工作流操作视图的，自己提交工作流
    if (!submitView) {
      await this.form.wfSubmit({ viewParam: newParams });
      await this.view.closeView();
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
      // 刷新预定义todo实体数据
      ibiz.mc.command.send({ srfdecodename: 'SysTodo' }, 'OBJECTUPDATED');
      await this.view.closeView();
    }
  }

  async call(
    key: keyof IApiMobWFDynaEditViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === 'WFAction') {
      this.onLinkClick(args.id);
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 初始化工作流动态按钮
   *
   * @author zk
   * @date 2023-11-12 06:11:49
   * @protected
   * @memberof MobWFDynaEditViewEngine
   */
  protected initFooterButton(): void {
    const WFButtons = this.wfLinks.map(link => {
      return {
        id: link.id,
        caption: link.sequenceFlowName,
        buttonType: 'extra',
        tooltip: link.sequenceFlowName,
        name: link.sequenceFlowName,
      } as const;
    });
    this.footerButton.initWFButtons(WFButtons);
    // 加载完行为按钮 再显示底部区域
    if (this.wfLinks.length > 0 || this.footerToolbar) {
      const controller = this.viewLayoutPanel?.panelItems.view_footer;
      if (controller) {
        controller.state.visible = true;
      }
    }
  }
}
