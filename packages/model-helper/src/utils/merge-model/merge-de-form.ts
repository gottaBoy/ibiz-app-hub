/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDEForm } from '@ibiz/model-core';
import { mergeDeepRight } from 'ramda';

// 表单子属性集合(常量)
const CHILDRENFIELDS: string[] = [
  'deformPages',
  'deformTabPages',
  'deformDetails',
];

/** 默认配置参数 */
const IterateOpts = {
  /** 子集合属性数组 */
  childrenFields: ['children'],
};

/**
 * @description 获取表单成员匹配属性标识
 * @param {IModel} model 指定模型数据
 * @param {string[]} fields 属性集合
 * @returns {*}  {(string | undefined)}
 */
function getFormDetailMatchField(
  model: IModel,
  fields: string[],
): string | undefined {
  for (const field of fields) {
    if (model[field]?.length) {
      return field;
    }
  }
}

/**
 * @description 获取子属性集合
 * @param {IData} parent
 * @param {string[]} fields 子集合可能的属性名称
 * @returns {*}  {(IData[] | undefined)}
 */
function getChildField(parent: IData, fields: string[]): IData[] | undefined {
  for (const field of fields) {
    if (parent[field]?.length) {
      return parent[field];
    }
  }
}

/**
 * @description 递归遍历子元素，递归遍历子元素 用法：传入数组和回调函数 无返回值
 * @example
 * ```
 * const parent = {
 *       name: 'parent',
 *       children: [
 *           {
 *               name: 'child1',
 *               children: [{ name: 'grandchild1' }, { name: 'grandchild2' }],
 *           },
 *           { name: 'child2', children: [{ name: 'grandchild3' }] },
 *       ],
 *    };
 *
 * const result: string[] = [];
 *
 * recursiveIterate(parent, item => {
 *     result.push(item.name);
 * });
 *
 * result // => ['child1', 'grandchild1', 'grandchild2', 'child2', 'grandchild3']
 * ```
 * @export
 * @param {IData} parent 父元素
 * @param {(item: any) => boolean} callback 每一个子元素的回调
 * @param {Partial<typeof IterateOpts>} [opts]
 */
export function recursiveIterate(
  parent: IData,
  callback: (item: any, _parent: any) => boolean | void,
  opts?: Partial<typeof IterateOpts>,
): void {
  const { childrenFields } = mergeDeepRight(IterateOpts, opts || {});
  const children = getChildField(parent, childrenFields);
  if (children?.length) {
    for (const child of children) {
      // 递归自身的子成员
      const isBreak = callback(child, parent);
      // 如果回调返回true则不循环子数据
      if (!isBreak) {
        recursiveIterate(child, callback, opts);
      }
    }
  }
}

/**
 * @description  计算子应用表单合并项（仅合并类型为用户标记为dynamic_overlay:before|after|inside|replace:formitemname）
 * @param {IDEForm} src 子应用表单模型
 * @returns {*}  {Map<string, IData>} key值为关联主表单项标识；value为{position:before|after|inside|replace,model:IModel}对象
 */
function computeSubAppFormItems(src: IDEForm): Map<string, IData> {
  const subAppMergeItemsMap: Map<string, IData[]> = new Map();
  recursiveIterate(
    src,
    (item: IModel, parent: IModel) => {
      // 用户标记为dynamic_overlay：开始的才识别为需覆盖到主应用表单
      if (
        item.userTag &&
        item.userTag.startsWith('dynamic_overlay:') &&
        item.userTag.split(':').length === 3
      ) {
        // before|after|inside|replace + ':formitemname' 定义附加位置
        const tags = item.userTag.split(':');
        if (tags[1] && tags[2]) {
          if (!subAppMergeItemsMap.get(tags[2])) {
            subAppMergeItemsMap.set(tags[2], []);
          }
          const tempItem: IData = {
            position: tags[1],
            model: item,
            // 定义当前项是否已经被合并
            merge: false,
          };
          const targetMergeArray = subAppMergeItemsMap.get(tags[2]);
          targetMergeArray!.push(tempItem);
        }
        // 退出当前子的循环,父已经合并，无需管子的合并
        return true;
      }
    },
    {
      childrenFields: CHILDRENFIELDS,
    },
  );
  return subAppMergeItemsMap;
}

/**
 * @description 合并指定表单成员到主表表单指定位置
 * @param {IModel} item 当前表单成员
 * @param {IModel} parent 当前表单成员父成员
 * @param {IData} mergeItem 子应用表单合并项
 * @returns {*}  {void}
 */
function mergeSubAppFormItemToDst(
  item: IModel,
  parent: IModel,
  mergeItem: IData,
): void {
  const { position, model } = mergeItem;
  const formMatchField = getFormDetailMatchField(parent, CHILDRENFIELDS);
  if (!formMatchField) return;
  const curIndex = parent[formMatchField].findIndex((parentItem: IModel) => {
    return parentItem.codeName === item.codeName;
  });
  switch (position) {
    // 附加至目标之前(before)
    case 'before':
      if (curIndex !== -1) {
        parent[formMatchField].splice(curIndex, 0, model);
      } else {
        parent[formMatchField].push(model);
      }
      break;
    // 附加至目标内部(inside)
    case 'inside':
      const itemMatchField = getFormDetailMatchField(item, CHILDRENFIELDS);
      if (itemMatchField) {
        item[itemMatchField].push(model);
      }
      break;
    // 替换目标(replace)
    case 'replace':
      if (curIndex !== -1) {
        parent[formMatchField].splice(curIndex, 1, model);
      }
      break;
    // 附加至目标之后(after)
    case 'after':
      if (curIndex !== -1) {
        parent[formMatchField].splice(curIndex + 1, 0, model);
      }
      break;
    // 附加至目标之后(默认)
    default:
      if (curIndex !== -1) {
        parent[formMatchField].splice(curIndex + 1, 0, model);
      }
      break;
  }
  // 标记当前项已被合并
  mergeItem.merge = true;
}

/**
 * @description 合并子应用表单表单项
 * @param {IDEForm} dst 目标表单模型
 * @param {Map<string, IData>} subAppMergeItems 子应用需合并项数据
 * @returns {*}  {void}
 */
function mergeSubAppFormItems(
  dst: IDEForm,
  subAppMergeItems: Map<string, IData>,
): void {
  if (!dst || !subAppMergeItems) return;
  if (subAppMergeItems.size === 0) return;
  recursiveIterate(
    dst,
    (item: IModel, parent: IModel) => {
      // 通过关联主表单项标识进行合并
      const mergeItems = subAppMergeItems.get(item.codeName);
      if (mergeItems && mergeItems.length > 0) {
        mergeItems.forEach((mergeItem: IData) => {
          // 判断当前项是否已经被合并，若已经被合并则不再处理
          if (!mergeItem.merge) {
            mergeSubAppFormItemToDst(item, parent, mergeItem);
          }
        });
      }
    },
    {
      childrenFields: CHILDRENFIELDS,
    },
  );
  // 矫正合并后主表单模型数据
  if (dst.deformPages && dst.deformPages.length > 1) {
    dst.noTabHeader = false;
  } else {
    dst.noTabHeader = true;
  }
}

/**
 * @description 合并子应用表单
 * @export
 * @param {(IDEForm | undefined)} dst 主应用表单模型
 * @param {(IDEForm | undefined)} src 子应用表单模型
 * @returns {*}  {void}
 */
export function mergeAppDEForm(
  dst: IDEForm | undefined,
  src: IDEForm | undefined,
): void {
  if (!dst || !src) return;
  const subAppMergeItems = computeSubAppFormItems(src);
  if (subAppMergeItems.size === 0) return;
  mergeSubAppFormItems(dst, subAppMergeItems);
}

/**
 * 获取存在基于数据关系部件构建的分页部件的数据关系标识
 * @param form 表单模型
 * @returns 数据关系标识集合
 */
export function getFormdataRelationTags(form: IDEForm | undefined): string[] {
  const dataRelationTags: string[] = [];
  if (!form) return dataRelationTags;
  recursiveIterate(
    form,
    (item: IModel) => {
      if (item.detailType === 'TABPANEL' && item.dataRelationTag) {
        dataRelationTags.push(item.dataRelationTag);
      }
    },
    {
      childrenFields: CHILDRENFIELDS,
    },
  );
  return dataRelationTags;
}

/**
 * @description 合并存在数据关系标识的表单分页部件，子应用表单codename和主应用表单表单分页部件数据关系标识相同
 * @export
 * @param {string} dataRelationTag 数据关系标识
 * @param {(IDEForm | undefined)} dst 主应用表单模型
 * @param {(IDEForm | undefined)} src 子应用表单模型
 * @returns {*}  {void}
 */
export function mergeFormDRTabpanel(
  dataRelationTag: string,
  dst: IDEForm | undefined,
  src: IDEForm | undefined,
): void {
  if (!dataRelationTag || !dst || !src) return;
  // 基于数据标识获取子应用表单分页部件
  let srcTabpanel: IModel | undefined;
  recursiveIterate(
    src,
    (item: IModel) => {
      if (
        item.detailType === 'TABPANEL' &&
        item.dataRelationTag === dataRelationTag
      ) {
        srcTabpanel = item;
        return true;
      }
    },
    {
      childrenFields: CHILDRENFIELDS,
    },
  );
  // 将子应用表单分页部件合并到主应用表单分页部件中
  if (srcTabpanel) {
    recursiveIterate(
      dst,
      (item: IModel) => {
        if (
          item.detailType === 'TABPANEL' &&
          item.dataRelationTag === dataRelationTag
        ) {
          const detailName = getFormDetailMatchField(item, CHILDRENFIELDS);
          if (detailName && item[detailName] && srcTabpanel![detailName]) {
            item[detailName].push(...srcTabpanel![detailName]);
            return true;
          }
        }
      },
      {
        childrenFields: CHILDRENFIELDS,
      },
    );
  }
}
