/* eslint-disable no-await-in-loop */
import { AsyncSeriesHook } from 'qx-util';
import { EventBase, IViewShellHooks } from '../../interface';

export class ViewShellHooks implements IViewShellHooks {
  hooks = {
    viewCreated: new AsyncSeriesHook<[], EventBase>(),
    viewMounted: new AsyncSeriesHook<[], EventBase>(),
    viewDestroyed: new AsyncSeriesHook<[], EventBase>(),
  };
}
