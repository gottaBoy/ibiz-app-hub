import { ISearchFormController } from '../../interface';
import { CtrlEngineBase } from './ctrl-base.engine';

/**
 * @description 搜索部件加载并搜索（参数可指定触发部件）
 * @export
 * @class CtrlLoadAndSearchEngine
 * @extends {CtrlEngineBase}
 */
export class CtrlLoadAndSearchEngine extends CtrlEngineBase {
  /**
   * @description 视图mounted生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof CtrlLoadAndSearchEngine
   */
  async onMounted(): Promise<void> {
    super.onMounted();
    if (
      this.resourceCtrl &&
      (this.resourceCtrl as ISearchFormController).load &&
      (this.resourceCtrl as ISearchFormController).load instanceof Function
    ) {
      (this.resourceCtrl as ISearchFormController).evt.on('onMounted', () => {
        (this.resourceCtrl as ISearchFormController).load();
      });
    }
  }
}
