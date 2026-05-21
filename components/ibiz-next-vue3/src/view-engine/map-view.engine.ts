import {
  ViewController,
  IMapViewEvent,
  IMapViewState,
  MDViewEngine,
  IMapController,
} from '@ibiz-template/runtime';
import { IAppDEMapView } from '@ibiz/model-core';

export class MapViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEMapView,
    IMapViewState,
    IMapViewEvent
  >;

  get map(): IMapController {
    return this.view.getController('map') as IMapController;
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    if (!this.view.slotProps.map) {
      this.view.slotProps.map = {};
    }
  }
}
