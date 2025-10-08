import {
  IButtonContainerState,
  ILayoutState,
  IPortletClass,
  IPortletState,
} from '@ibiz-template/runtime';

/**
 *  门户部件控件状态
 *
 * @export
 * @class PortletPartState
 */
export class PortletPartState implements IPortletState {
  hightLight: boolean = false;

  visible: boolean = true;

  keepAlive: boolean = false;

  layout: ILayoutState = {
    width: '',
    height: '',
    extraStyle: {},
    extraClass: [],
    contentStyle: {},
  };

  class: IPortletClass = {
    container: [],
    containerDyna: [],
  };

  /**
   * 上下文
   *
   * @author zhanghengfeng
   * @date 2024-08-05 20:08:34
   * @type {IContext}
   */
  context!: IContext;

  /**
   * 界面行为组状态
   *
   * @type {(IButtonContainerState | null)}
   * @memberof PortletPartState
   */
  actionGroupState: IButtonContainerState | null = null;

  /**
   * 门户标题
   *
   * @author zhanghengfeng
   * @date 2024-08-05 20:08:48
   * @type {(string | undefined)}
   */
  title: string | undefined;
}
