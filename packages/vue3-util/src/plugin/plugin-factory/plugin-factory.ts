import { RuntimeError, RuntimeModelError } from '@ibiz-template/core';
import {
  IPluginFactory,
  IPluginItem,
  ISystemImportMap,
  RemotePluginConfig,
  RemotePluginItem,
} from '@ibiz-template/runtime';
import { IAppPFPluginRef, ISysPFPlugin } from '@ibiz/model-core';
import path, { join } from 'path-browserify';
import { App, Plugin } from 'vue';
import { AppHooks } from '../../hooks';

/**
 * 插件工具类
 *
 * @author chitanda
 * @date 2022-10-21 16:10:29
 * @export
 * @class PluginFactory
 */
export class PluginFactory implements IPluginFactory {
  /**
   * 是否为 http || https 开头
   *
   * @author chitanda
   * @date 2022-11-07 14:11:28
   * @protected
   */
  protected urlReg = /^http[s]?:\/\/[^\s]*/;

  /**
   * 是否已经加载过文件缓存
   *
   * @author chitanda
   * @date 2022-10-31 14:10:17
   * @protected
   * @type {Map<string, boolean>}
   */
  protected cache: Map<string, boolean> = new Map();

  /**
   * 插件缓存
   *
   * @author chitanda
   * @date 2022-10-31 14:10:28
   * @protected
   * @type {Map<string, RemotePluginItem>}
   */
  protected pluginCache: Map<string, RemotePluginItem> = new Map();

  /**
   * @description 所有的插件
   * @protected
   * @type {{ code: Plugin; extraParams: IParams }[]}
   * @memberof PluginFactory
   */
  protected pluginCodes: { code: Plugin; extraParams: IParams }[] = [];

  /**
   * 预定义插件集合
   *
   * @author chitanda
   * @date 2023-03-09 17:03:46
   * @protected
   * @type {Map<string, IPluginItem>}
   */
  protected predefinedPlugins: Map<string, IPluginItem> = new Map();

  /**
   * 忽略加载的插件规则，支持正则。配配规则为插件包地址，如：@ibiz-template-vue/vue3-plugin-*
   *
   * @author chitanda
   * @date 2023-12-04 15:12:58
   * @protected
   * @type {((string | RegExp)[])}
   */
  protected ignoreRules: (string | RegExp)[] = [];

  /**
   * 插件加载队列
   *
   * @author chitanda
   * @date 2023-12-05 16:12:04
   * @protected
   * @type {Map<string, Promise<boolean>>}
   */
  protected loadQueue: Map<string, Promise<boolean>> = new Map();

  /**
   * 是否忽略插件加载
   *
   * @author chitanda
   * @date 2023-12-04 16:12:48
   * @protected
   * @param {string} pluginPath
   * @return {*}  {boolean}
   */
  protected isIgnore(pluginPath: string): boolean {
    return this.ignoreRules.some(rule => {
      if (typeof rule === 'string') {
        return pluginPath === rule;
      }
      return rule.test(pluginPath);
    });
  }

  /**
   * 设置本地开发忽略远程加载的插件
   *
   * @author chitanda
   * @date 2023-12-04 17:12:49
   * @param {(string | RegExp)} rule
   */
  setDevIgnore(rule: string | RegExp): void {
    this.ignoreRules.push(rule);
  }

  /**
   * 注册视图默认插件
   *
   * @author chitanda
   * @date 2023-02-06 21:02:10
   * @param {IPluginItem} plugin
   */
  registerPredefinedPlugin(plugin: IPluginItem): void {
    this.predefinedPlugins.set(plugin.name, plugin);
  }

  /**
   * 给入应用实例，将已经加载的过插件注入。主要用于多实例的情况
   *
   * @author chitanda
   * @date 2023-02-02 16:02:51
   * @param {App} app
   */
  register(app: App): void {
    this.pluginCodes.forEach(plugin => {
      app.use(plugin.code, plugin.extraParams);
    });
  }

  /**
   * 加载预置插件
   *
   * @author chitanda
   * @date 2023-03-09 18:03:48
   * @param {string} name
   * @return {*}  {Promise<void>}
   */
  async loadPredefinedPlugin(name: string): Promise<void> {
    if (this.predefinedPlugins.has(name)) {
      const plugin = this.predefinedPlugins.get(name)!;
      if (plugin) {
        await this.loadPluginRef(plugin.name, plugin.path);
      }
    }
  }

  /**
   * @description 插件刚加载完成回来，设置到目前所有的 vue 实例当中
   * @protected
   * @param {Plugin} code
   * @param {IParams} [extraParams={}]
   * @memberof PluginFactory
   */
  protected setPluginCode(code: Plugin, extraParams: IParams = {}): void {
    this.pluginCodes.push({ code, extraParams });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AppHooks.useComponent.callSync(null, code as any, extraParams);
  }

  /**
   * @description 加载插件
   * @param {ISysPFPlugin} plugin
   * @param {string} [appId=ibiz.env.appId]
   * @returns {*}  {Promise<boolean>}
   * @memberof PluginFactory
   */
  async loadPlugin(
    plugin: ISysPFPlugin,
    appId: string = ibiz.env.appId,
  ): Promise<boolean> {
    if (plugin.runtimeObject === true) {
      const pluginRef = plugin as unknown as IAppPFPluginRef;
      if (pluginRef) {
        const rtObjectName = pluginRef.rtobjectName!;
        const rtObjectRepo = pluginRef.rtobjectRepo!;
        const pluginParams = pluginRef.pluginParams || {};
        if (this.isIgnore(rtObjectRepo)) {
          return true;
        }
        if (this.pluginCache.has(rtObjectName)) {
          return true;
        }
        if (this.loadQueue.has(rtObjectRepo)) {
          const p = await this.loadQueue.get(rtObjectRepo)!;
          try {
            const result = await p;
            return result;
          } catch (error) {
            return false;
          }
        }
        try {
          const p = this.loadPluginRef(
            pluginRef.rtobjectName!,
            pluginRef.rtobjectRepo!,
            appId,
            { ...pluginParams },
          );
          this.loadQueue.set(rtObjectRepo, p);
          const result = await p;
          return result;
        } catch (error) {
          throw new RuntimeModelError(
            pluginRef,
            ibiz.i18n.t('vue3Util.plugin.failureConfigurationLoad'),
          );
        } finally {
          this.loadQueue.delete(rtObjectRepo);
        }
      }
    }
    return false;
  }

  /**
   * @description 加载应用插件
   * @param {string} rtObjectName
   * @param {string} rtObjectRepo
   * @param {string} [appId=ibiz.env.appId]
   * @param {IParams} [params={}]
   * @returns {*}  {Promise<boolean>}
   * @memberof PluginFactory
   */
  async loadPluginRef(
    rtObjectName: string,
    rtObjectRepo: string,
    appId: string = ibiz.env.appId,
    extraParams: IParams = {},
  ): Promise<boolean> {
    if (this.isIgnore(rtObjectRepo)) {
      return true;
    }
    if (this.pluginCache.has(rtObjectName)) {
      return true;
    }
    let configData: unknown = null;
    {
      const pluginPath: string = rtObjectRepo;
      const configUrl = this.urlReg.test(pluginPath)
        ? `${pluginPath}/package.json`
        : `${ibiz.env.runContainer === 'FULLCODE' && appId !== ibiz.env.appId ? ibiz.hub.microAppConfigCenter.getPluginBaseUrl(appId) : ibiz.env.pluginBaseUrl}/${join(pluginPath, 'package.json')}`;
      const res = await ibiz.net.axios({
        method: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        url: configUrl,
      });
      if (res.status !== 200) {
        throw new Error(
          ibiz.i18n.t('vue3Util.plugin.failureConfigurationLoad'),
        );
      }
      configData = res.data;
    }
    Object.assign(configData as RemotePluginConfig, { appId, extraParams });
    const remotePlugin = new RemotePluginItem(
      rtObjectName,
      rtObjectRepo,
      configData as RemotePluginConfig,
    );
    if (remotePlugin) {
      await this.loadPluginExternal(remotePlugin.config);
      try {
        await this.loadScript(remotePlugin);
        this.pluginCache.set(rtObjectName, remotePlugin);
        return true;
      } catch (error) {
        ibiz.log.error(error);
      }
    }
    return false;
  }

  protected normalizedPath(base: string, relativePath: string): string {
    if (this.urlReg.test(relativePath)) {
      return new URL(relativePath).href;
    }
    if (this.urlReg.test(base)) {
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      return new URL(relativePath, normalizedBase).href;
    }
    return path.join(base, relativePath);
  }

  /**
   * 加载插件
   *
   * @author chitanda
   * @date 2022-11-02 14:11:31
   * @protected
   * @param {RemotePluginItem} remotePlugin
   * @return {*}  {Promise<void>}
   */
  protected async loadScript(remotePlugin: RemotePluginItem): Promise<void> {
    const pluginPath: string = remotePlugin.repo;
    const {
      name,
      appId,
      system,
      styles = [],
      extraParams = {},
    } = remotePlugin.config;
    const scriptUrl = this.normalizedPath(pluginPath, system);
    if (scriptUrl) {
      if (this.cache.has(scriptUrl)) {
        return;
      }
      const baseUrl: string =
        ibiz.env.runContainer === 'FULLCODE' && appId !== ibiz.env.appId
          ? ibiz.hub.microAppConfigCenter.getPluginBaseUrl(appId)
          : ibiz.env.pluginBaseUrl;
      let data: IParams | null = null;
      const url = this.parseUrl(scriptUrl, baseUrl);
      const styleUrls = (typeof styles === 'string' ? [styles] : styles).map(
        styleUrl => this.parseUrl(
          this.normalizedPath(pluginPath, styleUrl),
          baseUrl,
        ),
      );
      System.addImportMap({
        imports: {
          [name]: url,
        },
        styles: {
          [name]: styleUrls,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      data = await System.import(name);
      if (data) {
        if (data.default) {
          this.setPluginCode(data.default, extraParams);
        } else {
          throw new RuntimeError(
            ibiz.i18n.t('vue3Util.plugin.failedRemotePluginLoad'),
          );
        }
        this.cache.set(scriptUrl, true);
      } else {
        throw new RuntimeError(
          ibiz.i18n.t('vue3Util.plugin.fileContentFormat'),
        );
      }
    }
  }

  /**
   * 编译请求文件地址
   *
   * @author chitanda
   * @date 2024-01-11 16:01:19
   * @protected
   * @param {string} pathUrl
   * @param {string} [baseUrl=ibiz.env.pluginBaseUrl]
   * @return {*}  {string}
   */
  protected parseUrl(
    pathUrl: string,
    baseUrl: string = ibiz.env.pluginBaseUrl,
  ): string {
    if (this.urlReg.test(pathUrl)) {
      return pathUrl;
    }
    let url: string = '';
    if (this.urlReg.test(baseUrl)) {
      if (pathUrl.startsWith('/')) {
        url = baseUrl + pathUrl;
      } else {
        url = `${baseUrl}/${pathUrl}`;
      }
    } else {
      url = `${join(baseUrl, pathUrl)}`;
    }
    const { origin, pathname } = window.location;
    if (pathname.endsWith('/') && url.startsWith('/')) {
      url = url.substring(1);
    }
    if (this.urlReg.test(url) === false) {
      url = `${origin}${pathname}${url}`;
    }
    return url;
  }

  /**
   * 加载插件的外部依赖
   *
   * @author chitanda
   * @date 2024-01-19 19:01:39
   * @protected
   * @param {RemotePluginConfig} config
   * @return {*}  {Promise<void>}
   */
  protected async loadPluginExternal(
    config: RemotePluginConfig,
  ): Promise<void> {
    if (!config['systemjs-importmap']) {
      return;
    }
    const importMap = this.handleSystemImportMap(
      config['systemjs-importmap'],
      config.appId,
    )!;
    if (importMap.packages) {
      const pkgs = importMap.packages;
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const key in pkgs) {
        const pkgPath = pkgs[key];
        // eslint-disable-next-line no-await-in-loop
        const res = await ibiz.net.axios({
          method: 'get',
          headers: { 'Access-Control-Allow-Origin': '*' },
          url: pkgPath,
        });
        if (res.status !== 200) {
          throw new Error(
            ibiz.i18n.t('vue3Util.plugin.failureConfigurationLoad'),
          );
        }
        const result: RemotePluginConfig = res.data as RemotePluginConfig;
        Object.assign(result, { appId: config.appId });
        // eslint-disable-next-line no-await-in-loop
        await this.loadPluginExternal(result);
      }
    }
    System.addImportMap(importMap);
  }

  /**
   * @description 处理 systemjs importmap 配置
   * @protected
   * @param {ISystemImportMap} importMap
   * @param {string} appId
   * @returns {*}  {(ISystemImportMap | null)}
   * @memberof PluginFactory
   */
  protected handleSystemImportMap(
    importMap: ISystemImportMap,
    appId: string,
  ): ISystemImportMap | null {
    if (importMap) {
      if (
        !importMap.baseUrl &&
        ibiz.env.runContainer === 'FULLCODE' &&
        appId !== ibiz.env.appId
      ) {
        importMap.baseUrl =
          ibiz.hub.microAppConfigCenter.getPluginBaseUrl(appId);
      }
      if (importMap.packages) {
        const pkgs = importMap.packages;
        // eslint-disable-next-line no-restricted-syntax
        for (const key in pkgs) {
          if (Object.prototype.hasOwnProperty.call(pkgs, key)) {
            const url = pkgs[key];
            pkgs[key] = this.parseUrl(url, importMap.baseUrl);
          }
        }
      }
      if (importMap.imports) {
        const imps = importMap.imports;
        // eslint-disable-next-line no-restricted-syntax
        for (const key in imps) {
          if (Object.prototype.hasOwnProperty.call(imps, key)) {
            const url = imps[key];
            imps[key] = this.parseUrl(url, importMap.baseUrl);
          }
        }
      }
      if (importMap.styles) {
        const styles = importMap.styles;
        // eslint-disable-next-line no-restricted-syntax
        for (const key in styles) {
          if (Object.prototype.hasOwnProperty.call(styles, key)) {
            const urls = styles[key];
            if (typeof urls === 'string') {
              styles[key] = this.parseUrl(urls, importMap.baseUrl);
            } else {
              styles[key] = urls.map(url =>
                this.parseUrl(url, importMap.baseUrl),
              );
            }
          }
        }
      }
      return importMap;
    }
    return null;
  }
}
