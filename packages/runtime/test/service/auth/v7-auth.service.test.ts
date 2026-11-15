import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CoreConst,
  clearAppCookie,
  getAppCookie,
  setAppCookie,
} from '@ibiz-template/core';
import { V7AuthService } from '../../../src/service/service/auth/v7-auth.service';

const clock = 1800000000000;
const maxTimeout = 2147483647;
const authCookies = [
  CoreConst.TOKEN,
  CoreConst.TOKEN_EXPIRES,
  CoreConst.TOKEN_REMEMBER,
  CoreConst.REFRESH_TOKEN,
  CoreConst.IS_ANONYMOUS,
];

describe('V7 refresh scheduling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(clock);
    authCookies.forEach(name => clearAppCookie(name));
    vi.stubGlobal('ibiz', {
      env: {},
      net: { get: vi.fn() },
      hub: { initMqtt: vi.fn() },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    authCookies.forEach(name => clearAppCookie(name));
  });

  const scheduledDelay = async (
    expiresAt: number,
  ): Promise<number | undefined> => {
    vi.clearAllTimers();
    vi.setSystemTime(clock);
    setAppCookie(CoreConst.TOKEN, 'server-token', 0);
    setAppCookie(CoreConst.TOKEN_EXPIRES, `${expiresAt}`, 0);
    expect(getAppCookie(CoreConst.TOKEN_EXPIRES)).toBe(`${expiresAt}`);
    expect(Date.now()).toBe(clock);
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    timeout.mockClear();
    await new V7AuthService().extendLogin();
    const refreshTimer = timeout.mock.calls.find(([callback]) =>
      String(callback).includes('/uaa/refresh_token/'),
    );
    return refreshTimer?.[1];
  };

  it('schedules native twenty-second tokens after fifteen seconds, never at zero', async () => {
    expect(await scheduledDelay(clock + 20000)).toBe(15000);
    expect(await scheduledDelay(clock + 1000)).toBe(750);
    expect(await scheduledDelay(clock + 1)).toBe(1);
  });

  it('retains the normal five-minute advance for long-lived tokens and the signed timer cap', async () => {
    expect(await scheduledDelay(clock + 7199000)).toBe(7199000 - 300000);
    expect(await scheduledDelay(clock + 3600000)).toBe(3600000 - 300000);
    expect(await scheduledDelay(clock + maxTimeout + 300000)).toBe(maxTimeout);
    expect(await scheduledDelay(Number.MAX_VALUE)).toBe(maxTimeout);
  });

  it('does not schedule an automatic refresh from invalid or expired timestamps', async () => {
    for (const expiresAt of [NaN, Infinity, -Infinity, clock, clock - 1]) {
      expect(await scheduledDelay(expiresAt)).toBeUndefined();
    }
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the delay positive on both sides of the adaptive margin boundary', async () => {
    for (const remaining of [
      299999, 300000, 300001, 1199999, 1200000, 1200001,
    ]) {
      const delay = (await scheduledDelay(clock + remaining))!;
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThan(remaining);
      expect(remaining - delay).toBeLessThanOrEqual(300001);
    }
  });

  it('runs multiple real extendLogin refresh cycles without a zero-delay request loop or changed server TTL', async () => {
    setAppCookie(CoreConst.TOKEN, 'server-token-0', 0);
    setAppCookie(CoreConst.TOKEN_EXPIRES, `${clock + 20000}`, 0);
    setAppCookie(CoreConst.REFRESH_TOKEN, 'owned-refresh-token', 0);
    const refreshes: number[] = [];
    const context = { psdevslnsys: 'owned-model-root' };
    const get = vi.fn(async (path: string, query?: IParams) => {
      if (path === '/uaa/refresh_token/owned-refresh-token') {
        refreshes.push(Date.now());
        return {
          ok: true,
          data: { token: `server-token-${refreshes.length}`, expirein: 20 },
        };
      }
      expect(path).toBe('/appdata');
      expect(query).toBe(context);
      return { ok: true, data: {} };
    });
    const initMqtt = vi.fn();
    vi.stubGlobal('ibiz', { env: {}, net: { get }, hub: { initMqtt } });
    await new V7AuthService().extendLogin(context);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(14999);
    expect(get).not.toHaveBeenCalled();
    for (let cycle = 1; cycle <= 4; cycle += 1) {
      await vi.advanceTimersByTimeAsync(cycle === 1 ? 1 : 15000);
      expect(refreshes).toHaveLength(cycle);
      expect(refreshes[refreshes.length - 1]).toBe(clock + cycle * 15000);
      expect(get).toHaveBeenCalledTimes(cycle * 2);
      expect(initMqtt).toHaveBeenCalledTimes(cycle);
      expect(Number(getAppCookie(CoreConst.TOKEN_EXPIRES)) - Date.now()).toBe(
        20000,
      );
      expect(vi.getTimerCount()).toBe(1);
    }
  });

  it('does not schedule real extendLogin timers or modify cookies for invalid and expired dates', async () => {
    const get = vi.fn();
    vi.stubGlobal('ibiz', {
      env: {},
      net: { get },
      hub: { initMqtt: vi.fn() },
    });
    setAppCookie(CoreConst.TOKEN, 'unchanged-server-token', 0);
    for (const expiresAt of [
      'invalid',
      'Infinity',
      `${clock}`,
      `${clock - 1}`,
    ]) {
      setAppCookie(CoreConst.TOKEN_EXPIRES, expiresAt, 0);
      await new V7AuthService().extendLogin();
      expect(vi.getTimerCount()).toBe(0);
      expect(getAppCookie(CoreConst.TOKEN)).toBe('unchanged-server-token');
      expect(getAppCookie(CoreConst.TOKEN_EXPIRES)).toBe(expiresAt);
    }
    expect(get).not.toHaveBeenCalled();
  });
});
