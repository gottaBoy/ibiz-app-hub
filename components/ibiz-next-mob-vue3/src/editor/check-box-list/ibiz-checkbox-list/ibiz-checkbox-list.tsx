import { computed, defineComponent, ref, watch } from 'vue';
import {
  getCheckboxListProps,
  getEditorEmits,
  useFocusAndBlur,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import { isNil, equals } from 'ramda';
import './ibiz-checkbox-list.scss';
import { CheckBoxListEditorController } from '../checkbox-list-editor.controller';

/**
 * 选项框列表
 * @primary
 * @description 使用van-checkbox-group组件和van-checkbox组件，用于在一组备选项中进行多选的场景。支持编辑器类型包含：`选项框列表`
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizCheckboxList = defineComponent({
  name: 'IBizCheckboxList',
  props: getCheckboxListProps<CheckBoxListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('checkbox-list');

    const c = props.controller;

    const codeList = c.codeList;

    // 代码表数据
    const items = ref<readonly IData[]>([]);
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

    // 当前模式
    const currentMode = computed(() => {
      if (codeList && codeList.orMode) {
        return codeList.orMode.toLowerCase();
      }
      return 'str';
    });

    // 值分隔符
    let valueSeparator = ',';
    if (codeList && codeList.valueSeparator) {
      valueSeparator = codeList.valueSeparator;
    }

    // 选中数组
    const selectArray = computed({
      get() {
        if (!isNil(props.value)) {
          if (Object.is(currentMode.value, 'num') && items) {
            const selectsArray: Array<string | number> = [];
            const num: number =
              typeof props.value === 'string'
                ? parseInt(props.value, 10)
                : props.value;
            items.value.forEach((item: IData) => {
              // eslint-disable-next-line no-bitwise
              if ((num & item.value) === item.value) {
                selectsArray.push(item.value);
              }
            });
            return selectsArray;
          }
          if (Object.is(currentMode.value, 'str')) {
            const strVal = props.value! as string;
            if (strVal !== '') {
              if (codeList) {
                const selects: Array<string | number> =
                  strVal.split(valueSeparator);
                if (codeList.codeItemValueNumber) {
                  for (let i = 0, len = selects.length; i < len; i++) {
                    selects[i] = Number(selects[i]);
                  }
                }
                return selects;
              }
              return strVal.split(',');
            }
          }
        }
        return [];
      },
      set(val: Array<string | number>) {
        let value: null | string | number | string[] = null;
        if (Object.is(currentMode.value, 'num')) {
          let temp: number = 0;
          val.forEach(item => {
            const numVal: number =
              typeof item === 'string' ? parseInt(item, 10) : item;
            // eslint-disable-next-line no-bitwise
            temp |= numVal;
          });
          value = temp;
        } else if (Object.is(currentMode.value, 'str')) {
          const _datas: string[] = [];
          if (items.value.length > 0) {
            items.value.forEach((_item: IData) => {
              const index = val.findIndex((_key: unknown) =>
                Object.is(_item.value, _key),
              );
              if (index === -1) {
                return;
              }
              _datas.push(_item.value);
            });
            value = _datas.join(valueSeparator);
          }
        }
        emit('change', value);
      },
    });

    const onSelectArrayChange = (value: Array<string | number>) => {
      if (equals(value, selectArray.value)) {
        return;
      }
      selectArray.value = value;
    };

    const valueText = computed(() => {
      const valueArr = Array.isArray(selectArray.value)
        ? selectArray.value
        : [selectArray.value];

      return items.value
        .filter(item => valueArr.includes(item.value))
        .map(item => item.text)
        .join(',');
    });

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      items,
      selectArray,
      valueText,
      editorRef,
      onSelectArrayChange,
    };
  },
  render() {
    return (
      <div
        ref='editorRef'
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {this.readonly ? (
          this.valueText
        ) : (
          <van-checkbox-group
            direction='horizontal'
            v-model={this.selectArray}
            onChange={this.onSelectArrayChange}
            {...useFilterAttribute(this.$attrs)}
          >
            {this.items.map((item, index: number) => (
              <van-checkbox
                shape='square'
                key={index}
                name={item.value}
                disabled={this.disabled}
              >
                <span class={this.ns.e('text')}>{item.text}</span>
              </van-checkbox>
            ))}
          </van-checkbox-group>
        )}
      </div>
    );
  },
});
