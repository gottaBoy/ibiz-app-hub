import {
  SysUIActionTag,
  ViewController,
  IGanttViewState,
  IGanttViewEvent,
  IGanttController,
  IApiGanttViewCall,
} from '@ibiz-template/runtime';
import { IAppDEGanttView } from '@ibiz/model-core';
import { TreeGridExViewEngine } from './tree-grid-ex-view.engine';

export class GanttViewEngine extends TreeGridExViewEngine {
  declare protected view: ViewController<
    IAppDEGanttView,
    IGanttViewState,
    IGanttViewEvent
  >;

  get gantt(): IGanttController {
    return this.view.getController('gantt') as IGanttController;
  }

  async call(
    key: keyof IApiGanttViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.NEW_ROW) {
      this.gantt.newRow(args);
      return null;
    }
    if (key === SysUIActionTag.TOGGLE_ROW_EDIT) {
      this.gantt.toggleRowEdit();
      return null;
    }
    if (key === SysUIActionTag.SAVE_ROW) {
      this.gantt.save(args.data[0]);
      return null;
    }
    if (key === SysUIActionTag.SAVE) {
      this.gantt.saveAll();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      await this.gantt.refresh();
      return null;
    }
    return super.call(key, args);
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    const { model } = this.view;
    if (!this.view.slotProps.gantt) {
      this.view.slotProps.gantt = {};
    }
    this.view.slotProps.gantt.mdctrlActiveMode = model.mdctrlActiveMode!;
  }
}
