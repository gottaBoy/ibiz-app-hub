import { PortletPartController } from '@ibiz-template/runtime';

export class PortletPluginController extends PortletPartController {
  protected async onInit(): Promise<void> {
    ibiz.log.info('门户部件控制器初始化');
    await super.onInit();
  }
}
