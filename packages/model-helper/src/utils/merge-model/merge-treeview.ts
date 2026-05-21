/* eslint-disable no-case-declarations */
import { IDETree, IDETreeNodeRS } from '@ibiz/model-core';

/**
 * 合并树部件
 *
 * @author tony001
 * @date 2024-09-26 17:09:25
 * @export
 * @param {IDETree} dst
 * @param {IDETree} source
 */
export function mergeTreeView(dst: IDETree, source: IDETree): void {
  if (!dst || !source) return;
  // 合并树节点
  if (source.detreeNodes && source.detreeNodes.length > 0) {
    if (!dst.detreeNodes) {
      dst.detreeNodes = [];
    }
    source.detreeNodes.forEach(sourceNode => {
      const item = dst.detreeNodes!.find(dstNode => {
        return dstNode.id === sourceNode.id;
      });
      if (!item) {
        dst.detreeNodes?.push(sourceNode);
      }
    });
  }
  // 合并树节点关系
  if (source.detreeNodeRSs && source.detreeNodeRSs.length > 0) {
    if (!dst.detreeNodeRSs) {
      dst.detreeNodeRSs = [];
    }
    source.detreeNodeRSs.forEach(sourceNodeRs => {
      // 若配置了用户标记（dynamic_overlay:before|after|replace|delete|start|end:noderesid），则需根据用户标记进行合并，否则原始数据没有则直接附加末尾
      if (
        (sourceNodeRs as IModel).userTag &&
        (sourceNodeRs as IModel).userTag.startsWith('dynamic_overlay') &&
        (sourceNodeRs as IModel).userTag.split(':').length === 3
      ) {
        mergeSubAppTreeNodeResToDst(dst, sourceNodeRs);
      } else {
        const itemIndex = dst.detreeNodeRSs!.findIndex(dstNodeRs => {
          return (
            dstNodeRs.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId &&
            dstNodeRs.childDETreeNodeId === sourceNodeRs.childDETreeNodeId
          );
        });
        // 若存在end标记，则需要添加到第一个end标记节点关系前面，保证end标记节点关系始终添加到最后
        const endIndex = dst.detreeNodeRSs!.findIndex(dstNodeRs => {
          if (
            dstNodeRs.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId
          ) {
            const tags = (sourceNodeRs as IModel).userTag?.split(':');
            if (!tags || tags.length !== 3 || tags[1] !== 'end') return false;
            return true;
          }
          return false;
        });
        if (itemIndex === -1) {
          if (endIndex === -1) {
            dst.detreeNodeRSs?.push(sourceNodeRs);
          } else {
            dst.detreeNodeRSs!.splice(endIndex, 0, sourceNodeRs);
          }
        }
      }
    });
  }
}

/**
 * 合并指定子应用树节点关系到主应用树指定位置
 * @param dst 原始树
 * @param sourceNode 子应用树节点关系
 */
function mergeSubAppTreeNodeResToDst(
  dst: IDETree,
  sourceNodeRs: IDETreeNodeRS,
): void {
  // dynamic_overlay:before|after|replace|delete|start|end:nodeid 定义附加位置
  const [dynamicOverlay, targetPosition, targetTag] = (
    sourceNodeRs as IModel
  ).userTag.split(':');
  if (!dynamicOverlay || !targetPosition || !targetTag) return;
  switch (targetPosition) {
    case 'before':
      // 在目标节点之前,dynamic_overlay:before:childnodeid,这儿最后一节拼接的是子节点标识
      const beforeIndex = dst.detreeNodeRSs!.findIndex(dstNode => {
        return (
          dstNode.childDETreeNodeId === targetTag &&
          dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId
        );
      });
      if (beforeIndex !== -1) {
        dst.detreeNodeRSs!.splice(beforeIndex, 0, sourceNodeRs);
      }
      break;
    case 'after':
      // 在目标节点之后,格式如：dynamic_overlay:after:childnodeid,最后一节拼接的是子节点标识
      const afterIndex = dst.detreeNodeRSs!.findIndex(dstNode => {
        return (
          dstNode.childDETreeNodeId === targetTag &&
          dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId
        );
      });
      if (afterIndex !== -1) {
        dst.detreeNodeRSs!.splice(afterIndex + 1, 0, sourceNodeRs);
      }
      break;
    case 'replace':
      // 替换目标节点,格式如：dynamic_overlay:replace:childnodeid,最后一节拼接的是子节点标识
      const replaceIndex = dst.detreeNodeRSs!.findIndex(dstNode => {
        return (
          dstNode.childDETreeNodeId === targetTag &&
          dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId
        );
      });
      if (replaceIndex !== -1) {
        dst.detreeNodeRSs!.splice(replaceIndex, 1, sourceNodeRs);
      }
      break;
    case 'delete':
      // 删除目标节点,格式如：dynamic_overlay:delete:childnodeid,最后一节拼接的是子节点标识
      const deleteIndex = dst.detreeNodeRSs!.findIndex(dstNode => {
        return (
          dstNode.childDETreeNodeId === targetTag &&
          dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId
        );
      });
      if (deleteIndex !== -1) {
        dst.detreeNodeRSs!.splice(deleteIndex, 1);
      }
      break;
    case 'start':
      // 在目标节点内部开始，格式如：dynamic_overlay:start:随机字符,最后一节拼接的是随机字符，读的是当前节点关系的父节点标识
      const startIndex = dst.detreeNodeRSs!.findIndex(dstNode => {
        return dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId;
      });
      if (startIndex !== -1) {
        dst.detreeNodeRSs!.splice(startIndex, 0, sourceNodeRs);
      }
      break;
    case 'end':
      // 在目标节点内部结束，格式如：dynamic_overlay:end:随机字符,最后一节拼接的是随机字符，读的是当前节点关系的父节点标识
      const endIndex = getLastIndex(dst.detreeNodeRSs!, dstNode => {
        return dstNode.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId;
      });
      if (endIndex !== -1) {
        dst.detreeNodeRSs!.splice(endIndex + 1, 0, sourceNodeRs);
      }
      break;
    default:
      // 未识别位置，若源树不存在该关系，则直接附加到最后
      const defaultIndex = dst.detreeNodeRSs!.findIndex(dstNodeRs => {
        return (
          dstNodeRs.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId &&
          dstNodeRs.childDETreeNodeId === sourceNodeRs.childDETreeNodeId
        );
      });
      // 若存在end标记，则需要添加到第一个end标记节点关系前面，保证end标记节点关系始终添加到最后
      const defaultEndIndex = dst.detreeNodeRSs!.findIndex(dstNodeRs => {
        if (dstNodeRs.parentDETreeNodeId === sourceNodeRs.parentDETreeNodeId) {
          const tags = (sourceNodeRs as IModel).userTag?.split(':');
          if (!tags || tags.length !== 3 || tags[1] !== 'end') return false;
          return true;
        }
        return false;
      });
      if (defaultIndex === -1) {
        if (defaultEndIndex === -1) {
          dst.detreeNodeRSs?.push(sourceNodeRs);
        } else {
          dst.detreeNodeRSs!.splice(defaultEndIndex, 0, sourceNodeRs);
        }
      }
      break;
  }
}

/**
 * 获取指定数组中满足条件的最后一个元素
 * @param arr 指定数组
 * @param predicate 过滤条件
 * @returns 找到则返回指定元素下标，反之返回-1
 */
function getLastIndex(
  arr: IModel[],
  predicate: (item: IModel) => boolean,
): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return -1;
}
