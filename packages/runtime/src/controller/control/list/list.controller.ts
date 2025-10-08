/* eslint-disable no-nested-ternary */
import { IDEList, IUIActionGroupDetail } from '@ibiz/model-core';
import { createUUID, isBoolean } from 'qx-util';
import { isNil } from 'ramda';
import {
  clone,
  DataTypes,
  isElementSame,
  RuntimeModelError,
} from '@ibiz-template/core';
import dayjs from 'dayjs';
import {
  IListState,
  IListEvent,
  CodeListItem,
  IListController,
  IDragChangeInfo,
  MDCtrlLoadParams,
  IApiMDGroupParams,
  IMDControlGroupState,
} from '../../../interface';
import { MDControlController } from '../../common';
import { ListService } from './list.service';
import { UIActionButtonState, ButtonContainerState } from '../../utils';
import { UIActionUtil } from '../../../ui-action';
import {
  calcDeCodeNameById,
  getAllUIActionItems,
  getParentTextAppDEFieldId,
} from '../../../model';
import { ControlVO } from '../../../service';
import { formatDateByScale } from '../../../utils';

export class ListController
  extends MDControlController<IDEList, IListState, IListEvent>
  implements IListController
{
  declare service: ListService;

  /**
   * @description 是否允许新建
   * @readonly
   * @type {boolean}
   * @memberof ListController
   */
  get enableNew(): boolean {
    return this.model.enableRowNew === true;
  }

  /**
   * @description 是否允许调整顺序
   * @readonly
   * @type {boolean}
   * @memberof ListController
   */
  get enableEditOrder(): boolean {
    return this.model.enableRowEditOrder === true;
  }

  /**
   * @description 是否支持调整分组
   * @readonly
   * @type {boolean}
   * @memberof ListController
   */
  get enableEditGroup(): boolean {
    return this.model.enableRowEditGroup === true;
  }

  protected initState(): void {
    super.initState();
    this.state.noSort = this.model.noSort === true;
    this.state.singleSelect = this.model.singleSelect === true;
    this.state.expandedKeys = [];
    const { enablePagingBar } = this.model;
    this.state.enablePagingBar = enablePagingBar;
    this.state.uaState = {};
    this.state.readonly = !!(
      this.context.srfreadonly === true || this.context.srfreadonly === 'true'
    );
    this.state.draggable = this.enableEditOrder || this.enableEditGroup;
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.state.size = this.model.pagingSize || 20;
    this.service = new ListService(this.model);
    await this.service.init(this.context);
  }

  /**
   * @description 初始化分组界面行为组
   * @return {*}  {Promise<void>}
   * @memberof ListController
   */
  async initGroupActionStates(): Promise<void> {
    const { groupUIActionGroup } = this.model;
    if (!groupUIActionGroup?.uiactionGroupDetails?.length) return;
    this.state.groups.forEach(async group => {
      const containerState = new ButtonContainerState();
      const actions = getAllUIActionItems(
        groupUIActionGroup.uiactionGroupDetails,
      );
      actions.forEach(detail => {
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
      await containerState.update(
        this.context,
        undefined,
        this.model.appDataEntityId,
      );
      group.groupActionGroupState = containerState;
    });
  }

  /**
   * @description 分组界面行为点击
   * @param {IUIActionGroupDetail} detail
   * @param {MouseEvent} event
   * @param {IMDControlGroupState} group
   * @return {*}  {Promise<void>}
   * @memberof ListController
   */
  async onGroupToolbarClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
    group: IMDControlGroupState,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    const params = { ...this.params, srfgroup: group.key };
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params,
        data: group.selectedData || [],
        view: this.view,
        ctrl: this,
        event,
      },
      detail.appId,
    );
  }

  /**
   * 获取部件默认排序模型
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-28 18:43:27
   */
  getSortModel(): {
    minorSortAppDEFieldId: string | undefined;
    minorSortDir: string | undefined;
  } {
    return {
      minorSortAppDEFieldId: this.model.minorSortAppDEFieldId,
      minorSortDir: this.model.minorSortDir,
    };
  }

  /**
   * 计算表格展示模式
   * @author fzh
   * @date 2024-05-29 19:18:42
   * @return {*}  {void}
   */
  calcShowMode(items: IData): void {
    const { enablePagingBar } = this.model;
    this.state.hideNoDataImage = false;
    this.state.enablePagingBar = enablePagingBar;
    // SHOWMODE = 'DEFAULT'|'ONLYDATA'|'MIXIN'
    // DEFAULT  默认逻辑
    const showmode = this.controlParams.showmode || 'DEFAULT';

    // ONLYDATA 无论有无数据 仅仅显示数据区域，表格头和分页栏都不要
    if (showmode === 'ONLYDATA') {
      this.state.enablePagingBar = false;
      if (items.length === 0) {
        this.state.hideNoDataImage = true;
      }
    }

    // MIXIN 无数据时，仅仅显示数据区域，表格头和分页栏都不要；有数据时，展示还是和默认一样
    if (showmode === 'MIXIN') {
      if (items.length === 0) {
        this.state.enablePagingBar = false;
        this.state.hideNoDataImage = true;
      }
    }
  }

  /**
   * 滚动到顶部
   *
   * @memberof ListController
   */
  scrollToTop(): void {
    this.evt.emit('onScrollToTop', undefined);
  }

  /**
   * 特殊处理，加载模式为滚动加载或者点击加载，刷新时加载数据条数为分页乘以默认条数
   *
   * @return {*}  {Promise<void>}
   * @memberof ListController
   */
  async refresh(): Promise<void> {
    const param: IData = {
      isInitialLoad: false,
    };
    if (this.model.pagingMode === 2 || this.model.pagingMode === 3) {
      const size = this.state.size * this.state.curPage;
      Object.assign(param, { viewParam: { page: 0, size } });
    }
    this.doNextActive(() => this.load(param), {
      key: 'refresh',
    });
  }

  async afterLoad(args: MDCtrlLoadParams, items: IData[]): Promise<IData[]> {
    super.afterLoad(args, items);
    // 每次加载回来先本地排序，把数据的排序属性规范一下
    this.sortItems(this.state.items);
    await this.handleDataGroup();
    await this.initGroupActionStates();
    await this.calcOptItemState(items);
    this.calcShowMode(items);
    return items;
  }

  /**
   * @description 获取操作项行为集合模型
   * @returns {*}  {IUIActionGroupDetail[]}
   * @memberof ListController
   */
  getOptItemModel(): IUIActionGroupDetail[] {
    const actions: IUIActionGroupDetail[] = [];
    const { delistItems } = this.model;
    delistItems?.forEach(item => {
      if (
        item.itemType === 'ACTIONITEM' &&
        item.deuiactionGroup &&
        item.deuiactionGroup.uiactionGroupDetails
      ) {
        actions.push(...item.deuiactionGroup.uiactionGroupDetails);
      }
    });
    return actions;
  }

  /**
   * @description 计算操作项状态
   * @param {IData[]} items
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async calcOptItemState(items: IData[]): Promise<void> {
    const details = this.getOptItemModel();
    if (details.length)
      await Promise.all(
        items.map(async item => {
          const containerState = new ButtonContainerState();
          const actions = getAllUIActionItems(details);
          actions.forEach(action => {
            const actionid = action.uiactionId;
            if (actionid) {
              const buttonState = new UIActionButtonState(
                action.id!,
                this.context.srfappid!,
                actionid,
              );
              containerState.addState(action.id!, buttonState);
            }
          });
          await containerState.update(
            this.context,
            item.getOrigin(),
            this.model.appDataEntityId,
          );
          this.state.uaState[item.srfkey] = containerState;
        }),
      );
  }

  /**
   * @description 行为点击
   * @param {IUIActionGroupDetail} detail
   * @param {IData} item
   * @param {MouseEvent} event
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    item: IData,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params: this.params,
        data: [item],
        view: this.view,
        ctrl: this,
        event,
      },
      detail.appId,
    );
  }

  /**
   * 设置列表数据
   *
   * @author zk
   * @date 2023-05-26 02:05:46
   * @param {IData[]} items
   * @memberof ListController
   */
  setData(items: IData[]): void {
    this.state.items = items;
    // 将已选中的数据过滤下
    this.state.selectedData = this.state.selectedData.filter(selected =>
      items.some(item => item.srfkey === selected.srfkey),
    );
  }

  /**
   * 获取列表数据
   *
   * @author zk
   * @date 2023-05-26 02:05:35
   * @return {*}  {IData[]}
   * @memberof ListController
   */
  getAllData(): IData[] {
    return this.state.items;
  }

  /**
   * @description 执行多数据分组
   * @param {IApiMDGroupParams[]} [arg] 分组参数集合（多层分组暂未支持）
   * @param {IParams} [_params]
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async execGroup(arg: IApiMDGroupParams[], _params?: IParams): Promise<void> {
    const group = arg[0];
    (this as IData).model = clone(this.model);
    this.model.groupMode = 'AUTO';
    if (!group || !group.groupFieldId) {
      this.state.groups = [];
      this.model.groupMode = 'NONE';
      this.state.enableGroup = false;
      this.model.groupCodeListId = undefined;
      this.model.groupAppDEFieldId = undefined;
      this.groupDateFormat = [];
    } else if (
      group.groupFieldId !== this.model.groupAppDEFieldId ||
      (group.dateFormat &&
        !isElementSame(group.dateFormat, this.groupDateFormat))
    ) {
      // 分组属性变更或日期格式不同时才重新初始化分组
      this.state.enableGroup = true;
      this.model.groupAppDEFieldId = group.groupFieldId;
      this.model.groupCodeListId = group.groupCodeListId;
      this.groupDateFormat = group.dateFormat || [];
      await this.handleDataGroup();
    }
  }

  /**
   * 处理数据分组
   *
   * @memberof ListController
   */
  protected async handleDataGroup(): Promise<void> {
    const { groupMode } = this.model;
    const { enableGroup } = this.state;
    if (enableGroup && groupMode) {
      if (groupMode === 'AUTO') {
        await this.handleAutoGroup();
      } else if (groupMode === 'CODELIST') {
        await this.handleCodeListGroup();
      }
    }
    if (this.controlParams.defaultexpandall === 'true') {
      this.state.expandedKeys = this.state.groups.map(x => x.key.toString());
    }
  }

  /**
   * 处理自动分组
   *
   * @memberof ListController
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
      const textDEFieldId =
        getParentTextAppDEFieldId(groupAppDEFieldId, this.dataEntity) ||
        groupAppDEFieldId;
      const dateFormat = this.groupDateFormat[0];
      const groupMap: Map<string, IData[]> = new Map();
      const unclassified: IMDControlGroupState = {
        key: createUUID(),
        caption: ibiz.i18n.t('runtime.controller.common.md.unclassified'),
        children: [],
      };
      items.forEach((item: IData) => {
        let groupVal = item[textDEFieldId];
        // 特殊处理日期格式化
        if (dateFormat) groupVal = formatDateByScale(groupVal, dateFormat);

        // 当分组样式为 STYLE2 且 groupVal 是有效的日期时，默认以天为单位格式化分组值
        if (this.model.groupStyle === 'STYLE2' && dayjs(groupVal).isValid()) {
          groupVal = formatDateByScale(groupVal, 'day');

          // 如果分组标题时间与当前时间相同，则以 今天 显示分组标题
          if (dayjs(groupVal).isSame(dayjs(), 'day'))
            groupVal = ibiz.i18n.t(`runtime.controller.common.md.today`);
        }
        // 分组无值默认归为未分类
        if (isNil(groupVal)) {
          unclassified.children.push(item);
          return;
        }
        const children = groupMap.get(groupVal) || [];
        children.push(item);
        groupMap.set(groupVal, children);
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
      // 将未分类放到最后
      if (unclassified.children.length) groups.push(unclassified);
      this.state.groups = groups;
    }
  }

  /**
   * 处理代码表分组
   *
   * @memberof ListController
   */
  protected async handleCodeListGroup(): Promise<void> {
    const { groupAppDEFieldId, groupCodeListId } = this.model;
    if (groupAppDEFieldId && groupCodeListId) {
      const { items } = this.state;
      const groups: IMDControlGroupState[] = [];
      const app = ibiz.hub.getApp(this.context.srfappid);
      const codeList = await app.codeList.get(
        groupCodeListId,
        this.context,
        this.params,
      );
      const keys: string[] = [];
      codeList.forEach((codeListItem: CodeListItem) => {
        const value = items.filter(
          (item: IData) => item[groupAppDEFieldId] === codeListItem.value,
        );
        groups.push({
          caption: codeListItem.text,
          key: codeListItem.value,
          children: [...value],
        });
        keys.push(codeListItem.value as string);
      });
      const otherGroup = items.filter(
        (item: IData) => keys.indexOf(item[groupAppDEFieldId]) === -1,
      );
      if (otherGroup.length > 0) {
        groups.push({
          caption: ibiz.i18n.t('runtime.controller.common.md.unclassified'),
          key: ibiz.i18n.t('runtime.controller.common.md.unclassified'),
          children: [...otherGroup],
        });
      }
      this.state.groups = groups;
    }
  }

  /**
   * @description 切换折叠，其中tag表示操作指定列表分组标识，若不传则操作当前列表的所有分组展开状态，expand表示是否展开，若不传则基于当前分组状态取反
   * @param {{ tag?: string; expand?: boolean }} [params={}]
   * @memberof ListController
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    if (tag) {
      const expandedKeysSet = new Set(this.state.expandedKeys);
      const expanded = isBoolean(expand) ? expand : !expandedKeysSet.has(tag);
      if (expanded) {
        expandedKeysSet.add(tag);
      } else {
        expandedKeysSet.delete(tag);
      }
      this.state.expandedKeys = Array.from(expandedKeysSet);
    } else if (expand) {
      this.state.expandedKeys = this.state.groups.map(x => x.key.toString());
    } else {
      this.state.expandedKeys = [];
    }
  }

  /**
   * @description 点击新建
   * @param {MouseEvent} event
   * @param {(string | number)} [group]
   * @memberof ListController
   */
  onClickNew(event: MouseEvent, group?: string | number): void {
    const params = { ...this.params };
    if (group) Object.assign(params, { srfgroup: group });
    UIActionUtil.execAndResolved(
      'new',
      {
        context: this.context,
        params,
        data: [],
        view: this.view,
        ctrl: this,
        event,
      },
      this.view.model.appId,
    );
  }

  /**
   * @description 本地排序items(用于拖拽数据完成后的前端数据排序)
   * @param {IData[]} items
   * @returns {*}  {void}
   * @memberof ListController
   */
  sortItems(items: IData[]): void {
    const { minorSortAppDEFieldId, minorSortDir } = this.model;
    if (!minorSortAppDEFieldId || !minorSortDir) return;
    const sortField = this.dataEntity?.appDEFields?.find(
      _item => _item.codeName === minorSortAppDEFieldId,
    );
    if (!sortField || !DataTypes.isNumber(sortField.stdDataType!)) {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.controller.common.md.invalidSortType'),
      );
      return;
    }
    const isAsc = minorSortDir === 'ASC';
    // 格式化排序属性的值
    items.forEach(item => {
      const sortValue = item[minorSortAppDEFieldId];
      if (isNil(sortValue)) item[minorSortAppDEFieldId] = 0;
    });
    // 排序
    items.sort((a, b) =>
      isAsc
        ? a[minorSortAppDEFieldId] - b[minorSortAppDEFieldId]
        : b[minorSortAppDEFieldId] - a[minorSortAppDEFieldId],
    );
  }

  /**
   * @description 计算移动数据参数
   * @protected
   * @param {number} fromIndex 变更前的索引位置
   * @param {number} toIndex 变更后的索引位置
   * @param {IData} draggedItem 拖拽数据项
   * @param {IData[]} targetArray 数据集
   * @param {boolean} isCrossGroup 是否切换分组
   * @returns {*}  {IData}
   * @memberof ListController
   */
  protected computeMoveDataParam(
    fromIndex: number,
    toIndex: number,
    draggedItem: IData,
    targetArray: IData[],
    isCrossGroup: boolean,
  ): IData {
    let moveData = {};
    const { minorSortAppDEFieldId } = this.model;
    if (!minorSortAppDEFieldId) return moveData;
    const targetItem = targetArray[toIndex];
    if (!targetItem) {
      let tempArray: IData[] = [];
      if (targetArray.length > 0) {
        tempArray = targetArray;
      }
      if (tempArray.length > 0) {
        const maxItem = tempArray.reduce((prev, curr) => {
          const sortCondition =
            prev[minorSortAppDEFieldId] > curr[minorSortAppDEFieldId];
          if (
            sortCondition &&
            prev[this.dataEntity.keyAppDEFieldId!] !== draggedItem.srfkey
          ) {
            return prev;
          }
          if (
            !sortCondition &&
            curr[this.dataEntity.keyAppDEFieldId!] !== draggedItem.srfkey
          ) {
            return curr;
          }
          return prev;
        });
        if (
          maxItem &&
          maxItem[this.dataEntity.keyAppDEFieldId!] !== draggedItem.srfkey
        ) {
          moveData = {
            srftargetkey: maxItem.srfkey,
            srfmovetype: 'MOVEAFTER',
          };
        }
      }
    } else {
      moveData = {
        srftargetkey: targetItem.srfkey,
        srfmovetype:
          toIndex < targetArray.length - 1
            ? 'MOVEBEFORE'
            : isCrossGroup
              ? 'MOVEBEFORE'
              : 'MOVEAFTER',
      };
    }
    return moveData;
  }

  /**
   * @description 移动并排序数据
   * @param {ControlVO} draggedItem
   * @param {IData} moveMeta
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async moveOrderItem(draggedItem: ControlVO, moveMeta: IData): Promise<void> {
    try {
      this.state.updating = true;
      const { minorSortAppDEFieldId } = this.model;
      if (!minorSortAppDEFieldId)
        return ibiz.log.error(
          ibiz.i18n.t('runtime.controller.common.md.sortingProperties'),
        );
      const deName = calcDeCodeNameById(this.model.appDataEntityId!);
      const tempContext = this.context.clone();
      tempContext[deName] = draggedItem.srfkey;
      if (!moveMeta.srftargetkey || !moveMeta.srfmovetype)
        return ibiz.log.error(
          ibiz.i18n.t('runtime.controller.common.md.computeMoveMetaError'),
        );
      const res = await this.service.moveOrderItem(
        tempContext,
        draggedItem,
        moveMeta,
      );
      if (res.ok) {
        // 通知实体数据变更
        this.emitDEDataChange('update', res.data);
        res.data.forEach(_item => {
          const item = this.state.items.find(x => x.srfkey === _item.srfkey);
          if (item) item[minorSortAppDEFieldId] = _item[minorSortAppDEFieldId];
        });
        await this.afterLoad({}, this.state.items);
      }
    } finally {
      this.state.updating = false;
    }
  }

  /**
   * @description 批量更新修改项
   * @param {ControlVO[]} changedItems
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async updateChangedItems(changedItems: ControlVO[]): Promise<void> {
    try {
      this.state.updating = true;
      await Promise.all(
        changedItems.map(async item => {
          // 往上下文添加主键
          const deName = calcDeCodeNameById(this.model.appDataEntityId!);
          const tempContext = this.context.clone();
          tempContext[deName] = item.srfkey;
          // 调用接口修改数据
          const res = await this.service.update(tempContext, item);
          // 更新完之后更新state里的数据。
          if (res.ok) {
            // 通知实体数据变更
            this.emitDEDataChange('update', res.data);
            const index = this.state.items.findIndex(
              x => x.srfkey === item.srfkey,
            );
            this.state.items.splice(index, 1, res.data);
          }
        }),
      );
    } finally {
      this.state.updating = false;
      await this.afterLoad({}, this.state.items);
    }
  }

  /**
   * @description 拖拽变更
   * @param {IDragChangeInfo} info
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async onDragChange(info: IDragChangeInfo): Promise<void> {
    const { from, to, fromIndex, toIndex } = info;
    if (!this.enableEditGroup && from !== to)
      return ibiz.message.warning(
        ibiz.i18n.t('runtime.controller.common.md.adjustmentsGroup'),
      );
    if (!this.enableEditOrder && from === to)
      return ibiz.message.warning(
        ibiz.i18n.t('runtime.controller.common.md.noAllowReorder'),
      );

    const { groupAppDEFieldId, moveControlAction, minorSortAppDEFieldId } =
      this.model;
    const fromGroup = this.state.groups.find(x => x.key === from);
    const toGroup = this.state.groups.find(x => x.key === to);
    const draggedItem = clone(
      fromGroup?.children[fromIndex] || this.state.items[fromIndex],
    );

    // 分组变更
    if (from !== to && groupAppDEFieldId) draggedItem[groupAppDEFieldId] = to;

    // 仅变更分组
    if (!this.enableEditOrder) {
      await this.updateChangedItems([draggedItem] as ControlVO[]);
    } else {
      // 排序变更
      if (!minorSortAppDEFieldId)
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.common.md.sortingProperties'),
        );
      const moveAction = moveControlAction?.appDEMethodId;
      if (!moveAction)
        throw new RuntimeModelError(
          this.model,
          ibiz.i18n.t('runtime.controller.common.md.noMoveDataCconfig'),
        );
      // 存在移动数据行为，先变更分组再变更排序
      if (from !== to) {
        await this.updateChangedItems([draggedItem] as ControlVO[]);
      }
      const originArr = toGroup?.children || this.state.items;
      const params = this.computeMoveDataParam(
        fromIndex,
        toIndex,
        draggedItem,
        originArr,
        info.from !== info.to,
      );
      await this.moveOrderItem(draggedItem as ControlVO, params);
    }
  }

  /**
   * @description 新建行
   * @param {MDCtrlLoadParams} [args={}]
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async newRow(args: MDCtrlLoadParams = {}): Promise<void> {
    try {
      const res = await this.service.getDraft(this.context, this.params);
      if (res.ok && res.data) {
        // 加载完后续处理
        this.state.items.unshift(res.data);
        await this.afterLoad(args, this.state.items);
        this.actionNotification('GETDRAFTSUCCESS', { data: res.data });
      }
    } catch (error) {
      this.actionNotification('GETDRAFTERROR', {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * @description 行单击
   * @param {IData} _data
   * @returns {*}  {Promise<void>}
   * @memberof ListController
   */
  async onRowClick(_data: IData): Promise<void> {
    const data = this.state.items.find(item => item.srfkey === _data.srfkey);
    if (!data) return;
    super.onRowClick(data);
    const { groupAppDEFieldId } = this.model;
    if (groupAppDEFieldId) {
      // 根据selectedData填充分组的选中数据
      this.state.groups.forEach(group => {
        group.selectedData = [];
      });
      this.state.selectedData.forEach(select => {
        const groupVal = select[groupAppDEFieldId];
        const selectGroup = this.state.groups.find(
          group => group.key === groupVal,
        );
        if (selectGroup) {
          selectGroup.selectedData!.push(select);
        }
      });
      // 根据分组选中的数据更新分组的按钮状态
      if (this.state.singleSelect) {
        // 单选情况下只有点击的分组的按钮会激活
        this.state.groups.forEach(group => {
          let tempData = data;
          if (group.selectedData!.indexOf(tempData) !== -1) {
            if (tempData && tempData instanceof ControlVO) {
              tempData = tempData.getOrigin();
            }
            if (tempData) {
              group.groupActionGroupState?.update(
                this.context,
                tempData,
                this.model.appDataEntityId!,
              );
            }
          } else {
            group.groupActionGroupState?.update(
              this.context,
              undefined,
              this.model.appDataEntityId!,
            );
          }
        });
      } else {
        // 多选情况下可能有多组分组按钮会激活
        const actionGroup = this.state.groups.find(group => {
          return group.children.indexOf(data) !== -1;
        });
        if (actionGroup) {
          actionGroup.groupActionGroupState?.update(
            this.context,
            actionGroup.selectedData![0],
            this.model.appDataEntityId!,
          );
        }
      }
    }
  }
}
