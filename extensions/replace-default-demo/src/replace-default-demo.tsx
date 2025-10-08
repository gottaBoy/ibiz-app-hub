import { defineComponent, PropType } from 'vue';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IDEGrid } from '@ibiz/model-core';
import { IControlProvider } from '@ibiz-template/runtime';
import { ReplaceDefaultDemoController } from './replace-default-demo.controller';
import './replace-default-demo.scss';

export const ReplaceDefaultDemo = defineComponent({
  name: 'IBizReplaceDefaultDemo',
  props: {
    /**
     * @description 表格模型数据
     */
    modelData: { type: Object as PropType<IDEGrid>, required: true },
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
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否单选
     */
    singleSelect: { type: Boolean, default: undefined },
    /**
     * @description 是否启用行编辑
     */
    rowEditOpen: { type: Boolean, default: undefined },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c = useControlController(
      (...args) => new ReplaceDefaultDemoController(...args),
    );
    const ns = useNamespace('replace-default-demo');

    return {
      c,
      ns,
    };
  },
  render() {
    return <div class={this.ns.b()}>插件示例</div>;
  },
});
