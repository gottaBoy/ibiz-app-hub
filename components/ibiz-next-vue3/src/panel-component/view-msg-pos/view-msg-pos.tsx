import { defineComponent, PropType } from 'vue';
import { useCtx, useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { ViewMsgPosController } from './view-msg-pos.controller';

/**
 * 视图消息占位
 * @primary
 * @description 使用el-alert组件，读取视图状态的viewMessages数据，用于在界面布局中给视图消息提供一个显示位置。
 * @panelitemparams {name:scroll,parameterType:boolean,defaultvalue:false,description:是否滚动展示}
 * @panelitemparams {name:position,parameterType:'TOP' | 'BOTTOM' | 'BODY',defaultvalue:'BODY',description:指定展示哪个位置的视图消息，TOP代表视图上方，BOTTOM代表视图下方，BODY代表视图内容区}
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
      return null;
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
