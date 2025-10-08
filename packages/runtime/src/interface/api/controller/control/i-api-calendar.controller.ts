import { IDECalendar } from '@ibiz/model-core';
import { IApiCalendarState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';

/**
 * 日历
 * @description 用于显示和选择日期。其主要功能包括：展示时间轴，月/周/日视图， 支持日程查看，高亮当前日期，标记特殊事件，是日程管理类应用的核心组件。
 *  - 在配置日历部件样式为【时间轴】时，会按照时间的顺序依次展示事件数据；
 *  - 在配置日历部件样式为【月】时，可一次性显示一个月的时间以及该时间段内的事件数据，同时该模式下部件参数`showmode`可额外配置值为'daterange'和'expand'（详情见控件动态参数）；
 *  - 在配置日历部件样式为【周】时，可一次性显示一周的时间以及每天的事件数据；
 *  - 在配置日历部件样式为【天】时，可一次性显示一天24小时的时间以及各时间段内的事件数据；
 *  - 当在配置日历部件样式为【用户自定义1】时，该模式是以只读模式的周视图进行展示；
 * @primary
 * @export
 * @interface ICalendarController
 * @ctrlparams {"name":"showmode","title":"显示模式","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'ONLYDATA' | 'MIXIN' | 'daterange' | 'expand'","description":"该值为 'DEFAULT' 时正常显示无数据提示图片，该值为 'ONLYDATA' 和 'MIXIN' 时，不显示无数据提示图片；当日历部件样式为`月`时，默认情况下，时间单元格内仅显示首个事件数据，剩余事件数据隐藏，点击 `更多` 按钮后，剩余事件数据会以气泡形式展示。当该值为 'daterange' 时，会依据事件数据中的时间范围，在对应时间单元格内以连续的色块覆盖形式展示日历项范围。当该值为 'expand' 时，时间单元格内的事件数据会从上至下平铺展示","effectPlatform":"web"}
 * @ctrlparams {name:showdetail,title:显示详情,defaultvalue:false,parameterType:boolean,description:当日历部件样式为`周` 、`天`时生效，鼠标悬浮到显示日历事件项之上时是否弹出气泡框显示事件项详情,effectPlatform:web}
 * @ctrlparams {name:defaultdatetime,title:默认时间,defaultvalue:'',parameterType:string,description:当日历部件样式为`周` 、`天`、`月`、`用户自定义`时生效，用于设置日历初始化的时间，值格式化为YYYY-MM-DD,effectPlatform:web}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @extends {IApiMDControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiCalendarController<
  T extends IDECalendar = IDECalendar,
  S extends IApiCalendarState = IApiCalendarState,
> extends IApiMDControlController<T, S> {
  /**
   * @description  设置选中日期
   * @param {Date} date
   * @memberof IApiCalendarController
   */
  setSelectDate(date: Date): void;
}
