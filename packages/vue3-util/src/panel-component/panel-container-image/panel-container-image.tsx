import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { isSvg } from '@ibiz-template/core';
import { useNamespace } from '../../use';
import { PanelContainerImageController } from './panel-container-image.controller';
import './panel-container-image.scss';

/**
 * 图片背景容器
 * @primary
 * @description 图片背景容器，可以配置容器的背景图片。
 */
export const PanelContainerImage = defineComponent({
  name: 'IBizPanelContainerImage',
  props: {
    /**
     * @description 图片背景容器模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 图片背景容器控制器
     */
    controller: {
      type: PanelContainerImageController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-container-image');
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

    const backgroundStyle = computed(() => {
      const image = props.controller.model.sysImage;
      const styles = {};
      let imgStr = '';
      if (image?.rawContent) {
        if (isSvg(image.rawContent)) {
          // 删除中文，防止报错
          const rawContent = image.rawContent.replace(/[\u4e00-\u9fff]/g, '');
          imgStr = `url(data:image/svg+xml;base64,${btoa(rawContent)})`;
        } else {
          imgStr = `url(${image.rawContent})`;
        }
      } else if (image?.imagePath) {
        imgStr = `url(${image.imagePath})`;
      }
      if (imgStr) {
        Object.assign(styles, {
          backgroundImage: imgStr,
        });
      }
      return styles;
    });

    return { ns, classArr, backgroundStyle };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow slot='content' layout={this.modelData.layout}>
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
    return (
      <div
        class={this.classArr}
        v-loading={this.controller.state.loading}
        element-loading-text={this.controller.state.loadingText}
        onClick={event => this.controller.onClick(event)}
        style={this.backgroundStyle}
      >
        {this.controller.model.cssStyle ? (
          <style type='text/css'>{this.controller.model.cssStyle}</style>
        ) : null}
        {content}
      </div>
    );
  },
});
