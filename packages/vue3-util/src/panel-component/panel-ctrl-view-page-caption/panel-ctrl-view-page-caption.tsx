import { IPanelCtrlPos } from '@ibiz/model-core';
import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '../../use';
import { PanelCtrlViewPageCaptionController } from './panel-ctrl-view-page-caption.controller';
import './panel-ctrl-view-page-caption.scss';

/**
 * 视图标题
 * @primary
 * @description 视图的标题组件，只存在于视图布局面板中。
 */
export const PanelCtrlViewPageCaption = defineComponent({
  name: 'IBizPanelCtrlViewPageCaption',
  props: {
    /**
     * @description 视图标题模型
     */
    modelData: {
      type: Object as PropType<IPanelCtrlPos>,
      required: true,
    },
    /**
     * @description 视图标题控制器
     */
    controller: {
      type: Object as PropType<PanelCtrlViewPageCaptionController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-ctrl-view-page-caption');

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        ns.is('mob', ibiz.env.isMob),
      ];
      result.push(...props.controller.containerClass);
      return result;
    });

    return {
      ns,
      classArr,
    };
  },
  render() {
    // 编辑器内容
    let editor = null;
    if (this.controller.data) {
      editor = (
        <span class={this.ns.b('content')}>
          {this.controller.state.caption}
        </span>
      );
    }

    return (
      <div
        class={this.classArr}
        onClick={event => this.controller.onClick(event)}
      >
        {editor}
      </div>
    );
  },
});
