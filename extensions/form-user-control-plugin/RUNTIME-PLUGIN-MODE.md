# 运行时插件模式

|    插件模式    | 是否已支持 |
| :------------: | :--------: |
|  非运行时插件  |     是     |
| 本地运行时插件 |     否     |
| 远程运行时插件 |     是     |

## 非运行时插件

非运行时插件与主项目一起编译打包，主项目中可以直接引用该插件，并且通过vue插件的形式挂载。

```typescript
import { App } from 'vue';
import plugin from '@ibiz-template-plugin-example/example-one';

// 挂载插件
export default {
  install(app: App): void {
    app.use(plugin);
  },
};
```

## 远程运行时插件

远程运行时插件单独部署在cdn上。主项目中不能直接引用该插件，在使用到时才会去远程加载该插件。cdn请求基础路径pluginBaseUrl可在environment.js中配置。运行时插件仓库配置填写需参照[unpkg规范](https://unpkg.com);

```typescript
// 加载远程插件
async loadPluginRef(
    rtObjectName: string,
    rtObjectRepo: string,
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
        : `${ibiz.env.pluginBaseUrl}/${join(pluginPath, 'package.json')}`;
      const res = await ibiz.net.axios({
        method: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        url: configUrl,
      });
      if (res.status !== 200) {
        throw new Error(`配置加载失败`);
      }
      configData = res.data;
    }
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
```
