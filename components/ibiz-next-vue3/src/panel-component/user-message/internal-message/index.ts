import { registerInternalMessageProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { InternalMessageDefaultProvider } from './common/internal-message-default/internal-message-default.provider';
import { InternalMessageDefault } from './common/internal-message-default/internal-message-default';
import { InternalMessageJSONtProvider } from './internal-message-json/internal-message-json.provider';
import { InternalMessageJSON } from './internal-message-json/internal-message-json';
import { InternalMessageContainer } from './common/internal-message-container/internal-message-container';
import { InternalMessageHTML } from './internal-message-html/internal-message-html';
import { InternalMessageHTMLtProvider } from './internal-message-html/internal-message-html.provider';
import { InternalMessageTextProvider } from './internal-message-text/internal-message-text.provider';
import { InternalMessageText } from './internal-message-text/internal-message-text';
import { InternalMessagGroup } from './internal-message-group/internal-message-group';

export { InternalMessageTab } from './internal-message-tab/internal-message-tab';

export function installInternalMessage(v: App): void {
  v.component(InternalMessagGroup.name, InternalMessagGroup);
  v.component(InternalMessageContainer.name, InternalMessageContainer);
  v.component(InternalMessageDefault.name, InternalMessageDefault);
  v.component(InternalMessageJSON.name, InternalMessageJSON);
  v.component(InternalMessageHTML.name, InternalMessageHTML);
  v.component(InternalMessageText.name, InternalMessageText);

  // 注册站内信适配器
  registerInternalMessageProvider(
    'DEFAULT',
    () => new InternalMessageDefaultProvider(),
  );

  registerInternalMessageProvider(
    'JSON',
    () => new InternalMessageJSONtProvider(),
  );

  registerInternalMessageProvider(
    'HTML',
    () => new InternalMessageHTMLtProvider(),
  );

  registerInternalMessageProvider(
    'TEXT',
    () => new InternalMessageTextProvider(),
  );
}
