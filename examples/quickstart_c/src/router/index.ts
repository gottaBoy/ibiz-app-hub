import { RouteRecordRaw } from 'vue-router';
// 参数正则
const paramReg = `[^/]+=[^/]+|-`;

export const userRoutes: RouteRecordRaw[] = [
  // routePath：http://localhost:5173/#/-/user/-
  // routePath：http://localhost:5173/#/-/user/test1=test1
  // {
  //   path: `/-/user/:userparams(${paramReg})`,
  //   component: () => UserView,
  // },
  // routePath：http://localhost:5173/#/-/index/-/user2/-
  // routePath：http://localhost:5173/#/-/index/-/user2/test2=test2
  // {
  //   path: `/-/index/-/user2/:userparams(${paramReg})`,
  //   component: () => UserView,
  // },
  // routePath：http://localhost:5173/#/-/index/-/workspace_tab_exp_view/srfnav=overview/user3/-
  // routePath：http://localhost:5173/#/-/index/-/workspace_tab_exp_view/srfnav=overview/user3/test3=test3
  // {
  //   path: `/-/index/:params1(${paramReg})/workspace_tab_exp_view/:params2(${paramReg})/user3/:userparams(${paramReg})`,
  //   component: () => UserView,
  // },
];
