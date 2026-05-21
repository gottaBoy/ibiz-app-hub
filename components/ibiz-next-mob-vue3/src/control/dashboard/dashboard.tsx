import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  ConcreteComponent,
  defineComponent,
  h,
  isReactive,
  PropType,
  reactive,
  ref,
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
  IModal,
  MobCustomDashboardController,
} from '@ibiz-template/runtime';
import { CustomDashboardDesign } from './custom-dashboard-design/custom-dashboard-design';
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
): VNode | null {
  const provider = c.providers[model.id!];
  const controller = c.portlets[model.id!];
  const commonProps = {
    modelData: model,
    controller,
  };

  if (!controller.state.visible) {
    return null;
  }

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

    c.evt.on('onInitPortlets', () => {
      // 数据看板成员state响应式
      Object.values(c.portlets).forEach(portlet => {
        if (!isReactive(portlet.state)) {
          portlet.state = reactive(portlet.state);
        }
      });
    });

    // 是否已初始化
    const initialized = ref(false);

    // 是否显示浮动按钮
    const isShowFloatingButton = ref(!!c.model.enableCustomized);

    // 初始化
    const init = async () => {
      try {
        if (c.model.enableCustomized) {
          const customDashboard = new MobCustomDashboardController(c.model, c);
          c.setMobCustomDashboard(customDashboard);
          await customDashboard.load();
        }
      } finally {
        initialized.value = true;
      }
    };

    init();

    // 处理浮动按钮点击
    const handleFloatingButtonClick = async () => {
      await ibiz.overlay.drawer(
        (modal: IModal) => {
          return h(CustomDashboardDesign, {
            modal,
            controller: c,
          });
        },
        {},
        {
          width: 100,
          height: 80,
          attrs: {
            position: 'bottom',
            closeable: false,
          },
        },
      );
    };

    return {
      c,
      ns,
      initialized,
      isShowFloatingButton,
      handleFloatingButtonClick,
    };
  },

  render() {
    const { state, model } = this.c;

    let content = (
      <iBizRow class={[this.ns.b('row')]} layout={model.layout}>
        {model.controls?.map((child: IDBPortletPart) => {
          return (
            <iBizCol
              layoutPos={child.layoutPos}
              state={this.c.portlets[child.id!].state}
            >
              {renderPortletByType(child, this.c)}
            </iBizCol>
          );
        })}
      </iBizRow>
    );

    if (model.showDashboardNavBar) {
      const anchorList = this.c.enableAnchorCtrls.filter(ctrl => {
        const controller = this.c.portlets[ctrl.id!];
        return controller.state.visible;
      });
      const list = anchorList.map(ctrl => ctrl.title || ctrl.id);
      content = (
        <van-index-bar
          index-list={list}
          sticky={false}
          class={[
            this.ns.e('nav-bar'),
            this.ns.em(
              'nav-bar',
              model.navBarPos?.toLowerCase() || 'middleright',
            ),
          ]}
        >
          {content}
        </van-index-bar>
      );
    }

    return (
      <iBizControlBase controller={this.c} class={[this.ns.b()]}>
        {state.isCreated && this.initialized && content}
        {state.isCreated && this.initialized && this.isShowFloatingButton && (
          <iBizFloatButton
            onClick={this.handleFloatingButtonClick}
          ></iBizFloatButton>
        )}
      </iBizControlBase>
    );
  },
});
