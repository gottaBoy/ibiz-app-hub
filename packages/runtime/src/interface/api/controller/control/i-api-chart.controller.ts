import { IDEChart } from '@ibiz/model-core';
import { IApiChartState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';

/**
 * 图表
 * @description 以数据可视化形式呈现网站页面数据的工具，通过图形（如折线图、柱状图、饼图等）直观展示业务关键指标。
 * @primary
 * @export
 * @interface IApiChartController
 * @extends {IApiMDControlController<T, S>}
 * @ctrlparams {name:chartid,title:图表标识,parameterType:string,description:此部件参数仅应用于bi报表，用于指定图表标识,effectPlatform:web}
 * @ctrlparams {name:enabledrilldetail,title:是否开启数据反查,defaultvalue:[],parameterType:IApiData[],description:此部件参数仅应用于bi报表。主要用于判断当前点击序列是否开启数据反查，如果当前序列有反查视图模型，则左键单击时弹出检查明细按钮,effectPlatform:web}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @ctrlparams {"name":"mode","title":"柱状图图表绘制模式","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'ROW'","description":"控制柱状图绘制方向，默认垂直绘制，为ROW时水平绘制"}
 * @ctrlparams {"name":"completiondate","title":"是否填充日期","parameterType":"boolean","description":"该参数为序列自定义参数，用于控制时间分组模式下是否补全时间数据（无横轴序列默认不补全（饼图，仪表盘，雷达图，漏斗图），有横轴序列默认补全）"}
 * @template T
 * @template S
 */
export interface IApiChartController<
  T extends IDEChart = IDEChart,
  S extends IApiChartState = IApiChartState,
> extends IApiMDControlController<T, S> {
  /**
   * @description 刷新图表的大小
   * @memberof IApiChartController
   */
  resizeChart(): void;

  /**
   * @description 改变tooltip的显示状态
   * @param {boolean} tag tooltip的显示状态
   * @memberof IApiChartController
   */
  changeTooltipState(tag: boolean): void;
}
