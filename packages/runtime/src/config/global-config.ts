import {
  IGlobalConfig,
  IGlobalGridConfig,
  IGlobalAppMenuConfig,
  IGlobalCodeListConfig,
  IGlobalViewConfig,
  IGlobalPickerEditorConfig,
  IGlobalUploadEditorConfig,
  IGlobalFormConfig,
  IGlobalSearchFormConfig,
  IGlobalTreeConfig,
  IGlobalCommonConfig,
  IApiGlobalKanbanConfig,
  IGlobalFlowDrtabConfig,
  IApiGlobalWaterMarkConfig,
  IGlobalMobConfig,
  IGlobalImgCompressConfig,
} from '../interface';

/**
 * 全局配置类,控制应用的功能开关。
 *
 * @author lxm
 * @date 2022-12-09 14:12:28
 * @export
 * @class GlobalConfig
 * @implements {IGlobalConfig}
 */
export class GlobalConfig implements IGlobalConfig {
  // 全局视图配置
  view: IGlobalViewConfig = {
    enableDataInfoBar: true,
    expCacheMode: 'TABEXPPANEL:',
    disableHomeTabs: false,
    mobShowPresetBack: true,
    mobShowViewHeader: true,
    timeoutDuration: 5 * 60 * 1000,
    onlyShowDataInfo: false,
    viewAccUserMode: 3,
    loadingText: '',
  };

  // 全局表格配置
  grid: IGlobalGridConfig = {
    editShowMode: 'row',
    editSaveMode: 'cell-blur',
    saveErrorHandleMode: 'default',
    overflowMode: 'wrap',
    emptyHiddenUnit: true,
  };

  // 全局菜单配置
  appMenu: IGlobalAppMenuConfig = {
    enableEcho: true,
    echoMode: 'VIEW',
    defaultCollapse: false,
  };

  // 全局代码表配置
  codeList: IGlobalCodeListConfig = {
    timeout: 60 * 60 * 1000,
  };

  // 全局表单配置
  form: IGlobalFormConfig = {
    mdCtrlConfirmBeforeRemove: true,
    mobShowUnderLine: true,
    mobFormItemAlignMode: '',
    mobShowEditorBorder: false,
    emptyHiddenUnit: true,
    showTipsIcon: true,
    validateMode: 'default',
    srfCachePos: false,
    srfCacheKeyTempl: '',
    enableDynaFormJsonSchema: false,
  };

  // 全局看板配置
  kanban: IApiGlobalKanbanConfig = {
    enableFullScreen: true,
    enableGroupHidden: false,
  };

  // 全局下拉选择类编辑器配置
  pickerEditor: IGlobalPickerEditorConfig = {
    overflowMode: 'auto',
  };

  // 全局上传类编辑器配置
  uploadEditor: IGlobalUploadEditorConfig = {
    infoMap: '',
  };

  // 全局搜索表单配置
  searchform: IGlobalSearchFormConfig = {
    enableStoredFilters: true,
    convertParamMode: 'default',
  };

  // 全局树配置
  tree: IGlobalTreeConfig = {
    contextMenuRightClickInvoke: true,
    enableClickNav: false,
  };

  // 全局通用配置
  common: IGlobalCommonConfig = {
    emptyText: '-',
    emptyShowMode: 'DEFAULT',
    searchPhSeparator: '、',
    enableDownloadTicket: false,
    batchToolbarMode: 'default',
    mergeAppMenu: 'default',
    enableAIMinimize: true,
    aiChatTopicCaptionMode: 'default',
    aiResourceMode: undefined,
    enableAIAgentChange: true,
    globalDownloadPrifix: false,
    autoCloseModalView: false,
    aiChatSummaryMaxTokens: 30,
    enableKnowledgeBaseSelect: true,
    enableRecallConfigSetting: true,
    reRankDefaultValue: 2,
    maxChunksDefaultValue: 10,
    chunkThresholdDefaultValue: 0.1,
    chunkPageIndexDefaultValue: undefined,
    enableAsyncActionNotice: false,
    aiChunkView: '',
    aiChunkEntity: '',
  };

  // 全局分页流布局配置
  drtab: IGlobalFlowDrtabConfig = {
    enableNavbar: false,
    navbarPos: 'TOPRIGHT',
    navbarWidth: 200,
  };

  // 多数据部件默认排序配置
  mdctrldefaultsort: string = '';

  // 多数据部件刷新模式
  mdctrlrefreshmode: 'nocache' | 'cache' = 'cache';

  // 下拉选择类编辑器默认排序配置
  pickerdefaultsort: string = '';

  // 提示框信息绘制模式
  tooltiprendermode: 'none' | 'md' | 'html' = 'md';

  // 应用水印参数
  watermark: IApiGlobalWaterMarkConfig = {
    enable: false,
    text: '',
    fontSize: 14,
    fontFamily: 'Microsoft YaHei',
    fontWeight: 400,
    fontStyle: 'normal',
    color: 'rgba(0,0,0,0.5)',
    opacity: 0.3,
    rotate: -30,
    gap: [90, 90],
    offset: [0, 0],
    tileSize: { width: 0, height: 0 },
    zIndex: 9999,
    useShadowDom: true,
    protect: true,
    allowSelect: false,
    strictProtect: false,
    ensureRelative: true,
  };

  /**
   * @description 全局移动端配置
   * @type {IGlobalMobConfig}
   * @memberof GlobalConfig
   */
  mob: IGlobalMobConfig = {
    mobShowAppTitle: true,
    mobHomeRouteMode: 'default',
    mobGetSignUrl: '',
    mobGetSignMethod: 'post',
    mobWeChatDebug: false,
    showUploadLoading: false,
    mobShowBackTop: false,
    mobEnableStoredQuery: false,
    toolbarShowMode: 'IMMEDIATE',
    toolbarGroupShowMode: 'ACTIONSHEET',
  };

  /**
   * @description 图片压缩配置
   * @type {IGlobalImgCompressConfig}
   * @memberof GlobalConfig
   */
  imgCompressConfig: IGlobalImgCompressConfig = {
    limit: 1024,
    quality: 0,
    maxWidth: 1280,
  };
}
