import { IControl } from '../icontrol';
import { IControlContainer } from '../icontrol-container';
import { ISearchBarFilter } from './isearch-bar-filter';
import { ISearchBarGroup } from './isearch-bar-group';
import { ISearchBarQuickSearch } from './isearch-bar-quick-search';

/**
 *
 * 搜索栏部件模型对象基础接口
 * @export
 * @interface ISearchBar
 */
export interface ISearchBar extends IControlContainer, IControl {
  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 分组模式
   * @description 值模式 [搜索栏过滤分组模式] {SINGLE：单项、 AND：多项（与逻辑）、 OR：多项（或逻辑） }
   * @type {( string | 'SINGLE' | 'AND' | 'OR')}
   * @default SINGLE
   * 来源  getGroupMode
   */
  groupMode?: string | 'SINGLE' | 'AND' | 'OR';

  /**
   * 更多分组显示文本
   * @type {string}
   * 来源  getGroupMoreText
   */
  groupMoreText?: string;

  /**
   * 应用计数器引用
   *
   * @type {string}
   * 来源  getPSAppCounterRef
   */
  appCounterRefId?: string;

  /**
   * 过滤项集合
   *
   * @type {ISearchBarFilter[]}
   * 来源  getPSSearchBarFilters
   */
  searchBarFilters?: ISearchBarFilter[];

  /**
   * 分组项集合
   *
   * @type {ISearchBarGroup[]}
   * 来源  getPSSearchBarGroups
   */
  searchBarGroups?: ISearchBarGroup[];

  /**
   * 快速搜索项集合
   *
   * @type {ISearchBarQuickSearch[]}
   * 来源  getPSSearchBarQuickSearchs
   */
  searchBarQuickSearchs?: ISearchBarQuickSearch[];

  /**
   * 快速分组显示数量
   * @type {number}
   * 来源  getQuickGroupCount
   */
  quickGroupCount?: number;

  /**
   * 快速搜索模式
   * @description 值模式 [搜索栏快速搜索模式] {0：否、 1：默认、 2：高级（快速搜索项） }
   * @type {( number | 0 | 1 | 2)}
   * 来源  getQuickSearchMode
   */
  quickSearchMode?: number | 0 | 1 | 2;

  /**
   * 快速搜索框宽度
   * @type {number}
   * 来源  getQuickSearchWidth
   */
  quickSearchWidth?: number;

  /**
   * 搜索栏样式
   * @description 值模式 [实体搜索栏样式] {SEARCHBAR：搜索栏、 SEARCHBAR2：搜索栏2、 MOBSEARCHBAR：移动端搜索栏、 MOBSEARCHBAR2：移动端搜索栏2、 USER：用户自定义、 USER2：用户自定义2 }
   * @type {( string | 'SEARCHBAR' | 'SEARCHBAR2' | 'MOBSEARCHBAR' | 'MOBSEARCHBAR2' | 'USER' | 'USER2')}
   * 来源  getSearchBarStyle
   */
  searchBarStyle?:
    | string
    | 'SEARCHBAR'
    | 'SEARCHBAR2'
    | 'MOBSEARCHBAR'
    | 'MOBSEARCHBAR2'
    | 'USER'
    | 'USER2';

  /**
   * 支持过滤器
   * @type {boolean}
   * 来源  isEnableFilter
   */
  enableFilter?: boolean;

  /**
   * 支持数据分组
   * @type {boolean}
   * 来源  isEnableGroup
   */
  enableGroup?: boolean;

  /**
   * 支持快速搜索
   * @type {boolean}
   * 来源  isEnableQuickSearch
   */
  enableQuickSearch?: boolean;

  /**
   * 移动端搜索栏
   * @type {boolean}
   * 来源  isMobileSearchBar
   */
  mobileSearchBar?: boolean;
}
