/* eslint-disable no-nested-ternary */
import {
  clone,
  DataTypes,
  isElementSame,
  RuntimeModelError,
} from '@ibiz-template/core';
import { IDEDataView, IUIActionGroupDetail } from '@ibiz/model-core';
import { isNil } from 'ramda';
import { createUUID, isBoolean } from 'qx-util';
import {
  ISortItem,
  CodeListItem,
  IDragChangeInfo,
  MDCtrlLoadParams,
  IApiMDGroupParams,
  IMDControlGroupState,
  IDataViewControlState,
  IDataViewControlEvent,
  IDataViewControlController,
} from '../../../interface';
import { ControlVO } from '../../../service';
import { UIActionUtil } from '../../../ui-action';
import { MDControlController } from '../../common';
import {
  ControllerEvent,
  UIActionButtonState,
  ButtonContainerState,
} from '../../utils';
import { DataViewControlService } from './data-view.service';
import {
  calcDeCodeNameById,
  getAllUIActionItems,
  getParentTextAppDEFieldId,
} from '../../../model';
import { formatDateByScale } from '../../../utils';

export class DataViewControlController<
    T extends IDEDataView = IDEDataView,
    S extends IDataViewControlState = IDataViewControlState,
    E extends IDataViewControlEvent = IDataViewControlEvent,
  >
  extends MDControlController<T, S, E>
  implements IDataViewControlController
{
  /**
   * 事件触发器
   *
   * @type {ControllerEvent<IDataViewControlEvent>}
   * @memberof DataViewControlController
   */
  declare evt: ControllerEvent<IDataViewControlEvent>;

  /**
   * 数据视图（卡片）部件服务
   *
   * @type {DataViewControlService}
   * @memberof DataViewControlController
   */
  declare service: DataViewControlService;

  /**
   * 分组代码表项集合
   * @author lxm
   * @date 2023-08-29 04:55:07
   * @type {readonly}
   */
  groupCodeListItems?: readonly CodeListItem[];

  /**
   * @description 是否允许新建
   * @readonly
   * @type {boolean}
   * @memberof DataViewControlController
   */
  get enableNew(): boolean {
    return this.model.enableCardNew === true;
  }

  /**
   * @description 是否允许调整顺序
   * @readonly
   * @type {boolean}
   * @memberof DataViewControlController
   */
  get enableEditOrder(): boolean {
    return this.model.enableCardEditOrder === true;
  }

  /**
   * @description 是否支持调整分组
   * @readonly
   * @type {boolean}
   * @memberof DataViewControlController
   */
  get enableEditGroup(): boolean {
    return this.model.enableCardEditGroup === true;
  }

  /**
   * 初始化State
   *
   * @protected
   * @memberof DataViewControlController
   */
  protected initState(): void {
    super.initState();
    this.state.noSort = this.model.noSort === true;
    this.state.size = this.model.pagingSize || 20;
    this.state.singleSelect = this.model.singleSelect === true;
    this.state.sortItems = [];
    this.state.updating = false;
    this.state.collapseKeys = [];
    const { enablePagingBar } = this.model;
    this.state.enablePagingBar = enablePagingBar;
    this.state.readonly = !!(
      this.context.srfreadonly === true || this.context.srfreadonly === 'true'
    );
    this.state.draggable = this.enableEditOrder || this.enableEditGroup;
    this.state.uaState = {};
  }

  /**
   * 初始化
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof DataViewControlController
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initControlService();
    this.initSortItems();
  }

  /**
   * 初始化部件服务
   * @author lxm
   * @date 2023-08-29 04:13:05
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initControlService(): Promise<void> {
    this.service = new DataViewControlService(this.model);
    await this.service.init(this.context);
  }

  /**
   * 初始化分组右侧界面行为按钮的状态
   *
   * @author chitanda
   * @date 2023-08-02 17:08:04
   * @return {*}  {Promise<void>}
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
   * 行单击事件
   *
   * @author lxm
   * @date 2022-08-18 22:08:16
   * @param {IData} _data 选中的单条数据
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
   * @memberof DataViewControlController
   */
  scrollToTop(): void {
    this.evt.emit('onScrollToTop', undefined);
  }

  /**
   * 特殊处理，加载模式为滚动加载或者点击加载，刷新时加载数据条数为分页乘以默认条数
   *
   * @return {*}  {Promise<void>}
   * @memberof DataViewControlController
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
    await this.initGroupCodeListItems();
    await this.handleDataGroup();
    await this.initGroupActionStates();
    await this.calcOptItemState(items);
    this.calcShowMode(items);
    return items;
  }

  /**
   * @description 获取操作项行为集合模型
   * @returns {*}  {IUIActionGroupDetail[]}
   * @memberof DataViewControlController
   */
  getOptItemModel(): IUIActionGroupDetail[] {
    const actions: IUIActionGroupDetail[] = [];
    const { dedataViewItems } = this.model;
    dedataViewItems?.forEach(item => {
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
   * @memberof DataViewControlController
   */
  async calcOptItemState(items: IData[]): Promise<void> {
    const details = this.getOptItemModel();
    if (details.length)
      await Promise.all(
        items.map(async item => {
          const containerState = new ButtonContainerState();
          const actions = getAllUIActionItems(details);
          actions.forEach((action: IData) => {
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
   * 行为点击
   *
   * @param {IUIActionGroupDetail} detail
   * @param {IData} item
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   * @memberof DataViewControlController
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
   * @description 执行多数据分组
   * @param {IApiMDGroupParams[]} [arg] 分组参数集合（多层分组暂未支持）
   * @param {IParams} [_params] 额外参数
   * @returns {*}  {Promise<void>}
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
   */
  async handleDataGroup(): Promise<void> {
    const { groupMode, groupAppDEFieldId } = this.model;
    const { enableGroup } = this.state;
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
   * @memberof DataViewControlController
   */
  async handleAutoGroup(): Promise<void> {
    const { groupAppDEFieldId, groupCodeListId, groupTextAppDEFieldId } =
      this.model;
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
        groupTextAppDEFieldId ||
        groupAppDEFieldId;
      const dateFormat = this.groupDateFormat[0];
      const groupMap: Map<string, IData[]> = new Map();
      const unclassified: IMDControlGroupState = {
        key: createUUID(),
        caption: ibiz.i18n.t('runtime.controller.common.md.unclassified'),
        children: [],
      };
      items.forEach((item: IData) => {
        // 如果有外键值文本属性，则根据外键值文本属性分组
        let groupVal = item[textDEFieldId];
        // 特殊处理日期格式化
        if (dateFormat) groupVal = formatDateByScale(groupVal, dateFormat);
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
   * @memberof DataViewControlController
   */
  async handleCodeListGroup(): Promise<void> {
    const { groupAppDEFieldId, groupCodeListId } = this.model;
    if (!groupCodeListId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.dataView.tableNoConfigured'),
      );
    }
    const { items } = this.state;
    const groupMap: Map<string | number, IData[]> = new Map();
    this.groupCodeListItems!.forEach(item => {
      groupMap.set(item.value, []);
    });
    items.forEach((item: IData) => {
      const groupVal = item[groupAppDEFieldId!];
      const groupArr = groupMap.get(groupVal);
      if (groupArr) {
        groupArr.push(item);
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
   * 点击新建
   * @author lxm
   * @date 2023-09-11 07:22:33
   * @param {MouseEvent} event
   * @param {(string | number)} group 分组标识
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
   * 分组工具栏点击处理回调
   * @author lxm
   * @date 2023-09-11 04:48:06
   * @param {IUIActionGroupDetail} detail
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
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
   * 初始化排序项集合
   * @author lxm
   * @date 2023-10-24 06:11:02
   * @return {*}  {void}
   */
  initSortItems(): void {
    if (!this.model.dedataViewItems?.length) {
      return;
    }
    const sortItems: ISortItem[] = [];
    const { minorSortAppDEFieldId, minorSortDir } = this.model;
    const hasDefaultSort = minorSortAppDEFieldId && minorSortDir;
    this.model.dedataViewItems.forEach(item => {
      if (!item.enableSort) {
        return;
      }

      let { caption } = item;
      if (item.capLanguageRes) {
        caption = ibiz.i18n.t(item.capLanguageRes.lanResTag!, item.caption);
      }
      if (!item.appDEFieldId) {
        throw new RuntimeModelError(
          item,
          ibiz.i18n.t('runtime.controller.control.dataView.sortingItems'),
        );
      }

      const tempItem: ISortItem = {
        caption: caption!,
        key: item.appDEFieldId,
      };

      // 默认排序
      if (hasDefaultSort && minorSortAppDEFieldId === item.appDEFieldId) {
        tempItem.order = minorSortDir.toLowerCase() as 'asc' | 'desc';
      }
      // 当前排序回显
      if (this.state.sortQuery) {
        const [appDEFieldId, order] = this.state.sortQuery.split(',');
        if (appDEFieldId === item.appDEFieldId) {
          tempItem.order = order as 'asc' | 'desc';
        }
      }

      sortItems.push(tempItem);
    });
    if (sortItems.length > 0) {
      this.state.sortItems = sortItems;
    }
  }

  /**
   * @description 切换折叠，其中tag表示操作指定分组标识，若不传则操作当前卡片的所有分组展开状态，expand表示是否展开，若不传则基于当前分组状态取反
   * @param {{ tag?: string; expand?: boolean }} [params={}]
   * @memberof DataViewControlController
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    if (tag) {
      const collapseKeysSet = new Set(this.state.collapseKeys);
      const collapse = isBoolean(expand) ? !expand : !collapseKeysSet.has(tag);
      if (collapse) {
        collapseKeysSet.add(tag);
      } else {
        collapseKeysSet.delete(tag);
      }
      this.state.collapseKeys = Array.from(collapseKeysSet);
    } else if (expand) {
      this.state.collapseKeys = [];
    } else {
      this.state.collapseKeys = this.state.groups.map(x => x.key.toString());
    }
  }

  /**
   * @description 本地排序items(用于拖拽数据完成后的前端数据排序)
   * @param {IData[]} items
   * @returns {*}  {void}
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
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
   * @memberof DataViewControlController
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
}
