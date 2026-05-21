/* eslint-disable no-useless-return */
import { IUIActionGroup, IUIActionGroupDetail } from '@ibiz/model-core';
// dynamic_overlay:before|after|replace|delete:detailid

/**
 * 解析动态覆盖标签字符串，提取位置信息和目标ID
 *
 * @param tag - 要解析的标签字符串，格式应为 "dynamic_overlay:position:targetId"
 * @returns 如果解析成功，返回包含position和targetId的对象；否则返回null
 */
function parseDynamicOverlay(
  tag: string,
): { position: string; targetId: string } | null {
  if (!tag) {
    return null;
  }
  const match = tag.match(
    /^dynamic_overlay:(before|after|replace|delete):(.+)$/,
  );
  if (match) {
    return { position: match[1], targetId: match[2] };
  }
  return null;
}

/**
 * 合并两个界面行为组
 *
 * @param dst 目标界面行为组，用于接收合并结果
 * @param src 源界面行为组，提供要合并的数据
 * @returns 无返回值，直接修改目标对象
 */
export function mergeAppDEUIActionGroup(
  dst: IUIActionGroup | undefined,
  src: IUIActionGroup | undefined,
): void {
  if (!dst || !src) {
    return;
  }
  // 合并界面行为组项,根据界面行为组成员用户标记(格式如：dynamic_overlay:before|after|replace|delete:detailid)进行合并，如格式不满足则添加到末尾，如没有用户标记，则直接添加到末尾
  if (src.uiactionGroupDetails) {
    if (!dst.uiactionGroupDetails) {
      dst.uiactionGroupDetails = [];
    }
    src.uiactionGroupDetails.forEach((item: IModel) => {
      const overlayInfo = parseDynamicOverlay(item.userTag);
      if (overlayInfo && overlayInfo.position && overlayInfo.targetId) {
        const targetIndex = dst.uiactionGroupDetails!.findIndex(
          (x: IModel) => x.id === overlayInfo.targetId,
        );
        if (targetIndex !== -1) {
          switch (overlayInfo.position) {
            case 'before':
              dst.uiactionGroupDetails!.splice(
                targetIndex,
                0,
                item as IUIActionGroupDetail,
              );
              break;
            case 'after':
              dst.uiactionGroupDetails!.splice(
                targetIndex + 1,
                0,
                item as IUIActionGroupDetail,
              );
              break;
            case 'replace':
              dst.uiactionGroupDetails![targetIndex] = item as IUIActionGroup;
              break;
            case 'delete':
              dst.uiactionGroupDetails!.splice(targetIndex, 1);
              break;
            default:
              dst.uiactionGroupDetails!.push(item as IUIActionGroupDetail);
              break;
          }
        } else {
          dst.uiactionGroupDetails!.push(item as IUIActionGroupDetail);
        }
      } else {
        dst.uiactionGroupDetails!.push(item as IUIActionGroupDetail);
      }
    });
  }
}
