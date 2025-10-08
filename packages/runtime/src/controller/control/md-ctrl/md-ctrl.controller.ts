/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IDEMobMDCtrl,
  IUIActionGroup,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import { RuntimeModelError } from '@ibiz-template/core';
import { isNil } from 'ramda';
import {
  IMobMDCtrlEvent,
  IMobMDCtrlController,
  IMobMdCtrlState,
  IMobMDCtrlRowState,
  MDCtrlLoadParams,
  IMDControlGroupState,
  CodeListItem,
  ISearchGroupData,
} from '../../../interface';
import { MDCtrlService } from './md-ctrl.service';
import { MobMDCtrlRowState } from './md-ctrl-row.state';
import { MDControlController } from '../../common';
import { ControlVO } from '../../../service';
import { UIActionUtil } from '../../../ui-action';
import { ButtonContainerState, UIActionButtonState } from '../../utils';

export class MDCtrlController
  extends MDControlController<IDEMobMDCtrl, IMobMdCtrlState, IMobMDCtrlEvent>
  implements IMobMDCtrlController
{
  declare service: MDCtrlService;

  protected initState(): void {
    super.initState();
    this.state.rows = [];
    this.state.noSort = this.model.noSort === true;
    this.state.singleSelect = this.model.singleSelect === true;
    // 多数据默认激活值为1
    this.state.mdctrlActiveMode = 1;
  }

  /**
   * 分组代码表项集合
   *
   * @author zk
   * @date 2023-10-11 04:10:06
   * @type {readonly}
   * @memberof MDCtrlController
   */
  groupCodeListItems?: readonly CodeListItem[];

  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.service = new MDCtrlService(this.model);
    await this.service.init(this.context);
    // 设置默认排序
    this.setSort();
  }

  /**
   * 加载更多
   * @author lxm
   * @date 2023-05-22 07:33:59
   * @return {*}  {Promise<void>}
   */
  async loadMore(): Promise<void> {
    // 修复加载更多时，数据未加载成功 但是还是会继续加载的问题
    if (this.state.total > this.state.items.length && !this.state.isLoading) {
      await this.load({ isLoadMore: true, silent: true });
    }
  }

  /**
   * 列表多数据刷新 需重置分页
   *
   * @author zk
   * @date 2023-08-11 05:08:20
   * @return {*}  {Promise<void>}
   * @memberof MDCtrlController
   */
  async refresh(): Promise<void> {
    this.doNextActive(() => this.load({ isInitialLoad: true }), {
      key: 'refresh',
    });
  }

  /**
   * 部件加载后处理
   *
   * @param {MDCtrlLoadParams} args
   * @param {ControlVO[]} items
   * @return {*}  {Promise<IData[]>}
   * @memberof MDCtrlController
   */
  async afterLoad(
    args: MDCtrlLoadParams,
    items: ControlVO[],
  ): Promise<IData[]> {
    if (args.isInitialLoad) {
      this.state.rows = [];
    }
    if (items && items.length > 0) {
      const rows = items.map(item => {
        return new MobMDCtrlRowState(item, this);
      });
      this.state.rows.push(...rows);
      // 响应式写法用state里遍历出来的row才是reactive
      await Promise.all(this.state.rows.map(row => this.initActionStates(row)));
    }
    await this.initGroupCodeListItems();
    await this.handleDataGroup();
    return super.afterLoad(args, items);
  }

  /**
   * 设置列表数据
   *
   * @author zk
   * @date 2023-05-26 02:05:46
   * @param {IData[]} items
   * @memberof MDCtrlController
   */
  setData(items: IData[]): void {
    const rows = items.map(item => {
      const row = new MobMDCtrlRowState(item as ControlVO, this);
      return row;
    });
    this.state.rows = rows;
  }

  /**
   * 获取列表数据
   *
   * @author zk
   * @date 2023-05-26 02:05:35
   * @return {*}  {IData[]}
   * @memberof MDCtrlController
   */
  getAllData(): IData[] {
    return this.state.rows.map(row => row.data);
  }

  /**
   * 界面行为组项点击
   *
   * @author chitanda
   * @date 2023-06-19 18:06:18
   * @param {IUIActionGroupDetail} detail
   * @param {MDCtrlRowState} row
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    row: IMobMDCtrlRowState,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params: this.params,
        data: [row.data],
        view: this.view,
        ctrl: this,
        event,
      },
      detail.appId,
    );
  }

  /**
   * 初始化按钮状态
   *
   * @protected
   * @param {MobMDCtrlRowState} row
   * @return {*}  {Promise<void>}
   * @memberof MDCtrlController
   */
  protected async initActionStates(row: MobMDCtrlRowState): Promise<void> {
    const { deuiactionGroup, deuiactionGroup2 } = this.model;
    if (deuiactionGroup) {
      await this.initUIActionGroup(row, deuiactionGroup);
    }
    if (deuiactionGroup2) {
      await this.initUIActionGroup(row, deuiactionGroup2);
    }
  }

  /**
   * 初始化（左右）行为组权限
   *
   * @protected
   * @param {MobMDCtrlRowState} row
   * @param {IUIActionGroup} group
   * @return {*}  {Promise<void>}
   * @memberof MDCtrlController
   */
  protected async initUIActionGroup(
    row: MobMDCtrlRowState,
    group: IUIActionGroup,
  ): Promise<void> {
    if (!group!.uiactionGroupDetails?.length) {
      ibiz.log.debug(
        ibiz.i18n.t('runtime.controller.control.grid.interfaceBehavior'),
      );
    }
    const containerState = new ButtonContainerState();
    const details = group!.uiactionGroupDetails || [];
    details.forEach(detail => {
      const actionid = detail.uiactionId;
      if (actionid) {
        const buttonState = new UIActionButtonState(
          detail.id!,
          this.context.srfappid!,
          actionid,
          detail,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    await containerState.update(this.context, row.data.getOrigin());
    row.uaColStates[group.id!] = containerState;
  }

  /**
   * 处理数据分组
   *
   * @memberof MDCtrlController
   */
  protected async handleDataGroup(): Promise<void> {
    const { enableGroup, groupMode, groupAppDEFieldId } = this.model;
    if (enableGroup && groupMode) {
      if (!groupAppDEFieldId) {
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t(
            'runtime.controller.control.dataView.propertiesNoConfigured',
          ),
        );
      }
      if (groupMode === 'AUTO') {
        await this.handleAutoGroup();
      } else if (groupMode === 'CODELIST') {
        await this.handleCodeListGroup();
      }
    }
  }

  /**
   * 处理自动分组
   *
   * @memberof MDCtrlController
   */
  protected async handleAutoGroup(): Promise<void> {
    const { groupAppDEFieldId, groupCodeListId } = this.model;
    // 自动分组且存在代码表时，使用代码表做一次转换
    let codeList: readonly CodeListItem[] = [];
    if (groupCodeListId) {
      const app = ibiz.hub.getApp(this.context.srfappid);
      codeList = await app.codeList.get(
        groupCodeListId,
        this.context,
        this.params,
      );
    }
    if (groupAppDEFieldId) {
      const { items } = this.state;
      const groupMap: Map<string, MobMDCtrlRowState[]> = new Map();
      items.forEach((item: IData) => {
        const groupVal = item[groupAppDEFieldId];
        if (isNil(groupVal)) {
          // 分组无值的不显示
          return;
        }

        if (!groupMap.has(groupVal)) {
          groupMap.set(groupVal, []);
        }
        groupMap
          .get(groupVal)!
          .push(new MobMDCtrlRowState(item as ControlVO, this));
      });
      const groups: IMDControlGroupState[] = [];
      groupMap.forEach((value: IData[], key: string) => {
        const codeListItem = codeList.find(x => x.value === key);
        groups.push({
          caption: codeListItem?.text || key,
          key,
          children: [...value],
        });
      });
      this.state.groups = groups;
    }
  }

  /**
   * 加载并初始化分组代码表项集合
   * @author lxm
   * @date 2023-08-29 05:11:39
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initGroupCodeListItems(): Promise<void> {
    const { groupCodeListId } = this.model;
    if (!groupCodeListId) {
      return;
    }
    const app = ibiz.hub.getApp(this.context.srfappid);
    this.groupCodeListItems = await app.codeList.get(
      groupCodeListId,
      this.context,
      this.params,
    );
  }

  /**
   * 处理代码表分组
   *
   * @memberof MDCtrlController
   */
  protected async handleCodeListGroup(): Promise<void> {
    const { groupAppDEFieldId, groupCodeListId } = this.model;
    if (!groupCodeListId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.dataView.tableNoConfigured'),
      );
    }
    const { items } = this.state;
    const groupMap: Map<string | number, MobMDCtrlRowState[]> = new Map();
    this.groupCodeListItems!.forEach(item => {
      groupMap.set(item.value, []);
    });
    items.forEach((item: IData) => {
      const groupVal = item[groupAppDEFieldId!];
      const groupArr = groupMap.get(groupVal);
      if (groupArr) {
        groupArr.push(new MobMDCtrlRowState(item as ControlVO, this));
      }
      // 不在代码表里数据忽略
    });

    const groups: IMDControlGroupState[] = [];
    groupMap.forEach((arr, key) => {
      // 标题
      const codeListItem = this.groupCodeListItems!.find(
        item => item.value === key,
      )!;
      groups.push({
        caption: codeListItem.text,
        key: codeListItem.value,
        children: arr,
      });
    });
    this.state.groups = groups;
  }

  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    throw new Error('Method not implemented.');
  }

  /**
   * 移动端-设置分组点击
   *
   * @param {ISearchGroupData} data
   * @memberof MDCtrlController
   */
  setGroupParams(data: ISearchGroupData): void {
    if (data.sort) {
      this.state.sortQuery = data.sort;
      this.isSetSort = true;
    } else {
      this.state.sortQuery = '';
    }
  }

  /**
   * @description 移动端-滚动到顶部
   * @memberof MDCtrlController
   */
  scrollToTop(): void {
    throw new Error('Method not implemented.');
  }
}
