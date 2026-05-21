/* eslint-disable @typescript-eslint/no-explicit-any */
import { IApiParams } from '@ibiz-template/core';
import { Base64 } from 'js-base64';
import { IApiHandlebarsUtil } from './i-api-handlebars-util';
import { IApiTextUtil } from './i-api-text-util';
import { IApiThemeUtil } from './i-api-theme-util';
import { IApiRawValueUtil } from './i-api-raw-value-util';
import { IApiShortCutUtil } from './i-api-short-cut-util';
import { IApiFileUtil } from './i-api-file-util';
import { IApiHtml2canvasUtil } from './i-api-html2canvas-util';
import { IApiVoiceUtil } from './i-api-voice-util';
import { IApiWaterMarkUtil } from './i-api-water-mark-util';
import { IApiWeChatUtil } from './i-api-wechat-util';
import { IApiJsonUtil } from './i-api-json-util';
import { IApiUIActionUtil } from './i-api-ui-action-util';
import { IApiErrorHandlerCenter } from './i-api-error-handle-center';
import { IApiEncryptionUtil } from './i-api-encryption-util';
import { IApiExcelUtil } from './i-api-excel-util';

/**
 * @description 全局工具接口
 * @export
 * @interface IApiGlobalUtil
 */
export interface IApiGlobalUtil {
  /**
   * @description 主题工具
   * @type {IApiThemeUtil}
   * @memberof IApiGlobalUtil
   */
  readonly theme: IApiThemeUtil;

  /**
   * @description 文本工具
   * @type {IApiTextUtil}
   * @memberof IApiGlobalUtil
   */
  readonly text: IApiTextUtil;

  /**
   * @description handlebars 工具
   * @type {IApiHandlebarsUtil}
   * @memberof IApiGlobalUtil
   */
  readonly hbs: IApiHandlebarsUtil;

  /**
   * @description base64 工具
   * @type {typeof Base64}
   * @memberof IApiGlobalUtil
   */
  readonly base64: typeof Base64;

  /**
   * @description 直接值工具
   * @type {IApiRawValueUtil}
   * @memberof IApiGlobalUtil
   */
  readonly rawValue: IApiRawValueUtil;

  /**
   * @description 界面行为工具
   * @type {IApiUIActionUtil}
   * @memberof IApiGlobalUtil
   */
  readonly action: IApiUIActionUtil;

  /**
   * @description 错误处理工具
   * @type {IApiErrorHandlerCenter}
   * @memberof IApiGlobalUtil
   */
  readonly error: IApiErrorHandlerCenter;

  /**
   * @description 最小化工具类
   * @type {IApiShortCutUtil}
   * @memberof IApiGlobalUtil
   */
  readonly shortCut: IApiShortCutUtil;

  /**
   * @description 文件工具类
   * @type {IApiFileUtil}
   * @memberof IApiGlobalUtil
   */
  readonly file: IApiFileUtil;

  /**
   * @description Html2Canvas工具类
   * @type {IApiHtml2canvasUtil}
   * @memberof IApiGlobalUtil
   */
  readonly html2canvas: IApiHtml2canvasUtil;

  /**
   * @description 语音工具类
   * @type {IApiVoiceUtil}
   * @memberof IApiGlobalUtil
   */
  readonly voice: IApiVoiceUtil;

  /**
   * @description 加密工具类
   * @type {IApiEncryptionUtil}
   * @memberof IApiGlobalUtil
   */
  readonly encryption: IApiEncryptionUtil;

  /**
   * @description 水印工具类
   * @type {IApiWaterMarkUtil}
   * @memberof IApiGlobalUtil
   */
  readonly watermark: IApiWaterMarkUtil;

  /**
   * @description 微信工具类
   * @type {IApiWeChatUtil}
   * @memberof IApiGlobalUtil
   */
  readonly weChat: IApiWeChatUtil;

  /**
   * @description json工具类
   * @type {IApiJsonUtil}
   * @memberof IApiGlobalUtil
   */
  readonly jsonUtil: IApiJsonUtil;

  /**
   * @description 获取Excel工具类
   * @memberof IApiGlobalUtil
   */
  getExcelUtil?: () => Promise<IApiExcelUtil>;

  /**
   * @description 显示应用级别的加载提示
   * @memberof IApiGlobalUtil
   */
  showAppLoading(): void;

  /**
   * @description 隐藏应用级别的加载提示
   * @memberof IApiGlobalUtil
   */
  hiddenAppLoading(): void;

  /**
   * @description 设置浏览器标题
   * @param {string} title 浏览器标题
   * @memberof IApiGlobalUtil
   */
  setBrowserTitle(title: string): void;

  /**
   * @description 获取应用全局变量
   * @returns {*}  {IApiParams}
   * @memberof IApiGlobalUtil
   */
  getGlobalParam(): IApiParams;

  /**
   * @description 获取视图路由参数变量
   * @returns {*}  {IApiParams[]}
   * @memberof IApiGlobalUtil
   */
  getRouterParams(): IApiParams[];

  /**
   * @description 注册全局功能类扩展，用于替换预置能力
   * @param {keyof IApiGlobalUtil} key 全局功能名称
   * @param {*} value 全局功能实现
   * @memberof IApiGlobalUtil
   */
  registerExtension(key: keyof IApiGlobalUtil, value: any): void;
}
