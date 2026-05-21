import { IDEMultiEditViewPanel } from '@ibiz/model-core';
import { IApiMEditViewPanelState, IApiPanelUiItem } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';
import { IApiViewController } from '../view';

/**
 * 多编辑视图面板
 * @description 支持多个编辑视图同时存在并可执行新建、编辑、删除等操作。
 * @primary
 * @export
 * @interface IApiMEditViewPanelController
 * @extends {IApiMDControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiMEditViewPanelController<
  T extends IDEMultiEditViewPanel = IDEMultiEditViewPanel,
  S extends IApiMEditViewPanelState = IApiMEditViewPanelState,
> extends IApiMDControlController<T, S> {
  /**
   * @description 嵌入视图集合
   * @type {Map<string, IApiViewController>}
   * @memberof IApiMEditViewPanelController
   */
  embedViews: Map<string, IApiViewController>;

  /**
   * @description 添加项
   * @returns {*}  {Promise<void>}
   * @memberof IApiMEditViewPanelController
   */
  handleAdd(): Promise<void>;

  /**
   * @description 删除项
   * @param {IApiPanelUiItem} item 项数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiMEditViewPanelController
   */
  handleDelete(item: IApiPanelUiItem): Promise<void>;

  /**
   * @description 获取激活视图
   * @returns {*}  {(IApiViewController | undefined)}
   * @memberof IApiMEditViewPanelController
   */
  getActiveView(): IApiViewController | undefined;
}
