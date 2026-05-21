/* eslint-disable @typescript-eslint/no-explicit-any */
import { RuntimeError } from '@ibiz-template/core';
import {
  MDViewEngine,
  ViewController,
  IDataViewState,
  IDataViewEvent,
  IDataViewControlController,
  SysUIActionTag,
  IApiDataViewCall,
} from '@ibiz-template/runtime';
import { IAppDEDataView } from '@ibiz/model-core';

export class DataViewEngine extends MDViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEDataView, IDataViewState, IDataViewEvent>}
   * @memberof DataViewEngine
   */
  declare protected view: ViewController<
    IAppDEDataView,
    IDataViewState,
    IDataViewEvent
  >;

  /**
   * 数据视图（卡片）部件
   *
   * @readonly
   * @memberof DataViewEngine
   */
  get dataview(): IDataViewControlController {
    return this.view.getController('dataview') as IDataViewControlController;
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @memberof DataViewEngine
   */
  async onCreated(): Promise<void> {
    super.onCreated();
    const { model } = this.view;
    if (!this.view.slotProps.dataview) {
      this.view.slotProps.dataview = {};
    }
    this.view.slotProps.dataview.mdctrlActiveMode = model.mdctrlActiveMode!;
  }

  async call(
    key: keyof IApiDataViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.EXPAND) {
      const { srfcollapsetag, srfgroup } = args.params || {};
      const tag = srfcollapsetag || srfgroup;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.dataview.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { srfcollapsetag, srfgroup } = args.params || {};
      const tag = srfcollapsetag || srfgroup;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.dataview.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.dataview.changeCollapse({ expand: true } as any);
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.dataview.changeCollapse({ expand: false } as any);
      return null;
    }
    return super.call(key, args);
  }
}
