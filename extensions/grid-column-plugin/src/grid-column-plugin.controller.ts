import { GridFieldColumnController } from '@ibiz-template/runtime';

export class GridColumnPluginController extends GridFieldColumnController {
  protected async onInit(): Promise<void> {
    ibiz.log.info('表格列控制器初始化');
    await super.onInit();
  }
}
