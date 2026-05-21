import { RuntimeError } from '@ibiz-template/core';
import {
  ViewController,
  IWFStepTraceViewState,
  IWFStepTraceViewEvent,
  ViewEngineBase,
  IAppDEService,
} from '@ibiz-template/runtime';
import { IAppDEWFDynaEditView } from '@ibiz/model-core';
import { WFStepTraceController } from '../panel-component/wf-step-trace';

export class WFStepTraceViewEngine extends ViewEngineBase {
  declare protected view: ViewController<
    IAppDEWFDynaEditView,
    IWFStepTraceViewState,
    IWFStepTraceViewEvent
  >;

  /**
   * 实体服务
   *
   * @author zk
   * @date 2023-07-04 10:07:42
   * @protected
   * @type {IAppDEService}
   * @memberof WFStepTraceViewEngine
   */
  protected entityService!: IAppDEService;

  /**
   * 导航占位控制器
   *
   * @readonly
   * @type {(NavPosController | undefined)}
   * @memberof WFStepTraceViewEngine
   */
  get WFStepTrace(): WFStepTraceController | undefined {
    return this.viewLayoutPanel?.panelItems
      .wf_wfsteptrace as WFStepTraceController;
  }

  /**
   * 生命周期-组件加载完成
   *
   * @author zk
   * @date 2023-07-04 10:07:18
   * @memberof WFStepTraceViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    const appDataEntityId = this.view.parentView?.model.appDataEntityId;
    if (!appDataEntityId) {
      throw new RuntimeError(ibiz.i18n.t('viewEngine.notReceivedPrompt'));
    }
    const app = ibiz.hub.getApp(this.view.context.srfappid);
    this.entityService = await app.deService.getService(
      this.view.context,
      appDataEntityId,
    );
    await this.load();
  }

  /**
   * 加载数据
   *
   * @author zk
   * @date 2023-07-04 10:07:36
   * @return {*}
   * @memberof WFStepTraceViewEngine
   */
  async load(): Promise<void> {
    const res = await this.entityService.wf.getWFHistory(this.view.context);
    if (res.data) {
      this.WFStepTrace?.setData(res.data);
    }
  }
}
