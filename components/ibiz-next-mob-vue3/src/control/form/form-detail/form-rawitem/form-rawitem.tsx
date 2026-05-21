import {
  IDEFormRawItem,
  IHtmlItem,
  ISysImage,
  ITextItem,
  IUnkownItem,
} from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import './form-rawitem.scss';
import { FormRawItemController } from '@ibiz-template/runtime';

export const FormRawItem = defineComponent({
  name: 'IBizFormRawItem',
  props: {
    modelData: {
      type: Object as PropType<IDEFormRawItem>,
      required: true,
    },
    controller: {
      type: FormRawItemController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('form-raw-item');
    return { ns };
  },
  render() {
    if (!this.controller.state.visible) {
      return null;
    }

    const { rawItem, sysImage } = this.modelData;
    const { contentType } = rawItem!;

    // 传入内容
    let content: string | ISysImage | null = null;
    // 类型
    let type = contentType;
    if (contentType === 'RAW' || contentType === 'HTML') {
      if (contentType === 'RAW') {
        type = 'TEXT';
        content = (rawItem as ITextItem).caption!;
      } else {
        content = (rawItem as IHtmlItem).content!;
      }
    } else if (
      ['VIDEO', 'DIVIDER', 'INFO', 'WARNING', 'ERROR'].includes(contentType!)
    ) {
      content = (rawItem as IUnkownItem).rawContent!;
    } else if (contentType === 'IMAGE' && sysImage) {
      content = sysImage;
    }
    return (
      <iBizRawItem
        class={[this.ns.b(), ...this.controller.containerClass]}
        content={content}
        type={type}
        rawItem={this.modelData}
        onClick={(event: MouseEvent) => this.controller.onClick(event)}
      ></iBizRawItem>
    );
  },
});

export default FormRawItem;
