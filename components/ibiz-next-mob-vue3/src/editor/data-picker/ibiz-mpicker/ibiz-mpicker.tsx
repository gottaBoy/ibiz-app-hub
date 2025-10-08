import { ref, watch, Ref, defineComponent, computed } from 'vue';
import {
  getDataPickerProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { clone } from 'lodash-es';
import './ibiz-mpicker.scss';
import { PickerEditorController } from '../picker-editor.controller';
import { IBizDataMPicker } from '../../common/data-mpicker/ibiz-data-mpicker';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';

/**
 * 移动端多数据选择
 * @primary
 * @description  使用van-field组件和van-popup组件，用于在弹出列表中选择多项数据的场景。支持编辑器类型包含：`移动端多数据选择`
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizMPicker = defineComponent({
  name: 'IBizMPicker',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('mpicker');

    const c: PickerEditorController = props.controller!;

    // 当前表单项绑定值key的集合
    const curValue: Ref<Array<string>> = ref([]);

    // 实体数据集
    const items: Ref<IData[]> = ref([]);

    // 选中项key-value键值对
    const selectItems: Ref<IData[]> = ref([]);

    // 是否显示picker
    const showPicker = ref(false);

    // 格式化
    const formatter = (item: IData) => {
      return {
        srfkey: item[c.keyName] || item.srfkey,
        value: item[c.keyName] || item.srfkey,
        srfmajortext: item[c.textName] || item.srfmajortext,
        text: item[c.textName] || item.srfmajortext,
        [c.keyName]: item[c.keyName] || item.srfkey,
        [c.textName]: item[c.textName] || item.srfmajortext,
        ...item,
      };
    };

    const resetCurValue = () => {
      curValue.value = [];
      selectItems.value = [];
      if (props.value) {
        if (c.model.valueType === 'OBJECTS') {
          (props.value as Array<IData>).forEach((item: IData) => {
            const _item = clone(item);
            Object.assign(_item, {
              [c.keyName]: item[c.objectIdField as string],
              [c.textName]: item[c.objectNameField as string],
            });
            if (c.objectValueField) {
              Object.assign(_item, {
                ...item[c.objectValueField],
              });
              delete _item[c.objectValueField];
            }
            if (_item[c.keyName]) {
              selectItems.value.push(formatter(_item));
            }
          });
        } else if (c.objectIdField && c.model.valueSeparator) {
          const values = (props.value as string).split(c.model.valueSeparator);
          values.forEach((value: string) => {
            selectItems.value.push(
              formatter({
                [c.keyName]: value,
              }),
            );
          });
        } else {
          try {
            selectItems.value = JSON.parse(props.value as string).map(
              formatter,
            );
          } catch (error) {
            ibiz.log.error(
              ibiz.i18n.t('editor.mpicker.simpleErr', { value: props.value }),
            );
          }
        }
        selectItems.value.forEach((item: IData) => {
          curValue.value.push(item[c.keyName]);
          // 选项没有的时候补充选项
          const index = items.value.findIndex(
            i =>
              Object.is(i[c.keyName], item[c.keyName]) ||
              Object.is(i.srfkey, item.srfkey), // 兼容写法，适配移动端老逻辑
          );
          if (index < 0) {
            items.value.push(formatter(item));
          }
        });
      }
    };

    // 监听传入值
    watch(
      () => props.value,
      () => {
        resetCurValue();
      },
      { immediate: true, deep: true },
    );

    // 处理视图关闭，往外抛值
    const handleOpenViewClose = async (result: IData[]) => {
      // 抛出值集合
      const selects: IData[] = [];
      if (result && Array.isArray(result)) {
        const calcPromises = result.map(async select => {
          const item = formatter(select);
          // 选择树视图特殊处理
          if (select.srfnodeid) {
            Object.assign(item, select._deData);
          }
          const dataItems = await c.calcFillDataItems(item);
          const res = {};
          dataItems.forEach(dataItem => {
            Object.assign(res, { [dataItem.id]: dataItem.value });
          });
          return res;
        });
        const dataItemsList = await Promise.all(calcPromises);
        result.forEach((select: IData, _index: number) => {
          Object.assign(select, {
            ...formatter(select),
            [c.keyName]: select[c.keyName] ? select[c.keyName] : select.srfkey,
            [c.textName]: select[c.textName]
              ? select[c.textName]
              : select.srfmajortext,
          });
          const data = dataItemsList[_index];
          if (c.model.valueType === 'OBJECTS') {
            selects.push({ ...c.handleObjectParams(select), ...data });
          } else if (c.objectIdField && c.model.valueSeparator) {
            selects.push(select[c.keyName]);
          } else {
            selects.push({
              [c.keyName]: select[c.keyName],
              [c.textName]: select[c.textName],
              ...data,
            });
          }
          const index = items.value.findIndex(item =>
            Object.is(item[c.keyName], select[c.keyName]),
          );
          if (index < 0) {
            items.value.push(select);
          }
        });
      }
      let value: string | Array<IData> | null = null;
      if (selects.length > 0) {
        if (c.model.valueType === 'OBJECTS') {
          value = selects;
        } else {
          value =
            c.objectIdField && c.model.valueSeparator
              ? selects.join(c.model.valueSeparator)
              : JSON.stringify(selects);
        }
      }
      emit('change', value);
    };

    // 打开数据选择视图
    const openPickUpView = async (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (props.disabled || props.readonly) {
        return;
      }
      let selectedData;
      if (selectItems.value.length) {
        selectedData = JSON.stringify(selectItems.value);
      }
      const res = await c.openPickUpView(props.data!, selectedData);
      if (res) {
        handleOpenViewClose(res);
      }
    };

    // 下拉选中回调
    const onSelect = async (selects: string[]) => {
      const val: Array<IData> = [];
      let value: string | Array<IData> | null = null;
      const selections = selects.map((select: string) => {
        let index = items.value.findIndex(item =>
          Object.is(item[c.keyName], select),
        );
        let item: IData = {};
        if (index >= 0) {
          item = items.value[index];
        } else {
          index = selectItems.value.findIndex((selectItem: IData) =>
            Object.is(selectItem[c.keyName], select),
          );
          if (index >= 0) {
            item = selectItems.value[index];
          }
        }
        return item;
      });
      const calcPromises = selections.map(async select => {
        const dataItems = await c.calcFillDataItems(select);
        const res = {};
        dataItems.forEach(dataItem => {
          Object.assign(res, { [dataItem.id]: dataItem.value });
        });
        return res;
      });
      const dataItemsList = await Promise.all(calcPromises);
      selections.forEach((item: IData, index: number) => {
        const data = dataItemsList[index];
        if (c.model.valueType === 'OBJECTS') {
          val.push({ ...c.handleObjectParams(item), ...data });
        } else if (c.objectIdField && c.model.valueSeparator) {
          val.push(item[c.keyName]);
        } else {
          val.push({
            [c.keyName]: item[c.keyName],
            [c.textName]: item[c.textName],
            ...data,
          });
        }
      });
      if (val.length > 0) {
        if (c.model.valueType === 'OBJECTS') {
          value = val;
        } else {
          value =
            c.objectIdField && c.model.valueSeparator
              ? val.join(c.model.valueSeparator)
              : JSON.stringify(val);
        }
      }
      emit('change', value);
    };

    // 搜索
    const onSearch = async (query: string = '') => {
      if (c.model.appDataEntityId) {
        const trimQuery = query.trim();
        const res = await c.getServiceData(trimQuery, props.data!);
        if (res) {
          items.value = res.data.map(item => formatter(item));
        }
      }
    };

    // 移除标签回调
    const onRemove = (tag: string) => {
      if (props.readonly || props.disabled) {
        return;
      }
      const index = selectItems.value.findIndex((item: IData) =>
        Object.is(item[c.keyName], tag),
      );
      if (index >= 0) {
        selectItems.value.splice(index, 1);
        const val: Array<IData> = [];
        let value: string | Array<IData> | null = null;
        selectItems.value.forEach((select: IData) => {
          if (c.model.valueType === 'OBJECTS') {
            val.push(c.handleObjectParams(select));
          } else if (c.objectIdField && c.model.valueSeparator) {
            val.push(select[c.keyName]);
          } else {
            val.push({
              [c.keyName]: select[c.keyName],
              [c.textName]: select[c.textName],
            });
          }
        });
        if (val.length > 0) {
          if (c.model.valueType === 'OBJECTS') {
            value = val;
          } else {
            value =
              c.objectIdField && c.model.valueSeparator
                ? val.join(c.model.valueSeparator)
                : JSON.stringify(val);
          }
        }
        emit('change', value);
      }
    };

    // 信息展示，只显示名称。
    const valueText = computed(() => {
      return selectItems.value
        .map(item => {
          return item.srfmajortext;
        })
        .join(',');
    });

    // 聚焦
    const onFocus = () => {
      emit('focus');
    };

    // 失焦
    const onBlur = () => {
      emit('blur');
    };

    const openPicker = async () => {
      if (props.disabled || props.readonly) {
        return;
      }
      showPicker.value = true;
      onSearch();
    };

    return {
      ns,
      c,
      curValue,
      items,
      valueText,
      selectItems,
      showPicker,
      onSearch,
      onRemove,
      onSelect,
      openPickUpView,
      openPicker,
      onFocus,
      onBlur,
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
        onClick={() => {
          this.openPicker();
        }}
        ref='editorRef'
      >
        {this.readonly && this.valueText}
        {!this.readonly && (
          <van-field
            ref='editorRef'
            v-model={this.valueText}
            clearable
            placeholder={this.c.placeHolder}
            disabled={this.disabled}
          >
            {{
              input: () => {
                return this.selectItems.map((item: IData) => {
                  return (
                    <div class={this.ns.b('select-item')}>
                      <div class={this.ns.be('select-item', 'text')}>
                        {item.srfmajortext}
                      </div>
                      <div class={this.ns.be('select-item', 'close')}>
                        <van-icon
                          name='cross'
                          onClick={(e: Event) => {
                            e.stopPropagation();
                            this.onRemove(item[this.c.keyName]);
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              },
              'right-icon': () => {
                if (this.$slots.append) {
                  return this.$slots.append({});
                }
                if (this.readonly) {
                  return null;
                }
                return [
                  this.c.model.pickupAppViewId && (
                    <van-button
                      size='small'
                      onClick={(event: MouseEvent) =>
                        this.openPickUpView(event)
                      }
                    >
                      <ion-icon
                        name='search'
                        class={this.ns.e('pickup-search-icon')}
                      ></ion-icon>
                    </van-button>
                  ),
                  this.c.model.appDEDataSetId && (
                    <IBizCommonRightIcon></IBizCommonRightIcon>
                  ),
                ];
              },
            }}
          </van-field>
        )}
        <IBizDataMPicker
          items={this.items}
          onChange={this.onSelect}
          v-model:showPicker={this.showPicker}
          value={this.curValue}
        ></IBizDataMPicker>
      </div>
    );
  },
});
