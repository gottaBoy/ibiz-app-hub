import {
  IAppDataUploadViewState,
  IViewEvent,
  ViewController,
  ViewEngineBase,
} from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';

/**
 * 应用数据上传视图引擎
 * @author lxm
 * @date 2024-04-15 04:03:03
 * @export
 * @class AppDataUploadViewEngine
 * @extends {ViewEngineBase}
 */
export class AppDataUploadViewEngine extends ViewEngineBase {
  declare protected view: ViewController<
    IAppView,
    IAppDataUploadViewState,
    IViewEvent
  >;
}
