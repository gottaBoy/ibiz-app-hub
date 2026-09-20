import { IUILogicContext, IUILogicNodeProvider } from '@ibiz-template/runtime';
import { IDEUIPFPluginLogic } from '@ibiz/model-core';
import { uiLogicNodeT } from './locale';

export class UiLogicNodePluginProvider implements IUILogicNodeProvider {
  declare model: IDEUIPFPluginLogic;

  async exec(model: IDEUIPFPluginLogic, ctx: IUILogicContext): Promise<void> {
    ibiz.log.info(model, ctx);
    ibiz.message.success(uiLogicNodeT('actionSuccess'));
  }
}
