/**
 * @description 全局通用配置
 * @export
 * @interface IApiGlobalCommonConfig
 */
export interface IApiGlobalCommonConfig {
  /**
   * @description 无值显示文本,当值为空时显示此文本
   * @type {string}
   * @default `-`
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  emptyText: string;

  /**
   * @description 无值显示模式，值为 'PLACEHOLDER' 时显示占位文本内容，值为 'DEFAULT' 或占位文本无值时显示`emptyText`参数所设置的值
   * @type {'DEFAULT' | 'PLACEHOLDER'}
   * @default DEFAULT
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  emptyShowMode: 'DEFAULT' | 'PLACEHOLDER';

  /**
   * @description 模态参数，打开模态弹框时默认配置，pc端为element-plus 的dialog配置,移动端为vant的dialog配置
   * @type {string}
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  modalOption?: string;

  /**
   * @description 抽屉参数，打开抽屉时默认配置，pc端为element-plus 的drawer配置，移动端为vant的popup配置
   * @type {string}
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  drawerOption?: string;

  /**
   * @description 快速搜索框占位文本分隔符，用于分割实体属性中启用了支持快速搜索的属性名称
   * @type {string}
   * @default 、
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  searchPhSeparator: string;

  /**
   * @description 是否启用传入下载凭证
   * @type {boolean}
   * @default false
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  enableDownloadTicket: boolean;

  /**
   * @description 批操作工具栏显示模式，值为 'default' 时表示存在选择数据就显示批操作工具栏，值为 'multiple' 时表示选择至少2条数据才显示批操作工具栏。该参数仅PC端（卡片、列表、表格、树表格）使用
   * @type {'default' | 'multiple'}
   * @default default
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  batchToolbarMode: 'default' | 'multiple';

  /**
   * @description 是否合并子应用菜单模型，值为 'default' 时表示应用默认合并子应用菜单模型，值为 'disable' 时表示不合并子应用菜单模型
   * @type {'default' | 'disable'}
   * @default default
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  mergeAppMenu: 'default' | 'disable';

  /**
   * @description 是否启用AI聊天最小化
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  enableAIMinimize: boolean;

  /**
   * @description AI聊天话题标题模式，default:默认值，由外部传入标题决定;snippet：片段,新建或重置会话时默认显示新会话，如果获取到的history内容中包含user信息，则取最后一条user信息截取用作标题,若未能取到标题时等待用户输入第一个user消息后截取作为标题;summary：摘要，需调用ai接口生成摘要作为标题
   * @type {'default' | 'snippet' | 'summary'}
   * @default default
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  aiChatTopicCaptionMode: 'default' | 'snippet' | 'summary';

  /**
   * @description AI资源模式，LOCAL:默认值，会话基于config存储、消息内容均存储客户端; REMOTE：远程，会话基于config和远程session存储、消息内容基于远程消息存储
   * @type {'LOCAL' | 'REMOTE'}
   * @default undefined
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  aiResourceMode: 'LOCAL' | 'REMOTE' | undefined;

  /**
   * @description 是否启用AI智能助助切换
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  enableAIAgentChange: boolean;

  /**
   * @description 是否启用AI知识库选择
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  enableKnowledgeBaseSelect: boolean;

  /**
   * @description 是否启用AI召回配置设置
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  enableRecallConfigSetting: boolean;

  /**
   * @description 召回重排默认值(禁用|启用|自动)
   * @type {0 | 1 | 2}
   * @default 2
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  reRankDefaultValue: 0 | 1 | 2;

  /**
   * @description 最大召回数量默认值
   * @type {number}
   * @default 10
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  maxChunksDefaultValue: number;

  /**
   * @description 召回阈值默认值
   * @type {number}
   * @default 0.4
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  chunkThresholdDefaultValue: number;

  /**
   * @description 资料页面目录召回
   * @type {0 | 1 | undefined}
   * @default undefined
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  chunkPageIndexDefaultValue: 0 | 1 | undefined;

  /**
   * @description 是否启用全局下载文件前缀
   * @type {boolean}
   * @default false
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  globalDownloadPrifix: boolean;

  /**
   * @description 当路由跳转完成时，应用内部是否自动关闭打开的模态类视图
   * @type {boolean}
   * @default false
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  autoCloseModalView: boolean;

  /**
   * @description AI聊天标题摘要最大字符数
   * @type {number}
   * @default 30
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  aiChatSummaryMaxTokens: number;

  /**
   * @description 是否启用异步操作通知
   * @type {boolean}
   * @default true
   * @platform web
   * @platform mob
   * @memberof IApiGlobalCommonConfig
   */
  enableAsyncActionNotice: boolean;

  /**
   * @description 知识切片视图，用于定义AI交谈打开知识切片视图
   * @type {string}
   * @default ''
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  aiChunkView: string;

  /**
   * @description 知识切片实体，用于定义AI交谈打开知识切片数据主键key
   * @type {string}
   * @default ''
   * @platform web
   * @memberof IApiGlobalCommonConfig
   */
  aiChunkEntity: string;
}
