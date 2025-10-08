import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  ConcreteComponent,
  defineComponent,
  h,
  PropType,
  resolveComponent,
  VNode,
} from 'vue';
import {
  IDashboard,
  IDBContainerPortletPart,
  IDBPortletPart,
} from '@ibiz/model-core';
import {
  DashboardController,
  IControlProvider,
  IPortletController,
} from '@ibiz-template/runtime';
import './dashboard.scss';

/**
 * 根据类型绘制数据看板成员
 *
 * @author lxm
 * @date 2022-10-14 17:10:42
 * @param {PortletPartModel} model 模型
 * @param {IData} opts 额外参数
 */
function renderPortletByType(
  model: IDBPortletPart,
  c: DashboardController,
  opts?: IData,
): VNode {
  const provider = c.providers[model.id!];
  const controller = c.portlets[model.id!];
  const commonProps = {
    modelData: model,
    controller,
  };

  if (!provider) {
    return (
      <div>
        {ibiz.i18n.t('app.noSupport')}
        {model.portletType}
      </div>
    );
  }

  const providerComp = resolveComponent(
    provider.component,
  ) as ConcreteComponent;
  // 绘制容器
  if (model.portletType === 'CONTAINER') {
    const container = model as IDBContainerPortletPart;
    return h(
      providerComp,
      {
        ...commonProps,
        key: model.id,
      },
      {
        default: () =>
          container.controls?.map(child => renderPortletByType(child, c, opts)),
      },
    );
  }
  // 绘制门户部件
  return h(providerComp, {
    ...commonProps,
    key: model.id,
  });
}

export const DashboardControl = defineComponent({
  name: 'IBizDashboardControl',
  props: {
    /**
     * @description 数据看板模型数据
     */
    modelData: {
      type: Object as PropType<IDashboard>,
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
  },
  setup() {
    const c = useControlController(
      (...args) => new DashboardController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const calcLayoutHeightWidth = (part: IPortletController) => {
      const isShowHeader =
        (part.model.showTitleBar &&
          (part.model.title || part.model.sysImage)) ||
        part.model.uiactionGroup;
      const layout = part.state.layout;
      if (isShowHeader && layout.height) {
        layout.height = `calc(${layout.height} + var(${ns.cssVarBlockName(
          'portlet-header-height',
        )}))`;
      }
      return part.state;
    };

    return { c, ns, calcLayoutHeightWidth };
  },

  render() {
    const { state, model } = this.c;
    return (
      <iBizControlBase controller={this.c} class={[this.ns.b()]}>
        {state.isCreated && (
          <iBizRow class={[this.ns.b('row')]} layout={model.layout}>
            {model.controls?.map((child: IDBPortletPart) => {
              return (
                <iBizCol
                  layoutPos={child.layoutPos}
                  state={this.calcLayoutHeightWidth(this.c.portlets[child.id!])}
                >
                  {renderPortletByType(child, this.c)}
                </iBizCol>
              );
            })}
          </iBizRow>
        )}
      </iBizControlBase>
    );
  },
});
