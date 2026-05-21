import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, renderSlot, VNode } from 'vue';
import {
  IDEDataView,
  ILayoutPanel,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  DataViewControlController,
  IControlProvider,
} from '@ibiz-template/runtime';
import { useListRender, usePagination } from '../../util';
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
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
  },
  setup(props, { slots }) {
    const c = useControlController(
      (...args) => new DataViewControlController<IDEDataView>(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const {
      enableLoadMore,
      renderNoData,
      renderAddItem,
      renderScrollList,
      renderGroup,
    } = useListRender(props, c, ns, slots);

    const { onPageChange } = usePagination(c);

    // 绘制项布局面板
    const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
      const { context, params } = c;
      return (
        <iBizControlShell
          data={item}
          modelData={modelData}
          context={context}
          params={params}
        >
          {slots}
        </iBizControlShell>
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

    const renderDefaultItem = (item: IData) => {
      if (slots.default) {
        return renderSlot(slots, 'default', { item, controller: c });
      }
      return (
        <van-card title={item.srfmajortext} desc={item.content}>
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
      const itemSysCss = model.itemSysCss?.cssName || '';
      const cardClass = [
        ns.b('item'),
        ns.is('active', findIndex !== -1),
        itemSysCss,
      ];
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
          'color-bg': `${item.bgcolor || ''}`,
          'color-text': `${item.fontcolor || ''}`,
          'color-item-active': `${item.activecolor || ''}`,
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

    const renderContent = (items: IData[]) => {
      const { cardColMD } = c.model;
      if (cardColMD) {
        return (
          <van-row class={[ns.e('row')]}>
            {items.map(item => {
              return (
                <van-col span={cardColMD} class={[ns.e('item-col')]}>
                  {renderCard(item)}
                </van-col>
              );
            })}
          </van-row>
        );
      }
      return [
        ...items.map(item => {
          return renderCard(item);
        }),
      ];
    };

    const renderDefault = () => {
      const result = [];
      result.push(renderContent(c.state.items));
      if (c.enableNew) {
        result.push(renderAddItem());
      }
      return result;
    };

    // 绘制列表内容
    const renderMDContent = () => {
      // eslint-disable-next-line no-shadow
      const slots = c.enableGroup
        ? renderGroup({ children: renderContent })
        : renderDefault();
      return renderScrollList(slots);
    };

    return {
      c,
      ns,
      enableLoadMore,
      onPageChange,
      renderNoData,
      renderMDContent,
    };
  },
  render() {
    const enablePagingBar =
      this.c.state.enablePagingBar && this.c.model.pagingMode === 1;
    return (
      <iBizControlBase
        class={[
          this.ns.is('scroll', enablePagingBar),
          this.ns.is('enable-pagination', enablePagingBar),
          this.ns.is('enable-group', this.c.enableGroup),
        ]}
        controller={this.c}
      >
        <div class={this.ns.e('content-container')}>
          {this.c.state.isCreated &&
            (this.c.state.items.length > 0
              ? this.renderMDContent()
              : this.renderNoData())}
        </div>
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
      </iBizControlBase>
    );
  },
});
