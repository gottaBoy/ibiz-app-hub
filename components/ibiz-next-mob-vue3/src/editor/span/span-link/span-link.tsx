import { defineComponent, ref, Ref, watch } from 'vue';
import {
  getSpanProps,
  getEditorEmits,
  useNamespace,
  useFocusAndBlur,
} from '@ibiz-template/vue3-util';
import './span-link.scss';
import { SpanEditorController } from '../span-editor.controller';

/**
 * 标签（数据链接）
 *
 * @description 直接呈现文本内容，可配置数据链接视图用于视图跳转。支持编辑器类型包含：`标签（数据链接）`
 * @primary
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits change | blur | focus | enter | infoTextChange
 */
export const IBizSpanLink = defineComponent({
  name: 'IBizSpanLink',
  props: getSpanProps<SpanEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('span-link');

    const c = props.controller!;

    const curValue: Ref<string> = ref('');

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          curValue.value = `${newVal}`;
        }
      },
      { immediate: true },
    );

    // 打开数据链接视图
    const openLinkView = async () => {
      await c.openLinkView(props.data);
    };

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return { ns, openLinkView, curValue, editorRef };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.readonly ? this.ns.m('readonly') : '']}
        ref='editorRef'
      >
        <a onClick={this.openLinkView}>{this.curValue}</a>
      </div>
    );
  },
});
