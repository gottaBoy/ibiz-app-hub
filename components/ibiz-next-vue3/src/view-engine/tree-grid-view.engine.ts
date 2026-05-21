import {
  ViewController,
  ITreeGridViewEvent,
  ITreeGridViewState,
  SysUIActionTag,
  TreeGridController,
  IApiTreeGridViewCall,
} from '@ibiz-template/runtime';
import { IAppDETreeGridView } from '@ibiz/model-core';
import { RuntimeError } from '@ibiz-template/core';
import { GridViewEngine } from './grid-view.engine';

export class TreeGridViewEngine extends GridViewEngine {
  declare protected view: ViewController<
    IAppDETreeGridView,
    ITreeGridViewState,
    ITreeGridViewEvent
  >;

  /**
   * 多数据部件名称
   *
   * @author zk
   * @date 2023-10-07 06:10:44
   * @readonly
   * @type {string}
   * @memberof TreeGridViewEngine
   */
  get xdataControlName(): string {
    return 'treegrid';
  }

  get treeGrid(): TreeGridController {
    return this.view.getController('treegrid') as TreeGridController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    if (!this.view.slotProps.treegrid) {
      this.view.slotProps.treegrid = this.view.slotProps.grid;
    } else {
      Object.assign(this.view.slotProps.treegrid, this.view.slotProps.grid);
    }
  }

  async call(
    key: keyof IApiTreeGridViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.EXPAND) {
      const { srfcollapsetag } = args.params || {};
      let tag = srfcollapsetag || '';
      if (!tag) {
        const { selectedData } = this.treeGrid.state;
        const selectedGroup = selectedData.filter(x => x.hasChildren);
        if (selectedGroup.length > 0) {
          tag = selectedGroup[0].srfkey;
        }
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.treeGrid.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { srfcollapsetag } = args.params || {};
      let tag = srfcollapsetag || '';
      if (!tag) {
        const { selectedData } = this.treeGrid.state;
        const selectedGroup = selectedData.filter(x => x.hasChildren);
        if (selectedGroup.length > 0) {
          tag = selectedGroup[0].srfkey;
        }
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.treeGrid.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.treeGrid.changeCollapse({ expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.treeGrid.changeCollapse({ expand: false });
      return null;
    }
    return super.call(key, args);
  }
}
