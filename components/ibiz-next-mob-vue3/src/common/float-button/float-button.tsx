import { defineComponent, h, PropType, ref } from 'vue';
import { useNamespace, useUIStore } from '@ibiz-template/vue3-util';
import './float-button.scss';

export const FloatButton = defineComponent({
  name: 'IBizFloatButton',
  props: {
    enabledAlign: {
      type: Boolean,
      default: true,
    },
    align: {
      type: String as PropType<
        'LEFTSTART' | 'LEFT' | 'LEFTEND' | 'RIGHT' | 'RIGHTSTART' | 'RIGHTEND'
      >,
      default: 'RIGHTEND',
    },
    renderMode: {
      type: String as PropType<'BUTTON' | 'DIV'>,
      default: 'BUTTON',
    },
  },
  emits: {
    click: (_event: MouseEvent, _currentTarget: MouseEvent) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('float-button');

    const { zIndex } = useUIStore();
    const popoverZIndex = zIndex.zIndex + 1;

    const buttonRef = ref();

    const handleClick = (_event: MouseEvent) => {
      emit('click', _event, buttonRef.value);
    };

    return { ns, popoverZIndex, buttonRef, handleClick };
  },
  render() {
    const align = this.align.toLocaleLowerCase();
    const defaultSlot = this.$slots.default?.();
    const iconSlot = this.$slots.icon?.();
    const textSlot = this.$slots.text?.();
    // 元素名称
    const tagName = this.renderMode?.toLocaleLowerCase();

    return h(
      tagName,
      {
        ref: 'buttonRef',
        class: [
          this.ns.b(),
          this.ns.m(tagName),
          this.ns.is(align, !!align),
          align ? this.ns.bm('customized', align) : '',
        ],
        style: {
          [this.ns.cssVarBlockName('z-index')]: this.popoverZIndex,
        },
        onClick: this.handleClick,
      },
      [
        defaultSlot || [
          <div class={this.ns.e('icon')}>
            {iconSlot || <van-icon name='setting-o'></van-icon>}
          </div>,
          <div class={this.ns.e('text')}>{textSlot}</div>,
        ],
      ],
    );
  },
});
