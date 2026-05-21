/* eslint-disable @typescript-eslint/prefer-as-const */
import {
  ISysCalendar,
  ICalendarExpBar,
  ISysCalendarItem,
} from '@ibiz/model-core';
import {
  INavViewMsg,
  ICalendarItemData,
  ICalendarController,
  ICalendarExpBarState,
  ICalendarExpBarEvent,
  ICalendarExpBarController,
} from '../../../interface';
import { ExpBarControlController } from './exp-bar.controller';
import { compareDateEqualByScale } from '../../../utils';

/**
 * 日历导航栏控制器
 *
 * @export
 * @class CalendarExpBarController
 * @extends {ExpBarControlController<ICalendarExpBar, ICalendarExpBarState, ICalendarExpBarEvent>}
 * @implements {ICalendarExpBarController}
 */
export class CalendarExpBarController
  extends ExpBarControlController<
    ICalendarExpBar,
    ICalendarExpBarState,
    ICalendarExpBarEvent
  >
  implements ICalendarExpBarController
{
  /**
   * 导航栏key名称 默认srfkey 多导航视图类 由子类重写
   *
   * @author zk
   * @date 2023-07-10 03:07:53
   * @memberof ExpBarControlController
   */
  navKeyName: 'navId' = 'navId';

  protected getCalendarItemModel(
    itemTypeName: string,
  ): ISysCalendarItem | undefined {
    const { sysCalendarItems } = this.XDataModel as ISysCalendar;
    return sysCalendarItems?.find(item => item.itemType === itemTypeName);
  }

  get xDataController(): ICalendarController | undefined {
    const controller = this.view.getController(this.model.xdataControlName!);
    if (!controller)
      ibiz.log.error(
        ibiz.i18n.t('runtime.controller.control.expBar.unableMore', {
          xdataControlName: this.model.xdataControlName,
        }),
      );
    return controller as ICalendarController;
  }

  public navBySrfnav(): void {
    if (!this.xDataController) return;
    const selectItem: ICalendarItemData | undefined =
      this.xDataController.state.items.find(
        item => item.navId === this.state.srfnav,
      );
    super.navBySrfnav();
    if (!selectItem) return;
    const date = new Date(selectItem.beginTime);
    this.xDataController.setSelectDate(date);
  }

  /**
   * @description 根据栈数据导航
   * - 特殊处理仅使用开始时间绘制的日历
   * @memberof CalendarExpBarController
   */
  navDataByStack(): void {
    if (!this.xDataController) return;
    const { controlParams, state, model } = this.xDataController;
    const calendarStyle = model.calendarStyle?.toLowerCase();
    const items = state.items.filter(item => {
      if (
        (calendarStyle === 'month' && controlParams.showmode !== 'daterange') ||
        calendarStyle === 'user'
      )
        return compareDateEqualByScale(
          item.beginTime,
          state.selectedDate,
          calendarStyle === 'user' ? 'week' : 'month',
        );
      return true;
    });
    const navData =
      this.navStack
        .map(nav =>
          items.find(item => nav[this.navKeyName] === item[this.navKeyName]),
        )
        .find(item => item !== undefined) || items[0];
    if (navData) {
      this.xDataController.setActive(navData);
      this.xDataController.setSelection([navData]);
    } else {
      this.clearNavigation();
    }
  }

  /**
   *  获取导航视图
   *
   * @author zk
   * @date 2023-06-29 03:06:41
   * @param {IDETabViewPanel} tabViewPanel
   * @return {*}  {Promise<INavViewMsg>}
   * @memberof TabExpPanelController
   */
  public getNavViewMsg(item: ICalendarItemData): INavViewMsg {
    const itemModel = this.getCalendarItemModel(item.itemType);
    if (itemModel) {
      const { context, params } = this.prepareParams(
        itemModel,
        item.deData ? item.deData : item,
        this.context,
        this.params,
      );
      context.currentSrfNav = item.navId;
      this.state.srfnav = item.navId;
      return {
        key: item.navId,
        context,
        params,
        viewId: itemModel.navAppViewId,
        isCache: this.isCache,
      };
    }
    return {
      key: item.navId,
      context: this.context,
      params: this.params,
      isCache: this.isCache,
    };
  }
}
