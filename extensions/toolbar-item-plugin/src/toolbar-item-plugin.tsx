import { PropType, defineComponent } from 'vue';
import { IDEToolbarItem } from '@ibiz/model-core';
import { ToolbarController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './toolbar-item-plugin.scss';

export const ToolbarItemPlugin = defineComponent({
  name: 'IBizToolbarItemPlugin',
  props: {
    item: {
      type: Object as PropType<IDEToolbarItem>,
      required: true,
    },
    controller: {
      type: ToolbarController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('toolbar-item-plugin');

    // 处理点击事件
    const handleClick = async (
      item: IDEToolbarItem,
      event: MouseEvent,
      params?: IData,
    ): Promise<void> => {
      await props.controller.onItemClick(item, event, params);
    };

    return { ns, handleClick };
  },
  render() {
    return (
      <div
        class={this.ns.b()}
        onClick={(e: MouseEvent) => this.handleClick(this.item, e)}
      >
        <ion-icon name='alarm-outline'></ion-icon>
        <span>{this.item.caption}</span>
      </div>
    );
  },
});
