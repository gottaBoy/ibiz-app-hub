import { IAppViewEngine } from '@ibiz/model-core';
import {
  IController,
  ICtrlEngine,
  IMDControlController,
} from '../../interface';
import { ViewController } from '../../controller';

/**
 * @description 挂载界面引擎基类
 * @export
 * @class CtrlEngineBase
 * @implements {ICtrlEngine}
 */
export class CtrlEngineBase implements ICtrlEngine {
  /**
   * @description 触发源部件名称
   * @protected
   * @type {(string | undefined)}
   * @memberof CtrlEngineBase
   */
  protected sourceCtrlName: string | undefined;

  /**
   * @description 目标源部件名称
   * @protected
   * @type {(string | undefined)}
   * @memberof CtrlEngineBase
   */
  protected targetCtrlName: string | undefined;

  /**
   * @description 源部件
   * @readonly
   * @type {(IController | undefined)}
   * @memberof CtrlEngineBase
   */
  get resourceCtrl(): IController | undefined {
    if (this.sourceCtrlName) {
      return this.view.getController(this.sourceCtrlName);
    }
  }

  /**
   * @description 目标源部件
   * @readonly
   * @type {(IMDControlController | undefined)}
   * @memberof CtrlEngineBase
   */
  get targetCtrl(): IMDControlController | undefined {
    if (this.targetCtrlName) {
      return this.view.getController(
        this.targetCtrlName,
      ) as IMDControlController;
    }
  }

  /**
   * Creates an instance of CtrlEngineBase.
   * @param {IAppViewEngine} engine
   * @param {ViewController} view
   * @memberof CtrlEngineBase
   */
  constructor(
    protected engine: IAppViewEngine,
    protected view: ViewController,
  ) {
    const { params = [] } = this.engine;
    const resourceCtrl: IData = params.find(x => x.name === 'CTRL') || {};
    this.sourceCtrlName = resourceCtrl.ctrlName;
    const targetCtrl: IData = params.find(x => x.name === 'TRIGGER') || {};
    this.targetCtrlName = targetCtrl.ctrlName;
  }

  /**
   * @description 视图created生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof CtrlEngineBase
   */
  async onCreated(): Promise<void> {}

  /**
   * @description 视图mounted生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof CtrlEngineBase
   */
  async onMounted(): Promise<void> {
    if (this.resourceCtrl) {
      // 搜索部件搜索、数据选中、数据加载都触发目标部件源加载
      this.resourceCtrl.evt.onAll((eventName: string) => {
        if (
          [
            'onSearch',
            'onLoadSuccess',
            'onLoadDraftSuccess',
            'onSelectionChange',
          ].includes(eventName)
        ) {
          if (this.targetCtrl && this.targetCtrl.load) {
            this.targetCtrl.load({ isInitialLoad: true });
          }
        }
      });
    }
    if (this.targetCtrl) {
      this.targetCtrl.evt.on('onBeforeLoad', (args: IData) => {
        const { params } = args;
        const filterParams: IData = {};
        // 触发源是搜索类部件是添加搜索参数
        if (this.resourceCtrl && (this.resourceCtrl as IData).getFilterParams) {
          Object.assign(
            filterParams,
            (this.resourceCtrl as IData).getFilterParams(),
          );
        }
        // searchconds参数特殊合并
        if (filterParams.searchconds) {
          params.srfsearchconds = filterParams.searchconds;
          delete filterParams.searchconds;
        }
        Object.assign(params, filterParams);
      });
    }
  }

  /**
   * @description 视图destroyed生命周期执行逻辑
   * @returns {*}  {Promise<void>}
   * @memberof CtrlEngineBase
   */
  async onDestroyed(): Promise<void> {}
}
