import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { layoutEmits, layoutProps, useLayoutRender } from '../tab-layout-util';
import './tab-default-layout.scss';

export const TabDefaultLayout = defineComponent({
  name: 'IBizTabDefaultLayout',
  props: layoutProps,
  emits: layoutEmits,
  setup(_props, { emit }) {
    const ns = useNamespace('tab-default-layout');

    const { onTabChange } = useLayoutRender(emit);

    return { ns, onTabChange };
  },
  render() {
    let content = (
      <van-tabs
        active={this.activeName}
        ellipsis={false}
        onChange={this.onTabChange}
      >
        {this.tabPages.map(tab => {
          if (tab.isHidden) return;

          return (
            <van-tab name={tab.id}>
              {{
                title: () => (
                  <iBizInfoItem
                    class={this.ns.e('tab-item')}
                    label={tab.text}
                    icon={tab.icon}
                    badge={tab.counter}
                  />
                ),
              }}
            </van-tab>
          );
        })}
      </van-tabs>
    );
    if (this.layoutMode === 'bottom') {
      content = (
        <van-tabbar
          fixed={false}
          modelValue={this.activeName}
          onChange={this.onTabChange}
        >
          {this.tabPages.map(tab => {
            if (tab.isHidden) return;

            return (
              <van-tabbar-item name={tab.id}>
                {{
                  default: () => (
                    <iBizInfoItem
                      class={this.ns.e('tab-item')}
                      label={tab.text}
                      icon={tab.icon}
                      badge={tab.counter}
                      layoutMode='vertical'
                    />
                  ),
                }}
              </van-tabbar-item>
            );
          })}
        </van-tabbar>
      );
    }
    return (
      <div
        class={[this.ns.b(), this.ns.is(this.layoutMode, !!this.layoutMode)]}
      >
        {content}
      </div>
    );
  },
});
