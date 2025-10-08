import { IDEDataView } from '@ibiz/model-core';
import { IApiDataViewControlState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';

/**
 * 数据视图（卡片）
 * @description 数据视图（卡片）中每条数据以卡片形式展示，每张卡片作为独立容器，整合图文、操作按钮等元素，呈现清晰的信息层级与视觉分隔。
 * @primary
 * @export
 * @interface IApiDataViewControlController
 * @extends {IApiMDControlController<T, S>}
 * @ctrlparams {"name":"cardstyle","title":"卡片样式","defaultvalue":"'default'","parameterType":"'default' | 'style2' | 'userstyle'","description":"当该值为'style2' 且启用多选功能时，卡片中将显示复选框用于多选;当值为'userstyle'时，视图上的搜索栏将绘制在数据视图部件中","effectPlatform":"web"}
 * @ctrlparams {"name":"showmode","title":"显示模式","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'ONLYDATA' | 'MIXIN'","description":"'DEFAULT' 显示分页栏和无数据提示的文字及图片；'ONLYDATA' 仅显示数据区域，分页栏不显示，在无值时不显示无数据提示图片；'MIXIN' 无值时仅显示数据区域，不显示分页栏和无数据提示图片","effectPlatform":"web"}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @template T
 * @template S
 */
export interface IApiDataViewControlController<
  T extends IDEDataView = IDEDataView,
  S extends IApiDataViewControlState = IApiDataViewControlState,
> extends IApiMDControlController<T, S> {
  /**
   * @description 切换折叠，其中tag表示操作指定分组标识，若不传则操作当前卡片的所有分组展开状态，expand表示是否展开，若不传则以当前分组状态为基准切换
   * @param {{ tag?: string; expand?: boolean }} [params]
   * @memberof IApiDataViewControlController
   */
  changeCollapse(params?: { tag?: string; expand?: boolean }): void;

  /**
   * @description 滚动到顶部
   * @memberof IApiDataViewControlController
   */
  scrollToTop(): void;
}
