import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  reactive,
  ref,
  Ref,
} from 'vue';
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
  },
  setup() {
    const c: DRTabController = useControlController(
      (...args) => new DRTabController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const router = useRouter();

    c.setRouter(router);

    const counterData = reactive<IData>({});

    const showPopover: Ref<boolean> = ref(false);

    const tabPosition =
      (c.view.model as IAppDETabExplorerView).tabLayout?.toLowerCase() || 'top';

    const activeTab = computed(() => {
      return c.state.drTabPages.find(tab => tab.tag === c.state.activeName);
    });

    const fn = (counter: IData) => {
      Object.assign(counterData, counter);
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

    /**
     * 打开/关闭 Popover
     * @param e
     */
    const onChangePopover = (e: MouseEvent) => {
      e.stopPropagation();
      showPopover.value = !showPopover.value;
    };

    onUnmounted(() => {
      c.counter?.offChange(fn);
    });

    const renderDropdownList = () => {
      return (
        <van-popover
          class={ns.e('dropdown-list')}
          placement={'bottom-start'}
          v-model:show={showPopover.value}
        >
          {{
            default: () => {
              return (
                <div class={ns.e('popover')}>
                  {c.state.drTabPages.map(tab => {
                    if (!tab.hidden) {
                      return (
                        <div
                          class={[
                            ns.em('popover', 'item'),
                            ns.is('disabled', tab.disabled),
                          ]}
                          onClick={() => onTabChange(tab.tag)}
                        >
                          {tab.sysImage && <iBizIcon icon={tab.sysImage} />}
                          <div class={'caption'}>
                            <span class={'text'}>{tab.caption}</span>
                            {tab.counterId && (
                              <iBizBadge
                                value={counterData[tab.counterId]}
                                counterMode={tab.counterMode}
                              />
                            )}
                          </div>
                          {tab.tag === c.state.activeName && (
                            <ion-icon name='checkmark-outline'></ion-icon>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            },
            reference: () => {
              return (
                <van-button onClick={onChangePopover}>
                  {activeTab.value?.sysImage && (
                    <iBizIcon
                      class={ns.em('dropdown-list', 'icon')}
                      icon={activeTab.value.sysImage}
                    />
                  )}
                  <span class={ns.em('dropdown-list', 'caption')}>
                    {activeTab.value?.caption}
                    {activeTab.value?.counterId && (
                      <iBizBadge
                        value={counterData[activeTab.value.counterId]}
                        counterMode={activeTab.value.counterMode}
                      />
                    )}
                  </span>
                  <ion-icon name='chevron-down-outline'></ion-icon>
                </van-button>
              );
            },
          }}
        </van-popover>
      );
    };

    const renderDefault = () => {
      return (
        <van-tabs
          class={ns.e('tabs')}
          active={c.state.activeName}
          onChange={onTabChange}
        >
          {c.state.drTabPages.map(tab => {
            if (!tab.hidden) {
              return (
                <van-tab
                  name={tab.tag}
                  class={ns.e('tab-item')}
                  disabled={tab.disabled}
                  badge={tab.counterId ? counterData[tab.counterId] : undefined}
                >
                  {{
                    title: () => (
                      <div class={ns.em('tab-item', 'title')}>
                        {tab.sysImage && (
                          <iBizIcon
                            class={ns.em('tab-item', 'title-icon')}
                            icon={tab.sysImage}
                          />
                        )}
                        <span class={ns.em('tab-item', 'title-caption')}>
                          {tab.caption}
                        </span>
                      </div>
                    ),
                  }}
                </van-tab>
              );
            }
            return null;
          })}
        </van-tabs>
      );
    };

    return {
      c,
      ns,
      tabPosition,
      renderDefault,
      renderDropdownList,
    };
  },
  render() {
    const { isCreated, isCalculatedPermission } = this.c.state;
    return (
      <iBizControlBase controller={this.c} class={this.ns.b()}>
        {isCreated &&
        isCalculatedPermission &&
        this.tabPosition === 'top_dropdownlist'
          ? this.renderDropdownList()
          : this.renderDefault()}
      </iBizControlBase>
    );
  },
});
