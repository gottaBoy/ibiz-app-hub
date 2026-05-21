import {
  IAppView,
  IAppViewEngine,
  IAppViewLogic,
  IControl,
} from '@ibiz/model-core';

/**
 * 通过视图模型获取里面的部件模型集合
 * @author lxm
 * @date 2023-07-17 11:36:18
 * @export
 * @param {IAppView} view
 * @return {*}  {IControl[]}
 */
export function getControlsByView(view: IAppView): IControl[] {
  const { viewLayoutPanel } = view;
  const controls = view.controls || [];
  if (viewLayoutPanel) {
    controls.push(...(viewLayoutPanel.controls || []));
  }
  return controls;
}

/**
 * 通过视图模型获取视图逻辑集合
 * @author lxm
 * @date 2023-07-17 11:37:37
 * @export
 * @param {IAppView} view
 * @return {*}  {IAppViewLogic[]}
 */
export function getViewLogics(view: IAppView): IAppViewLogic[] {
  const { viewLayoutPanel } = view;
  const viewLogics = view.appViewLogics || [];
  if (viewLayoutPanel) {
    viewLogics.push(...(viewLayoutPanel.appViewLogics || []));
  }
  return viewLogics;
}

/**
 * 通过视图模型获取视图引擎集合
 * @author lxm
 * @date 2023-07-17 11:37:37
 * @export
 * @param {IAppView} view
 * @return {*}  {IAppViewEngine[]}
 */
export function getViewEngines(view: IAppView): IAppViewEngine[] {
  const { viewLayoutPanel } = view;
  const appViewEngines = view.appViewEngines || [];
  if (viewLayoutPanel) {
    appViewEngines.push(...(viewLayoutPanel.appViewEngines || []));
  }
  return appViewEngines.filter(engine => {
    switch (engine.engineCat) {
      case 'CTRL':
        return false;
      default:
        return true;
    }
  });
}

/**
 * @description 获取部件引擎
 * @export
 * @param {IAppView} view
 * @returns {*}  {IAppViewEngine[]}
 */
export function getCtrlEngines(view: IAppView): IAppViewEngine[] {
  const { viewLayoutPanel } = view;
  const appViewEngines = view.appViewEngines || [];
  if (viewLayoutPanel) {
    appViewEngines.push(...(viewLayoutPanel.appViewEngines || []));
  }
  return appViewEngines.filter(engine => engine.engineCat === 'CTRL');
}
