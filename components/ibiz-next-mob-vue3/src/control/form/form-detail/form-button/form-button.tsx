import { FormButtonController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormButton } from '@ibiz/model-core';
import { defineComponent, PropType, computed } from 'vue';
import { convertBtnType } from '../../../../util';
import './form-button.scss';

export const FormButton = defineComponent({
  name: 'IBizFormButton',
  props: {
    modelData: {
      type: Object as PropType<IDEFormButton>,
      required: true,
    },
    controller: {
      type: FormButtonController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-button');
    const captionText = computed(() => {
      const { caption, captionItemName, capLanguageRes } = props.modelData;
      if (captionItemName && props.controller.data[captionItemName]) {
        return props.controller.data[captionItemName];
      }
      let text = caption;
      if (capLanguageRes) {
        text = ibiz.i18n.t(capLanguageRes.lanResTag!, caption);
      }
      return text;
    });

    return { ns, captionText };
  },
  render() {
    if (!this.controller.state.visible) {
      return null;
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          this.ns.is('loading', this.controller.state.loading),
          this.ns.is('readonly', this.controller.state.readonly),
          ...this.controller.containerClass,
        ]}
      >
        <van-button
          size='small'
          type={convertBtnType(this.modelData)}
          onClick={this.controller.onClick.bind(this.controller)}
          loading={this.controller.state.loading}
          disabled={this.controller.state.disabled}
        >
          <div class={this.ns.b('content')}>
            {this.modelData.sysImage ? (
              <iBizIcon
                class={this.ns.bm('content', 'icon')}
                icon={this.modelData.sysImage}
              />
            ) : null}
            {this.modelData.showCaption ? (
              <span class={this.ns.bm('content', 'caption')}>
                {this.captionText}
              </span>
            ) : null}
          </div>
        </van-button>
      </div>
    );
  },
});
export default FormButton;
