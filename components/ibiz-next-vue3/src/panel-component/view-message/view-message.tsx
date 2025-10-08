import { defineComponent, PropType } from 'vue';
import { useCtx, useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { PanelItemController } from '@ibiz-template/runtime';

/**
 * 视图消息
 * @primary
 * @description 使用el-alert组件，用于高亮显示消息位置为BODY视图内容区的视图消息。
 * @param {*}
 * @return {*}
 */
export const ViewMessage = defineComponent({
  name: 'IBizViewMessage',
  props: {
    /**
     * @description 视图消息组件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 视图消息组件控制器
     */
    controller: {
      type: PanelItemController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('view-message');
    const c = props.controller;
    const ctx = useCtx();
    const { view } = ctx;
    return {
      ns,
      c,
      view,
    };
  },
  render() {
    const c = this.view;
    if (c.state.isCreated) {
      const viewMessages = c.state.viewMessages.BODY;
      if (viewMessages?.length) {
        return (
          <view-message
            class={[this.ns.e('body-message')]}
            messages={viewMessages}
          ></view-message>
        );
      }
    }
    return null;
  },
});
