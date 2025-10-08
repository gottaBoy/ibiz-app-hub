import { ViewController } from '@ibiz-template/runtime';
import { ViewPluginEngine } from './view-plugin.engine';

export class ViewPluginController extends ViewController {
  protected initEngines(): void {
    this.engines.push(new ViewPluginEngine(this));
  }
}
