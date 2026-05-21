import { ref, defineComponent, Ref, watch } from 'vue';
import {
  getSpanProps,
  useFocusAndBlur,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './span.scss';
import { CodeListItem } from '@ibiz-template/runtime';
import { isNil } from 'ramda';
import { base64ToStr, DataTypes, isEmoji } from '@ibiz-template/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SpanEditorController } from '../span-editor.controller';

dayjs.extend(customParseFormat);

function isValidDateFormat(dateStr: string, format: string): boolean {
  if (dateStr === format) {
    return false;
  }
  return dayjs(dateStr, format, true).isValid(); // 严格模式判断是否是复合值格式化要求的日期文本
}

/**
 * 标签
 * @primary
 * @description 直接呈现文本内容，可配置单位。支持编辑器类型包含：`标签`
 * @editorparams {"name":"textseparator","parameterType":"string","defaultvalue":"','","description":"文本分隔符。如果是数组数据，在呈现时会使用文本分隔符拼接为字符串显示"}
 * @editorparams {name:reversecolor,parameterType:boolean,description:是否反转颜色，即代码表项的color是否用于代码表项的背景色}
 * @editorparams {name:showmode,parameterType:'DEFAULT' | 'ICON' | 'TEXT',defaultvalue:'DEFAULT',description:显示模式，即代码表项的显示情况，值为DEFAULT：显示图标和文本，值为ICON：只显示图标，值为TEXT：只显示文本}
 * @editorparams {"name":"valuetype","parameterType":"string","description":"编辑器的值类型"}
 * @editorparams {"name":"objectnamefield","parameterType":"string","defaultvalue":"'srfmajortext'","description":"值类型为OBJECT、OBJECTS时显示的对象属性"}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter | change | blur | focus
 */
export const IBizSpan = defineComponent({
  name: 'IBizSpan',
  props: getSpanProps<SpanEditorController>(),
  setup(props, { emit }) {
    const ns = useNamespace('span');

    const c = props.controller;

    const text: Ref<string> = ref('');

    const codeList = c.codeList;

    // 文本分隔符
    const textSeparator =
      c.model.textSeparator ||
      c.editorParams?.TEXTSEPARATOR ||
      c.editorParams?.textseparator ||
      ',';

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (isNil(newVal)) {
            text.value = '';
            return;
          }
          const { valueFormat, dataType, unitName } = c.parent;
          if (c.model.valueType === 'SIMPLES') {
            text.value = (newVal as string[]).join(textSeparator);
          } else if (c.model.valueType === 'OBJECT') {
            text.value = (newVal as IData)[
              c.model.objectNameField ? c.model.objectNameField : 'srfmajortext'
            ];
          } else if (c.model.valueType === 'OBJECTS') {
            const tempValue: string[] = [];
            (newVal as IData[]).forEach((_item: IData) => {
              tempValue.push(
                _item[
                  c.model.objectNameField
                    ? c.model.objectNameField
                    : 'srfmajortext'
                ],
              );
            });
            text.value = tempValue.join(textSeparator);
          } else if (c.model.editorType === 'ADDRESSPICKUP') {
            // 解析地址选择器的JSON字符串数据
            try {
              const tempValue: string[] = [];
              const items: IData[] = JSON.parse(newVal as string);
              items.forEach((_item: IData) => {
                tempValue.push(
                  _item[
                    c.model.objectNameField
                      ? c.model.objectNameField
                      : 'srfmajortext'
                  ],
                );
              });
              text.value = tempValue.join(textSeparator);
            } catch (error) {
              ibiz.log.error(`标签地址选择器的值不符合JSON格式${newVal}`);
            }
          } else if (valueFormat) {
            try {
              if (dataType != null && DataTypes.isDate(dataType)) {
                text.value = dayjs(newVal as string).format(valueFormat);
              } else {
                // 面板属性项是拿不到dataType的，此时先用dayjs格式化，如果能格出来说明是时间型，否则走text-format
                const tempVal = dayjs(newVal as string).format(valueFormat);
                if (isValidDateFormat(tempVal, valueFormat)) {
                  text.value = tempVal;
                } else {
                  text.value = ibiz.util.text.format(`${newVal}`, valueFormat);
                }
              }
            } catch (error) {
              text.value = `${newVal}`;
              ibiz.log.error(`${newVal} 值格式化错误`);
            }
          } else if (isEmoji(`${newVal}`)) {
            text.value = base64ToStr(`${newVal}`);
          } else {
            text.value = `${newVal}`;
          }
          if (unitName) {
            text.value += unitName;
          }
        }
      },
      {
        immediate: true,
      },
    );

    // 代码表数据
    const items = ref<readonly CodeListItem[]>([]);
    if (codeList) {
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
    }

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      c,
      text,
      editorRef,
      items,
    };
  },
  render() {
    let content = null;

    if (this.c.codeList && this.items.length > 0) {
      content = (
        <iBizCodeList
          class={[
            this.ns.e('code-list'),
            this.ns.is(
              'reverse-color',
              !!this.c.editorParams?.REVERSECOLOR ||
                !!this.c.editorParams?.reversecolor,
            ),
            this.ns.em(
              'code-list',
              this.c.editorParams?.SHOWMODE?.toLowerCase() ||
                this.c.editorParams?.showmode?.toLowerCase(),
            ),
          ]}
          codeListItems={this.items}
          codeList={this.c.codeList}
          showMode={
            this.c.editorParams?.SHOWMODE || this.c.editorParams?.showmode
          }
          value={this.text}
          convertToCodeItemText={this.c.convertToCodeItemText}
        ></iBizCodeList>
      );
    } else if (this.text) {
      content = this.text;
    } else {
      content = '';
    }

    return (
      <span
        class={[
          this.ns.b(),
          this.readonly ? this.ns.m('readonly') : '',
          this.disabled ? this.ns.m('disabled') : '',
        ]}
        ref='editorRef'
      >
        {content}
      </span>
    );
  },
});
