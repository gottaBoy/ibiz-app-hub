import { IDETreeNode } from '@ibiz/model-core';
import { ITreeNodeData } from '../../state';
import { EventBase } from '../argument';
import { IMDControlEvent } from './i-md-control.event';

/**
 * @description 树事件
 * @primary
 * @export
 * @interface ITreeEvent
 * @extends {IMDControlEvent}
 */
export interface ITreeEvent extends IMDControlEvent {
  /**
   * @description 数据激活事件
   * @type {({
   *     event: EventBase & { nodeData: ITreeNodeData };
   *     emitArgs: { data: IData[]; nodeData: ITreeNodeData };
   *   })}
   * @memberof ITreeEvent
   */
  onActive: {
    event: EventBase & { nodeData: ITreeNodeData };
    emitArgs: { data: IData[]; nodeData: ITreeNodeData };
  };

  /**
   * @description 父节点刷新结束之后事件
   * @type {({
   *     event: EventBase & { parentNode: ITreeNodeData; children: ITreeNodeData[] };
   *     emitArgs: { parentNode: ITreeNodeData; children: ITreeNodeData[] };
   *   })}
   * @memberof ITreeEvent
   */
  onAfterRefreshParent: {
    event: EventBase & { parentNode: ITreeNodeData; children: ITreeNodeData[] };
    emitArgs: { parentNode: ITreeNodeData; children: ITreeNodeData[] };
  };

  /**
   * @description 树节点拖入变更处理完成后事件
   * @type {({
   *     event: EventBase & { isChangedParent: boolean };
   *     emitArgs: { isChangedParent: boolean };
   *   })}
   * @memberof ITreeEvent
   */
  onAfterNodeDrop: {
    event: EventBase & { isChangedParent: boolean };
    emitArgs: { isChangedParent: boolean };
  };

  /**
   * @description 新建树节点
   * @type {({
   *     event: EventBase & { nodeModel: IDETreeNode; defaultValue: IParams; parentNodeData?: ITreeNodeData };
   *     emitArgs: { nodeModel: IDETreeNode; defaultValue: IParams; parentNodeData?: ITreeNodeData };
   *   })}
   * @memberof ITreeEvent
   */
  onNewTreeNode: {
    event: EventBase & {
      nodeModel: IDETreeNode;
      defaultValue: IParams;
      parentNodeData?: ITreeNodeData;
    };
    emitArgs: {
      nodeModel: IDETreeNode;
      defaultValue: IParams;
      parentNodeData?: ITreeNodeData;
    };
  };

  /**
   * @description 更新UI事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof ITreeEvent
   */
  onUpdateUI: {
    event: EventBase;
    emitArgs: undefined;
  };
}
