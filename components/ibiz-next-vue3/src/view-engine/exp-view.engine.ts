import { recursiveIterate } from '@ibiz-template/core';
import {
  ViewController,
  IExpBarControlController,
  IExpViewState,
  IExpViewEvent,
  MDViewEngine,
  IMDControlController,
  EventBase,
  MDCtrlLoadParams,
  getControl,
  IViewController,
} from '@ibiz-template/runtime';
import {
  IAppDEExplorerView,
  IAppDEMultiDataView,
  IPanelContainer,
} from '@ibiz/model-core';

type IAppDEMultiDataExpView = IAppDEExplorerView & IAppDEMultiDataView;

/**
 * 导航视图引擎基类
 *
 * @author zk
 * @date 2023-05-30 06:05:44
 * @export
 * @class ExpViewEngine
 * @extends {ViewEngineBase}
 */
export class ExpViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEMultiDataExpView,
    IExpViewState,
    IExpViewEvent
  >;

  /**
   * 导航栏部件名称
   *
   * @author zk
   * @date 2023-05-30 06:05:34
   * @readonly
   * @type {string}
   * @memberof ExpViewEngine
   */
  get expBarName(): string {
    throw Error(ibiz.i18n.t('viewEngine.subclassAchieve'));
  }

  /**
   * 表格导航栏部件控制器
   *
   * @author zk
   * @date 2023-05-29 04:05:32
   * @readonly
   * @memberof GridExpViewEngine
   */
  get expBar(): IExpBarControlController {
    return this.view.getController(this.expBarName) as IExpBarControlController;
  }

  /**
   * 数据部件控制器（多数据）
   * @author lxm
   * @date 2023-05-22 01:56:35
   * @readonly
   * @type {IMDControlController}
   */
  protected get xdataControl(): IMDControlController {
    return this.expBar.xDataController as IMDControlController;
  }

  constructor(view: IViewController) {
    const modelData = view.model.viewLayoutPanel?.controls?.find(
      item => item.id === 'searchbar',
    );
    if (modelData && !modelData.name) {
      modelData.name = 'searchbar';
    }
    super(view);
  }

  /**
   * 组件创建
   *
   * @author zk
   * @date 2023-05-29 04:05:56
   * @memberof GridExpViewEngine
   */
  async onCreated(): Promise<void> {
    super.onCreated();
    this.modifySplitContainer();
    const { childNames } = this.view;
    childNames.push(this.expBarName);

    if (!this.view.slotProps[this.expBarName]) {
      this.view.slotProps[this.expBarName] = {};
    }
    this.view.slotProps[this.expBarName].loadDefault = false;
    this.view.slotProps[this.expBarName].srfnav = this.view.state.srfnav;
  }

  /**
   * 修改导航容器的模型（适配导航栏上配置的高宽）
   * @author lxm
   * @date 2023-08-31 03:35:44
   * @protected
   */
  protected modifySplitContainer(): void {
    const expBarModel = getControl(this.view.model, this.expBarName)!;
    const { width, height } = expBarModel;

    // 都没配的时候不处理
    if (!width && !height) {
      return;
    }
    recursiveIterate(
      this.view.model.viewLayoutPanel!,
      (container: IPanelContainer) => {
        if (container.id === 'view_exp_split') {
          if (width) {
            container.panelItems![0].layoutPos!.width = width;
          }
          if (height) {
            container.panelItems![0].layoutPos!.height = height;
          }
        }
      },
      {
        childrenFields: ['rootPanelItems', 'panelItems', 'panelTabPages'],
      },
    );
  }

  protected async onXDataActive(_event: EventBase): Promise<void> {
    // 导航激活不触发openData，由导航栏内部自己处理激活后的导航逻辑
  }

  protected getSearchParams(): IParams {
    const params = super.getSearchParams();
    if (this.expBar.state.query) {
      params.query = this.expBar.state.query;
    }
    return params;
  }

  protected async load(_args?: MDCtrlLoadParams): Promise<void> {
    await this.expBar.load();
  }
}
