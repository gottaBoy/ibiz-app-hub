import { IApiGlobalAppMenuConfig } from './i-api-global-app-menu-config';
import { IApiGlobalCodeListConfig } from './i-api-global-codelist-config';
import { IApiGlobalCommonConfig } from './i-api-global-common-config';
import { IApiGlobalFormConfig } from './i-api-global-form-config';
import { IApiGlobalGridConfig } from './i-api-global-grid-config';
import { IApiGlobalKanbanConfig } from './i-api-global-kanban-config';
import { IApiGlobalPickerEditorConfig } from './i-api-global-picker-editor-config';
import { IApiGlobalUploadEditorConfig } from './i-api-global-upload-editor-config';
import { IApiGlobalSearchFormConfig } from './i-api-global-search-form-config';
import { IApiGlobalTreeConfig } from './i-api-global-tree-config';
import { IApiGlobalViewConfig } from './i-api-global-view-config';
import { IApiGlobalFlowDrtabConfig } from './i-api-global-flow-drtab-config';
import { IApiGlobalWaterMarkConfig } from './i-api-global-water-mark-config';
import { IApiGlobalMobConfig } from './i-api-global-mob-config';

/**
 * 全局配置
 * @description 全局配置参数，应用将依据这些参数进行调整和适配。
 * @export
 * @interface IApiGlobalConfig
 */
export interface IApiGlobalConfig {
  /**
   * @description 应用默认主题
   * @type {('light' | 'dark' | 'blue')} (亮色|暗色|蓝色)
   * @default 'light'
   * @memberof IApiGlobalConfig
   */
  theme?: 'light' | 'dark' | 'blue';

  /**
   * @description 全局视图配置
   * @type {IApiGlobalViewConfig}
   * @memberof IApiGlobalConfig
   */
  view: IApiGlobalViewConfig;

  /**
   * @description 全局表格配置
   * @type {IApiGlobalGridConfig}
   * @memberof IApiGlobalConfig
   */
  grid: IApiGlobalGridConfig;

  /**
   * @description 全局菜单配置
   * @type {IApiGlobalAppMenuConfig}
   * @memberof IApiGlobalConfig
   */
  appMenu: IApiGlobalAppMenuConfig;

  /**
   * @description 全局代码表配置
   * @type {IApiGlobalCodeListConfig}
   * @memberof IApiGlobalConfig
   */
  codeList: IApiGlobalCodeListConfig;

  /**
   * @description 全局表单配置
   * @type {IApiGlobalFormConfig}
   * @memberof IApiGlobalConfig
   */
  form: IApiGlobalFormConfig;

  /**
   * @description 全局看板配置
   * @type {IApiGlobalKanbanConfig}
   * @memberof IApiGlobalConfig
   */
  kanban: IApiGlobalKanbanConfig;

  /**
   * @description 全局下拉选择类编辑器配置
   * @type {IApiGlobalPickerEditorConfig}
   * @memberof IApiGlobalConfig
   */
  pickerEditor: IApiGlobalPickerEditorConfig;

  /**
   * @description 全局上传类编辑器配置
   * @type {IApiGlobalUploadEditorConfig}
   * @memberof IApiGlobalConfig
   */
  uploadEditor: IApiGlobalUploadEditorConfig;

  /**
   * @description 全局搜索表单配置
   * @type {IApiGlobalSearchFormConfig}
   * @memberof IApiGlobalConfig
   */
  searchform: IApiGlobalSearchFormConfig;

  /**
   * @description 全局树配置
   * @type {IApiGlobalTreeConfig}
   * @memberof IApiGlobalConfig
   */
  tree: IApiGlobalTreeConfig;

  /**
   * @description 全局通用配置
   * @type {IApiGlobalCommonConfig}
   * @memberof IApiGlobalConfig
   */
  common: IApiGlobalCommonConfig;

  /**
   * @description 多数据部件默认排序配置,格式为“排序字段,排序顺序”，如："id,asc"
   * @type {string}
   * @memberof IApiGlobalConfig
   */
  mdctrldefaultsort: string;

  /**
   * @description 多数据部件刷新模式
   * @type {('nocache' | 'cache')}（无缓存模式 | 缓存模式）
   * @default 'cache'
   * @memberof IApiGlobalConfig
   */
  mdctrlrefreshmode: 'nocache' | 'cache';

  /**
   * @description 下拉选择类编辑器默认排序配置，编辑器获取下拉数据时的排序方向，如："asc"
   * @type {string}
   * @memberof IApiGlobalConfig
   */
  pickerdefaultsort: string;

  /**
   * @description 提示框信息绘制模式
   * @type {('none' | 'md' | 'html)} (文本模式 | markdown模式 | html模式)
   * @default 'md'
   * @memberof IApiGlobalConfig
   */
  tooltiprendermode: 'none' | 'md' | 'html';

  /**
   * @description 代码编辑器主题
   * @type {('light' | 'dark')}
   * @memberof IApiGlobalConfig
   */
  codeEditorTheme?: 'light' | 'dark';

  /**
   * @description drtab全局配置
   * @type {IApiGlobalFlowDrtabConfig}
   * @memberof IApiGlobalConfig
   */
  drtab: IApiGlobalFlowDrtabConfig;

  /**
   * @description 应用水印配置参数
   * @type {IApiGlobalWaterMarkConfig}
   * @memberof IApiGlobalConfig
   */
  watermark: IApiGlobalWaterMarkConfig;

  /**
   * @description 全局移动端配置
   * @type {IApiGlobalMobConfig}
   * @memberof IApiGlobalConfig
   */
  mob: IApiGlobalMobConfig;
}
