import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IAppDEACMode } from '@ibiz/model-core';

/**
 * @description 行内AI聊天参数
 * @export
 * @interface IApiInLineAiChatOptions
 */
export interface IApiInLineAiChatOptions {
  /**
   * @description 聊天框左侧位置
   */
  left: number;
  /**
   * @description 聊天框顶部位置
   */
  top: number;
  /**
   * @description 聊天框宽度
   */
  width: number;
  /**
   * @description 聊天框宽度
   */
  editorElement: Element;
  /**
   * @description 编辑器主题，若编辑器有多套主题，需转化成light或者dark
   */
  editorTheme: 'light' | 'dark';
  /**
   * @description 聊天框高度（默认高度）
   */
  height?: number;
  /**
   * @description 聊天框最大高度
   */
  maxHeight?: number;
}

/**
 * @description 行内AI工具类
 * @export
 * @interface IApiInLineAIUtil
 */
export interface IApiInLineAIUtil {
  /**
   * @description 计算上下文菜单
   * @param {IAppDEACMode | undefined} deACMode 自填模式
   * @param {(tag: string) => void} clickCallBack 项点击回调
   * @returns {IApiData[]}
   * @memberof IApiInLineAIUtil
   */
  calcContextMenus(
    deACMode: IAppDEACMode | undefined,
    clickCallBack: (tag: string) => void,
  ): IApiData[];

  /**
   * @description 显示上下文菜单
   * @param {number} x 距离左侧距离
   * @param {number} y 距离上方距离
   * @param {IApiData[]} menus 菜单集合
   * @param {IData} [options] 菜单配置
   * @memberof IApiInLineAIUtil
   */
  showContextMenus(
    x: number,
    y: number,
    menus: IApiData[],
    options?: IApiData,
  ): void;

  /**
   * @description 显示AI聊天
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} data 业务数据
   * @param {string} selectText 选中文本
   * @param {IAppDEACMode} deACMode 自填模式
   * @param {IApiInLineAiChatOptions} options 聊天配置
   * @memberof IApiInLineAIUtil
   */
  showAIChat(
    context: IApiContext,
    params: IApiParams,
    data: IApiData,
    selectText: string,
    deACMode: IAppDEACMode,
    options: IApiInLineAiChatOptions,
  ): void;

  /**
   * @description 隐藏AI聊天
   * @memberof IApiInLineAIUtil
   */
  hideAIChat(): void;
}
