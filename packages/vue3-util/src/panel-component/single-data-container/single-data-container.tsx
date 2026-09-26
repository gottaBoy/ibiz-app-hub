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
} from 'vue';
import { useNamespace } from '../../use';
import { SingleDataContainerController } from './single-data-container.controller';
import './single-data-container.scss';

/**
 * 单项数据容器
 * @primary
 * @description 用于配置自定义数据源，该容器内的子面板项中的数据由此容器提供。
 * @param {*} props
 * @return {*}
 */
export const SingleDataContainer = defineComponent({
  name: 'IBizSingleDataContainer',
  props: {
    /**
     * @description 单项数据容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 单项数据容器控制器
     */
    controller: {
      type: SingleDataContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('single-data-container');
    const { id } = props.modelData;

    // 面板成员state响应式
    const keys = Object.keys(props.controller.panelItems);
    keys.forEach(key => {
      const panelItem = props.controller.panelItems[key];
      panelItem.state = reactive(panelItem.state);
    });

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
