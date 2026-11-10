/* eslint-disable import/no-extraneous-dependencies */
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { IViewController } from '@ibiz-template/runtime';
import { SingleDataContainerController } from '../../src/panel-component/single-data-container/single-data-container.controller';

class BindingController extends SingleDataContainerController {
  bind(view: IViewController, name: string): void {
    this.bindViewData(view, name);
  }
}

function setup(state: Record<string, unknown>) {
  vi.stubGlobal('ibiz', { ...ibiz, i18n: { t: (key: string) => key } });
  const controller = Object.create(BindingController.prototype) as BindingController;
  const setData = vi.fn().mockResolvedValue(undefined);
  controller.setData = setData;
  let listener: (() => void) | undefined;
  const on = vi.fn((_name: string, callback: () => void) => {
    listener = callback;
  });
  const view = { state, evt: { on } } as unknown as IViewController;
  const error = vi.spyOn(ibiz.log, 'error').mockImplementation(() => {});
  return { controller, view, state, setData, on, error, change: () => listener?.() };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('SingleDataContainer active view binding', () => {
  test('an initial null active record stays empty and still binds the eventual real record', () => {
    const fixture = setup({ srfactiveviewdata: null });
    fixture.controller.bind(fixture.view, 'srfactiveviewdata');
    expect(fixture.error).not.toHaveBeenCalled();
    expect(fixture.setData).toHaveBeenCalledWith({});
    expect(fixture.on).toHaveBeenCalledWith('onDataChange', expect.any(Function));
    const record = { id: 'unchanged-id', name: '中文业务数据' };
    fixture.state.srfactiveviewdata = record;
    fixture.change();
    expect(fixture.setData.mock.lastCall?.[0]).toBe(record);
    expect(record).toEqual({ id: 'unchanged-id', name: '中文业务数据' });
  });

  test('clearing an active record clears the container rather than keeping stale data', () => {
    const record = { id: 'previous' };
    const fixture = setup({ srfactiveviewdata: record });
    fixture.controller.bind(fixture.view, 'srfactiveviewdata');
    fixture.state.srfactiveviewdata = null;
    fixture.change();
    expect(fixture.setData.mock.calls).toEqual([[record], [{}]]);
    expect(fixture.error).not.toHaveBeenCalled();
  });

  test('missing properties are still errors and do not create a subscription', () => {
    const fixture = setup({});
    fixture.controller.bind(fixture.view, 'srfactiveviewdata');
    expect(fixture.error).toHaveBeenCalledOnce();
    expect(fixture.on).not.toHaveBeenCalled();
    expect(fixture.setData).not.toHaveBeenCalled();
  });

  test.each([
    ['srfactiveviewdata', undefined],
    ['customData', null],
    ['customData', false],
  ])('invalid or custom empty binding %s=%s remains an error', (name, value) => {
    const fixture = setup({ [name]: value });
    fixture.controller.bind(fixture.view, name);
    expect(fixture.error).toHaveBeenCalledOnce();
    expect(fixture.setData).not.toHaveBeenCalled();
  });
});
