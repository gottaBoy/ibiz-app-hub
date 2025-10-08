import { EditFormController } from '@ibiz-template/runtime';

export class ControlPluginController extends EditFormController {
  protected async onCreated(): Promise<void> {
    ibiz.log.info('部件控制器初始化');
    await super.onCreated();
  }
}
