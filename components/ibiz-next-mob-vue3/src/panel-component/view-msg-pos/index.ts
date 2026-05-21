import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { ViewMsgPos } from './view-msg-pos';
import { ViewMsgPosProvider } from './view-msg-pos.provider';
import { ViewMsgPosController } from './view-msg-pos.controller';

export { ViewMsgPosController };

export const IBizViewMsgPos = withInstall(ViewMsgPos, function (v: App) {
  v.component(ViewMsgPos.name, ViewMsgPos);
  registerPanelItemProvider(
    'RAWITEM_VIEWMSG_POS',
    () => new ViewMsgPosProvider(),
  );
});

export default IBizViewMsgPos;
