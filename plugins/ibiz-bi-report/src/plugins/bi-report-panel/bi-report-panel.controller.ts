import { RuntimeError } from '@ibiz-template/core';
import { IDEToolbar } from '@ibiz/model-core';
import {
  PanelItemController,
  calcDeCodeNameById,
} from '@ibiz-template/runtime';
import { clone } from 'ramda';

export class BIReportPanelController extends PanelItemController {
  /**
   * BI报表配置
   *
   * @author zhanghengfeng
   * @date 2024-07-02 14:07:34
   * @type {IData}
   */
  config: IData = {};

  /**
   * 上下文
   *
   * @author zhanghengfeng
   * @date 2024-07-02 14:07:53
   * @type {IContext}
   */
  context!: IContext;

  /**
   * BI报表key
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:45
   * @type {string}
   */
  reportKey: string = '';

  /**
   * @description 指标工具栏
   * @type {(IDEToolbar | null)}
   * @memberof BIReportPanelController
   */
  measureToolbar: IDEToolbar | null = null;

  /**
   * @description 维度工具栏
   * @type {(IDEToolbar | null)}
   * @memberof BIReportPanelController
   */
  dimensionToolbar: IDEToolbar | null = null;

  /**
   * 初始化BI报表key
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:16
   */
  initReportKey(): void {
    const appDataEntityId = this.panel.view.model?.appDataEntityId;
    if (appDataEntityId) {
      this.reportKey = calcDeCodeNameById(appDataEntityId);
    }
    const editorParams = (this.model as IData)?.editor?.editorParams;
    if (editorParams && editorParams.appDataEntityId) {
      this.reportKey = editorParams.appDataEntityId;
    }
  }

  /**
   * @description 初始化维度指标工具栏
   * @memberof BIReportPanelController
   */
  initToolbar(): void {
    const model = this.panel.view.model;
    const controls = model.viewLayoutPanel?.controls || [];
    this.measureToolbar = controls.find(
      x => x.controlType === 'TOOLBAR' && x.name === 'measure_toolbar',
    ) as IDEToolbar;
    this.dimensionToolbar = controls.find(
      x => x.controlType === 'TOOLBAR' && x.name === 'dimension_toolbar',
    ) as IDEToolbar;
  }

  /**
   * 初始化
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:40
   * @return {*}  {Promise<void>}
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.initReportKey();
    this.initToolbar();
    const tempContext: IContext = clone(this.panel.context);
    Object.assign(tempContext, { pssysbireport: tempContext[this.reportKey] });
    this.context = tempContext;
    const app = ibiz.hub.getApp(tempContext.srfappid!);
    try {
      this.panel.view.startLoading();
      const res = await app.deService.exec(
        'pssysbireport',
        'get',
        tempContext,
        this.panel.params,
      );
      if (res.data) {
        // 修正appid，适配多应用场景
        const appId = res.data.pssysappid;
        if (appId) {
          const mainApp = ibiz.hub.getApp(ibiz.env.appId);
          // 主应用上下文的srfappid应该等于主应用appId
          if (appId === mainApp.id && this.context.srfappid !== mainApp.appId) {
            this.context.srfappid = mainApp.appId;
          } else {
            // 子应用上下文的srfappid应该等于子应用id
            const targetApp = mainApp.model.subAppRefs?.find(subAppRef => {
              return subAppRef.id?.endsWith(appId);
            });
            if (
              targetApp &&
              targetApp.id &&
              targetApp.id !== this.context.srfappid
            ) {
              this.context.srfappid = targetApp.id;
            }
          }
        }
        const tempConfig = await ibiz.util.biReport.translateDEReportToConfig(
          res.data,
        );
        // 报表标识
        if (this.panel.params.srfreporttag) {
          tempConfig.reportTag = this.panel.params.srfreporttag;
        }
        // 报表体系标识
        if (this.panel.params.srfbischematag) {
          tempConfig.selectedSchemeId = this.panel.params.srfbischematag;
        }
        this.config = tempConfig;
      }
    } catch (error: unknown) {
      throw new RuntimeError((error as IData).message);
    } finally {
      this.panel.view.endLoading();
    }
  }
}
