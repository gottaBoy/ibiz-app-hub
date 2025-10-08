import { IApiControlState } from '../i-api-control.state';
import { IApiQuickSearchItem } from './i-quick-search';

/**
 * @description 搜索栏状态接口
 * @primary
 * @export
 * @interface IApiSearchBarState
 * @extends {IApiControlState}
 */
export interface IApiSearchBarState extends IApiControlState {
  /**
   * @description 快速搜索值
   * @type {string}
   * @default ''
   * @memberof IApiSearchBarState
   */
  query: string;

  /**
   * @description 是否显示
   * @type {boolean}
   * @default true
   * @memberof IApiSearchBarState
   */
  visible: boolean;

  /**
   * @description 快速搜索项集合
   * @type {IApiQuickSearchItem[]}
   * @default []
   * @memberof IApiSearchBarState
   */
  quickSearchItems: IApiQuickSearchItem[];

  /**
   * @description 快速搜索字段名称集合
   * @type {string[]}
   * @default []
   * @memberof IApiSearchBarState
   */
  quickSearchFieldNames: string[];

  /**
   * @description 快速搜索输入框的placeHolder
   * @type {string}
   * @default ''
   * @memberof IApiSearchBarState
   */
  quickSearchPlaceHolder: string;

  /**
   * @description  过滤模式
   * @type {('default' | 'pql')}
   * @default 'default'
   * @memberof IApiSearchBarState
   */
  filterMode?: 'default' | 'pql';

  /**
   * @description 自定义条件，pql模式下的过滤节点条件
   * @type {string}
   * @default ''
   * @memberof IApiSearchBarState
   */
  customCond?: string;
}
