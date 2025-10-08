import {
  IDETreeNode,
  IAppCodeList,
  IDETreeNodeDataItem,
  IDETreeNodeEditItem,
  IUIActionGroupDetail,
  IDETreeNodeFieldColumn,
} from '@ibiz/model-core';
import {
  DataTypes,
  RuntimeError,
  RuntimeModelError,
} from '@ibiz-template/core';
import { clone } from 'ramda';
import dayjs from 'dayjs';
import {
  IModalData,
  CodeListItem,
  IEditorProvider,
  IEditorController,
  ITreeGridExRowState,
  IEditorContainerController,
} from '../../../../../interface';
import { TreeGridExFieldColumnController } from './tree-grid-ex-field-column.controller';
import { getEditorProvider } from '../../../../../register';
import { convertNavData, getWFContext } from '../../../../../utils';
import { OpenAppViewCommand } from '../../../../../command';
import { getAllUIActionItems, parseUserParams } from '../../../../../model';
import { UIActionUtil } from '../../../../../ui-action';
import {
  ButtonContainerState,
  UIActionButtonState,
  ValueExUtil,
} from '../../../../utils';
import { TreeGridExController } from '../../tree-grid-ex.controller';
import { TreeGridExNotifyState } from '../../../../constant';
import { TreeGridExRowState } from '../../tree-grid-ex-row.state';

/**
 * 树表格的某一个属性列对应某一种实体节点的节点数据的控制器
 * @author lxm
 * @date 2024-01-09 10:07:02
 * @export
 * @class TreeGridExNodeColumnController
 * @implements {IEditorContainerController}
 */
export class TreeGridExNodeColumnController
  implements IEditorContainerController
{
  /**
   * 树节点表格列（必有，没有不会创建该控制器）
   * @author lxm
   * @date 2024-01-09 10:08:17
   * @type {IDETreeNodeFieldColumn}
   */
  nodeColumn!: IDETreeNodeFieldColumn;

  /**
   * 节点数据项
   * @author lxm
   * @date 2024-01-09 10:08:28
   * @type {IDETreeNodeDataItem}
   */
  nodeDataItem!: IDETreeNodeDataItem;

  /**
   * 节点编辑项(启用了行编辑才有)
   * @author lxm
   * @date 2024-01-09 10:09:15
   * @type {IDETreeNodeEditItem}
   */
  nodeEditItem?: IDETreeNodeEditItem;

  /**
   * 编辑器适配器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @type {EditorController}
   */
  editorProvider?: IEditorProvider;

  /**
   * 编辑器控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:42
   * @type {IEditorController}
   */
  editor?: IEditorController;

  /**
   * 代码表项
   *
   * @author lxm
   * @date 2022-09-28 16:09:51
   * @type {readonly}
   */
  codeListItems?: readonly CodeListItem[];

  /**
   * 代码表模型
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-05-24 10:55:50
   */
  codeList: IAppCodeList | undefined = undefined;

  get unitName(): string | undefined {
    return this.nodeEditItem?.unitName;
  }

  get valueFormat(): string | undefined {
    return this.nodeColumn.valueFormat;
  }

  get context(): IContext {
    return this.fieldColumn.context;
  }

  get params(): IParams {
    return this.fieldColumn.params;
  }

  get dataType(): number | undefined {
    return this.nodeDataItem?.dataType;
  }

  /**
   * 树表格列标识（用于取数和各种比较判断）
   * @author lxm
   * @date 2024-01-09 11:33:37
   * @readonly
   * @type {string}
   */
  get name(): string {
    return this.fieldColumn.name;
  }

  /**
   *树表格增强部件
   * @author lxm
   * @date 2024-01-10 11:49:23
   * @readonly
   * @type {TreeGridExController}
   */
  get treeGrid(): TreeGridExController {
    return this.fieldColumn.treeGrid;
  }

  /**
   * 是否是链接列
   *
   * @author lxm
   * @date 2022-09-28 17:09:15
   * @returns {*}
   */
  get isLinkColumn(): boolean {
    return !!this.nodeColumn.enableLinkView && !!this.nodeColumn.linkAppViewId;
  }

  /**
   * 是否有触发界面行为
   *
   * @author lxm
   * @date 2022-12-08 14:12:37
   * @readonly
   * @type {boolean}
   */
  get hasClickAction(): boolean {
    return !!this.nodeColumn.deuiactionId;
  }

  /**
   * @author lxm
   * @date 2024-01-09 10:04:05
   * @param {TreeGridExFieldColumnController} fieldColumn 树表格属性列控制器
   * @param {IDETreeNode} nodeModel 对应实体节点模型
   */
  constructor(
    public fieldColumn: TreeGridExFieldColumnController,
    public nodeModel: IDETreeNode,
  ) {
    const { detreeNodeColumns, detreeNodeDataItems, detreeNodeEditItems } =
      nodeModel;

    const nodeColumn = detreeNodeColumns?.find(column => {
      return column.detreeColumnId === this.fieldColumn.model.id;
    });

    const nodeDataItem = detreeNodeDataItems?.find(
      (treeNodeDataItem: IDETreeNodeDataItem) => {
        return treeNodeDataItem.id === nodeColumn!.dataItemName;
      },
    );

    if (!nodeColumn || !nodeDataItem) {
      throw new RuntimeModelError(
        nodeModel,
        ibiz.i18n.t('runtime.controller.control.treeGridEx.noConfigured', {
          name: this.fieldColumn.name,
        }),
      );
    }

    this.nodeColumn = nodeColumn;
    this.nodeDataItem = nodeDataItem;

    // 启用了行编辑就会有行编辑项
    if (nodeColumn.enableRowEdit) {
      const nodeEditItem = detreeNodeEditItems?.find(
        (treeNodeEditItem: IDETreeNodeEditItem) => {
          return treeNodeEditItem.id === nodeColumn.id;
        },
      );
      if (!nodeEditItem) {
        throw new RuntimeModelError(
          nodeModel,
          ibiz.i18n.t('runtime.controller.control.treeGridEx.editItem', {
            name: this.fieldColumn.name,
          }),
        );
      }
      this.nodeEditItem = nodeEditItem;
    }
  }

  /**
   * 初始化
   * @author lxm
   * @date 2024-01-09 10:02:16
   * @return {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    if (
      this.nodeEditItem?.editor &&
      this.nodeEditItem.editor.editorType !== 'HIDDEN'
    ) {
      this.editorProvider = await getEditorProvider(this.nodeEditItem.editor);
      if (this.editorProvider) {
        this.editor = await this.editorProvider.createController(
          this.nodeEditItem.editor,
          this,
        );
      }
    }

    // 没有编辑项的时候加载代码表，否则由编辑器去解析
    if (!this.nodeEditItem) {
      await this.loadCodeList();
    }
  }

  /**
   * 初始化属性列界面行为组按钮状态
   *
   * @author lxm
   * @date 2022-09-07 21:09:43
   * @param {GridRowState} row
   */
  initActionStates(row: ITreeGridExRowState): void {
    // 属性列界面行为按钮状态
    const { deuiactionGroup } = this.nodeColumn;
    if (!deuiactionGroup?.uiactionGroupDetails?.length) return;
    const containerState = new ButtonContainerState();
    const actions = getAllUIActionItems(deuiactionGroup.uiactionGroupDetails);
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
    row.columnActionsStates[this.name!] = containerState;
  }

  /**
   * 文本点击事件
   *
   * @author zk
   * @date 2023-07-13 12:07:53
   * @param {MouseEvent} event
   */
  onTextClick(row: ITreeGridExRowState, event: MouseEvent): void {
    // 阻止触发行点击
    if (this.isLinkColumn) {
      event.stopPropagation();
      this.openLinkView(row, event);
    } else if (this.hasClickAction) {
      event.stopPropagation();
      this.triggerAction(row, event);
    }
  }

  /**
   * 打开链接视图
   *
   * @author lxm
   * @date 2024-01-09 02:45:34
   * @param {ITreeGridExRowState} row
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  async openLinkView(
    row: ITreeGridExRowState,
    event: MouseEvent,
  ): Promise<void> {
    const curValue = (row.data as IData)[this.fieldColumn.name];
    if (!curValue) {
      // 当前值不存在，不继续走打开链接视图逻辑
      return;
    }
    const valueItem = this.nodeColumn.linkValueItem || 'srfkey';
    const value = (row.data as IData)[valueItem];
    if (value == null) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.treeGridEx.noPickedUp', {
          valueItem,
        }),
      );
    }
    const { linkAppViewId } = this.nodeColumn;
    if (!linkAppViewId) {
      return;
    }
    const wfContext = getWFContext(row.data);
    const tempContext = Object.assign(this.context.clone(), {
      srfkey: value,
      ...wfContext,
    });
    const tempParams = clone(this.params);

    // *自定义参数转换额外的上下文和视图参数
    const { userParam } = this.nodeColumn;
    if (userParam) {
      const { navigateContexts, navigateParams } = parseUserParams(userParam);
      let selfContext = {};
      if (navigateContexts && row.data) {
        selfContext = convertNavData(
          navigateContexts!,
          row.data,
          tempParams,
          tempContext,
        );
      }
      Object.assign(tempContext, selfContext);
      let selfParams = {};
      if (navigateParams && row.data) {
        selfParams = convertNavData(
          navigateParams!,
          row.data,
          tempParams,
          tempContext,
        );
      }
      Object.assign(tempParams, selfParams);
    }

    // 打开视图
    const res: IModalData = await ibiz.commands.execute(
      OpenAppViewCommand.TAG,
      linkAppViewId,
      tempContext,
      tempParams,
      { event },
    );
    if (res?.ok) {
      this.fieldColumn.treeGrid.refresh();
    }
  }

  /**
   * 触发表格列附加界面行为
   *
   * @author lxm
   * @date 2022-12-08 15:12:35
   * @param {GridRowState} row 行数据
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   */
  async triggerAction(
    row: ITreeGridExRowState,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = this.nodeColumn.deuiactionId;
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params: this.params,
        data: [row.data],
        view: this.treeGrid.view,
        ctrl: this.treeGrid,
        event,
      },
      this.nodeColumn.appId,
    );
  }

  /**
   * 触发界面行为组点击事件
   *
   * @author lxm
   * @date 2024-01-11 02:26:12
   * @param {IUIActionGroupDetail} detail
   * @param {ITreeGridExRowState} row
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    row: ITreeGridExRowState,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    await this.treeGrid.doUIAction(actionId!, row.data, event, detail.appId);
  }

  /**
   * 值格式化
   * @author lxm
   * @date 2024-01-09 03:37:34
   * @param {unknown} [value='']
   * @return {*}  {string}
   */
  formatValue(value: unknown = ''): string {
    // 根据数据类型增强转换显示文本
    if (this.nodeColumn.valueType !== 'SIMPLE') {
      return ValueExUtil.toText(this.nodeColumn, value);
    }

    // 根据格式化配置格式化显示
    const strVal = `${value}`;
    if (!this.valueFormat) {
      return strVal;
    }
    const isDate = DataTypes.isDate(this.dataType!);
    if (isDate || this.fieldColumn.name === 'createdate') {
      const formatVal = dayjs(strVal).format(this.valueFormat);
      if (formatVal !== 'Invalid Date') {
        return formatVal;
      }
      return strVal;
    }
    return ibiz.util.text.format(strVal, this.valueFormat);
  }

  /**
   * 加载代码表数据
   *
   * @author lxm
   * @date 2022-09-28 15:09:38
   * @returns {*}
   */
  async loadCodeList(): Promise<Readonly<CodeListItem[]> | undefined> {
    const appCodeListId = this.nodeColumn.appCodeListId!;
    if (!appCodeListId) {
      return;
    }
    const app = ibiz.hub.getApp(this.context.srfappid);

    // 顺便加载代码表模型
    if (!this.codeList) {
      this.codeList = app.codeList.getCodeList(appCodeListId);
    }

    const dataItems = await app.codeList.get(
      appCodeListId,
      this.context,
      this.params,
    );
    this.codeListItems = dataItems;
    return dataItems;
  }

  gridStateNotify(row: TreeGridExRowState, state: TreeGridExNotifyState): void {
    if (
      state === TreeGridExNotifyState.LOAD ||
      state === TreeGridExNotifyState.SAVE
    ) {
      const uaColState = row.columnActionsStates[this.name];
      if (uaColState && row.data._nodeType === 'DE') {
        // 实体节点更新操作列状态
        uaColState.update(this.context, row.data._deData);
      }
    }
  }

  /**
   * 设置行属性的值
   *
   * @author lxm
   * @date 2022-08-24 10:08:40
   * @param {GridRowState} row 行状态控制器
   * @param {unknown} value 要设置的值
   * @param {string} name 要设置的表单数据的属性名称
   * @param {boolean} ignore 忽略脏值检查
   */
  async setRowValue(
    row: TreeGridExRowState,
    value: unknown,
    name?: string,
    ignore: boolean = false,
  ): Promise<void> {
    name = name || this.name;
    await this.treeGrid.setRowValue(row, name, value, ignore);
  }
}
