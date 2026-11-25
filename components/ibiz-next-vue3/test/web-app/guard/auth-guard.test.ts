import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard as HubAuthGuard } from '../../../src/web-app/guard/auth-guard/auth-guard';
import { AuthGuard as ActiveAuthGuard } from '../../../../../../modelingweb/packages-latest/@ibiz-template/vue3-components/src/web-app/guard/auth-guard/auth-guard';
import { AppFuncBlockProvider } from '../../../../../../modelingweb/packages-latest/@ibiz-template/vue3-components/src/web-app/util/app-func-block-provider/app-func-block-provider';
import { attachEnvironmentConfig as attachHubEnvironment } from '../../../src/web-app/attach-environment-config';
import { attachEnvironmentConfig as attachActiveEnvironment } from '../../../../../../modelingweb/packages-latest/@ibiz-template/vue3-components/src/web-app/attach-environment-config';

const hooks = vi.hoisted(() => ({
  before: vi.fn(),
  authed: vi.fn(),
  devtool: vi.fn(),
  provider: vi.fn(),
  cookies: new Map<string, string>(),
}));

vi.mock('@ibiz-template/core', () => ({
  CoreConst: { TOKEN_REMEMBER: 'remember', REFRESH_TOKEN: 'refresh' },
  LoginMode: { DEFAULT: 'DEFAULT' },
  getAppCookie: (name: string) => hooks.cookies.get(name),
  RuntimeError: class extends Error {},
  HttpError: class extends Error {},
}));
vi.mock('@ibiz-template/runtime', () => ({
  getAppFuncBlockProvider: hooks.provider,
}));
vi.mock('@ibiz-template/vue3-util', () => ({
  AppHooks: {
    beforeInitApp: { call: hooks.before },
    authedApp: { call: hooks.authed },
    useComponent: { callSync: vi.fn() },
  },
}));
vi.mock('@ibiz-template/devtool', () => ({
  updateDevToolConfig: hooks.devtool,
}));

const organization = {
  systemid: 'ibizmodeling',
  orgid: 'nf_owned_center_a_org',
  orgname: 'Owned Organization A',
  dcsystemid: 'ibizmodeling',
};
const organizationUrl = '/uaa/getbydcsystem/ibizmodeling';
const unavailable = 'webApp.authGuard.organizationContextUnavailable';

function createRuntime() {
  return {
    env: {
      dcSystem: 'ibizmodeling' as unknown,
      appId: 'ibizmodeling__central',
      isSaaSMode: false,
      isLocalModel: true,
      enableAnonymous: false,
      loginMode: 'DEFAULT',
      requireOrganizationContext: undefined as boolean | undefined,
      enableMqtt: false,
      logLevel: 'info',
      globalConfig: undefined as Record<string, unknown> | undefined,
    },
    config: {} as Record<string, unknown>,
    orgData: undefined as Record<string, unknown> | undefined,
    appData: undefined as unknown,
    net: {
      get: vi.fn(
        async (
          url: string,
          _context?: unknown,
        ): Promise<{ ok: boolean; data: unknown }> => ({
          ok: true,
          data:
            url === organizationUrl
              ? [organization]
              : { context: { srfuserid: 'owned-user' } },
        }),
      ),
    },
    auth: {
      getAuthInfo: vi.fn(() => undefined),
      refreshToken: vi.fn(async () => undefined),
      anonymousLogin: vi.fn(async () => true),
      extendLogin: vi.fn(async () => undefined),
      loadAppData: vi.fn(async (_context?: Record<string, unknown>) => false),
    },
    hub: {
      notice: { init: vi.fn(async () => undefined) },
      registerModelLoaderProvider: vi.fn(),
      loadExtensionPlugin: vi.fn(async () => undefined),
    },
    util: {
      theme: { initCustomTheme: vi.fn(async () => undefined) },
      rawValue: {
        format: vi.fn((value: unknown) =>
          value === 'true' ? true : value === 'false' ? false : value),
      },
    },
    log: { setLevel: vi.fn() },
    i18n: { t: (key: string) => key },
  };
}

function sourceRunApp(active: boolean, dependencies: Record<string, unknown>) {
  const file = new URL(active
    ? '../../../../../../modelingweb/packages-latest/@ibiz-template/vue3-components/src/web-app/main.ts'
    : '../../../src/web-app/main.ts', import.meta.url);
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file.pathname, text, ts.ScriptTarget.Latest, true);
  const declaration = source.statements.find(statement =>
    ts.isFunctionDeclaration(statement) && statement.name?.text === 'runApp');
  if (!declaration) throw new Error('Actual runApp declaration is missing');
  const compiled = ts.transpileModule(declaration.getText(source), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const exports: { runApp?: (plugins?: unknown[], opts?: unknown) => Promise<void> } = {};
  new Function(...Object.keys(dependencies), 'exports', compiled.outputText)(
    ...Object.values(dependencies), exports,
  );
  return exports.runApp!;
}

function sourceInitMqtt(active: boolean, MqttService: unknown) {
  const file = new URL(active
    ? '../../../../../../modelingweb/packages-latest/@ibiz-template/runtime/src/app-hub.ts'
    : '../../../../../packages/runtime/src/app-hub.ts', import.meta.url);
  const source = ts.createSourceFile(
    file.pathname, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
  );
  const declaration = source.statements.find(statement =>
    ts.isClassDeclaration(statement) && statement.name?.text === 'AppHub');
  const method = declaration && ts.isClassDeclaration(declaration)
    ? declaration.members.find(member => ts.isMethodDeclaration(member) &&
      member.name.getText(source) === 'initMqtt')
    : undefined;
  if (!method) throw new Error('Actual AppHub.initMqtt method is missing');
  const compiled = ts.transpileModule(
    `class ActualAppHub { ${method.getText(source)} }\nexports.initMqtt = ActualAppHub.prototype.initMqtt;`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } },
  );
  const exports: { initMqtt?: (this: object) => Promise<void> } = {};
  new Function('MqttService', 'getToken', 'exports', compiled.outputText)(
    MqttService, () => 'test-token-placeholder', exports,
  );
  return exports.initMqtt!;
}

describe.each([
  { name: 'hub', Guard: HubAuthGuard, active: false },
  { name: 'active-fork', Guard: ActiveAuthGuard, active: true },
])('$name source', ({ Guard, active }) => {
  let runtime: ReturnType<typeof createRuntime>;
  let guard: HubAuthGuard | ActiveAuthGuard;
  let initModel: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    hooks.cookies.clear();
    runtime = createRuntime();
    vi.stubGlobal('ibiz', runtime);
    const provider = new AppFuncBlockProvider();
    hooks.provider.mockResolvedValue(provider);
    runtime.auth.loadAppData.mockImplementation(async context => {
      const response = await provider.loadAppData(context);
      if (response.ok) runtime.appData = response.data;
      return response.ok;
    });
    guard = new Guard();
    initModel = vi.spyOn(guard, 'initModel').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function expectInitializationStopped() {
    expect(initModel).not.toHaveBeenCalled();
    expect(hooks.authed).not.toHaveBeenCalled();
    expect(runtime.auth.extendLogin).not.toHaveBeenCalled();
    expect(runtime.hub.notice.init).not.toHaveBeenCalled();
    expect(runtime.util.theme.initCustomTheme).not.toHaveBeenCalled();
    expect(runtime.hub.loadExtensionPlugin).not.toHaveBeenCalled();
  }

  describe('explicit MQTT deployment override', () => {
    it.each([undefined, {}])(
      'retains model precedence without an explicit boolean: %j',
      async environmentOverrides => {
        const selected = new Guard({ environmentOverrides });
        runtime.env.enableMqtt = false;
        await selected.initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
        expect(runtime.env.enableMqtt).toBe(true);
        await selected.initEnvironment({ userParam: { enableMqtt: 'false' } } as never);
        expect(runtime.env.enableMqtt).toBe(false);
      },
    );

    it.each([false, true].flatMap(override =>
      [undefined, {}, { enableMqtt: 'true' }, { enableMqtt: 'false' }].map(userParam => ({
        override, userParam,
      })),
    ))('explicit $override applies after userParam=$userParam', async ({ override, userParam }) => {
      const selected = new Guard({ environmentOverrides: { enableMqtt: override } });
      runtime.env.enableMqtt = !override;
      await selected.initEnvironment({ userParam } as never);
      expect(runtime.env.enableMqtt).toBe(override);
    });

    it('retains unrelated nested model parameters, global configuration and log-level initialization', async () => {
      const selected = new Guard({ environmentOverrides: { enableMqtt: false } });
      runtime.config = { retained: true };
      await selected.initEnvironment({
        userParam: { 'globalConfig.grid.editShowMode': 'cell', enableMqtt: 'true' },
      } as never);
      expect(runtime.env.enableMqtt).toBe(false);
      expect(runtime.config).toEqual({ retained: true, grid: { editShowMode: 'cell' } });
      expect(runtime.log.setLevel).toHaveBeenCalledWith('info');
    });

    it('copies and freezes the validated configuration instead of retaining a mutable caller object', async () => {
      const environmentOverrides = { enableMqtt: false };
      const selected = new Guard({ environmentOverrides });
      environmentOverrides.enableMqtt = true;
      await selected.initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      expect(runtime.env.enableMqtt).toBe(false);
      expect(Object.isFrozen(Guard.validateEnvironmentOverrides(environmentOverrides))).toBe(true);
    });

    it.each([
      null, false, true, 0, '', 'false', [], new Boolean(false), new Date(0),
      { enableMqtt: undefined }, { enableMqtt: 'false' }, { enableMqtt: 0 },
      { enableMqtt: null }, { enableMqtt: {} }, { unknown: false },
      { enableMqtt: false, baseUrl: '/unreviewed' },
      Object.create({ enableMqtt: false }),
      { [Symbol('unreviewed')]: false },
      Object.defineProperty({}, 'unknown', { value: false }),
    ])('rejects invalid runtime override %# before registering a model loader', environmentOverrides => {
      const customModelLoader = {} as never;
      expect(() => new Guard({
        environmentOverrides: environmentOverrides as never, customModelLoader,
      })).toThrow('Invalid environmentOverrides');
      expect(runtime.hub.registerModelLoaderProvider).not.toHaveBeenCalled();
    });

    it('rejects accessors without invoking their arbitrary getters', () => {
      const getter = vi.fn(() => false);
      const value = Object.defineProperty({}, 'enableMqtt', { get: getter });
      expect(() => new Guard({ environmentOverrides: value })).toThrow('Invalid environmentOverrides');
      expect(getter).not.toHaveBeenCalled();
    });

    it('reapplies the override on ordinary initialization and later model switches', async () => {
      const selected = new Guard({ environmentOverrides: { enableMqtt: false } });
      vi.spyOn(selected, 'initModel').mockImplementation(async () => {
        await selected.initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      });
      await selected.appInit({});
      expect(runtime.env.enableMqtt).toBe(false);
      runtime.env.enableMqtt = true;
      await selected.initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      expect(runtime.env.enableMqtt).toBe(false);
      await selected.initEnvironment({} as never);
      expect(runtime.env.enableMqtt).toBe(false);
    });

    it('retains the override through the real authentication-refresh retry path', async () => {
      hooks.cookies.set('remember', '1');
      hooks.cookies.set('refresh', 'test-refresh-placeholder');
      let requests = 0;
      runtime.net.get.mockImplementation(async () => {
        if (++requests === 1) throw Object.assign(new Error('expired'), { status: 401 });
        return { ok: true, data: { context: {} } };
      });
      const selected = new Guard({ environmentOverrides: { enableMqtt: false } });
      vi.spyOn(selected, 'initModel').mockImplementation(async () => {
        await selected.initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      });
      await selected.appInit({});
      expect(runtime.auth.refreshToken).toHaveBeenCalledOnce();
      expect(runtime.env.enableMqtt).toBe(false);
    });

    it.each([
      { override: undefined, model: true, connects: true },
      { override: false, model: true, connects: false },
      { override: true, model: false, connects: true },
    ])('drives the actual AppHub MQTT gate for override=$override model=$model', async row => {
      const connections: Array<ReturnType<typeof vi.fn>> = [];
      class ControlledMqttService {
        evt = { on: vi.fn() };
        connect = vi.fn(async () => undefined);
        constructor() { connections.push(this.connect); }
      }
      const initialize = sourceInitMqtt(active, ControlledMqttService);
      runtime.appData = { mqtttopic: '/owned/test-user' };
      const selected = new Guard({
        environmentOverrides: row.override === undefined ? undefined : { enableMqtt: row.override },
      });
      await selected.initEnvironment({ userParam: { enableMqtt: String(row.model) } } as never);
      await initialize.call({});
      expect(connections).toHaveLength(row.connects ? 1 : 0);
      if (row.connects) expect(connections[0]).toHaveBeenCalledOnce();
    });
  });

  describe('runApp override entrypoint', () => {
    function entrypoint() {
      const boundary = new Error('router registration boundary');
      const guards: Array<HubAuthGuard | ActiveAuthGuard> = [];
      const dependencies = {
        AuthGuard: Guard,
        DynaAuthGuard: class extends Guard {
          constructor(opts: ConstructorParameters<typeof Guard>[0]) {
            super(opts);
            guards.push(this);
          }
        },
        AppHooks: {
          createApp: { tap: vi.fn() },
          appResorceInited: { call: vi.fn() },
        },
        installCore: vi.fn(),
        installRuntime: vi.fn(),
        useAppStore: vi.fn(),
        route2routePath: vi.fn(),
        PluginFactory: class {},
        UnauthorizedHandler: class {},
        createVueApp: vi.fn(() => ({})),
        App: {},
        OverlayContainer: {},
        attachEnvironmentConfig: vi.fn(async () => undefined),
        installDevTool: vi.fn(),
        AppRouter: { setAuthGuard: vi.fn(() => { throw boundary; }) },
        window: { addEventListener: vi.fn() },
      };
      runtime.util = { ...runtime.util, error: { register: vi.fn() } } as typeof runtime.util;
      return { dependencies, guards, boundary, run: sourceRunApp(active, dependencies) };
    }

    it('wires the default guard login redirect before protected initialization', async () => {
      const selected = entrypoint();
      await expect(selected.run()).rejects.toBe(selected.boundary);
      const [verify, redirect] = selected.dependencies.AppRouter.setAuthGuard.mock.calls[0] as unknown as [
        (context: object, notLogin?: boolean) => Promise<boolean>,
        (returnUrl: string) => unknown,
      ];
      expect(redirect('/psdevslnsys=owned-root/modelingindex/-')).toEqual({
        path: '/login', replace: true,
        query: { ru: '/psdevslnsys=owned-root/modelingindex/-' },
      });
      expect(runtime.net.get).not.toHaveBeenCalled();
      const validation = vi.spyOn(selected.guards[0], 'verify').mockResolvedValue(true);
      await verify({ psdevslnsys: 'owned-root' }, false);
      expect(validation).toHaveBeenCalledWith({ psdevslnsys: 'owned-root' }, false);
    });

    it('does not impose the default login redirect on a caller-supplied guard', async () => {
      const selected = entrypoint();
      const custom = new Guard();
      await expect(selected.run(undefined, { getAuthGuard: () => custom })).rejects.toBe(selected.boundary);
      expect(selected.guards).toHaveLength(0);
      const args = selected.dependencies.AppRouter.setAuthGuard.mock.calls[0] as unknown as unknown[];
      expect(args[1]).toBeUndefined();
    });

    it.each([false, true])('forwards the validated explicit %s to the actual default guard', async enableMqtt => {
      const selected = entrypoint();
      await expect(selected.run(undefined, {
        environmentOverrides: { enableMqtt },
      })).rejects.toBe(selected.boundary);
      expect(selected.guards).toHaveLength(1);
      await selected.guards[0].initEnvironment({ userParam: { enableMqtt: String(!enableMqtt) } } as never);
      expect(runtime.env.enableMqtt).toBe(enableMqtt);
    });

    it('snapshots validated options before asynchronous environment initialization', async () => {
      const selected = entrypoint();
      const environmentOverrides = { enableMqtt: false };
      selected.dependencies.attachEnvironmentConfig.mockImplementation(async () => {
        environmentOverrides.enableMqtt = true;
      });
      await expect(selected.run(undefined, { environmentOverrides })).rejects.toBe(selected.boundary);
      await selected.guards[0].initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      expect(runtime.env.enableMqtt).toBe(false);
    });

    it.each([null, 'false', { enableMqtt: 'false' }, { enableMqtt: {} }, { unreviewed: true }])(
      'rejects invalid override %# before installing or registering runtime hooks',
      async environmentOverrides => {
        const selected = entrypoint();
        await expect(selected.run(undefined, { environmentOverrides }))
          .rejects.toThrow('Invalid environmentOverrides');
        expect(selected.dependencies.installCore).not.toHaveBeenCalled();
        expect(selected.dependencies.AppHooks.createApp.tap).not.toHaveBeenCalled();
        expect(selected.guards).toHaveLength(0);
      },
    );

    it.each([{}, { enableMqtt: false }, { enableMqtt: true }])(
      'rejects custom getAuthGuard plus override %j rather than silently ignoring it',
      async environmentOverrides => {
        const selected = entrypoint();
        const getAuthGuard = vi.fn(() => new Guard());
        await expect(selected.run(undefined, { environmentOverrides, getAuthGuard }))
          .rejects.toThrow('environmentOverrides cannot be combined with getAuthGuard');
        expect(getAuthGuard).not.toHaveBeenCalled();
        expect(selected.dependencies.installCore).not.toHaveBeenCalled();
      },
    );

    it('retains custom getAuthGuard when no deployment override is supplied', async () => {
      const selected = entrypoint();
      const custom = new Guard();
      const getAuthGuard = vi.fn(() => custom);
      await expect(selected.run(undefined, { getAuthGuard })).rejects.toBe(selected.boundary);
      expect(getAuthGuard).toHaveBeenCalledOnce();
      expect(selected.guards).toHaveLength(0);
    });

    it('retains model priority through runApp when override options are absent', async () => {
      const selected = entrypoint();
      await expect(selected.run()).rejects.toBe(selected.boundary);
      await selected.guards[0].initEnvironment({ userParam: { enableMqtt: 'true' } } as never);
      expect(runtime.env.enableMqtt).toBe(true);
    });
  });

  describe('organization-context initialization policy', () => {
    const attachEnvironment = active ? attachActiveEnvironment : attachHubEnvironment;
    const environmentWindow = (environment: object) => {
      vi.stubGlobal('window', { Environment: environment, location: { search: '' } });
    };

    it.each([false, true])(
      'maps explicit organization requirement %j when an older core has no enumerable default',
      async required => {
        delete (runtime.env as { requireOrganizationContext?: boolean }).requireOrganizationContext;
        environmentWindow({ requireOrganizationContext: required });
        await attachEnvironment();
        expect(runtime.env.requireOrganizationContext).toBe(required);
        await guard.appInit({});
        expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual(
          required ? [organizationUrl, '/appdata'] : ['/appdata'],
        );
      },
    );

    it('keeps an older core default absent when the deployment has not opted in', async () => {
      delete (runtime.env as { requireOrganizationContext?: boolean }).requireOrganizationContext;
      environmentWindow({});
      await attachEnvironment();
      expect(Object.hasOwn(runtime.env, 'requireOrganizationContext')).toBe(false);
      await guard.appInit({});
      expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual(['/appdata']);
    });

    it.each([null, undefined, 'true', 'false', 0, 1, {}, []])(
      'rejects an invalid explicit organization flag before initialization: %j',
      async value => {
        environmentWindow({ requireOrganizationContext: value });
        await expect(attachEnvironment()).rejects.toThrow('requireOrganizationContext must be a boolean data property');
        expect(runtime.net.get).not.toHaveBeenCalled();
      },
    );

    it('does not execute a deployment getter or inherit a requirement from its prototype', async () => {
      const getter = vi.fn(() => true);
      environmentWindow(Object.defineProperty({}, 'requireOrganizationContext', { get: getter }));
      await expect(attachEnvironment()).rejects.toThrow('requireOrganizationContext must be a boolean data property');
      expect(getter).not.toHaveBeenCalled();
      environmentWindow(Object.create({ requireOrganizationContext: true }));
      await attachEnvironment();
      expect(runtime.env.requireOrganizationContext).toBeUndefined();
    });

    it.each(
      [undefined, false, true].flatMap(required =>
        [false, true].flatMap(saas =>
          [false, true].map(local => ({
            required,
            saas,
            local,
            shouldLoad: required === true || (saas && !local),
          })),
        ),
      ),
    )(
      'required=$required SaaS=$saas local=$local retains explicit/default policy',
      async row => {
        runtime.env.requireOrganizationContext = row.required;
        runtime.env.isSaaSMode = row.saas;
        runtime.env.isLocalModel = row.local;
        await guard.appInit({});
        expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual(
          row.shouldLoad ? [organizationUrl, '/appdata'] : ['/appdata'],
        );
        expect(runtime.orgData).toEqual(
          row.shouldLoad ? organization : undefined,
        );
        expect(initModel).toHaveBeenCalledOnce();
        expect(runtime.hub.notice.init).toHaveBeenCalledOnce();
        expect(runtime.util.theme.initCustomTheme).toHaveBeenCalledOnce();
      },
    );

    it('uses only the real returned organization and clears stale selection before requesting its catalog', async () => {
      runtime.env.requireOrganizationContext = true;
      runtime.orgData = { systemid: 'stale-system', orgid: 'stale-org' };
      runtime.net.get.mockImplementation(async url => {
        if (url === organizationUrl) {
          expect(runtime.orgData).toBeUndefined();
          return { ok: true, data: [organization] };
        }
        expect(runtime.orgData).toBe(organization);
        return {
          ok: true,
          data: { context: { srforgid: organization.orgid } },
        };
      });
      await guard.appInit({});
      expect(runtime.orgData).toBe(organization);
      expect(runtime.net.get.mock.calls[0]).toEqual([organizationUrl]);
      if (active) {
        expect(hooks.provider).toHaveBeenCalledOnce();
        expect(runtime.auth.loadAppData).toHaveBeenCalledOnce();
        expect(runtime.hub.loadExtensionPlugin).toHaveBeenCalledWith(
          runtime.env.appId,
        );
        expect(
          runtime.hub.loadExtensionPlugin.mock.invocationCallOrder[0],
        ).toBeLessThan(initModel.mock.invocationCallOrder[0]);
      } else {
        expect(hooks.provider).not.toHaveBeenCalled();
        expect(runtime.auth.loadAppData).not.toHaveBeenCalled();
        expect(runtime.hub.loadExtensionPlugin).not.toHaveBeenCalled();
      }
    });

    it.each([
      { name: 'missing data', data: undefined },
      { name: 'null', data: null },
      { name: 'object instead of catalog', data: {} },
      { name: 'empty catalog', data: [] },
      { name: 'null first organization', data: [null] },
      { name: 'array first organization', data: [[organization]] },
      { name: 'missing IDs', data: [{}] },
      { name: 'empty system ID', data: [{ ...organization, systemid: '' }] },
      { name: 'null system ID', data: [{ ...organization, systemid: null }] },
      { name: 'numeric system ID', data: [{ ...organization, systemid: 1 }] },
      {
        name: 'whitespace system ID',
        data: [{ ...organization, systemid: '  ' }],
      },
      {
        name: 'padded system ID',
        data: [{ ...organization, systemid: ' ibizmodeling' }],
      },
      {
        name: 'header control in system ID',
        data: [{ ...organization, systemid: 'system\r\ninjected' }],
      },
      { name: 'missing org ID', data: [{ systemid: organization.systemid }] },
      { name: 'empty org ID', data: [{ ...organization, orgid: '' }] },
      { name: 'numeric org ID', data: [{ ...organization, orgid: 1 }] },
      { name: 'object org ID', data: [{ ...organization, orgid: {} }] },
      { name: 'whitespace org ID', data: [{ ...organization, orgid: ' ' }] },
      { name: 'padded org ID', data: [{ ...organization, orgid: 'org ' }] },
      {
        name: 'header control in org ID',
        data: [{ ...organization, orgid: 'org\ninjected' }],
      },
      { name: 'inherited IDs', data: [Object.create(organization)] },
      {
        name: 'invalid first item must not silently select another tenant',
        data: [{}, organization],
      },
    ])('required context fails closed on HTTP 200 with $name', async row => {
      runtime.env.requireOrganizationContext = true;
      runtime.orgData = { systemid: 'stale-system', orgid: 'stale-org' };
      runtime.net.get.mockResolvedValue({ ok: true, data: row.data });
      await expect(guard.appInit({})).rejects.toThrow(unavailable);
      expect(runtime.orgData).toBeUndefined();
      expect(runtime.net.get).toHaveBeenCalledOnce();
      expectInitializationStopped();
    });

    it.each([undefined, null, '', ' ', 'ibizmodeling\ninjected', 1])(
      'rejects missing/invalid required system configuration %# before requesting',
      async system => {
        runtime.env.requireOrganizationContext = true;
        runtime.env.dcSystem = system;
        runtime.orgData = { orgid: 'stale-org' };
        await expect(guard.appInit({})).rejects.toThrow(unavailable);
        expect(runtime.net.get).not.toHaveBeenCalled();
        expect(runtime.orgData).toBeUndefined();
        expectInitializationStopped();
      },
    );

    it('does not continue or retain stale organization when the catalog returns a non-ok result', async () => {
      runtime.env.requireOrganizationContext = true;
      runtime.orgData = { orgid: 'stale-org' };
      runtime.net.get.mockResolvedValue({ ok: false, data: [organization] });
      await expect(guard.appInit({})).rejects.toThrow(unavailable);
      expect(runtime.orgData).toBeUndefined();
      expectInitializationStopped();
    });

    it('propagates a real catalog request failure without substituting organization data', async () => {
      runtime.env.requireOrganizationContext = true;
      runtime.orgData = { orgid: 'stale-org' };
      const failure = Object.assign(new Error('catalog denied'), {
        status: 403,
      });
      runtime.net.get.mockRejectedValue(failure);
      await expect(guard.appInit({})).rejects.toBe(failure);
      expect(runtime.orgData).toBeUndefined();
      expectInitializationStopped();
    });

    it.each([undefined, false])(
      'keeps legacy empty-catalog behavior when required=$0',
      async required => {
        runtime.env.requireOrganizationContext = required;
        runtime.env.isSaaSMode = true;
        runtime.env.isLocalModel = false;
        runtime.net.get.mockImplementation(async url => ({
          ok: true,
          data: url === organizationUrl ? [] : { context: {} },
        }));
        await guard.appInit({});
        expect(runtime.orgData).toBeUndefined();
        expect(initModel).toHaveBeenCalledOnce();
      },
    );
  });

  describe('organization initialization after authentication refresh', () => {
    beforeEach(() => {
      hooks.cookies.set('remember', '1');
      hooks.cookies.set('refresh', 'test-refresh-placeholder');
    });

    it('loads the legitimate organization again before retrying appdata in required local mode', async () => {
      runtime.env.requireOrganizationContext = true;
      const updated = { ...organization, orgid: 'nf_owned_center_b_org' };
      let organizations = 0;
      let appdata = 0;
      runtime.net.get.mockImplementation(async url => {
        if (url === organizationUrl) {
          expect(runtime.orgData).toBeUndefined();
          organizations++;
          return {
            ok: true,
            data: [organizations === 1 ? organization : updated],
          };
        }
        if (++appdata === 1)
          throw Object.assign(new Error('expired'), { status: 401 });
        expect(runtime.orgData).toBe(updated);
        return { ok: true, data: { context: { srforgid: updated.orgid } } };
      });
      await guard.appInit({});
      expect(runtime.auth.refreshToken).toHaveBeenCalledOnce();
      expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual([
        organizationUrl,
        '/appdata',
        organizationUrl,
        '/appdata',
      ]);
      expect(runtime.orgData).toBe(updated);
      expect(initModel).toHaveBeenCalledOnce();
    });

    it('fails closed on an empty post-refresh catalog instead of reusing the first organization', async () => {
      runtime.env.requireOrganizationContext = true;
      const expired = Object.assign(new Error('expired'), { status: 401 });
      let organizations = 0;
      runtime.net.get.mockImplementation(async url => {
        if (url === organizationUrl)
          return {
            ok: true,
            data: ++organizations === 1 ? [organization] : [],
          };
        throw expired;
      });
      await expect(guard.appInit({})).rejects.toBe(expired);
      expect(runtime.orgData).toBeUndefined();
      expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual([
        organizationUrl,
        '/appdata',
        organizationUrl,
      ]);
      expectInitializationStopped();
    });

    it('retries the real organization catalog after its own initial 401 before loading appdata', async () => {
      runtime.env.requireOrganizationContext = true;
      let organizations = 0;
      runtime.net.get.mockImplementation(async url => {
        if (url === organizationUrl) {
          expect(runtime.orgData).toBeUndefined();
          if (++organizations === 1)
            throw Object.assign(new Error('expired'), { status: 401 });
          return { ok: true, data: [organization] };
        }
        expect(runtime.orgData).toBe(organization);
        return { ok: true, data: { context: {} } };
      });
      await guard.appInit({});
      expect(runtime.auth.refreshToken).toHaveBeenCalledOnce();
      expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual([
        organizationUrl,
        organizationUrl,
        '/appdata',
      ]);
      expect(initModel).toHaveBeenCalledOnce();
    });

    it('initializes the real organization after the existing anonymous-login refresh fallback', async () => {
      runtime.env.requireOrganizationContext = true;
      runtime.env.enableAnonymous = true;
      runtime.auth.refreshToken.mockRejectedValue(
        new Error('refresh rejected'),
      );
      let appdata = 0;
      runtime.net.get.mockImplementation(async url => {
        if (url === organizationUrl) return { ok: true, data: [organization] };
        if (++appdata === 1)
          throw Object.assign(new Error('expired'), { status: 401 });
        expect(runtime.orgData).toBe(organization);
        return { ok: true, data: { context: {} } };
      });
      await guard.appInit({});
      expect(runtime.auth.refreshToken).toHaveBeenCalledOnce();
      expect(runtime.auth.anonymousLogin).toHaveBeenCalledOnce();
      expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual([
        organizationUrl,
        '/appdata',
        organizationUrl,
        '/appdata',
      ]);
      expect(initModel).toHaveBeenCalledOnce();
    });

    it.each([undefined, false])(
      'does not load organization during local legacy retry with required=$0',
      async required => {
        runtime.env.requireOrganizationContext = required;
        let appdata = 0;
        runtime.net.get.mockImplementation(async () => {
          if (++appdata === 1)
            throw Object.assign(new Error('expired'), { status: 401 });
          return { ok: true, data: { context: {} } };
        });
        await guard.appInit({});
        expect(runtime.net.get.mock.calls.map(call => call[0])).toEqual([
          '/appdata',
          '/appdata',
        ]);
        expect(runtime.orgData).toBeUndefined();
        expect(initModel).toHaveBeenCalledOnce();
      },
    );
  });
});
