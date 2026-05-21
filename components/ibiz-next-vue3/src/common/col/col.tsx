import {
  h,
  ref,
  computed,
  PropType,
  CSSProperties,
  defineComponent,
  resolveComponent,
  ConcreteComponent,
} from 'vue';
import { IFlexLayoutPos, IGridLayoutPos, ILayoutPos } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { calcContentAlignStyle, IColState } from '@ibiz-template/runtime';
import './col.scss';

function calcGridSpanOffset(
  span: number | undefined,
  offset: number | undefined,
  layout: string | undefined,
): { span?: number; offset?: number } {
  const multiplier = layout === 'TABLE_24COL' ? 1 : 2;
  const spanDefault = layout === 'TABLE_24COL' ? 24 : 12;
  const _span = !span || span === -1 ? spanDefault : span;
  const _offset = !offset || offset === -1 ? 0 : offset;
  const result: IData = {
    span: _span * multiplier,
  };
  if (_offset !== 0) {
    result.offset = _offset;
  }
  return result;
}

export const IBizCol = defineComponent({
  name: 'IBizCol',
  props: {
    layoutPos: {
      type: Object as PropType<ILayoutPos>,
      required: true,
    },
    state: {
      type: Object as PropType<IColState>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('col');

    const elColRef = ref();

    /**
     * 计算间距类名
     */
    const spacingClass = computed(() => {
      const ns2 = useNamespace('spacing');
      const classArr: string[] = [];
      const spacings: IData = {
        top: props.layoutPos.spacingTop,
        bottom: props.layoutPos.spacingBottom,
        left: props.layoutPos.spacingLeft,
        right: props.layoutPos.spacingRight,
      };
      Object.keys(spacings).forEach(position => {
        const value = spacings[position] as string;
        if (!value) {
          return;
        }
        classArr.push(ns2.bm(position, value.toLowerCase()));
      });
      return classArr;
    });

    // 计算栅格布局的属性
    const gridAttrs = computed(() => {
      const gridLayoutPos = props.layoutPos as IGridLayoutPos;
      // FLEX布局时不计算
      if (gridLayoutPos.layout === 'FLEX') {
        return {};
      }
      // 计算倍率，12列栅格为2
      const {
        colXS,
        colXSOffset,
        colSM,
        colSMOffset,
        colMD,
        colMDOffset,
        colLG,
        colLGOffset,
      } = gridLayoutPos;
      return {
        xs: calcGridSpanOffset(colXS, colXSOffset, gridLayoutPos.layout),
        sm: calcGridSpanOffset(colSM, colSMOffset, gridLayoutPos.layout),
        md: calcGridSpanOffset(colMD, colMDOffset, gridLayoutPos.layout),
        lg: calcGridSpanOffset(colLG, colLGOffset, gridLayoutPos.layout),
      };
    });

    const alignStyle = calcContentAlignStyle(props.layoutPos);

    /**
     * @description 计算剩余空间
     * @returns {*}  {void}
     */
    const calcRemainingSpace = (): CSSProperties | undefined => {
      const element: HTMLElement = elColRef.value?.$el;
      // 判断是否存在 style4 的表单分组
      if (!element || !element.querySelector('.ibiz-form-group--style4'))
        return;
      let space: number = 0;
      (element.parentElement?.children as unknown as HTMLElement[]).forEach(
        child => {
          if (child !== element) space += child.offsetHeight;
        },
      );
      return { height: `calc(100% - ${space}px)` };
    };

    const cssVars = computed(() => {
      const layout = props.state.layout;
      const styles = {
        width: layout.width,
        height: layout.height,
        ...(alignStyle || {}),
      };
      Object.assign(styles, layout.extraStyle);
      Object.assign(styles, calcRemainingSpace());
      return styles;
    });

    const colClass = computed(() => {
      const result = [
        ns.b(),
        props.layoutPos?.layout === 'FLEX' ? ns.m('flex') : ns.m('grid'),
        ns.is('hidden', !props.state.visible),
        ...spacingClass.value,
        !alignStyle ? '' : ns.m('self-align'),
        ...props.state.layout.extraClass,
      ];
      return result;
    });

    return { ns, elColRef, colClass, gridAttrs, cssVars };
  },
  render() {
    // 不显示且不用保活时直接不绘制
    if (!this.state.visible && !this.state.keepAlive) return null;

    const defaultSlot = this.$slots.default?.();
    if (this.layoutPos?.layout === 'FLEX') {
      const pos = this.layoutPos as IFlexLayoutPos;
      return (
        <div
          class={this.colClass}
          style={{
            flexGrow: pos.grow,
            flexShrink: pos.shrink === 1 ? undefined : pos.shrink,
            flexBasis: pos.basis,
            ...this.cssVars,
          }}
        >
          {defaultSlot}
        </div>
      );
    }

    return h(
      resolveComponent('el-col') as ConcreteComponent,
      {
        ref: 'elColRef',
        class: this.colClass,
        style: this.cssVars,
        ...this.gridAttrs,
      },
      { default: () => defaultSlot },
    );
  },
});
