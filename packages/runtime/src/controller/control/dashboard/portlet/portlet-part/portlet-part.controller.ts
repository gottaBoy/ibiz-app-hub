import { IDBPortletPart, IUIActionGroupDetail } from '@ibiz/model-core';
import { merge } from 'lodash-es';
import {
  Namespace,
  IBizParams,
  IBizContext,
  listenJSEvent,
} from '@ibiz-template/core';
import {
  IController,
  DataChangeEvent,
  IControlController,
  IPortletController,
  IDashboardController,
  IPortletContainerController,
} from '../../../../../interface';
import {
  calcLayoutHeightWidth,
  calcDynaClass,
  getAllUIActionItems,
} from '../../../../../model';
import { ControlVO } from '../../../../../service';
import { UIActionUtil } from '../../../../../ui-action';
import { ButtonContainerState, UIActionButtonState } from '../../../../utils';
import { PortletPartState } from './portlet-part.state';
import { SysUIActionTag } from '../../../../../constant';

/**
 * 门户部件控制器基类
 *
 * @author lxm
 * @date 2022-10-20 20:10:25
 * @export
 * @class PortletPartController
 * @template T
 */
export class PortletPartController<T extends IDBPortletPart = IDBPortletPart>
  implements IPortletController
{
  readonly model: T;

  /**
   * 门户部件状态
   *
   * @type {PortletPartState}
   * @memberof PortletPartController
   */
  state: PortletPartState;

  /**
   * 数据看板控制器
   *
   * @author lxm
   * @date 2022-10-21 03:10:04
   * @type {IDashboardController}
   */
  readonly dashboard: IDashboardController;

  /**
   * 父容器控制器，最上级的没有
   *
   * @author lxm
   * @date 2022-10-21 03:10:05
   * @type {ContainerPortletController}
   */
  readonly parent?: IPortletContainerController;

  /**
   * 门户部件的上下文参数
   *
   * @author lxm
   * @date 2022-10-23 16:10:50
   * @readonly
   * @type {IContext}
   */
  get context(): IContext {
    return this.state.context;
  }

  /**
   * 门户部件的视图参数
   *
   * @author lxm
   * @date 2022-10-23 16:10:21
   * @type {IParams}
   */
  public params: IParams;

  /**
   * 门户配置
   *
   * @type {IData}
   * @memberof PortletPartController
   */
  public config: IData = {};

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
   * 内容控制器
   * @author zzq
   * @readonly
   * @type {IController | undefined}
   * @memberof PortletPartController
   */
  get contentController(): IController | undefined {
    const { contentControlId } = this.model;
    if (contentControlId) {
      return this.dashboard.getController(contentControlId);
    }
  }

  /**
   * @description 内容元素
   * @readonly
   * @type {(HTMLDivElement | null)}
   * @memberof PortletPartController
   */
  get contentElement(): HTMLDivElement | null {
    if (this.contentController) {
      const { codeName = '' } = this.contentController.model;
      if (codeName) {
        const ns = new Namespace('control', ibiz.env.namespace);
        return document.querySelector(`.${ns.m(codeName)}`);
      }
    }
    return null;
  }

  /**
   * Creates an instance of PortletPartController.
   * @author lxm
   * @date 2022-10-21 10:10:44
   * @param {T} model
   * @param {DashboardController} dashboard 数据看板控制器
   * @param {IPortletContainerController} [parent] 父容器控制器，最上级不存在
   */
  constructor(
    model: T,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ) {
    this.model = model;
    this.dashboard = dashboard;
    this.parent = parent;
    this.state = this.createState();
    this.state.context = IBizContext.create({}, this.dashboard.context);
    const tempParams = this.getExtendParams();
    if (tempParams) {
      this.params = new IBizParams(
        {},
        { srfsearchconds: tempParams, ...this.dashboard.params },
      );
    } else {
      this.params = new IBizParams({}, this.dashboard.params);
    }
  }

  /**
   * 计算视图参数
   *
   * @author tony001
   * @date 2024-07-28 11:07:16
   * @return {*}  {IBizParams}
   */
  getExtendParams(): IParams | undefined {
    const data = this.dashboard.getExtendParamsById(this.model.id!);
    return data.params;
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

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-07-26 21:07:05
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async onInit(): Promise<void> {
    this.onDataChange = this.onDataChange.bind(this);

    // 初始化布局参数
    const { layoutPos, sysCss, title, titleLanguageRes } = this.model;

    // 初始化高宽
    if (layoutPos) {
      const { width, height } = calcLayoutHeightWidth(this.model);
      this.state.layout.width = `${width}`;
      this.state.layout.height = `${height}`;
    }

    if (sysCss?.cssName) {
      this.state.class.container.push(sysCss.cssName);
    }

    // 初始化标题
    if (titleLanguageRes) {
      this.state.title = ibiz.i18n.t(titleLanguageRes.lanResTag!, title);
    } else {
      this.state.title = title;
    }

    this.config = { srftitle: this.state.title };
    Object.assign(this.params, this.config);

    await this.initActionStates();
  }

  /**
   * 创建门户控件的状态对象
   *
   * @protected
   * @returns {*}  {PortletPartState}
   * @memberof PortletPartController
   */
  protected createState(): PortletPartState {
    return new PortletPartState();
  }

  /**
   * 刷新
   *
   * @author tony001
   * @date 2024-07-23 22:07:02
   * @return {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    const extendParams = this.getExtendParams();
    if (!extendParams) return;
    if (!this.params.srfsearchconds) {
      this.params.srfsearchconds = extendParams;
    } else {
      Object.assign(this.params, { srfsearchconds: extendParams });
    }
  }

  /**
   * 高亮
   *
   * @author zzq
   * @date 2024-07-29 18:07:02
   * @return {*}  {void}
   */
  hightLight(): void {
    this.state.hightLight = true;
    const cleanup = listenJSEvent(
      document.body,
      'click',
      () => {
        this.state.hightLight = false;
        cleanup();
      },
      { capture: true, once: true },
    );
  }

  /**
   * 设置配置数据
   *
   * @param {IData} config
   * @memberof PortletPartController
   */
  async setConfig(config: IData): Promise<void> {
    this.config = config;
    if (config.srftitle) {
      this.state.title = config.srftitle;
    }
    merge(this.params, config);
    this.dashboard.evt.emit('onConfigChange', {
      name: this.model.id!,
      config: this.config,
    });
  }

  /**
   * 重置自定义配置
   *
   * @memberof PortletPartController
   */
  resetConfig(): void {
    const { title, titleLanguageRes } = this.model;
    this.params = new IBizParams({}, this.dashboard.params);
    // 初始化标题
    if (titleLanguageRes) {
      this.state.title = ibiz.i18n.t(titleLanguageRes.lanResTag!, title);
    } else {
      this.state.title = title;
    }

    this.config = { srftitle: this.state.title };
    Object.assign(this.params, this.config);
  }

  /**
   * 数据改变方法
   * @param {DataChangeEvent} event
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-09-22 17:39:44
   */
  onDataChange(event: DataChangeEvent): void {
    let data = event.data[0];
    if (data && data instanceof ControlVO) {
      data = data.getOrigin();
    }
    if (data) {
      this.state.actionGroupState!.update(
        this.context,
        data,
        this.dashboard.view.model.appDataEntityId!,
      );
    }
  }

  /**
   * 初始化标题右侧界面行为按钮的状态
   *
   * @author chitanda
   * @date 2023-08-02 17:08:04
   * @return {*}  {Promise<void>}
   */
  async initActionStates(): Promise<void> {
    // 操作列按钮状态控制
    const { uiactionGroup } = this.model;
    if (!uiactionGroup?.uiactionGroupDetails?.length) return;
    const containerState = new ButtonContainerState();
    const actions = getAllUIActionItems(uiactionGroup.uiactionGroupDetails);
    actions.forEach(detail => {
      const actionid = detail.uiactionId;
      if (actionid) {
        const buttonState = new UIActionButtonState(
          detail.id!,
          this.dashboard.context.srfappid!,
          actionid,
          detail,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    const viewData = this.dashboard.view.state.srfactiveviewdata || undefined;
    await containerState.update(this.dashboard.context, viewData);
    this.state.actionGroupState = containerState;

    // 实体门户视图监听视图数据变更，刷新界面行为组的状态。
    const { appDataEntityId } = this.dashboard.view.model;
    if (appDataEntityId) {
      this.dashboard.view.evt.on('onDataChange', this.onDataChange);
    }
  }

  /**
   * 触发操作列点击事件
   *
   * @author lxm
   * @date 2022-09-07 22:09:46
   * @param {IPSUIActionGroupDetail} detail
   * @param {MouseEvent} event
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
    data: IData[] = [],
  ): Promise<void> {
    const actionId = detail.uiactionId;
    const eventArgs = {
      context: this.context,
      params: this.params,
      data,
      view: this.dashboard.view,
      ctrl: this as unknown as IControlController,
      event,
    };
    const result = await UIActionUtil.exec(actionId!, eventArgs, detail.appId);
    if (result.closeView) {
      this.dashboard.view.closeView();
    } else if (result.refresh) {
      switch (result.refreshMode) {
        // 刷新当前节点的子
        case 1:
          this.refresh();
          break;
        // 刷新当前节点的父节点的子
        case 2:
          this.dashboard.view?.callUIAction(SysUIActionTag.REFRESH);
          break;
        // 刷新所有节点数据
        case 3:
          this.dashboard.view
            .getTopView()
            ?.callUIAction(SysUIActionTag.REFRESH);
          break;
        default:
      }
    }
  }

  /**
   * 表单数据变更通知(由表单控制器调用)
   *
   * @author lxm
   * @date 2022-09-20 18:09:56
   * @param {string[]} names
   */
  async dataChangeNotify(data: IData): Promise<void> {
    // 计算界面行为组状态
    if (this.state.actionGroupState) {
      const { appDataEntityId } = this.dashboard.view.model;
      this.state.actionGroupState.update(this.context, data, appDataEntityId);
    }

    // 计算动态样式表
    this.calcDynaClass(data);
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
  }

  /**
   * 销毁
   * @author lxm
   * @date 2023-04-25 11:08:54
   */
  async destroyed(): Promise<void> {
    ibiz.log.debug(`${this.model.codeName} onDestroyed`);
    this.dashboard.view.evt.off('onDataChange', this.onDataChange);
  }
}
