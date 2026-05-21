import { IDEList } from '@ibiz/model-core';
import { defineComponent, PropType } from 'vue';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IControlProvider, ListController } from '@ibiz-template/runtime';
import './list.scss';
import { useListRender } from '../../../util';

export const ListControl = defineComponent({
  name: 'IBizListControl',
  props: {
    /**
     * @description 列表模型数据
     */
    modelData: { type: Object as PropType<IDEList>, required: true },
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
     * @description 部件激活模式，值为0：无激活，值为1：单击激活，值为2：双击激活
     * @default 1
     */
    mdctrlActiveMode: { type: Number, default: 1 },
    /**
     * @description 是否单选
     * @default true
     */
    singleSelect: { type: Boolean, default: true },
    /**
     * @description 每行数量
     * @default 2
     */
    rowsCount: { type: Number, default: 2 },
    /**
     * @description 每列数量
     * @default 5
     */
    columnsCount: { type: Number, default: 5 },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
    /**
     * @description 模式，值为LIST：列表模式呈现加载数据，值为SELECT：呈现数据时显示勾选图标
     * @default LIST
     */
    mode: { type: String, default: 'LIST' },
  },
  setup(props, { slots }) {
    const c = useControlController((...args) => new ListController(...args));

    // 列表与多数据部件为同一个样式
    const ns = useNamespace(`control-mobmdctrl`);

    const { renderItem, renderNoData, renderAddItem, renderScrollList } =
      useListRender(props, c, ns, slots);

    const renderDefault = () => {
      const result = [];
      result.push(
        ...c.state.items.map((item: IData) => {
          return renderItem(item);
        }),
      );
      if (c.enableNew) {
        result.push(renderAddItem());
      }
      return result;
    };

    // 绘制列表内容
    const renderMDContent = () => {
      // eslint-disable-next-line no-shadow
      const slots = renderDefault();
      return renderScrollList(slots);
    };

    return {
      c,
      ns,
      renderMDContent,
      renderNoData,
    };
  },
  render() {
    return (
      <iBizControlBase controller={this.c} class={this.ns.b()}>
        {this.c.state.isCreated &&
          (this.c.state.items.length > 0
            ? this.renderMDContent()
            : this.renderNoData())}
      </iBizControlBase>
    );
  },
});
