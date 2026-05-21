import { IDEFormTabPanel } from '@ibiz/model-core';
import { FormTabPanelState } from './form-tab-panel.state';
import { AppCounter } from '../../../../../service';
import { FormTabPageController } from '../form-tab-page';
import { IApiFormTabPanelController } from '../../../../../interface';
import { FormContainerController } from '../form-container';
import { FormNotifyState } from '../../../../constant';

/**
 * @description 表单分页部件控制器
 * @export
 * @class FormTabPanelController
 * @extends {FormContainerController<IDEFormTabPanel>}
 * @implements {IApiFormTabPanelController}
 */
export class FormTabPanelController
  extends FormContainerController<IDEFormTabPanel>
  implements IApiFormTabPanelController
{
  declare state: FormTabPanelState;

  /**
   * @description 缓存标识
   * @readonly
   * @type {string}
   * @memberof FormTabPanelController
   */
  get srfcachekeytempl(): string {
    return `${this.form.srfcachekeytempl}_${this.model.codeName}_${this.form.data.tempsrfkey}`;
  }

  protected createState(): FormTabPanelState {
    return new FormTabPanelState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    // 初始化默认的激活分页
    this.state.activeTab = this.model.deformTabPages?.[0].id || '';
  }

  /**
   * @description 表单状态变更通知
   * @param {FormNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof FormTabPanelController
   */
  async formStateNotify(state: FormNotifyState): Promise<void> {
    super.formStateNotify(state);
    if ([FormNotifyState.LOAD, FormNotifyState.DRAFT].includes(state)) {
      const cacheTabId = localStorage.getItem(this.srfcachekeytempl);
      if (this.form.srfCachePos && cacheTabId) {
        const isExist = this.model.deformTabPages?.some(
          page => page.id === cacheTabId,
        );
        if (isExist) this.state.activeTab = cacheTabId;
      }
    }
  }

  /**
   * @description 初始化计数器
   * @protected
   * @returns {*}  {void}
   * @memberof FormTabPanelController
   */
  protected initCounter(): void {
    const tabPage = this.model.deformTabPages?.find(
      _item => !!_item.appCounterRefId,
    );
    if (!tabPage) return;
    const { counters } = this.form;
    const { appCounterRefId } = tabPage;
    if (appCounterRefId) {
      this.counter = counters[appCounterRefId];
      this.counter?.onChange(this.handleCounterChange);
    }
  }

  /**
   * 分页点击切换处理
   * @author lxm
   * @date 2024-01-17 02:59:38
   * @param {string} tabId
   * @deprecated
   */
  onTabChange(tabId: string): void {
    this.state.activeTab = tabId;
    if (this.form.srfCachePos)
      localStorage.setItem(`${this.srfcachekeytempl}`, tabId);
  }

  /**
   * @description 切换激活分页
   * @param {string} tabId 分页id
   * @memberof FormTabPanelController
   */
  selectTab(tabId: string): void {
    this.state.activeTab = tabId;
  }

  /**
   * 根据id去表单控制器里取得计数器对象
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-07-10 15:14:21
   */
  getCounter(id: string): AppCounter | null {
    const { counters } = this.form;
    if (counters && counters[id]) {
      return counters[id];
    }
    return null;
  }

  /**
   * 更新激活的分页
   *
   * @author zhanghengfeng
   * @date 2025-02-05 20:02:55
   * @return {*}  {void}
   */
  updateActiveTab(): void {
    if (!this.state.visible) {
      return;
    }
    const activeTab = this.form.details[this.state.activeTab];
    if (activeTab && !activeTab.state.visible) {
      const children: FormTabPageController[] = [];
      this.model.deformTabPages?.forEach(item => {
        if (item.id && this.form.details[item.id]) {
          children.push(this.form.details[item.id] as FormTabPageController);
        }
      });
      const child = children.find(item => item.state.visible);
      if (child && child.model.id) {
        this.state.activeTab = child.model.id;
      }
    }
  }
}
