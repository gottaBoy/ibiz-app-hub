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
   * @description 水印工具类
   * @type {IApiWaterMarkUtil}
   * @memberof IApiGlobalUtil
   */
  readonly watermark: IApiWaterMarkUtil;

  /**
   * @description 设置浏览器标题
   * @param {string} title
   * @memberof IApiGlobalUtil
   */
  setBrowserTitle(title: string): void;
}
