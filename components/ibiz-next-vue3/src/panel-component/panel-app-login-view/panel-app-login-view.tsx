import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { PanelAppLoginViewController } from './panel-app-login-view.controller';
import './panel-app-login-view.scss';
/**
 * 面板容器（应用登录视图）
 * @primary
 * @description 登录视图专用容器，用于处理登录视图中特有布局元素。
 */
export const PanelAppLoginView = defineComponent({
  name: 'IBizPanelAppLoginView',
  props: {
    /**
     *  @description 面板容器（应用登录视图）模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     *  @description 面板容器（应用登录视图）控制器
     */
    controller: {
      type: PanelAppLoginViewController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-app-login-view');
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

    // 样式变量
    const cssVars = computed(() => {
      let styles = {};
      const pathName = window.location.pathname;
      if (pathName) {
        const lastIndex = pathName.lastIndexOf('/');
        if (lastIndex !== -1) {
          const path = pathName.substring(0, lastIndex + 1);
          styles = {
            'header-url': `url('${path}assets/images/login-header.png')`,
            'avatar-url': `url('${path}assets/images/login-avatar.png')`,
          };
        }
      }
      return ns.cssVarBlock(styles);
    });

    return { ns, classArr, cssVars };
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
        style={this.cssVars}
        onClick={event => this.controller.onClick(event)}
      >
        {this.controller.model.cssStyle ? (
          <style type='text/css'>{this.controller.model.cssStyle}</style>
        ) : null}
        {content}
      </div>
    );
  },
});
