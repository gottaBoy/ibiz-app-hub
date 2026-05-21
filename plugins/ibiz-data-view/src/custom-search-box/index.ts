import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { registerPortletProvider } from '@ibiz-template/runtime';
import { CustomSearchBox } from './custom-search-box';
import { CustomSearchBoxEditorProvider } from './custom-search-box.provider';

export const IBizCustomSearchBox = withInstall(CustomSearchBox, (v: App) => {
  v.component(CustomSearchBox.name!, CustomSearchBox);
  registerPortletProvider(
    'EDITOR_CUSTOMSTYLE_CUSTOM_SEARCH_BOX',
    () => new CustomSearchBoxEditorProvider(),
  );
});
