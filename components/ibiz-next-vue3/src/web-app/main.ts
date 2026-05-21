// eslint-disable-next-line import/order
import { install as installCore } from '@ibiz-template/core';
import { install as installRuntime } from '@ibiz-template/runtime';
import {
  install as installDevTool,
  listenOpenDevTool,
} from '@ibiz-template/devtool';
import {
  AppHooks,
  OverlayContainer,
  PluginFactory,
  route2routePath,
  useAppStore,
} from '@ibiz-template/vue3-util';
import { Plugin } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { createVueApp } from './create-vue-app';

import { attachEnvironmentConfig } from './attach-environment-config';
import App from './App';
import { UnauthorizedHandler } from './util';
import { AppRouter } from './router';
import {
  AppUtil,
  ConfirmUtil,
  LoadingUtil,
  MessageUtil,
  ModalUtil,
  NoticeUtil,
  NotificationUtil,
  OpenViewUtil,
  OverlayController,
  RenderUtil,
  FullscreenUtil,
  InLineAIUtil,
  AIChatUtil,
  ScreenShotUtil,
  PrintPreviewUtil,
} from '../util';
import { AuthGuard, DynaAuthGuard } from './guard';

export async function runApp(
  plugins?: Plugin[],
  opts?: {
    getAuthGuard?: () => AuthGuard;
    userRoutes?: RouteRecordRaw[];
  },
): Promise<void> {
  AppHooks.createApp.tap((_, app) => {
    if (plugins) {
      plugins.forEach(plugin => {
        app.use(plugin);
      });
    }
  });

  installCore();
  installRuntime();
  AppHooks.appResorceInited.call(ibiz.hub);
  // 初始化getGlobalParam
  ibiz.util.getGlobalParam = () => {
    return useAppStore().appStore;
  };

  // 初始化getRouterParams
  ibiz.util.getRouterParams = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
    const routePath = route2routePath(AppRouter.getRouter().currentRoute.value as any);
    return routePath.pathNodes;
  };

  // 插件对象初始化放置在创建 app 之前
  ibiz.plugin = new PluginFactory();

  ibiz.util.error.register(new UnauthorizedHandler());

  const app = createVueApp(App);
  OverlayContainer.createVueApp = createVueApp;

  // 全局 window 异常处理
  window.onerror = function (
    _event: Event | string,
    _source?: string,
    _lineno?: number,
    _colno?: number,
    error?: Error,
  ) {
    if (error) {
      ibiz.util.error.handle(error);
    }
    return true;
  };

  // 全局 promise 异常处理
  window.addEventListener('unhandledrejection', function (event) {
    // 阻止继续冒泡
    event.preventDefault();
    // 获取到未处理的promise对象
    event.promise.catch(err => {
      ibiz.util.error.handle(err);
    });
  });

  await attachEnvironmentConfig();
  installDevTool();

  let authGuard: AuthGuard;
  if (opts?.getAuthGuard) {
    authGuard = opts.getAuthGuard();
  } else {
    authGuard = new DynaAuthGuard();
  }
  AppRouter.setAuthGuard((context: IParams, notLogin?: boolean) =>
    authGuard.verify(context, notLogin),
  );
  app.use(AppRouter.getRouter(opts?.userRoutes));
  // 监听打开设计器
  listenOpenDevTool(AppRouter.getRouter());

  ibiz.appUtil = new AppUtil(AppRouter.getRouter());
  ibiz.openView = new OpenViewUtil(AppRouter.getRouter());
  ibiz.render = new RenderUtil();
  ibiz.message = new MessageUtil();
  ibiz.modal = new ModalUtil();
  ibiz.confirm = new ConfirmUtil();
  ibiz.notification = new NotificationUtil();
  ibiz.loading = new LoadingUtil();
  ibiz.notice = new NoticeUtil();
  ibiz.overlay = new OverlayController();
  ibiz.inLineAIUtil = new InLineAIUtil();
  ibiz.screenShotUtil = new ScreenShotUtil();
  ibiz.aiChatUtil = new AIChatUtil();
  ibiz.util.text.format = (value, code): string => {
    return app.config.globalProperties.$textFormat(value, code);
  };
  ibiz.printPreview = new PrintPreviewUtil();
  ibiz.fullscreenUtil = new FullscreenUtil();
  await ibiz.i18n.init();

  app.mount('#app');
}
