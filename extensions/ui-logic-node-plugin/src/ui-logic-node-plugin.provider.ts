import { IUILogicContext, IUILogicNodeProvider } from '@ibiz-template/runtime';
import { IDEUIPFPluginLogic } from '@ibiz/model-core';

export class UiLogicNodePluginProvider implements IUILogicNodeProvider {
  declare model: IDEUIPFPluginLogic;

  async exec(model: IDEUIPFPluginLogic, ctx: IUILogicContext): Promise<void> {
    ibiz.log.info(model, ctx);
    ibiz.message.success('界面逻辑节点插件触发成功！');
  }
}
