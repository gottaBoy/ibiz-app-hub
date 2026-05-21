/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteRecordRaw,
  Router,
  createRouter,
  createWebHashHistory,
} from 'vue-router';
import { Modal, RouteConst, ViewMode } from '@ibiz-template/runtime';
import { isNilOrEmpty } from 'qx-util';
import { AppRedirectView } from '@ibiz-template/vue3-util';
import qs from 'qs';
import { RouterShell, HomeView, ModalRouterShell } from '../components';
import { DownloadView, LoginView, View404 } from '../../view';
import {
  useViewStack,
  splitPathToSegments,
  validateRouteSegments,
} from '../../util';

const getPropsCallback = (depth: number) => {
  if (depth === 1) {
    return () => ({});
  }
  return () => ({
    modal: new Modal({
      mode: ViewMode.ROUTE,
      viewUsage: 1,
      routeDepth: depth,
    }),
  });
};
export class AppRouter {
  private static router?: Router;

  private static authGuard: (
    context: IParams,
    notLogin?: boolean,
  ) => Promise<boolean>;

  static setAuthGuard(
    authGuard: (context: IParams, notLogin?: boolean) => Promise<boolean>,
  ): void {
    this.authGuard = authGuard;
  }

  static getAppContext(route: RouteLocationNormalized): IParams {
    let appContext: IParams = {};
    if (
      route.params.appContext &&
      route.params.appContext !== ibiz.env.routePlaceholder
    ) {
      appContext = qs.parse(route.params.appContext as IParams, {
        strictNullHandling: true,
        delimiter: ';',
      });
    }
    return appContext;
  }

  static getRoutes(): RouteRecordRaw[] {
    // 导航守卫
    const beforeEnter: RouteRecordRaw['beforeEnter'] = async (
      _to,
      _from,
      next,
    ) => {
      // 判断是否已经登录
      if (!isNilOrEmpty(ibiz.appData)) {
        next();
      } else {
        const authority = await this.authGuard(this.getAppContext(_to));
        if (authority) {
          next();
        } else {
          next(false);
        }
      }
    };

    const placeholder = ibiz.env.routePlaceholder;
    // 参数正则，占位符或者以等号相隔的参数键值对
    const paramReg = `[^/]+=[^/]+|${placeholder}`;
    // 视图正则，非=/的字符串
    const viewReg = `[^=/]+`;
    // 二级之后的子路由
    const children = [
      {
        path: '404',
        name: '404View2',
        meta: { preset: true },
        component: View404,
      },
      {
        path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
        components: {
          [RouteConst.ROUTE_MODAL_TAG]: ModalRouterShell,
        },
      },
      {
        path: `:view2(${viewReg})/:params2(${paramReg})`,
        component: RouterShell,
        meta: {
          depth: 2,
        },
        props: getPropsCallback(2),
        children: [
          {
            path: '404',
            name: '404View3',
            meta: { preset: true },
            component: View404,
          },
          {
            path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
            components: {
              [RouteConst.ROUTE_MODAL_TAG]: ModalRouterShell,
            },
          },
          {
            path: `:view3(${viewReg})/:params3(${paramReg})`,
            component: RouterShell,
            meta: {
              depth: 3,
            },
            props: getPropsCallback(3),
            children: [
              {
                path: '404',
                name: '404View4',
                meta: { preset: true },
                component: View404,
              },
              {
                path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
                components: {
                  [RouteConst.ROUTE_MODAL_TAG]: ModalRouterShell,
                },
              },
              {
                path: `:view4(${viewReg})/:params4(${paramReg})`,
                component: RouterShell,
                meta: {
                  depth: 4,
                },
                props: getPropsCallback(4),
              },
              {
                path: ':pathMatch(.*)*',
                redirect: { name: '404View4' },
              },
            ],
          },
          {
            path: ':pathMatch(.*)*',
            redirect: { name: '404View3' },
          },
        ],
      },
      {
        path: ':pathMatch(.*)*',
        redirect: { name: '404View2' },
      },
    ];
    const routes = [
      {
        path: '/',
        redirect: {
          replace: true,
          path: `/${placeholder}/index/${placeholder}`,
        },
      },
      {
        path: '/login',
        name: 'loginView',
        meta: { preset: true },
        beforeEnter: async (
          _to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext,
        ) => {
          await this.authGuard(this.getAppContext(_to), false);
          next();
        },
        component: LoginView,
      },
      {
        path: '/download',
        name: 'downloadView',
        meta: { preset: true },
        component: DownloadView,
      },
      {
        path: '/404',
        name: '404View1',
        meta: { preset: true },
        component: View404,
      },
      {
        path: '/appredirectview',
        name: 'appRedirectView',
        meta: { preset: true },
        beforeEnter,
        component: AppRedirectView,
      },
      {
        path: `/:appContext(${paramReg})/home/:params1(${paramReg})`,
        meta: { home: true, depth: 1 },
        beforeEnter,
        component: HomeView,
        children,
      },
      {
        path: `/:appContext(${paramReg})/:view1(${viewReg})/:params1(${paramReg})`,
        beforeEnter,
        meta: { depth: 1 },
        component: RouterShell,
        children,
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: { name: '404View1' },
      },
    ];
    return routes;
  }

  /**
   * 添加路由
   * @param parentDepth 父路由层级
   * @param userRoute
   * @param routes
   * @returns
   */
  private static addRoute(
    parentDepth: number,
    userRoute: RouteRecordRaw,
    routes: RouteRecordRaw[],
  ): void {
    if (!parentDepth) return;
    // 递归查找目标路由并添加子路由
    const findAndAdd = (routeList: RouteRecordRaw[]): boolean => {
      for (const route of routeList) {
        if (route && route.meta && route.meta.depth === parentDepth) {
          if (route.children && route.children.length > 0) {
            route.children.push(userRoute);
          } else {
            route.children = [userRoute];
          }
          return true;
        }
        if (route.children && route.children.length > 0) {
          if (findAndAdd(route.children)) {
            return true;
          }
        }
      }
      return false;
    };
    findAndAdd(routes);
  }

  /**
   * 获取路由对象
   * @author lxm
   * @date 2023-06-29 07:56:05
   * @static
   * @return {*}
   */
  static getRouter(userRoutes: RouteRecordRaw[] = []): Router {
    if (!this.router) {
      // 存在自定义路由
      const routes = this.getRoutes();
      if (userRoutes && userRoutes.length > 0) {
        for (let i = 0; i < userRoutes.length; i++) {
          const route = userRoutes[i];
          const paginationathSegments = splitPathToSegments(route.path);
          const validateResult = validateRouteSegments(paginationathSegments);
          if (!validateResult) {
            ibiz.log.warn(
              '路由配置错误：路由路径有误，请检查路由配置，详情参见：https://open.ibizlab.cn/apphub/zh/guide/router.html',
            );
            continue;
          }
          const pathDeepth = (paginationathSegments.length - 1) / 2;
          // 存在父路由
          if (pathDeepth > 1) {
            const segmentLength = paginationathSegments.length;
            route.path = `${paginationathSegments[segmentLength - 2]}/${paginationathSegments[segmentLength - 1]}`;
            this.addRoute(pathDeepth - 1, route, routes);
          } else {
            routes.push(route);
          }
        }
      }
      this.router = createRouter({
        history: createWebHashHistory(),
        routes,
      });
      // 初始化视图堆栈，监听路由
      const { init } = useViewStack();
      init(this.router);
    }
    return this.router;
  }
}
