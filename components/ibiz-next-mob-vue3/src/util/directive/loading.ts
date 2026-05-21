import { useNamespace } from '@ibiz-template/vue3-util';
import { showLoadingToast, ToastOptions, ToastWrapperInstance } from 'vant';
import { Directive, DirectiveBinding } from 'vue';

const INSTANCE_KEY = Symbol('vanLoading');

/**
 * 加载元素接口
 *
 * @author zk
 * @date 2023-10-20 02:10:56
 * @export
 * @interface ElementLoading
 * @extends {HTMLElement}
 */
export interface ElementLoading extends HTMLElement {
  [INSTANCE_KEY]?: {
    instance: ToastWrapperInstance;
  };
}

/**
 * 创建加载元素
 *
 * @author zk
 * @date 2023-10-20 02:10:58
 * @param {ElementLoading} el
 */
const createInstance = (el: ElementLoading) => {
  const ns = useNamespace('loading');
  const options: ToastOptions = {
    message: `${ibiz.i18n.t('util.loading')}...`,
    forbidClick: true,
    teleport: el,
    duration: 0,
    className: ns.b(),
    loadingType: 'spinner',
    overlayClass: ns.e('overlay'),
  };
  el[INSTANCE_KEY] = {
    instance: showLoadingToast(options),
  };
};

/**
 * 加载指令
 *
 * @author zk
 * @date 2023-10-20 02:10:58
 * @param {ElementLoading} el
 */
export const loadingDirective: Directive = {
  mounted(el, binding) {
    if (binding.value) {
      createInstance(el);
    }
  },
  updated(el: ElementLoading, binding: DirectiveBinding<boolean>) {
    const instance = el[INSTANCE_KEY];
    if (binding.oldValue !== binding.value) {
      if (binding.value && !binding.oldValue) {
        createInstance(el);
      } else {
        instance?.instance.close();
      }
    }
  },
  unmounted(el: ElementLoading) {
    el[INSTANCE_KEY]?.instance.close();
  },
};
