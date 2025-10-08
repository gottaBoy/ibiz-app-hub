import { defineComponent, ref, watch } from 'vue';
import {
  getDropdownProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { base64ToStr, strToBase64, isEmoji } from '@ibiz-template/core';
import './ibiz-emoji-picker.scss';
import { JSX } from 'vue/jsx-runtime';
import { DropDownListEditorController } from '../dropdown-list-editor.controller';
import { usePopstateListener } from '../../../util';

/**
 * 表情选择器（扩展）
 * @primary
 * @description  使用van-popup组件，通过弹出底部抽屉来绘制表情列表，进而支持对表情数据的搜索与选择。基于`移动端下拉列表（单选）`编辑器扩展，编辑器样式代码名称为：EMOJI_PICKER
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizEmojiPicker = defineComponent({
  name: 'IBizEmojiPicker',
  props: getDropdownProps<DropDownListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('emoji-picker');
    const c = props.controller;

    const emoji = ref<string | number | undefined>('');
    const visible = ref(false);

    // 添加表情
    const onAddEmoji = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      visible.value = true;
    };

    // 清除表情
    const onClearEmoji = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      emoji.value = '';
      visible.value = false;
      emit('change', '');
    };

    // 选择表情
    const onSelect = (val: IData) => {
      visible.value = false;
      emoji.value = val.data;
      emit('change', strToBase64(val.data));
    };

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          emoji.value =
            newVal && isEmoji(`${newVal}`)
              ? base64ToStr(newVal as string)
              : newVal;
        }
      },
      { immediate: true },
    );

    // 绘制按钮内容
    const renderButtonContent = () => {
      // 无值时显示
      let content = (
        <span class={[ns.e('button-content')]}>
          <svg
            class={ns.em('button-content', 'icon')}
            viewBox='0 0 1040 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='1490'
            width='1em'
            height='1em'
          >
            <path
              d='M512.075261 1024A511.774217 511.774217 0 1 1 730.482434 48.769072a37.630457 37.630457 0 1 1-32.061149 68.035867 436.513303 436.513303 0 1 0 250.468323 395.270322 37.630457 37.630457 0 0 1 75.260914 0 512.526826 512.526826 0 0 1-512.075261 511.924739z'
              p-id='1491'
            ></path>
            <path
              d='M333.857416 344.0929a57.348817 57.348817 0 1 0 57.348817 57.348817 57.499339 57.499339 0 0 0-57.348817-57.348817zM686.53006 344.0929a57.348817 57.348817 0 1 0 57.348817 57.348817 57.348817 57.348817 0 0 0-57.348817-57.348817zM515.236219 783.165074c-162.864619 0-262.359547-141.942084-262.359547-219.159782a30.104366 30.104366 0 0 1 60.208731 0c0 48.618551 76.314567 158.951051 202.150816 158.951051s193.571072-134.114949 193.571072-158.951051a30.104366 30.104366 0 0 1 60.208731 0c0 54.488902-90.012054 219.159782-253.779803 219.159782zM1009.549904 207.720123h-67.132735V139.985301a30.104366 30.104366 0 1 0-60.208732 0v67.734822h-67.734822a30.104366 30.104366 0 0 0-30.104366 30.104366 30.104366 30.104366 0 0 0 30.104366 30.104366h67.734822v67.734823a30.104366 30.104366 0 0 0 60.208732 0v-67.734823h67.734823a30.104366 30.104366 0 0 0 30.104365-30.104366 30.104366 30.104366 0 0 0-30.706453-30.104366z'
              p-id='1492'
            ></path>
          </svg>
          {ibiz.i18n.t('editor.emojiPicker.addEmoji')}
        </span>
      );
      // 有表情值时显示
      if (emoji.value) {
        content = (
          <span class={[ns.em('button-content', 'emoji')]}>
            <span v-html={emoji.value} />
          </span>
        );
      }
      return content;
    };

    // 绘制清空
    const renderClear = () => (
      <svg
        class={ns.em('button-content', 'icon-clear')}
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 1024 1024'
        width='1em'
        height='1em'
        onClick={onClearEmoji}
      >
        <path d='M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z'></path>
      </svg>
    );

    // 绘制触发 Popover 显示的元素
    const renderReference = () => {
      return (
        <div
          class={[ns.e('button'), ns.is('clear', !!emoji.value)]}
          onClick={onAddEmoji}
        >
          {renderButtonContent()}
          {emoji.value && renderClear()}
        </div>
      );
    };

    const renderReadonly = () => {
      return (
        <div class={[ns.e('button'), ns.is('clear', !!emoji.value)]}>
          {renderButtonContent()}
        </div>
      );
    };

    const closeDrawer = () => {
      visible.value = false;
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    return {
      ns,
      c,
      emoji,
      visible,
      onSelect,
      onAddEmoji,
      onClearEmoji,
      renderReference,
      renderReadonly,
    };
  },
  render() {
    let content: JSX.Element | JSX.Element[] = [
      this.renderReference(),
      <van-popup
        v-model:show={this.visible}
        round
        position='bottom'
        teleport='body'
        close-on-popstate={true}
      >
        <iBizEmojiSelect
          continuousList={true}
          dark={true}
          showSearch={false}
          onSelect={this.onSelect}
        />
      </van-popup>,
    ];

    if (this.disabled || this.readonly) {
      content = this.renderReadonly();
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('active', this.visible),
        ]}
      >
        {content}
      </div>
    );
  },
});
