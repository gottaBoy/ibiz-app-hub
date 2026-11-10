import { describe, expect, it } from 'vitest';
import { Environment as HubEnvironment } from '../../src/environment/environment';
import { Environment as ActiveEnvironment } from '../../../../../modelingweb/packages-latest/@ibiz-template/core/src/environment/environment';

describe.each([
  { name: 'hub', Environment: HubEnvironment },
  { name: 'active-fork', Environment: ActiveEnvironment },
])(
  '$name organization-context environment default',
  ({ name, Environment }) => {
    it('is explicitly disabled without changing SaaS or local-model defaults', () => {
      expect(Environment.requireOrganizationContext).toBe(false);
      expect(Environment.isSaaSMode).toBe(true);
      expect(Environment.isLocalModel).toBe(false);
      if (name === 'active-fork')
        expect(Reflect.get(Environment, 'isAdaptiveScreenWidth')).toBe(false);
    });

    it('can be explicitly enabled without mutating shared defaults', () => {
      const owned = { ...Environment, requireOrganizationContext: true };
      expect(owned.requireOrganizationContext).toBe(true);
      expect(Environment.requireOrganizationContext).toBe(false);
    });
  },
);
