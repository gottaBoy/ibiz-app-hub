import {
  IViewEvent,
  IViewState,
  ViewController,
  ViewEngineBase,
} from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';

/**
 * @description 应用欢迎视图引擎
 * @export
 * @class AppStartViewEngine
 * @extends {ViewEngineBase}
 */
export class AppWelcomeViewEngine extends ViewEngineBase {
  declare protected view: ViewController<IAppView, IViewState, IViewEvent>;

  async onCreated(): Promise<void> {
    await super.onCreated();
    ibiz.util.hiddenAppLoading();
  }
}
