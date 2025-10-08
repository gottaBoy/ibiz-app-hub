import { useRouter } from 'vue-router';
import { IAppDETabExplorerView, IDEDRBar } from '@ibiz/model-core';
import {
  Ref,
  ref,
  computed,
  PropType,
  reactive,
  onUnmounted,
  defineComponent,
} from 'vue';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IControlProvider, IDRBarItemsState } from '@ibiz-template/runtime';
import { DRBarController } from './drbar.controller';
import './drbar.scss';

export const DRBarControl = defineComponent({
  name: 'IBizDrBarControl',
  props: {
    /**
     * @description 数据关系栏模型数据
     */
    modelData: { type: Object as PropType<IDEDRBar>, required: true },
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
     * @description 导航数据
     */
    srfnav: { type: String, required: false },
    /**
     * @description 隐藏编辑项
     */
    hideEditItem: { type: Boolean, default: undefined },
  },
  setup() {
    const c: DRBarController = useControlController(
      (...args) => new DRBarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const router = useRouter();

    c.setRouter(router);

    const counterData = reactive<IData>({});

    const showPopover: Ref<boolean> = ref(false);

    const tabPosition =
      (c.view.model as IAppDETabExplorerView).tabLayout?.toLowerCase() || 'top';

    const drBarItems = computed(() => {
      const items: IDRBarItemsState[] = [];
      c.state.drBarItems.forEach(drBar => {
        if (drBar.children) {
          items.push(...drBar.children);
        }
      });
      return items;
    });

    const activeBar = computed(() => {
      return drBarItems.value.find(tab => tab.tag === c.state.selectedItem);
    });

    const sidebar: Ref<number | undefined> = ref();

    const sidebarIndex = computed({
      get: () => {
        if (sidebar.value === undefined) {
          return drBarItems.value.findIndex(
            tab => tab.tag === c.state.selectedItem,
          );
        }
        return sidebar.value;
      },
      set: (val: number) => {
        sidebar.value = val;
      },
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
     * 选中改变
     * @param name
     */
    const onSelectChange = (name: string) => {
      showPopover.value = false;
      c.handleSelectChange(name);
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
                  {c.state.drBarItems.map(bar => {
                    if (bar.visible) {
                      return [
                        <div class={[ns.em('popover', 'group')]}>
                          {bar.sysImage && <iBizIcon icon={bar.sysImage} />}
                          <div class={'caption'}>
                            <span class={'text'}>{bar.caption}</span>
                          </div>
                        </div>,
                        bar.children?.map(child => {
                          if (child.visible) {
                            return (
                              <div
                                class={[
                                  ns.em('popover', 'item'),
                                  ns.is('disabled', child.disabled),
                                ]}
                                onClick={() => onSelectChange(child.tag)}
                              >
                                {child.sysImage && (
                                  <iBizIcon icon={child.sysImage} />
                                )}
                                <div class={'caption'}>
                                  <span class={'text'}>{child.caption}</span>
                                  {child.counterId && (
                                    <iBizBadge
                                      value={counterData[child.counterId]}
                                      counterMode={child.counterMode}
                                    />
                                  )}
                                </div>
                                {child.tag === c.state.selectedItem && (
                                  <ion-icon name='checkmark-outline'></ion-icon>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }),
                      ];
                    }
                    return null;
                  })}
                </div>
              );
            },
            reference: () => {
              return (
                <van-button onClick={onChangePopover}>
                  {activeBar.value?.sysImage && (
                    <iBizIcon
                      class={ns.em('dropdown-list', 'icon')}
                      icon={activeBar.value.sysImage}
                    />
                  )}
                  <span class={ns.em('dropdown-list', 'caption')}>
                    {activeBar.value?.caption}
                    {activeBar.value?.counterId && (
                      <iBizBadge
                        value={counterData[activeBar.value.counterId]}
                        counterMode={activeBar.value.counterMode}
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
        <van-sidebar v-model={sidebarIndex.value} class={ns.e('default')}>
          {c.state.drBarItems.map(bar => {
            if (bar.visible) {
              return [
                <div class={ns.em('default', 'group')}>
                  <div class={ns.em('default', 'group-title')}>
                    {bar.sysImage && <iBizIcon icon={bar.sysImage} />}
                    <div class={'caption'}>{bar.caption}</div>
                  </div>
                </div>,
                bar.children?.map(child => {
                  if (child.visible) {
                    return (
                      <van-sidebar-item
                        disabled={child.disabled}
                        class={ns.em('default', 'item')}
                        badge={
                          child.counterId ? counterData[child.counterId] : null
                        }
                      >
                        {{
                          title: () => {
                            return (
                              <div
                                class={ns.em('default', 'item-title')}
                                onClick={() => onSelectChange(child.tag)}
                              >
                                {child.sysImage && (
                                  <iBizIcon icon={child.sysImage} />
                                )}
                                <div class={'caption'}>{child.caption}</div>
                              </div>
                            );
                          },
                        }}
                      </van-sidebar-item>
                    );
                  }
                  return null;
                }),
              ];
            }
            return null;
          })}
        </van-sidebar>
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
