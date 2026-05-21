import { ref, watch, Ref, defineComponent } from 'vue';
import {
  getDataPickerProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-picker.scss';
import { debounce, isEmpty } from 'lodash-es';
import { PickerEditorController } from '../picker-editor.controller';
import { usePopstateListener } from '../../../util';

/**
 * 移动端数据选择
 * @primary
 * @description  使用van-field组件和van-popup组件，用于在弹出列表中选择单项数据的场景。支持编辑器类型包含：`移动端数据选择`
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizPicker = defineComponent({
  name: 'IBizPicker',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('picker');

    const c: PickerEditorController = props.controller!;

    // 当前值
    const curValue: Ref<Array<string> | string | null> = ref('');

    // 实体数据集
    const items: Ref<IData[]> = ref([]);

    // 是否显示picker
    const showPicker = ref(false);

    // 是否显示所有数据
    const isShowAll = ref(true);

    // 自动选择Ref
    const pickerAutoCompleteRef = ref();

    // 加载中
    const loading: Ref<boolean> = ref(false);

    // 搜索过滤值
    const searchValue: Ref<string> = ref('');

    watch(
      () => props.value,
      newVal => {
        if (newVal || newVal === null) {
          curValue.value = newVal as string;
          if (newVal === null) {
            curValue.value = '';
          }
          const value = props.data[c.valueItem];
          const index = items.value.findIndex((item: IData) =>
            Object.is(item[c.keyName], value),
          );
          if (index !== -1) {
            return;
          }
          // items里匹配不到当前值项值时，生成自身的选项
          items.value = [];
          if (!isEmpty(newVal) && !isEmpty(value)) {
            items.value.push({ [c.textName]: newVal, [c.keyName]: value });
          }
        }
      },
      { immediate: true },
    );

    // 处理选中数据后的处理逻辑
    const handleDataSelect = async (data: IData) => {
      const targetData = data.getOrigin?.() || data._deData || data;
      // 处理回填数据
      const dataItems = await c.calcFillDataItems(targetData);
      if (dataItems.length) {
        dataItems.forEach(dataItem => {
          emit('change', dataItem.value, dataItem.id);
        });
      }

      Object.assign(targetData, {
        [c.keyName]: targetData[c.keyName]
          ? targetData[c.keyName]
          : targetData.srfkey,
        [c.textName]: targetData[c.textName]
          ? targetData[c.textName]
          : targetData.srfmajortext,
      });
      // 处理值项和本身的值
      if (c.valueItem) {
        emit('change', targetData[c.keyName], c.valueItem);
      }
      emit('change', targetData[c.textName]);
    };

    /**
     * @description 计算选中项数据
     * @returns {*}  {IData[]}
     */
    const calcSelectItem = (): IData[] => {
      const selectItems: IData[] = [];
      if (curValue.value) {
        const selectItem = {
          srfkey: props.data[c.valueItem],
          srfmajortext: curValue.value,
          ...(c.model.valueType === 'OBJECT' &&
          props.value &&
          c.objectValueField
            ? (props.value as IData)[c.objectValueField as string]
            : {}),
        };
        if (c.deACMode && c.dataItems.length)
          c.dataItems.forEach((item: IData) =>
            Object.assign(selectItem, {
              [item.appDEFieldId]: props.data[item.id],
            }),
          );
        selectItems.push(selectItem);
      }
      return selectItems;
    };

    // 打开数据选择视图
    const openPickUpView = async (e: MouseEvent) => {
      e.stopPropagation();
      if (props.disabled || props.readonly) {
        return;
      }
      const res = await c.openPickUpView(
        props.data,
        JSON.stringify(calcSelectItem()),
      );

      // 单选时可通过选择视图清空选中数据
      if (res && !res[0]) {
        // eslint-disable-next-line no-use-before-define
        onClear();
      }

      if (res && res[0]) {
        await handleDataSelect(res[0]);
      }
    };

    // 打开数据链接视图
    const openLinkView = async (e: MouseEvent) => {
      e.stopPropagation();
      if (props.disabled || props.readonly) {
        return;
      }
      const res = await c.openLinkView(props.data);
      if (res && res[0]) {
        await handleDataSelect(res[0]);
      }
    };

    // 往外抛值
    const onACSelect = async (item: IData) => {
      await handleDataSelect(item);
      isShowAll.value = true;
    };

    // 格式化data
    const handleData = (data: IData) => {
      return data.map((item: IData) => {
        return { text: item[c.textName], value: item[c.keyName], ...item };
      });
    };

    // 搜索
    const onSearch = async (query?: string, cb?: (_items: IData[]) => void) => {
      if (c.model.appDataEntityId) {
        const trimQuery = query || ''.trim();
        loading.value = true;
        let res;
        try {
          res = await c.getServiceData(trimQuery, props.data);
          if (res) {
            items.value = handleData(res.data as IData[]);
            if (cb && cb instanceof Function) {
              cb(items.value);
            }
          }
        } finally {
          loading.value = false;
        }
      }
    };

    let isDebounce = false;
    let awaitSearch: () => void;
    let blurCacheValue: string | undefined;
    // 防抖值变更回调
    const debounceChange = debounce(
      (val: string) => {
        // 拦截掉blur触发后change
        if (blurCacheValue !== val) {
          onSearch(val!);
        }
        blurCacheValue = undefined;
        isDebounce = false;
        if (awaitSearch) {
          awaitSearch();
        }
      },
      300,
      { leading: true },
    );
    // 值变更
    const handleChange = (evt: IData) => {
      const val = evt.target.value;
      isDebounce = true;
      debounceChange(val);
    };

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

    const closeCircle = (c.linkView ? 1 : 0) + (c.pickupView ? 1 : 0);

    // 自动聚焦
    const editorRef = ref();
    if (props.autoFocus) {
      watch(editorRef, newVal => {
        if (newVal) {
          newVal.focus();
        }
      });
    }
    const onFocus = () => {
      emit('focus');
    };
    const onBlur = () => {
      emit('blur');
    };

    // 确定
    const onConfirm = (item: IData) => {
      showPicker.value = false;
      handleDataSelect(item);
    };

    const openPicker = async () => {
      if (props.disabled || props.readonly) {
        return;
      }
      showPicker.value = true;
      onSearch();
    };

    // 点击关闭
    const onClose = () => {
      showPicker.value = false;
    };

    // 点击清除按钮
    const onClickClear = () => {
      showPicker.value = false;
      onClear();
    };

    // 绘制弹出抽屉顶部
    const renderPopHeader = () => {
      return (
        <div class={ns.be('pop', 'header')}>
          <div class={ns.bem('pop', 'header', 'left')}>
            <van-icon name='cross' onClick={onClose} />
            <span class={ns.bem('pop', 'header', 'caption')}>
              {ibiz.i18n.t('editor.dropdown.pleaseSelect')}
            </span>
          </div>
          <div class={ns.bem('pop', 'header', 'right')} onClick={onClickClear}>
            {ibiz.i18n.t('editor.dropdown.clear')}
          </div>
        </div>
      );
    };

    // 绘制搜索框
    const renderSearchInput = () => {
      return (
        <div class={ns.be('pop', 'search')}>
          <van-field
            v-model={searchValue.value}
            placeholder={ibiz.i18n.t('editor.dropdown.searchPlaceholder')}
          >
            {{
              'left-icon': () => {
                return <ion-icon name='search-outline'></ion-icon>;
              },
            }}
          </van-field>
        </div>
      );
    };

    const renderNoData = () => {
      return <iBizNoData></iBizNoData>;
    };

    // 绘制选项列表
    const renderSelectList = () => {
      return (
        <div class={ns.be('pop', 'list')}>
          {items.value.length !== 0 &&
            items.value.map((item: IData) => {
              if (item[c.textName]?.indexOf(searchValue.value) < 0) return;

              let selected =
                (item[c.textName] || item.srfmajortext) === curValue.value;
              if (c.valueItem) {
                selected =
                  (item[c.keyName] || item.srfkey) === props.data[c.valueItem];
              }
              return (
                <div
                  class={ns.bem('pop', 'list', 'item')}
                  onClick={() => onConfirm(item)}
                >
                  <div
                    class={[
                      ns.bem('pop', 'list', 'item-text'),
                      ns.is('bkcolor', !!item?.bkcolor),
                    ]}
                    style={
                      item?.color || item?.bkcolor
                        ? ns.cssVarBlock({
                            'pop-color-item': `${item.color || ''}`,
                            'pop-color-item-bg': `${item.bkcolor || ''}`,
                          })
                        : ''
                    }
                  >
                    {item[c.textName]}
                  </div>
                  {selected && (
                    <van-icon
                      class={ns.bem('pop', 'list', 'selected')}
                      name='success'
                    />
                  )}
                </div>
              );
            })}
          {items.value.length === 0 && renderNoData()}
        </div>
      );
    };

    // 绘制弹出抽屉内容
    const renderPopContent = () => {
      return (
        <div class={ns.be('pop', 'content')}>
          {renderSearchInput()}
          {renderSelectList()}
        </div>
      );
    };

    const closeDrawer = () => {
      showPicker.value = false;
    };

    const onPopClose = () => {
      searchValue.value = '';
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    return {
      ns,
      c,
      curValue,
      items,
      pickerAutoCompleteRef,
      loading,
      openPickUpView,
      openLinkView,
      onACSelect,
      onSearch,
      editorRef,
      onFocus,
      onBlur,
      closeCircle,
      isDebounce,
      handleChange,
      onConfirm,
      showPicker,
      openPicker,
      renderPopHeader,
      renderPopContent,
      onPopClose,
    };
  },
  render() {
    if (this.readonly) {
      return (
        <div class={[this.ns.b(), this.ns.m('readonly')]}>
          {this.value || ''}
        </div>
      );
    }
    return (
      <div class={[this.ns.b(), this.disabled ? this.ns.m('disabled') : '']}>
        <van-field
          ref='editorRef'
          v-model={this.curValue}
          readonly
          placeholder={this.c.placeHolder}
          disabled={this.disabled}
          onClick={() => {
            this.openPicker();
          }}
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
                  <van-button size='small' onClick={this.openPickUpView}>
                    <ion-icon
                      name='search'
                      class={this.ns.e('pickup-search-icon')}
                    ></ion-icon>
                  </van-button>
                ) : null,
                this.c.model.linkAppViewId ? (
                  <van-button size='small' onClick={this.openLinkView}>
                    <ion-icon
                      name='arrow-redo-sharp'
                      class={this.ns.e('linkview-icon')}
                    ></ion-icon>
                  </van-button>
                ) : null,
              ];
            },
          }}
        </van-field>
        <van-popup
          v-model:show={this.showPicker}
          round
          close-on-popstate={true}
          position='bottom'
          teleport='body'
          style={{ height: '50%' }}
          onClose={this.onPopClose}
        >
          <div class={this.ns.b('pop')}>
            {this.renderPopHeader()}
            {this.renderPopContent()}
          </div>
        </van-popup>
      </div>
    );
  },
});
