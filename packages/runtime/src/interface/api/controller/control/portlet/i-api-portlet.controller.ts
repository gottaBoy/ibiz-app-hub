/* eslint-disable @typescript-eslint/no-explicit-any */
import { IApiData, IApiParams } from '@ibiz-template/core';
import { IDBPortletPart, IUIActionGroupDetail } from '@ibiz/model-core';
import { IApiPortletState } from '../../../state';
import { IApiDashboardController } from '../i-api-dashboard.controller';
import { IApiPortletContainerController } from './i-api-portlet-container.controller';
import { IApiController } from '../../common';

/**
 * @description 门户控制器基类接口
 * @export
 * @interface IApiPortletController
 */
export interface IApiPortletController {
  /**
   * @description 原始模型
   * @type {IDBPortletPart}
   * @memberof IApiPortletController
   */
  readonly model: IDBPortletPart;

  /**
   * @description 数据看板控制器
   * @type {IApiDashboardController}
   * @memberof IApiPortletController
   */
  readonly dashboard: IApiDashboardController;

  /**
   * @description 父容器控制器(除了根成员都存在)
   * @type {IApiPortletContainerController}
   * @memberof IApiPortletController
   */
  parent?: IApiPortletContainerController;

  /**
   * @description 成员状态
   * @type {IApiPortletState}
   * @memberof IApiPortletController
   */
  state: IApiPortletState;

  /**
   * @description 视图参数
   * @type {IApiParams}
   * @memberof IApiPortletController
   */
  params: IApiParams;

  /**
   * @description 门户配置，srftitle: 门户标题
   * @type {{ srftitle?: string; [key: string]: any }}
   * @memberof IApiPortletController
   */
  config: { srftitle?: string; [key: string]: any };

  /**
   * @description 容器类名集合
   * @type {string[]}
   * @memberof IApiPortletController
   */
  readonly containerClass: string[];

  /**
   * @description 内容控制器
   * @type {(IApiController | undefined)}
   * @memberof IApiPortletController
   */
  readonly contentController: IApiController | undefined;

  /**
   * @description 内容元素
   * @type {(HTMLDivElement | null)}
   * @memberof IApiPortletController
   */
  readonly contentElement: HTMLDivElement | null;

  /**
   * @description 触发界面行为
   * @param {IUIActionGroupDetail} detail 界面行为组成员模型
   * @param {MouseEvent} event 鼠标事件
   * @param {IApiData[]} data 业务数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiPortletController
   */
  onActionClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
    data: IApiData[],
  ): Promise<void>;

  /**
   * @description  重置自定义配置
   * @memberof IApiPortletController
   */
  resetConfig(): void;

  /**
   * @description 刷新
   * @returns {*}  {Promise<void>}
   * @memberof IApiPortletController
   */
  refresh(): Promise<void>;

  /**
   * @description  高亮
   * @memberof IApiPortletController
   */
  hightLight(): void;
}
