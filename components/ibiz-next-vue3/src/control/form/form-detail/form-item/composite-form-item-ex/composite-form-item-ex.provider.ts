import {
  FormController,
  IFormDetailContainerController,
  IFormDetailProvider,
} from '@ibiz-template/runtime';
import { IDEFormDetail } from '@ibiz/model-core';
import { CompositeFormItemExController } from './composite-form-item-ex.controller';

export class CompositeFormItemExProvider implements IFormDetailProvider {
  component: string = 'IBizCompositeFormItemEx';

  async createController(
    detailModel: IDEFormDetail,
    form: FormController,
    parent: IFormDetailContainerController | undefined,
  ): Promise<CompositeFormItemExController> {
    const c = new CompositeFormItemExController(detailModel, form, parent);
    await c.init();
    return c;
  }
}
