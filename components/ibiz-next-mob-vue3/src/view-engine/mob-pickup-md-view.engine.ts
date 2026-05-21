import {
  ViewController,
  IPickupMDViewEvent,
  IPickupMDViewState,
  IMobMDCtrlController,
  MDViewEngine,
  IApiMobPickupMDViewCall,
} from '@ibiz-template/runtime';
import { IAppDEDataView } from '@ibiz/model-core';

export class PickupMDViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEDataView,
    IPickupMDViewState,
    IPickupMDViewEvent
  >;

  /**
   * 表格控制器
   *
   * @author zk
   * @date 2023-05-26 05:05:43
   * @readonly
   * @memberof PickupMDViewViewEngine
   */
  get mdctrl(): IMobMDCtrlController {
    return this.view.getController('mdctrl') as IMobMDCtrlController;
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    if (!this.view.slotProps.mdctrl) {
      this.view.slotProps.mdctrl = {};
    }
    this.view.slotProps.mdctrl.singleSelect = this.view.state.singleSelect;
    this.view.slotProps.mdctrl.selectedData = this.view.state.selectedData;
    this.view.slotProps.mdctrl.mode = 'SELECT';
    this.view.slotProps.mdctrl.mdctrlActiveMode = 2;
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model } = this.view;
    this.xdataControl.evt.on('onSelectionChange', async event => {
      this.view.evt.emit('onSelectionChange', { ...event });
    });
    this.xdataControl.evt.on('onActive', async event => {
      this.view.evt.emit('onDataActive', { ...event });
    });
    // 默认加载
    if (!this.view.state.noLoadDefault && model.loadDefault) {
      this.load();
    }
  }

  async call(
    key: keyof IApiMobPickupMDViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === 'GetAllData') {
      return this.mdctrl.state.items;
    }
    return super.call(key, args);
  }
}
