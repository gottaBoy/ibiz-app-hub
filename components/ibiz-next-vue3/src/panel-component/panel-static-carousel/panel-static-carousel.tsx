import { PanelItemController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IControlItemParam, IPanelRawItem } from '@ibiz/model-core';
import { defineComponent, PropType, ref, Ref } from 'vue';
import './panel-static-carousel.scss';

/**
 * 静态轮播图
 * @description 使用el-carousel组件，静态轮播组件，可配置静态图片用于轮播展示。
 * @panelitemparams {name:autoplay,parameterType:string,defaultvalue:-,description:为1时自动播放，为0时不自动播放}
 * @panelitemparams {name:timespan,parameterType:number,defaultvalue:3000,description:轮播间隔，单位ms}
 * @panelitemparams {name:showMode,parameterType:'DEFAULT' | 'CARD',defaultvalue:'DEFAULT',description:为CARD时展示卡片样式}
 * @primary
 */
export const PanelStaticCarousel = defineComponent({
  name: 'IBizPanelStaticCarousel',
  props: {
    /**
     * @description 静态轮播组件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 静态轮播组件控制器
     */
    controller: {
      type: PanelItemController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-static-carousel');

    const model = props.modelData;

    const carouselData: Ref<
      {
        id?: string;
        name?: string;
        imgUrl?: string;
        linkPath?: string;
        cssClass?: string;
      }[]
    > = ref([]);

    const isAuto = ref(true);

    const timeSpan = ref(3000);

    const showMode: Ref<'DEFAULT' | 'CARD'> = ref('DEFAULT');

    const getSwipeConfig = (swipeData: IControlItemParam[]) => {
      const autoPlay = swipeData.find(item => Object.is(item.key, 'autoplay'));
      if (autoPlay) {
        isAuto.value = !!Object.is(autoPlay.value, '1');
      }
      const span = swipeData.find(item => Object.is(item.key, 'timespan'));
      if (span) {
        timeSpan.value = Number(span.value) || 0;
      }
      const showModeItem = swipeData.find(item =>
        Object.is(item.key, 'showMode'),
      );
      if (showModeItem && showModeItem.value) {
        showMode.value = showModeItem.value as 'DEFAULT' | 'CARD';
      }
    };

    if (model.rawItem?.rawItemParams) {
      let swipeData: IControlItemParam[] = [];
      // 判断imgData后两位是否有配置参数
      const imgData = model.rawItem.rawItemParams;
      const autoplayIndex = imgData.findIndex(item =>
        Object.is(item.key, 'autoplay'),
      );
      const timespanIndex = imgData.findIndex(item =>
        Object.is(item.key, 'timespan'),
      );
      const showModeIndex = imgData.findIndex(item =>
        Object.is(item.key, 'showMode'),
      );
      let number = 0;
      if (autoplayIndex >= 0) {
        number += 1;
      }
      if (timespanIndex >= 0) {
        number += 1;
      }
      if (showModeIndex >= 0) {
        number += 1;
      }
      if (number > 0) {
        // 有配置参数就截掉配置参数
        swipeData = imgData.slice(0, -number);
        getSwipeConfig(imgData.slice(-number));
      } else {
        swipeData = imgData;
        getSwipeConfig(imgData);
      }
      carouselData.value = swipeData.map(item => {
        const { id, key, sysImage } = item;
        return {
          id,
          name: key,
          imgUrl: sysImage?.imagePath || sysImage?.rawContent,
          cssClass: sysImage?.cssClass,
          linkPath: (item as IData).linkPath,
        };
      });
    }

    return { ns, carouselData, isAuto, timeSpan, showMode };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <iBizCarouselComponent
          carouselData={this.carouselData}
          isAuto={this.isAuto}
          timeSpan={this.timeSpan}
          showMode={this.showMode}
        />
      </div>
    );
  },
});
