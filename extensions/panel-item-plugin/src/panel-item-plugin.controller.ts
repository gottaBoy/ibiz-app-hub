import { IPanelItem } from '@ibiz/model-core';
import { PanelItemController } from '@ibiz-template/runtime';

export class PanelItemPluginController extends PanelItemController<IPanelItem> {
  get data(): IData {
    return this.dataParent.data!;
  }
}
