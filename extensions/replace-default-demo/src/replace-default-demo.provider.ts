import {
  CTX,
  IControlController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { IControl } from '@ibiz/model-core';
import { ReplaceDefaultDemoController } from './replace-default-demo.controller';

export class ReplaceDefaultDemoProvider implements IControlProvider {
  component: string = 'IBizReplaceDefaultDemo';

  createController(
    model: IControl,
    context: IContext,
    params: IParams,
    ctx: CTX,
  ): IControlController {
    return new ReplaceDefaultDemoController(model, context, params, ctx);
  }
}
