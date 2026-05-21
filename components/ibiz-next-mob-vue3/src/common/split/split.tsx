import { useNamespace } from '@ibiz-template/vue3-util';
import {
  Ref,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import './split.scss';

export const IBizSplit = defineComponent({
  name: 'IBizSplit',
  props: {
    modelValue: {
      type: [Number, String],
      default: 0.5,
    },
    mode: {
      validator: (value: string) => {
        return ['horizontal', 'vertical'].includes(value);
      },
      default: 'horizontal',
    },
    min: {
      type: [Number, String],
      default: '30px',
    },
    max: {
      type: [Number, String],
      default: '30px',
    },
  },
  emits: ['update:modelValue', 'on-move-start', 'on-moving', 'on-move-end'],
  setup(props, { emit }) {
    const ns = useNamespace('split');

    const outerWrapper: Ref<HTMLDivElement | null> = ref(null);

    const offset = ref(0);
    const oldOffset: Ref<string | number> = ref(0);
    const isMoving = ref(false);
    const computedMin: Ref<string | number> = ref(0);
    const computedMax: Ref<string | number> = ref(0);
    const currentValue: Ref<string | number> = ref(0.5);
    const initOffset = ref(0);

    const wrapperClasses = computed(() => [
      ns.b('wrapper'),
      ns.is('no-select', isMoving.value),
    ]);
    const paneClasses = computed(() => [
      ns.b('pane'),
      isMoving.value ? ns.bm('pane', 'moving') : '',
    ]);
    const isHorizontal = computed(() => props.mode === 'horizontal');
    const anotherOffset = computed(() => 100 - offset.value);
    const valueIsPx = computed(() => typeof props.modelValue === 'string');
    const offsetSize = computed(() =>
      isHorizontal.value ? 'offsetWidth' : 'offsetHeight',
    );

    const px2percent = (numerator: string, denominator: string) => {
      return parseFloat(numerator) / parseFloat(denominator);
    };

    const getComputedThresholdValue = (type: 'min' | 'max') => {
      const size = outerWrapper.value![offsetSize.value];
      if (valueIsPx.value) {
        return typeof props[type] === 'string'
          ? props[type]
          : size * (props[type] as number);
      }
      return typeof props[type] === 'string'
        ? px2percent(props[type] as string, size as unknown as string)
        : props[type];
    };

    const getMax = (value1: string | number, value2: string | number) => {
      if (valueIsPx.value)
        return `${Math.max(
          parseFloat(value1 as string),
          parseFloat(value2 as string),
        )}px`;
      return Math.max(value1 as number, value2 as number);
    };

    const getAnotherOffset = (value: string | number) => {
      let res: string | number = 0;
      if (valueIsPx.value)
        res = `${
          outerWrapper.value![offsetSize.value] - parseFloat(value as string)
        }px`;
      else res = 1 - (value as number);
      return res;
    };

    const handleMove = (e: PointerEvent) => {
      if (!isMoving.value) return false;
      const pageOffset = isHorizontal.value ? e.pageX : e.pageY;
      const moveOffset = pageOffset - initOffset.value;
      const outerWidth = outerWrapper.value![offsetSize.value];
      let value = valueIsPx.value
        ? `${parseFloat(oldOffset.value as string) + moveOffset}px`
        : px2percent(
            (outerWidth * (oldOffset.value as number) +
              moveOffset) as unknown as string,
            outerWidth as unknown as string,
          );
      const anotherValue = getAnotherOffset(value);
      if (
        parseFloat(value as string) <= parseFloat(computedMin.value as string)
      ) {
        value = getMax(value, computedMin.value);
      }
      if (
        parseFloat(anotherValue as string) <=
        parseFloat(computedMax.value as string)
      ) {
        value = getAnotherOffset(getMax(anotherValue, computedMax.value));
      }
      emit('update:modelValue', value);
      emit('on-moving', e);
    };

    const handleUp = () => {
      isMoving.value = false;
      emit('on-move-end');
    };

    const handleMousedown = (e: PointerEvent) => {
      initOffset.value = isHorizontal.value ? e.pageX : e.pageY;
      oldOffset.value = props.modelValue;
      isMoving.value = true;

      emit('on-move-start');
    };

    const computeOffset = () => {
      nextTick(() => {
        computedMin.value = getComputedThresholdValue('min');
        computedMax.value = getComputedThresholdValue('max');
        offset.value =
          (((valueIsPx.value
            ? px2percent(
                props.modelValue as string,
                outerWrapper.value![offsetSize.value] as unknown as string,
              )
            : props.modelValue) as number) *
            10000) /
          100;
      });
    };

    watch(
      () => props.modelValue,
      (val: string | number) => {
        if (val !== currentValue.value) {
          currentValue.value = val;
          computeOffset();
        }
      },
    );

    onMounted(() => {
      nextTick(() => {
        computeOffset();
      });

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
      document.addEventListener('pointercancel', handleUp);

      window.addEventListener('resize', computeOffset);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', computeOffset);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
    });

    return {
      ns,
      outerWrapper,
      offset,
      wrapperClasses,
      paneClasses,
      isHorizontal,
      anotherOffset,
      handleMousedown,
    };
  },
  render() {
    return (
      <div class={this.wrapperClasses} ref={'outerWrapper'}>
        {this.isHorizontal ? (
          <div class={this.ns.m('horizontal')}>
            <div
              style={{ width: `${this.offset}%` }}
              class={[this.paneClasses, this.ns.bm('pane', 'left')]}
            >
              {this.$slots.left?.()}
            </div>
            <div
              style={{ left: `${this.offset}%` }}
              class={this.ns.b('trigger-con')}
              tabindex={0}
              onPointerdown={(e: PointerEvent) => this.handleMousedown(e)}
            >
              {this.$slots.trigger?.() || <iBizSplitTrigger mode='vertical' />}
            </div>
            <div
              style={{ width: `${this.anotherOffset}%` }}
              class={[this.paneClasses, this.ns.bm('pane', 'right')]}
            >
              {this.$slots.right?.()}
            </div>
          </div>
        ) : (
          <div class={this.ns.m('vertical')}>
            <div
              style={{ bottom: `${this.anotherOffset}%` }}
              class={[this.paneClasses, this.ns.bm('pane', 'top')]}
            >
              {this.$slots.top?.()}
            </div>
            <div
              style={{ top: `${this.offset}%` }}
              class={this.ns.b('trigger-con')}
              tabindex={0}
              onPointerdown={(e: PointerEvent) => this.handleMousedown(e)}
            >
              {this.$slots.trigger?.() || (
                <iBizSplitTrigger mode='horizontal' />
              )}
            </div>
            <div
              style={{ top: `${this.offset}%` }}
              class={[this.paneClasses, this.ns.bm('pane', 'bottom')]}
            >
              {this.$slots.bottom?.()}
            </div>
          </div>
        )}
      </div>
    );
  },
});
