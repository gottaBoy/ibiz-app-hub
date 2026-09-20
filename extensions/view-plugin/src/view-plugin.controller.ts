import { CTX, ViewController } from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';
import { clone } from 'ramda';
import { ViewPluginEngine } from './view-plugin.engine';

export class ViewPluginController extends ViewController {
  constructor(
    model: IAppView,
    context: IContext,
    params: IParams = {},
    ctx: CTX = {} as CTX,
  ) {
    super(clone(model), context, params, ctx);
  }

  protected convertMultipleLanguages(): void {
    // User model captions and language resource fields are not plugin UI.
  }

  protected initEngines(): void {
    this.engines.push(new ViewPluginEngine(this));
  }
}
