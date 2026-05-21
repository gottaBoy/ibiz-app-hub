import { App } from 'vue';
import {
  PanelContainerController,
  PanelContainerState,
  registerPanelItemProvider,
} from '@ibiz-template/runtime';
import { withInstall } from '../../util';
import { PanelContainer } from './panel-container';
import { PanelContainerProvider } from './panel-container.provider';

// 适配老版本面板容器通过该包导出
export { PanelContainerState, PanelContainerController };

export const IBizPanelContainer = withInstall(
  PanelContainer,
  function (v: App) {
    v.component(PanelContainer.name!, PanelContainer);
    registerPanelItemProvider('CONTAINER', () => new PanelContainerProvider());
    registerPanelItemProvider(
      'CONTAINER_DEFAULT',
      () => new PanelContainerProvider(),
    );
    // registerPanelItemProvider(
    //   'CONTAINER_CONTAINER_GRID',
    //   () => new PanelContainerProvider(),
    // );
  },
);

export default IBizPanelContainer;
