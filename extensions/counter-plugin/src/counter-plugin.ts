import { AppCounter } from '@ibiz-template/runtime';

export class CounterPlugin extends AppCounter {
  protected async load(): Promise<IData> {
    this.data = {
      count1: 11,
      count2: 22,
    };
    this.evt.emit('change', this.data);
    return this.data;
  }
}
