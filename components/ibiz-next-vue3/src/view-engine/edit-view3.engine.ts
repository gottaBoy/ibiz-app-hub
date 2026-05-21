import {
  IDRTabController,
  IEditView3Event,
  IEditView3State,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';
import { EditViewEngine } from './edit-view.engine';

/**
 * 编辑视图3（分页关系）
 *
 * @export
 * @class EditView3Engine
 * @extends {EditViewEngine}
 */
export class EditView3Engine extends EditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDEEditView,
   *     IEditView3State,
   *     IEditView3Event
   *   >}
   * @memberof EditView3Engine
   */
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
}
