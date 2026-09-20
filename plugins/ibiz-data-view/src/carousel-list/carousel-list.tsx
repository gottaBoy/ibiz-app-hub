import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  defineComponent,
  PropType,
  computed,
  VNode,
  ref,
  watch,
  Ref,
  resolveComponent,
  h,
} from 'vue';
import { IDEList, ILayoutPanel, IPanel } from '@ibiz/model-core';
import { isNil } from 'lodash-es';
import { createUUID } from 'qx-util';
import { IControlProvider, IApiMDControlGroupState } from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import './carousel-list.scss';
import { CarouselListController } from './carousel-list.controller';

export const CarouselList = defineComponent({
  name: 'CarouselList',
  props: {
    modelData: { type: Object as PropType<IDEList>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * 部件行数据默认激活模式
     * - 0 不激活
     * - 1 单击激活
     * - 2 双击激活(默认值)
     *
     * @type {(number | 0 | 1 | 2)}
     */
    mdctrlActiveMode: { type: Number, default: undefined },

    /**
     * 是否为单选
     * - true 单选
     * - false 多选
     *
     * @type {(Boolean)}
     */
    singleSelect: { type: Boolean, default: undefined },
    isSimple: { type: Boolean, required: false },
    loadDefault: { type: Boolean, default: true },
  },
  setup(props) {
    const c = useControlController(
      (...args) => new CarouselListController(...args),
    );
    const ns = useNamespace('carousel-list');
    const moveSpeed = ref(c.moveSpeed); // 指列表在默认滚动模式下多少秒内整体完成一次上下滚动，默认20秒，或者在步骤模式下多少秒滚动一次，默认2秒
    const allowRoll = ref(false); // 是否允许滚动
    const rollMode = ref(c.rollMode);
    const carouselContainer = ref();
    const timer: Ref<NodeJS.Timeout | undefined> = ref();

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

    // 无限滚动元素
    const infiniteScroll = ref<IData>();
    // 无限滚动元素标识
    const infiniteScrollKey = ref<string>(createUUID());

    // 分组默认展开项
    const defaultOpens = ref();
    if (c.controlParams.defaultexpandall === 'true') {
      watch(
        () => c.state.groups,
        () => {
          if (c.state.groups.length > 0) {
            defaultOpens.value = c.state.groups.map((x: IData) => x.key);
          }
        },
      );
      defaultOpens.value = c.state.groups.map((x: IData) => x.key);
    }

    // 整体滚动样式
    const moveStyle = computed(() => {
      if (!allowRoll.value || rollMode.value !== 'DEFAULT') {
        return {};
      }
      const style = {
        flex: 'none',
        height: 'auto',
      };
      Object.assign(style, {
        animation: `scroll-top ${moveSpeed.value}s linear infinite`,
      });
      return style;
    });

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

    // 绘制项布局面板
    const renderPanelItem = (item: IData, modelData: ILayoutPanel): VNode => {
      const { context, params } = c;
      // 是否选中数据
      const findIndex = c.state.selectedData.findIndex((data: IData) => {
        return data.srfkey === item.srfkey;
      });
      const itemClass = [ns.b('item'), ns.is('active', findIndex !== -1)];
      return (
        <iBizControlShell
          class={itemClass}
          style=''
          data={item}
          modelData={modelData}
          context={context}
          params={params}
          onClick={(): Promise<void> => c.onRowClick(item)}
          onDblclick={(): Promise<void> => c.onDbRowClick(item)}
        ></iBizControlShell>
      );
    };

    // 绘制默认列表项
    const renderDefaultItem = (item: IData): VNode => {
      // 是否选中数据
      const findIndex = c.state.selectedData.findIndex((data: IData) => {
        return data.srfkey === item.srfkey;
      });
      const itemClass = [ns.b('item'), ns.is('active', findIndex !== -1)];
      return (
        <div
          class={itemClass}
          key={item.srfkey}
          onClick={(): Promise<void> => c.onRowClick(item)}
          onDblclick={(): Promise<void> => c.onDbRowClick(item)}
        >
          {`${isNil(item.srfmajortext) ? '' : item.srfmajortext}`}
        </div>
      );
    };

    // 绘制分组
    const renderGroup = (group: IApiMDControlGroupState): VNode => {
      const panel = props.modelData.itemLayoutPanel;
      return (
        <el-collapse-item
          title={showTitle(group.caption)}
          class={ns.be('group-content', 'item')}
          name={group.key}
        >
          {group.children.length > 0 ? (
            group.children.map(item => {
              return panel
                ? renderPanelItem(item, panel)
                : renderDefaultItem(item);
            })
          ) : (
            <div class={ns.bem('group-content', 'item', 'empty')}>
              {ibiz.i18n.t('app.noData')}
            </div>
          )}
        </el-collapse-item>
      );
    };

    // 绘制项边框
    const renderItemBorder = (item: IData, panel: IPanel | undefined) => {
      const content = panel
        ? renderPanelItem(item, panel)
        : renderDefaultItem(item);
      if (c.borderStyle) {
        const borderDiv = resolveComponent(c.borderStyle);
        return h(borderDiv, {}, content);
      }
      return content;
    };

    // 绘制卡片内容
    const renderListContent = (): VNode => {
      if (c.model.enableGroup && !c.state.isSimple) {
        return (
          <el-collapse
            v-model={defaultOpens.value}
            class={[
              ns.b('group-content'),
              ns.b('content'),
              ns.is('allow-roll', allowRoll.value),
            ]}
            style={moveStyle.value}
          >
            {c.state.groups?.map(group => {
              return (
                <div class={[ns.b('scroll-item')]}>{renderGroup(group)}</div>
              );
            })}
          </el-collapse>
        );
      }
      const panel = props.modelData.itemLayoutPanel;

      return (
        <div
          class={[
            ns.b('scroll'),
            ns.b('content'),
            ns.is('allow-roll', allowRoll.value),
          ]}
          style={moveStyle.value}
          v-infinite-scroll={(): Promise<void> => c.loadMore()}
          infinite-scroll-distance={10}
          infinite-scroll-disabled={isLodeMoreDisabled.value}
          ref={'infiniteScroll'}
          key={infiniteScrollKey.value}
        >
          {c.state.items.map((item: IData, index: number) => {
            return (
              <div class={[ns.b('scroll-item')]}>
                {renderItemBorder(item, panel)}
              </div>
            );
          })}
          {allowRoll.value &&
            c.state.items.map((item: IData, index: number) => {
              return (
                <div class={[ns.b('scroll-item')]}>
                  {renderItemBorder(item, panel)}
                </div>
              );
            })}

          {c.model.pagingMode === 3 &&
            !(
              c.state.items.length >= c.state.total ||
              c.state.isLoading ||
              c.state.total <= c.state.size
            ) && (
              <div class={ns.e('load-more-button')}>
                <el-button text onClick={() => c.loadMore()}>
                  {ibiz.i18n.t('control.common.loadMore')}
                </el-button>
              </div>
            )}
        </div>
      );
    };

    // 绘制项行为
    const renderQuickToolBar = (): VNode | undefined => {
      const ctrlModel = c.model.controls?.find((item: IData) => {
        return item.name === `${c.model.name!}_quicktoolbar`;
      });
      if (!ctrlModel) {
        return;
      }
      return (
        <iBizToolbarControl
          modelData={ctrlModel}
          context={c.context}
          params={c.params}
        ></iBizToolbarControl>
      );
    };

    const renderBatchToolBar = (): VNode | undefined => {
      const ctrlModel = c.model.controls?.find((item: IData) => {
        return item.name === `${c.model.name!}_batchtoolbar`;
      });
      if (!ctrlModel) {
        return;
      }
      return (
        <div class={ns.b('batchtoolbar')}>
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
      if (!isLoaded) {
        return;
      }
      return (
        isLoaded && (
          <iBizNoData
            class={ns.b('content')}
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
            enableShowImage={c.state.hideNoDataImage}
          >
            {renderQuickToolBar()}
          </iBizNoData>
        )
      );
    };

    // 处理列表步骤模式滚动
    const handleListRoll = () => {
      clearInterval(timer.value);

      let length = 1;
      timer.value = setInterval(() => {
        const els = carouselContainer.value?.$el?.getElementsByClassName(
          ns.b('scroll-item'),
        );
        if (allowRoll.value && rollMode.value === 'STEP') {
          const height = (els[0] as HTMLElement).offsetHeight;
          (infiniteScroll.value as HTMLElement).scrollTo({
            top: height * length,
            behavior: 'smooth',
          });
          if (length >= c.state.items.length) {
            setTimeout(() => {
              (infiniteScroll.value as HTMLElement).scrollTo({
                top: 0,
                behavior: 'instant',
              });
            }, 500);
            length = 1;
          } else {
            length += 1;
          }
        } else {
          clearInterval(timer.value);
        }
      }, moveSpeed.value * 1000);
    };

    // 计算是否允许滚动
    const computeAllowRoll = () => {
      const els = carouselContainer.value?.$el?.getElementsByClassName(
        ns.b('scroll-item'),
      );
      if (!allowRoll.value && infiniteScroll.value && els && els.length) {
        const height = (els[0] as HTMLElement).offsetHeight;
        if (!height) {
          // 此时布局面板没加载完
          const tempTimer = setInterval(() => {
            if (
              (els[0] as HTMLElement).offsetHeight > 0 &&
              c.state.items.length * (els[0] as HTMLElement).offsetHeight >
                infiniteScroll.value!.clientHeight
            ) {
              allowRoll.value = true;
              handleListRoll();
              clearInterval(tempTimer);
            } else {
              clearInterval(tempTimer);
              clearInterval(timer.value);
            }
          }, 10);
        }
      }
    };

    watch(
      () => infiniteScroll.value,
      newVal => {
        if (newVal) {
          computeAllowRoll();
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    return {
      c,
      ns,
      carouselContainer,
      infiniteScroll,
      renderListContent,
      renderNoData,
      renderBatchToolBar,
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
          ></iBizPagination>
        ) : null,
      ];
    }

    return (
      <iBizControlBase
        class={[
          this.ns.is('enable-page', !!this.c.state.enablePagingBar),
          'test',
        ]}
        ref='carouselContainer'
        controller={this.c}
      >
        {content}
      </iBizControlBase>
    );
  },
});
