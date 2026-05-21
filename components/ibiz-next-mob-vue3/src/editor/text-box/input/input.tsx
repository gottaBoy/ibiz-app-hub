/* eslint-disable no-multi-assign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { debounce } from 'lodash-es';
import { base64ToStr, IChatMessage, isEmoji } from '@ibiz-template/core';
import {
  getEditorEmits,
  getInputProps,
  useNamespace,
  useFilterAttribute,
  useUIStore,
} from '@ibiz-template/vue3-util';
import './input.scss';
import { ITextArea } from '@ibiz/model-core';
import { isIos } from '@ibiz-template/runtime';
import { TextBoxEditorController } from '../text-box-editor.controller';

/**
 * 移动端文本框
 *
 * @description 使用van-field组件，用于数据录入，通过键盘输入字符。支持编辑器类型包含：`移动端文本框`、`移动端多行文本`、`移动端密码框`
 * @primary
 * @editorparams {name:enableshowpwd,parameterType:boolean,defaultvalue:false,description:控制密码框是否可以切换密码的显示与隐藏}
 * @editorparams {name:rows,parameterType:number,defaultvalue:2,description:设置文本域默认显示的行数，输入框为文本域时生效}
 * @editorparams {"name":"triggermode","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"指定编辑器触发 `change` 值变更事件的模式，input: 输入框输入时触发事件，blur：输入框blur时触发事件"}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
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

    // 搭载平台类型
    const isIosPlatform = isIos();

    // 文本对齐
    const textAlign = ref('left');

    // 是否显示切换明文、暗文密码图标
    let enableshowpwd = false;

    // 文本域默认行数，仅在 textarea 类型下有效
    const rows = ref(2);
    if (editorModel.editorType === 'TEXTAREA_10') {
      rows.value = 10;
    }

    if (c.editorParams.enableshowpwd) {
      enableshowpwd =
        c.editorParams.enableshowpwd === 'true' ||
        c.editorParams.enableshowpwd === 'TRUE';
    }
    if (c.editorParams.rows) {
      rows.value = Number(c.editorParams.rows);
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

    const getTextAlign = () => {
      if (inputRef.value) {
        const computedStyle = getComputedStyle(inputRef.value.$el);
        return computedStyle.textAlign;
      }
      return 'left';
    };

    const currentVal = ref<string | number>('');
    let blurCacheValue: string | number | undefined;

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
          blurCacheValue = currentVal.value;
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      if (inputRef.value) {
        textAlign.value = getTextAlign();
      }
    });

    const onEmit = (
      val: string | number | undefined,
      eventName: string = 'blur',
    ) => {
      if (eventName === c.triggerMode) {
        emit('change', val);
      }
    };

    let isDebounce = false;
    let awaitSearch: () => void;
    // 防抖值变更回调
    const debounceChange = debounce(
      (val: string | number) => {
        // 拦截掉blur触发后change
        if (blurCacheValue !== val) {
          onEmit(val, 'input');
        }
        blurCacheValue = val;
        isDebounce = false;
        if (awaitSearch) {
          awaitSearch();
        }
      },
      300,
      { leading: true },
    );

    // 修复ios中文本域换行后光标错位问题，需手动添加空格
    const fixCursorPosition = () => {
      // 只有右对齐才处理
      if (
        type.value === 'textarea' &&
        isIosPlatform &&
        textAlign.value === 'right'
      ) {
        const textarea = inputRef.value.$el.querySelector('textarea');
        if (textarea) {
          let val = textarea.value;
          const selectionStart = textarea.selectionStart;
          val = `${val.slice(0, selectionStart)} ${val.slice(selectionStart)}`;
          onEmit(val);
        }
      }
    };
    // 值变更
    const handleChange = (evt: IData) => {
      let val = evt.target.value;
      // 兼容ios中文本域换行后光标错位问题
      if (
        type.value === 'textarea' &&
        textAlign.value === 'right' &&
        isIosPlatform
      ) {
        val = val.replaceAll(/(\s)*([\r\n]+)(\s)*/g, '$2').trim();
      }
      isDebounce = true;
      if (type.value === 'textarea') {
        currentVal.value = val;
      }
      debounceChange(val);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        fixCursorPosition();
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
    const onBlur = () => {
      if (blurCacheValue !== props.value) {
        onEmit(blurCacheValue);
      }
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
      onEmit('', c.triggerMode);
    };

    // 切换明文密码的显示隐藏
    const switchPwd = () => {
      showPassword.value = !showPassword.value;
    };

    let chatInstance: any;

    const onAIClick = async () => {
      const appDataEntityId = (c.model as ITextArea).appDataEntityId;
      if (!appDataEntityId || !c.deACMode) return;
      const { zIndex } = useUIStore();
      const containerZIndex = zIndex.increment();
      chatInstance = await ibiz.aiChatUtil.getAIChat();
      const { containerOptions, chatOptions } =
        await ibiz.aiChatUtil.getEditorExAIChatParams(
          c.editorParams,
          c.context,
          c.params,
          props.data,
          c.deACMode,
          { chatInstance, view: c.view, ctrl: c.ctrl },
        );
      const resourceOptions = await ibiz.aiChatUtil.getAIResourceOptions(
        c.context,
        c.params,
      );
      chatInstance.create({
        resourceOptions,
        containerOptions: {
          zIndex: containerZIndex,
          ...containerOptions,
        },
        chatOptions: {
          caption: c.deACMode.logicName,
          context: { ...c.context },
          params: { ...c.params, srfactag: c.deACMode.codeName },
          appDataEntityId,
          ...chatOptions,
          action: (action: string, message: IChatMessage) => {
            if (action === 'backfill') emit('change', message.realcontent);
          },
        },
      });
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
      enableshowpwd,
      switchPwd,
      onAIClick,
    };
  },
  render() {
    const { unitName } = this.c.parent;

    let content = null;
    if (this.readonly && this.type !== 'password') {
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
      if (this.type === 'password' && this.enableshowpwd) {
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
      if (this.c.chatCompletion) {
        slots.button = () => {
          return (
            <div
              class={this.ns.e('ai-chat')}
              title={ibiz.i18n.t('editor.textBox.openAiChat')}
              onClick={this.onAIClick}
            >
              <ion-icon src='./assets/img/chat.svg' />
            </div>
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
          inputmode='text'
          onInput={this.handleChange}
          onKeyup={this.handleKeyUp}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          class={this.ns.b('input')}
          disabled={this.disabled}
          readonly={this.readonly}
          autosize={this.type === 'textarea'}
          autocomplete='new-password'
          clearable
          onClear={this.onClear}
          {...useFilterAttribute(this.$attrs)}
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
