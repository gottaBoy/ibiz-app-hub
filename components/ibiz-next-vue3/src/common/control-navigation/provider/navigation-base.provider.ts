import { Ref, ref } from 'vue';
import {
  INavViewMsg,
  calcNavParams,
  IMDControlEvent,
  MDControlController,
  calcDeCodeNameById,
} from '@ibiz-template/runtime';
import { IDER1N, IMDControl, INavigatable } from '@ibiz/model-core';

/**
 * 导航适配器
 *
 * @export
 * @class NavgationBaseProvider
 */
export class NavgationBaseProvider {
  /**
   * 导航栈数据
   *
   * @type {string[]}
   * @memberof NavgationBaseProvider
   */
  navStack: string[] = [];

  /**
   * 主键名称
   *
   * @memberof NavgationBaseProvider
   */
  keyName: string = 'srfkey';

  /**
   * 模型
   *
   * @type {IMDControl}
   * @memberof NavgationBaseProvider
   */
  model: IMDControl;

  /**
   * 导航视图信息
   *
   * @type {(Ref<INavViewMsg | undefined>)}
   * @memberof NavgationBaseProvider
   */
  navViewMsg: Ref<INavViewMsg | undefined> = ref();

  /**
   * Creates an instance of NavgationBaseProvider.
   * @param {MDControlController} controller
   * @memberof NavgationBaseProvider
   */
  constructor(protected controller: MDControlController) {
    this.model = controller.model;
    if (controller.state.enableNavView) {
      controller.evt.on('onNavDataChange', evt => {
        this.onNavDataChange(evt);
      });
      controller.evt.on('onLoadSuccess', () => {
        this.onNavDataByStack();
      });
    }
  }

  /**
   * 解析参数
   *
   * @param {(INavigatable & { appDataEntityId?: string })} XDataModel
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {{ context: IContext; params: IParams }}
   * @memberof NavgationBaseProvider
   */
  prepareParams(
    XDataModel: INavigatable & { appDataEntityId?: string },
    data: IData,
    context: IContext,
    params: IParams,
  ): { context: IContext; params: IParams } {
    const {
      navDER,
      navFilter,
      navigateContexts,
      navigateParams,
      appDataEntityId,
    } = XDataModel;
    const model = {
      deName: appDataEntityId ? calcDeCodeNameById(appDataEntityId) : undefined,
      navFilter,
      pickupDEFName: (navDER as IDER1N)?.pickupDEFName,
      navContexts: navigateContexts,
      navParams: navigateParams,
    };
    const originParams = {
      context,
      params,
      data,
    };
    const { resultContext, resultParams } = calcNavParams(model, originParams);
    const tempContext = Object.assign(context.clone(), resultContext);
    const tempParams = { ...resultParams };
    return { context: tempContext, params: tempParams };
  }

  /**
   * @description 清空导航
   * @protected
   * @memberof NavgationBaseProvider
   */
  protected clearNavigation(): void {
    this.navStack = [];
    this.controller.setSelection([]);
    this.navViewMsg.value = undefined;
  }

  /**
   * @description 设置导航数据
   * @protected
   * @param {IData} data
   * @memberof NavgationBaseProvider
   */
  protected setNavData(data: IData): void {
    this.controller.setNavData(data);
    this.controller.setSelection([data]);
  }

  /**
   * 通过栈数据导航
   *
   * @memberof NavgationBaseProvider
   */
  onNavDataByStack(): void {
    const { items } = this.controller.state;
    const navData =
      this.navStack
        .map(key => items.find(item => item[this.keyName] === key))
        .find(item => item !== undefined) || items[0];
    if (navData) {
      this.setNavData(navData);
    } else {
      this.clearNavigation();
    }
  }

  /**
   * 导航数据变化
   *
   * @param {IMDControlEvent['onNavDataChange']['event']} event
   * @memberof NavgationBaseProvider
   */
  onNavDataChange(event: IMDControlEvent['onNavDataChange']['event']): void {
    const { navData } = event;
    // 数据变更才重新导航
    if (this.navViewMsg.value?.key !== navData[this.keyName]) {
      this.navStack.unshift(navData[this.keyName]);
      this.navViewMsg.value = this.getNavViewMsg(navData);
    }
  }

  /**
   * 获取导航视图信息
   *
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {INavViewMsg}
   * @memberof NavgationBaseProvider
   */
  getNavViewMsg(data: IData): INavViewMsg {
    const viewModelId = (this.model as INavigatable).navAppViewId;
    const result = this.prepareParams(
      this.model,
      data,
      this.controller.context,
      this.controller.params,
    );
    return {
      key: data[this.keyName],
      context: result.context,
      params: result.params,
      viewId: viewModelId,
    };
  }
}
