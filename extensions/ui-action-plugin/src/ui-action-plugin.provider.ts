import { IAppDEUIAction } from '@ibiz/model-core';
import {
  IUIActionResult,
  IUILogicParams,
  UIActionProviderBase,
} from '@ibiz-template/runtime';
import { uiActionT } from './locale';

export class UiActionPluginProvider extends UIActionProviderBase {
  async execAction(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    ibiz.log.info(action, args);
    ibiz.message.success(uiActionT('actionSuccess'));
    const actionResult: IUIActionResult = {};
    return actionResult;
  }
}
