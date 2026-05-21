import { IApiContext, IApiParams } from '@ibiz-template/core';
import { ISysImage } from '@ibiz/model-core';
/**
 * @description 快捷方式数据
 * @export
 * @interface IApiShortCutData
 */
export interface IApiShortCutData {
  /**
   * @description 唯一标识
   * @type {string}
   * @memberof IApiShortCutData
   */
  key: string;
  /**
   * @description 快捷方式标题
   * @type {string}
   * @memberof IApiShortCutData
   */
  caption: string;
  /**
   * @description 视图标识
   * @type {string}
   * @memberof IApiShortCutData
   */
  appViewId: string;
  /**
   * @description 上下文
   * @type {IApiContext}
   * @memberof IApiShortCutData
   */
  context: IApiContext;
  /**
   * @description 视图参数
   * @type {IApiParams}
   * @memberof IApiShortCutData
   */
  params: IApiParams;
  /**
   * @description 打开方式
   * @type {string}
   * @memberof IApiShortCutData
   */
  openMode: string;
  /**
   * @description 全路径
   * @type {string}
   * @memberof IApiShortCutData
   */
  fullPath: string;
  /**
   * @description 快捷图标
   * @type {ISysImage}
   * @memberof IApiShortCutData
   */
  icon?: ISysImage;
}

/**
 * @description 最小化工具类
 * @export
 * @interface IApiShortCutUtil
 */
export interface IApiShortCutUtil {
  /**
   * @description 快捷方式数据
   * @type {IApiShortCutData[]}
   * @memberof IApiShortCutUtil
   */
  data: IApiShortCutData[];

  /**
   * @description 快捷方式模式
   * @type {('horizontal' | 'vertical')}
   * @memberof IApiShortCutUtil
   */
  mode: 'horizontal' | 'vertical';

  /**
   * @description 设置快捷方式模式
   * @param {('horizontal' | 'vertical')} mode 快捷方式模式
   * @memberof IApiShortCutUtil
   */
  setShortCutMode(mode: 'horizontal' | 'vertical'): void;

  /**
   * @description 订阅数据改变事件
   * @param {(data: IApiShortCutData[]) => void} callback 回调函数
   * @memberof IApiShortCutUtil
   */
  onChange(callback: (data: IApiShortCutData[]) => void): void;

  /**
   * @description 取消订阅数据改变事件
   * @param {(data: IApiShortCutData[]) => void} callback 回调函数
   * @memberof IApiShortCutUtil
   */
  offChange(callback: (data: IApiShortCutData[]) => void): void;

  /**
   * @description 计算快捷方式key
   * @param {{
   *     context: IApiContext; // 上下文参数
   *     appViewId: string; // 应用视图id
   *   }} {
   *     context,
   *     appViewId,
   *   }
   * @returns {*}  {Promise<string>}
   * @memberof IApiShortCutUtil
   */
  calcShortCutKey({
    context,
    appViewId,
  }: {
    context: IApiContext;
    appViewId: string;
  }): Promise<string>;

  /**
   * @description 添加快捷方式
   * @param {IApiShortCutData} shortCut 快捷方式数据
   * @memberof IApiShortCutUtil
   */
  addShortCut(shortCut: IApiShortCutData): void;

  /**
   * @description 删除快捷方式
   * @param {string} key 快捷方式数据标识
   * @memberof IApiShortCutUtil
   */
  removeShortCut(key: string): void;

  /**
   * @description 改变顺序
   * @param {number} newIndex 新索引
   * @param {number} oldIndex 旧索引
   * @memberof IApiShortCutUtil
   */
  changeIndex(newIndex: number, oldIndex: number): void;

  /**
   * @description 是否存在最小化
   * @param {string} key 快捷方式数据标识
   * @returns {*}  {boolean}
   * @memberof IApiShortCutUtil
   */
  isExist(key: string): boolean;
}
