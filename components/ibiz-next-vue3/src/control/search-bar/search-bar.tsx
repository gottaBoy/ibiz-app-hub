import {
  useControlController,
  useNamespace,
  useLocalCacheKey,
} from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  Ref,
  ref,
} from 'vue';
import { ISearchBar, ISearchBarGroup } from '@ibiz/model-core';
import './search-bar.scss';
import {
  IControlProvider,
  IOverlayPopoverContainer,
  SearchBarController,
} from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';

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
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController(
      (...args) => new SearchBarController(...args),
    );

    const counterData: Ref<IData> = ref({});

    const fn = (counter: IData) => {
      counterData.value = counter;
    };

    c.evt.on('onCreated', () => {
      if (c.counter) {
        c.counter.onChange(fn, true);
      }
    });

    onUnmounted(() => {
      c.counter?.offChange(fn);
    });

    // 修复非路由情况搜索栏部件启用缓存时构建缓存key异常
    c.setStorageKeyFn(
      useLocalCacheKey(
        c.context,
        'SEARCH_BAR_SELECTED_GROUP',
        c.view.modal.routeDepth,
        '@',
        `${c.view.model.codeName}@${c.model.codeName}`,
      ),
    );

    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    // 是否触发过搜索
    let isSearch = false;

    const onSearch = (): void => {
      isSearch = true;
      c.onSearch();
    };

    const onClear = (): void => {
      // 未触发过搜索，清空后不触发重置搜索
      if (isSearch === true) {
        isSearch = false;
        c.onSearch();
      }
    };

    const onKeydown = (e: KeyboardEvent): void => {
      if (e.code === 'Enter') {
        onSearch();
      }
    };

    const cssVars = computed(() => {
      if (c.model.quickSearchWidth) {
        return ns.cssVarBlock({
          'quick-search-width': `${c.model.quickSearchWidth}px`,
        });
      }
      return {};
    });

    const onGroupClick = (item: ISearchBarGroup) => {
      c.state.selectedGroupItem = item;
      c.evt.emit('onTabChange', { data: [item] });
      onSearch();
    };

    if (
      c.model.enableGroup &&
      c.model.searchBarGroups &&
      c.model.searchBarGroups?.length > 0
    ) {
      c.state.selectedGroupItem = c.model.searchBarGroups[0];
    }

    const filterButtonRef = ref();
    let popover: IOverlayPopoverContainer | undefined;
    const showFilter = async () => {
      popover = ibiz.overlay.createPopover(
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
              }}
            ></iBizFilterTreeControl>
          );
        },
        undefined,
        { placement: 'bottom-end', autoClose: true },
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

    // 保存设置
    const handleSave = () => {
      c.handleSave();
    };

    // 绘制高级快速搜索
    const renderAdvancedSearch = () => {
      if (!c.state.advancedQuickSearch) {
        return null;
      }
      return <iBizQuickSearchSelect controller={c} />;
    };

    return {
      c,
      ns,
      cssVars,
      filterButtonRef,
      counterData,
      onClear,
      onSearch,
      onKeydown,
      onGroupClick,
      triggerFilter,
      handleSave,
      renderAdvancedSearch,
    };
  },
  render() {
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b()]}
        style={this.cssVars}
      >
        {this.c.model.enableGroup &&
          (this.c.isBackendSearchGroup ? (
            <iBizSearchGroups
              controller={this.c}
              counterData={this.counterData}
            ></iBizSearchGroups>
          ) : (
            <div class={this.ns.b('quick-group')}>
              {this.c.model.searchBarGroups?.map(groupItem => {
                const visible = this.c.calcCountVisible(groupItem);
                if (!visible) {
                  return null;
                }
                return (
                  <span
                    class={[
                      this.ns.b('quick-group-item'),
                      this.ns.is(
                        'selected',
                        this.c.state.selectedGroupItem?.id === groupItem.id,
                      ),
                    ]}
                    onClick={() => this.onGroupClick(groupItem)}
                  >
                    {groupItem.caption}
                    {groupItem.counterId && (
                      <iBizBadge
                        class={this.ns.e('counter')}
                        value={this.counterData[groupItem.counterId]}
                        counterMode={groupItem.counterMode}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        {this.c.model.enableGroup && this.c.isBackendSearchGroup && (
          <el-button
            class={this.ns.b('save')}
            title={showTitle(ibiz.i18n.t('control.searchBar.saveGroup'))}
            onClick={this.handleSave}
          >
            <ion-icon name='save-outline'></ion-icon>
          </el-button>
        )}
        {this.c.model.enableQuickSearch && (
          <el-input
            v-model={this.c.state.query}
            class={[
              this.ns.b('quick-search'),
              this.ns.is(
                'advanced-quick-search',
                this.c.state.advancedQuickSearch,
              ),
            ]}
            placeholder={this.c.state.quickSearchPlaceHolder}
            clearable={true}
            onKeydown={this.onKeydown}
            onClear={this.onClear}
            suffix-icon={
              <ion-icon
                onClick={this.onSearch}
                class={this.ns.e('search-icon')}
                name='search'
              />
            }
          >
            {{
              prepend: () => this.renderAdvancedSearch(),
            }}
          </el-input>
        )}
        {this.c.enableFilter && (
          <el-button
            ref='filterButtonRef'
            type='primary'
            title={showTitle(ibiz.i18n.t('control.searchBar.filter'))}
            class={this.ns.b('filter')}
            onClick={() => this.triggerFilter()}
          >
            <iBizIcon icon={{ cssClass: 'funnel-outline' }}></iBizIcon>
          </el-button>
        )}
      </iBizControlBase>
    );
  },
});
