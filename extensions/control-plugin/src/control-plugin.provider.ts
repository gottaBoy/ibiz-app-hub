import {
  CTX,
  IControlController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { IControl } from '@ibiz/model-core';
import { ControlPluginController } from './control-plugin.controller';

export class ControlPluginProvider implements IControlProvider {
  component: string = 'IBizControlPlugin';

  createController(
    model: IControl,
    context: IContext,
    params: IParams,
    ctx: CTX,
  ): IControlController {
    return new ControlPluginController(model, context, params, ctx);
  }
}
