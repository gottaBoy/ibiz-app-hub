import { IModal, ViewController } from '@ibiz-template/runtime';
import { IAppPortalView } from '@ibiz/model-core';
import { defineComponent, h, PropType, resolveComponent } from 'vue';
import './portal-view.scss';
import { useNamespace, useViewController } from '@ibiz-template/vue3-util';

export const PortalView = defineComponent({
  name: 'IBizPortalView',
  props: {
    context: Object as PropType<IContext>,
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    modelData: { type: Object as PropType<IAppPortalView>, required: true },
    modal: { type: Object as PropType<IModal> },
    state: { type: Object as PropType<IData> },
  },
  setup() {
    const ns = useNamespace('view');
    const ns2 = useNamespace('portal-view');
    const c = useViewController((...args) => new ViewController(...args));
    // 视图部件模型在viewlayoutPanel里面。
    const controls = c.model.viewLayoutPanel?.controls || c.model.controls;

    const { viewType, sysCss, codeName } = c.model;
    const typeClass = viewType!.toLowerCase();
    const sysCssName = sysCss?.cssName;
    const viewClassNames = [
      ns.b(),
      ns2.b(),
      true && ns.b(typeClass),
      true && ns.m(codeName),
      true && sysCssName,
    ];

    return { c, ns, controls, viewClassNames };
  },
  render() {
    let content = null;
    if (this.c.state.isCreated) {
      // 绘制部件插槽，外部插槽优先
      const slots: IData = {
        ...this.$slots,
      };
      if (this.controls?.length) {
        this.controls.forEach(ctrl => {
          const slotKey = ctrl.name || ctrl.id!;
          const crtlProps = {
            context: this.c.context,
            params: this.c.params,
            provider: this.c.providers[slotKey],
            modelData: ctrl,
          };
          if (this.c.slotProps[slotKey]) {
            Object.assign(crtlProps, this.c.slotProps[slotKey]);
          }
          // 已经有插槽的不用自己绘制了。
          const outCtrlSlot = slots[slotKey];
          if (outCtrlSlot) {
            slots[slotKey] = () => {
              return outCtrlSlot(crtlProps);
            };
            return;
          }
          const provider = this.c.providers[slotKey];
          if (provider) {
            slots[slotKey] = () => {
              const comp = resolveComponent(provider.component) as string;
              return h(comp, {
                ...crtlProps,
              });
            };
          }
        });
      }

      // 绘制内容区
      if (slots.dashboard) {
        content = slots.dashboard();
      }
    }
    return (
      <div class={this.viewClassNames}>
        <iBizPresetViewHeader></iBizPresetViewHeader>
        {content}
      </div>
    );
  },
});
