import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
  VNode,
} from 'vue';
import { useController, useNamespace } from '@ibiz-template/vue3-util';
import './form-tab-panel.scss';
import { IDEFormTabPanel } from '@ibiz/model-core';
import {
  FormTabPanelController,
  FormTabPageController,
  AppCounter,
} from '@ibiz-template/runtime';

export const FormTabPanel = defineComponent({
  name: 'IBizFormTabPanel',
  props: {
    modelData: {
      type: Object as PropType<IDEFormTabPanel>,
      required: true,
    },
    controller: {
      type: FormTabPanelController,
      required: true,
    },
  },
  setup(props, { slots }) {
    const ns = useNamespace('form-tab-panel');
    useController(props.controller);

    // 计数器
    let counter: AppCounter | null = null;

    // 计数器数据
    const counterData = reactive<IData>({});

    // 计数器ID
    const counterRefId = ref('');

    const onTabClick = (tabIns: IData, event: MouseEvent) => {
      props.controller.onTabChange(tabIns.props.name);

      // 触发对应FormTabPage的点击事件
      const pageC = props.controller.form.details[
        tabIns.props.name
      ] as FormTabPageController;
      if (pageC) {
        pageC.onClick(event);
      }
    };

    const fn = (data: IData) => {
      counterData.value = data;
    };

    onMounted(() => {
      // 计数器相关
      const defaultSlots: VNode[] = slots.default?.() || [];
      for (let i = 0; i < defaultSlots.length; i++) {
        const slot: VNode = defaultSlots[i];
        const pagePropsC = slot.props?.controller as
          | FormTabPageController
          | undefined;
        if (
          pagePropsC &&
          pagePropsC.model &&
          pagePropsC.model.appCounterRefId
        ) {
          counterRefId.value = pagePropsC.model.appCounterRefId;
          break;
        }
      }
      if (counterRefId.value) {
        counter = props.controller.getCounter(counterRefId.value);
        if (counter) {
          counter.onChange(fn);
        }
      }
    });

    onUnmounted(() => {
      counter?.offChange(fn);
    });

    return {
      ns,
      onTabClick,
      counterData,
    };
  },
  render() {
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const renderItemText = (c: FormTabPageController) => {
      return (
        <span class={[this.ns.b('tab-item-content'), ...c.labelClass]}>
          {c.model.sysImage && <iBizIcon icon={c.model.sysImage} />}
          {c.model.showCaption && c.model.caption}
        </span>
      );
    };
    return (
      <el-tabs
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          this.modelData.detailStyle
            ? this.ns.m(this.modelData.detailStyle.toLowerCase())
            : '',
          ...this.controller.containerClass,
        ]}
        model-value={this.controller.state.activeTab}
        onTabClick={this.onTabClick}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          const c = props.controller as FormTabPageController;
          // 不显示且不用保活时直接不绘制
          if (!c.state.visible && !c.state.keepAlive) {
            return null;
          }
          return (
            <el-tab-pane
              class={this.ns.b('tab-item')}
              label={c.model.caption}
              name={c.model.id}
              lazy
            >
              {{
                default: (): VNode => slot,
                label: (): JSX.Element => {
                  const value = c.model.counterId
                    ? this.counterData.value[c.model.counterId]
                    : undefined;
                  return c.model.counterId ? (
                    <el-badge
                      class={[
                        this.ns.e('badge'),
                        this.ns.is(
                          'no-counter',
                          (!value && value !== 0) ||
                            (c.model.counterMode === 1 && value <= 0),
                        ),
                      ]}
                      value={value}
                      hidden={
                        (!value && value !== 0) ||
                        (c.model.counterMode === 1 && value <= 0)
                      }
                      max={99}
                    >
                      {renderItemText(c)}
                    </el-badge>
                  ) : (
                    renderItemText(c)
                  );
                },
              }}
            </el-tab-pane>
          );
        })}
      </el-tabs>
    );
  },
});
export default FormTabPanel;
