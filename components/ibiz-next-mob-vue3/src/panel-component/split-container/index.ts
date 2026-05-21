import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { SplitContainer } from './split-container';
import { SplitContainerProvider } from './split-container.provider';
import { SplitContainerController } from './split-container.controller';

export { SplitContainerController };

export const IBizSplitContainer = withInstall(
  SplitContainer,
  function (v: App) {
    v.component(SplitContainer.name, SplitContainer);
    registerPanelItemProvider(
      'CONTAINER_CONTAINER_H_SPLIT',
      () => new SplitContainerProvider(),
    );
    registerPanelItemProvider(
      'CONTAINER_CONTAINER_V_SPLIT',
      () => new SplitContainerProvider(),
    );
  },
);

export default IBizSplitContainer;
