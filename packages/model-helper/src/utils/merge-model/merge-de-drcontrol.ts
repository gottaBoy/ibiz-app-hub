/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IAppViewRef, IControl, ITabExpPanel } from '@ibiz/model-core';

/**
 * 合并DrCtrl控件
 *
 * @author tony001
 * @date 2024-04-29 19:04:44
 * @export
 * @param {IModel} dstDRCtrl
 * @param {IModel} srcDRCtrl
 * @return {*}  {void}
 */
export function mergeDEDrControl(dstDRCtrl: IModel, srcDRCtrl: IModel): void {
  if (!srcDRCtrl) {
    return;
  }
  // 合并分组（相同id替换，如果分组项定义用户标记（格式如：dynamic_overlay:BEFORE/AFTER:目标分组id）,则需要找到目标分组，则根据位置在目标项前后附加,没有则附加）
  if (srcDRCtrl.dedrbarGroups) {
    srcDRCtrl.dedrbarGroups.forEach((item1: IModel) => {
      let index: number = 0;
      const result = dstDRCtrl.dedrbarGroups?.find(
        (item2: IModel, index2: number) => {
          index = index2;
          return item1.name === item2.name;
        },
      );
      if (result) {
        dstDRCtrl.dedrbarGroups[index] = item1;
      } else if (item1.userTag && item1.userTag.startsWith('dynamic_overlay')) {
        const [dynaTag, targetPosition, targetTag] = item1.userTag.split(':');
        const targetIndex = dstDRCtrl.dedrbarGroups.findIndex(
          (item3: IModel) => item3.id === targetTag,
        );
        if (targetIndex !== -1) {
          if (targetPosition === 'BEFORE') {
            dstDRCtrl.dedrbarGroups.splice(targetIndex, 0, item1);
          } else if (targetPosition === 'AFTER') {
            dstDRCtrl.dedrbarGroups.splice(targetIndex + 1, 0, item1);
          } else {
            dstDRCtrl.dedrbarGroups.push(item1);
          }
        } else {
          dstDRCtrl.dedrbarGroups.push(item1);
        }
      } else {
        dstDRCtrl.dedrbarGroups.push(item1);
      }
    });
  }
  // 合并分组项（相同id替换，如果项成员项定义成员标记（格式如：dynamic_overlay:BEFORE/AFTER:目标项id）,则需要找到目标项，则根据位置在目标项前后附加，没有则附加）
  if (srcDRCtrl.dedrctrlItems) {
    srcDRCtrl.dedrctrlItems.forEach((item1: IModel) => {
      let index: number = 0;
      const result = dstDRCtrl.dedrctrlItems.find(
        (item2: IModel, index2: number) => {
          index = index2;
          return item1.id === item2.id;
        },
      );
      if (result) {
        dstDRCtrl.dedrctrlItems[index] = item1;
      } else if (item1.itemTag && item1.itemTag.startsWith('dynamic_overlay')) {
        const [dynaTag, targetPosition, targetTag] = item1.itemTag.split(':');
        const targetIndex = dstDRCtrl.dedrctrlItems.findIndex(
          (item3: IModel) => item3.id === targetTag,
        );
        if (targetIndex !== -1) {
          if (targetPosition === 'BEFORE') {
            dstDRCtrl.dedrctrlItems.splice(targetIndex, 0, item1);
          } else if (targetPosition === 'AFTER') {
            dstDRCtrl.dedrctrlItems.splice(targetIndex + 1, 0, item1);
          } else {
            dstDRCtrl.dedrctrlItems.push(item1);
          }
        } else {
          dstDRCtrl.dedrctrlItems.push(item1);
        }
      } else {
        dstDRCtrl.dedrctrlItems.push(item1);
      }
    });
  }

  // 合并分组项（相同id替换，如果tab成员项定义成员标记（格式如：BEFORE/AFTER:目标项id或者dynamic_overlay:BEFORE/AFTER:目标项id）,则需要找到目标项，则根据位置在目标项前后附加），没有则附加到尾部
  if (srcDRCtrl.dedrtabPages) {
    srcDRCtrl.dedrtabPages.forEach((item1: IModel) => {
      let index: number = 0;
      const result = dstDRCtrl.dedrtabPages.find(
        (item2: IModel, index2: number) => {
          index = index2;
          return item1.id === item2.id;
        },
      );
      if (result) {
        dstDRCtrl.dedrtabPages[index] = item1;
      } else if (item1.itemTag) {
        // 兼容BEFORE/AFTER:目标项id或者dynamic_overlay:BEFORE/AFTER:目标项id2种格式
        const splitTags = item1.itemTag.split(':');
        let targetPosition = '';
        let targetTag = '';

        // 只处理符合预期格式的情况
        if (splitTags.length === 2 || splitTags.length === 3) {
          targetPosition = splitTags[splitTags.length === 2 ? 0 : 1];
          targetTag = splitTags[splitTags.length === 2 ? 1 : 2];
        }

        if (!targetTag || !targetPosition) {
          dstDRCtrl.dedrtabPages.push(item1);
        } else {
          const targetIndex = dstDRCtrl.dedrtabPages.findIndex(
            (item3: IModel) => item3.id === targetTag,
          );
          if (targetIndex !== -1) {
            if (targetPosition === 'BEFORE') {
              dstDRCtrl.dedrtabPages.splice(targetIndex, 0, item1);
            } else if (targetPosition === 'AFTER') {
              dstDRCtrl.dedrtabPages.splice(targetIndex + 1, 0, item1);
            } else {
              dstDRCtrl.dedrtabPages.push(item1);
            }
          } else {
            dstDRCtrl.dedrtabPages.push(item1);
          }
        }
      } else {
        dstDRCtrl.dedrtabPages.push(item1);
      }
    });
  }
}

/**
 * 合并分页导航面板
 * @param dstTabExpPanel
 * @param srcTabExpPanel
 * @returns
 */
export function mergeDETabExpPanel(
  dstTabExpPanel: ITabExpPanel,
  srcTabExpPanel: ITabExpPanel,
): void {
  if (!srcTabExpPanel || !dstTabExpPanel) {
    return;
  }
  // 无数据时初始化
  if (!dstTabExpPanel.tabExpPageIds) {
    dstTabExpPanel.tabExpPageIds = [];
  }
  if (!dstTabExpPanel.appViewRefs) {
    dstTabExpPanel.appViewRefs = [];
  }
  if (!dstTabExpPanel.controls) {
    dstTabExpPanel.controls = [];
  }
  // 合并子应用分页导航面板
  if (srcTabExpPanel.tabExpPageIds) {
    srcTabExpPanel.tabExpPageIds.forEach((id1: string) => {
      dstTabExpPanel.tabExpPageIds!.push(id1);
    });
  }
  if (srcTabExpPanel.appViewRefs) {
    srcTabExpPanel.appViewRefs.forEach((item1: IAppViewRef) => {
      dstTabExpPanel.appViewRefs!.push(item1);
    });
  }
  if (srcTabExpPanel.controls) {
    srcTabExpPanel.controls.forEach((item1: IControl) => {
      dstTabExpPanel.controls!.push(item1);
    });
  }
}
