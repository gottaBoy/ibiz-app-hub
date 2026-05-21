import {
  ViewController,
  ITreeViewEvent,
  ITreeViewState,
  MDViewEngine,
  ITreeController,
  IUIActionResult,
  TreeController,
  ITreeNodeData,
} from '@ibiz-template/runtime';
import { IAppDEMobTreeView } from '@ibiz/model-core';

export class MobTreeViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEMobTreeView,
    ITreeViewState,
    ITreeViewEvent
  >;

  get tree(): ITreeController {
    return this.view.getController('tree') as ITreeController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    if (!this.view.slotProps.tree) {
      this.view.slotProps.tree = {};
    }
  }

  protected async openData(args: {
    data: IData[];
    event?: MouseEvent;
    context?: IContext;
    params?: IParams;
  }): Promise<IUIActionResult> {
    const { data, event } = args;
    const result = await (this.xdataControl as TreeController).openData(
      data[0] as ITreeNodeData,
      event,
    );
    return result;
  }

  protected async newData(args: {
    data: IData[];
    event?: MouseEvent;
  }): Promise<IUIActionResult> {
    const { data, event } = args;
    const result = await (this.xdataControl as TreeController).newData(
      data[0] as ITreeNodeData,
      event,
    );
    return result;
  }
}
