import { IPanelContainer } from '@ibiz/model-core';
import { onRouteChange, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { IndexBlankPlaceholderController } from './index-blank-placeholder.controller';
import './index-blank-placeholder.scss';

/**
 * 空白占位
 * @primary
 * @description 首页空白占位组件，当菜单未进行导航时，首页显示此容器内的内容。
 */
export const IndexBlankPlaceholder = defineComponent({
  name: 'IBizIndexBlankPlaceholder',
  props: {
    /**
     * @description 空白占位模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 空白占位控制器
     */
    controller: {
      type: Object as PropType<IndexBlankPlaceholderController>,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('index-blank-placeholder');
    const { id } = props.modelData;

    // 类名控制
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    if (c.routeDepth) {
      onRouteChange(args => {
        // 如果有2级视图则不显示
        c.setVisible(!args.currentKey);
      }, c.routeDepth + 1);
    }

    return { ns, classArr };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow slot='content' layout={this.modelData.layout}>
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
    return (
      <div
        class={this.classArr}
        onClick={() => {
          this.controller.onClick();
        }}
      >
        {this.controller.model.cssStyle ? (
          <style type='text/css'>{this.controller.model.cssStyle}</style>
        ) : null}
        {content}
      </div>
    );
  },
});
