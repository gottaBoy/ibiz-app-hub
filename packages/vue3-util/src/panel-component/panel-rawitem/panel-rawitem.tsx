import { IHtmlItem, IPanelRawItem, ITextItem } from '@ibiz/model-core';
import { computed, defineComponent, PropType, Ref, ref, watch } from 'vue';
import { useNamespace } from '../../use';
import { PanelRawItemController } from './panel-rawitem.controller';
import './panel-rawitem.scss';

/**
 * 直接内容
 * @primary
 * @description 绘制面板中的直接内容，支持HTML内容、视频内容、图片内容等。
 */
export const PanelRawItem = defineComponent({
  name: 'IBizPanelRawItem',
  props: {
    /**
     * @description 面板直接内容项模型
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 面板直接内容控制器
     */
    controller: {
      type: PanelRawItemController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-rawitem');
    const c = props.controller;

    // 传入内容
    const content: Ref<string | number | undefined> = ref('');

    const tempStyle = ref('');

    const { rawItem } = props.modelData;

    if (rawItem && rawItem.cssStyle) {
      tempStyle.value = rawItem.cssStyle;
    }

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [ns.b(), ns.m(id)];
      result.push(...props.controller.containerClass);
      return result;
    });

    watch(
      () => c.data,
      async newVal => {
        if (newVal) {
          const rawItemModel = c.model.rawItem;
          if (!rawItemModel) {
            return;
          }
          let rawItemContent;
          const obj = { ...newVal };
          if (rawItemModel.contentType === 'RAW') {
            rawItemContent = (rawItemModel as ITextItem).caption!;
          } else if (rawItemModel.contentType === 'HTML') {
            rawItemContent = (rawItemModel as IHtmlItem).content!;
          }
          if (rawItemContent && rawItemModel.templateMode) {
            rawItemContent = await ibiz.util.hbs.render(
              rawItemContent.replace('//n', '\n'),
              Object.assign(obj, { data: { ...newVal } }),
            );
          }
          content.value = rawItemContent;
        }
      },
      {
        immediate: true,
      },
    );

    return {
      ns,
      classArr,
      tempStyle,
      content,
    };
  },
  render() {
    // 动态控制显示
    if (!this.controller.state.visible) return;
    return (
      <div
        class={this.classArr}
        style={this.tempStyle}
        onClick={event => this.controller.onClick(event)}
      >
        <iBizRawItem
          rawItem={this.modelData}
          content={this.content}
        ></iBizRawItem>
      </div>
    );
  },
});
