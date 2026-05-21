# 版本变更日志

这个项目的所有关键变化都将记录在此文件中.

此日志格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
并且此项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

## [0.7.41-alpha.63] - 2026-01-07

### Added

- 新增移动端isEnableMobLoading环境变量

## [0.7.41-alpha.61] - 2026-01-04

### Added

- 新增移动端应用初始化loading环境变量（mobLoadingCaption、mobLoadingDescription、mobLoadingBackground）

## [0.7.41-alpha.59] - 2025-12-30

### Fixed

- 修复第三方包漏洞，更新axios版本至1.8.2、vitest版本至1.6.1

## [0.7.41-alpha.35] - 2025-11-10

### Added

- 新增isPortalApp环境变量，默认为false，用于约束站内信通知查询（非门户应用仅查询当前系统数据）

## [0.7.41-alpha.23] - 2025-09-04

### Added

- 新增移动端微信mobWeChatAppId环境参数，值为微信公众号appId或微信小程序appid

## [0.7.41-alpha.18] - 2025-08-14

### Fixed

- 修复字符串数据填充不正确异常

## [0.7.41-alpha.9] - 2025-07-04

### Added

- 上下文删除getTempContext方法

## [0.7.41-alpha.7] - 2025-06-27

### Added

- 上下文新增getTempContext方法返回没有预置字段的上下文

## [0.7.41-alpha.1] - 2025-06-06

### Changed

- 发送请求时删除界面使用视图参数srfmenuitem

## [0.7.40] - 2025-06-04

### Fixed

- 修复拦截器发送appdata请求未携带应用上下文

## [0.7.40-alpha.18] - 2025-05-23

### Changed

- 优化匿名登录操作过程中token失效，如果存在refreshToken则通过refreshToken换算token，不存在则通过匿名登录换算token

## [0.7.40-alpha.7] - 2025-04-15

### Added

- 新增appVersion环境变量，用于配置应用版本号

### Changed

- 优化访问权限数据存储区域重置逻辑

## [0.7.40-alpha.5] - 2025-04-10

### Added

- 新增accessStoreArea环境变量，用于配置访问数据存储区域

## [0.7.40-alpha.3] - 2025-04-09

### Changed

- 优化接口定义，抽离sdk接口

## [0.7.40-alpha.2] - 2025-04-08

### Changed

- 优化接口定义，抽离sdk接口

## [0.7.40-alpha.1] - 2025-04-07

### Changed

- 优化代码风格

## [0.7.40-alpha.0] - 2025-04-02

### Changed

- 更新AI聊天信息接口

## [0.7.39-alpha.2] - 2025-03-28

### Added

- 新增enableAI环境参数，用于控制是否启用AI辅助功能

## [0.7.39-alpha.0] - 2025-03-24

### Fixed

- 修复用户交互过程中服务响应401未执行刷新token问题

## [0.7.38-alpha.49] - 2025-01-10

### Added

- 新增appLoadingTheme环境参数，可选值为 'DEFAULT' | 'DARK' | 'LIGHT'
- 新增添加变更（ADDINCHANGED）指令消息
- 新增AppLabel环境变量用于定义网页标签文本

## [0.7.38-alpha.48] - 2025-01-06

### Added

- 新增cookieDomain环境参数用于约束cookie作用域

## [0.7.38-alpha.43] - 2024-12-24

### Added

- 新增环境变量参数enableEncryption
- 新增获取随机数方法getRandomInt

## [0.7.38-alpha.41] - 2024-12-22

### Added

- 新增oauth2方式登录相关参数定义

## [0.7.38-alpha.36] - 2024-12-11

### Added

- 添加tokenHeader与tokenPrefix环境参数
- 添加fixJsonString方法将非标准JSON字符串按照常见格式错误解析为有效的 JSON 对象

## [0.7.38-alpha.15] - 2024-10-13

### Added

- IContext添加deepClone方法

## [0.7.38-alpha.14] - 2024-10-10

### Added

- 添加base转blob方法

## [0.7.25] - 2024-06-19

### Fixed

- 修复上下文获取属性报错

## [0.7.17] - 2024-05-23

### Added

- 增加国际化内容

## [0.7.16] - 2024-05-22

### Changed

- 国际化作用域声明优化、并提供合并语言资源能力

## [0.6.18] - 2024-04-08

### Added

- markopendata支持mqtt消息通信，提供对应的消息数据data
- 新增实体错误类

## [0.6.15] - 2024-03-28

### Changed

- 消息数据接口增加触发源字段

## [0.6.12] - 2024-03-21

### Changed

- 上下文构建设置属性设置其configurable为true

## [0.6.10] - 2024-03-17

### Changed

- 递归遍历子元素回调参数增加\_parent参数

## [0.6.3] - 2024-02-29

### Changed

- 环境变量 AppTitle 不再给默认值

## [0.6.1-alpha.2] - 2024-02-22

### Added

- bit-mask工具方法补充单元测试
- util,types,sync,string-util工具方法补充单元测试
- clone、color、download-file工具方法补充单元测试
- click-outside、event、history-list工具方法补充单元测试
- message-center,net,recursive,style工具方法补充单元测试

## [0.5.7-alpha.4] - 2024-01-29

### Changed

- 环境变量 文件上传 & 文件下载 地址调整[兼容defaultOSSCat]

## [0.5.1-beta.2] - 2024-01-05

### Added

- 环境变量新增市场地址 marketAddress

## [0.5.0-beta.5] - 2024-01-02

### Added

- 新增判断字符串是否为 Base64 图片格式工具类方法
- 新增 HistoryList 工具类，可记录对象操作历史
- 支持通过实体的jsonschema添加搜索栏的过滤项
- 支持通过实体的jsonschema添加表格自定义列

## [0.4.6] - 2023-12-06

### Changed

- 上下文声明 srfappid 改为非可选项，适配多应用模式

## [0.3.5] - 2023-11-24

### Changed

- 默认插件仓库地址改为公司私有仓库 unpkg cdn

## [0.3.0] - 2023-11-16

### Changed

- 修正编译和包引入相关，兼容 safari 浏览器
- HttpResponse 中 axios 引入方式变更，处理 safari 浏览器兼容问题
- net 请求类在后台返回空字符串时，任 undefined 无值处理

## [0.2.15] - 2023-11-11

### Added

- 添加位掩码方式的状态设置，检查，删除工具方法

### PackageUpgrade

- axios@1.6.1

## [0.2.13] - 2023-11-08

### Added

- 添加处理浮点数相加工具类方法

## [0.2.6] - 2023-10-27

### Added

- 添加IBizParams类型，代理父对象，能取同步取到最新的父对象数据，但修改不会影响父对象。

## [0.2.4] - 2023-10-26

### Changed

- 请求 url 进行 encode 转码，避免特殊字符异常

## [0.2.2] - 2023-10-25

### Added

- 提供克隆方法，支持深拷贝且每次拷贝对象的时候如果有clone方法则用clone方法拷贝

## [0.1.38] - 2023-10-23

### Added

- 消息中心，command 类型新增 asyncAction 模式直通

## [0.1.36] - 2023-10-17

### Added

- 添加校验字符串是否是svg图片格式的辅助方法

## [0.1.34] - 2023-10-12

### Added

- net 请求封装新增 sse 支持

### AddPackages

- @microsoft/fetch-event-source@2.0.1

## [0.1.32] - 2023-10-08

### PackageUpgrade

- axios@1.5.1
- ramda@0.29.1

## [0.1.23] - 2023-09-12

### PackageUpgrade

- axios@1.5.0

## [0.1.18] - 2023-09-05

### Added

- 新增消息中心机制，识别 command 指令的 create、update、remove 消息

## [0.1.13] - 2023-08-29

### Changed

- 复数转换，补充额外的特殊复数转换 ex => ices

## [0.1.12] - 2023-08-25

### Added

- 是否启用了多语言环境参数
- 添加数据类型辅助工具类

## [0.1.8] - 2023-08-20

### Added

- 补充多语言规范接口

## [0.1.3] - 2023-08-08

### Added
