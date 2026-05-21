import { createApp, reactive, toRaw } from 'vue';
import {
  IAppDEService,
  IOverlayPopoverContainer,
  IViewController,
} from '@ibiz-template/runtime';
import { createUUID } from 'qx-util';
import { IDevToolConfig } from '@ibiz-template/core';
import { IndexPage, ViewModelViewer } from '../components';
import { DevToolConfig } from './dev-tool-config';
import { ICenterControllerState } from '../interface/i-center-controller-state';
import { IDevToolController } from '../interface/i-devtool-controller';

/**
 * 控制中心
 * @author lxm
 * @date 2024-01-19 11:08:45
 * @export
 * @class CenterController
 */
export class CenterController implements IDevToolController {
  /**
   * 配置对象
   * @author lxm
   * @date 2024-01-19 04:49:30
   */
  config = new DevToolConfig();

  /**
   * 用户配置对象
   * @author lxm
   * @date 2024-01-19 05:46:29
   */
  userConfig?: Partial<IDevToolConfig>;

  /**
   * 根组件dom元素
   * @author lxm
   * @date 2024-02-19 09:36:34
   * @type {HTMLElement}
   */
  rootElement?: HTMLElement;

  /**
   * 视图模型气泡
   * @author lxm
   * @date 2024-02-19 10:01:51
   * @type {IData}
   */
  viewModelPopover?: IOverlayPopoverContainer;

  /**
   * UI响应式状态对象
   * @author lxm
   * @date 2024-01-19 05:18:10
   * @type {ICenterControllerState}
   */
  state: ICenterControllerState = reactive({
    isShow: false,
    viewListRefreshKey: createUUID(),
    selectedViewId: null,
    hoverViewId: null,
  });

  /**
   * 当前激活的视图控制器集合
   * @author lxm
   * @date 2024-01-22 11:15:58
   * @readonly
   * @type {IViewController[]}
   */
  get activeViews(): IViewController[] {
    return ibiz.util.viewStack.getActives();
  }

  /**
   * @description 已打开的配置平台标签页Map
   * @protected
   * @type {Map<string, Window>}
   * @memberof CenterController
   */
  protected windowMap: Map<string, Window> = new Map();

  /**
   * 初始化
   * @author lxm
   * @date 2024-01-19 11:09:19
   */
  init(): void {
    this.loadUserConfig();
    this.mount();
    this.listenKeyDown();
    this.listenViewStack();
  }

  /**
   * 加载用户存储在浏览嘁的配置文件，并跟默认配置合并
   * @author lxm
   * @date 2024-01-19 04:51:57
   */
  protected loadUserConfig(): void {
    // 环境变量配置优先，用户配置再覆盖
    if (ibiz.env.devtoolConfig) {
      this.userConfig = ibiz.env.devtoolConfig;
      Object.assign(this.config, ibiz.env.devtoolConfig);
    }
    // 获取本地存储的配置数据
    const str = localStorage.getItem(this.config.configStorageKey);
    if (str) {
      const userConfig = JSON.parse(str) as IDevToolConfig;
      if (this.userConfig) {
        Object.assign(this.userConfig, userConfig);
      } else {
        this.userConfig = userConfig;
      }
      Object.assign(this.config, this.userConfig);
    }
  }

  /**
   * 更新用户配置
   *
   * @author tony001
   * @date 2025-03-17 18:03:44
   * @param {IContext} context
   */
  public updateConfig(context: IContext): void {
    if (!context) return;
    const data: Partial<IDevToolConfig> = {};
    if (context.modeldesignpath) {
      Object.assign(data, {
        studioBaseUrl: context.modeldesignpath,
      });
    }
    if (context.modeldesignmode && context.modeldesignmode === 'v9') {
      Object.assign(data, {
        v9Mode: true,
      });
    }
    if (
      context.modeldesigndefaultmode &&
      context.modeldesigndefaultmode === 'open'
    ) {
      Object.assign(data, {
        defaultMode: 'open',
      });
    }
    // 识别appdata返回上下文中modeldesignpath字段和modeldesignmode字段
    if (data && Object.keys(data).length > 0) {
      this.userConfig = data;
      Object.assign(this.config, data);
    }
    // 获取本地存储的配置数据
    const str = localStorage.getItem(this.config.configStorageKey);
    if (str) {
      const userConfig = JSON.parse(str) as IDevToolConfig;
      if (this.userConfig) {
        Object.assign(this.userConfig, userConfig);
      } else {
        this.userConfig = userConfig;
      }
      Object.assign(this.config, this.userConfig);
    }
    // 设置默认打开
    if (this.config.defaultMode === 'open') {
      this.triggerVisible(true);
    }
  }

  /**
   * 挂载到页面
   * @author lxm
   * @date 2024-01-19 11:10:35
   */
  protected mount(): void {
    const container = document.createElement('div');
    container.id = this.config.containerId;
    document.body.append(container);
    const app = createApp(IndexPage, {
      center: this,
    });
    app.mount(container);
    this.updateRootClass();
  }

  /**
   * 监听事件
   * @author lxm
   * @date 2024-01-19 04:45:24
   */
  protected listenKeyDown(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.code === this.config.triggerButtonCode
      ) {
        this.triggerVisible();
      }
    });
  }

  /**
   * 监听视图堆栈变更
   * @author lxm
   * @date 2024-01-22 11:29:18
   */
  protected listenViewStack(): void {
    ibiz.util.viewStack.evt.on('change', _msg => {
      this.state.viewListRefreshKey = createUUID();
    });
  }

  /**
   * 切换显示与否
   * @author lxm
   * @date 2024-01-29 07:38:35
   * @param {boolean} [visible]
   */
  async triggerVisible(visible?: boolean): Promise<void> {
    if (visible === undefined) {
      this.state.isShow = !this.state.isShow;
    } else {
      this.state.isShow = visible;
    }
    await this.updateRootClass();
  }

  /**
   * 更新body元素的类名，工具消失时关闭视图模型气泡
   * @author lxm
   * @date 2024-01-22 04:19:52
   * @protected
   */
  protected async updateRootClass(): Promise<void> {
    if (this.state.isShow) {
      document.body.classList.add('devtool-enable');
    } else {
      await this.closeViewModelPopover();
      document.body.classList.remove('devtool-enable');
    }
  }

  /**
   * 关闭视图模型气泡
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-02-20 10:50:47
   */
  protected async closeViewModelPopover(): Promise<void> {
    if (this.viewModelPopover) {
      await this.viewModelPopover.dismiss();
      this.viewModelPopover = undefined;
    }
  }

  /**
   * 更新用户配置文件
   * @author lxm
   * @date 2024-01-19 05:49:55
   * @param {Partial<IDevToolConfig>} config
   */
  updateUserConfig(config: Partial<IDevToolConfig>): void {
    if (!this.userConfig) {
      this.userConfig = {};
    }
    Object.assign(this.userConfig, config);
    localStorage.setItem(
      this.config.configStorageKey,
      JSON.stringify(this.userConfig),
    );
    Object.assign(this.config, this.userConfig);
  }

  /**
   * 拷贝视图的代码名称到剪贴板
   * @author lxm
   * @date 2024-01-22 01:44:54
   * @param {IViewController} view
   */
  copyCodeName(view: IViewController): void {
    const result = ibiz.util.text.copy(view.model.codeName!);
    if (result) {
      ibiz.message.success('拷贝代码名称成功!');
    } else {
      ibiz.message.error('拷贝代码名称失败，浏览器copy操作不被支持或未被启用!');
    }
  }

  /**
   * 打开指定视图的配置平台地址
   * @author lxm
   * @date 2024-01-22 01:47:00
   * @param {IViewController} view
   */
  openStudioUrl(view: IViewController): void {
    if (!this.config.studioBaseUrl) {
      ibiz.message.error('请先配置studio的基础路径');
      return;
    }
    const viewId = view.model.modelId;
    if (!viewId) {
      ibiz.message.error('请获取不到视图模型的主键');
      return;
    }
    const url = new URL(this.config.studioBaseUrl);
    const { origin, pathname, hash } = url;
    const appid = view.model.appId;
    const studioWindow = this.windowMap.get(appid);
    if (studioWindow && !studioWindow.closed) {
      if (this.config.v9Mode) {
        // 已经打开的窗口用postMessage发送并切换页面
        studioWindow.postMessage(
          {
            type: 'IBzOpenAppView',
            context: {
              psappview: viewId,
              srfredirectview: 'psappviewsettingredirectview',
            },
          },
          '*',
        );
      } else {
        // 已经打开的窗口用postMessage发送并切换页面
        studioWindow.postMessage(
          {
            type: 'IBzOpenAppView',
            context: {
              psctrlid: viewId,
            },
          },
          '*',
        );
      }
      studioWindow.focus();
    } else if (this.config.v9Mode) {
      let baseUrl = `${origin}${pathname}${hash}`;
      if (!hash.includes('psdevslnsys')) {
        const app = ibiz.hub.getApp(view.model.appId);
        if (!app.model.devSlnSysId) {
          ibiz.message.error('未配置系统标识，请联系管理员！');
          return;
        }
        baseUrl = `${origin}${pathname}${hash}psdevslnsys=${app.model.devSlnSysId}/modelingindex/`;
      }
      const openUrl = `${baseUrl}srfredirectview=psappviewsettingredirectview;psappview=${viewId}`;
      const targetWindow = window.open(openUrl, '_blank');
      if (targetWindow) {
        this.windowMap.set(appid, targetWindow);
      }
    } else {
      const paramStr = `?mode=redirect_appview&psctrlid=${viewId}`;
      const openUrl = `${origin}${pathname}${paramStr}${hash}`;
      const targetWindow = window.open(openUrl, '_blank');
      if (targetWindow) {
        this.windowMap.set(appid, targetWindow);
      }
    }
  }

  /**
   * 选中视图控制器
   * @author lxm
   * @date 2024-01-22 04:32:49
   * @param {IViewController} [view] 不给参数就是设置为空
   * @return {*}  {void}
   */
  selectView(view?: IViewController): void {
    if (this.state.selectedViewId === view?.id) {
      return;
    }

    // *删除上一个选中的视图的类名
    if (this.state.selectedViewId) {
      const lastEl = document.getElementById(this.state.selectedViewId);
      if (lastEl) {
        lastEl.classList.remove('devtool-selected-view');
      }
    }

    if (view) {
      //* 给当前选中视图添加样式
      const currentEl = document.getElementById(view.id);
      if (currentEl) {
        currentEl.classList.add('devtool-selected-view');
      }
      this.state.selectedViewId = view.id;
    } else {
      this.state.selectedViewId = null;
    }
  }

  /**
   * 悬浮视图控制器
   * @author lxm
   * @date 2024-01-22 04:32:49
   * @param {IViewController} [view] 不给参数就是设置为空
   * @return {*}  {void}
   */
  hoverView(view?: IViewController): void {
    if (this.state.hoverViewId === view?.id) {
      return;
    }

    // *删除上一个选中的视图的类名
    if (this.state.hoverViewId) {
      const lastEl = document.getElementById(this.state.hoverViewId);
      if (lastEl) {
        lastEl.classList.remove('devtool-hover-view');
      }
    }

    if (view) {
      //* 给当前选中视图添加样式
      const currentEl = document.getElementById(view.id);
      if (currentEl) {
        currentEl.classList.add('devtool-hover-view');
      }
      this.state.hoverViewId = view.id;
    } else {
      this.state.hoverViewId = null;
    }
  }

  /**
   * 浏览视图模型
   * @author lxm
   * @date 2024-01-22 06:33:54
   * @param {IViewController} [view]
   */
  async skimViewModel(view: IViewController): Promise<void> {
    console.log('视图dsl模型：', toRaw(view.model));
    if (this.viewModelPopover) {
      await this.viewModelPopover.dismiss();
    }
    this.viewModelPopover = ibiz.overlay.createPopover(
      ViewModelViewer,
      { view: view.model, center: this },
      { placement: 'left-start', autoClose: true },
    );
    this.viewModelPopover.present(this.rootElement!);
    await this.viewModelPopover.onWillDismiss();
    this.viewModelPopover = undefined;
  }

  /**
   * 浏览界面作用域下的临时数据
   * @author lxm
   * @date 2024-01-22 06:37:15
   * @param {IViewController} view
   */
  async skimTempData(view: IViewController): Promise<void> {
    const app = ibiz.hub.getApp(view.context.srfappid);
    const map: Map<string, IAppDEService> = (app.deService as IData).cache.get(
      view.context.srfsessionid,
    );
    if (!map) {
      console.log('没有缓存数据');
      return;
    }
    map.forEach(service => {
      console.group(`${service.model.codeName}实体的缓存数据`);
      console.log(service.local.cacheMap);
      console.groupEnd();
    });
  }
}
