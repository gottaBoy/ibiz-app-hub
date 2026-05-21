import { computed, defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getRadioProps,
  useFocusAndBlur,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import './ibiz-radio.scss';
import { RadioButtonListEditorController } from '../radio-button-list.controller';

/**
 * 移动端单选项列表
 * @primary
 * @description 使用van-radio-group组件和van-radio组件，用于在一组备选项中进行单选的场景。支持编辑器类型包含：`移动端单选项列表`
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizRadio = defineComponent({
  name: 'IBizRadio',
  props: getRadioProps<RadioButtonListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('radio');

    const c = props.controller;

    const editorModel = c.model;

    // 代码表
    const items = ref<readonly IData[]>([]);

    // 当前值
    const currentVal = computed({
      get() {
        // 不用判断类型兼容类型不匹配
        // eslint-disable-next-line eqeqeq
        return items.value.find(item => item.value == props.value)?.value;
      },
      set(val: string | number | undefined) {
        emit('change', val);
      },
    });

    watch(
      () => props.data,
      newVal => {
        c.loadCodeList(newVal).then(_codeList => {
          items.value = _codeList;
        });
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const valueText = computed(() => {
      // eslint-disable-next-line eqeqeq
      return items.value.find(item => item.value == props.value)?.text || '';
    });

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      editorModel,
      items,
      valueText,
      currentVal,
      editorRef,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
        ref='editorRef'
      >
        {this.readonly ? (
          this.valueText
        ) : (
          <van-radio-group
            class={this.ns.e('group')}
            v-model={this.currentVal}
            direction='horizontal'
            {...useFilterAttribute(this.$attrs)}
          >
            {this.items.map((_item, index: number) => (
              <van-radio
                key={index}
                name={_item.value}
                disabled={this.disabled}
              >
                <span class={this.ns.e('text')}>{_item.text}</span>
              </van-radio>
            ))}
          </van-radio-group>
        )}
      </div>
    );
  },
});
