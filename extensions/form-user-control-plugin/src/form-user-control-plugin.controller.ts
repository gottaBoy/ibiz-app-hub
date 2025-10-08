import { FormItemController } from '@ibiz-template/runtime';

export class FormUserControlPluginController extends FormItemController {
  protected async onInit(): Promise<void> {
    ibiz.log.info('表单自定义控件控制器初始化');
    await super.onInit();
  }
}
