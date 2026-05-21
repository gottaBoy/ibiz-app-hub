import {
  defineComponent,
  PropType,
  resolveComponent,
  h,
  VNode,
  reactive,
  ComponentPublicInstance,
  watch,
  provide,
  inject,
  renderSlot,
} from 'vue';
import {
  IPanel,
  IPanelContainer,
  IPanelField,
  IPanelItem,
  IPanelTabPanel,
} from '@ibiz/model-core';
import './panel.scss';
import {
  IControlProvider,
  IController,
  IPanelItemController,
  IPanelItemProvider,
  PanelController,
  ScriptFactory,
  isDataContainer,
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
 * 绘制面板成员
 *
 * @author lxm
 * @date 2023-02-07 05:58:43
 * @param {IPanelItem} panelItem
 * @param {PanelController} c
 * @returns {*}  {(VNode | undefined)}
 */
function renderPanelItem(
  panelItem: IPanelItem,
  c: PanelController,
  ins: ComponentPublicInstance,
): VNode | undefined {
  if ((panelItem as IPanelField).hidden) {
    return;
  }
  const { providers, panelItems } = c;
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
  const component = resolveComponent(provider.component);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let children: any;
  // 占位类型成员填充外部对应的插槽。
  if (panelItem.itemType === 'CTRLPOS' && ins.$slots[panelItem.id!]) {
    children = (): VNode[] => {
      return ins.$slots[panelItem.id!]!();
    };
  } else if (
    panelItem.itemType === 'TABPANEL' &&
    (panelItem as IPanelTabPanel).panelTabPages?.length
  ) {
    children = (): (VNode | undefined)[] => {
      return (panelItem as IPanelTabPanel).panelTabPages!.map(child => {
        return renderPanelItem(child, c, ins);
      });
    };
  } else if (isDataContainer(panelItem)) {
    // 单项数据容器，多项数据容器不给子
    children = undefined;
  } else if ((panelItem as IPanelContainer).panelItems?.length) {
    children = (): (VNode | undefined)[] => {
      return (panelItem as IPanelContainer).panelItems!.map(child => {
        return renderPanelItem(child, c, ins);
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
  if (ins?.$slots[panelItem.id!]) {
    return renderSlot(ins.$slots, panelItem.id!, {
      modelData: panelItem,
      controller: panelItemC,
      key: panelItem.id,
      style: tempStyle,
      attrs,
    });
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
}

/**
 * 视图布局面板组件
 */
export const PanelControl = defineComponent({
  name: 'IBizPanelControl',
  props: {
    /**
     * @description 面板模型数据
     */
    modelData: {
      type: Object as PropType<IPanel>,
      required: true,
    },
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
     * @description 容器控制器,为上层部件控制器或视图控制器
     */
    container: { type: Object as PropType<IController> },
    /**
     * @description 视图布局面板数据
     */
    data: { type: Object as PropType<IData> },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup(props) {
    const c = useControlController<PanelController>(
      (...args) => new PanelController(...args, props.container),
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
    // 获取上层的绘制函数
    const parentRenderPanelItem = inject<
      (
        panelItem: IPanelItem,
        options?: {
          providers: {
            [key: string]: IPanelItemProvider;
          };
          panelItems: {
            [key: string]: IPanelItemController;
          };
        },
      ) => VNode | null
    >('renderPanelItem')!;

    if (parentRenderPanelItem) {
      provide('renderPanelItem', parentRenderPanelItem);
    } else {
      provide('renderPanelItem', renderPanelItem);
    }

    return { c, ns };
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
                      {renderPanelItem(panelItem, this.c, this)}
                    </iBizCol>
                  );
                }))}
        </iBizRow>
      </iBizControlBase>
    );
  },
});
