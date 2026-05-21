/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */
import {
  CustomDashboardController,
  DashboardController,
} from '@ibiz-template/runtime';
import {
  IDBContainerPortletPart,
  IDBPortletPart,
  IFlexLayout,
  IFlexLayoutPos,
  IGridLayoutPos,
} from '@ibiz/model-core';

/**
 * 模型布局
 * - 根据门户部件模型计算出的布局占位
 * @interface ModelLayoutPos
 */
interface ModelLayoutPos {
  /**
   * x 轴偏移
   *
   * @type {number}
   * @memberof ModelLayoutPos
   */
  x: number;
  /**
   * y 轴偏移
   *
   * @type {number}
   * @memberof ModelLayoutPos
   */
  y: number;
  /**
   * 宽
   *
   * @type {number}
   * @memberof ModelLayoutPos
   */
  w: number;
  /**
   * 高
   *
   * @type {number}
   * @memberof ModelLayoutPos
   */
  h: number;
  /**
   * 父容器标识
   *
   * @type {string}
   * @memberof ModelLayoutPos
   */
  parentId?: string;
  /**
   * 门户部件模型
   *
   * @type {IDBPortletPart}
   * @memberof ModelLayoutPos
   */
  model: IDBPortletPart;
}

/**
 * flex布局占位
 *
 * @interface FlexLayoutPos
 */
interface FlexLayoutPos {
  /**
   * 宽
   *
   * @type {number}
   * @memberof FlexLayoutPos
   */
  w: number;
  /**
   * x 轴偏移
   *
   * @type {number}
   * @memberof FlexLayoutPos
   */
  x: number;
  /**
   * 模型
   *
   * @type {IDBPortletPart}
   * @memberof FlexLayoutPos
   */
  model: IDBPortletPart;
}

/**
 * 计算栅格占位及偏移
 *
 * @param {IGridLayoutPos} layoutPos 栅格占位
 * @return {*}  {{
 *   span: number;
 *   offset: number;
 * }}
 */
function calcGridSpanOffset(layoutPos: IGridLayoutPos): {
  span: number;
  offset: number;
} {
  const {
    layout,
    colXS,
    colSM,
    colMD,
    colLG,
    colXSOffset,
    colSMOffset,
    colMDOffset,
    colLGOffset,
  } = layoutPos;
  const _span = colLG || colMD || colSM || colXS;
  const _offset = colLGOffset || colMDOffset || colSMOffset || colXSOffset;
  const spanDefault = layout === 'TABLE_24COL' ? 24 : 12;
  const span = !_span || _span === -1 ? 1 : _span / spanDefault;
  const offset = !_offset || _offset === -1 ? 0 : _offset / spanDefault;
  return { span, offset };
}

/**
 * 计算XY的偏移量
 *
 * @param {IData[]} items 同一容器下的门户部件
 * @param {{ w: number; x: number }} parentPos 父容器的占位
 * @return {*}
 */
function calculateXYPositions(
  items: IData[],
  parentPos: { w: number; x: number },
): void {
  // 当前行的总宽度
  let currentRowWidth = 0;
  // 当前行的 y 偏移量
  let currentY: number = 0;
  // 当前行的最大高度
  let currentRowHeight: number = 0;

  // 先按顺序计算相对父容器的 x,y 偏移量
  items.forEach(item => {
    // 如果当前行宽度加当前元素的 (x + w) 超过总宽，则换行
    if (currentRowWidth + item.x + item.w > parentPos.w) {
      // 增加 y 偏移量
      currentY += currentRowHeight;
      // 重置当前行宽度
      currentRowWidth = 0;
      // 重置当前行的高度
      currentRowHeight = 0;
    }

    // 设置当前元素的 x 和 y 值
    item.x = currentRowWidth + item.x;
    item.y = currentY;

    // 更新行宽和行高
    currentRowWidth += item.x + item.w - currentRowWidth;
    currentRowHeight = Math.max(currentRowHeight, item.h);
  });

  // 附加父容器的偏移
  items.forEach(item => {
    item.x += parentPos.x;
  });
}

/**
 * 计算flex占位
 *
 * @param {IDBPortletPart[]} models
 * @param {{ w: number; x: number }} parentPos
 * @return {*}
 */
function calculatePositions(
  items: IDBPortletPart[],
  parentPos: { w: number; x: number; layout: IFlexLayout },
): FlexLayoutPos[] {
  // FLEX布局 w 只能算大致的布局
  const { dir, align, valign } = parentPos.layout;
  const flexLayoutPos: FlexLayoutPos[] = [];
  // 水平居右或者从下往上垂直排列 反转子数据顺序
  const models = dir?.includes('reverse') ? items.toReversed() : items;
  // 水平排列
  if (dir?.includes('row')) {
    // 假设每个都是自适应的宽
    const W = parseFloat((parentPos.w / models.length).toFixed(1));
    // 已知宽度的总和
    let widthSum = 0;
    // 自适应数量
    let growCount = 0;
    // 非自适应数量
    let shrinkCont = 0;
    // 遍历对象数组，计算固定宽度总和和 grow 元素数量
    models.forEach(model => {
      const { grow, width } = model.layoutPos as IFlexLayoutPos;
      // 统计 grow 的数量
      if (grow || !width) {
        growCount++;
      } else {
        shrinkCont++;
        widthSum += parseFloat((width / 100).toFixed(1));
      }
    });

    // 计算固定宽度
    const fixedWidthSum = widthSum > W * shrinkCont ? W * shrinkCont : widthSum;

    // 计算剩余宽度
    const remainingWidth = parentPos.w - fixedWidthSum;

    // 分配剩余宽度到 grow 元素
    const growWidth = growCount > 0 ? remainingWidth / growCount : 0;

    // 计算每个元素的 w 和 x
    models.forEach(model => {
      const { grow, width } = model.layoutPos as IFlexLayoutPos;
      flexLayoutPos.push({
        x: 0,
        model,
        w: grow || !width ? growWidth : parseFloat((width / 100).toFixed(1)),
      });
    });

    const flexW = flexLayoutPos.reduce((sum, element) => sum + element.w, 0);
    const poorW = parentPos.w - flexW;
    // 根据水平对齐方式计算偏移量
    switch (align) {
      case 'flex-start':
        if (dir === 'row-reverse') {
          flexLayoutPos[0].x = poorW;
        }
        break;
      case 'flex-end':
        if (dir === 'row') {
          flexLayoutPos[0].x = poorW;
        }
        break;
      case 'center':
        if (poorW) {
          flexLayoutPos[0].x = poorW / 2;
        }
        break;
      case 'space-between':
        if (poorW && flexLayoutPos.length > 1) {
          const x = poorW / (flexLayoutPos.length - 1);
          flexLayoutPos.forEach((f, index) => {
            if (index !== 0) {
              f.x = x;
            }
          });
        }
        break;
      case 'space-around':
        if (poorW) {
          const x = poorW / (flexLayoutPos.length * 2);
          flexLayoutPos.forEach((f, index) => {
            if (index === 0) {
              f.x = x;
            } else {
              f.x = x * 2;
            }
          });
        }
        break;
      default:
        break;
    }
  }
  // 竖直排列
  if (dir?.includes('column')) {
    models.forEach(model => {
      const { width } = model.layoutPos as IFlexLayoutPos;
      let x = 0;
      let w = parentPos.w;
      if (width) {
        w =
          width / 100 > 1 && width / 100 < parentPos.w
            ? width / 100
            : parentPos.w;
      }
      const poorW = parentPos.w - w;
      switch (valign) {
        case 'flex-end':
          x = poorW;
          break;
        case 'center':
          if (poorW) {
            x = (parentPos.w - w) / 2;
          }
          break;
        default:
          break;
      }
      flexLayoutPos.push({
        x,
        w,
        model,
      });
    });
  }
  return flexLayoutPos;
}

/**
 * 加载默认模型布局
 *
 * @export
 * @param {DashboardController} dashboard
 * @param {CustomDashboardController} customDashboard
 * @return {*}  {IData[]}
 */
export function loadDefaultLayoutModel(
  dashboard: DashboardController,
  customDashboard: CustomDashboardController,
): IData[] {
  const { layoutRowH, layoutColNum } = customDashboard;

  const app = ibiz.hub.getApp(dashboard.model.appId);

  /**
   * 递归门户部件
   *
   * @param {IDBContainerPortletPart} container 容器
   * @param {{ w: number; x: number }} parentPos 父占位
   * @return {*}  {ModelLayoutPos[]}
   */
  const recursivePortlePart = (
    container: IDBContainerPortletPart,
    parentPos: { w: number; x: number },
  ): ModelLayoutPos[] => {
    const { controls, layout } = container;
    // 当前容器中的门户部件模型
    const children: IDBPortletPart[] =
      (controls as IDBPortletPart[])?.filter(child => !!child.layoutPos) || [];
    // 当前容器中门户部件布局占位
    const portletLayoutPos: ModelLayoutPos[] = [];
    // 子项容器所有的门户部件布局占位
    const childrenLayoutPos: ModelLayoutPos[] = [];

    // 栅格布局
    if (layout?.layout === 'TABLE_24COL' || layout?.layout === 'TABLE_12COL') {
      children.forEach(model => {
        const { height } = model.layoutPos!;
        const { span, offset } = calcGridSpanOffset(model.layoutPos!);
        // 当前元素的宽和偏移(相对容器的)
        const w = span * parentPos.w;
        const x = offset * parentPos.w;
        let h = height ? height / layoutRowH : 3;
        if (model.portletType === 'CONTAINER' && model.controls?.length) {
          // 如果是容器需要根据子项计算高度
          const _childrenLayoutPos = recursivePortlePart(model, { w, x });
          // 使用子项容器中 y+h的最大值作为容器的高度
          h = _childrenLayoutPos.reduce((max, current) => {
            return Math.max(max, current.y + current.h);
          }, -Infinity);
          childrenLayoutPos.push(..._childrenLayoutPos);
        }
        portletLayoutPos.push({
          w,
          x,
          h,
          y: 0,
          model,
          parentId: container.codeName,
        });
      });
    } else if (layout?.layout === 'FLEX') {
      // 计算flex项占位
      const flexLayoutPos = calculatePositions(children, {
        ...parentPos,
        layout,
      });
      flexLayoutPos.forEach(pos => {
        const { x, w, model } = pos;
        const { height } = model.layoutPos!;
        let h = height ? height / layoutRowH : 3;
        if (model.portletType === 'CONTAINER' && model.controls?.length) {
          // 如果是容器需要根据子项计算高度
          const _childrenLayoutPos = recursivePortlePart(model, { w, x });
          // 使用子项容器中 y+h的最大值作为容器的高度
          h = _childrenLayoutPos.reduce((max, current) => {
            return Math.max(max, current.y + current.h);
          }, -Infinity);
          childrenLayoutPos.push(..._childrenLayoutPos);
        }
        portletLayoutPos.push({
          w,
          x,
          h,
          y: 0,
          model,
          parentId: container.codeName,
        });
      });
    }

    // 先计算相对于当前容器的门户部件布局占位 x,y偏移
    calculateXYPositions(portletLayoutPos, parentPos);
    // 再将子项容器的偏移附加到子项容器门户部件中
    portletLayoutPos.forEach(layoutPos => {
      if (layoutPos.model.portletType === 'CONTAINER') {
        const _children = childrenLayoutPos.filter(
          child => child.parentId === layoutPos.model.codeName,
        );
        _children.forEach(child => {
          child.x += layoutPos.x;
          child.y += layoutPos.y;
        });
      }
    });

    // 当前容器所有可设计呈现的门户部件布局占位
    const modelLayoutPos = portletLayoutPos.filter(
      layoutPos =>
        !['CONTAINER', 'RAWITEM'].includes(layoutPos.model.portletType!),
    );

    // 添加子容器门户部件
    modelLayoutPos.push(...childrenLayoutPos);
    return modelLayoutPos;
  };

  const layoutModel: IData[] = [];
  if (dashboard.model.controls?.length) {
    // 递归计算每个门户部件的位置信息
    const modelLayoutPos = recursivePortlePart(dashboard.model, {
      x: 0,
      w: layoutColNum,
    });
    // 将门户部件模型布局占位转为设计区所需数据结构
    modelLayoutPos.forEach(layout => {
      const { x, y, w, h, model } = layout;
      layoutModel.push({
        x,
        y,
        w,
        h,
        i: model.codeName,
        appName: app.model.name!,
        portletName: model.title,
        portletImage: model.sysImage,
        portletCodeName: model.codeName,
        appCodeName: model.appDataEntityId || app.model.pkgcodeName!,
      });
    });
  }

  return layoutModel;
}
