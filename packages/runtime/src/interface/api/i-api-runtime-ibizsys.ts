import { IApiAppHubService } from './app';
import { IApiGlobalConfig } from './common';
import {
  IApiAppUtil,
  IApiConfirmUtil,
  IApiFullscreenUtil,
  IApiGlobalUtil,
  IApiMessageUtil,
  IApiModalUtil,
  IApiNotificationUtil,
  IApiPrintPreviewUtil,
  IApiQrcodeUtil,
} from './util';
import { IApiOpenViewUtil } from './util/i-api-open-view-util';
/**
 * @description 运行时总集
 * @export
 * @interface IApiRuntimeIbizsys
 */
export interface IApiRuntimeIbizsys {
  /**
   * @description 应用中心服务
   * @type {IApiAppHubService}
   * @memberof IApiRuntimeIbizsys
   */
  hub: IApiAppHubService;

  /**
   * @description 全局配置
   * @type {IApiGlobalConfig}
   * @memberof IApiRuntimeIbizsys
   */
  config: IApiGlobalConfig;

  /**
   * @description 消息提示服务
   * @type {IApiModalUtil}
   * @memberof IApiRuntimeIbizsys
   */
  modal: IApiModalUtil;

  /**
   * @description 确认消息服务
   * @type {IApiConfirmUtil}
   * @memberof IApiRuntimeIbizsys
   */
  confirm: IApiConfirmUtil;

  /**
   * @description 顶部居中显示反馈提示服务
   * @type {IApiMessageUtil}
   * @memberof IApiRuntimeIbizsys
   */
  message: IApiMessageUtil;

  /**
   * @description 全局通知服务
   * @type {IApiNotificationUtil}
   * @memberof IApiRuntimeIbizsys
   */
  notification: IApiNotificationUtil;

  /**
   * @description 打开视图服务
   * @type {IApiOpenViewUtil}
   * @memberof IApiRuntimeIbizsys
   */
  openView: IApiOpenViewUtil;

  /**
   * @description 全局工具服务
   * @type {IApiGlobalUtil}
   * @memberof IApiRuntimeIbizsys
   */
  util: IApiGlobalUtil;

  /**
   * @description 全屏工具服务
   * @type {IApiFullscreenUtil}
   * @memberof IApiRuntimeIbizsys
   */
  fullscreenUtil: IApiFullscreenUtil;

  /**
   * @description 二维码工具服务
   * @type {IApiQrcodeUtil}
   * @memberof IApiRuntimeIbizsys
   */
  qrcodeUtil: IApiQrcodeUtil;

  /**
   * @description 应用级功能服务
   * @type {IApiAppUtil}
   * @memberof IApiRuntimeIbizsys
   */
  appUtil: IApiAppUtil;

  /**
   * @description 打印预览服务
   */
  printPreview: IApiPrintPreviewUtil;
}
