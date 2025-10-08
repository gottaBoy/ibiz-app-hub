import {
  h,
  ref,
  watch,
  computed,
  PropType,
  onMounted,
  onUnmounted,
  defineComponent,
  resolveComponent,
} from 'vue';
import { showTitle } from '@ibiz-template/core';
import { IPanelRawItem } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { GlobalSearchController } from './global-search.controller';
import { ISearchItem } from './global-search.state';
import { VirtualList } from './virtual-list/virtual-list';
import './global-search.scss';

/**
 * 全局搜索
 * @primary
 * @description 全局搜索组件，监听快捷键Ctrl+K弹出搜索框，需在菜单上绑定应用功能预定义类型为GLOBAL_SEARCH的隐藏菜单项,应用功能类型为全局搜索，同时绑定应用实体与自填模式。输入值时会查询实体自填模式数据，同时点击下拉数据后会打开自填模式中的链接视图。每次查询后还会缓存为搜索历史记录。
 * @panelitemparams {name:historyCacheKey,parameterType:string,defaultvalue:'global-search-history',description:搜索历史缓存标识}
 * @panelitemparams {name:maxhistory,parameterType:number,defaultvalue:7,description:最大历史记录，默认7条}
 * @panelitemparams {name:size,parameterType:number,defaultvalue:100,description:单次查询最大数量，默认100条}
 * @panelitemparams {name:placeholder,parameterType:string,description:搜索框提示信息}
 * @export
 * @class GlobalSearch
 */
export const GlobalSearch = defineComponent({
  name: 'IBizGlobalSearch',
  props: {
    /**
     * @description 全局搜索控件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 全局搜索控件控制器
     */
    controller: {
      type: Object as PropType<GlobalSearchController>,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('global-search');
    const editorRef = ref();
    // 忽略聚焦
    let ignoreFocusEvent = false;
    // 标记当前全文检索组件是否激活（只有激活态才会出下拉）
    const activated = ref(false);
    const virtualListRef = ref();
    const searchValue = ref('');

    const visible = computed(() => {
      const { query, list, histories, loading } = c.state;
      const showSearch = query && list.length > 0;
      const showHistory = !query && histories.length > 0;
      const showEmpty = histories.includes(query) && list.length === 0;
      return (
        (showSearch || showEmpty || showHistory || loading) && activated.value
      );
    });

    const curPlaceholder = computed(() => {
      const { placeholder } = c.rawItemParams;
      return (
        placeholder || ibiz.i18n.t('panelComponent.globalSearch.placeholder')
      );
    });

    /**
     * 处理回车事件
     *
     * @param event
     */
    const handleEnter = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        activated.value = true;
        c.search(searchValue.value);
      }
    };

    /**
     * 处理聚焦
     * - 聚焦时将编辑器状态设置为激活
     * @param {FocusEvent} _evt
     */
    const handleFocus = (_evt: FocusEvent): void => {
      if (!ignoreFocusEvent) {
        activated.value = true;
      } else {
        ignoreFocusEvent = false;
      }
    };

    /**
     * 处理清空搜索值
     *
     */
    const handleClearSearch = (): void => {
      c.state.list = [];
      c.state.query = '';
    };

    /**
     * 处理历史项点击
     *
     * @param {string} value 搜索值
     */
    const handleHistoryItemClick = (value: string): void => {
      searchValue.value = value;
      c.search(searchValue.value);
    };

    /**
     * 处理搜索项点击
     *
     * @param {IData} data 数据项
     * @param {ISearchItem} item 搜索项
     */
    const handleSearchItemClick = (data: IData, item?: ISearchItem): void => {
      // popover 有焦点锁定因此必须忽略这次自动聚焦
      ignoreFocusEvent = true;
      activated.value = false;
      if (item) c.openLinkView(data, item);
    };

    /**
     * 处理外部点击
     * - 点击外部关闭下拉
     * @param {MouseEvent} event
     */
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(`.${ns.b()}`) &&
        !target.closest(`.${ns.e('popper')}`) &&
        !target.closest('.el-input__suffix')
      ) {
        activated.value = false;
      }
    };

    /**
     * 处理清空历史
     *
     */
    const handleClearHistory = (): void => {
      handleClearSearch();
      c.clearHistory();
    };

    /**
     * 监听键盘事件(ctrl+k)
     *
     * @param {KeyboardEvent} event
     */
    const handleKeyup = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        editorRef.value?.focus();
      }
    };

    watch(
      () => visible.value,
      () => {
        // 如果显示下拉时搜索框的搜索值和最后一次搜索历史不同则清空搜索列表
        if (visible.value) {
          // 每次打开时回到顶部
          setTimeout(() => {
            virtualListRef.value?.scrollTo(0);
          });
          if (
            searchValue.value !==
            c.state.histories[c.state.histories.length - 1]
          )
            handleClearSearch();
        }
      },
    );

    onMounted(() => {
      document.addEventListener('click', handleClickOutside, {
        capture: true,
      });
      document.addEventListener('keydown', handleKeyup);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside, {
        capture: true,
      });
      document.removeEventListener('keydown', handleKeyup);
    });

    /**
     * 绘制底部
     *
     * @return {*}  {(JSX.Element | undefined)}
     */
    const renderFooter = (): JSX.Element | undefined => {
      const { query, list, histories, loading } = c.state;
      const showEmpty = histories.includes(query) && list.length === 0;
      if (loading || showEmpty)
        return (
          <div class={ns.e('footer')}>
            {ibiz.i18n.t(
              `panelComponent.globalSearch.${loading ? 'loading' : 'empty'}`,
            )}
          </div>
        );
    };

    /**
     * 绘制行为
     *
     * @return {*}  {(JSX.Element | undefined)}
     */
    const renderAction = (): JSX.Element | undefined => {
      if (!c.state.query && c.state.histories.length)
        return (
          <div class={ns.em('content', 'action-item')}>
            <el-button text onClick={handleClearHistory}>
              {ibiz.i18n.t('panelComponent.globalSearch.clearHistory')}
            </el-button>
          </div>
        );
    };

    /**
     * 绘制历史列表
     *
     * @return {*}  {JSX.Element[]}
     */
    const renderHistoryList = (): JSX.Element => {
      return (
        <div class={ns.e('list')}>
          {c.state.histories.map(history => {
            return (
              <div
                onClick={() => handleHistoryItemClick(history)}
                class={[ns.em('list', 'item'), ns.em('list', 'history-item')]}
              >
                {history}
              </div>
            );
          })}
        </div>
      );
    };

    /**
     * 绘制搜索列表
     *
     * @return {*}  {(JSX.Element | undefined)}
     */
    const renderSearchList = (): JSX.Element | undefined => {
      if (!c.state.list.length) return;
      return (
        <VirtualList
          ref={virtualListRef}
          items={c.state.list}
          class={ns.e('virtual-list')}
          getKey={(item: IData) => item[c.keyName]}
        >
          {{
            default: ({ item }: { item: IData }) => {
              const searchItem = c.getSearchItemByEntity(item.srfdecodename);
              let content = item[c.textName];

              if (searchItem?.acItemProvider) {
                content = h(
                  resolveComponent(searchItem.acItemProvider.component),
                  { item, controller: c },
                );
              } else if (searchItem?.deACMode.itemLayoutPanel) {
                content = (
                  <iBizControlShell
                    data={item}
                    modelData={searchItem.deACMode.itemLayoutPanel}
                    context={c.panel.context}
                    params={c.panel.params}
                  />
                );
              }
              return (
                <div
                  class={[ns.em('list', 'item'), ns.em('list', 'srearch-item')]}
                  onClick={() => handleSearchItemClick(item, searchItem)}
                  title={showTitle(item[c.textName])}
                >
                  {content}
                </div>
              );
            },
          }}
        </VirtualList>
      );
    };

    return {
      c,
      ns,
      visible,
      editorRef,
      searchValue,
      curPlaceholder,
      handleFocus,
      handleEnter,
      renderAction,
      renderFooter,
      renderSearchList,
      renderHistoryList,
      handleClearSearch,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <el-popover
          width='auto'
          visible={this.visible}
          placement='bottom-start'
          popper-class={this.ns.e('popper')}
        >
          {{
            reference: () => {
              return (
                <el-input
                  clearable
                  ref='editorRef'
                  v-model={this.searchValue}
                  placeholder={this.curPlaceholder}
                  class={[
                    this.ns.e('search'),
                    this.ns.is('search', this.visible),
                  ]}
                  onFocus={this.handleFocus}
                  onKeyup={this.handleEnter}
                  onClear={this.handleClearSearch}
                >
                  {{
                    prefix: () => {
                      return (
                        <ion-icon
                          name='search'
                          class={this.ns.em('search', 'icon')}
                        />
                      );
                    },
                    suffix: () => {
                      if (this.searchValue)
                        return (
                          <ion-icon
                            title={ibiz.i18n.t(
                              'panelComponent.globalSearch.search',
                            )}
                            name='return-down-back-outline'
                            class={[
                              this.ns.em('search', 'icon'),
                              this.ns.em('search', 'enter-icon'),
                            ]}
                            onClick={() => this.c.search(this.searchValue)}
                          ></ion-icon>
                        );
                    },
                  }}
                </el-input>
              );
            },
            default: () => {
              return (
                <div class={this.ns.e('content')}>
                  {this.c.state.query
                    ? this.renderSearchList()
                    : this.renderHistoryList()}
                  {this.renderAction()}
                  {this.renderFooter()}
                </div>
              );
            },
          }}
        </el-popover>
      </div>
    );
  },
});
