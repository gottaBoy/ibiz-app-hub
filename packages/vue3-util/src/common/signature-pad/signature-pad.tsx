import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  ref,
} from 'vue';
import { isString } from 'lodash-es';
import { useNamespace } from '../../use';
import SignaturePad from './util/signature_pad';
import type { ISignaturePadOptions } from './util/signature_pad';
import './signature-pad.scss';

export const IBizSignaturePad = defineComponent({
  name: 'IBizSignaturePad',
  props: {
    options: {
      type: Object as PropType<IData>,
    },
  },
  setup(props) {
    const ns = useNamespace('signature-pad');

    const signaturePadRef = ref();
    const canvasRef = ref();
    const signaturePad = ref<SignaturePad | undefined>();

    const getSignatureOptions = (): ISignaturePadOptions => {
      const _options = {};
      if (props.options) {
        const {
          dotsize,
          minwidth,
          maxwidth,
          pencolor,
          velocityfilterweight,
          compositeoperation,
          mindistance,
          backgroundcolor,
          throttle,
          canvascontextoptions,
        } = props.options;

        // 处理数值类型属性
        if (dotsize) {
          Object.assign(_options, { dotSize: Number(dotsize) });
        }
        if (minwidth) {
          Object.assign(_options, { minWidth: Number(minwidth) });
        }
        if (maxwidth) {
          Object.assign(_options, { maxWidth: Number(maxwidth) });
        }
        if (velocityfilterweight) {
          Object.assign(_options, {
            velocityFilterWeight: Number(velocityfilterweight),
          });
        }
        if (mindistance) {
          Object.assign(_options, { minDistance: Number(mindistance) });
        }
        if (throttle) {
          Object.assign(_options, { throttle: Number(throttle) });
        }

        // 处理字符串类型属性
        if (pencolor) {
          Object.assign(_options, { penColor: String(pencolor) });
        }
        if (compositeoperation) {
          Object.assign(_options, {
            compositeOperation: String(compositeoperation),
          });
        }
        if (backgroundcolor) {
          Object.assign(_options, { backgroundColor: String(backgroundcolor) });
        }

        // 处理对象类型属性（保持原有结构）
        if (canvascontextoptions) {
          let canvasContextOptions = canvascontextoptions;
          if (isString(canvascontextoptions)) {
            try {
              canvasContextOptions = JSON.parse(canvascontextoptions);
            } catch (error) {
              ibiz.log.error(error);
              canvasContextOptions = undefined;
            }
          }
          Object.assign(_options, {
            canvasContextOptions: { ...canvasContextOptions },
          });
        }
      }
      return _options;
    };

    const preventScroll = (_e: MouseEvent) => {
      _e.preventDefault();
    };

    const initSignaturePad = (_callback?: () => void) => {
      nextTick(() => {
        const canvas = canvasRef.value;
        const signatures = signaturePadRef.value;
        if (!canvas) return;

        // 获取设备像素比(DPR)： 设备像素比(Device Pixel Ratio)表示一个CSS像素对应多少个设备物理像素
        const dpr = window.devicePixelRatio || 1;
        const rect = signatures.getBoundingClientRect();

        const canvasWidth = rect.width < 300 ? 300 : rect.width;
        const canvasHeight = rect.height < 150 ? 150 : rect.height;

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;

        signaturePad.value = new SignaturePad(canvas, {
          ...getSignatureOptions(),
        });

        // 使事件坐标与实际绘制位置匹配。
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // 触摸支持：禁用触摸设备的默认滚动行为，确保签名体验流畅
        canvas.addEventListener('touchstart', preventScroll, {
          passive: false,
        });
        canvas.addEventListener('touchmove', preventScroll, { passive: false });
        _callback?.();
      });
    };

    const updateSignaturePad = (_callback?: () => void) =>
      initSignaturePad(_callback);

    const handleResize = () => {
      if (signaturePad.value) {
        signaturePad.value.off();
        updateSignaturePad();
      }
    };

    onMounted(() => {
      initSignaturePad();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      ns,
      canvasRef,
      signaturePadRef,
      signaturePad,
      updateSignaturePad,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} ref='signaturePadRef'>
        <div class={this.ns.e('container')}>
          <canvas ref='canvasRef'></canvas>
        </div>
      </div>
    );
  },
});
