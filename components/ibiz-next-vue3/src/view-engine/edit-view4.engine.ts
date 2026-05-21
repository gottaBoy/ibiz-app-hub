import {
  IDRTabController,
  IEditView4Event,
  IEditView4State,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';
import { EditViewEngine } from './edit-view.engine';

/**
 * 编辑视图4（上下关系）
 *
 * @export
 * @class EditView4Engine
 * @extends {EditViewEngine}
 */
export class EditView4Engine extends EditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDEEditView,
   *     IEditView4State,
   *     IEditView4Event
   *   >}
   * @memberof EditView4Engine
   */
  declare protected view: ViewController<
    IAppDEEditView,
    IEditView4State,
    IEditView4Event
  >;

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('drtab');
    if (!this.view.slotProps.drtab) {
      this.view.slotProps.drtab = {};
    }
    // 编辑视图（上下关系）默认隐藏编辑项
    this.view.slotProps.drtab.hideEditItem = true;
  }

  /**
   * 数据分页栏
   *
   * @readonly
   * @memberof EditView4Engine
   */
  get drtab(): IDRTabController {
    return this.view.getController('drtab') as IDRTabController;
  }
}
