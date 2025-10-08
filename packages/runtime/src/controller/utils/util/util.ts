/* eslint-disable no-plusplus */
/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-globals */
import { isNil } from 'ramda';
import { ControlVO } from '../../../service';

/**
 * 表单表格里判断属性的值是否发生改变
 * 如果两个值都是null，undefined，''中的一种，那么判断它为不变
 * 因为都是空
 * @author lxm
 * @date 2023-05-31 07:21:27
 * @export
 * @param {unknown} value
 * @param {unknown} value2
 * @return {*}  {boolean}
 */
export function isValueChange(value: unknown, value2: unknown): boolean {
  if ((isNil(value) || value === '') && (isNil(value2) || value2 === '')) {
    return false;
  }
  return value !== value2;
}

/**
 * 获取单条后台数据
 * 如果是数组获取第一条
 * 如果是界面VO则转换成源数据返回
 * @author lxm
 * @date 2023-08-03 10:02:27
 * @export
 * @param {(IData | ControlVO | IData[] | ControlVO[])} data
 * @return {*}  {(IData | undefined)}
 */
export function getOriginData(
  data: IData | ControlVO | IData[] | ControlVO[],
): IData | undefined {
  let singleData = Array.isArray(data) ? data[0] : data;
  if (singleData && singleData instanceof ControlVO) {
    singleData = singleData.getOrigin();
  }
  return singleData;
}

/**
 * 递归将树形数据转为一维数组
 *
 * @export
 * @param {IData[]} items 原始数据
 * @param {string} [childField='chidlren'] 存放子的属性
 */
export function getAllItems(
  items: IData[],
  childField: string = 'children',
): IData[] {
  const tempItems: IData[] = [];
  if (items && Array.isArray(items)) {
    items.forEach((item: IData) => {
      // const chidlren = [];
      tempItems.push(item);
      if (item[childField]) {
        const chidlren = getAllItems(item[childField]);
        tempItems.push(...chidlren);
      }
    });
  }
  return tempItems;
}

/**
 * 格式化分隔符
 *
 * @export
 * @param {string} type 类型--菜单 | 工具栏
 * @param {(IData[] | undefined)} items 所有项模型
 * @param {(IData | undefined)} state 所有项状态
 * @param {(IData[] | undefined)} [opts] 额外配置项（主要是针对菜单）
 * @return {*}  {string[]}
 */
export function formatSeparator(
  type: string,
  items: IData[] | undefined,
  state: IData | undefined,
  opts?: IData[] | undefined,
): string[] {
  const hideSeparator: string[] = [];
  const hideItems = getAllItems(opts || []);
  if (!items || !state) return hideSeparator;
  // 去除末尾的分隔符
  state.children?.reverse().some((_state: IData) => {
    const temp = items.find((_item: IData) => {
      return _item.id === _state.name;
    });
    if (temp && temp.itemType === 'SEPERATOR') {
      hideSeparator.push(temp.id);
      return false;
    }
    // 在额外配置项里去找，如果找到了并且额外配置表示是隐藏，则继续找下一个分隔符
    if (temp && hideItems && hideItems.length > 0) {
      const target = hideItems.find((_item: IData) => {
        return _item.key === temp.id;
      });
      if (target && !target.visible) {
        return false;
      }
    }
    return true;
  });
  state.children?.reverse();

  // 递归处理尾部和中间的连续分隔符
  const calcChildrenFormat = (children: IData[]): void => {
    children.reverse().some((child: IData) => {
      if (child.itemType === 'SEPERATOR') {
        hideSeparator.push(child.id);
        return false;
      }
      // 不是分隔符时判断当前项是否有额外配置给设置隐藏,有额外设置隐藏就相当于state.visible等于false
      if (hideItems && hideItems.length > 0) {
        const opt = hideItems.find((_item: IData) => {
          return _item.key === child.id;
        });
        if (opt && !opt.visible) {
          return false;
        }
      }
      if (state[child.id]?.visible === false) {
        return false;
      }
      return true;
    });
    children.reverse();

    // 记录上一个显示的是否是分割线
    let lastIsSeperator = false;
    children.reduce((acc: IData[], item: IData) => {
      // 还需要判断上一个是否是被额外配置隐藏了的,
      let tag = false;
      if (acc.length > 0 && hideItems && hideItems.length > 0) {
        const opt = hideItems.find((_item: IData) => {
          return _item.key === acc[acc.length - 1].id;
        });
        if (opt && !opt.visible) {
          tag = true;
        }
      }
      if (
        item.itemType === 'SEPERATOR' &&
        acc.length > 0 &&
        (acc[acc.length - 1].itemType === 'SEPERATOR' ||
          ((state[acc[acc.length - 1].id]?.visible === false || tag) &&
            lastIsSeperator))
      ) {
        hideSeparator.push(item.id);
        return acc;
      }
      // 工具栏
      if (type === 'TOOLBAR' && item.detoolbarItems) {
        calcChildrenFormat(item.detoolbarItems);
      }
      // 菜单
      if (type === 'APPMENU' && item.appMenuItems) {
        calcChildrenFormat(item.appMenuItems);
      }

      // 判断当前项是否是被额外配置隐藏了的
      let ishide = false;
      const opt = hideItems.find((_item: IData) => {
        return _item.key === item.id;
      });
      if (opt && !opt.visible) {
        ishide = true;
      }

      if (state[item.id]?.visible && !ishide) {
        if (item.itemType === 'SEPERATOR') {
          lastIsSeperator = true;
        } else {
          lastIsSeperator = false;
        }
      }
      acc.push(item);
      return acc;
    }, []);
  };

  calcChildrenFormat(items);

  return hideSeparator;
}
