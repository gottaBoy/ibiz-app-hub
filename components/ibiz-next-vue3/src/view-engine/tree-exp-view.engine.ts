import {
  ViewController,
  ITreeExpViewEvent,
  ITreeExpViewState,
  SysUIActionTag,
  ITreeController,
  calcDeCodeNameById,
  IApiTreeExpViewCall,
} from '@ibiz-template/runtime';
import { IAppDETreeExplorerView } from '@ibiz/model-core';
import { RuntimeError } from '@ibiz-template/core';
import { ExpViewEngine } from './exp-view.engine';

export class TreeExpViewEngine extends ExpViewEngine {
  /**
   * 树导航视图控制器
   */
  declare protected view: ViewController<
    IAppDETreeExplorerView,
    ITreeExpViewState,
    ITreeExpViewEvent
  >;

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

  async call(
    key: keyof IApiTreeExpViewCall,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH_ALL) {
      await this.tree.refresh();
      return null;
    }
    // 有数据刷新子节点，没数据刷新所有
    if (key === SysUIActionTag.REFRESH) {
      if (args?.data?.[0]) {
        await this.tree.refreshNodeChildren(args.data[0], false);
      } else {
        await this.tree.refresh();
      }
      return null;
    }
    if (key === SysUIActionTag.REFRESH_PARENT) {
      await this.tree.refreshNodeChildren(args.data[0], true);
      return null;
    }
    if (key === SysUIActionTag.EXPAND) {
      const { data = [] } = args;
      const { srfcollapsetag } = args.params || {};
      let tag: string = srfcollapsetag || '';
      if (!tag && data.length > 0) {
        tag = data[0].srfnodeid;
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noExpandTag'));
      }
      this.tree.changeCollapse({ tag, expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSE) {
      const { data = [] } = args;
      const { srfcollapsetag } = args.params || {};
      let tag: string = srfcollapsetag || '';
      if (!tag && data.length > 0) {
        tag = data[0].srfnodeid;
      }
      if (!tag) {
        throw new RuntimeError(ibiz.i18n.t('viewEngine.noCollapseTag'));
      }
      this.tree.changeCollapse({ tag, expand: false });
      return null;
    }
    if (key === SysUIActionTag.EXPANDALL) {
      this.tree.changeCollapse({ expand: true });
      return null;
    }
    if (key === SysUIActionTag.COLLAPSEALL) {
      this.tree.changeCollapse({ expand: false });
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof TreeExpViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    await this.loadEntityData();
  }

  /**
   * 加载实体主数据
   *
   * @return {*}  {Promise<void>}
   * @memberof TreeExpViewEngine
   */
  async loadEntityData(): Promise<void> {
    const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
    // 无主键或者导航视图未开启显示信息栏时都不进行处理
    if (!this.view.context[deName] || !this.view.model.showDataInfoBar) {
      return;
    }
    return super.loadEntityData();
  }
}
