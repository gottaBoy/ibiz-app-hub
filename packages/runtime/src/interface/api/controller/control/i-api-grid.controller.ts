import { IApiData } from '@ibiz-template/core';
import { IDEGrid } from '@ibiz/model-core';
import { IApiGridRowState, IApiGridState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';
import { IApiGridColumnController } from './grid-column';
import { IApiGridColumnMapping } from '../common';

/**
 * 表格
 * @description 采用可交互的动态数据表格组件，支持多维度排序、灵活筛选、批量操作及可视化对比，具备响应式布局与性能优化功能，实现高效的结构化数据展示与管理。
 * @primary
 * @export
 * @interface IApiGridController
 * @extends {IApiMDControlController<T, S>}
 * @ctrlparams {"name":"overflowmode","title":"超出呈现模式","parameterType":"'wrap' | 'ellipsis'","defaultvalue":"'wrap'","description":"单元格内容超出单元格宽度时的呈现模式，包含超出省略 'ellipsis'，换行 'wrap' 两种模式"}
 * @ctrlparams {name:emptyhiddenunit,title:无值隐藏,parameterType:boolean,defaultvalue:true,description:单元格无值时，其对应的值单位（如'天'、'%'等）是否隐藏}
 * @ctrlparams {"name":"editshowmode","title":"行编辑显示模式","parameterType":"'row' | 'cell' | 'all'","defaultvalue":"'row'","description":"表格进行行编辑时的呈现模式，包含单行编辑模式 'row'，单元格编辑 'cell' 模式，整个表格编辑模式 'all' 三种模式"}
 * @ctrlparams {"name":"editsavemode","title":"行编辑保存模式","parameterType":"'cell-blur' | 'auto' | 'manual'","defaultvalue":"'cell-blur'","description":"处理表格进行行编辑时的保存模式，包含单元格失焦 'cell-blur' 时保存，自动保存 'auto'，手动确认 'manual' 三种模式"}
 * @ctrlparams {"name":"saveerrorhandlemode","title":"行编辑保存错误处理模式","parameterType":"'default' | 'reset'","defaultvalue":"'default'","description":"表格保存错误时的处理模式，包含提示错误信息 'default' 和重置表格行数据 'reset' 两种模式"}
 * @ctrlparams {name:enablejsonschema,title:是否允许使用jsonschema模式,parameterType:boolean,defaultvalue:false,description:是否启用自定义添加表格列功能，当参数为true且后台返回 jsonschema 格式的表格列相关数据时执行添加操作}
 * @ctrlparams {"name":"jsonschemaparams","title":"jsonschema参数数据","parameterType":"string","defaultvalue":"'{}'","description":"当`enablejsonschema`值为true时生效。支持配置 JSON 字符串并将其转化为导航参数，该参数将被附加到获取实体的 jsonschema 数据的请求参数中，获取的数据解析后用于自定义添加表格列功能，示例格式：\\{\"test\":\"%test%\"\\}"}
 * @ctrlparams {name:percentkeys,title:是否显示百分比,parameterType:string[],defaultvalue:[],description:表示表格哪些列的单元格要显示百分比}
 * @ctrlparams {"name":"showmode","title":"表格显示模式","parameterType":"'DEFAULT' | 'ONLYDATA' | 'MIXIN'","defaultvalue":"'DEFAULT'","description":"'DEFAULT' 显示分页栏、表格头部、无数据提示的文字及图片；'ONLYDATA' 仅显示数据区域，不显示分页栏与表格头部，在无值时不显示无数据提示图片；'MIXIN' 无数据时仅显示数据区域，不显示分页栏、表格头部、无数据提示图片"}
 * @ctrlparams {name:rowspankeys,title:合并行的key集合,parameterType:string[],defaultvalue:[],description:用于指定表格中需要合并单元格的行，取值为表格列的 prop值（表格列模型代码标识）数组}
 * @ctrlparams {name:colspankeys,title:合并列的key集合,parameterType:string[],defaultvalue:[],description:用于指定表格中需要合并单元格的列，取值为表格列的 prop值（表格列模型代码标识）数组}
 * @ctrlparams {name:defaultexpandall,title:默认全部展开,parameterType:boolean,defaultvalue:false,description:树形表格时是否默认全部展开}
 * @ctrlparams {"name":"triggermode","title":"编辑器值变更模式","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"该配置项用于指定编辑器触发 `emit` 事件的模式。若值为 'input'，则在输入框值变更时触发 change 事件；若值为 'blur'，则在输入框失去焦点时触发 change 事件"}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @ctrlparams {"name":"grouprowmode","title":"分组行模式","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT'|'NEWROW'","description":"表格分组行模式，当值为 DEFAULT 时,表示分组行由业务数据第一行出，NEWROW 表示分组行独出一行","effectPlatform":"web"}
 * @ctrlparams {"name":"unionkeys","title":"表格联合主键","parameterType":"string","description":"表格联合主键，参数以|分割，用于解决同一条数据关联多个版本呈现问题","effectPlatform":"web"}
 * @childrenparams {"name":"DEFGRIDCOLUMN","title":"表格属性列","interface":"IApiGridFieldColumnController"}
 * @childrenparams {"name":"DEFGRIDCOLUMN_EDIT","title":"表格编辑列","interface":"IApiGridFieldEditColumnController"}
 * @childrenparams {"name":"GROUPGRIDCOLUMN","title":"表格分组列","interface":"IApiGridGroupColumnController"}
 * @childrenparams {"name":"UAGRIDCOLUMN","title":"表格操作列","interface":"IApiGridUAColumnController"}
 * @template T
 * @template T
 * @template S
 */
export interface IApiGridController<
  T extends IDEGrid = IDEGrid,
  S extends IApiGridState = IApiGridState,
> extends IApiMDControlController<T, S> {
  /**
   * @description 表格列数据
   * @type {{ [key: string]: IApiGridColumnController }}
   * @memberof IApiGridController
   */
  columns: { [key: string]: IApiGridColumnController };

  /**
   * @description 保存单条数据
   * @param {IApiData} data
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  save(data: IApiData): Promise<void>;

  /**
   * @description 设置行属性的值
   * @param {IApiGridRowState} row 行状态控制器
   * @param {string} name 要设置数据的列名称
   * @param {unknown} value 要设置的值
   * @param {boolean} ignore 忽略脏值检查
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  setRowValue(
    row: IApiGridRowState,
    name: string,
    value: unknown,
    ignore: boolean,
  ): Promise<void>;

  /**
   * @description 校验一行数据的所有编辑项
   * @param {IApiGridRowState} row 要校验的行数据控制器
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiGridController
   */
  validate(row: IApiGridRowState): Promise<boolean>;

  /**
   * @description 校验所有行数据
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiGridController
   */
  validateAll(): Promise<boolean>;

  /**
   * @description 保存表格所有数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  saveAll(): Promise<void>;

  /**
   * @description 切换表格的行编辑开启关闭状态
   * @memberof IApiGridController
   */
  toggleRowEdit(): void;

  /**
   * @description 切换单行的编辑状态
   * @param {IApiGridRowState} row 行数据控制器
   * @param {boolean} [editable] 目标编辑状态
   * @param {boolean} [isSave] 是否保存
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  switchRowEdit(
    row: IApiGridRowState,
    editable?: boolean,
    isSave?: boolean,
  ): Promise<void>;

  /**
   * @description 表格编辑项更新
   * @param {IApiGridRowState} row 行数据控制器
   * @param {string} updateId 更新项标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  updateGridEditItem(row: IApiGridRowState, updateId: string): Promise<void>;

  /**
   * @description 导出数据，导出成Excel文件
   * @param {{  event?: MouseEvent; params: IApiData }} args
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridController
   */
  exportData(args: { event?: MouseEvent; params: IApiData }): Promise<void>;

  /**
   * @description 基于数据获取行数据控制器
   * @param {IApiData} data
   * @returns {*}  {(IApiGridRowState | undefined)}
   * @memberof IApiGridController
   */
  findRowState(data: IApiData): IApiGridRowState | undefined;

  /**
   * @description 切换折叠(分组表格使用),其中tag表示操作指定表格分组行标识，若不传则操作当前表格的所有分组展开状态，expand表示是否展开，若不传则以当前分组状态为基准切换
   * @param {{ tag: string; expand: boolean }} [params]
   * @memberof IApiGridController
   */
  changeCollapse(params?: { tag?: string; expand?: boolean }): void;

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
  ): IApiGridColumnMapping[K];
}
