import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getRawProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { QrcodeEditorController } from '../qrcode-editor.controller';
import './ibiz-qrcode.scss';

/**
 * 移动端二维码阅读器
 * @primary
 * @description 支持将指定的值转换为二维码图片。支持编辑器类型包含：`移动端二维码阅读器`
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter | change | focus | blur
 */
export const IBizQrcode = defineComponent({
  name: 'IBizQrcode',
  props: getRawProps<QrcodeEditorController>(),
  emits: getEditorEmits(),
  setup(props, { attrs }) {
    const ns = useNamespace('qrcode');

    // 转换的二维码图片路径
    const dataUrl = ref('');

    watch(
      () => props.value,
      async (newVal, oldVal) => {
        let text = '';
        if (newVal !== oldVal) {
          if (isNil(newVal)) {
            text = '';
          } else {
            text = `${newVal}`;
          }
        }
        if (text) {
          const qrCode = ibiz.qrcodeUtil.createQrcode(text, {
            margin: 8,
            ...attrs,
          });
          const element = await qrCode._getElement();
          dataUrl.value = element.toDataURL();
        }
      },
      {
        immediate: true,
      },
    );
    return {
      ns,
      dataUrl,
    };
  },
  render() {
    let content = (
      <van-icon
        class={this.ns.e('no-img')}
        size={this.$attrs.width || 100}
        name='photo-fail'
      />
    );
    if (this.dataUrl) {
      content = <img class={[this.ns.e('img')]} src={this.dataUrl} alt='' />;
    }
    return <div class={[this.ns.b()]}>{content}</div>;
  },
});
