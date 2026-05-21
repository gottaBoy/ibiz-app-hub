/* eslint-disable @typescript-eslint/no-explicit-any */
import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IAppDEACMode } from '@ibiz/model-core';
import { IApiControlController, IApiViewController } from '../controller';

/**
 * @description AI聊天工具栏项
 */
export interface IApiAIToolbarItem {
  /**
   * @description 应用标识
   * @type {string}
   * @memberof IApiAIToolbarItem
   */
  appId: string;

  /**
   * @description 工具栏项标识
   * @type {(string | undefined)}
   * @memberof IApiAIToolbarItem
   */
  id: string | undefined;

  /**
   * @description 工具栏项标签
   * @type {(string | undefined)}
   * @memberof IApiAIToolbarItem
   */
  label: string | undefined;

  /**
   * @description 工具栏项提示信息
   * @type {(string | undefined)}
   * @memberof IApiAIToolbarItem
   */
  title: string | undefined;

  /**
   * @description 工具栏项图标
   * @type {{
   *     showIcon?: boolean; // 是否显示图标
   *     cssClass?: string; // 图标CSS类名
   *     imagePath?: string; // 图标地址
   *   }}
   * @memberof IApiAIToolbarItem
   */
  icon: {
    showIcon?: boolean;
    cssClass?: string;
    imagePath?: string;
  };
}

/**
 * @description AI聊天工具
 */
export interface IApiAIChatUtil {
  /**
   * @description 获取AI聊天对象
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiAIChatUtil
   */
  getAIChat(): Promise<IApiData>;

  /**
   * @description 获取编辑器扩展AI聊天参数
   * @param {IApiData} editorParams 编辑器参数
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} data 数据
   * @param {IAppDEACMode} deACMode 自填模式
   * @param {{
   *       chatInstance: IApiData; // AI聊天对象实例
   *       view: IApiViewController; // 视图控制器
   *       ctrl?: IApiControlController; // 部件控制器
   *       [key: string]: any;
   *     }} args 额外参数
   * @returns {*}  {Promise<{
   *     containerOptions: IApiData;
   *     topicOptions: IApiData;
   *     chatOptions: IApiData;
   *   }>}
   * @memberof IApiAIChatUtil
   */
  getEditorExAIChatParams(
    editorParams: IApiData,
    context: IApiContext,
    params: IApiParams,
    data: IApiData,
    deACMode: IAppDEACMode,
    args: {
      chatInstance: IApiData;
      view: IApiViewController;
      ctrl?: IApiControlController;
      [key: string]: any;
    },
  ): Promise<{
    containerOptions: IApiData;
    topicOptions: IApiData;
    chatOptions: IApiData;
  }>;

  /**
   * @description 获取界面行为扩展AI聊天参数
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} data 数据
   * @param {IAppDEACMode} deACMode 自填模式
   * @param {{
   *       chatInstance: IApiData; // AI聊天对象实例
   *       view: IApiViewController; // 视图控制器
   *       ctrl?: IApiControlController; // 部件控制器
   *       [key: string]: any;
   *     }} args 额外参数
   * @returns {*}  {Promise<{
   *     containerOptions: IApiData;
   *     topicOptions: IApiData;
   *     chatOptions: IApiData;
   *   }>}
   * @memberof IApiAIChatUtil
   */
  getUIActionExAIChatParams(
    context: IApiContext,
    params: IApiParams,
    data: IApiData,
    deACMode: IAppDEACMode,
    args: {
      chatInstance: IApiData;
      view: IApiViewController;
      ctrl?: IApiControlController;
      [key: string]: any;
    },
  ): Promise<{
    containerOptions: IApiData;
    topicOptions: IApiData;
    chatOptions: IApiData;
  }>;

  /**
   * @description 计算界面行为扩展AI聊天工具栏项
   * @param {IAppDEACMode} [deACMode] 自填模式
   * @returns {*}  {{
   *     contentToolbarItems: IApiAIToolbarItem[];
   *     footerToolbarItems: IApiAIToolbarItem[];
   *     questionToolbarItems: IApiAIToolbarItem[];
   *     otherToolbarItems: IApiAIToolbarItem[];
   *     functionToolbarItems: IApiAIToolbarItem[];
   *     inlineToolbarItems: IApiAIToolbarItem[];
   *   }}
   * @memberof IApiAIChatUtil
   */
  calcAiToolbarItemsByAc(deACMode?: IAppDEACMode): {
    contentToolbarItems: IApiAIToolbarItem[];
    footerToolbarItems: IApiAIToolbarItem[];
    questionToolbarItems: IApiAIToolbarItem[];
    otherToolbarItems: IApiAIToolbarItem[];
    functionToolbarItems: IApiAIToolbarItem[];
    inlineToolbarItems: IApiAIToolbarItem[];
  };

  /**
   * @description 获取AI代理列表
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @param {IApiData} [editorParams] 编辑器参数
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiAIChatUtil
   */
  getAIAgentList(
    context: IApiContext,
    params: IApiParams,
    editorParams?: IApiData,
  ): Promise<IApiData[]>;

  /**
   * @description 获取会话标识(TOPIC:适用于多话题场景；INLINE：适用于ai行内会话场景；TEMP：适用于传统ai编辑器会话场景)
   * @param {('TOPIC' | 'INLINE' | 'TEMP')} type 会话类型
   * @param {string} [sessionID] 会话id
   * @returns {*}  {string}
   * @memberof IApiAIChatUtil
   */
  getChatSessionId(
    type: 'TOPIC' | 'INLINE' | 'TEMP',
    sessionID?: string,
  ): string;

  /**
   * @description 获取AI资源参数
   * @param {IApiContext} context 上下文参数
   * @param {IApiParams} params 视图参数
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiAIChatUtil
   */
  getAIResourceOptions(
    context: IApiContext,
    params: IApiParams,
  ): Promise<IApiData>;
}
