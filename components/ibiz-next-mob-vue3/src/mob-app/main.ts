/* eslint-disable @typescript-eslint/no-explicit-any */
import { install as installCore } from '@ibiz-template/core';
import {
  getPlatformProvider,
  install as installRuntime,
} from '@ibiz-template/runtime';
import {
  listenOpenDevTool,
  install as installDevTool,
} from '@ibiz-template/devtool';
import {
  AppHooks,
  useAppStore,
  PluginFactory,
  route2routePath,
  OverlayContainer,
} from '@ibiz-template/vue3-util';
import { Plugin } from 'vue';
import { RouteRecordRaw } from 'vue-router';
// 此处必须要引入，否则无法使用
// eslint-disable-next-line import/no-extraneous-dependencies, unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars, no-unused-vars
import dd from 'dingtalk-jsapi';
import App from './App';
import { attachEnvironmentConfig } from './attach-environment-config';
import { createVueApp } from './create-vue-app';
import { AppRouter } from './router';
import { UnauthorizedHandler } from './util';
import {
  AppUtil,
  ConfirmUtil,
  LoadingUtil,
  MessageUtil,
  ModalUtil,
  NotificationUtil,
  OpenViewUtil,
  OverlayController,
  FullscreenUtil,
  QrcodeUtil,
  AIChatUtil,
  PrintPreviewUtil,
} from '../util';
import { AuthGuard, DynaAuthGuard } from './guard';

export async function runApp(
  plugins?: Plugin[],
  opts?: {
    getAuthGuard: () => AuthGuard;
    userRoutes?: RouteRecordRaw[];
  },
): Promise<void> {
  AppHooks.createApp.tap((_, app) => {
    if (plugins) {
      plugins.forEach(plugin => {
        app.use(plugin as any);
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
    const routePath = route2routePath(
      AppRouter.getRouter().currentRoute.value as any,
    );
    return routePath.pathNodes;
  };

  // 插件对象初始化放置在创建 app 之前
  ibiz.plugin = new PluginFactory();
  ibiz.util.error.register(new UnauthorizedHandler());
  const app = createVueApp(App);

  (OverlayContainer as any).createVueApp = createVueApp;

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
  const router = AppRouter.getRouter(opts?.userRoutes);
  app.use(router);
  // 监听打开设计器
  listenOpenDevTool(router);

  ibiz.appUtil = new AppUtil(router);
  ibiz.openView = new OpenViewUtil(router);
  ibiz.message = new MessageUtil();
  ibiz.modal = new ModalUtil();
  ibiz.confirm = new ConfirmUtil();
  ibiz.notification = new NotificationUtil();
  ibiz.loading = new LoadingUtil();
  ibiz.overlay = new OverlayController();
  ibiz.platform = getPlatformProvider();
  ibiz.fullscreenUtil = new FullscreenUtil();
  ibiz.printPreview = new PrintPreviewUtil();
  ibiz.util.text.format = (value, code): string => {
    return app.config.globalProperties.$textFormat(value, code);
  };
  ibiz.qrcodeUtil = new QrcodeUtil();
  ibiz.aiChatUtil = new AIChatUtil();

  await ibiz.i18n.init();

  app.mount('#app');
}

// createApp();
