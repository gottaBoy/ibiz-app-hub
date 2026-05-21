import { IAppDEHtmlView } from '@ibiz/model-core';
import { StringUtil } from '@ibiz-template/core';
import {
  IHtmlViewState,
  IViewController,
  IViewEvent,
} from '../../../interface';
import { ViewController } from './view.controller';
/**
 * @description 实体html视图
 * @export
 * @class HtmlViewController
 * @extends {ViewController<T, S, E>}
 * @implements {IViewController<T, S, E>}
 * @template T
 * @template S
 * @template E
 */
export class HtmlViewController<
    T extends IAppDEHtmlView = IAppDEHtmlView,
    S extends IHtmlViewState = IHtmlViewState,
    E extends IViewEvent = IViewEvent,
  >
  extends ViewController<T, S, E>
  implements IViewController<T, S, E>
{
  protected initState(): void {
    const { htmlUrl } = this.model as unknown as IAppDEHtmlView;
    super.initState();
    this.state.htmlUrl = htmlUrl
      ? StringUtil.fill(htmlUrl, this.context, this.params)
      : '';
  }
}
