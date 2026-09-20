/* eslint-disable no-unused-expressions */
import { computed, defineComponent, provide } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './devtool-collapse.scss';

export const DevToolCollapse = defineComponent({
  name: 'DevToolCollapse',
  props: {
    accordion: {
      type: Boolean,
      default: false, // 默认不开启（可展开多个）
    },
    // 父组件v-model传参，子组件props中key为'value'接收，'input'事件更改
    value: {
      type: Array, // 手风琴模式的数组项只能有一个，反之可以有多个
      default() {
        return [];
      },
    },
  },
  emits: ['input', 'change'],
  setup(props, { emit }) {
    const ns = useNamespace('devtool-collapse');
    const openArr = computed(() => {
      return props.value;
    });
    const updateVModel = (name: string, isOpen: string): void => {
      const i = openArr.value.indexOf(name);
      i > -1 ? openArr.value.splice(i, 1) : openArr.value.push(name);
      emit('input', openArr.value); // input事件控制v-model的数据更改
      emit('change', name, isOpen); // change事件抛出去，供用户使用
    };

    provide('collapse', {
      updateVModel,
      openArr,
    });
    return { ns, openArr, updateVModel };
  },
  render() {
    return <div class={this.ns.b()}>{this.$slots.default?.()}</div>;
  },
});
export default DevToolCollapse;
