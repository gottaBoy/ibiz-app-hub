/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NOOP,
  onClickOutside,
  OnClickOutsideHandler,
  OnClickOutsideOptions,
  OnClickOutsideResult,
} from '@ibiz-template/core';
import { isNil } from 'ramda';
import { onBeforeUnmount, Ref, watch } from 'vue';

/**
 * 使用点击组件外部监听事件
 *
 * @author lxm
 * @date 2022-10-31 14:10:12
 * @export
 * @param {Ref} elRef 组件的ref对象
 * @param {OnClickOutsideHandler} handler 处理回调
 * @param {OnClickOutsideOptions} [options={}] 额外配置参数
 * @returns {*}  {OnClickOutsideResult}
 */
export function useClickOutside(
  elRef: Ref,
  handler: OnClickOutsideHandler,
  options: OnClickOutsideOptions = {},
): OnClickOutsideResult {
  let stop = NOOP;
  let pause = NOOP;
  let proceed = NOOP;

  // 移除监听，清空方法
  const destroy = (): void => {
    stop();
    stop = NOOP;
    pause = NOOP;
    proceed = NOOP;
  };

  watch(
    elRef,
    (newVal: IData, oldVal) => {
      if (newVal !== oldVal) {
        if (isNil(newVal)) {
          destroy();
        } else {
          const result = onClickOutside(
            (newVal as any)?.$el || newVal,
            handler,
            options,
          );
          stop = result.stop;
          pause = result.pause;
          proceed = result.proceed;
        }
      }
    },
    { immediate: true },
  );

  // 组件销毁前销毁监听
  onBeforeUnmount(() => {
    if (stop !== NOOP) {
      destroy();
    }
  });

  return {
    stop: () => stop(),
    pause: () => pause(),
    proceed: () => proceed(),
  };
}
