import { IAppDEUIAction } from '@ibiz/model-core';
import {
  IUIActionResult,
  IUILogicParams,
  UIActionProviderBase,
} from '@ibiz-template/runtime';

export class UiActionPluginProvider extends UIActionProviderBase {
  async execAction(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    ibiz.log.info(action, args);
    ibiz.message.success('界面行为插件触发成功！');
    const actionResult: IUIActionResult = {};
    return actionResult;
  }
}
