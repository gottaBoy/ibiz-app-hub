import { useNamespace, useCtx } from '@ibiz-template/vue3-util';
import { ICaptionBar, IPanelContainer } from '@ibiz/model-core';
import { PropType, defineComponent } from 'vue';
import './preset-view-header.scss';

export const IBizPresetViewHeader = defineComponent({
  name: 'IBizPresetViewHeader',
  props: {
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('preset-view-header');
    const ns2 = useNamespace('view-header');

    const ctx = useCtx();
    const view = ctx.view;
    const context = ctx.view.context;
    const captionBar: ICaptionBar | undefined = view.model.controls!.find(
      item => item.controlType === 'CAPTIONBAR',
    );
    return {
      ns,
      ns2,
      view,
      captionBar,
      context,
    };
  },
  render() {
    if (!ibiz.config.view.mobShowViewHeader) {
      return;
    }
    return (
      this.view.model.showCaptionBar && (
        <div class={[this.ns.b(), this.ns2.b()]}>
          <div class={this.ns.b('left')}>
            <iBizPresetViewBack view={this.view}></iBizPresetViewBack>
          </div>
          <div class={this.ns.b('center')}>
            {this.captionBar && this.view.model.showCaptionBar && (
              <iBizCaptionBarControl
                modelData={this.captionBar}
                context={this.context}
              ></iBizCaptionBarControl>
            )}
          </div>
          <div class={this.ns.b('right')}></div>
        </div>
      )
    );
  },
});
