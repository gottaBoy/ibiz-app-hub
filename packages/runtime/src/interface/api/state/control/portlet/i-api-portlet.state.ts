import { IApiContext } from '@ibiz-template/core';
import { IApiButtonContainerState, IApiColState } from '../../common';

/**
 * @description 门户样式
 * @export
 * @interface IApiPortletClass
 */
export interface IApiPortletClass {
  /**
   * @description 容器样式
   * @type {string[]}
   * @memberof IApiPortletClass
   */
  container: string[];

  /**
   * @description 容器动态样式
   * @type {string[]}
   * @memberof IApiPortletClass
   */
  containerDyna: string[];
}

/**
 * @description 门户状态
 * @export
 * @interface IApiPortletState
 * @extends {IApiColState}
 */
export interface IApiPortletState extends IApiColState {
  /**
   * @description  界面行为组状态
   * @type {(IApiButtonContainerState | null)}
   * @memberof IApiPortletState
   */
  actionGroupState: IApiButtonContainerState | null;

  /**
   * @description 类名集合
   * @type {IApiPortletClass}
   * @memberof IApiPortletState
   */
  class: IApiPortletClass;

  /**
   * @description 应用上下文
   * @type {IApiContext}
   * @memberof IApiPortletState
   */
  context: IApiContext;

  /**
   * @description 门户标题
   * @type {(string | undefined)}
   * @memberof IApiPortletState
   */
  title: string | undefined;

  /**
   * @description 是否高亮
   * @type {boolean}
   * @memberof IApiPortletState
   */
  hightLight: boolean;
}
