/* eslint-disable no-restricted-syntax */
import {
  ViewController,
  IWFDynaEditView3State,
  IWFDynaEditView3Event,
  IDRTabController,
} from '@ibiz-template/runtime';
import { IAppDEWFDynaEditView } from '@ibiz/model-core';
import { WFDynaEditViewEngine } from './wf-dyna-edit-view.engine';

export class WFDynaEditView3Engine extends WFDynaEditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWFDynaEditView3, IWFDynaEditView3State, IWFDynaEditView3Event>}
   * @memberof WFDynaEditView3Engine
   */
  declare protected view: ViewController<
    IAppDEWFDynaEditView,
    IWFDynaEditView3State,
    IWFDynaEditView3Event
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
}
