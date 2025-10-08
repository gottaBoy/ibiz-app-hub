import { Namespace } from '@ibiz-template/core';
import { ListController, MDCtrlController } from '@ibiz-template/runtime';
import { VNode } from 'vue';
import { ILayoutPanel } from '@ibiz/model-core';
import { JSX } from 'vue/jsx-runtime';

/**
 * 列表绘制工具
 *
 * @author zk
 * @date 2023-12-06 03:12:00
 * @export
 * @param {IData} props
 * @param {(IMobMDCtrlController | IListController)} c
 * @param {Namespace} ns
 * @return {*}  {({
 *   renderItem: (row: IData) => VNode | undefined;
 *   render: () => VNode | null;
 *   renderNoData: () => VNode | undefined;
 * })}
 */
export function useListRender(
  props: IData,
  c: MDCtrlController | ListController,
  ns: Namespace,
): {
  renderItem: (row: IData) => VNode | undefined;
  renderNoData: () => VNode | undefined;
  renderLoadMore: () => JSX.Element | null;
} {
  const isSelect = (row: IData) => {
    const findIndex = c.state.selectedData.findIndex(data => {
      return data.srfkey === row.srfkey;
    });
    return findIndex !== -1;
  };

  const calcItemClass = (row: IData) => {
    const select = isSelect(row);
    const itemClass = [ns.b('item'), ns.is('active', select)];
    return itemClass;
  };

  const calcItemStyle = (row: IData) => {
    const cardStyle = {};
    Object.assign(
      cardStyle,
      ns.cssVarBlock({
        'item-bg-color': `${row.bgcolor || ''}`,
        'item-font-color': `${row.fontcolor || ''}`,
        'item-hover-color': `${row.hovercolor || ''}`,
        'item-active-color': `${row.activecolor || ''}`,
      }),
    );
    return cardStyle;
  };

  const renderRightSlot = (row: IData) => {
    const select = isSelect(row);
    return <van-checkbox class={ns.bm('item', 'right')} checked={select} />;
  };

  const renderIcon = (row: IData) => {
    return <img class={ns.b('image')} src={row.image} alt='' />;
  };

  // 绘制项内容
  const renderItemContent = (row: IData): VNode => {
    const itemClass = calcItemClass(row);
    const itemStyle = calcItemStyle(row);
    const slotOption = {};
    if (Object.prototype.hasOwnProperty.call(row, 'image')) {
      Object.assign(slotOption, { icon: renderIcon(row) });
    }
    if (props.mode === 'SELECT') {
      Object.assign(slotOption, { 'right-icon': renderRightSlot(row) });
    }
    return (
      <van-cell
        class={itemClass}
        style={itemStyle}
        is-link
        title={row.srfmajortext || ''}
        onClick={(event: MouseEvent) => c.onRowClick(row, event)}
      >
        {slotOption}
      </van-cell>
    );
  };

  // 绘制项布局面板
  const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
    const { context, params } = c;
    const itemClass = calcItemClass(item);
    const itemStyle = calcItemStyle(item);

    const content = (
      <iBizControlShell
        data={item}
        class={itemClass}
        style={itemStyle}
        modelData={modelData}
        context={context}
        params={params}
        onClick={(event: MouseEvent) => c.onRowClick(item, event)}
      ></iBizControlShell>
    );

    if (props.mode === 'SELECT') {
      return (
        <div class={ns.b('select-item')}>
          <van-checkbox
            checked={isSelect(item)}
            onClick={(event: MouseEvent) => c.onRowClick(item, event)}
          ></van-checkbox>
          {content}
        </div>
      );
    }

    return content;
  };

  // 绘制默认列表项
  const renderItem = (row: IData): VNode | undefined => {
    const panel = c.model.itemLayoutPanel;
    return props.modelData.name !== 'simplelist' && panel
      ? renderPanelItem(row, panel)
      : renderItemContent(row);
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

  // 加载更多
  const loadMoreIcon = () => {
    return (
      <div class={ns.b('load-more')} onClick={() => c.loadMore()}>
        <span>{ibiz.i18n.t('control.common.loadMore')}</span>
      </div>
    );
  };

  // 分页模式为点击加载时并且当前数量小于总数
  const renderLoadMore = () => {
    let icon = null;
    const loadMore =
      c.state.items.length < c.state.total && c.state.total > c.state.size;
    if (loadMore) {
      icon = loadMoreIcon();
    }
    return icon;
  };

  return { renderNoData, renderItem, renderLoadMore };
}
