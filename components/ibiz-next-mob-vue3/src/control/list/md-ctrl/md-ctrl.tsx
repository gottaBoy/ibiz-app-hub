import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, ref } from 'vue';
import {
  IDEMobMDCtrl,
  IDETBUIActionItem,
  IUIActionGroup,
} from '@ibiz/model-core';
import {
  IControlProvider,
  MDCtrlController,
  IMobMDCtrlRowState,
  getAllUIActionItems,
} from '@ibiz-template/runtime';
import { convertBtnType, useListRender, usePagination } from '../../../util';
import './md-ctrl.scss';

export const MDCtrlControl = defineComponent({
  name: 'IBizMDCtrlControl',
  props: {
    /**
     * @description 移动端多数据部件模型数据
     */
    modelData: { type: Object as PropType<IDEMobMDCtrl>, required: true },
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
     * @description 部件激活模式，值为0：无激活，值为1：单击激活，值为2：双击激活
     * @default 1
     */
    mdctrlActiveMode: { type: Number, default: 1 },
    /**
     * @description 是否单选
     * @default true
     */
    singleSelect: { type: Boolean, default: true },
    /**
     * @description 选择数据
     */
    selectedData: { type: Object as PropType<IData[]>, required: false },
    /**
     * @description 选择模式，值为SELECT时，列表项显示勾选图标
     * @default 'LIST'
     */
    mode: { type: String as PropType<'LIST' | 'SELECT'>, default: 'LIST' },
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
    const c = useControlController((...args) => new MDCtrlController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const {
      enableLoadMore,
      renderItem,
      renderNoData,
      renderAddItem,
      renderScrollList,
      renderGroup,
    } = useListRender(props, c, ns, slots);

    const { onPageChange } = usePagination(c);

    // 左滑界面行为组
    const leftSlidingActionGroup = ref();
    // 右滑界面行为组
    const rightSlidingActionGroup = ref();

    c.evt.on('onCreated', () => {
      // 适配动态界面行为组
      leftSlidingActionGroup.value = c.model.deuiactionGroup;
      rightSlidingActionGroup.value = c.model.deuiactionGroup2;
    });

    // 按钮样式转换
    const btnType = (item: IDETBUIActionItem) => {
      const _type = convertBtnType(item);
      return _type === 'default' ? 'primary' : _type;
    };

    // 绘制滑动行为组
    const renderSlidingActionGroup = (group: IUIActionGroup, data: IData) => {
      const groupDetails = getAllUIActionItems(group.uiactionGroupDetails);
      if (!groupDetails || groupDetails.length === 0) return null;
      const row = c.state.rows.find(
        (rowData: IMobMDCtrlRowState) => data.srfkey === rowData.data.srfkey,
      )!;
      const btnContainer = row.uaColStates[group.id!];
      return groupDetails.map(detail => {
        // 只绘制行为按钮，不绘制行为组按钮
        if (!detail.uiactionId) return null;
        const btn = btnContainer?.[detail.id!];
        const _type = btnType(detail);
        if (btn?.visible)
          return (
            <van-button
              square
              type={_type}
              disabled={btn.disabled || btn.loading}
              onClick={(e: MouseEvent) => c.onActionClick(detail, row, e)}
            >
              <iBizInfoItem
                icon={
                  detail.showIcon && (detail as IData).sysImage
                    ? (detail as IData).sysImage
                    : null
                }
                label={detail.showCaption ? detail.caption : null}
              />
            </van-button>
          );
        return null;
      });
    };

    // 绘制默认列表项
    const renderDefaultItem = (data: IData) => {
      const isItemSliding = !!(
        leftSlidingActionGroup.value || rightSlidingActionGroup.value
      );
      if (isItemSliding) {
        return (
          <van-swipe-cell key={data.srfkey} class={ns.b('slider-item')}>
            {{
              left: rightSlidingActionGroup.value
                ? () =>
                    renderSlidingActionGroup(
                      rightSlidingActionGroup.value,
                      data,
                    )
                : null,
              right: leftSlidingActionGroup.value
                ? () =>
                    renderSlidingActionGroup(leftSlidingActionGroup.value, data)
                : null,
              default: () => {
                return renderItem(data);
              },
            }}
          </van-swipe-cell>
        );
      }
      return renderItem(data);
    };

    const renderDefault = () => {
      const result = [];
      result.push(
        ...c.state.items.map((item: IData) => {
          return renderDefaultItem(item);
        }),
      );
      if (c.enableNew) {
        result.push(renderAddItem());
      }
      return result;
    };

    const renderGroupChildren = (children: IData[]) => {
      return children.map(item => {
        return renderDefaultItem(item.data);
      });
    };

    // 绘制列表内容
    const renderMDContent = () => {
      // eslint-disable-next-line no-shadow
      const slots = c.enableGroup
        ? renderGroup({ children: renderGroupChildren })
        : renderDefault();
      return renderScrollList(slots);
    };

    return {
      c,
      ns,
      enableLoadMore,
      renderMDContent,
      renderNoData,
      onPageChange,
    };
  },
  render() {
    const enablePagingBar = this.c.model.enablePagingBar;

    return (
      <iBizControlBase
        controller={this.c}
        class={[
          this.ns.is('scroll', enablePagingBar),
          this.ns.is(
            'enable-page',
            enablePagingBar || this.c.model.pagingMode === 3,
          ),
        ]}
      >
        {this.c.state.isCreated &&
          (this.c.state.rows.length > 0
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
      </iBizControlBase>
    );
  },
});
