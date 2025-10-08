declare type El = HTMLElement | SVGElement | null | undefined;

declare type SliderAlignment = 'left' | 'center' | 'right';

declare interface Rgba {
  r: number;
  g: number;
  b: number;
  a?: number;
}

declare interface DataOptions {
  isExpand: boolean;
  expandLabel: string;
  draggableLabel: string;
  startLabel: string;
  endLabel: string;
  dataId: string;
  children: string;
  leaf: string;
  unit: HeaderDateUnit;
  enableDateCompletion: boolean;
  isSliderDrag: boolean;
}

declare interface linkOptions {
  fromField: string;
  toField: string;
  idField: string;
  relationTypeField: string;
}

declare interface DraggableOptions {
  /**
   * 允许拖拽
   */
  draggable: boolean;

  /**
   * @param all 全部层级可以任意拖拽
   * @param current 仅可以调整当前层级内容（默认）
   */
  level?: 'all' | 'current';

  /**
   * 是否可拖拽状态字段键
   */
  draggableStateKey?: string;
}

declare interface DateRange {
  start: string | Date;
  end: string | Date;
}
