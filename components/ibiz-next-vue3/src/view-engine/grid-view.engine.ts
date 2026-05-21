/* eslint-disable @typescript-eslint/no-explicit-any */
import { RuntimeError } from '@ibiz-template/core';
import {
  ViewController,
  IGridViewEvent,
  IGridViewState,
  MDViewEngine,
  IGridController,
  SysUIActionTag,
  IApiGridViewCall,
} from '@ibiz-template/runtime';
import { IAppDEGridView } from '@ibiz/model-core';

export class GridViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEGridView,
    IGridViewState,
    IGridViewEvent
  >;

  async call(
    key: keyof IApiGridViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.NEW_ROW) {
      this.grid.newRow();
      return null;
    }
    if (key === SysUIActionTag.TOGGLE_ROW_EDIT) {
      this.grid.toggleRowEdit();
      return null;
    }
    if (key === SysUIActionTag.SAVE || key === SysUIActionTag.SAVE_ROW) {
      this.grid.saveAll();
      return null;
    }
    if (key === SysUIActionTag.EXPAND) {
      const { srfcollapsetag } = args.params || {};
      let tag = srfcollapsetag || '';
      if (!tag) {
        const { selectedData } = this.grid.state;
        const selectedGroup = selectedData.filter(x => x.isGroupData);
        if (selectedGroup.length > 0) {
          tag = selectedGroup[0].srfkey;
        }
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.grid.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { srfcollapsetag } = args.params || {};
      let tag = srfcollapsetag || '';
      if (!tag) {
        const { selectedData } = this.grid.state;
        const selectedGroup = selectedData.filter(x => x.isGroupData);
        if (selectedGroup.length > 0) {
          tag = selectedGroup[0].srfkey;
        }
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.grid.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.grid.changeCollapse({ expand: true } as any);
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.grid.changeCollapse({ expand: false } as any);
      return null;
    }
    return super.call(key, args);
  }

  get grid(): IGridController {
    return this.view.getController('grid') as IGridController;
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    const { model } = this.view;
    if (!this.view.slotProps.grid) {
      this.view.slotProps.grid = {};
    }
    this.view.slotProps.grid.mdctrlActiveMode = model.gridRowActiveMode!;
    this.view.slotProps.grid.rowEditOpen = model.rowEditDefault!;
  }
}
