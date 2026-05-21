/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, Ref, ref, watch } from 'vue';
import { createUUID } from 'qx-util';
import './cropping.scss';

export const IBizCropping = defineComponent({
  name: 'IBizCropping',
  props: {
    // 传递一个文件对象进来
    img: {
      type: Object as PropType<IData>,
    },
    // 未传递img时，使用传递的url获取图片
    url: {
      type: String,
    },
    // 截取区域宽度
    cropareaWidth: {
      type: Number,
      default: 300,
    },
    // 截取区域高度
    cropareaHeight: {
      type: Number,
      default: 200,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('cropping');
    // 是否已点击确定
    const isConfirm = ref(false);
    const isLoading = ref(false);
    // 缩放比例
    const scaleNumber = ref(1);
    // 是否允许移动
    const allowMove = ref(false);
    // 图片Ref
    const imgRef = ref();
    // 图片移动位置
    const imgMovePosition: Ref<IData> = ref({
      x: 0, // 鼠标X轴移动距离
      y: 0, // 鼠标Y轴移动距离
      tx: 0, // 图片X轴已有偏移量
      ty: 0, // 图片Y轴已有偏移量
    });

    // 上一次缩放时两指的距离
    let lastDistance = 0; // 最后一次距离
    // 剪切框容器
    const cropContainerRef = ref();
    // 截取区域元素id
    const uuid = createUUID();
    // 计算截取图片的url
    const cropImgUrl = computed(() => {
      if (props.img?.raw) {
        return URL.createObjectURL(props.img.raw);
      }
      if (props.url) {
        return props.url;
      }
      return '';
    });

    // 重置剪切状态
    const resetState = () => {
      imgMovePosition.value = {
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
      };
      scaleNumber.value = 1;
      isConfirm.value = false;
      lastDistance = 0;
    };

    // 缩小
    const onReduce = () => {
      if (scaleNumber.value > 1) {
        scaleNumber.value = (scaleNumber.value * 10 - 1) / 10;
      }
    };

    // 放大
    const onAdd = () => {
      if (scaleNumber.value < 3) {
        scaleNumber.value = (scaleNumber.value * 10 + 1) / 10;
      }
    };

    // 获取两点之间距离
    const getDistance = (start: IData, end: IData) => {
      return Math.hypot(end.pageX - start.pageX, end.pageY - start.pageY);
    };

    // 图片偏移样式
    const style = computed(() => {
      const imgStyle: IData = {
        maxWidth: `${props.cropareaWidth}px`,
        maxHeight: `${props.cropareaHeight}px`,
        objectFit: 'contain',
        transform: `translate(calc(${imgMovePosition.value.tx}px - 50%),calc(${imgMovePosition.value.ty}px - 50%)) scale(${scaleNumber.value})`,
      };
      return imgStyle;
    });

    // 取消
    const onCancel = () => {
      resetState();
      emit('change', '');
    };

    // 确认
    const onConfirm = async () => {
      if (isConfirm.value) return;
      isConfirm.value = true;
      isLoading.value = true;
      let cropDataUrl = '';
      const croparea = document.getElementById(uuid);
      if (croparea && imgRef.value) {
        // 根据截取区域和图片的相对位置，计算截取位置的起始位置
        const { left: cropLeft, top: cropTop } =
          croparea.getBoundingClientRect();
        const { left: imgLeft, top: imgTop } =
          imgRef.value.getBoundingClientRect();

        const distanceX = imgLeft - cropLeft;
        const distanceY = imgTop - cropTop;

        const cropcanvas = await ibiz.util.html2canvas.getCanvas(imgRef.value, {
          x: -distanceX, // 指定截取区域的左上角 x 坐标
          y: -distanceY, // 指定截取区域的左上角 y 坐标
          width: props.cropareaWidth, // 指定截取区域的宽度
          height: props.cropareaHeight, // 指定截取区域的高度
        });
        cropDataUrl = cropcanvas.toDataURL('image/png');
      }
      // 确认，截取裁剪框的内容
      emit('change', cropDataUrl);
      isLoading.value = false;
    };

    watch(
      () => props.show,
      () => {
        if (props.show) {
          resetState();
        }
      },
      {
        immediate: true,
      },
    );

    // 触摸屏幕
    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touches = event.touches;
      if (touches.length === 2) {
        // 缩放
        lastDistance = getDistance(touches[0], touches[1]);
      } else if (touches.length === 1) {
        const touch = event.touches[0];
        const x = touch.pageX;
        const y = touch.pageY;
        imgMovePosition.value.x = x;
        imgMovePosition.value.y = y;
        allowMove.value = true;
      }
    };

    // 开始移动/缩放
    const onTouchMove = (event: TouchEvent) => {
      if (!allowMove.value || !imgRef.value) {
        return;
      }
      const touches = event.touches;
      if (touches.length === 2) {
        // 缩放
        const space = getDistance(touches[0], touches[1]);
        if (space > lastDistance + 10) {
          // 放大
          lastDistance = space;
          onAdd();
        } else if (space < lastDistance - 10) {
          // 缩小
          lastDistance = space;
          onReduce();
        }
        return;
      }
      // 移动
      const touch = event.touches[0];

      const x = touch.pageX;
      const y = touch.pageY;

      // 当前X轴偏移位置
      const spaceX = x - imgMovePosition.value.x + imgMovePosition.value.tx;
      // 当前Y轴偏移位置
      const spaceY = y - imgMovePosition.value.y + imgMovePosition.value.ty;
      imgMovePosition.value.tx = spaceX;
      imgMovePosition.value.ty = spaceY;

      imgMovePosition.value.x = x;
      imgMovePosition.value.y = y;
    };
    // 移动结束
    const onTouchEnd = (_event: TouchEvent) => {
      allowMove.value = false;
    };

    return {
      ns,
      style,
      uuid,
      imgRef,
      isLoading,
      cropImgUrl,
      scaleNumber,
      imgMovePosition,
      cropContainerRef,
      onAdd,
      onReduce,
      onCancel,
      onConfirm,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} v-loading={this.isLoading}>
        <div class={this.ns.e('content')}>
          <div class={this.ns.em('content', 'crop')} ref='cropContainerRef'>
            <div
              id={this.uuid}
              class={this.ns.em('content', 'croparea')}
              style={{
                height: `${this.cropareaHeight}px`,
                width: `${this.cropareaWidth}px`,
              }}
              onTouchstart={this.onTouchStart}
              onTouchmove={this.onTouchMove}
              onTouchend={this.onTouchEnd}
            ></div>
            <img
              style={this.style}
              ref='imgRef'
              class={this.ns.em('content', 'img')}
              src={this.cropImgUrl}
              alt=''
            />
          </div>
        </div>
        <div class={this.ns.e('footer')}>
          <div class={this.ns.em('footer', 'cancel')} onClick={this.onCancel}>
            {ibiz.i18n.t('editor.common.cancel')}
          </div>
          <div class={this.ns.em('footer', 'confirm')} onClick={this.onConfirm}>
            {ibiz.i18n.t('editor.common.confirm')}
          </div>
        </div>
      </div>
    );
  },
});
