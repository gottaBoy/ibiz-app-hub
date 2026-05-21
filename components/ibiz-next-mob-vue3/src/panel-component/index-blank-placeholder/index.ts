import { App } from 'vue';
import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { IndexBlankPlaceholder } from './index-blank-placeholder';
import { IndexBlankPlaceholderProvider } from './index-blank-placeholder.provider';
import { IndexBlankPlaceholderController } from './index-blank-placeholder.controller';

export { IndexBlankPlaceholderController };

export const IBizIndexBlankPlaceholder = withInstall(
  IndexBlankPlaceholder,
  function (v: App) {
    v.component(IndexBlankPlaceholder.name!, IndexBlankPlaceholder);
    registerPanelItemProvider(
      'CONTAINER_INDEX_BLANK_PLACEHOLDER',
      () => new IndexBlankPlaceholderProvider(),
    );
  },
);

export default IBizIndexBlankPlaceholder;
