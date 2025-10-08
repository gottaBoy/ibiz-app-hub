import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, ref } from 'vue';
import { ISearchBar } from '@ibiz/model-core';
import { debounce } from 'lodash-es';
import {
  IControlProvider,
  IOverlayPopoverContainer,
  SearchBarController,
} from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import './search-bar.scss';

export const SearchBarControl = defineComponent({
  name: 'IBizSearchBarControl',
  props: {
    /**
     * @description 搜索栏模型数据
     */
    modelData: {
      type: Object as PropType<ISearchBar>,
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
      (...args) => new SearchBarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const onSearch = () => {
      c.onSearch();
    };

    const debounceSearch = debounce(() => {
      if (onSearch) {
        onSearch();
      }
    }, 500);

    const onInput = (value: string) => {
      c.handleInput(value);
      debounceSearch();
    };

    const cssVars = computed(() => {
      if (c.model.quickSearchWidth) {
        return ns.cssVarBlock({
          'quick-search-width': `${c.model.quickSearchWidth}px`,
        });
      }
      return {};
    });

    const filterButtonRef = ref();
    let popover: IOverlayPopoverContainer | undefined;
    const showFilter = async () => {
      popover = ibiz.overlay.createDrawer(
        () => {
          return (
            <iBizFilterTreeControl
              filterControllers={c.filterControllers}
              filterNodes={c.state.filterNodes}
              parent='search-bar'
              filterMode={c.state.filterMode}
              customCond={c.state.customCond}
              context={c.context}
              params={c.params}
              schemaEntityMap={c.schemaEntityMap}
              onCustomCondChange={(customCond?: string) => {
                c.state.customCond = customCond;
              }}
              onConfirm={(mode?: 'default' | 'pql', customCond?: string) => {
                c.state.filterMode = mode;
                c.state.customCond = customCond;
                c.onSearch();
                if (popover) {
                  popover.dismiss();
                }
              }}
              onCancel={() => {
                c.resetFilter();
                c.state.customCond = '';
                if (popover) {
                  popover.dismiss();
                }
              }}
            ></iBizFilterTreeControl>
          );
        },
        undefined,
        { placement: 'bottom' },
      );
      popover.present(filterButtonRef.value.$el as HTMLElement);
      await popover.onWillDismiss();
      popover = undefined;
    };

    const triggerFilter = () => {
      if (popover) {
        popover.dismiss();
      } else {
        showFilter();
      }
    };

    return {
      c,
      ns,
      filterButtonRef,
      onInput,
      onSearch,
      cssVars,
      triggerFilter,
    };
  },
  render() {
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b()]}
        style={this.cssVars}
      >
        {this.c.model.enableQuickSearch && (
          <van-search
            modelValue={this.c.state.query}
            class={this.ns.b('quick-search')}
            placeholder={this.c.state.quickSearchPlaceHolder}
            onUpdate:model-value={this.onInput}
          ></van-search>
        )}
        {this.c.enableFilter && (
          <van-button
            ref='filterButtonRef'
            title={showTitle(ibiz.i18n.t('control.searchBar.filter'))}
            class={this.ns.e('filter')}
            onClick={() => this.triggerFilter()}
          >
            <iBizIcon icon={{ cssClass: 'funnel-outline' }}></iBizIcon>
          </van-button>
        )}
      </iBizControlBase>
    );
  },
});
