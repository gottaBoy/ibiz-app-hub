import {
  CTX,
  IControlController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { IControl } from '@ibiz/model-core';
import { EntityFieldGridController } from './entity-field-grid.controller';

export class EntityFieldGridProvider implements IControlProvider {
  component: string = 'IBizEntityFieldGrid';

  createController(
    model: IControl,
    context: IContext,
    params: IParams,
    ctx: CTX,
  ): IControlController {
    return new EntityFieldGridController(model, context, params, ctx);
  }
}
