import { IFlexLayoutPos, IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, ref, Ref, VNode } from 'vue';
import { useNamespace } from '../../use';
import { GridContainerController } from './grid-container.controller';
import './grid-container.scss';

/**
 * 栅格容器
 * @primary
 * @description 栅格容器，以栅格布局的方式呈现容器内容，支持自适应列数配置。
 */
export const GridContainer = defineComponent({
  name: 'IBizGridContainer',
  props: {
    /**
     * @description 栅格容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 栅格容器控制器
     */
    controller: {
      type: GridContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('grid-container');
    const { id } = props.modelData;

    // 类名控制
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    const layoutModel = computed(() => {
      return { ...props.modelData.layout, layout: 'TABLE_12COL' };
    });

    const convertLayoutPos = (
      layoutPos: IFlexLayoutPos,
      adaptGrow: number,
    ): IFlexLayoutPos => {
      const result = {
        ...layoutPos,
        layout: 'TABLE_12COL',
        colXS: layoutPos.grow || adaptGrow,
        colSM: layoutPos.grow || adaptGrow,
        colMD: layoutPos.grow || adaptGrow,
        colLG: layoutPos.grow || adaptGrow,
      };
      delete result.grow;
      return result;
    };

    // 自适应列个数, 算一次记录下来，后续不用计算
    const adaptCols: Ref<undefined | number> = ref(undefined);
    // 自适应列默认占据的grow
    const adaptGrow: Ref<number> = ref(12);

    return {
      ns,
      classArr,
      layoutModel,
      convertLayoutPos,
      adaptGrow,
      adaptCols,
    };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];

    if (this.adaptCols === undefined) {
      // 当前已经配置的grow
      let currentGrow = 0;
      // 自适应列个数
      let adaptCols = 0;
      defaultSlots.forEach(slot => {
        const props = slot.props as IData;
        if (props && props.modelData && props.modelData.layoutPos) {
          if (typeof props.modelData.layoutPos.grow === 'number') {
            currentGrow += props.modelData.layoutPos.grow;
          } else if (typeof props.modelData.layoutPos.grow === 'undefined') {
            adaptCols += 1;
          }
        }
      });
      // 自适应列默认占据的grow
      let adaptGrow = 12;
      if (adaptCols > 0) {
        adaptGrow = (12 - currentGrow) / adaptCols;
      }
      this.adaptCols = adaptCols;
      this.adaptGrow = adaptGrow;
    }

    return (
      <iBizRow
        class={this.classArr}
        layout={this.layoutModel}
        v-loading={this.controller.state.loading}
        element-loading-text={this.controller.state.loadingText}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          return (
            <iBizCol
              layoutPos={this.convertLayoutPos(
                props.modelData.layoutPos,
                this.adaptGrow,
              )}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
  },
});
