import { IDEGantt } from '@ibiz/model-core';
import { IApiGanttNodeData, IApiGanttState, IApiGanttStyle } from '../../state';
import { IApiTreeGridEXController } from './i-api-tree-grid-ex.controller';

/**
 * 甘特图
 * @description 基础的项目管理控件，通过横向时间轴展示任务的开始与结束时间、进度、依赖关系及资源分配，直观呈现项目整体计划与执行状态。
 * @primary
 * @ctrlparams {name:sliderdraggable,title:启用滑块拖拽,parameterType:boolean,defaultvalue:true,description:设置是否启用滑块拖拽，即是否允许拖拽任务项事件}
 * @ctrlparams {"name":"mustshowcolumns","title":"必须显示的列","parameterType":"string[]","defaultvalue":"[\"sn\",\"name\"]","description":"该参数指定的列在表格列选择弹框中将不能配置为隐藏列"}
 * @ctrlparams {name:limitsize,title:最大限制数,parameterType:string,defaultvalue:'0',description:在列选择弹框中，用于计算除了`mustshowcolumns`参数配置的列之外，最多可显示的列数。其默认值为 '0'，代表不限制显示列数}
 * @ctrlparams {name:enablecustomized,title:允许设置,parameterType:boolean,defaultvalue:false,description:是否允许在甘特图左侧表格中绘制列选择按钮，通过点击该按钮打开表格列选择弹框}
 * @ctrlparams {name:unit,title:时间单位,parameterType:'month' | 'week' | 'day' | 'hour',defaultvalue:'day',description:甘特图将根据该时间单位呈现右侧甘特页面样式}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @ctrlparams {"name":"linkdatasourcetype","title":"链接数据获取模式","parameterType":"'DEDATASET' | 'NODEDATA'","defaultvalue":"'NODEDATA'","description":"该参数值为'NODEDATA'，链接数据在节点项上获取。该参数值为'DEDATASET'，将请求服务获取链接数据"}
 * @ctrlparams {"name":"linkappdataentityname","title":"链接数据集应用实体名称","parameterType":"string","description":"当`linkdatasourcetype`参数值为'DEDATASET'，指定链接数据集应用实体名称"}
 * @ctrlparams {"name":"linkappdedatasetname","title":"链接应用实体结果集名称","parameterType":"string","description":"当`linkdatasourcetype`参数值为'DEDATASET'，指定链接应用实体结果集名称"}
 * @ctrlparams {"name":"linknodedataname","title":"链接节点数据属性名称","parameterType":"string","description":"当`linkdatasourcetype`参数值为'NODEDATA'，指定链接节点数据属性名称"}
 * @ctrlparams {"name":"fromdataitemname","title":"链接起始数据项属性名称","parameterType":"string","description":"该参数为链接起始数据项属性名称，用于指定链接线起始点"}
 * @ctrlparams {"name":"todataitemname","title":"链接结束数据项属性名称","parameterType":"string","description":"该参数为链接结束数据项属性名称，用于指定链接线结束点"}
 * @export
 * @interface IApiGanttController
 * @extends {IApiGridController<T, S>}
 * @template T
 * @template S
 */
export interface IApiGanttController<
  T extends IDEGantt = IDEGantt,
  S extends IApiGanttState = IApiGanttState,
> extends IApiTreeGridEXController<T, S> {
  /**
   * @description 保存数据
   * @param {IApiGanttNodeData} data 甘特图节点数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiGanttController
   */
  save(data: IApiGanttNodeData): Promise<void>;

  /**
   * @description 保存甘特图所有数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiGanttController
   */
  saveAll(): Promise<void>;

  /**
   * @description 设置甘特图样式
   * @param {IApiGanttStyle} style 甘特图样式
   * @memberof IApiGanttController
   */
  setGanttStyle(style: IApiGanttStyle): void;
}
