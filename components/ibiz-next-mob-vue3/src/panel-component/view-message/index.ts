import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { ViewMessage } from './view-message';
import { ViewMessageProvider } from './view-message.provider';

export const IBizViewMessage = withInstall(ViewMessage, function (v: App) {
  v.component(ViewMessage.name, ViewMessage);
  registerPanelItemProvider(
    'RAWITEM_VIEW_MESSAGE',
    () => new ViewMessageProvider(),
  );
});

export default IBizViewMessage;
