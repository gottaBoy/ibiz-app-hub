/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, test } from 'vitest';
import { h, VNode } from 'vue';
import { IBizRouterView } from '../../../src/common/router-view/router-view';

describe('IBizRouterView cached vnode handling', () => {
  test('returns a clone when rendering the cached vnode', () => {
    const setup = (IBizRouterView as IData).setup as (
      props: IData,
      context: IData,
    ) => { renderComp: (component: VNode, route: IData) => VNode | undefined };
    const { renderComp } = setup(
      { manualKey: 'view-1', name: 'default' },
      { attrs: {} },
    );
    const component = h('div', { class: 'view' });

    const first = renderComp(component, {});
    if (first) first.el = document.createElement('div');
    const cached = renderComp(component, {});

    expect(cached).toBeDefined();
    expect(cached).not.toBe(first);
    expect(cached?.type).toBe(first?.type);
    expect(cached?.props).toEqual(first?.props);
    expect(cached?.el).toBeNull();
  });
});
