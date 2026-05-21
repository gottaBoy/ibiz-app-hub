import { defineComponent, PropType } from 'vue';
import { useCtx, useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { ViewMsgPosController } from './view-msg-pos.controller';

/**
 * 视图消息占位
 * @primary
 */
export const ViewMsgPos = defineComponent({
  name: 'IBizViewMsgPos',
  props: {
    /**
     * @description 视图消息占位控件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 视图消息占位控件控制器
     */
    controller: {
      type: ViewMsgPosController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('view-msg-pos');

    const ctx = useCtx();
    const view = ctx.view;
    return {
      ns,
      view,
    };
  },
  render() {
    const c = this.controller;
    if (!this.view.state.isCreated) {
      return;
    }
    const position = c.rawItemParams.position || 'BODY';
    const scroll = c.rawItemParams.scroll === 'true';
    const viewMessages = this.view.state.viewMessages[position];
    if (viewMessages?.length) {
      return (
        <div class={this.ns.b()}>
          <view-message
            messages={viewMessages}
            scroll={scroll}
            context={c.panel.context}
            params={c.panel.params}
            controller={c.panel.view.viewMsgController}
          ></view-message>
        </div>
      );
    }
    return null;
  },
});
