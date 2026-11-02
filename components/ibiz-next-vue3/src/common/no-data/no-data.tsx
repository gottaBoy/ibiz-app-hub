import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, computed } from 'vue';
import { ILanguageRes } from '@ibiz/model-core';
import './no-data.scss';

export const IBizNoData = defineComponent({
  name: 'IBizNoData',
  props: {
    text: {
      type: String,
      default: () => ibiz.i18n.t('control.common.currentNoData', '暂无数据'),
    },
    emptyTextLanguageRes: {
      type: Object as PropType<ILanguageRes>,
      default: undefined,
    },
    hideNoDataImage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('no-data');

    const label = computed(() =>
      props.emptyTextLanguageRes
        ? ibiz.i18n.t(props.emptyTextLanguageRes.lanResTag!, props.text)
        : props.text,
    );

    return { ns, label };
  },
  render() {
    return (
      <el-empty
        class={[this.ns.b(), this.hideNoDataImage ? 'hideImage' : '']}
        description={this.label}
      >
        {this.$slots.default?.()}
      </el-empty>
    );
  },
});
