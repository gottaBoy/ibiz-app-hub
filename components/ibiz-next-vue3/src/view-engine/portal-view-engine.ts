/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ViewController,
  IPortalViewState,
  IPortalViewEvent,
  SysUIActionTag,
  IDashboardController,
  DEMainViewEngine,
  IApiPortalViewCall,
  calcDeCodeNameById,
} from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';

export class PortalViewEngine extends DEMainViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppView, IAppPortalViewState, IAppPortalViewEvent>}
   * @memberof PortalViewEngine
   */
  declare protected view: ViewController<
    IAppView,
    IPortalViewState,
    IPortalViewEvent
  >;

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof PortalViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('dashboard');
  }

  /**
   * 数据看板部件
   *
   * @readonly
   * @memberof PortalViewEngine
   */
  get dashboard(): IDashboardController {
    return this.view.getController('dashboard') as IDashboardController;
  }

  /**
   * 视图刷新
   *
   * @return {*}  {Promise<void>}
   * @memberof PortalViewEngine
   */
  async refresh(): Promise<void> {
    await this.dashboard.refresh();
  }

  /**
   * 主数据
   *
   * @protected
   * @return {*}  {IData[]}
   * @memberof PortalViewEngine
   */
  protected getData(): IData[] {
    return this.view.state.srfactiveviewdata
      ? [this.view.state.srfactiveviewdata]
      : [];
  }

  async call(
    key: keyof IApiPortalViewCall,
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      if (args.ctrl) {
        await args.ctrl.refresh();
      } else {
        await this.refresh();
      }
      return null;
    }
    return super.call(key, args);
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    // 实体看板视图加载主数据
    if (this.view.model.appDataEntityId) {
      const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
      if (!this.view.context[deName]) {
        return;
      }
      await this.loadEntityData();
    }
  }

  /**
   * 执行标记数据行为
   *
   * @memberof PortalViewEngine
   */
  doMarkDataAction(): void {
    super.doMarkDataAction();
    if (this.doActions.includes('VIEW')) {
      this.view.evt.on('onDataChange', () => this.sendViewDataAction());
    }
    if (this.doActions.includes('EDIT')) {
      let isWait = false;
      this.dashboard.evt.on('onConfigChange', () => {
        const data = this.getData()[0];
        if (!data?.srfkey || isWait) {
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
      this.dashboard.evt.on('onSavePortlet', () => {
        const data = this.getData()[0];
        if (data?.srfkey) {
          this.sendMarkDataAction('UPDATE', data?.srfkey);
        }
      });
    }
  }
}
