/* eslint-disable no-else-return */
import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelButtonList } from '@ibiz/model-core';
import { defineComponent, PropType } from 'vue';
import { PanelButtonListController } from './panel-button-list.controller';
import './panel-button-list.scss';

/**
 * 面板按钮组
 * @primary
 * @description 绘制多个el-button按钮组组件，或使用el-dropdown绘制行为组。
 * @export
 * @class PanelButtonList
 */
export const PanelButtonList = defineComponent({
  name: 'IBizPanelButtonList',
  props: {
    /**
     * @description 面板按钮组模型数据
     */
    modelData: {
      type: Object as PropType<IPanelButtonList>,
      required: true,
    },
    /**
     * @description 面板按钮组控制器
     */
    controller: {
      type: PanelButtonListController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-button-list');

    const c = props.controller;

    const handleClick = async (id: string, e?: MouseEvent): Promise<void> => {
      e?.stopPropagation();
      c.handleClick(id, e);
    };

    return {
      ns,
      handleClick,
    };
  },
  render() {
    const { state } = this.controller;
    if (state.visible)
      return (
        <iBizButtonList
          class={[this.ns.b(), ...this.controller.containerClass]}
          model={this.modelData}
          disabled={state.disabled}
          buttonsState={state.buttonsState}
          onClick={this.handleClick}
        ></iBizButtonList>
      );
    return null;
  },
});
export default PanelButtonList;
