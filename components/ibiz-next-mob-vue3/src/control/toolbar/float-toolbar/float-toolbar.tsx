import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, Ref, ref } from 'vue';
import { IDETBGroupItem } from '@ibiz/model-core';
import { IApiButtonContainerState, IModal } from '@ibiz-template/runtime';
import { useToolbarModalItemRender } from '../toolbar-render-util';
import './float-toolbar.scss';

/**
 * @description 浮动工具栏，用于自定义场景下浮动按钮绘制
 */
export const FloatToolbar = defineComponent({
  name: 'IBizFloatToolbar',
  props: {
    modal: {
      type: Object as PropType<IModal>,
    },
    modelData: {
      type: Object as PropType<IDETBGroupItem>,
      required: true,
    },
    buttonsState: {
      type: Object as PropType<IApiButtonContainerState>,
      required: true,
    },
    groupShowMode: {
      type: String as PropType<'DEFAULT' | 'ACTIONSHEET'>,
      required: true,
    },
    counterData: {
      type: Object as PropType<IData>,
    },
    placement: {
      type: String as PropType<
        'LEFTSTART' | 'LEFT' | 'LEFTEND' | 'RIGHT' | 'RIGHTSTART' | 'RIGHTEND'
      >,
      default: 'RIGHTEND',
    },
    direction: {
      type: String as PropType<'VERTICAL' | 'HORIZONTAL'>,
      default: 'HORIZONTAL',
    },
    immediateFloat: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace(`float-toolbar`);

    const contentRef: Ref<IData | undefined> = ref();

    const { renderToolbarItem } = useToolbarModalItemRender(ns, {
      modal: props.modal,
      counterData: props.counterData,
      buttonsState: props.buttonsState,
      groupShowMode: props.groupShowMode,
      isFloatToolbar: true,
      direction: props.direction === 'HORIZONTAL' ? 'vertical' : 'horizontal',
    });

    const handleFloatToolbarClose = () => {
      props.modal?.dismiss();
    };

    return {
      ns,
      contentRef,
      handleFloatToolbarClose,
      renderToolbarItem,
    };
  },
  render() {
    if (!this.buttonsState.visible) return null;

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is(this.placement?.toLocaleLowerCase(), !!this.placement),
          this.ns.is(this.direction?.toLocaleLowerCase(), !!this.direction),
          this.ns.is('immediate-float', !!this.immediateFloat),
        ]}
      >
        <div class={this.ns.e('wrapper')}>
          {this.modelData.detoolbarItems?.map(_item =>
            this.renderToolbarItem(_item),
          )}
        </div>
        {!this.immediateFloat ? (
          <div
            class={this.ns.e('modal')}
            onClick={this.handleFloatToolbarClose}
          ></div>
        ) : null}
      </div>
    );
  },
});
