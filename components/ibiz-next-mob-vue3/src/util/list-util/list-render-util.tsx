import { Namespace } from '@ibiz-template/core';
import {
  ControlVO,
  MDControlController,
  MDCtrlController,
} from '@ibiz-template/runtime';
import { computed, Ref, ref, renderSlot, Slots, VNode, watch } from 'vue';
import { IDEMobMDCtrl, ILayoutPanel } from '@ibiz/model-core';
import { JSX } from 'vue/jsx-runtime';

export function useListRender(
  props: IData,
  c: MDControlController,
  ns: Namespace,
  _slots: Slots,
): {
  enableLoadMore: Ref<boolean>;
  renderItem: (row: IData) => VNode | undefined;
  renderNoData: () => VNode | undefined;
  renderLoadMore: () => JSX.Element | null;
  renderAddItem: (group?: IData) => JSX.Element | null;
  renderScrollList: (slots: IData) => JSX.Element | null;
  renderGroup: (slots: IData) => JSX.Element;
} {
  const {
    name,
    groupMode,
    emptyText,
    pagingMode,
    controlStyle,
    controls = [],
    itemLayoutPanel,
    enablePagingBar,
    emptyTextLanguageRes,
  } = c.model as IDEMobMDCtrl;

  // 是否加载失败，用于列表下拉加载失败时点击重新加载
  const isLoadError = ref(false);

  // 是否加载完成,用于判断数据加载（启用分页栏或加载更多时禁用滚动加载）
  const isLodeFinished = ref(enablePagingBar === true || pagingMode === 3);

  // 是否加载更多，根据已加载数据与总数据条数判断
  const enableLoadMore = computed(() => {
    return c.state.items.length < c.state.total && c.state.total > c.state.size;
  });

  // 是否正在更新
  const isUpdating = ref(false);

  // 加载完成后计算是否存在剩余数据
  c.evt.on('onLoadSuccess', () => {
    if (!enablePagingBar && pagingMode !== 3) {
      isLodeFinished.value =
        c.state.items.length >= c.state.total || c.state.total <= c.state.size;
    }
  });

  c.evt.on('onLoadError', () => {
    isLoadError.value = true;
    // 加载失败时重新加载当前页
    c.state.curPage -= 1;
  });

  // 本地数据模式
  const initSimpleData = (): void => {
    if (!props.data) {
      return;
    }
    c.state.items = (props.data as IData[]).map(item => new ControlVO(item));
    c.afterLoad({}, c.state.items as ControlVO[]);
  };

  c.evt.on('onCreated', async () => {
    if (props.isSimple) {
      initSimpleData();
      c.state.isSimple = true;
      c.state.isLoaded = true;
    }
  });

  c.evt.on('onLoadSuccess', () => {
    isUpdating.value = true;
    window.requestAnimationFrame(() => {
      isUpdating.value = false;
    });
  });

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
        'color-bg': `${row.bgcolor || ''}`,
        'color-text': `${row.fontcolor || ''}`,
        'color-item-active': `${row.activecolor || ''}`,
      }),
    );
    return cardStyle;
  };

  const renderRightSlot = (row: IData) => {
    const select = isSelect(row);
    return <van-checkbox class={ns.be('item', 'right')} checked={select} />;
  };

  const renderIcon = (row: IData) => {
    return <img class={ns.b('image')} src={row.image} alt='' />;
  };

  // 绘制项内容
  const renderItemContent = (row: IData): VNode => {
    if (_slots.default) {
      return renderSlot(_slots, 'default', { row, controller: c });
    }
    const itemClass = calcItemClass(row);
    const itemStyle = calcItemStyle(row);
    const slotOption = {};
    if (Object.prototype.hasOwnProperty.call(row, 'image') && row.image) {
      Object.assign(slotOption, { icon: renderIcon(row) });
    }
    if (props.mode === 'SELECT') {
      Object.assign(slotOption, { icon: renderRightSlot(row) });
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
    if (props.mode !== 'SELECT' && controlStyle !== 'EXTVIEW1') {
      itemClass.push('van-hairline--bottom');
    }

    const content = (
      <iBizControlShell
        data={item}
        class={itemClass}
        style={itemStyle}
        modelData={modelData}
        context={context}
        params={params}
        onClick={(event: MouseEvent) => c.onRowClick(item, event)}
      >
        {_slots}
      </iBizControlShell>
    );

    if (props.mode === 'SELECT') {
      const classNames = [ns.b('select-item'), ns.is('active', isSelect(item))];
      if (controlStyle !== 'EXTVIEW1') {
        classNames.push('van-hairline--bottom');
      }
      return (
        <div class={classNames}>
          <van-checkbox
            class={ns.be('select-item', 'left')}
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
    return props.modelData.name !== 'simplelist' && itemLayoutPanel
      ? renderPanelItem(row, itemLayoutPanel)
      : renderItemContent(row);
  };

  const renderNoData = (): VNode | undefined => {
    // 未加载不显示无数据
    const { isLoaded } = c.state;
    if (!isLoaded) {
      return;
    }
    const ctrlModel = controls.find(item => {
      return item.name === `${name!}_quicktoolbar`;
    });
    if (ctrlModel) {
      return (
        <iBizToolbarControl
          modelData={ctrlModel}
          context={c.context}
          params={c.params}
          class={ns.b('quicktoolbar')}
        ></iBizToolbarControl>
      );
    }
    return (
      isLoaded && (
        <iBizNoData
          text={emptyText}
          emptyTextLanguageRes={emptyTextLanguageRes}
        ></iBizNoData>
      )
    );
  };

  // 分页模式为加载更多时并且当前数量小于总数
  const renderLoadMore = () => {
    let icon = null;
    if (pagingMode === 3 && enableLoadMore.value) {
      icon = <iBizAddMore onClick={() => c.loadMore()}></iBizAddMore>;
    }
    return icon;
  };

  // 添加项
  const renderAddItem = (group?: IData) => {
    if (!(c as MDCtrlController).enableNew) {
      return null;
    }
    return (
      <iBizAddBtn
        onAddClick={(event: PointerEvent) => {
          (c as MDCtrlController).onClickNew(event, group?.key);
        }}
      ></iBizAddBtn>
    );
  };

  // 是否触发加载更多
  const isLoadMore = ref(false);

  const renderScrollList = (slots: IData) => {
    if (!c.state.isLoaded) return null;
    const disabled =
      enablePagingBar === true || pagingMode !== 2 || groupMode !== 'NONE';
    return (
      <van-list
        class={[
          ns.e('content'),
          ns.is('show-under-line', controlStyle !== 'EXTVIEW1'),
        ]}
        offset={50}
        disabled={disabled}
        finished={isLodeFinished.value}
        v-model:error={isLoadError.value}
        loading={c.state.isLoading || isUpdating.value}
        finished-text={
          isLoadMore.value && !disabled
            ? ibiz.i18n.t('control.common.loadFinish')
            : undefined
        }
        loading-text={ibiz.i18n.t('control.common.loadMore')}
        error-text={ibiz.i18n.t('control.common.loadError')}
        onLoad={() => {
          isLoadMore.value = true;
          c.loadMore();
        }}
      >
        {slots}
        {renderLoadMore()}
      </van-list>
    );
  };

  const renderGroup = (slots: IData) => {
    const showGroupAnchor =
      c.state.groups.length > 1 && (c as MDCtrlController).showGroupAnchor;
    const content = (
      <div class={ns.b('group')}>
        <div class={ns.be('group', 'container')}>
          {c.state.groups.map(group => {
            let header = (
              <div class={ns.be('group', 'caption')}> {group.caption}</div>
            );
            if (showGroupAnchor) {
              header = (
                <van-index-anchor index={group.caption}>
                  {header}
                </van-index-anchor>
              );
            }
            return (
              <div title={group.caption}>
                {header}
                <div class={ns.be('group', 'item')} title={group.caption}>
                  {slots.children && slots.children(group.children)}
                  {renderAddItem(group)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    if (showGroupAnchor) {
      const indexList = c.state.groups.map(x => x.caption);
      return (
        <van-index-bar
          sticky={false}
          class={ns.e('anchor')}
          index-list={indexList}
        >
          {content}
        </van-index-bar>
      );
    }
    return content;
  };

  return {
    enableLoadMore,
    renderNoData,
    renderItem,
    renderLoadMore,
    renderAddItem,
    renderScrollList,
    renderGroup,
  };
}
