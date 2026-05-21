import {
  IAppView,
  IViewLayoutPanel,
  IAppIndexView,
  IAppDETabExplorerView,
  IDEMultiEditViewPanel,
} from '@ibiz/model-core';
import { clone } from 'ramda';
import { getControl } from '../../model';

/**
 * 布局面板工具类
 *
 * @author chitanda
 * @date 2023-07-31 19:07:49
 * @export
 * @class LayoutPanelUtil
 */
export class LayoutPanelUtil {
  /**
   * 默认布局缓存
   *
   * @author chitanda
   * @date 2023-04-27 20:04:50
   * @protected
   * @type {Map<string, IViewLayoutPanel>}
   */
  protected cache: Map<string, IViewLayoutPanel> = new Map();

  /**
   * 注册
   *
   * @author chitanda
   * @date 2023-04-27 20:04:04
   * @param {string} tag
   * @param {IViewLayoutPanel} model
   */
  register(tag: string, model: IViewLayoutPanel): void {
    this.cache.set(tag, model);
  }

  /**
   * 获取
   * @author lxm
   * @date 2023-07-31 02:48:37
   * @param {string} tag
   * @return {*}  {(IViewLayoutPanel | undefined)}
   */
  get(tag: string): IViewLayoutPanel | undefined {
    return this.cache.get(tag);
  }

  /**
   * 填充默认布局模型
   *
   * @author chitanda
   * @date 2023-04-27 20:04:16
   * @param {IAppView} viewModel
   * @return {*}  {IAppView}
   */
  fill(viewModel: IAppView): IAppView {
    const { viewLayoutPanel } = viewModel;
    if (!viewLayoutPanel || viewLayoutPanel.useDefaultLayout === true) {
      const tag = this.calcLayoutTag(viewModel);
      if (this.cache.has(tag)) {
        const layout = clone(this.cache.get(tag)!);
        viewModel.viewLayoutPanel = layout;
        if (viewModel.appCounterRefs) {
          layout.appCounterRefs = viewModel.appCounterRefs;
          delete viewModel.appCounterRefs;
        }
        if (viewModel.appViewEngines) {
          layout.appViewEngines = viewModel.appViewEngines;
          delete viewModel.appViewEngines;
        }
        if (viewModel.appViewLogics) {
          layout.appViewLogics = viewModel.appViewLogics;
          delete viewModel.appViewLogics;
        }
        if (viewModel.appViewRefs) {
          layout.appViewRefs = viewModel.appViewRefs;
          delete viewModel.appViewRefs;
        }
        if (viewModel.controls) {
          layout.controls = viewModel.controls;
          delete viewModel.controls;
        }
      }
    }
    return viewModel;
  }

  /**
   * 计算布局面板标识
   *
   * @author chitanda
   * @date 2023-07-10 17:07:38
   * @protected
   * @param {IAppView} viewModel
   * @return {*}  {string}
   */
  protected calcLayoutTag(viewModel: IAppView): string {
    const { viewType, viewStyle } = viewModel;
    switch (viewType) {
      case 'APPINDEXVIEW':
        return this.calcIndexViewLayoutTag(viewModel);
      case 'DETABEXPVIEW':
        return this.calcTabExpViewLayoutTag(viewModel);
      case 'DEMEDITVIEW9':
        return this.calcDEMedViewLayoutTag(viewModel);
      case 'DEMOBTABEXPVIEW':
        return this.calcTabExpViewLayoutTag(viewModel);
      default:
        return `${viewType}_${viewStyle}`;
    }
  }

  /**
   * @description 特殊计算分页导航视图布局面板标识，匹配流式布局
   * @protected
   * @param {IAppView} viewModel
   * @returns {*}  {string}
   * @memberof LayoutPanelUtil
   */
  protected calcTabExpViewLayoutTag(viewModel: IAppView): string {
    const { tabLayout, viewType, viewStyle } =
      viewModel as IAppDETabExplorerView;
    if (tabLayout === 'FLOW' || tabLayout === 'FLOW_NOHEADER') {
      return `${viewType}_FLOW`;
    }
    return `${viewType}_${viewStyle}`;
  }

  /**
   * 特殊计算首页布局面板标识，匹配多种配置模式下的布局面板呈现
   *
   * @author chitanda
   * @date 2023-07-10 17:07:06
   * @protected
   * @param {IAppIndexView} viewModel
   * @return {*}  {string}
   */
  protected calcIndexViewLayoutTag(viewModel: IAppIndexView): string {
    const { viewType, viewStyle, blankMode, mainMenuAlign } = viewModel;
    let exTag: string = '';
    // 空白模式优先级最高
    if (blankMode) {
      exTag = 'BLANK_MODE';
    } else if (mainMenuAlign) {
      exTag = mainMenuAlign.toUpperCase();
    }
    // 计算面板标识
    let key: string = '';
    if (exTag !== '') {
      key = `${viewType}_${viewStyle}_${exTag}`;
    } else {
      key = `${viewType}_${viewStyle}`;
    }
    // 首页不采用分页导航
    if (
      ibiz.config.view.disableHomeTabs &&
      [
        'APPINDEXVIEW_DEFAULT',
        'APPINDEXVIEW_DEFAULT_LEFT',
        'APPINDEXVIEW_DEFAULT_TOP',
      ].includes(key)
    ) {
      key += '_NO_NAV';
    }
    return key;
  }

  /**
   * @description 特殊计算多编辑视图布局面板标识，上分页特殊处理
   * @protected
   * @param {IAppView} viewModel
   * @returns {*}  {string}
   * @memberof LayoutPanelUtil
   */
  protected calcDEMedViewLayoutTag(viewModel: IAppView): string {
    const { viewType, viewStyle } = viewModel;
    const meditPanel: IDEMultiEditViewPanel | undefined = getControl(
      viewModel,
      'meditviewpanel',
    );
    if (meditPanel && meditPanel.panelStyle === 'TAB_TOP') {
      return `${viewType}_TOP`;
    }
    return `${viewType}_${viewStyle}`;
  }
}
