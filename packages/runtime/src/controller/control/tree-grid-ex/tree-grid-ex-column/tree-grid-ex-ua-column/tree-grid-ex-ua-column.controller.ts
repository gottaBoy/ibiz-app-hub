/* eslint-disable no-param-reassign */
import {
  IUIActionGroup,
  IDETreeUAColumn,
  IDETreeNodeUAColumn,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import { ButtonContainerState, UIActionButtonState } from '../../../../utils';
import { TreeGridExColumnController } from '../tree-grid-ex-column/tree-grid-ex-column.controller';
import { ITreeGridExRowState } from '../../../../../interface';
import { TreeGridExNotifyState } from '../../../../constant';
import { TreeGridExRowState } from '../../tree-grid-ex-row.state';
import { getAllUIActionItems } from '../../../../../model';

/**
 * 树表格（增强）操作列控制器
 * @author lxm
 * @date 2023-12-21 02:04:05
 * @export
 * @class TreeGridExUAColumnController
 * @extends {TreeGridExColumnController<IDETreeUAColumn>}
 */
export class TreeGridExUAColumnController extends TreeGridExColumnController<IDETreeUAColumn> {
  /**
   * 该树表格列对应不同节点模型的节点列控制器
   * @author lxm
   * @date 2024-01-08 05:40:56
   * @type {Map<string, IDETreeNodeUAColumn>}
   */
  nodeColumnMap: Map<string, IDETreeNodeUAColumn> = new Map();

  async init(): Promise<void> {
    await this.onInit();
    await this.initNodeColumnMap();
  }

  /**
   * 解析模型初始化节点对应的节点列模型
   * @author lxm
   * @date 2024-01-24 02:41:05
   */
  initNodeColumnMap(): void {
    this.treeGrid.model.detreeNodes?.forEach(node => {
      if (node.treeNodeType !== 'DE') {
        return;
      }
      const nodeColumn = node.detreeNodeColumns?.find(
        (column: IDETreeNodeUAColumn) => {
          return column.detreeColumnId === this.model.id;
        },
      );

      // 没有指定树表格列的不创建
      if (nodeColumn) {
        this.nodeColumnMap.set(node.id!, nodeColumn);
      }
    });
  }

  /**
   * 获取界面行为组mode
   * @author lxm
   * @date 2024-01-24 04:13:03
   * @param {ITreeGridExRowState} row
   * @return {*}  {(IUIActionGroup | undefined)}
   */
  getUIActionGroup(row: ITreeGridExRowState): IUIActionGroup | undefined {
    let { deuiactionGroup } = this.model;

    // 对应节点数据项配置了的时候拿数据项的界面行为组
    if (
      row.data._nodeType === 'DE' &&
      this.nodeColumnMap.get(row.data._nodeId)
    ) {
      const nodeColumn = this.nodeColumnMap.get(row.data._nodeId)!;
      if (nodeColumn.deuiactionGroup) {
        deuiactionGroup = nodeColumn.deuiactionGroup;
      }
    }
    return deuiactionGroup;
  }

  /**
   * 给rowController初始化操作列的状态
   *
   * @author lxm
   * @date 2022-09-07 21:09:43
   * @param {ITreeGridExRowState} row
   */
  initActionStates(row: ITreeGridExRowState): void {
    // 操作列按钮状态控制
    const deuiactionGroup = this.getUIActionGroup(row);

    if (!deuiactionGroup) {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.controller.control.treeGridEx.behaviorGroup', {
          id: this.model.id,
        }),
      );
      return;
    }
    if (!deuiactionGroup.uiactionGroupDetails?.length) {
      ibiz.log.debug(
        ibiz.i18n.t('runtime.controller.control.grid.interfaceBehavior'),
      );
      return;
    }
    const containerState = new ButtonContainerState();
    const actions = getAllUIActionItems(deuiactionGroup.uiactionGroupDetails);
    actions.forEach(detail => {
      const actionid = detail.uiactionId;
      if (actionid) {
        const buttonState = new UIActionButtonState(
          detail.id!,
          this.treeGrid.context.srfappid!,
          actionid,
          detail,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    row.columnActionsStates[this.model.id!] = containerState;
  }

  /**
   * 触发操作列点击事件
   *
   * @author lxm
   * @date 2022-09-07 22:09:46
   * @param {IPSUIActionGroupDetail} detail
   * @param {MouseEvent} event
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    row: ITreeGridExRowState,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    await this.treeGrid.doUIAction(actionId!, row.data, event, detail.appId);
  }

  gridStateNotify(row: TreeGridExRowState, state: TreeGridExNotifyState): void {
    super.gridStateNotify(row, state);
    if (
      state === TreeGridExNotifyState.LOAD ||
      state === TreeGridExNotifyState.SAVE
    ) {
      const uaColState = row.columnActionsStates[this.model.id!];
      if (uaColState && row.data._nodeType === 'DE') {
        // 实体节点更新操作列状态
        uaColState.update(this.context, row.data._deData);
      }
    }
  }
}
