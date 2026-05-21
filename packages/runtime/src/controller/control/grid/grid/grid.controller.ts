/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  plus,
  DataTypes,
  EntityError,
  HttpResponse,
  awaitTimeout,
  RuntimeError,
  recursiveIterate,
  RuntimeModelError,
  mergeDefaultInLeft,
  debounceAndAsyncMerge,
} from '@ibiz-template/core';
import {
  IDEGrid,
  IDEGridColumn,
  IDEDataExport,
  IControlLogic,
  IDEGridGroupColumn,
  IDEGridFieldColumn,
  IAppDEDataExport,
  IDEGridUAColumn,
  IDEUIActionGroup,
} from '@ibiz/model-core';
import { clone } from 'ramda';
import dayjs from 'dayjs';
import { GridFieldColumnController } from '../grid-column/grid-field-column/grid-field-column.controller';
import { GridColumnController } from './grid-column.controller';
import { GridRowState } from './grid-row.state';
import { GridService } from './grid.service';
import {
  GridUAColumnController,
  GridFieldEditColumnController,
} from '../grid-column';
import {
  IGridState,
  IGridEvent,
  CodeListItem,
  IColumnState,
  IGridRowState,
  IExportColumn,
  IGridController,
  MDCtrlLoadParams,
  ISearchGroupData,
  IApiMDGroupParams,
  IGridColumnProvider,
  IStorageColumnStates,
  IApiGridColumnMapping,
  IApiExportParams,
} from '../../../../interface';
import { calcDeCodeNameById, calcUIActionGroup } from '../../../../model';
import {
  getGridColumnProvider,
  getAutoGridColumnProvider,
} from '../../../../register';
import { ControlVO, Srfuf } from '../../../../service';
import { MDControlController } from '../../../common';
import { GridNotifyState } from '../../../constant';
import {
  exportData,
  ValueExUtil,
  isValueChange,
  getDefaultValue,
  getEntitySchema,
  ControllerEvent,
} from '../../../utils';
import {
  ScriptFactory,
  convertNavData,
  handleAllSettled,
} from '../../../../utils';
import { calcColumnModelBySchema } from './entity-schema';
import {
  newRowDynamic,
  switchRowEditDynamic,
  initModelByEntitySchema,
} from './auto-grid.util';

/**
 * 表格控制器
 *
 * @author chitanda
 * @date 2022-08-01 18:08:13
 * @export
 * @class GridController
 * @extends {MDControlController<GridModel>}
 */
export class GridController<
    T extends IDEGrid = IDEGrid,
    S extends IGridState = IGridState,
    E extends IGridEvent = IGridEvent,
  >
  extends MDControlController<T, S, E>
  implements IGridController<T, S, E>
{
  /**
   * 表格部件服务
   *
   * @author lxm
   * @date 2022-08-19 13:08:51
   * @type {EntityService}
   */
  declare service: GridService;

  protected get _evt(): ControllerEvent<IGridEvent> {
    return this.evt;
  }

  /**
   * 单元格超出呈现模式
   *
   * @readonly
   * @type {('wrap' | 'ellipsis')}
   * @memberof GridController
   */
  get overflowMode(): 'wrap' | 'ellipsis' {
    if (this.controlParams.overflowmode) {
      return this.controlParams.overflowmode;
    }
    return ibiz.config.grid.overflowMode;
  }

  /**
   * 隐藏无值的单位
   *
   * @readonly
   * @type {boolean}
   * @memberof GridController
   */
  get emptyHiddenUnit(): boolean {
    if (this.controlParams.emptyhiddenunit) {
      return (
        this.controlParams.emptyhiddenunit === 'true' ||
        this.controlParams.emptyhiddenunit === true
      );
    }
    return ibiz.config.grid.emptyHiddenUnit;
  }

  /**
   * @description 行编辑模式
   * @readonly
   * @type {('cell' | 'row' | 'all')}
   * @memberof GridController
   */
  get editShowMode(): 'cell' | 'row' | 'all' {
    if (this.state.isAutoGrid) {
      const editShowMode =
        this.controlParams.editshowmode || ibiz.config.grid.editShowMode;
      return editShowMode === 'cell' ? 'row' : editShowMode;
    }
    if (this.controlParams.editshowmode) {
      return this.controlParams.editshowmode;
    }
    return ibiz.config.grid.editShowMode;
  }

  /**
   * 行编辑保存模式
   *
   * @readonly
   * @type {('cell-blur' | 'auto' | 'manual')}
   * @memberof GridController
   */
  get editSaveMode(): 'cell-blur' | 'auto' | 'manual' {
    if (this.controlParams.editsavemode) {
      return this.controlParams.editsavemode;
    }
    return ibiz.config.grid.editSaveMode;
  }

  /**
   * 表格保存错误处理模式
   *
   * @author tony001
   * @date 2025-01-02 11:01:24
   * @readonly
   * @type {('default' | 'reset')}
   */
  get saveErrorHandleMode(): 'default' | 'reset' {
    if (this.controlParams.saveerrorhandlemode) {
      return this.controlParams.saveerrorhandlemode;
    }
    return ibiz.config.grid.saveErrorHandleMode;
  }

  /**
   * 是否有配置宽度自适应列
   *
   * @type {boolean}
   * @memberof GridController
   */
  hasAdaptiveColumn: boolean = false;

  /**
   * 是否有多级表头
   * @author lxm
   * @date 2023-08-07 02:26:16
   * @type {boolean}
   */
  isMultistageHeader: boolean = false;

  /**
   * 是否添加jsonschema里定义的表格列
   * @author lxm
   * @date 2024-01-02 05:27:16
   * @type {boolean}
   */
  addSchemaColumn: boolean = false;

  /**
   * jsonschema参数
   *
   * @author zhanghengfeng
   * @date 2024-07-05 15:07:13
   * @type {IParams}
   */
  jsonSchemaParams: IParams = {};

  /**
   * 显示百分比列
   *
   * @type {string[]}
   * @memberof GridController
   */
  percentkeys: string[] = [];

  /**
   * 所有表格列控制器集合
   *
   * @author lxm
   * @date 2022-11-14 15:11:14
   * @type {{ [key: string]: GridColumnController }}
   */
  columns: { [key: string]: GridColumnController } = {};

  /**
   * 所有表格属性列的控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: GridFieldColumnController }}
   */
  fieldColumns: { [key: string]: GridFieldColumnController } = {};

  /**
   * 所有表格操作列的控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: GridUAColumnController }}
   */
  uaColumns: { [key: string]: GridUAColumnController } = {};

  /**
   * 所有表格编辑列的控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:07
   * @type {{ [key: string]: GridFieldEditColumnController }}
   */
  editColumns: { [key: string]: GridFieldEditColumnController } = {};

  /**
   * 表格列的适配器
   *
   * @author lxm
   * @date 2022-11-14 14:11:39
   * @type {{ [key: string]: IGridColumnProvider }}
   */
  providers: { [key: string]: IGridColumnProvider } = {};

  /**
   * 分组属性列控制器
   * @author lxm
   * @date 2023-08-07 09:45:30
   * @type {string}
   */
  groupFieldColumn?: GridFieldColumnController;

  /**
   * 聚合行标题
   * @author lxm
   * @date 2023-08-07 04:11:00
   * @type {string}
   */
  aggTitle: string = '合计';

  /**
   * 数据导出对象
   * @author lxm
   * @date 2023-08-07 04:11:00
   * @type {IAppDEDataExport}
   */
  dataExport: IAppDEDataExport | undefined;

  /**
   * 数据导出列
   * @author lxm
   * @date 2023-08-07 04:11:00
   * @type {IAppDEDataExport}
   */
  allExportColumns: IExportColumn[] = [];

  /**
   * 数据导出代码表
   * @author zzq
   * @date 2024-03-20 16:11:00
   * @type {Map<string, readonly CodeListItem[]>}
   */
  allExportCodelistMap: Map<string, readonly CodeListItem[]> = new Map();

  /**
   * 所有的自定义列
   *
   * @type {IDEGridColumn[]}
   */
  allCustomColumns: IDEGridColumn[] = [];

  /**
   * 分组代码表项集合
   * @author lxm
   * @date 2023-08-07 09:09:42
   * @type {readonly}
   */
  get groupCodeListItems(): Readonly<CodeListItem[]> | undefined {
    return this.groupFieldColumn?.codeListItems;
  }

  /**
   * 是否启用表格聚合
   * @author lxm
   * @date 2023-08-07 04:10:55
   * @readonly
   * @type {boolean}
   */
  get enableAgg(): boolean {
    return this.model.aggMode !== 'NONE';
  }

  /**
   * 允许使用行编辑
   * @author lxm
   * @date 2023-08-17 02:52:07
   * @readonly
   * @type {boolean}
   */
  get allowRowEdit(): boolean {
    return !!this.model.enableRowEdit && this.state.rowEditOpen;
  }

  /**
   * 允许使用行编辑次序调整
   * @author zzq
   * @date 2024-04-22 17:52:07
   * @readonly
   * @type {boolean}
   */
  get enableRowEditOrder(): boolean {
    return !!this.model.enableRowEditOrder;
  }

  /**
   * @description 自动保存的定时器引用
   * @protected
   * @type {unknown}
   * @memberof GridController
   */
  protected autoSaveTimer?: unknown;

  protected initState(): void {
    super.initState();
    this.state.rows = [];
    this.state.columnFilter = {};
    this.state.noSort = this.model.noSort === true;
    this.state.size = this.model.pagingSize || 20;
    this.state.singleSelect = this.model.singleSelect === true;
    this.state.columnStates = [];
    this.state.aggResult = {};
    this.state.isAutoGrid = this.model.gridStyle === 'AUTOGRID';
    this.state.rowEditOpen = this.state.isAutoGrid;
    const { hideHeader, enablePagingBar } = this.model;
    this.state.hideHeader = hideHeader;
    this.state.enablePagingBar = enablePagingBar;
    this.state.simpleData = [];
    this.state.expandRowKeys = [];
  }

  /**
   * 初始化方法
   *
   * @author lxm
   * @date 2022-08-18 22:08:17
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onCreated(): Promise<void> {
    this.addSchemaColumn = this.controlParams.enablejsonschema === 'true';
    const jsonSchemaParams = JSON.parse(
      this.controlParams.jsonschemaparams || '{}',
    );
    this.jsonSchemaParams = convertNavData(
      jsonSchemaParams,
      this.params,
      this.context,
    );
    this.percentkeys = JSON.parse(this.controlParams.percentkeys || '[]');
    await this.initByEntitySchema();
    await super.onCreated();
    this.service = new GridService(this.model);
    await this.service.init(this.context);
    this.initColumnStates();
    await this.initGridColumns();

    // !数据变更通知防抖，且合并参数,如果有同一批触发不同行的值变更则该方法需要重写
    this.dataChangeNotify = debounceAndAsyncMerge(
      this.dataChangeNotify.bind(this),
      (arr1, arr2): [GridRowState, string[]] => {
        return [arr1[0], Array.from(new Set([...arr1[1], ...arr2[1]]))];
      },
      200,
    );

    // 初始化表格分组
    await this.initGroup();
    // 初始化数据导出对象
    await this.initExportData();

    this.initAutoSaveTimer();
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @memberof GridController
   */
  protected async initUIActions(): Promise<void> {
    // 收集所有遍历过程中的异步任务
    const asyncTasks: Promise<IDEUIActionGroup>[] = [];

    // 遍历所有列，计算属性列界面行为组与操作列界面行为组
    recursiveIterate(
      this.model,
      (column: IDEGridFieldColumn | IDEGridUAColumn) => {
        if (column.deuiactionGroup) {
          const task = calcUIActionGroup(
            column.deuiactionGroup,
            this.context,
            this.params,
          );
          asyncTasks.push(task);
        }
      },
      { childrenFields: ['degridColumns'] },
    );
    await Promise.all(asyncTasks);
  }

  /**
   * @description 初始化自动保存定时器
   * @protected
   * @memberof GridController
   */
  protected initAutoSaveTimer(): void {
    if (this.editSaveMode !== 'auto') return;
    this.destroyAutoSaveTimer();
    this.autoSaveTimer = setInterval(() => {
      // 该方法只会保存修改过的行数据
      this.saveAll();
    }, 3000);
  }

  /**
   * @description 销毁自动保存定时器
   * @protected
   * @memberof GridController
   */
  protected destroyAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer as number);
      this.autoSaveTimer = undefined;
    }
  }

  /**
   * 计算表格展示模式
   * @author fzh
   * @date 2024-05-29 19:18:42
   * @return {*}  {void}
   */

  calcShowMode(tableData: IData): void {
    const { hideHeader, enablePagingBar } = this.model;
    this.state.hideNoDataImage = false;
    this.state.hideHeader = hideHeader;
    this.state.enablePagingBar = enablePagingBar;
    // SHOWMODE = 'DEFAULT'|'ONLYDATA'|'MIXIN'
    // DEFAULT  默认逻辑
    const showmode = this.controlParams.showmode || 'DEFAULT';

    // ONLYDATA 无论有无数据 仅仅显示数据区域，表格头和分页栏都不要
    if (showmode === 'ONLYDATA') {
      this.state.hideHeader = true;
      this.state.enablePagingBar = false;
      if (tableData.length === 0) {
        this.state.hideNoDataImage = true;
      }
    }

    // MIXIN 无数据时，仅仅显示数据区域，表格头和分页栏都不要；有数据时，展示还是和默认一样
    if (showmode === 'MIXIN') {
      if (tableData.length === 0) {
        this.state.hideHeader = true;
        this.state.enablePagingBar = false;
        this.state.hideNoDataImage = true;
      }
    }
  }

  /**
   * 根据jsonschema初始化自定义表格列
   * @author lxm
   * @date 2024-01-02 04:41:23
   * @return {*}  {Promise<void>}
   */
  async initByEntitySchema(): Promise<void> {
    if (this.state.isAutoGrid) {
      await initModelByEntitySchema(this);
      return;
    }
    if (!this.addSchemaColumn) {
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

    const result = await calcColumnModelBySchema(json, this);
    if (result && result.degridColumns.length > 0) {
      const { degridColumns, degridDataItems } = result;
      this.allCustomColumns = degridColumns;
      // 修改模型之前拷贝一份，避免污染原始数据
      (this as IData).model = clone(this.model);
      this.model.degridColumns = [
        ...(this.model.degridColumns || []),
        ...degridColumns,
      ];

      this.model.degridDataItems = [
        ...(this.model.degridDataItems || []),
        ...degridDataItems!,
      ];
    }
  }

  /**
   * 初始化数据导出对象
   * @author zzq
   * @date 2024-03-20 16:10:17
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initExportData(): Promise<void> {
    if (this.model.dedataExportId) {
      this.dataExport = this.dataEntity.appDEDataExports?.find(dataExport => {
        return dataExport.id === this.model.dedataExportId;
      });
      if (this.dataExport) {
        this.allExportColumns = await this.findAllExportColumns(
          this.dataExport,
        );
      }
    }
    if (this.allExportColumns.length > 0) {
      this.allExportColumns.forEach((exportColumn: IExportColumn) => {
        if (exportColumn.codeListItems) {
          this.allExportCodelistMap.set(
            exportColumn.appDEFieldId!,
            exportColumn.codeListItems!,
          );
        }
      });
    } else {
      Object.keys(this.fieldColumns).forEach((key: string) => {
        if (this.fieldColumns[key].codeList) {
          this.allExportCodelistMap.set(
            key,
            this.fieldColumns[key].codeListItems!,
          );
        }
      });
    }
  }

  /**
   * 填充导出代码表
   * @author zzq
   * @date 2024-04-23 16:10:17
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async fillExportCodelistMap(): Promise<void> {
    // 表格导出列已填充代码表
    if (this.model.dedataExportId) return;
    const fillCodeList = async (
      key: string,
      fieldColumnC: GridFieldColumnController,
    ): Promise<void> => {
      const dataItems = await fieldColumnC.loadCodeList();
      this.allExportCodelistMap.set(key, dataItems!);
    };

    const exportColumnsPromises: Promise<void>[] = [];
    for (const [key, codeListItems] of this.allExportCodelistMap) {
      if (!codeListItems) {
        const fieldColumn = this.fieldColumns[key];
        if (fieldColumn.codeListItems) {
          this.allExportCodelistMap.set(key, fieldColumn.codeListItems!);
        } else {
          exportColumnsPromises.push(fillCodeList(key, fieldColumn));
        }
      }
    }

    if (exportColumnsPromises.length > 0) {
      await Promise.all(exportColumnsPromises);
    }
  }

  /**
   * 初始化表格分组
   * @author lxm
   * @date 2023-08-07 09:10:17
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initGroup(): Promise<void> {
    if (!this.state.enableGroup) return;
    const { groupAppDEFieldId, groupCodeListId, groupMode } = this.model;
    this.groupFieldColumn = Object.values(this.fieldColumns).find(
      item => item.model.appDEFieldId === groupAppDEFieldId,
    );
    if (!this.groupFieldColumn) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.grid.attributeColumns'),
      );
    }
    const groupFieldName = this.groupFieldColumn.model.id;

    // 找到分类属性列的位置，如果不在第一列调整到第一列去
    const index = this.state.columnStates.findIndex(
      item => item.key === this.groupFieldColumn!.model.codeName,
    );
    if (index !== -1 && index !== 0) {
      if (this.isMultistageHeader) {
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.control.grid.configureFirstColumn', {
            groupFieldName,
          }),
        );
      }
      // 如果找到了元素，则将其从原来的位置删除
      const removeEls = this.state.columnStates.splice(index, 1);
      // 将元素插入到数组的第一位
      this.state.columnStates.unshift(...removeEls);
    }

    if (groupMode === 'CODELIST') {
      if (!groupCodeListId) {
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.control.grid.requiresCodeTable'),
        );
      }
      if (this.groupFieldColumn.model.appCodeListId !== groupCodeListId) {
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.control.grid.noMatchCodeTable', {
            groupFieldName,
          }),
        );
      }
    }
    this.calcColumnFixed();
  }

  async afterLoad(
    args: MDCtrlLoadParams,
    items: ControlVO[],
  ): Promise<ControlVO[]> {
    await super.afterLoad(args, items);
    // 每次表格刷新时通知表格属性列,加载代码表,避免动态代码表更新不及时
    await handleAllSettled(
      Object.values(this.fieldColumns).map(async fieldColumn => {
        await fieldColumn.loadCodeList();
      }),
      false,
    );

    // 生成表格row对象
    const rows = items.map(item => {
      const row = new GridRowState(item, this);
      this.gridStateNotify(row, GridNotifyState.LOAD);
      return row;
    });

    if (args.isLoadMore) {
      this.state.rows.push(...rows);
    } else {
      this.state.rows = rows;
    }

    // 响应式写法，用state里遍历出来的row才是reactive
    await this.updateRows(this.state.rows);

    this.calcGroupData(this.state.items);
    await this.loadRemoteAgg();
    this.calcAggResult(this.state.items);

    this.calcShowMode(this.state.items);
    this.calcTotalData();

    return items;
  }

  /**
   * @description 处理刷新模式
   * @protected
   * @param {MDCtrlLoadParams} args
   * @memberof GridController
   */
  protected handleRefreshMode(args: MDCtrlLoadParams): void {
    super.handleRefreshMode(args);
    if (args.isInitialLoad || this.refreshMode === 'nocache')
      this.state.expandRowKeys = [];
  }

  /**
   * 更新行状态
   * @param rows
   */
  async updateRows(rows: IGridRowState[]): Promise<void> {
    for (const row of rows) {
      await Promise.all([
        ...Object.values(row.uaColStates).map(uaState =>
          uaState.update(
            this.context,
            row.data.getOrigin(),
            this.model.appDataEntityId,
          ),
        ),
        ...Object.values(row.uiActionGroupStates).map(uaState =>
          uaState.update(
            this.context,
            row.data.getOrigin(),
            this.model.appDataEntityId,
          ),
        ),
      ]);
    }
  }

  /**
   * @description 执行多数据分组
   * @param {IApiMDGroupParams[]} [arg] 分组参数集合（多层分组暂未支持）
   * @param {IParams} [_params] 额外参数
   * @returns {*}  {Promise<void>}
   * @memberof MDControlController
   */
  async execGroup(arg: IApiMDGroupParams[], _params?: IParams): Promise<void> {
    const group = arg[0];
    (this as IData).model = clone(this.model);
    this.model.groupMode = 'AUTO';
    const { columnStates } = this.state;
    const column = this.model.degridColumns?.find(
      c =>
        group?.groupFieldId &&
        c.columnType === 'DEFGRIDCOLUMN' &&
        (c as IDEGridFieldColumn).appDEFieldId?.toLowerCase() ===
          group?.groupFieldId?.toLowerCase(),
    );
    const columnState = columnStates.find(
      c => !c.hidden && column?.codeName === c.key,
    );
    const groupAppDEFieldId = (column as IDEGridFieldColumn)?.appDEFieldId;
    // 如果不存在或不显示分组列时，则重置分组
    if (!groupAppDEFieldId || !columnState) {
      this.state.groups = [];
      this.state.enableGroup = false;
    } else if (groupAppDEFieldId !== this.model.groupAppDEFieldId) {
      // 分组属性变更时才重新初始化分组
      this.state.enableGroup = true;
      this.model.groupAppDEFieldId = groupAppDEFieldId;
      await this.initGroup();
      this.calcGroupData(this.state.items);
    }
  }

  /**
   * 计算分组数据
   * @author lxm
   * @date 2023-08-07 02:16:39
   * @protected
   * @param {IData[]} items
   */
  protected calcGroupData(items: IData[]): void {
    const { enableGroup } = this.state;
    const { groupMode } = this.model;
    if (enableGroup) {
      const groupMap = new Map<string | number, IData[]>();
      const codeListGroup = groupMode === 'CODELIST';
      const groupFiledName = this.groupFieldColumn!.model.id!;
      if (codeListGroup) {
        this.groupCodeListItems!.forEach(item => {
          groupMap.set(item.value, []);
        });
      }
      items.forEach(item => {
        const groupFieldValue = item[groupFiledName];
        // 非代码表分组时，不存在时根据数据创建分组
        if (!codeListGroup && !groupMap.has(groupFieldValue)) {
          groupMap.set(groupFieldValue, []);
        }
        if (groupMap.has(groupFieldValue)) {
          groupMap.get(groupFieldValue)!.push(item);
        }
      });
      this.state.groups = [];
      groupMap.forEach((value, key) => {
        const codeListItem = this.groupCodeListItems?.find(
          item => item.value === key,
        );
        this.state.groups.push({
          caption:
            codeListItem?.text ||
            (key as string) ||
            ibiz.i18n.t('runtime.controller.common.md.unclassified'),
          key: `${key}`,
          children: value,
        });
      });
    }
  }

  /**
   * 加载远程聚合数据
   * @author lxm
   * @date 2023-08-07 05:35:36
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async loadRemoteAgg(): Promise<void> {
    const { aggMode, aggAppDataEntityId, aggAppDEDataSetId } = this.model;
    if (aggMode !== 'ALL') {
      return;
    }
    if (!aggAppDEDataSetId || !aggAppDataEntityId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.grid.missingConfiguration'),
      );
    }
    const params = await this.getFetchParams();
    delete params.sort;
    const app = ibiz.hub.getApp(this.context.srfappid);
    const res = (await app.deService.exec(
      aggAppDataEntityId,
      aggAppDEDataSetId,
      this.context,
      undefined,
      params,
    )) as HttpResponse<IData[]>;

    if (res.data.length) {
      [this.state.remoteAggResult] = res.data;
    }
  }

  async getFetchParams(extraParams: IParams = {}): Promise<IParams> {
    if (this.model.enableItemPrivilege === true) {
      extraParams.srfdataaccessaction = true;
    }
    Object.assign(extraParams, this.state.columnFilter);
    return super.getFetchParams(extraParams);
  }

  /**
   * 计算当前页的聚合数据
   * @author lxm
   * @date 2023-08-07 04:22:09
   * @param {IData[]} items
   */
  calcAggResult(items: IData[]): void {
    Object.values(this.fieldColumns).forEach(column => {
      this.state.aggResult[column.model.id!] = column.calcFieldAgg(items);
    });
  }

  /**
   * 后台删除结束后界面删除逻辑
   *
   * @author lxm
   * @date 2022-09-06 19:09:10
   * @param {IData} data
   */
  afterRemove(data: IData): void {
    super.afterRemove(data);
    // 删除this.state.rows里的表格行数据
    const index = this.findRowStateIndex(data);
    this.state.rows.splice(index, 1);

    // 删除分组里的那条数据
    this.state.groups.forEach(item => {
      if (item.children.length) {
        const findIndex = item.children.findIndex(
          item2 => item2.srfkey === data.srfkey,
        );
        if (findIndex !== -1) {
          item.children.splice(findIndex, 1);
        }
      }
    });
  }

  /**
   * @description 新建行
   * @param {MDCtrlLoadParams} [args]
   * @returns {*}  {Promise<void>}
   * @memberof GridController
   */
  async newRow(args: MDCtrlLoadParams = {}): Promise<void> {
    if (this.state.isAutoGrid) {
      await newRowDynamic(this);
      return;
    }
    const { enableRowEdit, enableRowNew } = this.model;
    if (
      !enableRowEdit ||
      !enableRowNew ||
      !['row', 'all'].includes(this.editShowMode)
    ) {
      ibiz.log.error(ibiz.i18n.t('runtime.controller.control.grid.newRows'));
      return;
    }

    if (this.editShowMode === 'row') {
      const editingRow = this.state.rows.find(item => item.showRowEdit);
      if (editingRow) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.common.md.firstComplete'),
        );
      }
    }

    const queryParams = { ...this.params };
    const defaultData = this.calcDefaultValue({}, true); // 新建默认值
    Object.assign(queryParams, defaultData);

    let res;
    try {
      res = await this.service.getDraft(this.context, queryParams);
    } catch (error) {
      this.actionNotification('GETDRAFTERROR', {
        error: error as Error,
      });
      throw error;
    }

    const draftData = res.data;
    // 处理后台导致的新建默认值丢失
    mergeDefaultInLeft(draftData, defaultData);

    // 加载完后续处理
    this.state.items.unshift(draftData);
    const newRow = new GridRowState(draftData, this);
    this.state.rows.unshift(newRow);
    this.gridStateNotify(newRow, GridNotifyState.DRAFT);

    if (this.editShowMode === 'row') {
      this.switchRowEdit(this.state.rows[0], true);
    }

    this.actionNotification('GETDRAFTSUCCESS', { data: draftData });
  }

  /**
   * 保存
   *
   * @author lxm
   * @date 2022-09-06 19:09:21
   * @param {ControlVO} data
   * @returns {*}  {Promise<void>}
   */
  async save(data: ControlVO): Promise<void> {
    if (this.state.isSimple) {
      return;
    }

    const isCreate = data.srfuf === Srfuf.CREATE;

    const rowState = this.findRowState(data);
    if (!rowState) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.common.md.rowData'),
      );
    }
    if (!rowState.modified) {
      ibiz.log.debug(ibiz.i18n.t('runtime.controller.common.md.noChange'));
      return;
    }

    // 如果数据正在处理中，则延迟保存
    if (rowState.processing) {
      await awaitTimeout(500, this.save.bind(this), [data]);
      return;
    }

    const isValid = await this.validate(rowState);
    if (!isValid) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.grid.saveCancel'),
      );
    }
    if (this.model.enableRowEditChangedOnly) {
      data = rowState.getDiffData();
    }
    let res;
    const deName = calcDeCodeNameById(this.model.appDataEntityId!);
    const tempContext = this.context.clone();
    tempContext[deName] = data.srfkey;
    try {
      res = isCreate
        ? await this.service.create(tempContext, data)
        : await this.service.update(tempContext, data);
    } catch (error) {
      await this._evt.emit('onSaveError', undefined);
      this.actionNotification(`${isCreate ? 'CREATE' : 'UPDATE'}ERROR`, {
        error: error as Error,
        data: rowState.data,
        rowState,
      });
      throw error;
    }
    // 后续处理
    const index = this.findRowStateIndex(data);
    this.state.items.splice(index, 1, res.data);
    rowState.data = res.data;
    // 保存结束后更新旧数据
    rowState.oldData = res.data.clone();
    rowState.modified = false;

    this.gridStateNotify(rowState, GridNotifyState.SAVE);
    await this.updateRows(this.state.rows);
    await this._evt.emit('onSaveSuccess', undefined);

    // 发送实体创建或更新事件
    this.emitDEDataChange(isCreate ? 'create' : 'update', res.data);
  }

  async saveAll(): Promise<void> {
    const needSaveData = this.state.rows
      .filter(row => row.modified)
      .map(row => row.data);
    if (!needSaveData.length) {
      return;
    }

    await handleAllSettled(
      needSaveData.map(data => {
        return this.save(data);
      }),
    );
  }

  /**
   * 初始化表格属性列，操作列，编辑项控制器
   *
   * @author lxm
   * @date 2022-08-24 21:08:48
   * @protected
   */
  protected async initColumnsController(column: IDEGridColumn): Promise<void> {
    // 初始化适配器
    const provider = this.state.isAutoGrid
      ? await getAutoGridColumnProvider(column, this.model)
      : await getGridColumnProvider(column, this.model);
    if (!provider) {
      return;
    }
    this.providers[column.codeName!] = provider;

    // 初始化表格列控制器
    const controller = await provider.createController(column, this);
    this.columns[column.codeName!] = controller as GridColumnController;
    // 分类存放控制器
    if (
      column.columnType === 'DEFGRIDCOLUMN' ||
      column.columnType === 'DEFTREEGRIDCOLUMN'
    ) {
      this.fieldColumns[column.codeName!] =
        controller as GridFieldColumnController;
      if (column.enableRowEdit) {
        this.editColumns[column.codeName!] =
          controller as GridFieldEditColumnController;
      }
    } else if (column.columnType === 'UAGRIDCOLUMN') {
      this.uaColumns[column.codeName!] = controller as GridUAColumnController;
    } else if (column.columnType === 'GROUPGRIDCOLUMN') {
      // 有分组列模型说明就是有多级表头
      this.isMultistageHeader = true;
      await Promise.all(
        (column as IDEGridGroupColumn).degridColumns?.map(async childColumn => {
          await this.initColumnsController(childColumn);
        }) || [],
      );
    }
  }

  /**
   * 初始化部件逻辑调度器
   * @param {IControlLogic[]} logics
   * @return {*}  {void}
   * @protected
   */
  protected initControlScheduler(logics: IControlLogic[] = []): void {
    const actualLogics = [...logics];
    // 遍历所有的项，如果有逻辑的话加入
    recursiveIterate(
      this.model,
      (item: IDEGridColumn) => {
        if (item.controlLogics) {
          actualLogics.push(...item.controlLogics);
        }
      },
      { childrenFields: ['degridColumns'] },
    );
    super.initControlScheduler(actualLogics);
  }

  /**
   * 初始化表格列状态
   * @author lxm
   * @date 2023-08-28 02:53:12
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected initColumnStates(): void {
    this.state.columnStates = [];
    // 表格列开启隐藏和列隐藏模式为始终隐藏则不初始化到表格列数据中
    if (this.state.columnStates.length === 0) {
      recursiveIterate(
        this.model,
        (column: IDEGridColumn) => {
          if (
            column.columnType !== 'GROUPGRIDCOLUMN' &&
            !(column.hiddenDataItem || column.hideMode === 2)
          ) {
            this.state.columnStates.push({
              key: column.codeName!,
              caption: column.caption!,
              hidden: !!column.hideDefault,
              hideMode: column.hideMode || 0,
              uaColumn: column.columnType === 'UAGRIDCOLUMN',
              adaptive: column.widthUnit === 'STAR',
              columnWidth: column.width,
            });
          }
        },
        { childrenFields: ['degridColumns'] },
      );
    }
    const storageColumnStatesStr = localStorage.getItem(
      `${this.view.model.id}.${this.model.name}.columnStates`,
    );
    // 有本地缓存从缓存里拿，拿完如果还是空数组再走模型
    if (storageColumnStatesStr) {
      const storageColumnStates: IStorageColumnStates = JSON.parse(
        storageColumnStatesStr,
      );
      if (this.addSchemaColumn && storageColumnStates.schemaColumnStates) {
        this.state.columnStates = this.mergeGridColumnStates(
          this.state.columnStates,
          storageColumnStates.schemaColumnStates,
        );
      } else if (
        !this.addSchemaColumn &&
        storageColumnStates.defaultColumnStates
      ) {
        this.state.columnStates = this.mergeGridColumnStates(
          this.state.columnStates,
          storageColumnStates.defaultColumnStates,
        );
      }
    }
    this.calcColumnFixed();
  }

  /**
   * 合并表格列状态数组
   *
   * @param base 基础表格列状态
   * @param cache 缓存表格列状态
   * @returns 以基础表格列状态为主，缓存表格列状态修正基础表格列状态
   */
  protected mergeGridColumnStates(
    base: IColumnState[],
    cache: IColumnState[],
  ): IColumnState[] {
    const columnStates: IColumnState[] = [];
    if (base.length > 0) {
      base.forEach(baseColumnState => {
        const cacheColumnState = cache.find(item => {
          return item.key === baseColumnState.key;
        });
        if (cacheColumnState) {
          columnStates.push(cacheColumnState);
        } else {
          columnStates.push(baseColumnState);
        }
      });
    }
    return columnStates;
  }

  /**
   * 计算列的固定状态
   * @author lxm
   * @date 2023-08-31 05:12:27
   * @protected
   */
  protected calcColumnFixed(): void {
    const showColumns = this.state.columnStates.filter(
      column => !column.hidden,
    );
    const allNum = showColumns.length;
    const { frozenFirstColumn, frozenLastColumn } = this.model;
    this.hasAdaptiveColumn = false;
    showColumns.forEach((column, index) => {
      if (column.adaptive) {
        this.hasAdaptiveColumn = true;
      }
      if (column.uaColumn) {
        column.fixed = index + 1 <= Math.floor(allNum / 2) ? 'left' : 'right';
      } else if (frozenFirstColumn && index < frozenFirstColumn) {
        column.fixed = 'left';
      } else if (frozenLastColumn && index >= allNum - frozenLastColumn) {
        column.fixed = 'right';
      }
    });
  }

  /**
   * 初始化表格属性列，操作列，编辑项控制器
   *
   * @author lxm
   * @date 2022-08-24 21:08:48
   * @protected
   */
  protected async initGridColumns(): Promise<void> {
    if (this.model.degridColumns) {
      await Promise.all(
        this.model.degridColumns.map(async column =>
          this.initColumnsController(column),
        ),
      );
    }
  }

  /**
   * 设置行属性的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {GridRowState} row 行状态控制器
   * @param {string} name 要设置的表单数据的属性名称
   * @param {unknown} value 要设置的值
   * @param {boolean} ignore 忽略脏值检查
   */
  async setRowValue(
    row: GridRowState,
    name: string,
    value: unknown,
    ignore: boolean = false,
  ): Promise<void> {
    if (
      Object.prototype.hasOwnProperty.call(row.data, name) &&
      !isValueChange(row.data[name], value)
    ) {
      // `表格行数据里没有属性${name}或者${name}的值未发生改变`
      return;
    }
    // 改变值
    row.data[name] = value;
    if (!ignore) {
      row.modified = true;
    }
    row.processing = true;

    try {
      await this.dataChangeNotify(row, [name]);
      await this._evt.emit('onGridDataChange', {
        data: {
          name,
          index: this.findRowStateIndex(row.data),
          items: this.state.rows.map(_row => {
            return _row.data;
          }),
        },
      });
    } finally {
      row.processing = false;
    }
  }

  /**
   * 通知所有表格编辑项成员表格编辑项数据变更
   *
   * @author lxm
   * @date 2022-09-20 22:09:49
   * @param {GridRowState} row 行数据
   * @param {string[]} names 更新的属性
   */
  async dataChangeNotify(row: GridRowState, names: string[]): Promise<void> {
    // 通知所有编辑项去处理编辑项相关逻辑
    await handleAllSettled(
      Object.values(this.editColumns).map(async column => {
        return column.dataChangeNotify(row, names);
      }),
    );
  }

  /**
   * 表格状态变更通知
   *
   * @author lxm
   * @date 2022-09-20 18:09:07
   */
  gridStateNotify(row: GridRowState, state: GridNotifyState): void {
    // 通知表格编辑列
    Object.values(this.editColumns).forEach(column => {
      column.gridStateNotify(row, state);
    });
  }

  /**
   * 校验一行数据的所有编辑项
   *
   * @author lxm
   * @date 2022-09-06 21:09:05
   * @param {GridRowState} row 要校验的行数据控制器
   * @returns {*}
   */
  async validate(row: GridRowState): Promise<boolean> {
    const values = await Promise.all(
      Object.values(this.editColumns).map(column => column.validate(row)),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  /**
   * 校验所有编辑项
   *
   * @author zzq
   * @date 2024-07-22 21:09:05
   * @returns {Promise<boolean>}
   */
  async validateAll(): Promise<boolean> {
    const values = await Promise.all(
      Object.values(this.state.rows).map(row => this.validate(row)),
    );

    // 找不到value为false即全部是true
    return values.findIndex(value => !value) === -1;
  }

  async toggleRowEdit(): Promise<void> {
    if (!this.model.enableRowNew) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.grid.noSupportRowEditing'),
      );
    }
    this.state.rowEditOpen = !this.state.rowEditOpen;
  }

  /**
   * 切换单行的编辑状态
   * @author lxm
   * @date 2023-08-08 06:45:54
   * @param {GridRowState} row
   * @param {boolean} [editable]
   */
  async switchRowEdit(
    row: GridRowState,
    editable?: boolean,
    isSave: boolean = true,
  ): Promise<void> {
    if (this.state.isAutoGrid) {
      await switchRowEditDynamic(this, row, editable, isSave);
      return;
    }
    if (!this.allowRowEdit) return;
    const toState = editable === undefined ? !row.showRowEdit : editable;
    // 一样的状态不处理
    if (row.showRowEdit === toState) return;

    if (toState === false) {
      // * 处理关闭行编辑
      if (isSave) {
        // 校验并保存
        await this.save(row.data);
      } else if (row.data.srfuf === Srfuf.CREATE) {
        // 新建的行取消时删除这一行的数据
        row.showRowEdit = false;
        this._evt.emit('onRowEditChange', { row });
        return this.remove({ data: [row.data], silent: true });
      } else if (row.cacheData) {
        // 取消的时候，还原编辑前的数据
        row.data = row.cacheData;
        delete row.cacheData;
      }
    } else {
      // * 处理显示行编辑
      // 如果已经有一行处于行编辑了，不开起另一行。
      const editingRow = this.state.rows.find(item => item.showRowEdit);

      if (editingRow?.modified) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.control.grid.lineEditing'),
        );
      } else if (editingRow) {
        await this.switchRowEdit(editingRow, false, false);
      }

      if (row.data.srfuf === Srfuf.UPDATE) {
        // 打开时先缓存一下
        row.cacheData = clone(row.data);
        // 填充更新默认值
        const defaultVal = this.calcDefaultValue(row.data, false);
        Object.assign(row.data, defaultVal);
      }
    }

    // 修改行的编辑状态和编辑列的编辑状态。
    row.showRowEdit = toState;
    Object.values(this.editColumns).forEach(column => {
      row.editColStates[column.fieldName].editable = toState;
    });

    this._evt.emit('onRowEditChange', { row });
  }

  /**
   * 获取部件默认排序模型
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-28 18:43:27
   */
  getSortModel(): {
    minorSortAppDEFieldId: string | undefined;
    minorSortDir: string | undefined;
  } {
    return {
      minorSortAppDEFieldId: this.model.minorSortAppDEFieldId,
      minorSortDir: this.model.minorSortDir,
    };
  }

  /**
   * 设置排序
   *
   * @author lxm
   * @date 2022-09-28 13:09:44
   * @param {string} key 排序字段
   * @param {string} order 排序顺序
   */
  setSort(fieldId?: string, order?: 'asc' | 'desc'): void {
    let fieldName;
    if (fieldId) {
      fieldName = this.state.isAutoGrid
        ? fieldId.toLowerCase()
        : this.fieldIdNameMap.get(fieldId)!.toLowerCase();
    }
    super.setSort(fieldName, order);
  }

  /**
   * 表格编辑项更新
   *
   * @author lxm
   * @date 2022-09-15 21:09:13
   * @param {string} methodName 更新实体方法
   * @param {string[]} updateItems 更新项名称集合
   */
  async updateGridEditItem(row: GridRowState, updateId: string): Promise<void> {
    const findUpdate = this.model.degridEditItemUpdates?.find(
      item => item.id === updateId,
    );

    if (!findUpdate) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.grid.updateColumns', {
          updateId,
        }),
      );
    }

    const { appDEMethodId, degeiupdateDetails, customCode, scriptCode } =
      findUpdate;
    const updateItems = degeiupdateDetails!.map(item => item.id!);

    let updateData: IData; // 要修改的数据
    if (customCode && scriptCode) {
      // 脚本模式获取修改数据
      const data = await ScriptFactory.asyncExecScriptFn(
        {
          ...this.getEventArgs(),
          data: row.data,
        },
        scriptCode,
      );
      updateData = data as IData;
    } else {
      // 后台服务获取修改数据
      const params = { ...this.params, ...row.data.getOrigin() };
      const res = await this.service.updateGridEditItem(
        appDEMethodId!,
        this.context,
        params,
      );
      updateData = res.data;
    }
    // 修改更新的值
    if (updateData && updateItems?.length) {
      await Promise.all(
        updateItems.map(itemName => {
          return this.setRowValue(row, itemName, updateData![itemName]);
        }),
      );
    }
  }

  /**
   * 加载数据(只加载数据 不做其他操作)
   *
   * @author zk
   * @date 2023-07-20 04:07:49
   * @param {MDCtrlLoadParams} args
   * @return {*}
   * @memberof GridController
   */
  async loadData(args: MDCtrlLoadParams): Promise<ControlVO[]> {
    // *查询参数处理
    const { context } = this.handlerAbilityParams(args);
    const params = await this.getFetchParams(args?.viewParam);
    let res;
    // *发起请求
    await this.startLoading();
    try {
      res = await this.service.fetch(context, params);
    } finally {
      await this.endLoading();
    }
    return res.data;
  }

  /**
   * 初始化数据导出列
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-11-21 18:54:16
   */
  async findAllExportColumns(
    dataExport: IDEDataExport,
  ): Promise<IExportColumn[]> {
    const app = ibiz.hub.getApp(this.context.srfappid);
    // 排除隐藏列
    const exportColumnsPromises: Promise<IExportColumn>[] | undefined =
      dataExport.dedataExportItems
        ?.filter(item => !item.hidden)
        .map(async item => {
          const tempExportColumn: IExportColumn = { ...item };
          if (item.codeListId) {
            // 加载代码表模型
            tempExportColumn.codeList = app.codeList.getCodeList(
              item.codeListId,
            );
            tempExportColumn.codeListItems = await app.codeList.get(
              item.codeListId,
              this.context,
            );
          }
          return tempExportColumn;
        });
    // 使用 Promise.all 等待所有 Promise 解析
    if (exportColumnsPromises) {
      return Promise.all(exportColumnsPromises);
    }
    return [];
  }

  /**
   * 值格式化
   * @return {string}
   * @author: zzq
   * @Date: 2024-03-20 17:54:16
   */
  formatValue = (
    isDate: boolean,
    valueFormat?: string,
    value: unknown = '',
  ): string => {
    // 根据格式化配置格式化显示
    const strVal = `${value}`;
    if (!valueFormat) {
      return strVal;
    }
    if (isDate && dayjs(strVal, valueFormat, true).isValid()) {
      const formatVal = dayjs(strVal).format(valueFormat);
      return formatVal;
    }
    return ibiz.util.text.format(strVal, valueFormat);
  };

  /**
   * 获取数据导出模型
   * @returns
   */
  getDataExcelModel(): { header: string[]; fields: string[] } {
    const { dedataExportId, degridColumns = [] } = this.model;
    const excelModel: { header: string[]; fields: string[] } = {
      header: [],
      fields: [],
    };
    if (dedataExportId) {
      if (this.allExportColumns.length) {
        excelModel.fields = this.allExportColumns.map(x => x.appDEFieldId!);
        excelModel.header = this.allExportColumns.map(x => x.caption!);
      }
    } else {
      const exportColumns = this.state.columnStates
        .filter(column => {
          let state = !column.hidden;
          const customColumn = this.allCustomColumns.find(
            c => c.codeName === column.key,
          );
          // 默认显示自定义列
          if (customColumn) state = true;
          return state;
        })
        .map(column => {
          return degridColumns.find(x => x.codeName === column.key)!;
        });
      excelModel.fields = exportColumns.map(item => item.id!);
      excelModel.header = exportColumns.map(item => item.caption!);
    }
    return excelModel;
  }

  /**
   * 格式化导出数据
   * @return {string}
   * @author: zzq
   * @Date: 2024-03-20 17:54:16
   */
  formatExcelData(data: IData[], fields: string[]): IData[] {
    const cloneData = clone(
      data.map(item => {
        return fields.reduce((obj: IData, key: string) => {
          obj[key] = item[key];
          return obj;
        }, {});
      }),
    );
    cloneData.forEach(item => {
      Object.keys(item).forEach((key: string) => {
        let value = item[key];
        const fieldColumnC = this.fieldColumns[key];
        const format = fieldColumnC?.valueFormat;
        const curField = this.dataEntity.appDEFields?.find(
          _item => _item.id === key,
        );
        const isDate =
          (curField && DataTypes.isDate(curField.stdDataType!)) || false;
        const unitName = fieldColumnC?.model.unitName || '';
        if (fieldColumnC && fieldColumnC.model.valueType !== 'SIMPLE') {
          value = ValueExUtil.toText(fieldColumnC.model, value);
        }
        if (this.allExportCodelistMap.get(key)) {
          value =
            this.allExportCodelistMap.get(key)!.find(x => x.value === item[key])
              ?.text || value;
        } else {
          value = this.formatValue(isDate, format, value) + unitName;
        }
        item[key] = value;
      });
    });
    return cloneData;
  }

  /**
   * 获取导出数据
   * @return {Promise<IData[]>}
   * @author: zzq
   * @Date: 2024-03-20 17:54:16
   */
  async getExportData(params: IApiExportParams): Promise<IData[]> {
    const { type } = params;
    let data: IData[] = [];
    // 未指定类型时，默认导出当前页
    if (!type || type === 'activatedPage') {
      data = this.state.rows.map(row => row.data);
    } else if (type === 'maxRowCount' || type === 'customPage') {
      const { size } = this.state;
      const { startPage, endPage } = params;
      const viewParam =
        type === 'customPage'
          ? {
              page: 0,
              offset: (startPage! - 1) * size,
              size: (endPage! - startPage! + 1) * size,
            }
          : { size: this.dataExport?.maxRowCount || 1000, page: 0 };
      data = await this.loadData({ viewParam });
    } else if (type === 'selectedRows') {
      data = this.getData();
    }
    if (data.length === 0) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.grid.exported'),
      );
    }
    return data;
  }

  /**
   * @description 执行后台导出
   * @param params 额外参数
   */
  async excuteBackendExport(params: IApiExportParams): Promise<void> {
    // 准备参数
    const fetchParams = await this.getFetchParams({ ...this.params });
    let tempParams: IParams = {};
    const { type } = params;
    if (!type || type === 'activatedPage') {
      const { size, curPage } = this.state;
      tempParams = {
        page: curPage - 1,
        size,
      };
    } else if (type === 'selectedRows') {
      const selectedData = this.getData();
      if (selectedData.length === 0) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.controller.control.grid.exported'),
        );
      }
      tempParams = {
        page: 0,
        srfkeys: selectedData.map(data => data.srfkey).join(','),
      };
    } else if (type === 'maxRowCount' || type === 'customPage') {
      const { size } = this.state;
      const { startPage, endPage } = params;
      tempParams =
        type === 'customPage'
          ? {
              page: 0,
              offset: (startPage! - 1) * size,
              size: (endPage! - startPage! + 1) * size,
            }
          : { size: this.dataExport?.maxRowCount || 1000, page: 0 };
    }
    Object.assign(fetchParams, tempParams);
    // 执行导出
    const res = await this.service.exportData(
      this.dataExport!,
      this.context,
      fetchParams,
    );
    if (res.status === 200) {
      const fileName = ibiz.util.file.getFileName(res);
      const blob = new Blob([res.data as Blob], {
        type: 'application/vnd.ms-excel',
      });
      const elink = document.createElement('a');
      elink.download = fileName;
      elink.style.display = 'none';
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      URL.revokeObjectURL(elink.href); // 释放URL 对象
      document.body.removeChild(elink);
    } else {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.common.md.exportRequestFailed'),
      );
    }
  }

  /**
   * @description 导出数据
   * @param {{  event: MouseEvent; params: IApiExportParams }} args
   * @returns {*}  {Promise<void>}
   * @memberof GridController
   */
  async exportData(args: {
    params: IApiExportParams;
    event: MouseEvent;
  }): Promise<void> {
    if (this.dataExport?.enableBackend) {
      await this.excuteBackendExport(args.params);
      return;
    }
    const { header, fields } = this.getDataExcelModel();
    if (!header) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.grid.tabularColumns'),
      );
    }
    // 导出前先填充导出代码表数据
    await this.fillExportCodelistMap();
    const data = await this.getExportData(args.params);
    const formatData = this.formatExcelData(data, fields);
    const table = formatData.map(v => Object.values(v));
    await exportData(header, table, this.model.logicName!);
  }

  /**
   * 计算默认值并返回一个对象，对象里的属性就是要填充的默认值
   * 没有的属性就是不需要填充默认值的属性
   * @author lxm
   * @date 2023-09-18 04:01:06
   * @param {IData} data
   * @param {boolean} isCreate
   * @return {*}  {IData}
   */
  calcDefaultValue(data: IData, isCreate: boolean): IData {
    const result: IData = {};
    Object.values(this.editColumns).forEach(c => {
      const { createDV, createDVT, updateDV, updateDVT } = c.editItem;
      const valueType = isCreate ? createDVT : updateDVT;
      const defaultValue = isCreate ? createDV : updateDV;
      const defaultVal = getDefaultValue(
        {
          name: c.fieldName,
          valueType,
          defaultValue,
          valueFormat: c.valueFormat,
        },
        { data, context: this.context, params: this.params },
      );
      if (defaultVal !== undefined) {
        result[c.fieldName] = defaultVal;
      }
    });
    return result;
  }

  /**
   * 查找rowState
   * @author lxm
   * @date 2023-10-27 07:27:48
   * @param {IData} data
   * @return {*}  {(IGridRowState)}
   */
  findRowStateIndex(data: IData): number {
    const isCreate = data.srfuf === Srfuf.CREATE;
    const compareKey = isCreate ? 'tempsrfkey' : 'srfkey';
    // 识别联合主键场景，unionkeys参数以|分割，同一条数据关联多个版本情况
    const unionKeys = this.controlParams.unionkeys
      ? this.controlParams.unionkeys.split('|')
      : undefined;
    return this.state.rows.findIndex(item => {
      if (unionKeys) {
        let result = item.data[compareKey] === data[compareKey];
        if (!result) return false;
        for (let i = 0; i < unionKeys.length; i++) {
          const tempResult = item.data[unionKeys[i]] === data[unionKeys[i]];
          if (!tempResult) {
            return false;
          }
          result = result && tempResult;
        }
        return result;
      }
      return item.data[compareKey] === data[compareKey];
    });
  }

  /**
   * 查找rowState
   * @author lxm
   * @date 2023-10-27 07:27:48
   * @param {IData} data
   * @return {*}  {(IGridRowState | undefined)}
   */
  findRowState(data: IData): IGridRowState | undefined {
    const index = this.findRowStateIndex(data);
    return index !== -1 ? this.state.rows[index] : undefined;
  }

  /**
   * 行单击事件
   *
   * @author lxm
   * @date 2022-08-18 22:08:16
   * @param {IData} data 选中的单条数据
   */
  async onRowClick(data: IData): Promise<void> {
    // 表格行单击时，只选中点击行
    this.setSelection([data]);
    // 设置导航数据
    this.setNavData(data);
    // 激活事件
    if (this.state.mdctrlActiveMode === 1) {
      await this.setActive(data);
    }
  }

  /**
   * 转换各类多语言
   *
   * @date 2023-05-18 02:57:00
   * @protected
   */
  protected convertMultipleLanguages(): void {
    const convertColumnCaption = (columns: IDEGridColumn[]): void => {
      columns.forEach((column: IDEGridColumn) => {
        if (column.capLanguageRes && column.capLanguageRes.lanResTag) {
          column.caption = ibiz.i18n.t(
            column.capLanguageRes.lanResTag,
            column.caption,
          );
        }
        if (
          column.columnType === 'GROUPGRIDCOLUMN' &&
          (column as IDEGridGroupColumn).degridColumns
        ) {
          convertColumnCaption((column as IDEGridGroupColumn).degridColumns!);
        }
      });
    };
    if (this.model.degridColumns && this.model.degridColumns.length > 0) {
      convertColumnCaption(this.model.degridColumns);
    }
  }

  /**
   * 控制列显示
   * @param {IColumnState} columnState
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-19 16:02:14
   */
  setColumnVisible(columnState: IColumnState): void {
    if (columnState.hideMode === 3) {
      return;
    }
    columnState.hidden = !columnState.hidden;
    this.calcColumnFixed();
    this.saveColumnStates();
  }

  /**
   * 设置点击分组后回显相关参数
   * @param {IData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-21 10:54:45
   */
  setGroupParams(data: ISearchGroupData): void {
    if (data.sort) {
      this.state.sortQuery = data.sort;
      this.isSetSort = true;
    } else {
      this.state.sortQuery = '';
    }
    if (data.columnstates) {
      // 找到本地缓存中对应项的列宽，并合并到data.columnstate中
      const storageColumnStatesStr = localStorage.getItem(
        `${this.view.model.id}.${this.model.name}.columnStates`,
      );
      if (storageColumnStatesStr) {
        const storageColumnStates: IStorageColumnStates = JSON.parse(
          storageColumnStatesStr,
        );
        let columns: IColumnState[] = [];
        if (this.addSchemaColumn && storageColumnStates.schemaColumnStates) {
          columns = storageColumnStates.schemaColumnStates;
        } else if (
          !this.addSchemaColumn &&
          storageColumnStates.defaultColumnStates
        ) {
          columns = storageColumnStates.defaultColumnStates;
        }
        // 合并本地缓存列宽
        data.columnstates.forEach((item: IColumnState) => {
          const column = columns.find((state: IColumnState) => {
            return item.key === state.key;
          });
          if (column) {
            item.columnWidth = column.columnWidth;
          }
        });
      }

      this.state.columnStates = this.mergeGridColumnStates(
        this.state.columnStates,
        data.columnstates,
      );
      this.calcColumnFixed();
    } else {
      this.initColumnStates();
    }
  }

  /**
   * 改变列排序
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-01-05 11:21:07
   */
  changeColumnStateSort(
    columnKey: string,
    newIndex: number,
    oldIndex: number,
  ): void {
    const columnState = this.state.columnStates.find(
      item => item.key === columnKey,
    );
    if (columnState) {
      // 移除元素从旧位置，将元素插入到新位置
      this.state.columnStates.splice(oldIndex, 1);
      this.state.columnStates.splice(newIndex, 0, columnState);
      this.calcColumnFixed();
      // 存本地缓存
      this.saveColumnStates();
    }
  }

  /**
   * 存储列状态到本地
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-01-05 13:45:36
   */
  saveColumnStates(): void {
    let storageColumnStates: IStorageColumnStates = {};
    // 先判断是否缓存过，根据addSchemaColumn判断存到哪个属性上
    const storageColumnStatesStr = localStorage.getItem(
      `${this.view.model.id}.${this.model.name}.columnStates`,
    );
    if (storageColumnStatesStr) {
      storageColumnStates = JSON.parse(storageColumnStatesStr);
    }
    if (this.addSchemaColumn) {
      storageColumnStates.schemaColumnStates = this.state.columnStates;
    } else {
      storageColumnStates.defaultColumnStates = this.state.columnStates;
    }
    localStorage.setItem(
      `${this.view.model.id}.${this.model.name}.columnStates`,
      JSON.stringify(storageColumnStates),
    );
  }

  /**
   * 执行对应部件行为消息提示
   * @author zzq
   * @date 2024-04-03 15:51:21
   * @param {string} tag
   * @param {({ default?: string; data?: IData | IData[]; error?: Error; rowState?: IGridRowState })} [opts]
   * @return {*}  {void}
   */
  actionNotification(
    tag: string,
    opts?: {
      default?: string;
      data?: IData | IData[];
      error?: Error;
      rowState?: IGridRowState;
    },
  ): void {
    if (opts?.error && opts?.rowState && opts.error instanceof EntityError) {
      const { details, message } = opts.error;
      const { errors, data, oldData } = opts.rowState;
      if (this.saveErrorHandleMode === 'reset') {
        if (data && Object.keys(data).length > 0) {
          Object.keys(data).forEach(key => {
            if (data[key] !== oldData[key]) {
              data[key] = oldData[key];
            }
          });
        }
      } else {
        details.forEach(detail => {
          errors[detail.name] = detail.errorInfo || message;
        });
      }
    }
    super.actionNotification(tag, { ...(opts || {}) });
  }

  /**
   * 拖拽改变
   * @param dragging 拖拽目标
   * @param drop 放置目标
   * @param dropType 放置类型
   */
  async onDragChange(
    dragging: IGridRowState,
    drop: IGridRowState,
    dropType: 'prev' | 'next',
  ): Promise<void> {
    const moveAction = this.model.moveControlAction?.appDEMethodId;
    if (!moveAction) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.common.md.noMoveDataCconfig'),
      );
    }
    const moveParams = {
      srftargetkey: drop.data.srfkey,
      srfmovetype: dropType === 'prev' ? 'MOVEBEFORE' : 'MOVEAFTER',
    };
    const res = await this.service.moveOrderItem(
      this.context,
      dragging.data,
      moveParams,
    );
    if (res.ok) {
      // 通知实体数据变更
      this.emitDEDataChange('update', dragging.data);
      await this.refresh();
    }
  }

  /**
   * 计算统计数据
   * @author: zzq
   * @date 2024-06-28 17:12:58
   * @return {*}  {Promise<void>}
   */
  calcTotalData(): void {
    if (this.percentkeys.length === 0) {
      return;
    }
    const totalResult: IData = {};
    this.percentkeys.forEach(fieldName => {
      const result = this.state.items
        .map(item => item[fieldName] as number)
        .reduce((a, b) => {
          const aValue = Number(a) || 0;
          const bValue = Number(b) || 0;
          return plus(aValue, bValue);
        }, 0);
      if (result) {
        totalResult[fieldName] = result;
      }
    });
    this.state.totalResult = totalResult;
  }

  /**
   * 切换折叠(分组表格使用),其中tag表示操作指定表格分组行标识，若不传则操作当前表格的所有分组展开状态，expand表示是否展开，若不传则以当前分组状态为基准切换
   * @author: zzq
   * @date 2024-08-23 17:12:58
   * @return {*}  {void}
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    // 存在分组id则展开/收缩分组
    if (tag) {
      const row = this.state.items.find(x => x.srfkey === tag);
      if (row) {
        this._evt.emit('onToggleRowExpansion', { row, expand });
      }
    } else {
      // 不存在分组id时全展开/全收缩
      const { groups } = this.state;
      groups.forEach(group => {
        if (group.children && group.children.length > 0) {
          const row = group.children[0];
          this._evt.emit('onToggleRowExpansion', { row, expand });
        }
      });
    }
  }

  /**
   * @description 展开改变
   * @param {IData} item
   * @param {boolean} expanded
   * @memberof TreeGridController
   */
  expandChange(item: IData, expanded: boolean): void {
    const index = this.state.expandRowKeys.findIndex(
      key => key === item.srfkey,
    );
    if (index === -1 && expanded) {
      this.state.expandRowKeys.push(item.srfkey);
    } else if (index > -1 && !expanded) {
      this.state.expandRowKeys.splice(index, 1);
    }
  }

  /**
   * @description 获取表格列
   * @template K
   * @param {K} type 表格列类型
   * @param {string} id 表格列标识
   * @returns {*}  {IApiGridColumnMapping[K]}
   * @memberof IApiGridController
   */
  getGridColumn<K extends keyof IApiGridColumnMapping>(
    type: K,
    id: string,
  ): IApiGridColumnMapping[K] {
    return this.columns[id] as unknown as IApiGridColumnMapping[K];
  }

  /**
   * @description 生命周期-销毁完成
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof GridController
   */
  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    this.destroyAutoSaveTimer();
  }
}
