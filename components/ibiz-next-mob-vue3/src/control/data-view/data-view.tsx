import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, ref, VNode } from 'vue';
import {
  IDEDataView,
  ILayoutPanel,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  DataViewControlController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { usePagination } from '../../util';
import './data-view.scss';

export const DataViewControl = defineComponent({
  name: 'IBizDataViewControl',
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
     * @description 是否单选
     * @default true
     */
    singleSelect: { type: Boolean, default: true },
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
    const active = ref([]);

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

    const { onPageChange } = usePagination(c);

    // 是否显示数据伸缩图标
    // 如果未开启分组，并且加载模式为【加载更多】，并且已经加载过一次更多，则为 true
    const showCollapseOrExpandIcon = computed(() => {
      return !c.model.enableGroup && c.model.pagingMode === 3;
    });

    // 绘制项布局面板
    const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
      const { context, params } = c;
      return (
        <iBizControlShell
          data={item}
          modelData={modelData}
          context={context}
          params={params}
        ></iBizControlShell>
      );
    };

    // 绘制项行为
    const renderItemAction = (item: IData) => {
      return (
        <iBizActionToolbar
          class={ns.bem('item-content', 'bottom', 'actions')}
          action-details={c.getOptItemModel()}
          actions-state={c.state.uaState[item.srfkey]}
          onActionClick={(detail: IUIActionGroupDetail, event: MouseEvent) =>
            c.onActionClick(detail, item, event)
          }
        ></iBizActionToolbar>
      );
    };

    // 绘制默认项
    const renderFooter = (item: IData) => {
      return (
        <div class={ns.b('item-content')}>
          {c.getOptItemModel() ? (
            <div class={ns.be('item-content', 'bottom')}>
              {renderItemAction(item)}
            </div>
          ) : null}
        </div>
      );
    };

    const renderNoData = (): VNode | undefined => {
      // 未加载不显示无数据
      const { isLoaded } = c.state;
      if (!isLoaded) {
        return;
      }
      return (
        isLoaded && (
          <iBizNoData
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
          ></iBizNoData>
        )
      );
    };

    const renderDefaultItem = (item: IData) => {
      return (
        <van-card
          title={item.srfmajortext}
          desc={item.content}
          onClick={() => c.onRowClick(item)}
        >
          {{
            footer: () => renderFooter(item),
          }}
        </van-card>
      );
    };

    // 绘制卡片
    const renderCard = (item: IData) => {
      const model: IDEDataView = c.model;
      // 是否选中数据
      const findIndex = c.state.selectedData.findIndex(data => {
        return data.srfkey === item.srfkey;
      });
      const panel = props.modelData.itemLayoutPanel;
      const cardClass = [ns.b('item'), ns.is('active', findIndex !== -1)];
      const cardStyle = {};
      if (model.cardWidth) {
        Object.assign(cardStyle, {
          width: `${model.cardWidth}px`,
        });
      }
      if (model.cardHeight) {
        Object.assign(cardStyle, {
          height: `${model.cardHeight}px`,
        });
      }
      Object.assign(
        cardStyle,
        ns.cssVarBlock({
          'item-bg-color': `${item.bgcolor || ''}`,
          'item-font-color': `${item.fontcolor || ''}`,
          'item-hover-color': `${item.hovercolor || ''}`,
          'item-active-color': `${item.activecolor || ''}`,
        }),
      );
      return (
        <div
          class={cardClass}
          style={cardStyle}
          onClick={() => c.onRowClick(item)}
        >
          {panel ? renderPanelItem(item, panel) : renderDefaultItem(item)}
        </div>
      );
    };

    const renderDefault = () => {
      const { cardColMD } = c.model;
      if (cardColMD) {
        return (
          <van-row class={[ns.e('item-row')]}>
            {c.state.items.map(item => {
              return (
                <van-col span={cardColMD} class={[ns.e('item-col')]}>
                  {renderCard(item)}
                </van-col>
              );
            })}
          </van-row>
        );
      }
      return c.state.items.map(item => {
        return renderCard(item);
      });
    };

    const renderGroup = () => {
      return (
        <van-collapse v-model={active.value}>
          {c.state.groups.map((group, index) => {
            return (
              <van-collapse-item title={group.caption} name={index}>
                {group.children.map(item => {
                  return renderCard(item);
                })}
              </van-collapse-item>
            );
          })}
        </van-collapse>
      );
    };
    // 绘制卡片内容
    const renderMDContent = () => {
      const model: IDEDataView = c.model;
      return (
        <van-list
          class={[ns.b('scroll'), ns.e('content')]}
          finished={isLodeMoreDisabled.value}
          immediate-check={false}
          onLoad={() => c.loadMore()}
        >
          {model.groupMode !== 'NONE' ? renderGroup() : renderDefault()}
        </van-list>
      );
    };

    // 加载更多
    const loadMoreIcon = () => {
      return (
        <div class={ns.e('load-more')} onClick={() => c.loadMore()}>
          {ibiz.i18n.t('control.common.loadMore')}
        </div>
      );
    };

    // 分页模式为点击加载时并且当前数量小于总数
    const renderLoadMore = () => {
      let icon = null;
      const loadMore =
        c.state.items.length < c.state.total && c.state.total > c.state.size;
      if (showCollapseOrExpandIcon.value && loadMore) {
        icon = loadMoreIcon();
      }
      return icon;
    };

    return {
      c,
      ns,
      showCollapseOrExpandIcon,
      onPageChange,
      renderNoData,
      renderMDContent,
      renderLoadMore,
    };
  },
  render() {
    const enablePagingBar =
      this.c.state.enablePagingBar && this.c.model.pagingMode === 1;
    return (
      <iBizControlBase
        class={[
          this.ns.is(
            'enable-page',
            enablePagingBar || this.showCollapseOrExpandIcon,
          ),
        ]}
        controller={this.c}
      >
        {this.c.state.isCreated &&
          (this.c.state.items.length > 0
            ? this.renderMDContent()
            : this.renderNoData())}
        {enablePagingBar ? (
          <van-pagination
            class={this.ns.e('pagination')}
            total-items={this.c.state.total}
            model-value={this.c.state.curPage}
            items-per-page={this.c.state.size}
            page-count={this.c.state.totalPages}
            force-ellipses
            onChange={this.onPageChange}
          ></van-pagination>
        ) : null}
        {this.renderLoadMore()}
      </iBizControlBase>
    );
  },
});
