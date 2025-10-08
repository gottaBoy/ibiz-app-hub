import { mergeInLeft, recursiveIterate } from '@ibiz-template/core';
import {
  IAppDataEntity,
  ISearchBar,
  ISearchBarFilter,
  ISearchBarGroup,
} from '@ibiz/model-core';
import { clone } from 'ramda';
import { isString } from 'lodash-es';
import {
  ISearchBarState,
  ISearchBarEvent,
  ISearchBarController,
  IBackendSearchBarGroup,
  IGridController,
  IFilterNode,
  ISearchCondEx,
  ISearchCondField,
  IFilterNodeGroup,
  IFilterNodeCustom,
  IMobMDCtrlController,
  IColumnState,
} from '../../../interface';
import { convertNavData, ScriptFactory } from '../../../utils';
import { ControlController } from '../../common';
import { SearchBarFilterController } from './search-bar-filter.controller';
import { SearchBarService } from './search-bar.service';
import { getEntitySchema } from '../../utils';
import { calcFilterModelBySchema } from './entity-schema';
import { SearchBarFilterItemsController } from './search-bar-filter-items.controller';
import {
  getOriginFilterNodes,
  calcSearchCondExs,
  SearchCondEx2filterNode,
  calcSearchConds,
} from './interface-util';
import { ItemsValueOPs, isSimpleItems } from './util';
import { SearchBarFilterSimpleItemsController } from './search-bar-filter-simple-items.controller';
import { findFieldById } from '../../../model';
import { AppCounter, CounterService } from '../../../service';

const ScriptValueRegex = /\$\{[^}]*\}/; // 匹配${xxx}格式字符串

/**
 * 搜索栏控制器
 *
 * @author chitanda
 * @date 2022-07-24 15:07:07
 * @export
 * @class SearchBarController
 * @extends {ControlController}
 */
export class SearchBarController
  extends ControlController<ISearchBar, ISearchBarState, ISearchBarEvent>
  implements ISearchBarController
{
  /**
   * 快速搜索占位符（根据属性计算出来的快速搜索占位符）
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-08-11 14:13:10
   */
  placeHolder = '';

  /**
   * 过滤项控制器集合
   * @author lxm
   * @date 2023-10-13 03:31:26
   * @type {SearchBarFilterController[]}
   */
  filterControllers: SearchBarFilterController[] = [];

  /**
   * 搜索栏服务
   * @author lxm
   * @date 2023-05-15 11:03:34
   * @type {EditFormService}
   */
  service!: SearchBarService;

  /**
   * 当前编辑的分组
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-20 18:06:37
   */
  currentEditGroup: IBackendSearchBarGroup | null = null;

  /**
   * 是否为后台分组
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-21 10:17:43
   */
  isBackendSearchGroup = this.model.searchBarStyle === 'SEARCHBAR2';

  /**
   * 是否有默认选中
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-21 10:17:43
   */
  hasDefaultSelect = false;

  /**
   * @description 计数器对象
   * @type {AppCounter}
   * @memberof SearchBarController
   */
  counter?: AppCounter;

  /**
   * 启用自定义过滤项
   * @author lxm
   * @date 2023-12-29 04:15:34
   * @type {boolean}
   */
  get enableFilter(): boolean {
    return this.model.enableFilter === true;
  }

  /**
   * 最终使用的searchBarFilters
   * @author lxm
   * @date 2023-12-29 06:55:13
   * @type {ISearchBarFilter[]}
   */
  get searchBarFilters(): ISearchBarFilter[] {
    return this.model.searchBarFilters || [];
  }

  /**
   * 是否启用根据实体的JSON Schema生成过滤项
   * @author lxm
   * @date 2024-01-05 10:10:37
   */
  addSchemaFilters = false;

  /**
   * jsonschema参数
   *
   * @author zhanghengfeng
   * @date 2024-07-05 15:07:47
   * @type {IParams}
   */
  jsonSchemaParams: IParams = {};

  /**
   * schema实体映射map
   *
   * @author zhanghengfeng
   * @date 2024-07-22 16:07:55
   */
  schemaEntityMap: Map<string, string | undefined> = new Map();

  /**
   * 表格控制器
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-22 13:50:16
   */
  get grid(): IGridController | undefined {
    return (this.ctx.getController('grid') ||
      this.ctx.getController('treegrid')) as IGridController;
  }

  /**
   * 移动端-多数据控制器
   *
   * @readonly
   * @type {(IListController | undefined)}
   * @memberof SearchBarController
   */
  get mdctrl(): IMobMDCtrlController | undefined {
    return this.ctx.getController('mdctrl') as IMobMDCtrlController;
  }

  /**
   * @description 快速搜索提示分隔符
   * @readonly
   * @type {string}
   * @memberof SearchBarController
   */
  get searchPhSeparator(): string {
    if (this.controlParams.searchphseparator) {
      return this.controlParams.searchphseparator;
    }
    return ibiz.config.common.searchPhSeparator;
  }

  /**
   * 实体模型
   * @author lxm
   * @date 2023-10-13 02:49:59
   * @type {IAppDataEntity}
   */
  appDataEntity!: IAppDataEntity;

  /**
   * 是否启用存储
   *
   * @author zhanghengfeng
   * @date 2024-05-29 20:05:47
   * @type {boolean}
   */
  enableStorage: boolean = false;

  /**
   * 生成存储key的函数
   *
   * @author zhanghengfeng
   * @date 2024-05-29 16:05:34
   */
  storageKeyFn?: () => string | undefined;

  /**
   * 设置生成存储key的函数
   *
   * @author zhanghengfeng
   * @date 2024-05-29 16:05:35
   * @param {(() => string | undefined)} fn
   */
  setStorageKeyFn(fn: () => string | undefined): void {
    this.storageKeyFn = fn;
  }

  protected initState(): void {
    super.initState();
    this.state.query = '';
    this.state.selectedGroupItem = null;
    this.state.searchBarGroups = [];
    this.state.selectedSearchGroupItem = null;
    this.state.advancedQuickSearch = false;
    this.state.quickSearchItems = [];
    this.state.quickSearchFieldNames = [];
    this.state.quickSearchPlaceHolder = '';
    this.state.filterMode = 'default';
    this.state.customCond = '';
    this.resetFilter();
    this.state.visible = !!(
      this.model.enableQuickSearch ||
      this.model.enableGroup ||
      this.enableFilter
    );
  }

  protected async onCreated(): Promise<void> {
    this.addSchemaFilters = this.controlParams.enablejsonschema === 'true';
    const jsonSchemaParams = JSON.parse(
      this.controlParams.jsonschemaparams || '{}',
    );
    this.jsonSchemaParams = convertNavData(
      jsonSchemaParams,
      this.params,
      this.context,
    );
    this.enableStorage = this.controlParams.storage === 'true';
    await this.initByEntitySchema();

    await super.onCreated();
    await this.initCounter();

    if (this.model.appDataEntityId) {
      const appDataEntity = await ibiz.hub.getAppDataEntity(
        this.model.appDataEntityId,
        this.context.srfappid,
      )!;
      if (appDataEntity) {
        this.appDataEntity = appDataEntity;
        this.calcQuickSearchPlaceholder();
        this.initAdvancedQuickSearch();
      }
    }

    if (this.isBackendSearchGroup && this.view.model.codeName) {
      this.service = new SearchBarService(
        this.model,
        this.view.model.codeName.toLowerCase(),
      );
      await this.service.init(this.context);
    }

    await this.initSearchBarFilters();
    await this.initSearBarGroups(true);
  }

  /**
   * 初始化schema实体映射map
   *
   * @author zhanghengfeng
   * @date 2024-07-22 16:07:14
   * @param {IData} json
   * @return {*}
   */
  async initSchemaEntityMap(json: IData): Promise<void> {
    if (!json.properties) {
      return;
    }
    const { properties } = json;
    if (!(Object.keys(properties).length > 0)) {
      return;
    }
    const map = new Map();
    Object.keys(properties).forEach((key: string) => {
      map.set(key, properties[key]?.$ref?.split('.')[0]);
    });
    this.schemaEntityMap = map;
  }

  /**
   * 根据实体jsonschema初始化
   * @author lxm
   * @date 2023-12-29 04:21:31
   * @return {*}  {Promise<void>}
   */
  async initByEntitySchema(): Promise<void> {
    if (!this.addSchemaFilters) {
      return;
    }
    const tempParams: IData = clone(this.jsonSchemaParams);
    Object.assign(tempParams, this.params);
    const json = await getEntitySchema(
      this.model.appDataEntityId!,
      this.context,
      tempParams,
    );
    if (!json) {
      return;
    }
    await this.initSchemaEntityMap(json);
    const addSearchBarFilters = await calcFilterModelBySchema(
      json,
      this.model.appDataEntityId!,
      this.model.appId,
    );

    const mergeFilters: ISearchBarFilter[] = [];
    this.model.searchBarFilters?.forEach(filter => {
      const findindex = addSearchBarFilters.findIndex(
        item =>
          item.appDEFieldId === filter.appDEFieldId &&
          (filter.defsearchMode?.valueOP
            ? item.defsearchMode!.valueOP === filter.defsearchMode.valueOP
            : true),
      );
      if (findindex === -1) {
        mergeFilters.push(filter);
      }
    });

    // 如果有根据json计算出的过滤项，则要重置相关state参数
    if (addSearchBarFilters.length > 0) {
      // 修改模型之前拷贝一份，避免污染原始数据
      (this as IData).model = clone(this.model);
      this.model.searchBarFilters = mergeFilters.concat(...addSearchBarFilters);
      this.model.enableFilter = true;
    }
  }

  /**
   * 计算快速搜索的占位
   * @author lxm
   * @date 2023-10-16 03:49:47
   * @protected
   * @return {*}  {void}
   */
  protected calcQuickSearchPlaceholder(): void {
    if (!this.appDataEntity) {
      return;
    }
    const searchFields = this.appDataEntity.appDEFields!.filter(field => {
      return field.enableQuickSearch;
    });
    if (searchFields.length) {
      const placeHolders: string[] = [];
      searchFields.forEach(searchField => {
        if (searchField.lnlanguageRes && searchField.lnlanguageRes.lanResTag) {
          placeHolders.push(
            ibiz.i18n.t(
              searchField.lnlanguageRes.lanResTag,
              searchField.logicName,
            ),
          );
        } else if (searchField.logicName) {
          placeHolders.push(searchField.logicName);
        }
      });
      if (placeHolders.length > 0) {
        this.placeHolder = placeHolders.join(this.searchPhSeparator);
        this.state.quickSearchPlaceHolder = this.placeHolder;
      }
    }
  }

  /**
   * 处理输入
   * @param {string} val
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-06-01 18:08:07
   */
  handleInput(val: string): void {
    this.state.query = val;
  }

  /**
   * 处理搜索
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-06-01 18:08:18
   */
  onSearch(): void {
    this.evt.emit('onSearch', undefined);
  }

  /**
   * 找到过滤项控制器
   * @author lxm
   * @date 2024-02-04 11:29:31
   * @param {(string | null)} fieldName
   * @param {(string | null)} valueOP
   * @return {*}  {(SearchBarFilterController | undefined)}
   */
  findFilterController(
    fieldName: string | null,
    valueOP: string | null,
  ): SearchBarFilterController | undefined {
    return this.filterControllers.find(item => {
      if (item.fieldName === fieldName) {
        // 有配属性搜索模式的匹配才是，没配的都是指向没配的哪个过滤项
        return item.valueOP ? item.valueOP === valueOP : true;
      }
      return false;
    });
  }

  /**
   * 获取搜索栏的过滤参数（包括快速搜索，快速分组和过滤器的参数）
   * @author lxm
   * @date 2023-10-16 03:54:07
   * @return {*}  {IParams}
   */
  getFilterParams(): IParams {
    const params: IParams = {};
    // 快速搜索
    if (this.state.query) {
      params.query = this.state.query;
      // 快速搜索高级
      if (
        this.state.advancedQuickSearch &&
        this.state.quickSearchFieldNames.length
      ) {
        params.queryconds = this.state.quickSearchFieldNames.map(
          name => `n_${name}_like`,
        );
      }
    }

    // 快速分组
    if (
      this.state.selectedGroupItem?.data &&
      typeof this.state.selectedGroupItem.data === 'string' &&
      !this.isBackendSearchGroup
    ) {
      let str = this.state.selectedGroupItem.data;
      try {
        const data = JSON.parse(str);
        if (data.theme_model?.searchconds)
          str = JSON.stringify({ searchconds: data.theme_model?.searchconds });
      } catch (error) {
        ibiz.log.error(error);
      } finally {
        const navParams = ScriptFactory.execSingleLine(str) as IData;
        const addParams = convertNavData(navParams, this.params, this.context);
        Object.assign(params, addParams);
      }
    }
    // 搜索过滤器
    const filters = this.calcFilters();
    if (filters) {
      params.searchconds = filters;
    }
    return params;
  }

  /**
   * 重置过滤器
   * @author lxm
   * @date 2023-10-16 03:52:44
   */
  resetFilter(): void {
    this.state.filterNodes = getOriginFilterNodes();
    this.evt.emit('onReset', undefined);
    this.evt.emit('onSearch', undefined);
  }

  /**
   * 初始化过滤项控制器
   * @author lxm
   * @date 2023-10-13 03:33:17
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initSearchBarFilters(): Promise<void> {
    if (this.searchBarFilters?.length) {
      const itemsMap = new Map<string, ISearchBarFilter[]>();
      this.searchBarFilters.forEach(item => {
        // 整理exists或者NOTEXISTS的模型
        if (
          item.defsearchMode?.valueOP &&
          ItemsValueOPs.includes(item.defsearchMode.valueOP)
        ) {
          if (isSimpleItems(item)) {
            this.filterControllers.push(
              new SearchBarFilterSimpleItemsController(
                item,
                this.appDataEntity,
                this.context,
                this.params,
              ),
            );
            return;
          }

          const key = `${item.appDEFieldId}_${item.defsearchMode.valueOP}`;
          if (!itemsMap.has(key)) {
            itemsMap.set(key, []);
          }
          itemsMap.get(key)!.push(item);
          return;
        }

        // 常规的属性过滤项
        const filterController = new SearchBarFilterController(
          item,
          this.appDataEntity,
          this.context,
          this.params,
        );
        this.filterControllers.push(filterController);
      });

      // 初始化SearchBarFilterItemsController
      if (itemsMap.size > 0) {
        itemsMap.forEach(items => {
          const filterController = new SearchBarFilterItemsController(
            items,
            this.appDataEntity,
            this.context,
            this.params,
          );
          this.filterControllers.push(filterController);
        });
      }

      await Promise.all(
        this.filterControllers.map(controller => controller.init()),
      );
    }
  }

  /**
   * 附加自定义条件
   *
   * @author zhanghengfeng
   * @date 2024-07-19 10:07:34
   * @param {IFilterNode[]} nodes
   * @return {*}  {void}
   */
  attachCustomCond(nodes: IFilterNode[]): void {
    if (!this.state.customCond) {
      return;
    }
    if (!nodes[0]) {
      nodes[0] = {
        nodeType: 'GROUP',
        logicType: 'AND',
        children: [],
      };
    }
    const group = nodes[0] as IFilterNodeGroup;
    if (!Array.isArray(group.children)) {
      group.children = [];
    }
    const item = group.children.find(
      child => child.nodeType === 'CUSTOM' && child.customType === 'PQL',
    ) as IFilterNodeCustom;
    if (item) {
      item.customCond = this.state.customCond;
    } else {
      group.children.push({
        nodeType: 'CUSTOM',
        customType: 'PQL',
        customCond: this.state.customCond,
      });
    }
  }

  /**
   * 计算过滤项参数
   * @author lxm
   * @date 2023-10-13 05:53:35
   * @return {*}  {IData}
   */
  calcFilters(): IData[] | undefined {
    if (!this.enableFilter) {
      return;
    }
    const nodes = clone(this.state.filterNodes);
    this.attachCustomCond(nodes);
    const searchconds = calcSearchConds(nodes, {
      after: (node, cond) => {
        if (node.nodeType === 'FIELD' && isString(node.value)) {
          if (ScriptValueRegex.test(node.value)) {
            (cond as ISearchCondField).value = ScriptFactory.execSingleLine(
              `\`${node.value}\``,
              {
                ...this.getEventArgs(),
              },
            );
          }
        }
      },
    });
    if (!searchconds) {
      const customNodes: IFilterNode[] = [
        {
          nodeType: 'GROUP',
          logicType: 'AND',
          children: [],
        },
      ];
      this.attachCustomCond(customNodes);
      return calcSearchConds(customNodes);
    }

    return searchconds;
  }

  /**
   * 初始化搜索栏分组项(获取后台分组清单并合并模型)
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-19 14:43:46
   */
  async initSearBarGroups(firstInit: boolean = false): Promise<void> {
    this.state.searchBarGroups = [];
    if (this.isBackendSearchGroup) {
      if (this.model.searchBarGroups && this.model.searchBarGroups.length > 0) {
        this.state.searchBarGroups = this.model.searchBarGroups.map(
          (item, index) => {
            const tempGroup = {
              name: item.id!,
              caption: item.caption,
              saved: false,
              show: true,
              searchGroupData: {} as IData,
              order: (index + 1) * 100,
              defaultSelect: false,
              noEdit: true,
              counterId: item.counterId,
              counterMode: item.counterMode,
            };
            if (item.data) {
              try {
                // 解析data属性到对应位置
                const tempData = JSON.parse(item.data);
                if (tempData.theme_model) {
                  if (tempData.theme_model.sort) {
                    tempGroup.searchGroupData.sort = tempData.theme_model.sort;
                  }
                  if (tempData.theme_model.columnstates) {
                    tempGroup.searchGroupData.columnstates =
                      tempData.theme_model.columnstates;
                  }
                  if (tempData.theme_model.searchconds) {
                    tempGroup.searchGroupData.searchconds =
                      tempData.theme_model.searchconds;
                  }
                }
                if (tempData.valid_flag) {
                  tempGroup.show = tempData.valid_flag === '1';
                }
              } catch (error) {
                ibiz.log.error(
                  ibiz.i18n.t(
                    'runtime.controller.control.searchBar.JSONFormat',
                    { data: item.data },
                  ),
                  error,
                );
              }
            }
            if (item.defaultGroup) {
              tempGroup.defaultSelect = true;
            }
            return tempGroup;
          },
        );
      }
      // 请求并合并searchBarGroups ，这里只能拿到清单
      const res = await this.service.fetch();
      if (res.ok && res.data) {
        // SYSTEM排在前面，PERSONAL排在后面,然后再按order排序
        const result: IData[] = res.data.sort((a: IData, b: IData) => {
          if (a.owner_type === b.owner_type) {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            if (a.order !== undefined) {
              return -1;
            }
            if (b.order !== undefined) {
              return 1;
            }
            return 0;
          }
          return a.owner_type === 'SYSTEM' ? -1 : 1;
        });
        result.forEach((group: IData) => {
          // 已经存在的覆盖，否则新增
          const existGroup = this.state.searchBarGroups.find(
            item => item.name === group.name,
          );
          if (existGroup) {
            mergeInLeft(existGroup, group);
            if (group.owner_type === 'PERSONAL') {
              existGroup.saved = true;
            }
          } else {
            // 找出最大的order项的下标index，然后+2新增（第n项order为(n+1)*100）
            const tempMaxOrderIndex = this.state.searchBarGroups.reduce(
              (maxIndex, item, currentIndex) =>
                item.order > this.state.searchBarGroups[maxIndex].order
                  ? currentIndex
                  : maxIndex,
              0,
            );
            this.state.searchBarGroups.push({
              saved: true,
              show: true,
              searchGroupData: {},
              order: (tempMaxOrderIndex + 2) * 100,
              // 以后台给的为准
              ...group,
            } as IBackendSearchBarGroup);
          }
        });
      }
      // 按照 order 属性从小到大排序
      this.state.searchBarGroups.sort((a, b) => a.order - b.order);
      // 更新 order 属性的值
      this.state.searchBarGroups.forEach((item, index) => {
        item.order = (index + 1) * 100;
      });
      // 设置是否有默认选中
      if (
        firstInit &&
        this.state.searchBarGroups &&
        this.state.searchBarGroups.length > 0
      ) {
        if (this.enableStorage) {
          const key = this.storageKeyFn?.();
          if (key) {
            const name = localStorage.getItem(key);
            if (name) {
              const selectedGroup = this.state.searchBarGroups.find(group => {
                return group.name === name;
              });
              if (selectedGroup) {
                this.hasDefaultSelect = true;
                return;
              }
            }
          }
        }
        const defaultSelectedGroup = this.state.searchBarGroups.find(group => {
          return group.defaultSelect;
        });
        if (defaultSelectedGroup) {
          this.hasDefaultSelect = true;
        }
      }
    }
  }

  /**
   * 点击默认选中
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-01-24 11:12:43
   */
  setDefaultSelect(): void {
    if (this.state.searchBarGroups && this.state.searchBarGroups.length > 0) {
      if (this.enableStorage) {
        const key = this.storageKeyFn?.();
        if (key) {
          const name = localStorage.getItem(key);
          if (name) {
            const selectedGroup = this.state.searchBarGroups.find(group => {
              return group.name === name;
            });
            if (selectedGroup) {
              this.handleGroupClick(selectedGroup);
              return;
            }
          }
        }
      }
      const defaultSelectedGroup = this.state.searchBarGroups.find(group => {
        return group.defaultSelect;
      });
      if (defaultSelectedGroup) {
        this.handleGroupClick(defaultSelectedGroup);
      }
    }
  }

  /**
   * 处理保存
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-19 16:17:15
   */
  async handleSave(): Promise<void> {
    if (this.grid && this.state.selectedSearchGroupItem) {
      const nodes = clone(this.state.filterNodes);
      this.attachCustomCond(nodes);
      let filters = calcSearchCondExs(nodes);
      if (!filters) {
        const customNodes: IFilterNode[] = [
          {
            nodeType: 'GROUP',
            logicType: 'AND',
            children: [],
          },
        ];
        this.attachCustomCond(customNodes);
        filters = calcSearchCondExs(customNodes);
      }

      const tempColumnState = this.grid.state.columnStates.map(
        (item: IColumnState) => {
          const state = clone(item);
          delete state.columnWidth;
          return state;
        },
      );

      const saveParams = {
        searchconds: filters,
        sort: this.grid.state.sortQuery,
        columnstates: tempColumnState,
      };
      // 根据是否保存过决定是更新还是新建
      if (this.state.selectedSearchGroupItem.saved) {
        await this.service.update(this.state.selectedSearchGroupItem.id!, {
          searchGroupData: saveParams,
          show: this.state.selectedSearchGroupItem.show,
          order: this.state.selectedSearchGroupItem.order,
        });
        ibiz.message.success(
          ibiz.i18n.t('runtime.controller.control.form.savedSuccessfully', {
            srfmajortext: '',
          }),
        );
      } else {
        const res = await this.service.createWithParams(
          this.state.selectedSearchGroupItem,
          saveParams,
        );
        if (res.ok) {
          const savedGroup = this.state.searchBarGroups.find(
            group => group.name === res.data.name,
          );
          if (savedGroup) {
            mergeInLeft(savedGroup, res.data);
            savedGroup.saved = true;
          }
          ibiz.message.success(
            ibiz.i18n.t('runtime.controller.control.form.savedSuccessfully', {
              srfmajortext: '',
            }),
          );
        }
      }
    }
  }

  /**
   * 处理点击后台分组
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-21 10:29:24
   */
  async handleGroupClick(groupItem: IBackendSearchBarGroup): Promise<void> {
    if (this.enableStorage) {
      const key = this.storageKeyFn?.();
      if (key && groupItem.name) {
        localStorage.setItem(key, groupItem.name);
      }
    }
    this.state.selectedSearchGroupItem = groupItem;
    this.evt.emit('onTabChange', { data: [groupItem] });
    if (groupItem.saved || groupItem.ownerType === 'SYSTEM') {
      // 请求获取到搜索分组数据
      const res = await this.service.get(groupItem.id!);
      if (res.ok) {
        mergeInLeft(groupItem, res.data);
        groupItem.show = true;
      }
    }
    if (
      groupItem.searchGroupData &&
      groupItem.searchGroupData.searchconds &&
      groupItem.searchGroupData.searchconds.length > 0
    ) {
      // 根据后台标准的searchconds计算出 前端回显的树形结构FilterNodes
      const filterNodes = groupItem.searchGroupData.searchconds.map(item =>
        SearchCondEx2filterNode(item as ISearchCondEx),
      );
      this.state.customCond = '';
      if (filterNodes && filterNodes[0]) {
        const group = filterNodes[0] as IFilterNodeGroup;
        const { children } = group;
        if (Array.isArray(children)) {
          const index = children.findIndex(
            child => child.nodeType === 'CUSTOM' && child.customType === 'PQL',
          );
          if (index !== -1) {
            const item = children.splice(index, 1);
            this.state.customCond =
              (item[0] as IFilterNodeCustom)?.customCond || '';
          }
        }
      }
      this.state.filterMode = 'default';
      this.state.filterNodes = filterNodes;
    } else {
      this.state.filterNodes = getOriginFilterNodes();
      this.state.customCond = '';
      this.state.filterMode = 'default';
    }

    // 把带有${}的条件禁用，不能修改
    recursiveIterate(this.state.filterNodes[0], (node: IFilterNode) => {
      if (node.nodeType === 'FIELD') {
        if (
          node.field &&
          node.valueOP &&
          isString(node.value) &&
          ScriptValueRegex.test(node.value)
        ) {
          node.disabled = true;
        }
      }
    });

    if (this.grid && groupItem && groupItem.searchGroupData) {
      this.grid.setGroupParams(groupItem.searchGroupData);
      await this.grid.load({ isInitialLoad: true });
    } else if (this.mdctrl && groupItem && groupItem.searchGroupData) {
      this.mdctrl.setGroupParams(groupItem.searchGroupData);
      await this.mdctrl.load({ isInitialLoad: true });
    }
  }

  /**
   * 初始化高级搜索
   * @author lxm
   * @date 2024-04-11 11:44:10
   * @protected
   */
  protected initAdvancedQuickSearch(): void {
    if (
      this.model.quickSearchMode === 2 &&
      this.model.searchBarQuickSearchs?.length
    ) {
      this.state.advancedQuickSearch = true;
      this.state.quickSearchItems = [];
      this.state.quickSearchFieldNames = [];
      this.model.searchBarQuickSearchs.forEach(item => {
        const filed = findFieldById(this.appDataEntity, item.appDEFieldId!)!;
        const fieldName = filed.codeName!.toLowerCase();
        this.state.quickSearchItems.push({
          fieldName,
          label: filed.logicName!,
        });
        this.state.quickSearchFieldNames.push(fieldName);
      });

      this.calcQuickSearchPlaceHolder();
    }
  }

  /**
   * 计算快速搜索占位符
   * @author lxm
   * @date 2024-04-11 05:36:52
   */
  calcQuickSearchPlaceHolder(): void {
    if (this.state.advancedQuickSearch) {
      if (this.state.quickSearchFieldNames.length) {
        const labels: string[] = [];
        this.state.quickSearchItems.forEach(item => {
          if (this.state.quickSearchFieldNames.includes(item.fieldName)) {
            labels.push(item.label);
          }
        });
        this.state.quickSearchPlaceHolder = labels.join(this.searchPhSeparator);
      } else {
        this.state.quickSearchPlaceHolder = this.placeHolder;
      }
    }
  }

  /**
   * @description 切换分组
   * @param {string} tabId
   * @memberof SearchBarController
   */
  selectTab(tabId: string): void {
    if (this.isBackendSearchGroup) {
      const target = this.state.searchBarGroups?.find(item => {
        return item.name === tabId;
      });
      if (target) {
        this.handleGroupClick(target);
      }
    } else {
      const target = this.model.searchBarGroups?.find(item => {
        return item.id === tabId;
      });
      if (target) {
        this.state.selectedGroupItem = target;
        this.evt.emit('onTabChange', { data: [target] });
        this.onSearch();
      }
    }
  }

  /**
   * @description 计算计数器显示状态
   * @param {(IBackendSearchBarGroup | ISearchBarGroup)} item
   * @returns {*}  {boolean}
   * @memberof SearchBarController
   */
  public calcCountVisible(
    item: IBackendSearchBarGroup | ISearchBarGroup,
  ): boolean {
    if (!this.counter) {
      return true;
    }
    const { counterId, counterMode } = item;
    if (counterId) {
      // 显示模式为1，且计数器数据为0时隐藏
      const count = this.counter.getCounter(counterId);
      if (counterMode === 1 && count === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * @description 初始化计数器
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof SearchBarController
   */
  protected async initCounter(): Promise<void> {
    const { appCounterRefs } = this.model as IData;
    const appCounterRef = appCounterRefs?.[0];
    if (appCounterRef) {
      this.counter = await CounterService.getCounterByRef(
        appCounterRef,
        this.context,
        { ...this.params },
      );
    }
  }

  /**
   * @description 监听组件销毁
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof SearchBarController
   */
  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    if (this.counter) {
      this.counter.destroy();
    }
  }
}
