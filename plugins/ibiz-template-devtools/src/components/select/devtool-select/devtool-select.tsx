/* eslint-disable vue/no-dupe-keys */
import {
  defineComponent,
  PropType,
  ref,
  provide,
  watch,
  onMounted,
  onUnmounted,
} from 'vue';
import { useNamespace, useClickOutside } from '@ibiz-template/vue3-util';
import { OnClickOutsideResult } from '@ibiz-template/core';
import './devtool-select.scss';
import { devtoolT } from '../../../locale/helper';

export const DevtoolSelect = defineComponent({
  name: 'DevtoolSelect',
  props: {
    placeholder: {
      type: String as PropType<string>,
      default: undefined,
    },
    value: {
      type: String as PropType<string>,
    },
    width: {
      type: Number as PropType<number>,
      default: 182,
    },
    options: {
      type: Array as PropType<string[]>,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('devtool-select');
    const isShow = ref(false);
    const curLabel = ref<string>('');
    const curValue = ref<string>('');
    const options = ref<string[]>([]);

    // 向插槽中的组件传入数据，传入当前组件的 this，在 option 组件中可以直接访问
    const provideData = {
      isShow,
      curLabel,
      curValue,
      options,
    };

    watch(
      () => curValue.value,
      () => {
        emit('change', curValue.value);
      },
    );

    watch(
      () => props.options,
      () => {
        if (props.options) {
          options.value = props.options;
        }
      },
      { immediate: true, deep: true },
    );

    const editorRef = ref();
    let funcs: OnClickOutsideResult;
    const showOption = (): void => {
      isShow.value = !isShow.value;
    };

    onMounted(() => {
      if (editorRef.value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        funcs = useClickOutside(editorRef, async (_evt: any) => {
          if (isShow.value) {
            showOption();
          }
        });
      }
    });

    onUnmounted(() => {
      if (funcs && funcs.stop) {
        funcs.stop();
      }
    });

    provide('select', {
      isShow,
      curLabel,
      curValue,
      showOption,
    });

    watch(
      () => props.value,
      () => {
        const curOption = options.value.filter(item => item === props.value);
        if (curOption.length > 0) {
          [curLabel.value] = curOption;
          [curValue.value] = curOption;
        }
      },
      { immediate: true, deep: true },
    );

    const renderSvg = (): JSX.Element => {
      return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
          <path
            fill='currentColor'
            d='M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z'
          ></path>
        </svg>
      );
    };

    return {
      ns,
      editorRef,
      isShow,
      curLabel,
      curValue,
      options,
      showOption,
      provideData,
      renderSvg,
    };
  },
  render() {
    return (
      <div
        id='select'
        class={this.ns.b()}
        style={{ width: `${this.width}px` }}
        onClick={this.showOption}
        ref='editorRef'
      >
        <div class={this.ns.e('title')}>
          {this.curLabel ? (
            <span>{this.curLabel}</span>
          ) : (
            <span class={this.ns.e('placeholder')}>
              {this.placeholder === undefined
                ? devtoolT('selectPlaceholder')
                : this.placeholder}
            </span>
          )}
          <span class={[this.ns.e('icon'), this.isShow ? 'reverse' : '']}>
            {this.renderSvg()}
          </span>
        </div>
        <div
          class={this.ns.e('option')}
          style={{ display: this.isShow ? 'block' : 'none' }}
        >
          {this.$slots.default?.()}
        </div>
      </div>
    );
  },
});

export default DevtoolSelect;
