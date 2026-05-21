/* eslint-disable prettier/prettier */
import { IDETreeGrid } from '@ibiz/model-core';
import { IApiTreeGridState } from '../../state';
import { IApiGridController } from './i-api-grid.controller';
import { IApiExportParams } from '../../common';

/**
 * 树表格
 * @description 采用树形表格组件，支持行级懒加载与动态伸缩交互，实现高效层级数据展示与操作。
 * @primary
 * @export
 * @interface IApiTreeGridController
 * @extends {IApiGridController<T, S>}
 * @ctrlparams {"name":"overflowmode","title":"超出呈现模式","parameterType":"'ellipsis' | 'wrap'","defaultvalue":"'wrap'","description":"单元格内容超出单元格宽度时的呈现模式，包含超出省略 'ellipsis'，换行 'wrap' 两种模式"}
 * @ctrlparams {name:emptyhiddenunit,title:无值隐藏,parameterType:boolean,defaultvalue:true,description:单元格无值时，其对应的值单位（如'天'、'%'等）是否隐藏}
 * @ctrlparams {"name":"editshowmode","title":"行编辑显示模式","parameterType":"'row' | 'cell' | 'all'","defaultvalue":"'row'","description":"表格进行行编辑时的呈现模式，包含单行编辑模式 'row'，单元格编辑 'cell' 模式，整个表格编辑模式 'all' 三种模式"}
 * @ctrlparams {"name":"editsavemode","title":"行编辑保存模式","parameterType":"'cell-blur' | 'auto' | 'manual'","defaultvalue":"'cell-blur'","description":"处理表格进行行编辑时的保存模式，包含单元格失焦 'cell-blur' 时保存，自动保存 'auto'，手动确认 'manual' 三种模式"}
 * @ctrlparams {"name":"saveerrorhandlemode","title":"行编辑保存错误处理模式","parameterType":"'default' | 'reset'","defaultvalue":"'default'","description":"表格保存错误时的处理模式，包含提示错误信息 'default' 和重置表格行数据 'reset' 两种模式"}
 * @ctrlparams {name:enablejsonschema,title:是否允许使用jsonschema模式,parameterType:boolean,defaultvalue:false,description:是否启用自定义添加表格列功能，当参数为true且后台返回 jsonschema 格式的表格列数据时执行添加操作}
 * @ctrlparams {"name":"jsonschemaparams","title":"jsonschema参数数据","parameterType":"string","defaultvalue":"'{}'","description":"当`enablejsonschema`值为true时生效。支持配置 JSON 字符串并将其转化为导航参数，该参数将被附加到获取实体的 jsonschema 数据的请求参数中，获取的数据解析后用于自定义添加表格列功能，示例格式：\\{\"test\":\"%test%\"\\}"}
 * @ctrlparams {"name":"triggermode","title":"编辑器值变更模式","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"该配置项用于指定编辑器触发 `emit` 事件的模式。若值为 'input'，则在输入框值变更时触发 change 事件；若值为 'blur'，则在输入框失去焦点时触发 change 事件"}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @ctrlparams {"name":"batchtoolbarmode","title":"批操作工具栏显示模式","parameterType":"'default' | 'multiple'","defaultvalue":"'default'","description":"批操作工具栏显示模式，值为 'default' 时表示存在选择数据就显示批操作工具栏，值为 'multiple' 时表示选择至少2条数据才显示批操作工具栏","effectPlatform":"web"}
 * @ctrlparams {"name":"paginationmode","title":"分页显示模式","defaultvalue":"'default'","parameterType":"'default'|'simple'","description":"表格分页显示模式，当值为 default 时，显示完整的分页组件，值为 simple 时，显示简略版的分页组件，仅包含总条数，当前页，上一页和下一页","effectPlatform":"web"}
 * @template T
 * @template S
 */
export interface IApiTreeGridController<
  T extends IDETreeGrid = IDETreeGrid,
  S extends IApiTreeGridState = IApiTreeGridState,
> extends IApiGridController<T, S> {
  /**
   * @description 切换树表格显示
   * @memberof IApiTreeGridController
   */
  switchTreeGridShow(): void;

  /**
   * @description 数据导出
   * @param {{ event: MouseEvent; params: IApiExportParams }} _args 导出参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiTreeGridController
   */
  exportData(_args: {event: MouseEvent;params: IApiExportParams}): Promise<void>;
}
