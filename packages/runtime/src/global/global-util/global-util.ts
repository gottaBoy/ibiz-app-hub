/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-extraneous-dependencies */
import { Base64 } from 'js-base64';
import { RuntimeError } from '@ibiz-template/core';
import { IApiGlobalUtil, IExcelUtil } from '../../interface';
import { UIActionUtil } from '../../ui-action';
import {
  TextUtil,
  LayoutPanelUtil,
  HandlebarsUtil,
  RawValueUtil,
  ThemeUtil,
  DefaultErrorHandler,
  ErrorHandlerCenter,
  ViewStack,
  AnimeUtil,
  FileUtil,
  ShortCutUtil,
  BIReportUtil,
  RecordNavUtil,
  JsonSchemaUtil,
  Html2Canvas,
  VoiceUtil,
  EncyptionUtil,
  WaterMarkUtil,
  WeChatUtil,
  JsonUtil,
} from '../../utils';

/**
 * @description 全局工具方法或对象
 * @export
 * @class GlobalUtil
 * @implements {IApiGlobalUtil}
 */
export class GlobalUtil implements IApiGlobalUtil {
  /**
   * @description 布局面板
   * @memberof GlobalUtil
   */
  readonly layoutPanel = new LayoutPanelUtil();

  /**
   * @description 主题设置工具
   * @memberof GlobalUtil
   */
  readonly theme = new ThemeUtil();

  /**
   * @description 文本工具
   * @memberof GlobalUtil
   */
  readonly text = new TextUtil();

  /**
   * @description handlebars 工具
   * @memberof GlobalUtil
   */
  readonly hbs = new HandlebarsUtil();

  /**
   * @description base64工具
   * @memberof GlobalUtil
   */
  readonly base64 = Base64;

  /**
   * @description 直接值工具
   * @memberof GlobalUtil
   */
  readonly rawValue = new RawValueUtil();

  /**
   * @description 执行界面行为
   * @memberof GlobalUtil
   */
  readonly action = UIActionUtil;

  /**
   * @description 错误处理中心
   * @memberof GlobalUtil
   */
  readonly error = new ErrorHandlerCenter();

  /**
   * @description 视图堆栈
   * @memberof GlobalUtil
   */
  readonly viewStack = new ViewStack();

  /**
   * @description 动画工具类
   * @memberof GlobalUtil
   */
  readonly anime = new AnimeUtil();

  /**
   * @description 最小化工具类
   * @memberof GlobalUtil
   */
  readonly shortCut = new ShortCutUtil();

  /**
   * @description 文件工具类
   * @memberof GlobalUtil
   */
  readonly file = new FileUtil();

  /**
   * @description Html2Canvas工具类
   * @memberof GlobalUtil
   */
  readonly html2canvas = new Html2Canvas();

  /**
   * @description bi报表工具类
   * @memberof GlobalUtil
   */
  readonly biReport = new BIReportUtil();

  /**
   * @description 记录导航工具类
   * @memberof GlobalUtil
   */
  readonly record = new RecordNavUtil();

  /**
   * @description JsonSchema工具类
   * @memberof GlobalUtil
   */
  readonly jsonSchema = new JsonSchemaUtil();

  /**
   * @description 语音工具类
   * @memberof GlobalUtil
   */
  readonly voice = new VoiceUtil();

  /**
   * @description 加密工具类
   * @memberof GlobalUtil
   */
  readonly encryption = new EncyptionUtil();

  /**
   * @description 水印工具类
   * @memberof GlobalUtil
   */
  readonly watermark = new WaterMarkUtil();

  /**
   * @description 微信工具类
   * @memberof GlobalUtil
   */
  readonly weChat = new WeChatUtil();

  /**
   * @description json工具类
   * @memberof GlobalUtil
   */
  readonly jsonUtil = new JsonUtil();

  constructor() {
    this.error.register(new DefaultErrorHandler());
  }

  /**
   * @description 获取导出Excel工具类对象
   * @memberof GlobalUtil
   */
  getExcelUtil?: () => Promise<IExcelUtil>;

  /**
   * @description 显示应用级别的加载提示
   * @memberof GlobalUtil
   */
  showAppLoading(): void {
    const el = document.getElementById('app-loading-x') as HTMLDivElement;
    if (el) {
      el.style.display = 'none';
    }
  }

  /**
   * @description 隐藏应用级别的加载提示
   * @memberof GlobalUtil
   */
  hiddenAppLoading(): void {
    setTimeout(() => {
      const el = document.getElementById('app-loading-x') as HTMLDivElement;
      if (el) {
        el.style.display = 'none';
      }
    }, 300);
  }

  /**
   * @description 设置浏览器标签页标题
   * @param {string} title
   * @memberof GlobalUtil
   */
  setBrowserTitle(title: string): void {
    ibiz.platform.setBrowserTitle(title);
  }

  /**
   * @description 获取应用全局变量
   * @returns {*}  {IParams}
   * @memberof GlobalUtil
   */
  getGlobalParam(): IParams {
    throw new RuntimeError(ibiz.i18n.t('runtime.global.noImplemented'));
  }

  /**
   * @description 获取视图路由参数变量，数组类型，基于路由解析出来的，每一个对象里面都有context和params
   * @returns {*}  {IParams[]}
   * @memberof GlobalUtil
   */
  getRouterParams(): IParams[] {
    throw new RuntimeError(ibiz.i18n.t('runtime.global.noImplementedRouting'));
  }

  /**
   * @description 注册全局功能类扩展，用于替换预置能力
   * @param {keyof GlobalUtil} key
   * @param {*} value
   * @memberof GlobalUtil
   */
  registerExtension(key: keyof GlobalUtil, value: any): void {
    const self = this as IData;
    self[key] = value;
  }
}
