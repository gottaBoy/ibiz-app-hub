import {
  IPanelItemProvider,
  IPanelItemController,
} from '@ibiz-template/runtime';
import { IPanelContainer, IPanelItem } from '@ibiz/model-core';
import {
  computed,
  defineComponent,
  inject,
  PropType,
  reactive,
  VNode,
  watch,
} from 'vue';
import { useNamespace } from '../../use';
import { MultiDataContainerRawController } from './multi-data-container-raw.controller';
import './multi-data-container-raw.scss';

/**
 * 多项数据容器（仅数据）
 * @primary
 * @description 与多项数据容器类似，唯一不同的是不根据数据循环绘制所有子，只绘制一遍，但所有数据都会传递给子组件。
 */
export const MultiDataContainerRaw = defineComponent({
  name: 'IBizMultiDataContainerRaw',
  props: {
    /**
     * @description 多项数据容器（仅数据）模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 多项数据容器（仅数据）控制器
     */
    controller: {
      type: MultiDataContainerRawController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('multi-data-container-raw');
    const { id } = props.modelData;

    // 面板成员state响应式
    watch(
      () => props.controller.state.items,
      () => {
        const keys = Object.keys(props.controller.panelItems);
        keys.forEach(key => {
          const panelItem = props.controller.panelItems[key];
          panelItem.state = reactive(panelItem.state);
        });
      },
      { immediate: true, deep: true },
    );

    // 获取上层的绘制函数
    const renderPanelItem = inject<
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

    // 类名控制
    const classArr = computed(() => {
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        ...props.controller.containerClass,
      ];
      return result;
    });

    return { ns, classArr, renderPanelItem };
  },
  render() {
    let content: VNode | VNode[];
    if (this.$slots.default) {
      content = this.$slots.default();
    } else {
      // 内容区默认插槽处理，封装app-col
      content = (
        <iBizRow class={this.ns.b('content')} layout={this.modelData.layout}>
          {this.modelData.panelItems?.map(panelItem => {
            const childController = this.controller.panelItems[panelItem.id!];
            return (
              <iBizCol
                layoutPos={panelItem.layoutPos}
                state={childController.state}
              >
                {this.renderPanelItem(panelItem, {
                  providers: this.controller.providers,
                  panelItems: this.controller.panelItems,
                })}
              </iBizCol>
            );
          })}
        </iBizRow>
      );
    }
    return (
      <div class={this.classArr} v-loading={this.controller.state.loading} element-loading-text={this.controller.state.loadingText}>
        {content}
      </div>
    );
  },
});
