import { IAppCounter } from '@ibiz/model-core';
import { AppCounter, IAppCounterProvider } from '@ibiz-template/runtime';
import { CounterPlugin } from './counter-plugin';

export class CounterPluginProvider implements IAppCounterProvider {
  createCounter(model: IAppCounter): AppCounter {
    return new CounterPlugin(model);
  }
}
