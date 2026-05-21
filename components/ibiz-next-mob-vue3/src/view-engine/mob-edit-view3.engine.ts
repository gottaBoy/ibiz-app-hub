import {
  IDRTabController,
  IEditView3Event,
  IEditView3State,
  ViewController,
  IViewController,
  SysUIActionTag,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';
import { MobEditViewEngine } from './mob-edit-view.engine';

/**
 * 编辑视图3（分页关系）
 *
 * @export
 * @class EditView3Engine
 * @extends {EditViewEngine}
 */
export class MobEditView3Engine extends MobEditViewEngine {
  declare protected view: ViewController<
    IAppDEEditView,
    IEditView3State,
    IEditView3Event
  >;

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('drtab');
  }

  /**
   * 数据分页栏
   *
   * @readonly
   * @memberof EditView3Engine
   */
  get drtab(): IDRTabController {
    return this.view.getController('drtab') as IDRTabController;
  }

  /**
   * @description 嵌入视图映射Map
   * @type {Map<string, IViewController>}
   * @memberof MobEditView3Engine
   */
  embedViewMap: Map<string, IViewController> = new Map();

  /**
   * @description 视图mounted生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof MobEditView3Engine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.view.layoutPanel?.evt.on('onPresetPanelItemEvent', (event: IData) => {
      if (!event?.presetParams?.view || !this.drtab?.state?.activeName) {
        return;
      }
      this.embedViewMap.set(
        this.drtab.state.activeName,
        event.presetParams.view,
      );
    });
  }

  /**
   * @description 刷新视图
   * @returns {*}  {Promise<void>}
   * @memberof MobEditView3Engine
   */
  async refresh(): Promise<void> {
    await super.refresh();
    if (!this.drtab?.state?.activeName) {
      return;
    }
    const activeView = this.embedViewMap.get(this.drtab.state.activeName);
    if (activeView) {
      activeView.call(SysUIActionTag.REFRESH);
    }
  }
}
