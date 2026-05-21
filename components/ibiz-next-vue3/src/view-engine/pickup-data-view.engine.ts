import {
  ViewController,
  IPickupDataViewEvent,
  IPickupDataViewState,
  IDataViewControlController,
  ViewCallTag,
  IApiPickupDataViewCall,
} from '@ibiz-template/runtime';
import { IAppDEDataView } from '@ibiz/model-core';
import { DataViewEngine } from './data-view.engine';

export class PickupDataViewEngine extends DataViewEngine {
  declare protected view: ViewController<
    IAppDEDataView,
    IPickupDataViewState,
    IPickupDataViewEvent
  >;

  /**
   * @description 选中数据
   * @type {IData[]}
   * @memberof PickupDataViewEngine
   */
  selectData: IData[] = [];

  /**
   * 表格控制器
   *
   * @author zk
   * @date 2023-05-26 05:05:43
   * @readonly
   * @memberof PickupDataViewViewEngine
   */
  get dataview(): IDataViewControlController {
    return this.view.getController('dataview') as IDataViewControlController;
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    this.view.slotProps.dataview.singleSelect = this.view.state.singleSelect;
    this.initSelectData();
  }

  /**
   * @description 初始化选中数据
   * @protected
   * @memberof PickupDataViewEngine
   */
  protected initSelectData(): void {
    if (this.view.params.selecteddata) {
      this.selectData = JSON.parse(this.view.params.selecteddata);
      delete this.view.params.selecteddata;
    }
    if (this.view.state.selectedData) {
      this.selectData = [...this.view.state.selectedData];
    }
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    this.xdataControl.evt.on('onSelectionChange', async event => {
      this.view.evt.emit('onSelectionChange', { ...event });
    });
    this.xdataControl.evt.on('onActive', async event => {
      this.view.evt.emit('onDataActive', { ...event });
    });
    this.setSelectedData(this.selectData);
  }

  async call(
    key: keyof IApiPickupDataViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === ViewCallTag.GET_ALL_DATA) {
      return this.dataview.state.items;
    }
    return super.call(key, args);
  }
}
