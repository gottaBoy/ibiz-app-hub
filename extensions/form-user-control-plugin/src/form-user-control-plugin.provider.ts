import {
  FormController,
  IFormDetailContainerController,
  IFormDetailProvider,
} from '@ibiz-template/runtime';
import { IDEFormDetail } from '@ibiz/model-core';
import { FormUserControlPluginController } from './form-user-control-plugin.controller';

export class FormUserControlPluginProvider implements IFormDetailProvider {
  component: string = 'IBizFormUserControlPlugin';

  async createController(
    detailModel: IDEFormDetail,
    form: FormController,
    parent: IFormDetailContainerController | undefined,
  ): Promise<FormUserControlPluginController> {
    const c = new FormUserControlPluginController(detailModel, form, parent);
    await c.init();
    return c;
  }
}
