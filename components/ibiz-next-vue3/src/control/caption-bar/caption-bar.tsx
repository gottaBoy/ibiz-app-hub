import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, onActivated, computed } from 'vue';
import { ICaptionBar } from '@ibiz/model-core';
import { CaptionBarController, IControlProvider } from '@ibiz-template/runtime';
import './caption-bar.scss';

export const CaptionBarControl: ReturnType<typeof defineComponent> =
  defineComponent({
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
       * @description 应用上下文
       */
      context: { type: Object as PropType<IContext>, required: true },
      /**
       * @description 视图参数
       * @default {}
       */
      params: { type: Object as PropType<IParams>, default: () => ({}) },
      /**
       * @description 部件适配器
       */
      provider: { type: Object as PropType<IControlProvider> },
      /**
       * @description 业务数据（为修复面板下）
       */
      data: { type: Object as PropType<IData> },
    },
    setup() {
      const c = useControlController(
        (...args) => new CaptionBarController(...args),
      );
      const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

      c.setBrowserTabTitle();

      onActivated(() => {
        c.setBrowserTabTitle();
      });

      const showTotal = computed(() => {
        return c.state.totalx !== undefined;
      });

      return { c, ns, showTotal };
    },
    render() {
      return (
        <iBizControlBase controller={this.c} class={[this.ns.b()]}>
          <div
            class={[
              this.ns.b('caption'),
              this.ns.is('show-icon', !!this.c.model.sysImage),
            ]}
          >
            {this.c.model.sysImage && (
              <iBizIcon
                class={[this.ns.be('caption', 'icon')]}
                icon={this.c.model.sysImage}
              ></iBizIcon>
            )}
            <div class={[this.ns.be('caption', 'content')]}>
              {this.c.state.caption}
            </div>
            {this.showTotal && (
              <div class={[this.ns.be('caption', 'total')]}>
                {ibiz.i18n.t('control.captionBar.total', {
                  total: this.c.state.totalx,
                  invisibleNum: this.c.state.totalx! - this.c.state.total,
                })}
              </div>
            )}
          </div>
        </iBizControlBase>
      );
    },
  });
