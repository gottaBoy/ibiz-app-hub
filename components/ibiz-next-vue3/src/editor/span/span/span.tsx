import { ref, defineComponent, Ref, watch, computed } from 'vue';
import {
  getSpanProps,
  useFocusAndBlur,
  useNamespace,
  useCodeListListen,
} from '@ibiz-template/vue3-util';
import './span.scss';
import { CodeListItem } from '@ibiz-template/runtime';
import { isNil } from 'ramda';
import {
  DataTypes,
  base64ToStr,
  isEmoji,
  showTitle,
} from '@ibiz-template/core';
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
 *
 * @description 直接呈现文本内容，可配置单位，无值时显示全局配置的emptyText，支持编辑器类型包含：`标签`
 * @primary
 * @editorparams {"name":"textseparator","parameterType":"string","defaultvalue":"','","description":"文本分隔符。如果是数组数据，在呈现时会使用文本分隔符拼接为字符串显示"}
 * @editorparams {name:overflowmode,parameterType:'auto' | 'ellipsis',description:文本换行模式。当参数为 'auto' 时，若内容超出宽度则会换行显示；当参数为 'ellipsis' 时，若内容超出宽度则会显示省略号}
 * @editorparams {"name":"valuetype","parameterType":"string","description":"编辑器的值类型"}
 * @editorparams {"name":"objectnamefield","parameterType":"string","defaultvalue":"'srfmajortext'","description":"值类型为OBJECT、OBJECTS时显示的对象属性"}
 * @editorparams {name:emptyhiddenunit,parameterType:boolean,defaultvalue:true,description:编辑器无值时，其对应的值单位（如'天'、'%'等）是否隐藏}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits change | blur | focus | enter | infoTextChange
 */
export const IBizSpan = defineComponent({
  name: 'IBizSpan',
  props: getSpanProps<SpanEditorController>(),
  setup(props, { emit }) {
    const ns = useNamespace('span');

    const c = props.controller;

    const text: Ref<string> = ref('');

    const codeList = c.codeList;

    const { valueFormat, dataType, unitName } = c.parent;

    const spanTitle = ref<string>('');
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
                } else if (
                  !Number.isNaN(Number(newVal)) &&
                  Number.isFinite(Number(newVal))
                ) {
                  text.value = `${ibiz.util.text.format(
                    Number(newVal) as unknown as string,
                    valueFormat,
                  )}`;
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
            if (c.emptyHiddenUnit) {
              if (text.value) {
                text.value += unitName;
              }
            } else {
              text.value += unitName;
            }
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

    const fn = (data: CodeListItem[] | undefined) => {
      if (data) {
        items.value = data;
      }
    };

    useCodeListListen(c.model.appCodeListId, c.context.srfappid, fn);

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    // 是否显示表单默认内容
    const showFormDefaultContent = computed(() => {
      if (
        props.controlParams &&
        props.controlParams.editmode === 'hover' &&
        !props.readonly
      ) {
        return true;
      }
      return false;
    });

    return {
      ns,
      c,
      text,
      editorRef,
      items,
      valueFormat,
      unitName,
      showFormDefaultContent,
      spanTitle,
    };
  },
  render() {
    let content = null;

    if (this.c.codeList) {
      if (this.c.codeList.thresholdGroup) {
        content = this.items.length > 0 && (
          <iBizCodeList
            class={this.ns.e('code-list')}
            codeListItems={this.items}
            codeList={this.c.codeList}
            value={this.value}
            valueFormat={this.valueFormat}
            unitName={this.unitName}
            convertToCodeItemText={this.c.convertToCodeItemText}
          ></iBizCodeList>
        );
      } else {
        content = this.items.length > 0 && (
          <iBizCodeList
            class={this.ns.e('code-list')}
            codeListItems={this.items}
            codeList={this.c.codeList}
            value={this.text}
            convertToCodeItemText={this.c.convertToCodeItemText}
          ></iBizCodeList>
        );
      }
    } else if (this.text) {
      content = this.text;
      this.spanTitle = this.text;
    } else {
      content = (
        <iBizEditorEmptyText
          showPlaceholder={this.c.emptyShowPlaceholder}
          placeHolder={this.c.placeHolder}
        />
      );
    }

    const isEllipsis =
      this.c.editorParams.overflowMode === 'ellipsis' ||
      this.c.editorParams.overflowmode === 'ellipsis' ||
      this.c.model.wrapMode === 'NOWRAP';

    return (
      <span
        class={[
          this.ns.b(),
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('show-default', this.showFormDefaultContent),
          this.ns.is('is-ellipsis', isEllipsis),
        ]}
        ref='editorRef'
        title={showTitle(this.spanTitle)}
      >
        {content}
      </span>
    );
  },
});
