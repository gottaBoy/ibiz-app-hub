# 版本变更日志

这个项目的所有关键变化都将记录在此文件中.

此日志格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
并且此项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

## [0.0.12] - 2025-10-11

### Fixed

- 修复不同打开配置平台指向同一个浏览器窗口问题

## [0.0.12] - 2025-09-28

### Added

- 开发调试工具新增子应用打开设计工具能力，如果用户配置配置包含psdevslnsys标识，则不会处理，否则会根据当前环境应用的psdevslnsys值动态拼接路径,后续自定义路径只需配置到hash这一层（'#/'）即可

## [0.0.10] - 2025-05-27

### Added

- 新增开发调试工具默认打开模式配置，可选值：'open' | 'close'，默认值为'close'，同时识别nacos配置modeldesigndefaultmode参数

## [0.0.10] - 2025-03-31

- 初始化
