import { GlobalConfig } from './config/global-config';
import { RegisterCenter } from './register/register-center';
import { installCommand } from './command';
import {
  MarkOpenDataService,
  presetAppCounterProvider,
  presetDEMethodProvider,
  ThirdAuthService,
  V7AuthService,
} from './service';
import { AppHub } from './app-hub';
import { EngineFactory, installCtrlEngine } from './engine';
import { GlobalUtil } from './global';
import { presetUIActionProvider } from './ui-action';
import { installLogicSchedule } from './logic-scheduler';
import { install as installPlatformProvider } from './platform/provider';
import { getPlatformProvider } from './register';
import { CollaborateManager, UIDomainManager } from './utils';

/**
 * 安装运行时
 *
 * @author chitanda
 * @date 2022-07-25 11:07:26
 * @export
 */
export function install(): void {
  const { ibiz } = window;
  // 全局工具类
  ibiz.util = new GlobalUtil();
  // 应用中心
  ibiz.hub = new AppHub();
  // 挂载注册中心
  ibiz.register = new RegisterCenter();
  // 初始化全局配置
  ibiz.config = new GlobalConfig();
  // 挂载认证服务
  ibiz.auth = new V7AuthService();
  // 挂载引擎工厂
  ibiz.engine = new EngineFactory();
  // 挂载界面域管理
  ibiz.uiDomainManager = new UIDomainManager();
  // 挂载协同管理器
  ibiz.collaborateManager = new CollaborateManager();
  // 挂载MarkOpenData服务
  ibiz.markOpenData = new MarkOpenDataService();
  // 安装默认指令
  installCommand();
  // 注册界面行为适配器
  presetUIActionProvider();
  // 注册界面行为适配器
  presetDEMethodProvider();
  // 注册应用计数器适配器
  presetAppCounterProvider();
  // 安装逻辑调度器
  installLogicSchedule();
  // 注册搭载平台适配器
  installPlatformProvider();
  // 注册部件引擎
  installCtrlEngine();
  // 搭载平台  - 先注册 后挂载
  ibiz.platform = getPlatformProvider();
  // 初始化第三方认证服务
  ibiz.thirdAuth = new ThirdAuthService();
}
