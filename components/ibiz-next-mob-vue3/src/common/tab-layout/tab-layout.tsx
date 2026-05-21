import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  layoutEmits,
  LayoutMode,
  layoutProps,
  useLayoutRender,
} from './tab-layout-util';
import { TabFlowLayout } from './tab-flow-layout/tab-flow-layout';
import { TabSidebarLayout } from './tab-sidebar-layout/tab-sidebar-layout';
import { TabDefaultLayout } from './tab-default-layout/tab-default-layout';
import { TabDropdown } from './tab-dropdown/tab-dropdown';
import './tab-layout.scss';

export const IBizTabLayout = defineComponent({
  name: 'IBizTabLayout',
  props: layoutProps,
  emits: layoutEmits,
  setup(_props, { emit }) {
    const ns = useNamespace('tab-layout');
    const { onTabChange } = useLayoutRender(emit);
    return { ns, onTabChange };
  },
  render() {
    const attrs = {
      tabPages: this.tabPages,
      activeName: this.activeName,
      layoutMode: this.layoutMode as LayoutMode,
      onTabChange: this.onTabChange,
    };

    let content = <TabDefaultLayout {...attrs} />;

    if (this.layoutMode === 'flow' || this.layoutMode === 'flow_noheader') {
      const slots = {};
      if (this.$slots.groupContent)
        Object.assign(slots, {
          groupContent: this.$slots.groupContent,
        });
      content = <TabFlowLayout {...attrs}>{slots}</TabFlowLayout>;
    }

    if (['left', 'right'].includes(this.layoutMode)) {
      content = <TabSidebarLayout {...attrs} />;
    }

    if (['top_dropdownlist'].includes(this.layoutMode)) {
      content = <TabDropdown {...attrs} />;
    }

    return <div class={this.ns.b()}>{content}</div>;
  },
});
