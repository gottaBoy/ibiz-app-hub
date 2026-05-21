/* eslint-disable @typescript-eslint/no-explicit-any */
import { RuntimeError } from '@ibiz-template/core';
import {
  MDViewEngine,
  ViewController,
  IListViewState,
  IListViewEvent,
  IListController,
  SysUIActionTag,
  IApiListViewCall,
} from '@ibiz-template/runtime';
import { IAppDEListView } from '@ibiz/model-core';

export class ListViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEListView,
    IListViewState,
    IListViewEvent
  >;

  get list(): IListController {
    return this.view.getController('list') as IListController;
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model } = this.view;
    this.list.state.mdctrlActiveMode = model.mdctrlActiveMode!;
  }

  async call(
    key: keyof IApiListViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.EXPAND) {
      const { srfcollapsetag, srfgroup } = args.params || {};
      const tag = srfcollapsetag || srfgroup;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.list.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { srfcollapsetag, srfgroup } = args.params || {};
      const tag = srfcollapsetag || srfgroup;
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.list.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.list.changeCollapse({ expand: true } as any);
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.list.changeCollapse({ expand: false } as any);
      return null;
    }
    return super.call(key, args);
  }
}
