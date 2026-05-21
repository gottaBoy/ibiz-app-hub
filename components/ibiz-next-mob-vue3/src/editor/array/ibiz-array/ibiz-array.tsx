import { computed, defineComponent, Ref, ref, watch } from 'vue';
import {
  getArrayProps,
  getEditorEmits,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import { toNumber } from 'lodash-es';
import { ArrayEditorController } from '../array-editor.controller';
import './ibiz-array.scss';

/**
 * 数组数据编辑
 *
 * @description 使用van-field组件封装，提供数组数据的输入能力，其呈现样式为多个携带自增自减按钮的输入框。支持编辑器类型包含：`数组编辑器`
 * @primary
 * @editorparams {"name":"limit","parameterType":"number","defaultvalue":0,"description":"默认不限制输入项数量，若设置了非零的限制数，当输入项数量超出该限制时，自增按钮将隐藏"}
 * @editorparams {"name":"maxlength","parameterType":"number","description":"设置单个输入框可输入内容的最大长度"}
 * @editorparams {"name":"showwordlimit","parameterType":"boolean","defaultvalue":false,"description":"是否显示字数限制统计，仅在设置了maxlength属性时生效"}
 * @editorparams {"name":"triggermode","parameterType":"'blur' |' input'","defaultvalue":"'blur'","description":"指定编辑器触发 `change` 值变更事件的模式，input: 输入框输入时触发事件，blur：输入框blur时触发事件"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizArray = defineComponent({
  name: 'IBizArray',
  props: getArrayProps<ArrayEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('array');

    const c = props.controller!;

    const editorModel = c.model;

    // 输入框大小
    let size = 'default';
    // 数组大小限制
    let limit = 0;
    // 输入内容最长长度
    let maxLength;
    // 是否显示输入内容长度
    let showWordLimit = false;
    // 输入内容项集合
    const items: Ref<IData[]> = ref([]);

    if (editorModel.editorParams) {
      if (editorModel.editorParams.size) {
        size = editorModel.editorParams.size;
      }
      if (editorModel.editorParams.limit) {
        limit = toNumber(editorModel.editorParams.limit);
      }
      if (editorModel.editorParams.maxLength) {
        maxLength = toNumber(editorModel.editorParams.maxLength);
      }
      if (editorModel.editorParams.maxlength) {
        maxLength = toNumber(editorModel.editorParams.maxlength);
      }
      if (editorModel.editorParams.showWordLimit) {
        showWordLimit = c.toBoolean(editorModel.editorParams.showWordLimit);
      }
      if (editorModel.editorParams.showwordlimit) {
        showWordLimit = c.toBoolean(editorModel.editorParams.showwordlimit);
      }
    }

    // 输入框类型
    const dataType = editorModel.dataType;
    const type =
      Object.is(dataType, 'NUMBER') || Object.is(dataType, 'INTEGER')
        ? 'number'
        : 'text';

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

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          if (items.value.length === 0) {
            const tempItems = newVal.map((value: string | number) => {
              return { value, key: createUUID() };
            });
            items.value = tempItems;
          }
        }
      },
      { immediate: true },
    );

    // 抛值
    const onEmit = (eventName: string = 'blur'): void => {
      const result = items.value.map(item => item.value);
      if (eventName === c.triggerMode) {
        emit('change', result);
      }
    };

    // 新增项
    const addItem = (index?: number): void => {
      if (props.disabled || props.readonly) {
        return;
      }
      const tempLink = {
        key: createUUID(),
        value: '',
      };
      if (index) {
        items.value.splice(index, 0, tempLink);
      } else {
        items.value.push(tempLink);
      }
      onEmit();
    };

    // 删除项
    const removeItem = (index: number): void => {
      items.value.splice(index, 1);
      onEmit();
    };

    // 处理值改变
    const handleInput = (): void => {
      onEmit('input');
    };

    const onBlur = (e: IData): void => {
      onEmit('blur');
      emit('blur', e);
    };

    const onFocus = (e: IData): void => {
      emit('focus', e);
    };

    return {
      ns,
      c,
      type,
      size,
      limit,
      maxLength,
      showWordLimit,
      items,
      addItem,
      removeItem,
      handleInput,
      onBlur,
      onFocus,
      showFormDefaultContent,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
      >
        {this.items.length === 0 ? (
          <ion-icon
            class={this.ns.b('add-icon')}
            name='add-outline'
            onClick={this.addItem}
          />
        ) : (
          this.items.map((item: IData, index: number) => {
            return (
              <div class={this.ns.b('item')} key={item.key}>
                <van-field
                  type={this.type}
                  size={this.size}
                  v-model={item.value}
                  placeholder={this.c.placeHolder}
                  maxlength={this.maxLength}
                  show-word-limit={this.showWordLimit}
                  disabled={this.disabled}
                  readonly={this.readonly}
                  onBlur={this.onBlur}
                  onFocus={this.onFocus}
                  onInput={(): void => this.handleInput()}
                  {...useFilterAttribute(this.$attrs)}
                >
                  {{
                    extra: () => {
                      if (!(this.disabled || this.readonly)) {
                        return (
                          <div class={this.ns.b('icons')}>
                            {(!this.limit ||
                              this.items.length < this.limit) && (
                              <ion-icon
                                class={this.ns.b('add-icon')}
                                name='add'
                                onClick={(): void => this.addItem(index + 1)}
                              />
                            )}
                            <ion-icon
                              class={this.ns.b('remove-icon')}
                              name='remove'
                              onClick={(): void => this.removeItem(index)}
                            />
                          </div>
                        );
                      }
                    },
                  }}
                </van-field>
              </div>
            );
          })
        )}
      </div>
    );
  },
});
