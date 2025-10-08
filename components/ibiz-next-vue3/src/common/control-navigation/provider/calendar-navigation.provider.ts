/* eslint-disable @typescript-eslint/prefer-as-const */
import {
  INavViewMsg,
  ICalendarItemData,
  CalendarController,
  compareDateEqualByScale,
} from '@ibiz-template/runtime';
import { ISysCalendar } from '@ibiz/model-core';
import { NavgationBaseProvider } from './navigation-base.provider';

/**
 * 日历导航适配器
 *
 * @export
 * @class CalendarNavigationProvider
 * @extends {NavgationBaseProvider}
 */
export class CalendarNavigationProvider extends NavgationBaseProvider {
  keyName: 'navId' = 'navId';

  declare controller: CalendarController;

  declare model: ISysCalendar;

  /**
   * @description 通过栈数据导航
   * - 特殊处理仅使用开始时间绘制的日历
   * @memberof CalendarNavigationProvider
   */
  onNavDataByStack(): void {
    const { controlParams, state, model } = this.controller;
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
        .map(key => items.find(item => item[this.keyName] === key))
        .find(item => item !== undefined) || items[0];
    if (navData) {
      this.setNavData(navData);
    } else {
      this.clearNavigation();
    }
  }

  getNavViewMsg(item: ICalendarItemData): INavViewMsg {
    const { sysCalendarItems } = this.model;
    const itemModel = sysCalendarItems?.find(
      _item => _item.itemType === item.itemType,
    );
    if (itemModel) {
      const { context, params } = this.prepareParams(
        itemModel,
        item.deData ? item.deData : item,
        this.controller.context,
        this.controller.params,
      );
      return {
        params,
        context,
        key: item.navId,
        viewId: itemModel.navAppViewId,
      };
    }
    return {
      key: item.navId,
      context: this.controller.context,
      params: this.controller.params,
    };
  }
}
