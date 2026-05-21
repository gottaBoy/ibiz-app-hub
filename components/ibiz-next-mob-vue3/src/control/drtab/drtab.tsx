import { computed, defineComponent, PropType, ref, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { IAppDETabExplorerView, IDEDRTab } from '@ibiz/model-core';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IControlProvider } from '@ibiz-template/runtime';
import { DRTabController } from './drtab.controller';
import './drtab.scss';

export const DRTabControl = defineComponent({
  name: 'IBizDrTabControl',
  props: {
    /**
     * @description 数据关系分页模型数据
     */
    modelData: { type: Object as PropType<IDEDRTab>, required: true },
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
     * @description 隐藏编辑项
     */
    hideEditItem: { type: Boolean, default: undefined },
  },
  setup() {
    const c: DRTabController = useControlController(
      (...args) => new DRTabController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const router = useRouter();

    c.setRouter(router);

    const counterData: Ref<IData> = ref({});

    const showPopover: Ref<boolean> = ref(false);

    // 布局模式
    const layoutMode =
      (c.view.model as IAppDETabExplorerView).tabLayout?.toLowerCase() || 'top';

    const fn = (counter: IData) => {
      counterData.value = counter;
    };

    c.evt.on('onCreated', () => {
      if (c.counter) {
        c.counter.onChange(fn, true);
      }
    });

    /**
     * 分页改变
     * @param name
     */
    const onTabChange = (name: string) => {
      c.state.activeName = name;
      showPopover.value = false;
      c.handleTabChange();
    };

    // 分页绘制数据集合
    const tabPages = computed(() => {
      return c.state.drTabPages.map(_tab => ({
        id: _tab.tag,
        text: _tab.caption,
        icon: _tab.sysImage,
        counter: _tab.counterId ? counterData.value[_tab.counterId] : null,
        isHidden: _tab.hidden,
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
    const { isCreated, activeName, isCalculatedPermission } = this.c.state;
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b(), this.ns.m(this.layoutMode)]}
      >
        {isCreated && isCalculatedPermission && (
          <iBizTabLayout
            tabPages={this.tabPages}
            layoutMode={this.layoutMode}
            activeName={activeName}
            onTabChange={this.onTabChange}
          />
        )}
      </iBizControlBase>
    );
  },
});
