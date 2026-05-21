/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { layoutEmits, layoutProps } from '../tab-layout-util';
import './tab-flow-layout.scss';

export const TabFlowLayout: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizTabFlowLayout',
    props: layoutProps,
    emits: layoutEmits,
    setup(props, { emit }) {
      const ns = useNamespace('tab-flow-layout');

      return { ns };
    },
    render() {
      const indexList = this.tabPages.map(_tab => _tab.text);
      return (
        <van-index-bar
          class={[this.ns.b(), this.ns.is(this.layoutMode, !!this.layoutMode)]}
          sticky={false}
          index-list={indexList}
        >
          {this.tabPages.map(tab => {
            return (
              <div class={this.ns.e('group')}>
                <van-index-anchor index={tab.text}>
                  {this.layoutMode === 'flow_noheader' ? (
                    <div class={this.ns.e('group-header-ph')}></div>
                  ) : (
                    <div class={this.ns.e('group-header')}>
                      <iBizInfoItem
                        class={this.ns.em('group-header', 'content')}
                        label={tab.text}
                        icon={tab.icon}
                        badgeFloat={false}
                        badge={tab.counter}
                      />
                    </div>
                  )}
                </van-index-anchor>
                <div class={this.ns.e('group-content')}>
                  {this.$slots.groupContent?.(tab)}
                </div>
              </div>
            );
          })}
        </van-index-bar>
      );
    },
  });
