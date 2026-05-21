import { RuntimeError } from '@ibiz-template/core';
import { getNestedRoutePath } from '@ibiz-template/vue3-util';
import {
  Router,
  RouteLocationNormalizedLoaded as Route,
  isNavigationFailure,
} from 'vue-router';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { QXEvent } from 'qx-util';

type ViewStackEvent = {
  onBeforeStackChange: (type: 'push' | 'pop') => void;
};

export interface IViewStack {
  /**
   * 缓存视图唯一标识集合
   * @author lxm
   * @date 2023-06-28 02:22:58
   * @type {string[]}
   */
  cacheKeys: string[];

  /**
   * 当前显示的视图的唯一标识
   * @author lxm
   * @date 2023-06-28 02:23:18
   * @type {string}
   */
  currentKey: string;
}

/**
 * 计算唯一标识,并返回是否要缓存
 * @author lxm
 * @date 2023-06-29 08:41:51
 * @export
 * @param {Route} route
 * @return {*}  {string}
 */
export function calcUniqueKey(route: Route): { key: string; isCache: boolean } {
  const match1 = route.matched[0];
  let key = '';
  let isCache = true;
  // login等预置视图，直接返回path
  if (match1.meta.preset) {
    key = match1.path;
    isCache = false;
  }
  // 一级是home时，唯一标识是到二级路由为止，反之只算到一级路由
  key = getNestedRoutePath(route, match1.meta.home ? 2 : 1);

  return { key, isCache };
}

export const useViewStack = defineStore('viewStack', () => {
  let router: Router;

  const evt = new QXEvent<ViewStackEvent>();
  const on = evt.on.bind(evt);
  const off = evt.off.bind(evt);

  const viewInfoMap = new Map<string, { key: string; fullPath: string }>();

  const viewStack = reactive<IViewStack>({
    cacheKeys: [],
    currentKey: '',
  });

  /**
   * @description 清空视图堆栈
   */
  const clear = () => {
    viewStack.cacheKeys = [];
    viewStack.currentKey = '';
    viewInfoMap.clear();
  };

  /**
   * 更新视图信息
   * @author lxm
   * @date 2023-06-29 09:17:54
   * @param {string} key
   * @param {Route} route
   */
  const updateViewInfo = (key: string, route: Route) => {
    if (viewInfoMap.has(key)) {
      const info = viewInfoMap.get(key)!;
      info.fullPath = route.fullPath;
    } else {
      viewInfoMap.set(key, { key, fullPath: route.fullPath });
    }
  };

  /**
   * 新的视图进入堆栈
   * @author lxm
   * @date 2023-06-29 09:16:57
   * @param {string} key
   * @param {Route} route
   */
  const push = (key: string, route: Route) => {
    evt.emit('onBeforeStackChange', 'push');
    viewStack.cacheKeys.push(key);
    updateViewInfo(key, route);
    viewStack.currentKey = key;
  };

  /**
   * 弹出最新的一个视图
   * @author lxm
   * @date 2023-06-29 09:17:13
   */
  const pop = () => {
    if (viewStack.cacheKeys.length < 2) {
      throw new RuntimeError(ibiz.i18n.t('util.cacheWarningPrompt'));
    }
    evt.emit('onBeforeStackChange', 'pop');
    const popKey = viewStack.cacheKeys.pop();
    viewInfoMap.delete(popKey!);
    viewStack.currentKey = viewStack.cacheKeys[viewStack.cacheKeys.length - 1];
  };

  const init = (_router: Router) => {
    router = _router;
    _router.afterEach((to, _form, failure) => {
      if (isNavigationFailure(failure)) {
        return;
      }
      const { key, isCache } = calcUniqueKey(to);
      if (isCache) {
        if (key === viewStack.currentKey) {
          // 一级路由没变,更新视图信息
          updateViewInfo(key, to);
        } else if (viewStack.cacheKeys.includes(key)) {
          // 如果跳转的是首页则清空缓存，并重新添加视图缓存
          if (key === '/-/index/-') {
            clear();
            push(key, to);
          } else {
            // 跳转到已经缓存的页面，只有返回后退这一种情况，弹出记录
            pop();
          }
        } else {
          // 缓存里没有的就是push新的页面
          push(key, to);
        }
      }

      // 变更当前key，刷新视图的绘制
      viewStack.currentKey = key;
    });
  };

  /**
   * 返回堆栈里上一个视图
   * @author lxm
   * @date 2023-06-29 09:10:16
   */
  const goBack = () => {
    // fix: 直接调用router.back()，避免浏览器维护的历史记录和view-stack不一致的问题（在线预约平台：0267）
    router.back();
  };

  return { viewStack, init, on, off, goBack };
});
