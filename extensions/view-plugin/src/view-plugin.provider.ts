import { CTX, IViewController, IViewProvider } from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';
import { ViewPluginController } from './view-plugin.controller';

export class ViewPluginProvider implements IViewProvider {
  component: string = 'IBizViewPlugin';

  createController(
    model: IAppView,
    context: IContext,
    params?: IParams,
    ctx?: CTX,
  ): IViewController {
    return new ViewPluginController(model, context, params, ctx);
  }
}
