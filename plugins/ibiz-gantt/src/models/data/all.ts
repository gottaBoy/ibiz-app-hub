import { isArray } from 'lodash';
import Variables from '@/constants/vars';
import { DropType } from '@/typings/drop';
import { type XDate } from '../param/date';
import RowItem from './row';

export default class AllData {
  /**
   * 数据索引生成
   */
  UID = 0;

  /**
   * 原始数据集合
   */
  originData: any[] = [];

  /**
   * 内部使用代理数据
   */
  data: RowItem[] = [];

  /**
   * 展平后的代理数据，渲染用
   */
  flatData: RowItem[] = [];

  /**
   * 整体最开始的日期
   */
  start?: XDate;

  /**
   * 整体最末尾的日期
   */
  end?: XDate;

  /**
   * 整体数据结构的层级数量
   */
  __level: number = 0;

  /**
   * 数据配置
   *
   * @type {DataOptions}
   * @memberof AllData
   */
  options: DataOptions = {
    isExpand: false,
    expandLabel: '',
    draggableLabel: '',
    startLabel: Variables.default.startKey,
    endLabel: Variables.default.endKey,
    dataId: Variables.default.idKey,
    children: Variables.default.children,
    leaf: Variables.default.leaf,
    unit: 'day',
    enableDateCompletion: false,
    isSliderDrag: false,
  };

  /**
   * 整体数据结构的层级数量
   */
  get level() {
    // 层级从 0 计算，返回时 + 1
    return this.__level + 1;
  }

  /**
   * 数据的长度（包含子级时，为展平长度）
   */
  get length() {
    return this.flatData.length;
  }

  /**
   * 初始化数据
   */
  init(data: any[], options: DataOptions) {
    this.originData = data;
    this.options = options;
    this.data = this.createData(data, [], options);
    this.__flatten();
  }

  /**
   * 创建结构化代理数据
   * @param data 原始数据
   * @param parentPath 父级路径
   * @param options 属性
   * @param level 层级
   * @param parentNode 父节点
   * @returns
   */
  private createData(
    data: any[],
    parentPath: number[],
    options: DataOptions,
    level = 0,
    parentNode: RowItem | null = null,
  ) {
    const r = [];
    for (let i = 0; i < data.length; i++) {
      r.push(
        this.__createRow(data[i], i, parentPath, level, parentNode, options),
      );
    }

    return r;
  }

  /**
   * 创建每一行的结构化代理数据
   * @param item 原始数据
   * @param index 当前层级索引
   * @param parentPath 父级路径
   * @param level 层级
   * @param parentNode 父节点
   * @param options 属性
   * @returns
   */
  private __createRow(
    item: any,
    index: number,
    parentPath: number[],
    level: number,
    parentNode: RowItem | null,
    options: DataOptions,
  ) {
    const row = new RowItem();
    row.init(item, options, index, level, parentPath, parentNode);

    // 更新两头的日期
    this.__updateDate(row);

    // 拼接路径
    const p = [...parentPath, index];
    if (
      isArray(item[options.children!]) &&
      item[options.children!].length > 0
    ) {
      row.children = this.createData(
        item[options.children!],
        p,
        options,
        level + 1,
        row,
      );
    }

    // 计算层级数量
    this.__level = Math.max(this.__level, level);

    return row;
  }

  /**
   * 更新平铺数据
   */
  updateFlatData() {
    this.__flatten();
  }

  /**
   * 数据全部展开/闭合
   */
  updateExpand(expand: boolean) {
    const fn = (data: RowItem[]) => {
      data.forEach(row => {
        row.setExpand(expand);

        if (row.children?.length > 0) {
          fn(row.children);
        }
      });
    };

    fn(this.data);

    this.__flatten();
  }

  /**
   * 更新数据
   * @param data 新数据（原始）
   * @param options 属性
   */
  update(data: any[], options: DataOptions) {
    this.__level = 0;
    this.start = undefined;
    this.end = undefined;
    this.originData = data;
    this.__diff(this.data, data, options);
    this.__flatten();
  }

  /**
   * 更新所有数据内options的时间单位
   *
   * @param {HeaderDateUnit} _unit
   * @memberof AllData
   */
  updateDateUnit(_unit: HeaderDateUnit): void {
    this.options.unit = _unit;
    const allDateUnitUpdate = (data: RowItem[]) => {
      data.forEach(item => {
        item.updateUnit(_unit);
        if (item?.children?.length) {
          allDateUnitUpdate(item.children);
        }
      });
    };
    allDateUnitUpdate(this.data);
  }

  /**
   * 更新数据算法
   * @param data 现有的结构化代理数据
   * @param news 新数据
   * @param options 属性
   * @param parentNode 父节点
   */
  private __diff(
    data: RowItem[],
    news: any[],
    options: DataOptions,
    parentNode: RowItem | null = null,
  ) {
    let i = 0;
    while (i < news.length) {
      if (i < data.length && !data[i].isSame(news[i])) {
        if (i + 1 < data.length && data[i + 1].isSame(news[i])) {
          // 删除一个
          data.splice(i, 1);
        } else {
          const row = this.__createRow(
            news[i],
            i,
            data[i].parentPath,
            data[i].level,
            data[i].parentNode,
            options,
          );

          if (i + 1 < news.length && data[i].isSame(news[i + 1])) {
            // 插入一个
            data.splice(i, 0, row);
          } else {
            // 替换当前(替换时如果数据是之前那条需要保留展开状态)
            if (row.id === data[i].id) {
              row.setExpand(data[i].isExpand);
            }
            data.splice(i, 1, row);
          }
        }
      }

      // 新节点超出了原有节点，直接创建新节点
      if (data[i] === undefined) {
        const row = this.__createRow(
          news[i],
          i,
          parentNode ? [...parentNode.parentPath, parentNode.index] : [],
          parentNode ? parentNode.level + 1 : 0,
          parentNode,
          options,
        );
        data.splice(i, 1, row);
      }

      // 递归子层
      if (news[i][options.children!]) {
        this.__diff(
          data[i].children,
          news[i][options.children!],
          options,
          data[i],
        );
      }

      // 更新数据时补全时分秒
      const _item = data[i];
      if (this.options.enableDateCompletion && _item && !options.isSliderDrag) {
        const { startDate, endDate } = _item.getStartOrEnd();
        if (startDate)
          _item.data[_item.options.startLabel] =
            _item.onStartDateCompletion(startDate);
        if (endDate)
          _item.data[_item.options.endLabel] = _item.onEndDateCompletion(
            endDate,
            !startDate ? 'day' : undefined,
          );
      }

      // 更新两头的日期
      this.__updateDate(data[i]);

      i++;
    }

    // 如果循环完成，后面还有旧数据，全部删除即可
    if (data[i]) {
      data.splice(i, data.length);
    }
  }

  /**
   * 更新起止时间
   */
  private __updateDate(row: RowItem) {
    if (!this.start || row.start.compareTo(this.start) === 'l') {
      this.start = row.start;
    }

    if (!this.end || row.end.compareTo(this.end) === 'r') {
      this.end = row.end;
    }
  }

  private __flatten() {
    this.flatData = [];
    let index = 0;

    const fn = (data: RowItem[]) => {
      for (let i = 0; i < data.length; i++) {
        data[i].flatIndex = index++;
        this.flatData.push(data[i]);

        if (data[i].isExpand && isArray(data[i].children)) {
          fn(data[i].children);
        }
      }
    };

    fn(this.data);
  }

  /**
   * 拖拽
   * 根据拖放类型 dropType 放在指定位置
   */
  draggable(dragging: RowItem, drop: RowItem, dropType: DropType) {
    if (
      dragging.include(drop) ||
      drop.include(dragging) ||
      dropType === 'none'
    ) {
      return false;
    }

    const getCurData = (path: number[]) => {
      const result = {
        data: this.data,
        originData: this.originData,
      };
      if (path.length) {
        let currentData = this.data[path[0]].children;
        let currentOriginData = this.originData[path[0]][this.options.children];

        for (let i = 1; i < path.length; i++) {
          const index = path[i];
          currentData = currentData[index].children;
          currentOriginData = currentOriginData[index][this.options.children];
        }
        result.data = currentData;
        result.originData = currentOriginData;
      }
      return result;
    };

    const { data: dragRow, originData: dragData } = getCurData(
      dragging.parentPath,
    );

    const { data: dropRow, originData: dropData } = getCurData(drop.parentPath);

    const oldIndex = dragRow.findIndex(it => it.id === dragging.id);
    const newIndex = dropRow.findIndex(it => it.id === drop.id);
    const moveIndex = dropType === 'after' ? newIndex + 1 : newIndex;
    // 先从原来的地方移除
    const dragItem = dragData.splice(oldIndex, 1)[0];
    // 插入
    if (dropType === 'inner') {
      if (!dropData[moveIndex][this.options.children]) {
        dropData[moveIndex][this.options.children] = [];
        dropData[moveIndex][this.options.leaf] = true;
      }
      dropData[moveIndex][this.options.children].push(dragItem);
    } else {
      // 移动
      dropData.splice(moveIndex, 0, dragItem);
    }
    return true;
  }

  /**
   * 交换两个数据的顺序，包括修改原始数据顺序
   */
  swap(a: RowItem, b: RowItem) {
    if (a.include(b) || b.include(a)) {
      return false;
    }

    const aIndex = this.data.findIndex(item => item.id === a.id);
    const bIndex = this.data.findIndex(item => item.id === b.id);

    if (~aIndex && ~bIndex && a.level === b.level) {
      this.originData.splice(aIndex, 1, b.data);
      this.originData.splice(bIndex, 1, a.data);
    } else {
      const _s = (a: RowItem, b: RowItem, oIndex: number) => {
        const parent = a.parentNode;
        const path = a.parentPath;

        if (!parent) {
          // 根级，直接交换
          this.originData.splice(oIndex, 1, b.data);
        } else {
          // 不是根级，需要找到位置
          // a.parentPath 记录了 a 相对于 this.originData 的位置，它是一个索引数组，然后通过 index 找到当前位置
          let currentData = this.data[path[0]].children;
          let currentOriginData =
            this.originData[path[0]][this.options.children];

          for (let i = 1; i < path.length; i++) {
            const index = path[i];
            currentData = currentData[index].children;
            currentOriginData = currentOriginData[index][this.options.children];
          }

          const idx = currentData.findIndex(it => it.id === a.id);
          if (!~idx) return false;

          currentOriginData.splice(idx, 1, b.data);
        }
      };

      _s(a, b, aIndex);
      _s(b, a, bIndex);
    }

    return true;
  }
}
