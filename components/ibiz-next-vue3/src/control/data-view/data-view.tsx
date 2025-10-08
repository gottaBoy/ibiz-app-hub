/* eslint-disable no-nested-ternary */
import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  h,
  ref,
  VNode,
  watch,
  computed,
  PropType,
  defineComponent,
  resolveComponent,
} from 'vue';
import {
  IDEDataView,
  ILayoutPanel,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  ControlVO,
  ISortItem,
  getControl,
  IDragChangeInfo,
  IControlProvider,
  IMDControlGroupState,
  DataViewControlController,
} from '@ibiz-template/runtime';
import { createUUID } from 'qx-util';
import draggable from 'vuedraggable';
import { usePagination } from '../../util';
import './data-view.scss';

export const DataViewControl = defineComponent({
  name: 'IBizDataViewControl',
  components: {
    draggable,
  },
  props: {
    /**
     * @description 数据视图（卡片）模型数据
     */
    modelData: { type: Object as PropType<IDEDataView>, required: true },
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
    /**
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否单选
     */
    singleSelect: { type: Boolean, default: undefined },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup(props) {
    const c = useControlController(
      (...args) => new DataViewControlController<IDEDataView>(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    useControlPopoverzIndex(c);

    const classNames = computed(() => {
      return [ns.is('enable-page', c.model.enablePagingBar === true)];
    });

    // 是否为收缩状态
    const isCollapse = ref(false);

    // 是否可以加载更多
    const isLodeMoreDisabled = computed(() => {
      if (c.model.enablePagingBar === true) {
        return true;
      }
      if (c.model.pagingMode !== 2) {
        return true;
      }
      return (
        c.state.items.length >= c.state.total ||
        c.state.isLoading ||
        c.state.total <= c.state.size
      );
    });

    const cardStyle = computed(() => {
      return (
        c.model.controlParam?.ctrlParams?.CARDSTYLE ||
        c.controlParams.cardstyle ||
        'default'
      );
    });

    // 是否显示数据伸缩图标
    // 如果未开启分组，并且加载模式为【滚动加载】或者【加载更多】，并且已经加载过一次更多，则为 true
    const showCollapseOrExpandIcon = computed(() => {
      return (
        !c.state.enableGroup &&
        (c.model.pagingMode === 2 || c.model.pagingMode === 3)
      );
    });

    // 无限滚动元素
    const infiniteScroll = ref<IData>();
    // 无限滚动元素标识
    const infiniteScrollKey = ref<string>(createUUID());

    watch(
      () => c.state.curPage,
      () => {
        if (
          c.state.curPage === 1 &&
          (c.model.pagingMode === 2 || c.model.pagingMode === 3)
        ) {
          infiniteScrollKey.value = createUUID();
          const containerEl =
            infiniteScroll.value?.ElInfiniteScroll?.containerEl;
          if (containerEl) {
            containerEl.lastScrollTop = 0;
            containerEl.scrollTop = 0;
          }
        }
      },
    );

    // 本地数据模式
    const initSimpleData = (): void => {
      if (!props.data) {
        return;
      }
      c.state.items = (props.data as IData[]).map(item => new ControlVO(item));
      c.afterLoad({}, c.state.items);
    };

    c.evt.on('onCreated', async () => {
      if (props.isSimple) {
        initSimpleData();
        c.state.isSimple = true;
        c.state.isLoaded = true;
      }
    });

    /**
     * 是否选中数据
     *
     * @param {IData} item
     * @return {*}  {boolean}
     */
    const isSelected = (item: IData): boolean => {
      let selected = !!c.state.selectedData.find(
        data => data.srfkey === item.srfkey,
      );
      if (
        c.view.model.viewType === 'DEDATAVIEW' &&
        c.state.mdctrlActiveMode === 1 &&
        c.state.singleSelect === true
      )
        selected = false;
      return selected;
    };

    /**
     * 切换选中状态
     *
     * @param {IData} item
     */
    const toggleSelection = (item: IData): void => {
      const selected: IData[] = c.state.selectedData;
      const index = selected.findIndex(data => data.srfkey === item.srfkey);
      if (index === -1) {
        selected.push(item);
      } else {
        selected.splice(index, 1);
      }
      c.setSelection(selected);
    };

    watch(
      () => props.data,
      () => {
        if (props.isSimple) {
          initSimpleData();
        }
      },
      {
        deep: true,
      },
    );

    const { onPageChange, onPageRefresh, onPageSizeChange } = usePagination(c);

    // 行单击事件
    const onRowClick = (item: IData, event: MouseEvent): Promise<void> => {
      event.stopPropagation();
      return c.onRowClick(item);
    };

    // 行双击事件
    const onDbRowClick = (item: IData, event: MouseEvent): Promise<void> => {
      event.stopPropagation();
      return c.onDbRowClick(item);
    };

    let cacheInfo: Partial<IDragChangeInfo> | null = null;

    /**
     * @description 拖拽变更
     * @param {IData} evt
     * @param {(string | number)} [groupKey]
     */
    const onDraggableChange = (evt: IData, groupKey?: string | number) => {
      if (evt.moved) {
        // 排序
        c.onDragChange({
          from: groupKey!,
          to: groupKey!,
          fromIndex: evt.moved.oldIndex,
          toIndex: evt.moved.newIndex,
        });
      }
      // 分组变更时会先触发added后触发removed，因此需提前缓存added的参数
      if (evt.added) {
        cacheInfo = {
          to: groupKey,
          toIndex: evt.added.newIndex,
        };
      }
      if (evt.removed) {
        if (cacheInfo) {
          cacheInfo.from = groupKey;
          cacheInfo.fromIndex = evt.removed.oldIndex;
          c.onDragChange(cacheInfo as IDragChangeInfo);
        }
        cacheInfo = null;
      }
    };

    /**
     * @description 绘制新建卡片项
     * @param {IMDControlGroupState} [group]
     * @returns {*}
     */
    const renderNewCard = (group?: IMDControlGroupState) => {
      return (
        <el-card
          shadow='hover'
          class={[ns.b('item'), ns.be('item', 'new')]}
          title={ibiz.i18n.t('app.newlyBuild')}
          body-style={{
            width: c.model.cardWidth ? `${c.model.cardWidth}px` : 'auto',
            height: c.model.cardHeight ? `${c.model.cardHeight}px` : 'auto',
          }}
          onClick={(event: MouseEvent) => {
            c.onClickNew(event, group?.key);
          }}
        >
          <ion-icon name='add-outline'></ion-icon>
        </el-card>
      );
    };

    // 绘制项布局面板
    const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
      const { context, params } = c;
      return (
        <iBizControlShell
          data={item}
          modelData={modelData}
          context={context}
          params={params}
          onClick={(event: MouseEvent): Promise<void> =>
            onRowClick(item, event)
          }
          onDblclick={(event: MouseEvent): Promise<void> =>
            onDbRowClick(item, event)
          }
        ></iBizControlShell>
      );
    };

    // 绘制项行为
    const renderItemAction = (item: IData): VNode => {
      return (
        <iBizActionToolbar
          class={ns.bem('item-content', 'bottom', 'actions')}
          action-details={c.getOptItemModel()}
          actions-state={c.state.uaState[item.srfkey]}
          zIndex={c.state.zIndex}
          onActionClick={(
            detail: IUIActionGroupDetail,
            event: MouseEvent,
          ): Promise<void> => c.onActionClick(detail, item, event)}
        ></iBizActionToolbar>
      );
    };

    // 绘制默认项
    const renderDefaultItem = (item: IData): VNode => {
      const actionModel = c.getOptItemModel();
      return (
        <div class={ns.b('item-content')}>
          <div class={ns.be('item-content', 'top')}>
            <div class={ns.bem('item-content', 'top', 'title')}>
              {item.srfmajortext}
            </div>
            <div class={ns.bem('item-content', 'top', 'description')}>
              {item.content}
            </div>
          </div>
          {actionModel.length ? (
            <div class={ns.be('item-content', 'bottom')}>
              {renderItemAction(item)}
            </div>
          ) : null}
        </div>
      );
    };

    // 绘制卡片
    const renderCard = (item: IData): VNode => {
      const itemStyle = ns.cssVarBlock({
        'item-bg-color': `${item.bgcolor || ''}`,
        'text-color': `${item.fontcolor || ''}`,
        'hover-bg-color': `${item.hovercolor || ''}`,
        'active-bg-color': `${item.activecolor || ''}`,
      });
      const panel = props.modelData.itemLayoutPanel;

      return (
        <el-card
          shadow='hover'
          class={[ns.b('item'), ns.is('active', isSelected(item))]}
          style={itemStyle}
          body-style={{
            width: c.model.cardWidth ? `${c.model.cardWidth}px` : 'auto',
            height: c.model.cardHeight ? `${c.model.cardHeight}px` : 'auto',
          }}
          onClick={(event: MouseEvent): Promise<void> =>
            onRowClick(item, event)
          }
          onDblclick={(event: MouseEvent): Promise<void> =>
            onDbRowClick(item, event)
          }
        >
          <div class={ns.be('item', 'content')}>
            {c.state.draggable && !c.state.readonly && (
              <svg
                viewBox='0 0 16 16'
                xmlns='http://www.w3.org/2000/svg'
                height='1em'
                width='1em'
                class={ns.e('drag-icon')}
                preserveAspectRatio='xMidYMid meet'
                focusable='false'
              >
                <g stroke-width='1' fill-rule='evenodd'>
                  <g transform='translate(5 1)' fill-rule='nonzero'>
                    <path d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'></path>
                  </g>
                </g>
              </svg>
            )}
            {cardStyle.value === 'style2' && !c.state.singleSelect && (
              <el-checkbox
                size='large'
                class={ns.bem('item', 'content', 'checkbox')}
                modelValue={isSelected(item)}
                onClick={(e: MouseEvent) => e.stopPropagation()}
                onChange={() => toggleSelection(item)}
              />
            )}
            {panel ? renderPanelItem(item, panel) : renderDefaultItem(item)}
          </div>
        </el-card>
      );
    };

    /**
     * 绘制卡片布局
     *
     * @param {IData[]} items
     * @return {*}
     */
    const renderCardLayout = (
      items: IData[],
      group?: IMDControlGroupState,
      disabled: boolean = true,
    ) => {
      const { cardColXS, cardColSM, cardColMD, cardColLG } = c.model;
      if (cardColXS || cardColSM || cardColMD || cardColLG)
        return (
          <draggable
            itemKey='srfkey'
            modelValue={items}
            group={c.model.id}
            handle={`.${ns.e('drag-icon')}`}
            class={['el-row', ns.e('layout-row')]}
            disabled={disabled || c.state.updating || c.state.readonly}
            onChange={(evt: IData) => onDraggableChange(evt, group?.key)}
          >
            {{
              item: ({ element }: { element: IData }) => (
                <el-col
                  xs={cardColXS}
                  sm={cardColSM}
                  md={cardColMD}
                  lg={cardColLG}
                  class={ns.e('layout-col')}
                >
                  <div class={ns.b('scroll-item')}>{renderCard(element)}</div>
                </el-col>
              ),
              footer: () => {
                if (c.enableNew && !c.state.readonly)
                  return (
                    <el-col
                      xs={cardColXS}
                      sm={cardColSM}
                      md={cardColMD}
                      lg={cardColLG}
                      class={ns.e('layout-col')}
                    >
                      <div class={ns.b('scroll-item')}>
                        {renderNewCard(group)}
                      </div>
                    </el-col>
                  );
              },
            }}
          </draggable>
        );
      return (
        <draggable
          itemKey='srfkey'
          modelValue={items}
          group={c.model.id}
          class={[ns.e('layout-flex'), ns.em('layout-flex', 'draggable')]}
          disabled={disabled || c.state.updating || c.state.readonly}
          onChange={(evt: IData) => onDraggableChange(evt, group?.key)}
        >
          {{
            item: ({ element }: { element: IData }) => (
              <div class={ns.b('scroll-item')}>{renderCard(element)}</div>
            ),
            footer: () => {
              if (c.enableNew && !c.state.readonly)
                return (
                  <div class={ns.b('scroll-item')}>{renderNewCard(group)}</div>
                );
            },
          }}
        </draggable>
      );
    };

    // 绘制分组
    const renderGroup = (group: IMDControlGroupState): VNode => {
      const { groupSysCss } = c.model;
      return (
        <div
          class={[
            ns.be('group-content', 'item'),
            groupSysCss?.cssName,
            ns.is(
              'collapse',
              c.state.collapseKeys.includes(group.key.toString()),
            ),
          ]}
        >
          <div class={ns.be('group-content', 'item-header')}>
            <span class={ns.be('group-content', 'item-title')}>
              {group.caption}
            </span>
            <span class={ns.be('group-content', 'item-action')}>
              {c.model.groupUIActionGroup && group.groupActionGroupState && (
                <iBizActionToolbar
                  zIndex={c.state.zIndex}
                  class={ns.be('group-content', 'header-actions')}
                  action-details={
                    c.model.groupUIActionGroup.uiactionGroupDetails
                  }
                  actions-state={group.groupActionGroupState}
                  onActionClick={(
                    detail: IUIActionGroupDetail,
                    event: MouseEvent,
                  ) => {
                    c.onGroupToolbarClick(detail, event, group);
                  }}
                ></iBizActionToolbar>
              )}
            </span>
          </div>
          {group.children.length > 0 ? (
            renderCardLayout(group.children, group, !c.state.draggable)
          ) : (
            <div class={ns.bem('group-content', 'item', 'empty')}>
              {ibiz.i18n.t('app.noData')}
            </div>
          )}
        </div>
      );
    };

    // 绘制卡片内容
    const renderDataViewContent = (): VNode | VNode[] => {
      if (c.state.enableGroup) {
        return (
          <div class={ns.b('group-content')}>
            {c.state.groups.map(group => {
              return renderGroup(group as IMDControlGroupState);
            })}
          </div>
        );
      }
      return renderCardLayout(
        isCollapse.value ? c.state.items.slice(0, c.state.size) : c.state.items,
        undefined,
        !c.enableEditOrder,
      );
    };

    // 平滑滚动到顶部
    const scrollToTop = () => {
      infiniteScroll.value?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    c.evt.on('onScrollToTop', () => {
      scrollToTop();
    });

    // 数据折叠，前端将数据处理为初始化时候的数据
    const onCollapseData = () => {
      isCollapse.value = true;
      // 平滑滚动到顶部
      scrollToTop();
    };

    // 数据展开
    const onExpandData = () => {
      isCollapse.value = false;
    };

    // 绘制向上折叠图标
    const upIcon = () => {
      return (
        <div class={ns.e('collapse-expand-icon')}>
          <i
            class='fa fa-angle-double-up'
            title={ibiz.i18n.t('control.common.collapseData')}
            onClick={onCollapseData}
            aria-hidden='true'
          ></i>
        </div>
      );
    };

    // 绘制向下展开图标
    const downIcon = () => {
      return (
        <div class={ns.e('collapse-expand-icon')}>
          <i
            class='fa fa-angle-double-down'
            title={ibiz.i18n.t('control.common.expandData')}
            onClick={onExpandData}
            aria-hidden='true'
          ></i>
        </div>
      );
    };

    // 加载更多
    const loadMoreIcon = () => {
      return (
        <div class={ns.e('load-more')}>
          <i
            class='fa fa-angle-double-down'
            title={ibiz.i18n.t('control.common.loadMore')}
            onClick={() => c.loadMore()}
            aria-hidden='true'
          ></i>
        </div>
      );
    };

    // 绘制有数据的时候的呈现
    const renderHasData = (): VNode => {
      return (
        <div
          class={ns.e('content')}
          ref={'infiniteScroll'}
          infinite-scroll-distance={10}
          v-infinite-scroll={(): Promise<void> => c.loadMore()}
          infinite-scroll-disabled={isLodeMoreDisabled.value}
          key={infiniteScrollKey.value}
        >
          {renderDataViewContent()}
        </div>
      );
    };

    // 绘制批操作工具栏
    const renderBatchToolBar = (): VNode | undefined => {
      const ctrlModel = c.model.controls?.find(item => {
        return item.name === `${c.model.name!}_batchtoolbar`;
      });
      if (!ctrlModel) return;
      return (
        <div class={ns.e('batchtoolbar')}>
          <iBizToolbarControl
            modelData={ctrlModel}
            context={c.context}
            params={c.params}
          ></iBizToolbarControl>
        </div>
      );
    };

    const renderNoData = (): VNode | undefined => {
      // 未加载不显示无数据
      const { isLoaded } = c.state;
      if (!isLoaded) return;
      const ctrlModel = c.model.controls?.find(item => {
        return item.name === `${c.model.name!}_quicktoolbar`;
      });
      if (ctrlModel) {
        return (
          <iBizToolbarControl
            modelData={ctrlModel}
            context={c.context}
            params={c.params}
            class={ns.e('quicktoolbar')}
          ></iBizToolbarControl>
        );
      }
      const noDataSlots: IParams = {};
      if (hasEmptyPanelRenderer(c)) {
        Object.assign(noDataSlots, {
          customRender: () => (
            <IBizCustomRender controller={c}></IBizCustomRender>
          ),
        });
      }
      return (
        <iBizNoData
          class={ns.e('content')}
          text={c.model.emptyText}
          emptyTextLanguageRes={c.model.emptyTextLanguageRes}
          hideNoDataImage={c.state.hideNoDataImage}
        >
          {noDataSlots}
        </iBizNoData>
      );
    };

    // 绘制折叠展开图标,当分页栏模式为[滚动加载]或者[点击加载]的时候，统一控制折叠或伸缩图标的显示
    // 当为滚动加载时，只要进行了第二次加载，就会出现一个折叠图标，点击时，数据将会折叠起来，只显示第一次加载的数据量，折叠时，点击展开图标，已加载的数据会完整显示
    // 当为点击加载时，页面底部会有一个继续加载按钮图标，点击时就会继续加载后续数据，直到完全加载完数据后，[加载更多]图标会隐藏，
    // 折叠图标会显示，点击折叠图标会折叠数据，折叠后,显示展开图标，点击展开图标，已加载的数据会完整显示
    const renderCollapseExpandIcon = () => {
      let icon = null;
      const loadMore = !(
        c.state.items.length >= c.state.total || c.state.total <= c.state.size
      );
      if (showCollapseOrExpandIcon.value) {
        if (c.model.pagingMode === 2) {
          if (isCollapse.value) {
            icon = downIcon();
          } else if (c.state.items.length > c.state.size) {
            icon = upIcon();
          }
        }
        if (c.model.pagingMode === 3) {
          if (isCollapse.value) {
            icon = downIcon();
          } else if (loadMore) {
            icon = loadMoreIcon();
          } else if (c.state.isCreated && c.state.items.length > c.state.size) {
            icon = upIcon();
          }
        }
      }
      return icon;
    };

    /**
     * 绘制内置导航图标
     *
     * @return {*}
     */
    const renderNavIcon = () => {
      const { enableNavView, showNavIcon, showNavView } = c.state;
      if (enableNavView && showNavIcon)
        return !showNavView ? (
          <ion-icon
            name='eye-outline'
            class={ns.e('nav-icon')}
            title={ibiz.i18n.t('component.controlNavigation.showNav')}
            onClick={() => c.onShowNavViewChange()}
          ></ion-icon>
        ) : (
          <ion-icon
            name='eye-off-outline'
            class={ns.e('nav-icon')}
            title={ibiz.i18n.t('component.controlNavigation.hiddenNav')}
            onClick={() => c.onShowNavViewChange()}
          ></ion-icon>
        );
    };

    /**
     * 绘制排序栏
     *
     * @return {*}
     */
    const renderSortBar = () => {
      if (!c.state.noSort)
        return (
          <iBizSortBar
            onSortChange={(item: ISortItem, order: 'asc' | 'desc') => {
              c.setSort(item.key, order);
              c.load({
                isInitialLoad:
                  c.model.pagingMode === 2 || c.model.pagingMode === 3,
              });
            }}
            sortItems={c.state.sortItems}
          ></iBizSortBar>
        );
    };

    /**
     * 绘制内容
     *
     */
    const renderContent = () => {
      return [
        c.state.items.length > 0 ? renderHasData() : renderNoData(),
        renderBatchToolBar(),
        renderNavIcon(),
        renderCollapseExpandIcon(),
      ];
    };

    /**
     * 绘制分页栏
     *
     * @return {*}
     */
    const renderPagingBar = () => {
      if (c.state.enablePagingBar && c.model.pagingMode === 1)
        return (
          <iBizPagination
            class={ns.e('pagination')}
            total={c.state.total}
            curPage={c.state.curPage}
            size={c.state.size}
            totalPages={c.state.totalPages}
            onChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onPageRefresh={onPageRefresh}
          ></iBizPagination>
        );
    };

    /**
     * 绘制搜索栏
     *
     * @return {*}
     */
    const renderSearchBar = () => {
      const searchbar = getControl(c.view.model, 'searchbar');
      if (!searchbar) return;
      const id = searchbar.name! || searchbar.id!;
      const provider = c.view.providers[id];
      return h(resolveComponent(provider?.component || 'IBizControlShell'), {
        context: c.view.context,
        params: c.view.params,
        modelData: searchbar,
        ...(c.view.slotProps[id] || {}),
        provider,
      });
    };

    /**
     * 绘制默认样式
     *
     * @return {*}
     */
    const renderDefaultStyle = () => {
      if (c.state.isCreated)
        return [renderSortBar(), ...renderContent(), renderPagingBar()];
    };

    /**
     * 绘制自定义样式
     *
     * @return {*}
     */
    const renderUserStyle = () => {
      return {
        sortbar: () => renderSortBar(),
        searchbar: () => renderSearchBar(),
        dataview: () => (
          <div class={ns.e('layout-content')}>{renderContent()}</div>
        ),
        pagingbar: () => renderPagingBar(),
      };
    };

    const renderLayoutByStyle = () => {
      if (cardStyle.value === 'userstyle') return renderUserStyle();
      return renderDefaultStyle();
    };

    return {
      c,
      ns,
      classNames,
      infiniteScroll,
      renderLayoutByStyle,
    };
  },
  render() {
    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          class={[this.ns.is('enable-page', !!this.c.state.enablePagingBar)]}
          controller={this.c}
        >
          {this.renderLayoutByStyle()}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
