import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { useNamespace } from '../../use';
import { PanelContainerController } from './panel-container.controller';
import './panel-container.scss';

/**
 * 面板容器
 * @primary
 * @description 面板中最常见容器控件，承载面板组件，可以配置布局来控制内容呈现方式。
 */
export const PanelContainer = defineComponent({
  name: 'IBizPanelContainer',
  props: {
    /**
     * @description 面板容器模型
     */
    modelData: { type: Object as PropType<IPanelContainer>, required: true },
    /**
     * @description 面板容器控制器
     */
    controller: {
      type: PanelContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-container');
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
    const attrs = this.$attrs?.attrs as IData;

    // 动态tooltip
    if (attrs && attrs.dynamictooltip) {
      const attributes = { ...attrs.dynamictooltip };
      delete attributes.content;
      return (
        <el-tooltip
          placement='right'
          popper-class={this.ns.e('dynamic-tooltip')}
          {...attributes}
        >
          {{
            default: () => {
              return (
                <div
                  class={this.classArr}
                  onClick={() => {
                    this.controller.onClick();
                  }}
                  {...this.$attrs}
                >
                  {this.controller.model.cssStyle ? (
                    <style type='text/css'>
                      {this.controller.model.cssStyle}
                    </style>
                  ) : null}
                  {content}
                </div>
              );
            },
            content: () => {
              return (
                <div
                  class={this.ns.e('dynamic-tooltip-content')}
                  v-html={attrs.dynamictooltip.content}
                ></div>
              );
            },
          }}
        </el-tooltip>
      );
    }

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
