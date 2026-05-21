<template>
  <div
    ref="sliderRef"
    :class="['xg-slider', { 'xg-slider-drag': canMove }, `xg-slider-level${props.data ? props.data?.level : ''}`, ...classNames]"
    :style="{
      left: `${sliderLeft}px`,
      width: `${sliderWidth}px`,
      maxHeight: `${$styleBox.rowHeight}px`,
      height: height,
      top:
        height === '100%' ||
        (!/%$/.test(height) && parseFloat(height) >= $styleBox.rowHeight)
          ? 0
          : `calc(calc(100% - ${height}) / 2)`
    }"
    @click.stop
    @pointerup="onPointerUp"
  >
    <!-- 创建开始连线的按钮 -->
    <div
      v-if="props.allowLink"
      ref="startAnchorRef"
      :class="[
        'xg-slider-anchor',
        'start-anchor',
        {
          'xg-slider-anchor__show': $param.hoverItem?.uuid === props.data?.uuid
        }
      ]"
      :style="{ borderColor: bgColor }"
      @pointerdown="onStartAnchorDown"
    ></div>

    <div class="xg-slider-block">
      <!-- 滑块主体 -->
      <slot
        v-if="isValidSlots(slots.content, props.data)"
        name="content"
        v-bind="toSliderData(sliderLeft, ganttHeader, props.data)"
      />
      <div
        v-else
        class="xg-slider-content"
        :style="{ backgroundColor: bgColor }"
      >
        <slot
          v-if="isValidSlots(slots.default, props.data)"
          v-bind="toRowData(props.data)"
        />

        <div
          v-else-if="props.prop || props.label"
          class="slider-text"
          :style="{ 'justify-content': props.alignment }"
        >
          {{
            props.dateFormat
              ? day(originData).format(props.dateFormat)
              : originData
          }}
        </div>

        <!-- progress -->
        <div
          v-if="props.progress"
          :class="[
            'xg-slider-progress',
            { 'xg-slider-progress__default': !props.progressColor }
          ]"
          :style="{
            width: `${progressValue}%`,
            backgroundColor: props.progressColor || bgColor
          }"
        >
          {{ progressValue }}%
        </div>
      </div>

      <!-- 左滑块 -->
      <div
        v-if="canResizeLeft"
        ref="resizeLeftRef"
        class="xg-slider-resize left"
        @pointerdown.stop="onResizeLeftDown"
      >
        <slot
          v-if="isValidSlots(slots.left, props.data)"
          name="left"
          v-bind="toRowData(props.data)"
        />
        <div
          v-else
          class="resize-chunk"
          :style="{ backgroundColor: bgColor }"
        />
      </div>

      <!-- 右滑块 -->
      <div
        v-if="canResizeRight"
        ref="resizeRightRef"
        class="xg-slider-resize right"
        @pointerdown.stop="onResizeRightDown"
      >
        <slot
          v-if="isValidSlots(slots.right, props.data)"
          name="right"
          v-bind="toRowData(props.data)"
        />
        <div
          v-else
          class="resize-chunk"
          :style="{ backgroundColor: bgColor }"
        />
      </div>
    </div>

    <!-- 创建结束连线的按钮 -->
    <div
      v-if="props.allowLink"
      ref="endAnchorRef"
      :class="[
        'xg-slider-anchor',
        'end-anchor',
        {
          'xg-slider-anchor__show': $param.hoverItem?.uuid === props.data?.uuid
        }
      ]"
      :style="{ borderColor: bgColor }"
      @pointerdown="onEndAnchorDown"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useSlots, ref, computed, onMounted, Ref } from 'vue';
import Variables from '@/constants/vars';
import sliderProps from './props';
import useData from '@/composables/useData';
import useGanttHeader from '@/composables/useGanttHeader';
import useGanttWidth from '@/composables/useGanttWidth';
import useDrag from '@/composables/useDrag';
import useParam from '@/composables/useParam';
import useStyle from '@/composables/useStyle';
import { baseUnit, day } from '@/utils/date';
import { flow, isBoolean, isFunction, isNumber } from 'lodash';
import useEvent from '@/composables/useEvent';
import { MoveSliderInternalData } from '@/typings/data';
import useLinks from '@/composables/useLinks';
import useElement from '@/composables/useElement';
import useSlotsBox from '@/composables/useSlotsBox';
import useDragBackdrop from '@/composables/useDragBackdrop';
import dayjs from 'dayjs';
import { XDate } from '@/models/param/date';
import { Relation, RelationType } from '@/models/data/links';
import { LinkProps } from '@/typings/link';

export default defineComponent({
  name: Variables.name.slider
});
</script>

<script setup lang="ts">
const props = defineProps(sliderProps);
const slots = useSlots();
const { $param } = useParam();
const { $styleBox } = useStyle();
const { isValidSlots } = useSlotsBox();
const { ganttHeader } = useGanttHeader();
const { updateDragBackdrop } = useDragBackdrop();

const isDrag = ref(false);

const height = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px`;
  }

  if (!/[^0-9.]+/.test(props.height)) {
    return `${parseFloat(props.height)}px`;
  }

  return props.height;
});

const bgColor = computed(() => {
  return props?.bgColor || $styleBox.primaryColor;
});

const { toRowData, toSliderData, getProp } = useData();
const originData = computed(
  () => props.label || getProp(props.data!, props.prop, props.emptyData)
);

// #region 自定义滑块逻辑
const eventStartDate = ref<XDate>(props.data!.start.clone());
const eventEndDate = ref<XDate>(props.data!.end.clone());

const setEventStartOrEventEnd = (options: any) => {
  if (options.startDate) {
    eventStartDate.value = options.startDate.clone();

  }
  if (options.endDate) {
    eventEndDate.value = options.endDate.clone();
  }
}

const setStartOrEnd = (options: any) => {
  if (options.startDate) {
    props.data?.setStart(options.startDate.clone(), options.unit || 'hour', props.linkedResize, movedData);
  }
  if (options.endDate) {
    props.data?.setEnd(options.endDate.clone(), options.unit || 'hour', props.linkedResize, movedData);
  }
}

const customEmitMove = (options: any) => {
  setEventStartOrEventEnd(options);
  setStartOrEnd(options);

  movedData.unshift({
    row: props.data!,
    old: {
      start: eventStartDate!.value.date,
      end: eventEndDate.value!.date
    }
  });
  EmitMoveSlider(
    movedData.map(item => ({ row: item.row.data, old: item.old }))
  );
  movedData = [];
}

const toCustomOptions = (params: any = {}) =>{
  const options = {
      startDate: eventStartDate.value,
      endDate: eventEndDate.value,
      ganttHeader,
      sliderLimit: props.sliderLimit,
      dateRange: $param.dateRange,
      ganttColumnWidth: ganttColumnWidth.value,
      currentMillisecond: currentMillisecond.value,
  }
  Object.assign(options, params);
  return options;
}

// #endregion

// #region 计算滑块位置
const { ganttColumnWidth, currentMillisecond } = useGanttWidth();
const sliderLeft = computed(
  () =>{
    if (props.sliderLeft) {
      return props.sliderLeft(toCustomOptions())
    }
    return (props.data!.start.intervalTo(ganttHeader.start) /
      currentMillisecond.value) *
    ganttColumnWidth.value
  }
);
// 判断结束时间是否超出范围
const isExceedsRange = ref(false);
// 滑块宽度小于单个宽度
const ltTotalWidth = ref(false);
const sliderWidth = computed(
  () =>{
    // TODO 宽度补足时分秒 按一天计算
    if (props.sliderWidth) {
      return props.sliderWidth(toCustomOptions());
    }
  // 适配滑块粘性布局增加以下代码
  // 修复开始时间与结束时间没有时计算报错
  let startDate = props.data!.start;
  let endDate = props.data!.end;
  const calcNum = endDate.intervalTo(startDate);
  // 滑块宽度不能超出结束时间宽度,超出后适配的粘性布局异常
  // 疑问点，在这里要么调整滑块宽度，要么将头部结束时间增加。默认结束时间在header.ts中有禁止规则
  isExceedsRange.value = endDate.compareTo(ganttHeader.end) === 'r'
  if (isExceedsRange.value) {
    endDate = new XDate(ganttHeader.end.date);
  }

  // 开始时间或结束时间都不存在时 默认会赋值为当天，不会不存在
  // 结束时间小于开始时间对比时间戳小于一秒时
  // 开始时间大于头部范围结束时间
  if (Number.isNaN(calcNum) || calcNum < Variables.time.millisecondOf.second || ganttHeader.end.intervalTo(startDate) <= 0) {
    return 0;
  }

  // ui呈现上模拟补足超出的剩余宽度
  if (isExceedsRange.value) {
    switch ($styleBox.unit) {
      case 'week':
      case 'day':
        endDate.endOf('day');
        endDate.endOf('hour');
        endDate.endOf('minute');
        endDate.endOf('second');
        break;
      case 'hour':
        endDate.endOf('hour');
        endDate.endOf('minute');
        endDate.endOf('second');
        break; 
      default:
        break;
    }
  }

  const tempWidth = (
    (endDate.intervalTo(startDate) / currentMillisecond.value) *
    ganttColumnWidth.value
  );
  ltTotalWidth.value = tempWidth <= 30;
  return tempWidth;
  
});
// #endregion

// #region 移动滑块
const calcMove = (p: boolean | ((data: RowData) => boolean)) => {
  if (isBoolean(p)) return p;
  if (isFunction(p)) {
    return p(toRowData(props.data!));
  }

  return false;
};

const canMove = computed(() => {
  return calcMove(props.move);
});
const disableMove = ref(false);
function handleDisableMove() {
  disableMove.value = true;
}

onMounted(() => {
  document.addEventListener('pointerup', () => {
    disableMove.value = false;
  });
});

// 处理拖拽背景相关
const hanldeDragBackdrop = (args?: any) => {
  updateDragBackdrop({sliderLeft: sliderLeft.value, sliderWidth: sliderWidth.value, isDrag: true, startDate: props.data!.start, endDate: props.data!.end, ...args});
}

const onMoveBefore = () => {
  setShowLink(false);
}

const onMoveAfter = () => {
  hanldeDragBackdrop();
}

const onMoveEnd = () => {
  hanldeDragBackdrop({isDrag: false});
  setShowLink(true);
}

// 移动过的对象数组
const { EmitMoveSlider } = useEvent();
let movedData: MoveSliderInternalData[] = [];
// 下一次移动前的时间缓存
let prevMoveStartDate = props.data!.start.clone();
let prevMoveEndDate = props.data!.end.clone();
function EmitMove() {
  if (props.emitMove) {
    return props.emitMove(toCustomOptions(), customEmitMove);
  }
  if($param.enableDateCompletion) {
    const _unit = ganttHeader.unit;
    let _startDate = dayjs(props.data!.start.date);
    let _endDate = dayjs(props.data!.end.date);
    const diffInNum = _endDate.diff(_startDate, _unit === 'hour' ? 'minute' : 'hour');
    // 适配滑块整体拖拽，或者左右减少到最小单位产生拖拽的场景
    let _isDrag = isDrag.value || !!(_unit === 'hour' ? diffInNum <= 60 : diffInNum <= 24);
    // 判断拖拽后的时间是否已经改变，没改变则不重新计算拖拽的时间
    const checkTimeUnit = _unit === 'hour' ? 'hour' : 'day';
    const isDateChanged = !(dayjs(prevMoveStartDate!.date).isSame(_startDate, checkTimeUnit) && dayjs(prevMoveEndDate.date).isSame(_endDate, checkTimeUnit));
    if (_isDrag && isDateChanged) {
      let starthour = _startDate.toDate().getHours();
      let startminutes = _startDate.toDate().getMinutes();

      switch (_unit) {
        case 'hour':
            // 如果拖拽的开始时间在30分钟之前，滑块靠左吸附，否则靠右吸附
            if (startminutes < 30) {
              _endDate = _endDate.subtract(1, 'hour').endOf('hour');
            } else {
              _startDate = _startDate.add(1, 'hour').startOf('hour');
            }
          break;
        default:
            // 如果拖拽的开始时间在12点之前，滑块靠左吸附，否则靠右吸附
            if (starthour < 12) {
              _endDate = _endDate.subtract(1, 'day').endOf('day');
            } else {
              _startDate = _startDate.add(1, 'day').startOf('day');
            }
          break;
      }
    };

    isDrag.value = false;
    const tempStart = new XDate(props.data!.onStartDateCompletion(_startDate.toDate(), _unit));
    const tempEnd = new XDate(props.data!.onEndDateCompletion(_endDate.toDate(), _unit));
    props.data!.setEnd(tempEnd, 'second');
    props.data!.setStart(tempStart, 'second');
  }
  prevMoveStartDate = props.data!.start.clone();
  prevMoveEndDate = props.data!.end.clone();

  movedData.unshift({
    row: props.data!,
    old: {
      start: startDate!.date,
      end: endDate!.date
    }
  });
  EmitMoveSlider(
    movedData.map(item => ({ row: item.row.data, old: item.old }))
  );
  movedData = [];
  onMoveEnd();
}

let startDate = props.data?.start.clone();
let endDate = props.data?.end.clone();
const setStart = (x: number, type: string) => {
  if (props.setStart) {
    return props.setStart(toCustomOptions({ x, type, startDate, endDate}), setEventStartOrEventEnd, setStartOrEnd);
  }

  onMoveBefore();

  let _unit = ganttHeader.unit as DateUnit;

  isDrag.value = true;
  if (type === 'resize') {
    isDrag.value = false;
  }

  let d = startDate!.getOffset(
    (x / ganttColumnWidth.value) * currentMillisecond.value
  );

  if (props.moveByUnit) d.startOf(baseUnit(ganttHeader.unit), startDate!);

  if (type === 'resize' && props.resizeMode === 'dragonly') {
    // 负值时禁止移动滑块，并且根据结束时间与当前时间单位计算出应显示的时间
    const compareTo = d.compareTo(endDate!);
    const resizeUnit = ganttHeader.unit === 'hour' ? 'hour' : 'day';
    if (d.isSame(endDate!, resizeUnit) || compareTo === 'r') {
      d = new XDate(props.data!.onStartDateCompletion(endDate?.date, resizeUnit));
    }

    // 适配 setStart 方法内结束时间会增加一个时间单位值。如当前时间单位为day，当计算出结束时间减去开始时间小于一天的时间戳，结束时间会增加一天，导致本来一天的时间范围，变为两天了
    _unit = 'second';
  }

  if (
    !props.moveByUnit ||
    Math.abs(props.data!.start.intervalTo(d) / currentMillisecond.value) *
      ganttColumnWidth.value >=
      ganttColumnWidth.value
  ) {
    props.data?.setStart(d, _unit, props.linkedResize, movedData);
  }

  onMoveAfter();
  return x;
};
const setEnd = (x: number, type: string) => {
  if (props.setEnd) {
    return props.setEnd(toCustomOptions({ x, type, startDate, endDate }), setEventStartOrEventEnd, setStartOrEnd);
  }

  onMoveBefore();

  let _unit = ganttHeader.unit as DateUnit;

  isDrag.value = true;
  if (type === 'resize') {
    isDrag.value = false;
  }

  let d = endDate!.getOffset(
    (x / ganttColumnWidth.value) * currentMillisecond.value
  );

  if (props.moveByUnit) d.endOf(baseUnit(ganttHeader.unit), endDate!);

  if (type === 'resize' && props.resizeMode === 'dragonly') {
    // 负值时禁止移动滑块，并且根据开始时间与当前时间单位计算出应显示的时间
    const compareTo = d.compareTo(startDate!);
    const resizeUnit = ganttHeader.unit === 'hour' ? 'hour' : 'day';
    if (d.isSame(startDate!, resizeUnit) || compareTo === 'l') {
      d = new XDate(props.data!.onEndDateCompletion(startDate?.date, resizeUnit));
    }
    // 适配 setEnd 方法内开始时间会减少一个时间单位值。如当前时间单位为day，当计算出结束时间减去开始时间小于一天的时间戳，开始时间会减少一天，导致本来一天的时间范围，变为两天了
    _unit = 'second';
  }

  if (
    !props.moveByUnit ||
    Math.abs(props.data!.end.intervalTo(d) / currentMillisecond.value) *
      ganttColumnWidth.value >=
      ganttColumnWidth.value
  ) {
    props.data?.setEnd(d, _unit, props.linkedResize, movedData);
  }
  onMoveAfter();
};

const sliderRef = ref(null) as Ref<HTMLElement | null>;
const { onDrag } = useDrag();
onDrag(sliderRef, {
  disabled: () => !canMove.value || disableMove.value,
  reset: true,

  onStart: () => {
    startDate = props.data?.start.clone();
    endDate = props.data?.end.clone();
  },

  onMove: flow(setStart, setEnd),
  onEnd: EmitMove
});
// #endregion

// #region 左滑块移动
const canResizeLeft = computed(() => {
  return canMove.value && calcMove(props.resizeLeft);
});
function onResizeLeftDown() {
  handleDisableMove();
}
const resizeLeftRef = ref(null) as Ref<HTMLElement | null>;
onDrag(resizeLeftRef, {
  reset: true,

  onStart: () => {
    startDate = props.data?.start.clone();
  },

  onMove: x => setStart(x, 'resize'),
  onEnd: EmitMove
});
// #endregion

// #region 右滑块移动
const canResizeRight = computed(() => {
  return canMove.value && calcMove(props.resizeRight);
});
function onResizeRightDown() {
  handleDisableMove();
}
const resizeRightRef = ref(null) as Ref<HTMLElement | null>;
onDrag(resizeRightRef, {
  reset: true,

  onStart: () => {
    endDate = props.data?.end.clone();
  },

  onMove: x => setEnd(x, 'resize'),
  onEnd: EmitMove
});
// #endregion

// #region outAnchor
let startAnchorMove = false;
let endAnchorMove = false;
function onStartAnchorDown(e: PointerEvent) {
  handleDisableMove();
  startAnchorMove = true;
}
function onEndAnchorDown(e: PointerEvent) {
  handleDisableMove();
  endAnchorMove = true;
}

const { setLinking, linking, $links, setShowLink } = useLinks();
const { ganttBodyRef } = useElement();
const { rowHeight } = useStyle();

const startAnchorRef  = ref(null) as Ref<HTMLElement | null>;
const startAnchorPos = { x: 0, y: 0 };
onDrag(startAnchorRef, {
  reset: true,
  disabled: () => !startAnchorRef.value && !props.allowLink && !startAnchorMove,

  onStart: pos => {
    startAnchorPos.x = (ganttBodyRef.value?.getBoundingClientRect().x ?? 0) - pos.x;
    startAnchorPos.y = (ganttBodyRef.value?.getBoundingClientRect().y ?? 0) - pos.y;

    const _sp = {
      x: sliderLeft.value - 11,
      y: ((props.data?.flatIndex ?? 0) + 0.5) * rowHeight.value
    };
    setLinking({
      isLinking: true,
      startRow: props.data,
      startPos: _sp,
      endPos: _sp,
      relation: Relation.START,
    });
  },

  onMove: (x, pos) => {
    setLinking({ endPos: { x: pos.x - startAnchorPos.x, y: pos.y - startAnchorPos.y } });
  },

  onFinally: () => {
    startAnchorMove = false;
    setLinking({ isLinking: false });
  }
});

const endAnchorRef = ref(null) as Ref<HTMLElement | null>;
const endAnchorPos = { x: 0, y: 0 };
onDrag(endAnchorRef, {
  reset: true,
  disabled: () => !endAnchorRef.value && !props.allowLink && !endAnchorMove,

  onStart: pos => {
    endAnchorPos.x = (ganttBodyRef.value?.getBoundingClientRect().x ?? 0) - pos.x;
    endAnchorPos.y = (ganttBodyRef.value?.getBoundingClientRect().y ?? 0) - pos.y;

    const _sp = {
      x: sliderLeft.value + sliderWidth.value + 11,
      y: ((props.data?.flatIndex ?? 0) + 0.5) * rowHeight.value
    };
    setLinking({
      isLinking: true,
      startRow: props.data,
      startPos: _sp,
      endPos: _sp,
      relation: Relation.END,
    });
  },

  onMove: (x, pos) => {
    setLinking({ endPos: { x: pos.x - endAnchorPos.x, y: pos.y - endAnchorPos.y } });
  },

  onFinally: () => {
    endAnchorMove = false;
    setLinking({ isLinking: false });
  }
});

// 最后抛出添加连线事件
const { EmitAddLink } = useEvent();
function onPointerUp(_event: MouseEvent) {
  if (!props.allowLink) return;
  // 判断鼠标释放位置在元素的左边还是右边
  const element = _event.currentTarget as any;
  const elementWidth = element?.offsetWidth;
  const rect = element?.getBoundingClientRect();
  const pointerX = _event.clientX - rect.left;
  const centerX = elementWidth / 2;
  const endRelation = pointerX < centerX ? Relation.START : Relation.END;
  const relationType = linking.relation && endRelation ? `${linking.relation}${endRelation}` as RelationType : RelationType.ES;
  if (linking.startRow) {
    const link = $links.createLink(linking.startRow, props.data!, relationType);
    if (link) {
      EmitAddLink(
        link,
        { from: linking.startRow.data, to: props.data!.data,relationType },
        (_link: LinkProps) => $links.addLink(_link, linking.startRow!, props.data!)
      );
    }

    setLinking({ startRow: null, endRow: null, relation: null });
  }
}
// #endregion

// #region progress
const progressValue = computed(() => {
  let v = props.data?.progress ?? 0;
  if (v > 1) v = 1;
  else if (v < 0) v = 0;

  // 显示方式，默认整数
  if (isNumber(props.progressDecimal)) {
    let fixed = Math.floor(props.progressDecimal);
    if (fixed < 0) fixed = 0;
    else if (fixed > 10) fixed = 10;
    return (v * 100).toFixed(fixed);
  }

  return props.progressDecimal ? (v * 100).toFixed(2) : Math.floor(v * 100);
});
// #endregion

// #region class
const classNames = computed(() => {
  const names = [
      sliderWidth.value === 0 ? 'is-no-width' : '',
      isExceedsRange.value ? 'is-exceeds-range' : '',
      ltTotalWidth.value ? 'lt-total-width' : '',
  ]
  return names;
})
// #endregion
</script>

<style lang="scss">
.xg-slider {
  position: absolute;
  transition: filter 0.2s;
  pointer-events: auto;

  .xg-slider-block {
    overflow: hidden;
    position: relative;
    font-size: 12px;
    height: 100%;

    .xg-slider-content {
      border-radius: 4px;
      height: 100%;
      padding: 0 12px;

      .slider-text {
        height: 100%;
        display: flex;
        align-items: center;
      }
    }

    .xg-slider-progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      opacity: 0.6;
      transition: width 0.2s;
      text-align: right;
      font-size: 10px;
      border-radius: 4px;
    }

    .xg-slider-progress__default {
      filter: grayscale(1);
    }

    .xg-slider-resize {
      height: 100%;
      position: absolute;
      top: 0;
      z-index: 1;
      cursor: ew-resize;

      .resize-chunk {
        width: 12px;
        height: 100%;
        opacity: 0;
        transition: filter 0.2s;
      }
    }

    .xg-slider-resize.left {
      left: 0;
      cursor: w-resize;

      .resize-chunk {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }
    }

    .xg-slider-resize.right {
      right: 0;
      cursor: e-resize;

      .resize-chunk {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 2px 5px var(--gantt-color-shadow);

    .xg-slider-progress__default {
      filter: grayscale(1) brightness(1.2);
    }

    .xg-slider-resize {
      .resize-chunk {
        opacity: 1;

        &:hover {
          filter: brightness(0.8) sepia(1);
        }
      }
    }

    .xg-slider-anchor {
      opacity: 1;
    }
  }

  .xg-slider-anchor {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--gantt-color-primary);
    border: 2px solid var(--gantt-color-black);
    position: absolute;
    top: 50%;
    cursor: pointer;
    opacity: 0;
    transition: transform 0.2s, opacity 0.2s;
    transform: translateY(-50%);

    &:hover {
      transform: translateY(-50%) scale(1.2);
    }
  }

  .xg-slider-anchor__show {
    opacity: 1;
  }

  .start-anchor {
    left: -11px;
  }

  .end-anchor {
    right: -11px;
  }
}

.xg-slider.xg-slider-drag {
  cursor: ew-resize;
}
</style>
