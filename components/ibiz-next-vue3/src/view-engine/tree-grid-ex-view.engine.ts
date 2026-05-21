import {
  ViewController,
  ITreeGridExViewEvent,
  ITreeGridExViewState,
  ITreeGridExController,
  SysUIActionTag,
  IApiTreeGridExViewCall,
} from '@ibiz-template/runtime';
import { IAppDETreeGridExView } from '@ibiz/model-core';
import { TreeViewEngine } from './tree-view.engine';

export class TreeGridExViewEngine extends TreeViewEngine {
  declare protected view: ViewController<
    IAppDETreeGridExView,
    ITreeGridExViewState,
    ITreeGridExViewEvent
  >;

  get treeGridEx(): ITreeGridExController {
    return this.view.getController('treegridex') as ITreeGridExController;
  }

  async call(
    key: keyof IApiTreeGridExViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.TOGGLE_ROW_EDIT) {
      this.treeGridEx.toggleRowEdit();
      return null;
    }
    if (key === SysUIActionTag.SAVE_ROW) {
      this.treeGridEx.save(args.data[0]);
      return null;
    }
    if (key === SysUIActionTag.SAVE) {
      this.treeGridEx.saveAll();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      this.treeGridEx.load();
      return null;
    }

    return super.call(key, args);
  }
}
