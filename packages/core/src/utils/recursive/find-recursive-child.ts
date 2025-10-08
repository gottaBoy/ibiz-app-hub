/* eslint-disable @typescript-eslint/no-explicit-any */
import { mergeDeepRight } from 'ramda';

/** 默认配置参数 */
const IterateOpts = {
  /** 子集合属性数组 */
  childrenFields: ['children'],
};

const BreakError = new Error('中断操作');
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
 * @description 获取子属性对象
 * @param {IData} parent
 * @param {string[]} fields
 * @returns {*}  {(IData[] | undefined)}
 */
function getChildFieldObj(
  parent: IData,
  fields: string[],
): IData[] | undefined {
  for (const field of fields) {
    if (parent[field]) {
      return parent[field];
    }
  }
}

function _recursiveIterate(
  parent: IData,
  callback: (item: any, _parent?: any) => boolean | void,
  opts?: Partial<typeof IterateOpts>,
): void {
  const { childrenFields } = mergeDeepRight(IterateOpts, opts || {});
  const children = getChildField(parent, childrenFields);
  if (children?.length) {
    for (const child of children) {
      // 递归自身的子成员
      const isBreak = callback(child, parent);
      // 如果回调返回true则退出
      if (isBreak) {
        throw BreakError;
      }

      // 递归孙的成员
      recursiveIterate(child, callback, opts);
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
  try {
    _recursiveIterate(parent, callback, opts);
  } catch (error) {
    if (error !== BreakError) {
      throw error;
    }
  }
}

/**
 * @description 递归执行，处理对象结构
 * @export
 * @param {IData} parent
 * @param {((item: any, _parent?: any) => boolean | void)} callback
 * @param {Partial<typeof IterateOpts>} [opts]
 */
export function _recursiveExecute(
  parent: IData,
  callback: (item: any, _parent?: any) => boolean | void,
  opts?: Partial<typeof IterateOpts>,
): void {
  const { childrenFields } = mergeDeepRight(IterateOpts, opts || {});
  const children = getChildFieldObj(parent, childrenFields);
  if (children) {
    for (const child of Object.values(children)) {
      const isBreak = callback(child, parent);
      // 如果回调返回true则退出
      if (isBreak) {
        throw BreakError;
      }
      // 递归孙的成员
      _recursiveExecute(child, callback, opts);
    }
  }
}

/**
 * @description 递归执行，处理对象结构
 * @export
 * @param {IData} parent
 * @param {((item: any, _parent: any) => boolean | void)} callback
 * @param {Partial<typeof IterateOpts>} [opts]
 */
export function recursiveExecute(
  parent: IData,
  callback: (item: any, _parent: any) => boolean | void,
  opts?: Partial<typeof IterateOpts>,
): void {
  try {
    _recursiveExecute(parent, callback, opts);
  } catch (error) {
    if (error !== BreakError) {
      throw error;
    }
  }
}

/** 默认配置参数 */
const CompareOpts = {
  ...IterateOpts,
  /** 比较的属性 */
  compareField: 'name',
};

type ICompareOpts = Partial<typeof CompareOpts> & {
  /**
   * 自定义比较回调
   * @author lxm
   * @date 2023-04-23 09:06:42
   */
  compareCallback?: (
    child: IData,
    key: string,
    compareField: string,
  ) => boolean;
};

/**
 * @description 递归查找子元素，递归查找子元素 用法：传入数组和查找条件 返回值匹配的子元素或undefined
 * @example
 * ```
 *  const parent = {
 *      name: 'parent',
 *      children: [
 *          {
 *              name: 'child1',
 *              children: [{ name: 'grandchild1' }, { name: 'grandchild2' }],
 *          },
 *          { name: 'child2', children: [{ name: 'grandchild3' }] },
 *      ],
 *  };
 *
 *  const result = findRecursiveChild(parent, 'child1');
 *
 *  result // => { name: 'child1', children: [{ name: 'grandchild1' }, { name: 'grandchild2' }] }
 * ```
 * @export
 * @param {IData} parent 父对象
 * @param {string} key 子元素的比较属性的值
 * @param {ICompareOpts} [opts]
 * @return {*}  {(IData | undefined)}
 */
export function findRecursiveChild(
  parent: IData,
  key: string,
  opts?: ICompareOpts,
): IData | undefined {
  const { compareField, compareCallback } = mergeDeepRight(
    CompareOpts,
    opts || {},
  );

  // 默认比较方法
  const _compareCallback =
    compareCallback ||
    ((child: IData): boolean => {
      return child[compareField] === key;
    });

  // 递归遍历，找到后中断遍历，返回找到项
  let find;
  recursiveIterate(
    parent,
    item => {
      if (_compareCallback(item, key, compareField)) {
        find = item;
        return true;
      }
    },
    opts,
  );
  return find;
}
