/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
} from '@ibiz-template/runtime';
import { IDBToolbarPortlet } from '@ibiz/model-core';
import { CustomSearchBoxEditorController } from './custom-search-box.controller';

/**
 * 直接内容(活动)编辑器适配器
 *
 * @export
 * @class RawActivityEditorProvider
 * @implements {EditorProvider}
 */
export class CustomSearchBoxEditorProvider implements IPortletProvider {
  component: string = 'CustomSearchBox';

  async createController(
    portletModel: IDBToolbarPortlet,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<CustomSearchBoxEditorController> {
    const c = new CustomSearchBoxEditorController(
      portletModel,
      dashboard,
      parent,
    );
    await c.init();
    return c;
  }
}
