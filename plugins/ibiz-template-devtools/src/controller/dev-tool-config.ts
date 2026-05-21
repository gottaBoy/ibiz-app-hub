import { IDevToolConfig } from '@ibiz-template/core';
import { LogLevelDesc } from 'loglevel';

/**
 * 开发工具配置文件
 * @author lxm
 * @date 2024-01-19 04:49:02
 * @export
 * @class DevToolConfig
 */
export class DevToolConfig implements IDevToolConfig {
  /**
   * 根容器元素id
   * @author lxm
   * @date 2024-01-19 04:42:42
   * @type {string}
   */
  containerId: string = 'devtool';

  /**
   * devtool配置存储的key
   * @author lxm
   * @date 2024-01-19 05:35:38
   * @type {string}
   */
  configStorageKey: string = '';

  /**
   * studio地址
   *
   * @author tony001
   * @date 2025-03-13 13:03:04
   * @type {string}
   */
  studioBaseUrl: string = '';

  /**
   * 触发code
   *
   * @author tony001
   * @date 2025-03-13 13:03:50
   * @type {string}
   */
  triggerButtonCode: string = 'F12';

  /**
   * 模型预览宽度
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-02-20 13:28:20
   */
  modelPreviewWidth?: number = 600;

  /**
   * 日志级别
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-02-20 13:28:20
   */
  logLevel: LogLevelDesc = ibiz.env.logLevel;

  /**
   * v9模式
   *
   * @author tony001
   * @date 2025-02-07 13:02:31
   * @type {boolean}
   */
  v9Mode: boolean = false;

  /**
   * @description 默认打开模式
   * @type {('open' | 'close')}
   * @memberof DevToolConfig
   */
  defaultMode: 'open' | 'close' = 'close';

  /**
   * 构造函数
   */
  constructor() {
    this.configStorageKey = `${ibiz.env.appId}-devtool-config`;
  }
}
