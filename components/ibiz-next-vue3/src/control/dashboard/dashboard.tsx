import {
  useNamespace,
  useControlController,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  h,
  Ref,
  ref,
  VNode,
  PropType,
  reactive,
  isReactive,
  defineComponent,
  resolveComponent,
  ConcreteComponent,
  getCurrentInstance,
} from 'vue';
import {
  IDashboard,
  IModelObject,
  IDBPortletPart,
  IDBContainerPortletPart,
} from '@ibiz/model-core';
import { DashboardController, IControlProvider } from '@ibiz-template/runtime';
import { uniqueId } from 'lodash-es';
import './dashboard.scss';

// 刷新标记
const refreshTagObj: IData = {};

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
        {model.portletType}
        {ibiz.i18n.t('app.noSupport')}
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
        id: model.id,
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
    key: refreshTagObj[model.id!]?.refreshtag
      ? refreshTagObj[model.id!].refreshtag
      : model.id,
    id: model.id,
  });
}

export const DashboardControl = defineComponent({
  name: 'IBizDashboardControl',
  props: {
    /**
     * @description 看板模型数据
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

    useControlPopoverzIndex(c);

    const vue = getCurrentInstance()!.proxy!;

    // 自定义门户模型数组
    const customModelDatas: Ref<IModel> = ref([]);

    // 所有启用了锚点的门户部件
    const anchorList: Ref<IData[]> = ref([]);

    // dashboard 滚动容器
    const dashboardRef = ref();

    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    c.evt.on('onInitPortlets', () => {
      // 数据看板成员state响应式
      Object.values(c.portlets).forEach(portlet => {
        if (!isReactive(portlet.state)) {
          portlet.state = reactive(portlet.state);
        }
      });
      anchorList.value = c.enableAnchorCtrls;
    });

    // 门户部件项模型重置（不单单是数据刷新，模型也需刷新）
    c.evt.on('onItemModelReset', async args => {
      if (c.model.customizeMode !== 2) {
        return;
      }
      const { name } = args as IData;
      const targetIndex: number = customModelDatas.value.findIndex(
        (item: IModel) => {
          return item.id === name;
        },
      );
      if (targetIndex !== -1) {
        const app = ibiz.hub.getApp(ibiz.env.appId);
        const model: IDBPortletPart | undefined = await c.loadDynaPortletById(
          `${app.model.codeName}.${name}`,
        );
        if (model) {
          refreshTagObj[model.id!] = { refreshtag: uniqueId() };
          customModelDatas.value.splice(targetIndex, 1, model);
          vue.$forceUpdate();
        }
      }
    });

    // 处理自定义布局数据改变
    const handleCustomModelChange = (args: IData) => {
      const model: IData[] = args.model;
      // 原始控件模型
      const controls = c.model.controls;
      // filter类型变化处理FILTER界面刷新
      if (model && model.length > 0) {
        model.forEach((element: IData) => {
          if (element.portletType === 'FILTER') {
            refreshTagObj[element.id!] = { refreshtag: uniqueId() };
          }
        });
      } else if (controls && controls.length > 0) {
        controls.forEach((element: IData) => {
          if (element.portletType === 'FILTER') {
            refreshTagObj[element.id!] = { refreshtag: uniqueId() };
          }
        });
      }
      customModelDatas.value = model;
      vue.$forceUpdate();
    };

    const calcNavBarConfig = () => {
      const {
        navBarPos,
        navBarSysCss,
        navBarWidth,
        navBarStyle,
        navbarHeight,
      } = c.model;
      return {
        navBarPos,
        navBarSysCss,
        navBarWidth,
        navBarStyle,
        navbarHeight,
      };
    };

    return {
      c,
      ns,
      customModelDatas,
      anchorList,
      dashboardRef,
      calcNavBarConfig,
      handleCustomModelChange,
    };
  },

  render() {
    const { state, model } = this.c;

    const renderDefaultContent = () => {
      return (
        <iBizRow ref='dashboardRef' class={[this.ns.b()]} layout={model.layout}>
          {model.controls?.map((child: IDBPortletPart) => {
            return (
              <iBizCol
                layoutPos={child.layoutPos}
                state={this.c.portlets[child.id!]?.state}
              >
                {renderPortletByType(child, this.c)}
              </iBizCol>
            );
          })}
        </iBizRow>
      );
    };

    const renderCustomSlots = () => {
      const slots: IData = {
        default: () => {
          return renderDefaultContent();
        },
      };
      this.customModelDatas.forEach((item: IModelObject) => {
        slots[item.codeName!] = () => renderPortletByType(item, this.c);
      });
      return slots;
    };

    let content = null;
    if (model.enableCustomized) {
      content = (
        <iBizCustomDashboardContainer
          modelData={this.modelData}
          dashboard={this.c}
          onChanged={this.handleCustomModelChange}
        >
          {renderCustomSlots()}
        </iBizCustomDashboardContainer>
      );
    } else if (model.showDashboardNavBar) {
      content = (
        <iBizAnchorContainer
          anchorList={this.anchorList.map((item: IData) => {
            return { id: item.id, title: item.title };
          })}
          anchorTargetEle={this.dashboardRef}
          navBarConfig={this.calcNavBarConfig()}
        >
          {renderDefaultContent()}
        </iBizAnchorContainer>
      );
    } else {
      content = renderDefaultContent();
    }

    return (
      <iBizControlBase controller={this.c} class={[this.ns.b()]}>
        {state.isCreated && content}
      </iBizControlBase>
    );
  },
});
