/* eslint-disable no-case-declarations */
import { IPortalMessage } from '@ibiz-template/core';
import {
  ViewController,
  ITreeExpViewEvent,
  ITreeExpViewState,
  ITreeController,
  ViewEngineBase,
  IExpBarControlController,
  calcDeCodeNameById,
  SysUIActionTag,
  IApiMDViewCall,
} from '@ibiz-template/runtime';
import { IAppDataEntity, IAppDETreeExplorerView } from '@ibiz/model-core';

export class MobTreeExpViewEngine extends ViewEngineBase {
  /**
   * 树导航视图控制器
   */
  declare protected view: ViewController<
    IAppDETreeExplorerView,
    ITreeExpViewState,
    ITreeExpViewEvent
  >;

  get expBar(): IExpBarControlController {
    return this.view.getController(this.expBarName) as IExpBarControlController;
  }

  /**
   * 树导航栏部件名称
   *
   * @author lxm
   * @date 2023-08-31 03:43:02
   * @readonly
   * @type {string}
   */
  get expBarName(): string {
    return 'treeexpbar';
  }

  /**
   * 树部件控制器
   *
   * @readonly
   * @memberof TreeExpViewEngine
   */
  get tree(): ITreeController {
    return this.expBar.xDataController as ITreeController;
  }

  /**
   * @description 当前多数据部件对应的应用实体对象
   * @protected
   * @type {IAppDataEntity}
   * @memberof MobTreeExpViewEngine
   */
  protected dataEntity!: IAppDataEntity;

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('treeexppanel');
    if (!this.view.slotProps.treeexppanel) {
      this.view.slotProps.treeexppanel = {};
    }
    if (this.view.model.appDataEntityId) {
      // 初始化实体属性id和name的映射
      this.dataEntity = await ibiz.hub.getAppDataEntity(
        this.view.model.appDataEntityId!,
        this.view.model.appId,
      );
    }
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    this.expBar.state.srfnav = this.view.state.srfnav;
    const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
    if (!this.view.context[deName]) {
      return;
    }
    await this.loadEntityData();
  }

  async call(
    key: keyof IApiMDViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    _args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
  }

  /**
   * 视图刷新
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof MobTreeExpViewEngine
   */
  protected async refresh(): Promise<void> {
    // 重置当前展开节点,适配树控制load逻辑
    this.tree.state.mobExpandedKey = '';
    // 刷新后导航栏默认选中第一条并导航
    this.expBar.state.srfnav = '';
    await this.tree.refresh();
  }

  /**
   * @description 检测实体数据变更
   * @protected
   * @param {IPortalMessage} msg
   * @return {*}  {void}
   * @memberof MobTreeExpViewEngine
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    // 非这个实体的数据变更，则不处理
    if (
      !msg.data ||
      (msg.data as IData).srfdecodename !== this.dataEntity?.codeName
    ) {
      return;
    }

    let isRefresh = false;
    const { srfkey } = msg.data as IData;

    // 只监听更新事件
    switch (msg.subtype) {
      case 'OBJECTUPDATED':
        const { srfactiveviewdata } = this.view.state;
        if (srfactiveviewdata && srfactiveviewdata.srfkey === srfkey) {
          isRefresh = true;
        }
        break;
      default:
        break;
    }

    if (isRefresh) {
      this.loadEntityData();
    }
  }
}
