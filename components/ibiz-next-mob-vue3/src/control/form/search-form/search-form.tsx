import { IControlProvider, SearchFormController } from '@ibiz-template/runtime';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IDESearchForm } from '@ibiz/model-core';
import { defineComponent, PropType, reactive } from 'vue';
import './search-form.scss';

export const SearchFormControl = defineComponent({
  name: 'IBizSearchFormControl',
  props: {
    /**
     * @description 搜索表单模型数据
     */
    modelData: {
      type: Object as PropType<IDESearchForm>,
      required: true,
    },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
  },
  setup() {
    const c = useControlController(
      (...args) => new SearchFormController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    c.evt.on('onCreated', () => {
      const keys = Object.keys(c.details);
      keys.forEach(key => {
        const detail = c.details[key];
        detail.state = reactive(detail.state);
      });
    });

    return { c, ns };
  },

  render() {
    const { state } = this.c;
    if (!state.isCreated) {
      return;
    }
    return (
      <iBizFormControl
        class={this.ns.b()}
        controller={this.c}
        nativeOnkeyup={(e: KeyboardEvent) => this.c.onKeyUp(e)}
      >
        {{
          ...this.$slots,
          searchFooter: () => {
            return (
              <div class={this.ns.b('buttons')}>
                <van-button
                  class={this.ns.be('buttons', 'search')}
                  onClick={() => this.c.onSearchButtonClick()}
                >
                  {ibiz.i18n.t('control.form.searchForm.search')}
                </van-button>
                <van-button
                  class={this.ns.be('buttons', 'reset')}
                  onClick={() => this.c.reset()}
                >
                  {ibiz.i18n.t('control.form.searchForm.reset')}
                </van-button>
              </div>
            );
          },
        }}
      </iBizFormControl>
    );
  },
});
