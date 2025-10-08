import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { PanelCarouselController } from './panel-carousel.controller';
import './panel-carousel.scss';

/**
 * 轮播图
 * @primary
 * @description 可配置一组静态图片，用于轮播。
 */
export const PanelCarousel = defineComponent({
  name: 'IBizPanelCarousel',
  props: {
    /**
     * @description 轮播图控制器
     */
    controller: {
      type: PanelCarouselController,
      required: true,
    },
    /**
     * @description 轮播图属性
     */
    attrs: {
      type: Object as PropType<IData>,
      required: false,
    },
  },
  setup(_props) {
    const ns = useNamespace('panel-carousel');
    // 自动轮播时间
    const autoplay =
      _props.controller.getParamsValue('autoplay') === '1'
        ? _props.controller.getParamsValue('timespan')
        : undefined;
    // 动画时间
    const duration = _props.controller.getParamsValue('duration');
    // 显示指示器
    const showIndicators = _props.controller.getParamsValue('showIndicators');
    // 允许手动滑动
    const touchable = _props.controller.getParamsValue('touchable');

    return {
      ns,
      autoplay,
      duration,
      showIndicators,
      touchable,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <iBizCarousel
          images={this.controller.images}
          autoplay={this.autoplay}
          duration={this.duration}
          showIndicators={this.showIndicators}
          touchable={this.touchable}
          attrs={this.attrs}
        ></iBizCarousel>
      </div>
    );
  },
});
export default PanelCarousel;
