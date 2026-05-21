import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { SettingContainer } from './setting-container';
import { SettingContainerProvider } from './setting-container.provider';

export const IBizSettingContainer = withInstall(
  SettingContainer,
  function (v: App) {
    v.component(SettingContainer.name!, SettingContainer);
    registerPanelItemProvider(
      'CONTAINER_SETTING_CONTAINER',
      () => new SettingContainerProvider(),
    );
  },
);

export default IBizSettingContainer;
