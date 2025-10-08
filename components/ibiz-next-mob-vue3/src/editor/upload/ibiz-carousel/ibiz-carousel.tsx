import { computed, defineComponent } from 'vue';
import {
  getEditorEmits,
  getUploadProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-carousel.scss';
import { toNumber } from 'lodash-es';
import { useVanUpload } from '../use/use-van-upload';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * 轮播图（扩展）
 * @primary
 * @description 使用van-swipe组件，用于对图片数组进行轮播，提供了自动轮播，设置轮播动画时长，显示项指示器以及支持手势滑动的功能。是预制类型，类型为：FIELD_CAROUSEL_PICTURE
 * @editorparams {name:autoplay,parameterType:number,defaultvalue:3000,description:轮播间隔，van-swipe组件的autoplay属性}
 * @editorparams {name:duration,parameterType:number,defaultvalue:500,description:动画时长，van-swipe组件的duration属性}
 * @editorparams {name:showIndicators,parameterType:boolean,defaultvalue:true,description:是否显示指示器，van-swipe组件的show-indicators属性}
 * @editorparams {name:touchable,parameterType:boolean,defaultvalue:true,description:是否可以通过手势滑动，van-swipe组件的touchable属性}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | change | infoTextChange
 */
export const IBizEditorCarousel = defineComponent({
  name: 'IBizEditorCarousel',
  props: getUploadProps<UploadEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('carousel');
    const c = props.controller;

    const { files } = useVanUpload(
      props,
      value => {
        emit('change', value);
      },
      c,
    );
    const editorModel = c.model;
    // 轮播间隔
    let autoplay = 3000;
    // 动画时长
    let duration = 500;
    // 是否显示指示器
    let showIndicators = true;
    // 是否可以通过手势滑动
    let touchable = true;
    if (editorModel.editorParams) {
      if (editorModel.editorParams.autoplay) {
        autoplay = toNumber(editorModel.editorParams.autoplay);
      }
      if (editorModel.editorParams.duration) {
        duration = toNumber(editorModel.editorParams.duration);
      }
      if (editorModel.editorParams.showIndicators) {
        showIndicators = editorModel.editorParams.showIndicators === 'true';
      }
      if (editorModel.editorParams.touchable) {
        touchable = editorModel.editorParams.touchable === 'true';
      }
    }

    const images = computed(() => {
      return files.value.map(item => {
        return { rawContent: item.url };
      });
    });

    return {
      ns,
      c,
      images,
      autoplay,
      duration,
      showIndicators,
      touchable,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        <iBizCarousel
          images={this.images}
          autoplay={this.autoplay}
          duration={this.duration}
          showIndicators={this.showIndicators}
          touchable={this.touchable}
          attrs={this.$attrs}
        ></iBizCarousel>
      </div>
    );
  },
});
