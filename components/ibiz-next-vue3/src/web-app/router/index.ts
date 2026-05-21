/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  Router,
  RouteRecordRaw,
} from 'vue-router';
import qs from 'qs';
import { AppRedirectView } from '@ibiz-template/vue3-util';
import { RouteConst } from '@ibiz-template/runtime';
import NProgress from 'nprogress';
import { LoginView, ErrorView } from '../../view';
import { ModalRouterShell, RouterShell } from '../components';
import { ShareView } from '../../view/share-view/share-view';
import { splitPathToSegments, validateRouteSegments } from '../../util';
import 'nprogress/nprogress.css';

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
    const placeholder = ibiz.env.routePlaceholder;
    // 参数正则，占位符或者以等号相隔的参数键值对
    const paramReg = `[^/]+=[^/]+|${placeholder}`;
    // 视图正则，非=/的字符串
    const viewReg = `[^=/]+`;
    const routes = [
      {
        path: '/',
        redirect: `/${placeholder}/index/${placeholder}`,
      },
      {
        path: '/login',
        name: 'loginView',
        beforeEnter: async (
          _to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext,
        ): Promise<void> => {
          await this.authGuard(this.getAppContext(_to), false);
          next();
        },
        component: LoginView,
      },
      {
        path: '/share',
        name: 'shareView',
        beforeEnter: async (
          _to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext,
        ): Promise<void> => {
          const authority = await this.authGuard(this.getAppContext(_to));
          if (authority) {
            next();
          } else {
            next(false);
          }
        },
        component: ShareView,
      },
      {
        path: '/error/:code',
        name: 'errorView1',
        component: ErrorView,
      },
      {
        path: '/appredirectview',
        name: 'appRedirectView',
        beforeEnter: async (
          _to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext,
        ): Promise<void> => {
          const authority = await this.authGuard(this.getAppContext(_to));
          if (authority) {
            next();
          } else {
            next(false);
          }
        },
        component: AppRedirectView,
      },
      {
        path: `/:appContext(${paramReg})/:view1(${viewReg})/:params1(${paramReg})`,
        beforeEnter: async (
          _to: RouteLocationNormalized,
          from: RouteLocationNormalizedLoaded,
          next: NavigationGuardNext,
        ): Promise<void> => {
          const authority = await this.authGuard(this.getAppContext(_to));
          if (authority) {
            next();
          } else {
            next(false);
          }
        },
        component: RouterShell,
        meta: {
          depth: 1,
        },
        children: [
          {
            path: 'error/:code',
            name: 'errorView2',
            component: ErrorView,
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
            children: [
              {
                path: 'error/:code',
                name: 'errorView3',
                component: ErrorView,
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
                children: [
                  {
                    path: 'error/:code',
                    name: 'errorView4',
                    component: ErrorView,
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
                    children: [
                      {
                        path: 'error/:code',
                        name: 'errorView5',
                        component: ErrorView,
                      },
                      {
                        path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
                        components: {
                          [RouteConst.ROUTE_MODAL_TAG]: ModalRouterShell,
                        },
                      },
                      {
                        path: `:view5(${viewReg})/:params5(${paramReg})`,
                        component: RouterShell,
                        meta: {
                          depth: 5,
                        },
                        children: [
                          {
                            path: 'error/:code',
                            name: 'errorView6',
                            component: ErrorView,
                          },
                          {
                            path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
                            components: {
                              [RouteConst.ROUTE_MODAL_TAG]: ModalRouterShell,
                            },
                          },
                          {
                            path: `:view6(${viewReg})/:params6(${paramReg})`,
                            component: RouterShell,
                            meta: {
                              depth: 6,
                            },
                            children: [
                              {
                                path: 'error/:code',
                                name: 'errorView7',
                                component: ErrorView,
                              },
                              {
                                path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
                                components: {
                                  [RouteConst.ROUTE_MODAL_TAG]:
                                    ModalRouterShell,
                                },
                              },
                              {
                                path: `:view7(${viewReg})/:params7(${paramReg})`,
                                component: RouterShell,
                                meta: {
                                  depth: 7,
                                },
                                children: [
                                  {
                                    path: 'error/:code',
                                    name: 'errorView8',
                                    component: ErrorView,
                                  },
                                  {
                                    path: `${RouteConst.ROUTE_MODAL_TAG}/:modalView(${viewReg})/:modalParams(${paramReg})`,
                                    components: {
                                      [RouteConst.ROUTE_MODAL_TAG]:
                                        ModalRouterShell,
                                    },
                                  },
                                  {
                                    path: `:view8(${viewReg})/:params8(${paramReg})`,
                                    component: RouterShell,
                                    meta: {
                                      depth: 8,
                                    },
                                  },
                                  {
                                    path: ':pathMatch(.*)*',
                                    redirect: { name: 'errorView8' },
                                  },
                                ],
                              },
                              {
                                path: ':pathMatch(.*)*',
                                redirect: { name: 'errorView7' },
                              },
                            ],
                          },
                          {
                            path: ':pathMatch(.*)*',
                            redirect: { name: 'errorView6' },
                          },
                        ],
                      },
                      {
                        path: ':pathMatch(.*)*',
                        redirect: { name: 'errorView5' },
                      },
                    ],
                  },
                  {
                    path: ':pathMatch(.*)*',
                    redirect: { name: 'errorView4' },
                  },
                ],
              },
              {
                path: ':pathMatch(.*)*',
                redirect: { name: 'errorView3' },
              },
            ],
          },
          {
            path: ':pathMatch(.*)*',
            redirect: { name: 'errorView2' },
          },
        ],
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: { name: 'errorView1' },
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
   * 获取路由器
   * @param userRoutes
   * @returns
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

      // 路由加载前
      this.router.beforeEach((_to, _from, next) => {
        NProgress.configure({ showSpinner: false });
        NProgress.start();
        next();
      });

      // 路由加载后
      this.router.afterEach(() => {
        NProgress.done();
      });
    }
    return this.router;
  }
}
