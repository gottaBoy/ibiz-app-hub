import {
  useClickOutside,
  useControlController,
  useNamespace,
} from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  Ref,
  ref,
} from 'vue';
import { ISearchBar, ISearchBarGroup } from '@ibiz/model-core';
import { debounce } from 'lodash-es';
import {
  getOriginFilterNodes,
  IControlProvider,
  IOverlayPopoverContainer,
  SearchBarController,
} from '@ibiz-template/runtime';
import { OnClickOutsideResult, showTitle } from '@ibiz-template/core';
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
  setup(props) {
    const c = useControlController(
      (...args) => new SearchBarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    // 搜索栏
    const searchRef = ref();

    // 下拉弹框距离顶部位置
    const dropdownTop = ref(0);

    // 下拉弹框
    const dropdownRef = ref();

    // 显示下拉弹框
    const showDropdown = ref(false);

    // 历史搜索记录
    const historyItems: Ref<string[]> = ref([]);

    // 是否收缩折叠
    const isCollapse = ref(true);

    // 搜索项移除按钮显示
    const showItemRemove = ref(false);

    // 记录搜索历史项按下时间
    const timer = ref();

    // 当前搜索栏搜索条件缓存标识
    const queryCacheKey = `searchbar-${props.context.srfuserid}-${props.context.srfappid}-${c.view.model.id}-${c.model.id}`;

    // 点击外部
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    let funcs: OnClickOutsideResult;

    // 是否显示所有快速分组
    const showAllGroups = ref(false);

    // 监听器
    let resizeObserver: ResizeObserver | null = null;

    // 历史记录展开按钮
    const showExpand = ref(false);

    // 是否启用历史搜索记录功能
    const enableStoredQuery = computed(() => {
      if (Object.hasOwnProperty.call(c.controlParams, 'enablestoredquery')) {
        return (
          c.controlParams.enablestoredquery === 'true' ||
          c.controlParams.enablestoredquery === true
        );
      }
      return ibiz.config.mob.mobEnableStoredQuery;
    });

    // 是否启用快速分组
    const enableQuickGroup = computed(() => {
      return c.model.searchBarGroups && c.model.searchBarGroups.length > 0;
    });

    // 是否出下拉弹框
    const enableDropDown = computed(() => {
      return enableStoredQuery.value;
    });

    // 计数器数据
    const counterData: Ref<IData> = ref({});

    const fn = (counter: IData) => {
      counterData.value = counter;
    };

    c.evt.on('onCreated', () => {
      if (c.counter) {
        c.counter.onChange(fn, true);
      }
    });

    const onSearch = () => {
      c.onSearch();
      if (enableStoredQuery.value && c.state.query) {
        const index = historyItems.value.indexOf(c.state.query);
        if (index === -1) {
          historyItems.value.unshift(c.state.query);
          localStorage.setItem(
            queryCacheKey,
            JSON.stringify(historyItems.value),
          );
        }
      }
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
                c.state.selectedGroupItem = null;
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
        {
          placement: 'bottom',
          height: 80,
          attrs: {
            closeable: true,
          },
        },
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

    // 聚焦
    const onFocus = (_event: PointerEvent) => {
      if (!enableDropDown.value) {
        return;
      }
      if (searchRef.value) {
        // 每次聚焦出现时重新获取历史搜索记录
        if (enableStoredQuery.value) {
          const tmepHistory = localStorage.getItem(queryCacheKey);
          if (tmepHistory) {
            historyItems.value = JSON.parse(tmepHistory);
          }
        }
        const rect = (
          searchRef.value.$el as HTMLElement
        ).getBoundingClientRect();
        const { height, top } = rect;
        dropdownTop.value = top + height + 8;
      }
      if (historyItems.value?.length > 0) {
        showDropdown.value = true;
      }
    };
    // 搜索栏清除
    const onClear = (_event: Event) => {
      if (!enableDropDown.value) {
        return;
      }
      _event.preventDefault();
      _event.stopPropagation();
      showDropdown.value = true;
    };

    // 下拉弹框样式
    const style = computed(() => {
      return {
        display: showDropdown.value ? 'flex' : 'none',
        top: `${dropdownTop.value}px`,
        maxHeight: `calc(100vh - ${dropdownTop.value}px - 10px)`,
      };
    });

    // 搜索历史内容样式
    const contentStyle = computed(() => {
      return {
        maxHeight: isCollapse.value ? '150px' : '100%',
      };
    });

    // 选择历史搜索项
    const onSelectItem = (item: string) => {
      c.handleInput(item);
      onSearch();
      showDropdown.value = false;
    };

    // 按下
    const onPointerDown = () => {
      timer.value = setTimeout(() => {
        showItemRemove.value = true;
      }, 1000);
    };

    // 放起
    const onPointerUp = () => {
      clearTimeout(timer.value);
    };

    // 触摸取消
    const onpointerCancel = () => {
      clearTimeout(timer.value);
    };

    // 删除历史搜索项
    const onRemoveItem = (item: string, event: PointerEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const index = historyItems.value.indexOf(item);
      historyItems.value.splice(index, 1);
      localStorage.setItem(queryCacheKey, JSON.stringify(historyItems.value));
    };

    // 绘制历史搜索项
    const renderSearchHistory = () => {
      return historyItems.value
        .filter(item => {
          return item.includes(c.state.query);
        })
        .map((item: string) => {
          return (
            <div
              onClick={() => onSelectItem(item)}
              onPointerdown={onPointerDown}
              onPointerup={onPointerUp}
              onPointercancel={onpointerCancel}
              tabindex={0}
              class={ns.bem('history', 'content', 'item')}
            >
              <div class={ns.bem('history', 'content', 'item-text')}>
                <span>{item}</span>
                {showItemRemove.value && (
                  <ion-icon
                    onClick={(e: PointerEvent) => {
                      onRemoveItem(item, e);
                    }}
                    class={ns.bem('history', 'content', 'item-remove')}
                    name='close-circle-outline'
                  ></ion-icon>
                )}
              </div>
            </div>
          );
        });
    };

    // 清除历史
    const clearHistory = () => {
      historyItems.value = [];
      localStorage.removeItem(queryCacheKey);
      showDropdown.value = false;
    };

    // 分组点击
    const onGroupClick = (item: ISearchBarGroup) => {
      c.state.filterNodes = getOriginFilterNodes();
      c.state.customCond = '';
      if (c.state.selectedGroupItem?.id !== item?.id) {
        c.state.selectedGroupItem = item;
        c.evt.emit('onTabChange', { data: [item] });
      } else {
        c.state.selectedGroupItem = null;
        c.evt.emit('onTabChange', { data: null });
      }
      onSearch();
    };

    // 点击折叠
    const onCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    // 取消单个删除
    const onCancelItemRemove = () => {
      showItemRemove.value = false;
    };

    // 绘制历史记录
    const renderHistory = () => {
      if (!enableStoredQuery.value) return null;
      return (
        <div class={ns.b('history')}>
          <div class={ns.be('history', 'header')}>
            <div class={ns.bem('history', 'header', 'title')}>
              {ibiz.i18n.t('control.searchBar.history')}
            </div>
            {showItemRemove.value ? (
              <span onClick={onCancelItemRemove}>
                {ibiz.i18n.t('control.searchBar.cancel')}
              </span>
            ) : (
              <div
                class={ns.bem('history', 'header', 'clear')}
                onClick={clearHistory}
              >
                <ion-icon name='trash-outline'></ion-icon>
                <span>{ibiz.i18n.t('control.searchBar.clear')}</span>
              </div>
            )}
          </div>
          <div class={ns.be('history', 'content')} style={contentStyle.value}>
            {renderSearchHistory()}
          </div>
          {showExpand.value && (
            <div class={ns.be('history', 'footer')} onClick={onCollapse}>
              <van-divider>
                {!isCollapse.value
                  ? ibiz.i18n.t('control.searchBar.collapse')
                  : ibiz.i18n.t('control.searchBar.expand')}
                {!isCollapse.value ? (
                  <ion-icon name='caret-up-outline'></ion-icon>
                ) : (
                  <ion-icon name='caret-down-outline'></ion-icon>
                )}
              </van-divider>
            </div>
          )}
        </div>
      );
    };

    // 打开全部分组
    const onOpenAllGroups = () => {
      showAllGroups.value = true;
    };

    // 绘制快速分组
    const renderQuickGroup = () => {
      if (!enableQuickGroup.value) return null;
      const count = c.model.quickGroupCount || c.model.searchBarGroups?.length;
      return (
        <div class={ns.b('quick-group')}>
          {c.model.searchBarGroups
            ?.slice(0, count)
            ?.map((groupItem: ISearchBarGroup) => {
              const visible = c.calcCountVisible(groupItem);
              if (!visible) {
                return null;
              }
              return (
                <span
                  class={[
                    ns.be('quick-group', 'item'),
                    ns.is(
                      'selected',
                      c.state.selectedGroupItem?.id === groupItem.id,
                    ),
                  ]}
                  onClick={() => onGroupClick(groupItem)}
                >
                  {groupItem.caption}
                  {groupItem.counterId && (
                    <iBizBadge
                      class={ns.e('counter')}
                      value={counterData.value[groupItem.counterId]}
                      counterMode={groupItem.counterMode}
                    />
                  )}
                </span>
              );
            })}
          {count &&
          count > 0 &&
          count < (c.model.searchBarGroups?.length ?? 0) ? (
            <div
              class={[
                ns.be('quick-group', 'item'),
                ns.be('quick-group', 'more'),
                ns.is(
                  'selected',
                  c.state.selectedGroupItem?.id &&
                    c.model.searchBarGroups
                      ?.slice(0, count)
                      .some(
                        (item: ISearchBarGroup) =>
                          item.id !== c.state.selectedGroupItem?.id,
                      ),
                ),
              ]}
              onClick={onOpenAllGroups}
            >
              <ion-icon name='grid-outline'></ion-icon>
              <div class={ns.be('quick-group', 'more-text')}>
                {c.model.groupMoreText || ibiz.i18n.t('control.searchBar.more')}
              </div>
            </div>
          ) : null}
        </div>
      );
    };

    // 关闭所有分组
    const onCloseAllGroups = (item: ISearchBarGroup) => {
      showAllGroups.value = false;
      onGroupClick(item);
    };

    // 绘制所有分组
    const renderAllGroups = () => {
      const count = c.model.quickGroupCount || c.model.searchBarGroups?.length;
      const groups = c.model.searchBarGroups
        ?.slice(count)
        .map((group: ISearchBarGroup) => {
          return {
            name: group.caption,
            className: [
              ns.em('action-sheet', 'item'),
              ns.is('selected', group.id === c.state.selectedGroupItem?.id),
            ],
            ...group,
          };
        });
      return (
        <van-action-sheet
          class={ns.e('action-sheet')}
          v-model:show={showAllGroups.value}
          actions={groups}
          close-on-click-action
          onSelect={(item: ISearchBarGroup) => onCloseAllGroups(item)}
        />
      );
    };

    onMounted(() => {
      if (enableDropDown.value && dropdownRef.value) {
        if (enableStoredQuery.value) {
          // 初始化，从本地拿一次历史记录
          const tmepHistory = localStorage.getItem(queryCacheKey);
          if (tmepHistory) {
            historyItems.value = JSON.parse(tmepHistory);
          }
        }
        funcs = useClickOutside(
          dropdownRef,
          async () => {
            showDropdown.value = false;
            // 关闭时，如果当前启用了记录历史搜索功能，会将当前的所有搜索记录放入localStorage中
            if (enableStoredQuery.value) {
              localStorage.setItem(
                queryCacheKey,
                JSON.stringify(historyItems.value),
              );
            }
          },
          {
            ignore: [searchRef.value?.$el],
          },
        );
        // 创建监听器
        resizeObserver = new ResizeObserver(entries => {
          const newHeight = entries[0].target.clientHeight;
          if (newHeight > 200) {
            showExpand.value = true;
          } else {
            showExpand.value = false;
          }
        });
        // 开始监听
        resizeObserver.observe(dropdownRef.value);
      }
    });

    onUnmounted(() => {
      if (funcs && funcs.stop) {
        funcs.stop();
      }
      if (resizeObserver && dropdownRef.value) {
        resizeObserver.unobserve(dropdownRef.value);
      }
    });

    return {
      c,
      ns,
      filterButtonRef,
      searchRef,
      onInput,
      onSearch,
      cssVars,
      triggerFilter,
      onFocus,
      onClear,
      style,
      contentStyle,
      dropdownRef,
      enableStoredQuery,
      enableDropDown,
      renderHistory,
      renderQuickGroup,
      renderAllGroups,
    };
  },
  render() {
    return (
      <iBizControlBase
        controller={this.c}
        style={this.cssVars}
        class={this.ns.b('container')}
      >
        <div
          class={[
            this.ns.b(),
            this.ns.is('enable-filter', this.c.enableFilter),
          ]}
        >
          {this.c.model.enableQuickSearch && (
            <van-search
              ref='searchRef'
              modelValue={this.c.state.query}
              class={this.ns.b('quick-search')}
              autocomplete={this.enableDropDown ? 'off' : 'on'}
              placeholder={this.c.state.quickSearchPlaceHolder}
              onUpdate:model-value={this.onInput}
              onFocus={this.onFocus}
              onClear={this.onClear}
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
        </div>
        {this.renderQuickGroup()}
        <div class={this.ns.b('dropdown')} ref='dropdownRef' style={this.style}>
          {this.renderHistory()}
        </div>
        {this.renderAllGroups()}
      </iBizControlBase>
    );
  },
});
