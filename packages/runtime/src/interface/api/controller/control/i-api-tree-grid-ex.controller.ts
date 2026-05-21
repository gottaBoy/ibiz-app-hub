import { IDETreeGridEx } from '@ibiz/model-core';
import { IApiTreeGridExState, IApiTreeNodeData } from '../../state';
import { IApiTreeController } from './i-api-tree.controller';

/**
 * 树表格(增强)
 * @description 实现可折叠树形表格组件，支持节点数据懒加载、列宽拖拽调整、行双击事件触发、多条件排序及行选中高亮，提升数据浏览与操作效率。
 * @primary
 * @export
 * @interface IApiTreeGridEXController
 * @extends {IApiGridController<T, S>}
 * @ctrlparams {"name":"overflowmode","title":"超出呈现模式","parameterType":"'ellipsis' | 'wrap'","defaultvalue":"'wrap'","description":"单元格内容超出单元格宽度时的呈现模式，包含超出省略 'ellipsis'，换行 'wrap' 两种模式"}
 * @ctrlparams {name:emptyhiddenunit,title:无值隐藏,parameterType:boolean,defaultvalue:true,description:单元格无值时，其对应的值单位（如'天'、'%'等）是否隐藏}
 * @ctrlparams {"name":"editshowmode","title":"行编辑显示模式","parameterType":"'row' | 'cell' | 'all'","defaultvalue":"'row'","description":"表格进行行编辑时的呈现模式，包含单行编辑模式 'row'，单元格编辑 'cell' 模式，整个表格编辑模式 'all' 三种模式"}
 * @ctrlparams {"name":"editsavemode","title":"行编辑保存模式","parameterType":"'cell-blur' | 'auto' | 'manual'","defaultvalue":"'cell-blur'","description":"处理表格进行行编辑时的保存模式，包含单元格失焦 'cell-blur' 时保存，自动保存 'auto'，手动确认 'manual' 三种模式"}
 * @template T
 * @template S
 */
export interface IApiTreeGridEXController<
  T extends IDETreeGridEx = IDETreeGridEx,
  S extends IApiTreeGridExState = IApiTreeGridExState,
> extends IApiTreeController<T, S> {
  /**
   * @description 保存单条数据
   * @param {IApiTreeNodeData} data 树节点数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiTreeGridEXController
   */
  save(data: IApiTreeNodeData): Promise<void>;
}
