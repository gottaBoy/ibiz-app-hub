import { IColumnState } from '../i-grid.state';

/**
 * @description 搜索分组数据接口
 * @export
 * @interface ISearchGroupData
 */
export interface ISearchGroupData {
  /**
   * @description 表格列状态
   * @type {Array<IColumnState>}
   * @memberof ISearchGroupData
   */
  columnstates?: Array<IColumnState>;

  /**
   * @description  自定义搜索条件
   * @type {IData[]}
   * @memberof ISearchGroupData
   */
  searchconds?: IData[];

  /**
   * @description 表格排序查询条件
   * @type {string}
   * @memberof ISearchGroupData
   */
  sort?: string;
}

/**
 * @description 后台分组接口
 * @export
 * @interface IBackendSearchBarGroup
 */
export interface IBackendSearchBarGroup {
  /**
   * @description 唯一标识
   * @type {string}
   * @memberof IBackendSearchBarGroup
   */
  id?: string;

  /**
   * @description 标题
   * @type {string}
   * @memberof IBackendSearchBarGroup
   */
  caption?: string;

  /**
   * @description 分组项名称（模型的id, 新建的为viewtag___caption）
   * @type {string}
   * @memberof IBackendSearchBarGroup
   */
  name: string;

  /**
   * @description 是否保存过
   * @type {boolean}
   * @memberof IBackendSearchBarGroup
   */
  saved: boolean;

  /**
   * @description 是否显示
   * @type {boolean}
   * @memberof IBackendSearchBarGroup
   */
  show: boolean;

  /**
   * @description 分组排序值
   * @type {number}
   * @memberof IBackendSearchBarGroup
   */
  order: number;

  /**
   * @description 搜索分组数据
   * @type {ISearchGroupData}
   * @memberof IBackendSearchBarGroup
   */
  searchGroupData: ISearchGroupData;

  /**
   * @description 是否默认选中
   * @type {boolean}
   * @memberof IBackendSearchBarGroup
   */
  defaultSelect?: boolean;

  /**
   * @description 是否不可编辑
   * @type {boolean}
   * @memberof IBackendSearchBarGroup
   */
  noEdit?: boolean;

  /**
   * @description 所属类型
   * @type {('SYSTEM' | 'PERSONAL')}
   * @memberof IBackendSearchBarGroup
   */
  ownerType?: 'SYSTEM' | 'PERSONAL';

  /**
   * @description 计数器id
   * @type {string}
   * @memberof IBackendSearchBarGroup
   */
  counterId?: string;

  /**
   * @description 计数器显示模式 {0：默认、 1：0 值时隐藏 }
   * @type {number}
   * @memberof IBackendSearchBarGroup
   */
  counterMode?: number;
}
