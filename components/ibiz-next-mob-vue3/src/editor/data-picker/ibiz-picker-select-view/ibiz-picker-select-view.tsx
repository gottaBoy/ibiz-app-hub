import { defineComponent, ref, Ref, watch } from 'vue';
import {
  getDataPickerProps,
  getEditorEmits,
  useFocusAndBlur,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-picker-select-view.scss';
import { clone } from 'ramda';
import { PickerEditorController } from '../picker-editor.controller';

/**
 * 移动端数据选择（下拉视图）
 * @primary
 * @description  使用van-field组件和van-button组件，点击按钮后弹出一个模态来呈现配置的选择视图。支持编辑器类型包含：`移动端数据选择（下拉视图）`
 * @editorparams {name:multiple,title:多选,description:是否多选,parameterType:boolean,default:true}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizPickerSelectView = defineComponent({
  name: 'IBizPickerSelectView',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('picker-select-view');

    const c = props.controller!;

    const editorModel = c.model;

    // 是否单选
    const singleSelect = ref(true);
    if (editorModel.editorParams) {
      if (editorModel.editorParams.multiple) {
        singleSelect.value = !c.toBoolean(editorModel.editorParams.multiple);
      }
    }

    // 当前多选框选中值的key集合
    const keySet: Ref<string[]> = ref([]);

    // 选中数据
    let selectedData: IData[] = [];

    // 输入框值
    const valueText: Ref<string> = ref('');

    // 视图上下文
    const context = ref(clone(c.context));

    // 视图参数
    const params = ref(clone(c.params));

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    watch(
      () => props.value,
      newVal => {
        if (singleSelect.value) {
          valueText.value = (newVal as string) || '';
          if (!props.data || !c.valueItem || !props.data[c.valueItem]) {
            ibiz.log.error('值项异常');
          } else {
            selectedData = [
              { srfkey: props.data[c.valueItem], srfmajortext: props.value },
            ];
            params.value.selectedData = selectedData;
          }
        } else {
          keySet.value = [];
          const selectItems: IData[] = [];
          if (newVal) {
            if (!props.data || !c.valueItem || !props.data[c.valueItem]) {
              ibiz.log.error('值项异常');
            } else {
              const tempValue = props.data[c.valueItem].split(',');
              const tempText = (newVal as string).split(',');
              tempValue.forEach((srfkey: string, index: number) => {
                selectItems.push({
                  srfmajortext: tempText[index],
                  srfkey,
                });
              });
              selectItems.forEach((item: IData) => {
                keySet.value.push(item.srfkey);
              });
            }
          }
          selectedData = selectItems;
          params.value.selectedData = selectedData;
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 清除
    const onClear = () => {
      // 清空回填数据
      const dataItems = c.dataItems;
      if (dataItems?.length) {
        dataItems.forEach(dataItem => {
          emit('change', null, dataItem.id);
        });
      }
      if (c.valueItem) {
        emit('change', null, c.valueItem);
      }
      emit('change', null);
    };

    // 视图数据改变
    const onViewDataChange = (event: IData[]) => {
      if (event.length === 0) {
        onClear();
        return;
      }
      if (singleSelect.value) {
        if (c.valueItem) {
          const tempValue = event[0][c.keyName]
            ? event[0][c.keyName]
            : event[0].srfkey;
          emit('change', tempValue, c.valueItem);
        }
        const tempText = event[0][c.textName]
          ? event[0][c.textName]
          : event[0].srfmajortext;
        emit('change', tempText);
      } else {
        let tempValue: string = '';
        let tempText: string = '';
        if (event && Array.isArray(event)) {
          event.forEach((select: IData) => {
            const srfkey = select[c.keyName]
              ? select[c.keyName]
              : select.srfkey;
            tempValue += `${srfkey},`;
            const srfmajortext = select[c.textName]
              ? select[c.textName]
              : select.srfmajortext;
            tempText += `${srfmajortext},`;
          });
        }
        tempValue = tempValue.substring(0, tempValue.length - 1);
        tempText = tempText.substring(0, tempText.length - 1);
        if (c.valueItem) {
          emit('change', tempValue, c.valueItem);
        }
        emit('change', tempText);
      }
    };

    const openPicker = async (e: MouseEvent) => {
      e.stopPropagation();
      if (props.disabled || props.readonly) {
        return;
      }
      let selected = '';
      if (selectedData && selectedData.length) {
        selected = JSON.stringify(selectedData);
      }
      const res = await c.openPickUpView(props.data, selected);
      if (res) {
        onViewDataChange(res);
      }
    };

    return {
      ns,
      c,
      valueText,
      context,
      params,
      editorRef,
      onClear,
      openPicker,
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
      >
        {this.readonly && this.valueText}
        {!this.readonly && (
          <van-field
            ref='editorRef'
            v-model={this.valueText}
            readonly
            placeholder={this.c.placeHolder}
            disabled={this.disabled}
            onClick={this.openPicker}
          >
            {{
              button: () => {
                if (this.$slots.append) {
                  return this.$slots.append({});
                }
                if (this.readonly) {
                  return null;
                }
                return [
                  this.c.model.pickupAppViewId ? (
                    <van-button size='small' onClick={this.openPicker}>
                      <ion-icon
                        name='search'
                        class={this.ns.e('pickup-search-icon')}
                      ></ion-icon>
                    </van-button>
                  ) : null,
                ];
              },
            }}
          </van-field>
        )}
      </div>
    );
  },
});
