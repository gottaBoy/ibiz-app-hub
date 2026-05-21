import { defineComponent, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { layoutEmits, layoutProps, useLayoutRender } from '../tab-layout-util';
import './tab-sidebar-layout.scss';

export const TabSidebarLayout = defineComponent({
  name: 'IBizTabSidebarLayout',
  props: layoutProps,
  emits: layoutEmits,
  setup(props, { emit }) {
    const ns = useNamespace('tab-sidebar-layout');

    // 激活下标
    const activeIndex = ref(0);

    const { onTabChange } = useLayoutRender(emit);
    const onSidebarChange = (index: number) => {
      activeIndex.value = index;
      const tabTag = props.tabPages[index]?.id;
      onTabChange(tabTag);
    };

    return { ns, activeIndex, onTabChange, onSidebarChange };
  },
  render() {
    return (
      <van-sidebar
        class={[this.ns.b(), this.ns.is(this.layoutMode, !!this.layoutMode)]}
        v-model={this.activeIndex}
        onChange={this.onSidebarChange}
      >
        {this.tabPages.map(tab => {
          const isLongLabel = tab.text && tab.text.length > 3;
          return (
            <van-sidebar-item>
              {{
                title: () => (
                  <div
                    class={[
                      this.ns.e('tab-item'),
                      this.ns.is('long-label', !!isLongLabel),
                    ]}
                  >
                    <iBizInfoItem
                      label={tab.text}
                      icon={tab.icon}
                      badge={tab.counter}
                    />
                  </div>
                ),
              }}
            </van-sidebar-item>
          );
        })}
      </van-sidebar>
    );
  },
});
