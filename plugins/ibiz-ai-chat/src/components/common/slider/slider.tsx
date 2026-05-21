import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Namespace } from '../../../utils';
import {
  SliderButton,
  SliderButtonHandle,
} from './slider-button/slider-button';
import './slider.scss';

export interface SliderProps {
  /**
   * 步长
   * - 默认为1
   */
  step?: number;
  /**
   * 最小值
   * - 默认为0
   */
  min?: number;
  /**
   * 最大值
   * - 默认为100
   */
  max?: number;
  /**
   * 值
   * - 默认为0
   */
  value?: number;
  /**
   * 值变更
   * @param value
   * @returns
   */
  onChange?: (value: number) => void;
}

const ns = new Namespace('chat-slider');

export const Slider = (props: SliderProps) => {
  const { step = 1, min = 0, max = 100, value = 0, onChange } = props;

  const slider = useRef<HTMLDivElement>(null);

  const button = useRef<SliderButtonHandle>(null);

  const modelValue = useSignal<number>(value);

  const barStyle = useComputed(() => {
    return {
      width: `${(100 * (modelValue.value - min)) / (max - min)}%`,
      left: '0%',
    };
  });

  useEffect(() => {
    if (value !== undefined) modelValue.value = value;
  }, [value]);

  /**
   * 处理值变更
   * @param val
   */
  const handleChange = (val: number): void => {
    modelValue.value = val;
    onChange?.(val);
  };

  /**
   * 滑块点击
   * @param event
   */
  const onSliderDown = (event: MouseEvent | TouchEvent): void => {
    if (!button.current || button.current.state.current.dragging) return;
    let newPercent: number = 0;
    const clientX =
      (event as TouchEvent).touches?.item(0)?.clientX ??
      (event as MouseEvent).clientX;
    const { left, width } = slider.current!.getBoundingClientRect();
    newPercent = ((clientX - left) / width) * 100;
    if (newPercent < 0 || newPercent > 100) return;
    button.current.setPosition(newPercent);
    setTimeout(() => {
      button.current!.onButtonDown(event);
    }, 0);
  };

  return (
    <div className={ns.b()} title={`${modelValue.value}`}>
      <div
        ref={slider}
        className={ns.e('runway')}
        onMouseDown={onSliderDown}
        onTouchStart={onSliderDown}
      >
        <div className={ns.e('bar')} style={barStyle.value} />
        <SliderButton
          min={min}
          max={max}
          step={step}
          ref={button}
          value={modelValue.value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
