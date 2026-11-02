/* eslint-disable import/no-extraneous-dependencies */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { generateRoutePath } from '@ibiz-template/vue3-util';
import { OpenViewUtil } from '../../src/util/open-view-util/open-view-util';

vi.mock('@ibiz-template/vue3-util', () => ({
  generateRoutePath: vi.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

function setup() {
  const get = vi.fn().mockResolvedValue({ id: 'child' });
  vi.stubGlobal('ibiz', { hub: { config: { view: { get } } } });
  const router = {
    currentRoute: { value: { path: '/parent', fullPath: '/parent' } },
    push: vi.fn(),
    replace: vi.fn(),
  };
  return { get, router, util: new OpenViewUtil(router as never) };
}

beforeEach(() => {
  vi.mocked(generateRoutePath)
    .mockReset()
    .mockResolvedValue({ path: '/child' });
});
afterEach(() => vi.unstubAllGlobals());

describe('navigation ownership across async route preparation', () => {
  test('unscoped commands retain their normal push and replace behavior', async () => {
    const { router, util } = setup();
    await util.root('child', {} as never);
    expect(router.push).toHaveBeenCalledWith({ path: '/child' });
    await util.root('child', {} as never, {}, { replace: true });
    expect(router.replace).toHaveBeenCalledWith({ path: '/child' });
  });

  test('leaving during model lookup cancels the old view command', async () => {
    const { get, router, util } = setup();
    const lookup = deferred<object>();
    get.mockReturnValue(lookup.promise);
    let current = true;
    const pending = util.root(
      'child',
      {} as never,
      {},
      {
        shouldNavigate: () => current,
      },
    );
    current = false;
    lookup.resolve({ id: 'child' });
    await pending;
    expect(generateRoutePath).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('leaving during route generation also cancels the old view command', async () => {
    const { router, util } = setup();
    const generated = deferred<{ path: string }>();
    vi.mocked(generateRoutePath).mockReturnValue(generated.promise);
    let current = true;
    const pending = util.root(
      'child',
      {} as never,
      {},
      {
        replace: true,
        shouldNavigate: () => current,
      },
    );
    await vi.waitFor(() => expect(generateRoutePath).toHaveBeenCalledTimes(1));
    current = false;
    generated.resolve({ path: '/child' });
    await pending;
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
