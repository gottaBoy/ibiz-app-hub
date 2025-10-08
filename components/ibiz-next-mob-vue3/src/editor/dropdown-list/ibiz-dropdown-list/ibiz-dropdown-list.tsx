import { ref, Ref, defineComponent, computed } from 'vue';
import {
  getDropdownProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-dropdown-list.scss';
import { DropDownListEditorController } from '../dropdown-list-editor.controller';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';
import { IBizDataMPicker } from '../../common/data-mpicker/ibiz-data-mpicker';
import { usePopstateListener } from '../../../util';

/**
 * 移动端下拉列表（多选）
 * @primary
 * @description  使用van-field组件和van-popup组件，用于在弹出的选择列表中选择多条数据的场景。支持编辑器类型包含：`移动端下拉列表（多选）`
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizDropdownList = defineComponent({
  name: 'IBizDropdownList',
  props: getDropdownProps<DropDownListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('dropdown-list');
    const c = props.controller;

    // 代码表数据
    const items: Ref<readonly IData[]> = ref([]);
    // 模态打开状态
    const showPicker = ref(false);
    // 当前选中数据
    const selectItems: Ref<IData[]> = computed(() => {
      if (!props.value) {
        return [];
      }
      return items.value.filter(
        item =>
          ((props.value as string).split(',') || []).findIndex(
            // 不用判断类型兼容类型不匹配
            // eslint-disable-next-line eqeqeq
            (value: string) => item.value == value,
          ) !== -1,
      );
    });
    // 当前选中数据值
    const selectKeys: Ref<string[]> = computed(() => {
      if (!props.value) {
        return [];
      }
      return items.value
        .filter(
          item =>
            ((props.value as string).split(',') || []).findIndex(
              // eslint-disable-next-line eqeqeq
              (value: string) => item.value == value,
            ) !== -1,
        )
        .map(item => item.value);
    });

    // 代码表加载
    c.loadCodeList(props.data!).then((codeList: readonly IData[]) => {
      items.value = codeList;
    });

    const onFocus = () => {
      emit('focus');
    };
    const onBlur = () => {
      setTimeout(() => {
        emit('blur');
      }, 100);
    };

    // 确定
    const onConfirm = (selects: string[]) => {
      showPicker.value = false;
      const valArr: Array<IData> = [];
      selects.forEach((select: string) => {
        const findItem = items.value.find(item =>
          Object.is(item.value, select),
        );
        if (findItem) {
          valArr.push(findItem);
        }
      });
      const value =
        valArr.length > 0 ? valArr.map(item => item.value).join(',') : '';
      emit('change', value);
    };

    const onRemove = (item: IData) => {
      if (props.readonly || props.disabled) {
        return;
      }
      const curValue = selectKeys.value.filter(value => value !== item.value);
      onConfirm(curValue);
    };

    const valueText = computed(() => {
      return selectItems.value.map(item => item.text).join(',');
    });

    const closeDrawer = () => {
      showPicker.value = false;
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    return {
      ns,
      c,
      items,
      showPicker,
      valueText,
      selectItems,
      selectKeys,
      onBlur,
      onFocus,
      onRemove,
      onConfirm,
    };
  },

  render() {
    // 编辑态内容
    const editContent = [
      <van-field
        ref='editorRef'
        clearable
        readonly
        class={[this.ns.e('select')]}
        placeholder={this.c.placeHolder}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onClick={() => {
          if (!this.disabled) {
            this.showPicker = true;
          }
        }}
      >
        {{
          'right-icon': <IBizCommonRightIcon></IBizCommonRightIcon>,
          input: () => {
            return this.selectItems.map((item: IData) => {
              return (
                <div class={this.ns.b('select-item')}>
                  <div class={this.ns.be('select-item', 'text')}>
                    {item.text}
                  </div>
                  <div class={this.ns.be('select-item', 'close')}>
                    <van-icon
                      name='cross'
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        this.onRemove(item);
                      }}
                    />
                  </div>
                </div>
              );
            });
          },
        }}
      </van-field>,
      <IBizDataMPicker
        items={this.items as IData[]}
        onChange={this.onConfirm}
        v-model:showPicker={this.showPicker}
        value={this.selectKeys}
      ></IBizDataMPicker>,
    ];
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {this.readonly ? this.valueText : editContent}
      </div>
    );
  },
});
