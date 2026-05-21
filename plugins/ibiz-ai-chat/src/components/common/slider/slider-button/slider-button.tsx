import { forwardRef, useImperativeHandle } from 'preact/compat';
import { useComputed, useSignal } from '@preact/signals';
import { MutableRef, useEffect, useRef } from 'preact/hooks';
import { Namespace } from '../../../../utils';

interface SliderButtonProps {
  /**
   * 值
   */
  value: number;
  /**
   * 最小值
   */
  min: number;
  /**
   * 最大值
   */
  max: number;
  /**
   * 步长
   */
  step: number;
  /**
   * 值改变
   * @param value
   * @returns
   */
  onChange: (value: number) => void;
}

export interface SliderButtonHandle {
  onButtonDown: (event: MouseEvent | TouchEvent) => void;
  setPosition: (value: number) => void;
  state: MutableRef<{
    dragging: boolean;
    startX: number;
    newPosition: number;
    startPosition: number;
  }>;
}

const ns = new Namespace('chat-slider');

export const SliderButton = forwardRef<SliderButtonHandle, SliderButtonProps>(
  (props, ref) => {
    const { min, max, step, onChange } = props;

    const button = useRef<HTMLDivElement>(null);

    const value = useSignal<number>(props.value);

    const precision = Math.max.apply(
      null,
      [min, max, step].map(item => {
        const decimal = `${item}`.split('.')[1];
        return decimal ? decimal.length : 0;
      }),
    );

    const state = useRef({
      dragging: false,
      startX: 0,
      newPosition: 0,
      startPosition: 0,
    });

    const position = useComputed(() => {
      return `${((value.value - min) / (max - min)) * 100}%`;
    });

    useEffect(() => {
      value.value = props.value;
    }, [props.value]);

    /**
     * 获取鼠标位置
     * @param event
     * @returns
     */
    const getClientXY = (
      event: MouseEvent | TouchEvent,
    ): {
      clientX: number;
      clientY: number;
    } => {
      let clientX: number;
      let clientY: number;
      if (event.type.startsWith('touch')) {
        clientY = (event as TouchEvent).touches[0].clientY;
        clientX = (event as TouchEvent).touches[0].clientX;
      } else {
        clientY = (event as MouseEvent).clientY;
        clientX = (event as MouseEvent).clientX;
      }
      return {
        clientX,
        clientY,
      };
    };

    /**
     * 设置位置
     * @param newPosition
     * @returns
     */
    const setPosition = async (newPosition: number) => {
      if (newPosition === null || Number.isNaN(+newPosition)) return;
      if (newPosition < 0) {
        newPosition = 0;
      } else if (newPosition > 100) {
        newPosition = 100;
      }

      const lengthPerStep = 100 / ((max - min) / step);
      const steps = Math.round(newPosition / lengthPerStep);
      let newValue = steps * lengthPerStep * (max - min) * 0.01 + min;
      newValue = Number.parseFloat(newValue.toFixed(precision));
      if (newValue !== props.value) onChange(newValue);
    };

    /**
     * 开始拖拽
     * @param event
     */
    const onDragStart = (event: MouseEvent | TouchEvent) => {
      const { clientX } = getClientXY(event);
      const X = Number.parseFloat(position.value);
      Object.assign(state.current, {
        dragging: true,
        startX: clientX,
        startPosition: X,
        newPosition: X,
      });
    };

    /**
     * 拖拽中
     * @param event
     */
    const onDragging = (event: MouseEvent | TouchEvent) => {
      if (!state.current.dragging) return;
      const { clientX } = getClientXY(event);
      const parentWith = button.current!.parentElement!.clientWidth;
      const diff: number =
        ((clientX - state.current.startX) / parentWith) * 100;
      state.current.newPosition = state.current.startPosition + diff;
      setPosition(state.current.newPosition);
    };

    /**
     * 拖拽结束
     */
    const onDragEnd = () => {
      if (!state.current.dragging) return;
      state.current.dragging = false;
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('touchmove', onDragging);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchend', onDragEnd);
    };

    /**
     * 按钮点击
     * @param event
     */
    const onButtonDown = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      onDragStart(event);
      window.addEventListener('mousemove', onDragging);
      window.addEventListener('touchmove', onDragging);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchend', onDragEnd);
      button.current!.focus();
    };

    useImperativeHandle(ref, () => ({
      state,
      onButtonDown,
      setPosition,
    }));

    return (
      <div
        ref={button}
        className={ns.e('button-wrapper')}
        onMouseDown={onButtonDown}
        onTouchStart={onButtonDown}
        style={{ left: position.value }}
      >
        <div className={ns.e('button')} />
      </div>
    );
  },
);
