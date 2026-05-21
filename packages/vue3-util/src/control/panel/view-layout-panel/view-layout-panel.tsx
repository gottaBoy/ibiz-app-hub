import {
  defineComponent,
  PropType,
  resolveComponent,
  h,
  VNode,
  reactive,
  watch,
  provide,
  renderSlot,
} from 'vue';
import {
  IPanelContainer,
  IPanelField,
  IPanelItem,
  IPanelTabPanel,
  IViewLayoutPanel,
} from '@ibiz/model-core';
import './view-layout-panel.scss';
import {
  IController,
  IControlProvider,
  IPanelItemController,
  IPanelItemProvider,
  isDataContainer,
  isSimpleDataContainer,
  ScriptFactory,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';
import { useControlController, useNamespace } from '../../../use';

/**
 * 绘制成员的attrs
 * @author lxm
 * @date 2024-03-19 03:48:00
 * @param {IDEFormDetail} model
 * @return {*}  {IParams}
 */
function renderAttrs(
  model: IPanelItem,
  controller: IPanelItemController,
): IParams {
  const attrs: IParams = {};
  model.controlAttributes?.forEach(item => {
    if (item.attrName && item.attrValue) {
      attrs[item.attrName!] = ScriptFactory.execSingleLine(item.attrValue!, {
        ...controller.panel.getEventArgs(),
        data: controller.data,
      });
    }
  });
  return attrs;
}

/**
 * 视图布局面板组件
 */
export const ViewLayoutPanelControl = defineComponent({
  name: 'IBizViewLayoutPanelControl',
  props: {
    /**
     * @description 视图布局面板模型
     */
    modelData: {
      type: Object as PropType<IViewLayoutPanel>,
      required: true,
    },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @ignoredoc
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 容器控制器,为上层部件控制器或视图控制器
     */
    container: { type: Object as PropType<IController> },
    /**
     * @description 面板容器数据
     */
    data: { type: Object as PropType<IData> },
  },
  setup(props, { slots }) {
    const c = useControlController(
      (...args) => new ViewLayoutPanelController(...args, props.container),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    watch(
      () => props.data,
      newVal => {
        if (newVal) {
          c.setInputData(newVal);
          c.load();
        }
      },
      {
        immediate: true,
      },
    );

    c.evt.on('onCreated', () => {
      // 面板成员state响应式
      const keys = Object.keys(c.panelItems);
      keys.forEach(key => {
        const panelItem = c.panelItems[key];
        panelItem.state = reactive(panelItem.state);
      });
    });

    /**
     * 绘制面板成员
     * @author lxm
     * @date 2023-08-25 04:09:07
     * @param {IPanelItem} panelItem
     * @return {*}  {(VNode | null)}
     */
    const renderPanelItem = (
      panelItem: IPanelItem,
      options?: {
        providers: {
          [key: string]: IPanelItemProvider;
        };
        panelItems: {
          [key: string]: IPanelItemController;
        };
      },
    ): VNode | null => {
      if ((panelItem as IPanelField).hidden) {
        return null;
      }
      const { providers, panelItems } = options || c;
      const provider = providers[panelItem.id!];
      if (!provider) {
        return (
          <div>
            {ibiz.i18n.t('vue3Util.control.unsupportedPanel', {
              id: panelItem.id,
              itemType: panelItem.itemType,
            })}
          </div>
        );
      }
      // 面板项插槽，排除部件占位
      if (panelItem.itemType !== 'CTRLPOS' && slots[panelItem.id!]) {
        return renderSlot(slots, panelItem.id!, {
          model: panelItem,
          data: c.data,
          value: c.data[panelItem.id!],
          controller: panelItems[panelItem.id!],
        });
      }
      const component = resolveComponent(provider.component);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let children: any;
      // 占位类型成员填充外部对应的插槽。
      if (panelItem.itemType === 'CTRLPOS' && slots[panelItem.id!]) {
        const panelItemC = panelItems[panelItem.id!]!;
        if (
          panelItemC.parent &&
          isSimpleDataContainer(panelItemC.parent.model)
        ) {
          children = () => {
            return slots[panelItem.id!]!({
              isSimple: true,
              data: panelItemC.data,
            });
          };
        } else {
          children = () => slots[panelItem.id!]!();
        }
      } else if (
        panelItem.itemType === 'TABPANEL' &&
        (panelItem as IPanelTabPanel).panelTabPages?.length
      ) {
        children = () => {
          return (panelItem as IPanelTabPanel).panelTabPages!.map(child => {
            return renderPanelItem(child, options);
          });
        };
      } else if (isDataContainer(panelItem)) {
        // 单项数据容器，多项数据容器不给子
        children = undefined;
      } else if ((panelItem as IPanelContainer).panelItems?.length) {
        children = () => {
          return (panelItem as IPanelContainer).panelItems!.map(child => {
            return renderPanelItem(child, options);
          });
        };
      }

      // 直接样式
      let tempStyle = '';
      if (panelItem.cssStyle) {
        tempStyle = panelItem.cssStyle;
      }
      const panelItemC = panelItems[panelItem.id!]!;

      const attrs = renderAttrs(panelItem, panelItemC);

      // 动态样式
      if (attrs.dynamicstyle) {
        if (typeof attrs.dynamicstyle === 'object') {
          tempStyle += Object.entries(attrs.dynamicstyle)
            .map(([key, value]) => {
              return `${key}:${value};`;
            })
            .join('');
        } else {
          tempStyle += attrs.dynamicstyle;
        }
        delete attrs.dynamicstyle;
      }
      return h(
        component,
        {
          modelData: panelItem,
          controller: panelItemC,
          key: panelItem.id,
          style: tempStyle,
          attrs,
        },
        children,
      );
    };

    provide('renderPanelItem', renderPanelItem);

    return { c, ns, renderPanelItem };
  },
  render() {
    const { state, model } = this.c;

    return (
      <iBizControlBase controller={this.c}>
        <iBizRow class={this.ns.b('content')} layout={{ layout: 'FLEX' }}>
          {state.isCreated &&
            (this.$slots.default
              ? this.$slots.default({
                  panelItems: this.c.panelItems,
                })
              : model.rootPanelItems?.map(panelItem => {
                  const subC = this.c.panelItems[panelItem.id!];
                  // 视图布局面板的子默认布局改成flex
                  // eslint-disable-next-line no-param-reassign
                  panelItem.layoutPos!.layout = 'FLEX';
                  return (
                    <iBizCol layoutPos={panelItem.layoutPos} state={subC.state}>
                      {this.renderPanelItem(panelItem)}
                    </iBizCol>
                  );
                }))}
        </iBizRow>
      </iBizControlBase>
    );
  },
});
