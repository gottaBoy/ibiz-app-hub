import { defineComponent, PropType } from 'vue';
import { useNamespace, useFilterAttribute } from '@ibiz-template/vue3-util';
import './carousel.scss';
import { ISysImage } from '@ibiz/model-core';
import { IIcon } from '@ibiz-template/runtime';

export const IBizCarousel = defineComponent({
  name: 'IBizCarousel',
  props: {
    autoplay: {
      type: Number,
      default: 3000,
    },
    duration: {
      type: Number,
      default: 500,
    },
    showIndicators: {
      type: Boolean,
      default: true,
    },
    touchable: {
      type: Boolean,
      default: true,
    },
    images: {
      type: Object as PropType<Array<ISysImage | IIcon>>,
    },
    attrs: {
      type: Object as PropType<IData>,
      required: false,
    },
  },
  setup() {
    const ns = useNamespace('carousel');
    return {
      ns,
    };
  },
  render() {
    if (this.images && this.images.length === 0) {
      return null;
    }
    return (
      <div class={[this.ns.b()]}>
        <van-swipe
          autoplay={this.autoplay}
          duration={this.duration}
          lazy-render
          show-indicators={this.showIndicators}
          touchable={this.touchable}
          {...useFilterAttribute(this.$attrs)}
        >
          {this.images &&
            this.images.map(image => {
              return (
                <van-swipe-item key={image}>
                  <iBizIcon icon={image}></iBizIcon>
                </van-swipe-item>
              );
            })}
        </van-swipe>
      </div>
    );
  },
});
