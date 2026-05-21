import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, h, PropType, resolveComponent } from 'vue';
import {
  IAppDETabExplorerView,
  IDETabViewPanel,
  ITabExpPanel,
} from '@ibiz/model-core';
import {
  IControlProvider,
  TabExpPanelController,
} from '@ibiz-template/runtime';
import './tab-exp-panel.scss';

export const TabExpPanelControl = defineComponent({
  name: 'IBizTabExpPanelControl',
  props: {
    /**
     * @description 分页导航面板模型数据
     */
    modelData: { type: Object as PropType<ITabExpPanel>, required: true },
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
     * @description 默认激活的标签
     */
    defaultTabName: { type: String, required: false },
  },
  setup() {
    const c = useControlController(
      (...args) => new TabExpPanelController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    // 视图模型
    const model = c.view?.model as IAppDETabExplorerView;
    // 布局模式
    const layoutMode = model?.tabLayout?.toLowerCase() || 'top';

    const onTabChange = (value: string) => {
      c.state.activeName = value;
      c.handleTabChange();
    };

    // 分页绘制数据集合
    const tabPages = computed(() => {
      return c.state.tabPages.map(_tab => ({
        id: _tab.tabTag,
        text: _tab.caption,
        icon: _tab.sysImage,
        counter: _tab.counterId ? c.state.counterData[_tab.counterId] : null,
      }));
    });

    return {
      c,
      ns,
      tabPages,
      layoutMode,
      onTabChange,
    };
  },
  render() {
    const { isCreated, activeName } = this.c.state;
    if (!isCreated) {
      return;
    }

    let solts = {};

    if (this.layoutMode === 'flow' || this.layoutMode === 'flow_noheader') {
      solts = {
        groupContent: (tab: IData) => {
          const target = this.c.model.controls?.find(
            ctrl => ctrl.id === tab.id,
          ) as IDETabViewPanel;
          return h(resolveComponent('IBizViewShell'), {
            context: this.context,
            params: this.params,
            viewId: target?.embeddedAppDEViewId,
          });
        },
      };
    }

    return (
      <iBizTabLayout
        class={this.ns.b()}
        tabPages={this.tabPages}
        layoutMode={this.layoutMode}
        activeName={activeName}
        onTabChange={this.onTabChange}
      >
        {solts}
      </iBizTabLayout>
    );
  },
});
