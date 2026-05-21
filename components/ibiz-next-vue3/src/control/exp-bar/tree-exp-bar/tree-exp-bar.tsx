import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { ITreeExpBar } from '@ibiz/model-core';
import { IControlProvider, TreeExpBarController } from '@ibiz-template/runtime';
import { useExpBarRender, useWatchRouteChange } from '../render-util';
import './tree-exp-bar.scss';

export const TreeExpBarControl = defineComponent({
  name: 'IBizTreeExpBarControl',
  props: {
    /**
     * @description 树导航栏模型数据
     */
    modelData: { type: Object as PropType<ITreeExpBar>, required: true },
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
     * @description 是否不需要导航视图
     */
    noNeedNavView: { type: Boolean, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c = useControlController(
      (...args) => new TreeExpBarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const { renderTitle, renderSearchBar } = useExpBarRender(c, ns);
    useWatchRouteChange(c);

    const navigational = computed(() => {
      return (
        c.view.model.viewType &&
        !['DEMPICKUPVIEW2', 'DEPICKUPVIEW2'].includes(c.view.model.viewType)
      );
    });

    return {
      c,
      ns,
      navigational,
      renderTitle,
      renderSearchBar,
    };
  },
  render() {
    const { state, XDataModel } = this.c;
    const { isCreated } = state;

    const slots: IData = {
      captionbar: this.renderTitle,
      searchbar: this.renderSearchBar,
    };
    if (isCreated) {
      if (XDataModel) {
        const key = this.c.controlPanel ? 'treeexpbar_tree' : 'default';
        // 树自己绘制，要传递额外的参数
        slots[key] = (): VNode => {
          return (
            <iBizControlShell
              context={this.c.context}
              params={this.c.params}
              modelData={XDataModel}
              singleSelect={true}
              navigational={this.navigational}
              mdctrlActiveMode={1}
              loadDefault={false}
              default-expanded-keys={this.c.defaultExpandedKeys}
            ></iBizControlShell>
          );
        };
      }
    }
    return <iBizControlBase controller={this.c}>{slots}</iBizControlBase>;
  },
});
