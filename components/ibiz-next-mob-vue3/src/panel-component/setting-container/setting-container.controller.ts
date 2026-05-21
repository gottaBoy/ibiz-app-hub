import {
  IMobMDCtrlController,
  ISearchBarController,
  ISearchFormController,
  PanelContainerController,
} from '@ibiz-template/runtime';
import { IAppDEMultiDataView, IPanelContainer } from '@ibiz/model-core';

/**
 * @description 设置容器控制器
 * @primary
 * @export
 * @class SettingContainerController
 * @extends {PanelContainerController<IPanelContainer>}
 */
export class SettingContainerController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 多数据部件控制器
   * @readonly
   * @type {IMobMDCtrlController}
   * @memberof SettingContainerController
   */
  get mdctrl(): IMobMDCtrlController {
    const { view } = this.panel;
    return (view.getController('mdctrl') ||
      view.getController('dataview')) as IMobMDCtrlController;
  }

  /**
   * @description 是否显示排序按钮
   * @readonly
   * @type {boolean}
   * @memberof SettingContainerController
   */
  get isMDSortButton(): boolean {
    return !!(this.mdctrl?.state.sortDelistItems.length > 0);
  }

  /**
   * 是否有快速搜索栏
   *
   * @readonly
   * @type {boolean}
   * @memberof SettingContainerController
   */
  get searchbar(): ISearchBarController | undefined {
    return this.panel.view.getController('searchbar') as ISearchBarController;
  }

  /**
   * @description 是否可见
   * @readonly
   * @type {boolean}
   * @memberof SettingContainerController
   */
  get visible(): boolean {
    if (!this.searchbar || !this.searchbar.model.enableQuickSearch) {
      return false;
    }
    return (
      this.isMDSortButton ||
      (!!this.searchform &&
        !(this.panel.view.model as IAppDEMultiDataView).expandSearchForm)
    );
  }

  /**
   * @description 搜索表单控制器
   * @readonly
   * @type {ISearchFormController}
   * @memberof SettingContainerController
   */
  get searchform(): ISearchFormController {
    return this.panel.view.getController('searchform') as ISearchFormController;
  }

  /**
   * 是否显示高级搜索按钮，存在搜索表单并且搜索表单不是默认展开时显示
   *
   * @readonly
   * @type {boolean}
   * @memberof SettingContainerController
   */
  get isMDSearchformBtn(): boolean {
    return (
      !!this.searchform &&
      !(this.panel.view.model as IAppDEMultiDataView).expandSearchForm
    );
  }
}
