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
import { MultiDataContainerController } from './multi-data-container.controller';
import './multi-data-container.scss';

/**
 * 多项数据容器
 * @primary
 * @description 要求配置的自定义数据源为数组格式，会根据数据源数组循环绘制子布局组件，每次循环，对应绘制的子组件的数据为对应数据项。
 */
export const MultiDataContainer = defineComponent({
  name: 'IBizMultiDataContainer',
  props: {
    /**
     * @description 多项数据容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 多项数据容器控制器
     */
    controller: {
      type: MultiDataContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('multi-data-container');
    const { id } = props.modelData;

    // 面板成员state响应式
    watch(
      () => props.controller.state.items,
      () => {
        props.controller.dataItems.forEach(item => {
          item.state = reactive(item.state);

          const keys = Object.keys(item.panelItems);
          keys.forEach(key => {
            const panelItem = item.panelItems[key];
            panelItem.state = reactive(panelItem.state);
          });
        });
      },
      { immediate: true },
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
      content = this.controller.state.items.map((_item, index) => {
        const itemController = this.controller.dataItems[index];
        return (
          <iBizRow class={this.ns.b('content')} layout={this.modelData.layout}>
            {this.modelData.panelItems?.map(panelItem => {
              const childController = itemController.panelItems[panelItem.id!];
              return (
                <iBizCol
                  layoutPos={panelItem.layoutPos}
                  state={childController.state}
                >
                  {this.renderPanelItem(panelItem, {
                    providers: this.controller.providers,
                    panelItems: itemController.panelItems,
                  })}
                </iBizCol>
              );
            })}
          </iBizRow>
        );
      });
    }
    return (
      <div class={this.classArr} v-loading={this.controller.state.loading}>
        {content}
      </div>
    );
  },
});
