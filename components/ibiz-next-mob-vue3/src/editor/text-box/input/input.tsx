import { computed, defineComponent, ref, watch } from 'vue';
import { debounce } from 'lodash-es';
import { base64ToStr, isEmoji } from '@ibiz-template/core';
import {
  getEditorEmits,
  getInputProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './input.scss';
import { TextBoxEditorController } from '../text-box-editor.controller';

/**
 * 移动端文本框
 *
 * @description 使用van-field组件，用于数据录入，通过键盘输入字符。支持编辑器类型包含：`移动端文本框`、`移动端多行文本`、`移动端密码框`
 * @primary
 * @ignoreprops overflowMode
 * @ignoreemits infoTextChange
 */
export const IBizInput = defineComponent({
  name: 'IBizInput',
  props: getInputProps<TextBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('input');
    const c = props.controller;
    const editorModel = c.model;
    const inputRef = ref();

    // 是否显示密码
    const showPassword = ref(false);

    // 是否显示切换明文、暗文密码图标
    let showSwitchIcon = false;

    // 文本域默认行数，仅在 textarea 类型下有效
    const rows = ref(2);
    if (editorModel.editorType === 'TEXTAREA_10') {
      rows.value = 10;
    }

    if (c.editorParams.showswitchicon) {
      showSwitchIcon = c.editorParams.showswitchicon === 'true';
    }

    // 类型
    const type = computed(() => {
      switch (editorModel.editorType) {
        case 'MOBTEXT':
        case 'TEXTBOX':
          return 'text';
        case 'MOBPASSWORD':
        case 'PASSWORD':
          return 'password';
        case 'MOBTEXTAREA':
        case 'TEXTAREA':
          return 'textarea';
        default:
          return 'text';
      }
    });

    const currentVal = ref<string | number>('');

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = '';
          } else if (isEmoji(`${newVal}`)) {
            currentVal.value = base64ToStr(`${newVal}`);
          } else {
            currentVal.value = newVal;
          }
        }
      },
      { immediate: true },
    );

    let isDebounce = false;
    let awaitSearch: () => void;
    let blurCacheValue: string | undefined;
    // 防抖值变更回调
    const debounceChange = debounce(
      (val: string | number) => {
        // 拦截掉blur触发后change
        if (blurCacheValue !== val) {
          emit('change', val);
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

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        if (isDebounce) {
          awaitSearch = () => {
            inputRef.value.$el.dispatchEvent(e);
          };
        }
      }
    };

    /**
     * blur时马上抛值变更
     * @author lxm
     * @date 2023-03-06 06:36:23
     */
    const onBlur = (event: IData) => {
      blurCacheValue = event.target.value;
      emit('change', blurCacheValue);
      emit('blur');
    };

    // 自动聚焦
    if (props.autoFocus) {
      watch(inputRef, newVal => {
        if (newVal) {
          const inputTag = type.value === 'textarea' ? 'textarea' : 'input';
          const input = newVal.$el.getElementsByTagName(inputTag)[0];
          input.focus();
        }
      });
    }
    const onFocus = () => {
      emit('focus');
    };

    // 清除输入
    const onClear = () => {
      emit('change', '');
    };

    // 切换明文密码的显示隐藏
    const switchPwd = () => {
      showPassword.value = !showPassword.value && showSwitchIcon;
    };

    return {
      c,
      ns,
      rows,
      type,
      currentVal,
      handleChange,
      handleKeyUp,
      onBlur,
      onFocus,
      onClear,
      inputRef,
      showPassword,
      switchPwd,
    };
  },
  render() {
    const { unitName } = this.c.parent;

    let content = null;
    if (this.readonly) {
      // 只读显示
      content = `${this.currentVal || ''}`;
      // 当有值且单位存在时才显示单位
      if (content && unitName) {
        content += unitName;
      }
    } else {
      // 编辑态显示
      const slots: IData = {};
      if (unitName) {
        slots.extra = () => {
          return <i class={this.ns.e('unit')}>{unitName}</i>;
        };
      }
      if (this.type === 'password') {
        slots['right-icon'] = () => {
          return this.showPassword ? (
            <ion-icon
              name='eye-off-outline'
              onClick={this.switchPwd}
            ></ion-icon>
          ) : (
            <ion-icon name='eye-outline' onClick={this.switchPwd}></ion-icon>
          );
        };
      }

      content = (
        <van-field
          ref='inputRef'
          modelValue={this.currentVal}
          placeholder={this.controller.placeHolder}
          type={
            this.type === 'password' && this.showPassword ? 'text' : this.type
          }
          rows={this.rows}
          onInput={this.handleChange}
          onKeyup={this.handleKeyUp}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          class={this.ns.b('input')}
          disabled={this.disabled}
          autosize={this.type === 'textarea'}
          autocomplete='new-password'
          clearable
          onClear={this.onClear}
          {...this.$attrs}
        >
          {slots}
        </van-field>
      );
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('textarea', Object.is(this.type, 'textarea')),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {content}
      </div>
    );
  },
});
