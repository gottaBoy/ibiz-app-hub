# 表格插件

表格插件可自定义表格内容的绘制，当标准逻辑无法满足表格绘制要求时，可以通过表格插件来实现。modeling建模平台创建表格插件可参见 [插件开发](https://open.ibizlab.cn/apphub/zh/guide/plugin-dev.html)

## 插件结构

```
|─ ─ entity-field-grid                        表格插件顶层目录
  |─ ─ src                                    表格插件源代码目录
    |─ ─ utils                                表格插件工具目录
      |─ ─ grid-control.util.ts               表格插件工具
      |─ ─ use-pagination.ts                  表格插件分页工具
      |─ ─ use-row-edit-popover.tsx           表格插件行编辑弹窗工具
​    |─ ─ entity-field-grid.controller.ts      表格插件控制器
​    |─ ─ entity-field-grid.provider.ts        表格插件适配器
​    |─ ─ entity-field-grid.scss               表格插件样式
​    |─ ─ entity-field-grid.tsx                表格插件组件
​    |─ ─ index.ts                             表格插件入口文件
```

- 表格插件入口文件

表格插件入口文件会全局注册表格插件适配器和表格插件组件，供外部使用。

- 表格插件组件

表格插件组件使用tsx的书写方式，承载表格绘制的内容。

- 表格插件适配器

表格插件适配器主要通过component属性指定表格实际要绘制的组件，并且通过createController方法返回传递给表格的控制器。

- 表格插件控制器

表格插件控制器承载表格的逻辑控制。

## 本地开发

1. 安装依赖并link至全局

```sh
// 安装依赖
pnpm i

// link底包
./scripts/link.sh

// 启动
pnpm dev

// link到全局
pnpm link --global
```

2. 主项目包中引用插件

```sh
// link插件
pnpm link --global '@ibiz-plugin-example/entity-field-grid'
```

3. 主项目包中注册插件

```ts
import { App } from 'vue';
import EntityFieldGrid from '@ibiz-plugin-example/entity-field-grid';

export default {
  install(app: App): void {
    app.use(EntityFieldGrid);
    // 设置本地开发需要忽略加载的插件，可填写正则或全匹配字符串。匹配插件在modeling建模平台配置的[运行时插件仓库配置]内容
    ibiz.plugin.setDevIgnore(/^@ibiz-plugin-example\/entity-field-grid/);
  },
};
```