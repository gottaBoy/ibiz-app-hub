/* eslint-disable no-return-assign */
/* eslint-disable no-nested-ternary */
import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import { ref, VNode, watch, PropType, computed, defineComponent } from 'vue';
import { IDEList, ILayoutPanel, IUIActionGroupDetail } from '@ibiz/model-core';
import { isNil } from 'lodash-es';
import { createUUID } from 'qx-util';
import {
  ControlVO,
  ListController,
  IDragChangeInfo,
  IControlProvider,
  IMDControlGroupState,
} from '@ibiz-template/runtime';
import draggable from 'vuedraggable';
import { showTitle } from '@ibiz-template/core';
import { usePagination } from '../../util';
import './list.scss';

export const ListControl = defineComponent({
  name: 'IBizListControl',
  components: {
    draggable,
  },
  props: {
    /**
     * @description 列表模型数据
     */
    modelData: { type: Object as PropType<IDEList>, required: true },
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
    const c = useControlController((...args) => new ListController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    useControlPopoverzIndex(c);

    const { onPageChange, onPageRefresh, onPageSizeChange } = usePagination(c);

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

    // 是否为收缩状态
    const isCollapse = ref(false);

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
      scrollToTop();
    };

    // 数据展开
    const onExpandData = () => {
      isCollapse.value = false;
    };

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
        c.view.model.viewType === 'DELISTVIEW' &&
        c.state.mdctrlActiveMode === 1 &&
        c.state.singleSelect === true
      )
        selected = false;
      return selected;
    };

    /**
     * 切换选中状态
     *
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

    // 绘制项布局面板
    const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
      const { context, params } = c;
      return (
        <iBizControlShell
          data={item}
          params={params}
          context={context}
          class={ns.b('item')}
          modelData={modelData}
          onClick={(): Promise<void> => c.onRowClick(item)}
          onDblclick={(): Promise<void> => c.onDbRowClick(item)}
        ></iBizControlShell>
      );
    };

    // 绘制项行为
    const renderItemAction = (item: IData): VNode => {
      return (
        <iBizActionToolbar
          class={ns.bem('item', 'right', 'actions')}
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

    /**
     * @description 绘制新建项
     * @param {IMDControlGroupState} [group]
     * @returns {*}
     */
    const renderNewItem = (group?: IMDControlGroupState) => {
      return (
        <div
          title={ibiz.i18n.t('app.newlyBuild')}
          class={[ns.b('item'), ns.be('item', 'new')]}
          onClick={(event: MouseEvent) => {
            c.onClickNew(event, group?.key);
          }}
        >
          <ion-icon name='add-outline'></ion-icon>
        </div>
      );
    };

    // 绘制默认列表项
    const renderDefaultItem = (item: IData): VNode => {
      const actionModel = c.getOptItemModel();
      return (
        <div
          key={item.srfkey}
          class={ns.b('item')}
          onClick={(): Promise<void> => c.onRowClick(item)}
          onDblclick={(): Promise<void> => c.onDbRowClick(item)}
        >
          <span class={ns.be('item', 'caption')}>{`${
            isNil(item.srfmajortext) ? '' : item.srfmajortext
          }`}</span>

          {actionModel.length ? (
            <div class={ns.be('item', 'right')}>{renderItemAction(item)}</div>
          ) : null}
        </div>
      );
    };

    const renderGroupAction = (
      group: IMDControlGroupState,
    ): VNode | undefined => {
      if (c.model.groupUIActionGroup && group.groupActionGroupState) {
        return (
          <iBizActionToolbar
            zIndex={c.state.zIndex}
            class={ns.be('group-content', 'header-actions')}
            action-details={c.model.groupUIActionGroup.uiactionGroupDetails}
            actions-state={group.groupActionGroupState}
            onActionClick={(
              detail: IUIActionGroupDetail,
              event: MouseEvent,
            ) => {
              c.onGroupToolbarClick(detail, event, group);
            }}
          ></iBizActionToolbar>
        );
      }
    };

    /**
     * 绘制行明细
     *
     * @param {IData} item
     * @return {*}
     */
    const renderRowDetail = (item: IData) => {
      const { navAppViewId, navViewHeight } = c.model;
      const { context, params } = c.calcNavParams(item);
      const style = {
        height: navViewHeight ? `${navViewHeight}px` : 'auto',
      };
      return (
        <iBizViewShell
          style={style}
          params={params}
          context={context}
          viewId={navAppViewId}
          class={ns.be('row-detail', 'view')}
        />
      );
    };

    const renderItem = (item: IData) => {
      const cardStyle = ns.cssVarBlock({
        'item-bg-color': `${item.bgcolor || ''}`,
        'text-color': `${item.fontcolor || ''}`,
        'hover-bg-color': `${item.hovercolor || ''}`,
        'active-bg-color': `${item.activecolor || ''}`,
      });
      const panel = props.modelData.itemLayoutPanel;
      return (
        <div
          style={cardStyle}
          class={[ns.b('scroll-item'), ns.is('active', isSelected(item))]}
        >
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
          {c.model.controlStyle === 'EXTVIEW2' && !c.state.singleSelect && (
            <el-checkbox
              size='large'
              class={ns.be('scroll-item', 'checkbox')}
              modelValue={isSelected(item)}
              onChange={() => toggleSelection(item)}
            />
          )}
          {c.model.navAppViewId && c.state.showRowDetail && (
            <ion-icon
              name={
                item.__isExpand
                  ? 'chevron-down-outline'
                  : 'chevron-forward-outline'
              }
              class={ns.be('scroll-item', 'icon')}
              onClick={() => (item.__isExpand = !item.__isExpand)}
            ></ion-icon>
          )}
          {panel ? renderPanelItem(item, panel) : renderDefaultItem(item)}
        </div>
      );
    };

    /**
     * 绘制列表项
     *
     * @param {IData[]} items
     */
    const renderListItems = (
      items: IData[],
      group?: IMDControlGroupState,
      disabled: boolean = true,
    ) => {
      const { navAppViewId } = c.model;
      return (
        <draggable
          itemKey='srfkey'
          modelValue={items}
          group={c.model.id}
          handle={`.${ns.e('drag-icon')}`}
          class={[ns.e('layout-flex'), ns.em('layout-flex', 'draggable')]}
          disabled={disabled || c.state.updating || c.state.readonly}
          onChange={(evt: IData) => onDraggableChange(evt, group?.key)}
        >
          {{
            item: ({ element }: { element: IData }) => {
              if (navAppViewId && c.state.showRowDetail)
                return (
                  <div class={ns.b('row-detail')}>
                    {renderItem(element)}
                    {element.__isExpand && renderRowDetail(element)}
                  </div>
                );
              return renderItem(element);
            },
            footer: () => {
              if (c.enableNew && !c.state.readonly) return renderNewItem(group);
            },
          }}
        </draggable>
      );
    };

    /**
     * 绘制分组项
     *
     * @param {IMDControlGroupState} group
     * @return {*}  {VNode}
     */
    const renderGroup = (group: IMDControlGroupState): VNode => {
      return (
        <el-collapse-item
          class={ns.be('group-content', 'item')}
          name={group.key.toString()}
        >
          {{
            title: () => {
              return (
                <div class={ns.be('group-content', 'item-header')}>
                  <span class={ns.be('group-content', 'item-title')}>
                    {showTitle(group.caption)}
                  </span>
                  <span class={ns.be('group-content', 'item-action')}>
                    {renderGroupAction(group)}
                  </span>
                </div>
              );
            },
            default: () =>
              group.children.length > 0 ? (
                renderListItems(group.children, group, !c.state.draggable)
              ) : (
                <div class={ns.bem('group-content', 'item', 'empty')}>
                  {ibiz.i18n.t('app.noData')}
                </div>
              ),
          }}
        </el-collapse-item>
      );
    };

    /**
     * 绘制分组样式2项
     * @return {*}  {VNode[]}
     */
    const renderGroupStyle2 = (): VNode[] => {
      return c.state.groups?.map(group => {
        return (
          <div class={[ns.b('group-style2')]}>
            <div class={ns.be('group-style2', 'header')}>
              <div class={ns.bem('group-style2', 'header', 'title')}>
                {showTitle(group.caption)}
              </div>
            </div>
            <div class={ns.be('group-style2', 'content')}>
              {group.children.length > 0 ? (
                renderListItems(group.children)
              ) : (
                <div class={ns.bem('group-style2', 'content', 'empty')}>
                  {ibiz.i18n.t('app.noData')}
                </div>
              )}
            </div>
          </div>
        );
      });
    };

    // 绘制列表内容
    const renderListContent = (): VNode => {
      if (c.state.enableGroup && !c.state.isSimple) {
        if (c.model.groupStyle === 'STYLE2') {
          return (
            <div
              class={[
                ns.b('content'),
                ns.b('scroll'),
                ns.b('group-style2-content'),
              ]}
            >
              {renderGroupStyle2()}
            </div>
          );
        }

        return (
          <el-collapse
            v-model={c.state.expandedKeys}
            class={[
              ns.b('content'),
              ns.b('group-content'),
              ns.is('show-underLine', c.model.controlStyle !== 'EXTVIEW1'),
            ]}
          >
            {c.state.groups?.map(group => {
              return (
                <div class={[ns.b('group')]}>
                  {renderGroup(group as IMDControlGroupState)}
                </div>
              );
            })}
          </el-collapse>
        );
      }
      return (
        <div
          class={[
            ns.b('scroll'),
            ns.b('content'),
            ns.is('show-underLine', c.model.controlStyle !== 'EXTVIEW1'),
          ]}
          v-infinite-scroll={(): Promise<void> => c.loadMore()}
          infinite-scroll-distance={10}
          infinite-scroll-disabled={isLodeMoreDisabled.value}
          ref={'infiniteScroll'}
          key={infiniteScrollKey.value}
        >
          {renderListItems(
            isCollapse.value
              ? c.state.items.slice(0, c.state.size)
              : c.state.items,
            undefined,
            !c.enableEditOrder,
          )}
        </div>
      );
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
        isLoaded && (
          <iBizNoData
            class={ns.b('content')}
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
            hideNoDataImage={c.state.hideNoDataImage}
          >
            {noDataSlots}
          </iBizNoData>
        )
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

    return {
      c,
      ns,
      infiniteScroll,
      renderListContent,
      renderNoData,
      renderBatchToolBar,
      onPageChange,
      onPageRefresh,
      onPageSizeChange,
      renderCollapseExpandIcon,
    };
  },
  render() {
    let content = null;
    if (this.c.state.isCreated) {
      content = [
        this.c.state.items.length > 0
          ? this.renderListContent()
          : this.renderNoData(),
        this.renderBatchToolBar(),
        this.c.state.enablePagingBar && this.c.model.pagingMode === 1 ? (
          <iBizPagination
            class={this.ns.e('pagination')}
            total={this.c.state.total}
            curPage={this.c.state.curPage}
            size={this.c.state.size}
            totalPages={this.c.state.totalPages}
            onChange={this.onPageChange}
            onPageSizeChange={this.onPageSizeChange}
            onPageRefresh={this.onPageRefresh}
          ></iBizPagination>
        ) : null,
      ];
    }

    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          class={[this.ns.is('enable-page', !!this.c.state.enablePagingBar)]}
          controller={this.c}
        >
          {content}
          {this.c.state.enableNavView && this.c.state.showNavIcon ? (
            !this.c.state.showNavView ? (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.showNav')}
                name='eye-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            ) : (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.hiddenNav')}
                name='eye-off-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            )
          ) : null}
          {this.renderCollapseExpandIcon()}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
