/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs';
import { mergeDeepRight } from 'ramda';

const envMap = new Map([
  ['baseUrl', 'BaseUrl'],
  ['remoteModelUrl', 'remoteDynaPath'],
  ['dcSystem', 'mockDcSystemId'],
  ['enablePermission', 'enablePermissionValid'],
  ['enableTitle', 'enableTitle'],
]);

export async function attachEnvironmentConfig(): Promise<void> {
  const env = (window as any).Environment;
  const extension = Object.getOwnPropertyDescriptor(
    env || {},
    'enableExtensionPlugin',
  );
  if (
    extension &&
    (!Object.prototype.hasOwnProperty.call(extension, 'value') ||
      typeof extension.value !== 'boolean')
  ) {
    throw new TypeError('enableExtensionPlugin must be a boolean data property');
  }

  const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  // environment.js里的值覆盖到ibiz.env里，名称不一致的按envMap映射去修改。
  Object.keys(ibiz.env).forEach(key => {
    const key2 = envMap.has(key) ? envMap.get(key)! : key;
    if (key === 'enableExtensionPlugin') {
      if (extension) ibiz.env.enableExtensionPlugin = extension.value;
      return;
    }
    if (env[key2] != null) {
      if (key2 === 'customParams' || key2 === 'devtoolConfig') {
        (ibiz.env as any)[key] = JSON.parse(env[key2]);
      } else {
        (ibiz.env as any)[key] = env[key2];
      }
    }
  });

  if (query) {
    if (query.srfdcsystem) {
      ibiz.env.dcSystem = query.srfdcsystem as string;
    }
  }

  if (env.AppLabel) {
    document.title = env.AppLabel;
  }

  if (env.favicon) {
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon) {
      const fav = env.favicon as string;
      if (fav.endsWith('.png')) {
        favicon.type = 'image/png';
      } else if (fav.endsWith('.ico')) {
        favicon.type = 'image/x-icon';
      } else if (fav.endsWith('.gif')) {
        favicon.type = 'image/gif';
      } else if (fav.endsWith('.svg')) {
        favicon.type = 'image/svg+xml';
      }
      favicon.href = fav;
    }
  }

  if (env.globalConfig) {
    ibiz.env.globalConfig = env.globalConfig;
    ibiz.config = mergeDeepRight(ibiz.config, env.globalConfig);
  }

  ibiz.log.setLevel(ibiz.env.logLevel);
}
