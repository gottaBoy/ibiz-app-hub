import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { PanelCarouselController } from './panel-carousel.controller';
import './panel-carousel.scss';

/**
 * 轮播图
 * @primary
 * @description 可配置一组静态图片，用于轮播。
 * @panelitemparams {name:autoplay,parameterType:string,defaultvalue:-,description:为1时自动播放，为0时不自动播放}
 * @panelitemparams {name:timespan,parameterType:number,defaultvalue:3000,description:轮播间隔，单位ms}
 * @panelitemparams {name:duration,parameterType:number,defaultvalue:500,description:轮播动画时间，单位ms}
 * @panelitemparams {name:showIndicators,parameterType:boolean,defaultvalue:true,description:是否显示指示器}
 * @panelitemparams {name:touchable,parameterType:boolean,defaultvalue:true,description:是否允许手动滑动}
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
