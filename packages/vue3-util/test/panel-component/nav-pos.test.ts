/* eslint-disable import/no-extraneous-dependencies */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { IBizContext } from '@ibiz-template/core';
import { NavPosController } from '../../src/panel-component/nav-pos/nav-pos.controller';

vi.mock('../../src/util', async () => {
  const routeUtils = await import('../../src/util/route/route');
  return { getNestedRoutePath: routeUtils.getNestedRoutePath };
});

const tree =
  '/-/index/product=product-a/product_index_view/srfnav=requirements/idea_tree_exp_view/-';
const settings =
  '/-/index/product=product-a/product_index_view/srfnav=requirements/product_setting_view/srfnav=base/product_base_information_edit_view/-';

function route(path: string) {
  const parts = path.split('/');
  const depth = (parts.length - 2) / 2;
  return {
    path,
    fullPath: path,
    params: Object.fromEntries([
      ['appContext', parts[1]],
      ...Array.from({ length: depth }, (_, index) => [
        [`view${index + 1}`, parts[index * 2 + 2]],
        [`params${index + 1}`, parts[index * 2 + 3]],
      ]).flat(),
    ]),
    matched: Array.from({ length: depth }, () => ({})),
  };
}

function setup(bindRouter = true) {
  const execute = vi.fn().mockResolvedValue({ ok: false });
  vi.stubGlobal('ibiz', { ...ibiz, commands: { execute } });
  const panel = {
    context: IBizContext.create(),
    state: { isDestroyed: false },
    view: {
      modal: { routeDepth: 3 },
      state: { isDestroyed: false },
    },
  };
  const controller = new NavPosController({ id: 'nav_pos' }, panel as never);
  const router = {
    currentRoute: { value: route(tree) },
    push: vi.fn(),
    replace: vi.fn(),
  };
  if (bindRouter) controller.setRouter(router as never);
  const message = {
    key: 'root:node',
    viewId: 'plmweb.idea_all_grid_view',
    context: IBizContext.create(),
    params: {},
    isCache: true,
  };
  return { controller, router, message, panel, execute };
}

afterEach(() => vi.unstubAllGlobals());

describe('NavPos route ownership', () => {
  test('an initial relationship selection waits until the router is mounted', () => {
    const { controller, router, message, execute } = setup(false);
    const initial = { ...message, isRoutePushed: true };
    controller.openView(initial);
    expect(controller.curNavViewMsg).toBeUndefined();
    controller.setRouter(router as never);
    expect(controller.curNavViewMsg).toEqual(initial);
    expect(controller.state.currentKey).toBe(
      'plmweb.idea_all_grid_view___root:node',
    );
    expect(execute).not.toHaveBeenCalled();
  });

  test('destroying a placeholder clears its pending initial selection', () => {
    const { controller, router, message, execute } = setup(false);
    controller.openView(message);
    controller.destroy();
    controller.setRouter(router as never);
    expect(controller.curNavViewMsg).toBeUndefined();
    expect(execute).not.toHaveBeenCalled();
  });

  test('the current view can open a child route', async () => {
    const { controller, message, execute } = setup();
    await controller.openViewByPath(message);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  test('a delayed tree response cannot navigate under a sibling settings view', async () => {
    const { controller, router, message, execute } = setup();
    let release!: () => void;
    const response = new Promise<void>(resolve => {
      release = resolve;
    });
    const pending = response.then(() => controller.openView(message));
    router.currentRoute.value = route(settings);
    release();
    await pending;
    expect(execute).not.toHaveBeenCalled();
    expect(controller.curNavViewMsg).toBeUndefined();
    expect(controller.state.cacheKeys).toEqual(['RouterShell']);
  });

  test('direct path opens and empty-tree navigation cannot mutate a sibling route', async () => {
    const { controller, router, message, execute } = setup();
    router.currentRoute.value = route(settings);
    await controller.openViewByPath(message);
    controller.openView({ key: '' });
    controller.toBlankRoute();
    expect(execute).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('the same view in a different product cannot receive old navigation', async () => {
    const { controller, router, message, execute } = setup();
    router.currentRoute.value = route(tree.replace('product-a', 'product-b'));
    await controller.openViewByPath(message);
    expect(execute).not.toHaveBeenCalled();
  });

  test('changing a child route or its selection preserves parent navigation', async () => {
    const { controller, router, message, execute } = setup();
    router.currentRoute.value = route(
      `${tree.slice(0, -1)}srfnav=other/idea_all_grid_view/-`,
    );
    await controller.openViewByPath(message);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  test('destroyed navigation placeholders ignore late responses even on the same route', async () => {
    const { controller, message, execute } = setup();
    controller.destroy();
    await controller.openViewByPath(message);
    expect(execute).not.toHaveBeenCalled();
  });

  test('non-route embedded views still open without a router', () => {
    const { controller, message } = setup();
    controller.state.routeOpen = false;
    controller.openView(message);
    expect(controller.curNavViewMsg).toEqual(message);
    expect(controller.state.currentKey).toBe(controller.state.cacheKeys[1]);
  });
});
