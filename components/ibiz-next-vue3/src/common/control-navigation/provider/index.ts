import { MDControlController } from '@ibiz-template/runtime';
import { NavgationBaseProvider } from './navigation-base.provider';
import { CalendarNavigationProvider } from './calendar-navigation.provider';
import { TreeNavigationProvider } from './tree-navigation.provider';
import { MapNavigationProvider } from './map-navigation.provider';
import { ChartNavigationProvider } from './chart-navigation.provider';

/**
 * 获取部件导航适配器
 *
 * @export
 * @param {MDControlController} controller
 * @return {*}  {NavgationBaseProvider}
 */
export function getNavigationProvider(
  controller: MDControlController,
): NavgationBaseProvider {
  const { controlType } = controller.model;
  if (controlType === 'CALENDAR')
    return new CalendarNavigationProvider(controller);
  if (controlType === 'TREEVIEW' || controlType === 'TREEGRIDEX')
    return new TreeNavigationProvider(controller);
  if (controlType === 'MAP') return new MapNavigationProvider(controller);
  if (controlType === 'CHART') return new ChartNavigationProvider(controller);
  return new NavgationBaseProvider(controller);
}
