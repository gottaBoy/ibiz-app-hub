import { EngineFactory } from './engine';
import { GlobalUtil } from './global';
import {
  IMessageUtil,
  INotificationUtil,
  IOpenViewUtil,
  IModalUtil,
  IConfirmUtil,
  ILoadingUtil,
  IPluginFactory,
  IOverlayController,
  IGlobalConfig,
  IAppHubService,
  IAuthService,
  IPlatformProvider,
  INoticeUtil,
  IMarkOpenDataService,
  IRenderUtil,
  IAppUtil,
  IFullscreenUtil,
  IThirdAuthService,
  IQrcodeUtil,
  IInLineAIUtil,
  IAIChatUtil,
  IScreenShotUtil,
  IPrintPreviewUtil,
} from './interface';
import { LogicSchedulerCenter } from './logic-scheduler';
import { RegisterCenter } from './register/register-center';
import { UIDomainManager, CollaborateManager } from './utils';

declare module '@ibiz-template/core' {
  interface IBizSys {
    /**
     * 全局加载动画工具
     *
     * @author chitanda
     * @date 2022-08-17 17:08:51
     * @type {ILoadingUtil}
     */
    loading: ILoadingUtil;

    /**
     * 运行时总集
     *
     * @author chitanda
     * @date 2022-12-21 14:12:34
     * @type {IAppHubService}
     */
    hub: IAppHubService;

    /**
     * 简洁确认框
     *
     * @description 需要用户确认收到提示消息时使用此工具
     * @author chitanda
     * @date 2022-08-17 16:08:10
     * @type {IModalUtil}
     */
    modal: IModalUtil;

    /**
     * 确认框
     *
     * @description 需要用户确认收到提示消息时使用此工具
     * @author chitanda
     * @date 2022-08-17 16:08:10
     * @type {IConfirmUtil}
     */
    confirm: IConfirmUtil;

    /**
     * 消息通知
     *
     * @description 顶部居中显示，并自动消失
     * @author chitanda
     * @date 2022-08-17 15:08:00
     * @type {IMessageUtil}
     */
    message: IMessageUtil;

    /**
     * 通知框
     *
     * @description 在界面右上角显示可关闭的全局通知
     * @author chitanda
     * @date 2022-08-17 15:08:47
     * @type {INotificationUtil}
     */
    notification: INotificationUtil;

    /**
     * 全局的消息通知类
     * @author lxm
     * @date 2024-01-26 05:10:37
     * @type {INoticeUtil}
     */
    notice: INoticeUtil;

    /**
     * 多模式打开视图工具类
     *
     * @description 需要在具体的前端技术框架中实现此工具类并挂载
     * @author chitanda
     * @date 2022-08-16 20:08:46
     * @type {IOpenViewUtil}
     */
    openView: IOpenViewUtil;

    /**
     * 绘制工具类
     *
     * @description 需要在具体的前端技术框架中实现此工具类并挂载
     * @author tony001
     * @date 2024-05-08 16:05:21
     * @type {IRenderUtil}
     */
    render: IRenderUtil;

    /**
     * 应用级功能接口定义，承载应用级功能实现，包含登录、注册、修改密码、切换主题等功能
     *
     * @author tony001
     * @date 2024-05-14 16:05:17
     * @type {IAppUtil}
     */
    appUtil: IAppUtil;

    /**
     * 打印预览服务
     */
    printPreview: IPrintPreviewUtil;

    /**
     * 全局多种组件呈现工具类
     *
     * @author chitanda
     * @date 2022-11-08 15:11:08
     * @type {IOverlayController}
     */
    overlay: IOverlayController;

    /**
     * 插件工具工厂
     *
     * @author chitanda
     * @date 2022-10-20 16:10:36
     * @type {IPluginFactory}
     */
    plugin: IPluginFactory;

    /**
     * 注册中心
     *
     * @author lxm
     * @date 2022-09-19 19:09:23
     * @type {Register}
     */
    register: RegisterCenter;

    /**
     * 全局配置
     *
     * @author lxm
     * @date 2022-12-09 14:12:14
     * @type {IGlobalConfig}
     */
    config: IGlobalConfig;

    /**
     * 认证服务
     *
     * @author chitanda
     * @date 2022-07-20 10:07:33
     * @type {IAuthService}
     */
    auth: IAuthService;

    /**
     * 第三方认证服务
     *
     * @author tony001
     * @date 2024-11-18 14:11:20
     * @type {IThirdAuthService}
     */
    thirdAuth: IThirdAuthService;

    /**
     * 引擎工厂
     * @author lxm
     * @date 2023-04-25 07:42:23
     * @type {EngineFactory}
     */
    engine: EngineFactory;

    /**
     * 全局工具类
     *
     * @author chitanda
     * @date 2023-04-27 21:04:57
     * @type {GlobalUtil}
     */
    util: GlobalUtil;

    /**
     * 逻辑调度中心
     * @author lxm
     * @date 2023-06-25 06:50:06
     * @type {LogicSchedulerCenter}
     */
    scheduler: LogicSchedulerCenter;

    /**
     * 搭载平台
     *
     * @author zk
     * @date 2023-11-23 09:11:37
     * @type {IPlatformProvider}
     * @memberof IBizSys
     */
    platform: IPlatformProvider;

    /**
     * UI域管理器
     *
     * @author chitanda
     * @date 2023-12-22 15:12:41
     * @type {UIDomainManager}
     */
    uiDomainManager: UIDomainManager;

    /**
     * 协同管理器
     *
     * @author tony001
     * @date 2024-08-06 09:08:29
     * @type {CollaborateManager}
     */
    collaborateManager: CollaborateManager;

    /**
     * 标记打开数据服务
     * @author lxm
     * @date 2024-01-31 10:40:59
     * @type {IMarkOpenDataService}
     */
    markOpenData: IMarkOpenDataService;

    /**
     * 全屏展示
     * @author fzh
     * @date 2024-07-09 16:40:59
     * @type {IFullscreenUtil}
     */
    fullscreenUtil: IFullscreenUtil;

    /**
     * 二维码工具类
     * @author ljx
     * @date 2024-12-10 10:36:59
     * @type {IQrcodeUtil}
     */
    qrcodeUtil: IQrcodeUtil;

    /**
     * 行内AI聊天工具类
     * @type {IInLineAIUtil}
     */
    inLineAIUtil: IInLineAIUtil;

    /**
     * AI聊天工具类
     */
    aiChatUtil: IAIChatUtil;

    /**
     * @description 屏幕截图工具类
     * @type {IScreenShotUtil}
     * @memberof IBizSys
     */
    screenShotUtil: IScreenShotUtil;
  }

  interface IEnvironment {
    /**
     * 全局提供的功能性配置
     *
     * @description 默认无值使用默认配置，可以使用 environment.js 中的 globalConfig 覆盖默认配置
     * @author chitanda
     * @date 2023-09-15 14:09:14
     * @type {IGlobalConfig}
     */
    globalConfig?: IGlobalConfig;
  }
}
