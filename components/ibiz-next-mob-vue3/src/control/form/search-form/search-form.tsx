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

    // 搜索按钮
    const renderSearch = () => {
      return (
        <van-button
          class={ns.e('search')}
          type='primary'
          size='small'
          onClick={() => c.onSearchButtonClick()}
        >
          {ibiz.i18n.t('control.form.searchForm.search')}
        </van-button>
      );
    };

    // 重置按钮
    const renderReset = () => {
      return (
        <van-button
          class={ns.e('reset')}
          onClick={() => c.reset()}
          size='small'
        >
          {ibiz.i18n.t('control.form.searchForm.reset')}
        </van-button>
      );
    };

    // 更多按钮
    const renderAllBtns = () => {
      return [renderSearch(), renderReset()];
    };

    return { c, ns, renderSearch, renderAllBtns };
  },

  render() {
    const { state } = this.c;
    if (!state.isCreated) {
      return;
    }
    return (
      <iBizFormControl
        class={[
          this.ns.b(),
          this.ns.e(this.c.model.searchButtonPos?.toLowerCase()),
        ]}
        controller={this.c}
        nativeOnkeyup={(e: KeyboardEvent) => this.c.onKeyUp(e)}
      >
        {{
          ...this.$slots,
          searchFooter: () => {
            if (this.c.model.searchButtonStyle === 'NONE') {
              return null;
            }
            return (
              <div class={this.ns.e('buttons')}>
                {this.c.model.searchButtonStyle === 'SEARCHONLY'
                  ? this.renderSearch()
                  : this.renderAllBtns()}
              </div>
            );
          },
        }}
      </iBizFormControl>
    );
  },
});
