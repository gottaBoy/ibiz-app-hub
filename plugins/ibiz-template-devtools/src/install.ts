/* eslint-disable @typescript-eslint/no-explicit-any */
import { route2routePath } from '@ibiz-template/vue3-util';
import { IBizContext } from '@ibiz-template/core';
import { IModalData, openRedirectView } from '@ibiz-template/runtime';
import { IAppRedirectView } from '@ibiz/model-core';
import { CenterController } from './controller/center.controller';
import { registerDevtoolLocale } from './locale/helper';

/**
 * 安装
 *
 * @export
 */
export function install(): void {
  const { ibiz } = window;
  registerDevtoolLocale();
  ibiz.devTool = new CenterController();
  ibiz.devTool.init();
}

/**
 * 更新开发控制中心配置
 *
 * @author tony001
 * @date 2025-03-17 18:03:58
 * @export
 */
export function updateDevToolConfig(): void {
  ibiz.devTool.updateConfig(ibiz.appData?.context);
}

/**
 * 监听打开设计器
 *
 * @author tony001
 * @date 2025-02-07 18:02:50
 * @export
 * @param {IData} router
 */
export function listenOpenDevTool(router: IData): void {
  // 跳转设计视图
  const redirectDesignView = async (
    appContext: IParams | undefined,
    _context: IData,
  ): Promise<IModalData | undefined> => {
    if (_context.srfredirectview && _context.psappview) {
      const viewCodeName = _context.srfredirectview;
      const fullViewModel = await ibiz.hub.getAppView(viewCodeName);
      delete _context.srfredirectview;
      const parentContext = IBizContext.create({});
      if (ibiz.appData?.context) {
        Object.assign(parentContext, ibiz.appData.context);
      }
      const context = IBizContext.create(_context, parentContext);
      if (appContext) Object.assign(context, appContext);
      if (!context.srfappid)
        Object.assign(context, { srfappid: fullViewModel.appId });
      return openRedirectView(
        fullViewModel as IAppRedirectView,
        context,
        {},
        {},
      );
    }
  };
  // 监听路由准备完成
  router.isReady().then(async () => {
    const { appContext, pathNodes } = route2routePath(
      router.currentRoute.value as any,
    );
    if (pathNodes && pathNodes.length > 0) {
      const firstPathNode = pathNodes[0];
      if (firstPathNode && firstPathNode.context) {
        redirectDesignView(appContext, firstPathNode.context);
      }
    }
  });
  // 监听消息事件
  window.addEventListener(
    'message',
    async (event: MessageEvent) => {
      const { data } = event;
      if (data && data.type && data.type === 'IBzOpenAppView' && data.context) {
        const { appContext } = route2routePath(
          router.currentRoute.value as any,
        );
        redirectDesignView(appContext, data.context);
      }
    },
    false,
  );
}
