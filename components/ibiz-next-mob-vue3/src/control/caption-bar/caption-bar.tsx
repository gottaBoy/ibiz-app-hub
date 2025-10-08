import { ICaptionBar } from '@ibiz/model-core';
import { defineComponent, onActivated, PropType } from 'vue';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { CaptionBarController, IControlProvider } from '@ibiz-template/runtime';
import './caption-bar.scss';

export const CaptionBarControl = defineComponent({
  name: 'IBizCaptionBarControl',
  props: {
    /**
     * @description 标题栏模型数据
     */
    modelData: {
      type: Object as PropType<ICaptionBar>,
      required: true,
    },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController(
      (...args) => new CaptionBarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    // 初始手动调用一次，因为在控制器里在初始化监听视图onViewInfoChange事件时，视图控制器就已经先抛出了该事件，导致监听不到

    c.setBrowserTabTitle();

    onActivated(() => {
      c.setBrowserTabTitle();
    });
    return { c, ns };
  },
  render() {
    return (
      <iBizControlBase
        controller={this.c}
        class={[
          this.ns.b(),
          this.ns.is('hasSub', Boolean(this.modelData.subCaption)),
          this.ns.is('show-icon', !!this.c.model.sysImage),
        ]}
      >
        <div class={this.ns.b('caption')}>
          {this.c.model.sysImage && (
            <iBizIcon
              class={[this.ns.be('caption', 'icon')]}
              icon={this.c.model.sysImage}
            ></iBizIcon>
          )}
          <span>{this.c.state.caption}</span>
        </div>
        {this.modelData.subCaption && (
          <div class={this.ns.b('sub-caption')}>
            {this.modelData.subCaption}
          </div>
        )}
      </iBizControlBase>
    );
  },
});
