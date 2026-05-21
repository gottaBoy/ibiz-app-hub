/* eslint-disable @typescript-eslint/no-explicit-any */

import { listenJSEvent, NOOP } from '@ibiz-template/core';
import { isNil } from 'ramda';
import { onBeforeUnmount, Ref, watch } from 'vue';

/**
 * 监听JS原生事件，返回cleanup回调，调用后删除该监听
 *
 * @author lxm
 * @date 2022-10-28 18:10:36
 * @export
 * @param {Ref} elRef 监听组件的ref
 * @param {string} eventName 监听事件名称
 * @param {(..._args: any[]) => any} listener 监听回调
 * @param {AddEventListenerOptions} options 额外参数
 * @returns {*}  {() => void}
 */
export function useEventListener(
  elRef: Ref,
  eventName: string,
  listener: (..._args: any[]) => any,
  options: AddEventListenerOptions = {},
): () => void {
  let cleanup = NOOP;

  watch(
    elRef,
    (newVal: IData, oldVal) => {
      if (newVal !== oldVal) {
        if (isNil(newVal)) {
          cleanup();
          cleanup = NOOP;
        } else {
          cleanup = listenJSEvent(
            (newVal as any)?.$el || newVal,
            eventName,
            listener,
            options,
          );
        }
      }
    },
    { immediate: true },
  );

  // 组件销毁前销毁监听
  onBeforeUnmount(() => {
    if (cleanup !== NOOP) {
      cleanup();
    }
  });

  return () => {
    cleanup();
  };
}
