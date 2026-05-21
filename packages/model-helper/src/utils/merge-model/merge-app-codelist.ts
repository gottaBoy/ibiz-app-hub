import { IAppCodeList } from '@ibiz/model-core';

/**
 * 合并应用代码表,子应用代码表需开启支持动态模式和配置用户标记，合并规则：dynamic_overlay:replace|merge,replace表示子应用代码表完全覆盖主应用代码表，merge表示子应用代码表项合并到主应用代码表项中（前提条件：主应用代码表和子应用代码表均是静态代码表），其他情况不做处理
 * @param mainCodeList - 主应用代码表
 * @param subCodeList - 子应用代码表
 */
export function mergeAppCodeList(
  mainCodeList: IAppCodeList,
  subCodeList: IAppCodeList,
): void {
  const { userTag } = subCodeList as IModel;
  if (!userTag) return;
  const [mergeTag, mergeWay] = userTag.split(':');
  if (
    !mergeTag ||
    !mergeWay ||
    mergeTag !== 'dynamic_overlay' ||
    (mergeWay !== 'replace' && mergeWay !== 'merge')
  )
    return;
  switch (mergeWay) {
    case 'replace':
      mainCodeList = subCodeList;
      break;
    case 'merge':
      if (
        mainCodeList.codeListType === 'STATIC' &&
        subCodeList.codeListType === 'STATIC'
      ) {
        if (!mainCodeList.codeItems) mainCodeList.codeItems = [];
        if (subCodeList.codeItems && subCodeList.codeItems.length > 0) {
          subCodeList.codeItems.forEach(codeItem => {
            mainCodeList.codeItems!.push(codeItem);
          });
        }
      }
      break;
    default:
      break;
  }
}
