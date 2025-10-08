<template>
  <g ref="svgRef"
    :class="['xg-link', { 'xg-link__selected': selected, 'not-show-link': !showLink, 'xg-link__invalid': !isRelationValid }]"
    @click.stop="onClick" @mouseenter="linkLineMouseenter">
    <path :d="path" fill="transparent" :stroke="link.color" :marker-end="`url(#triangle_${link.toRow.id}_${pathId})`" />

    <defs>
      <marker :id="`triangle_${link.toRow.id}_${pathId}`" markerWidth="5" markerHeight="4" refX="2" refY="2"
        orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,4 L5,2 z" :fill="link.color" />
      </marker>
    </defs>
  </g>
</template>

<script lang="ts" setup>
import useGanttHeader from '@/composables/useGanttHeader';
import useGanttWidth from '@/composables/useGanttWidth';
import useStyle from '@/composables/useStyle';
import { LinkItem, RelationType } from '@/models/data/links';
import { computed, PropType, Ref, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import useEvent from '@/composables/useEvent';
import { uuid } from '@/utils/common';
import useElement from '@/composables/useElement';
import useLinks from '@/composables/useLinks';

const props = defineProps({
  link: {
    type: Object as PropType<LinkItem>,
    default: () => ({})
  }
});

const { linkLineMouseenter } = useElement();

const { showLink, $links } = useLinks();

const pathId = uuid().toLocaleLowerCase();

const { EmitClickLink } = useEvent();

const selected = ref(false);
function onClick(_event: MouseEvent) {
  selected.value = true;
  EmitClickLink(props.link.originLink, _event);
}

const svgRef = ref(null) as Ref<SVGGElement | null>;
onClickOutside(svgRef, () => {
  if (!selected.value) return;

  selected.value = false;
  EmitClickLink(null);
});

const { ganttHeader } = useGanttHeader();
const { ganttColumnWidth, currentMillisecond } = useGanttWidth();
const { rowHeight } = useStyle();

const isRelationValid = computed(() => $links.isRelationValid(props.link));

const startX = computed(() => {

  const startTime = (props.link.relationType === RelationType.SS || props.link.relationType === RelationType.SE)
    ? props.link.fromRow.start
    : props.link.fromRow.end;
  return (startTime.intervalTo(ganttHeader.start) / currentMillisecond.value) * ganttColumnWidth.value;
});

const y = computed(
  () => props.link.fromRow.flatIndex * rowHeight.value + rowHeight.value / 2
);

const endX = computed(() => {
  const endTime = (props.link.relationType === RelationType.SS || props.link.relationType === RelationType.ES)
    ? props.link.toRow.start
    : props.link.toRow.end;
  return (endTime.intervalTo(ganttHeader.start) / currentMillisecond.value) * ganttColumnWidth.value;
});

const y2 = computed(
  () => props.link.toRow.flatIndex * rowHeight.value + rowHeight.value / 2
);

const path = computed(() => {

  const isStart = props.link.relationType?.startsWith('S');
  const isEnd = props.link.relationType?.endsWith('S');

  const startOffset = 0;
  const endOffset = isEnd ? -5 : 5;

  const sx = startX.value + startOffset; // 起点X
  const sy = y.value; // 起点Y
  const ex = endX.value + endOffset;  // 终点X
  const ey = y2.value;  // 终点Y

  const midStartX = (isStart ? sx - 10 : sx + 10); // 起点水平缓冲midStartX
  const midEndX = ex - (isEnd ? 15 : -15); // 终点水平缓冲midStartX
  let midY = sy;

  if (ey > sy) {
    // 终点在下方
    midY = sy + rowHeight.value / 2;
  } else if (ey < sy) {
    // 终点在上方
    midY = sy - rowHeight.value / 2;
  }

  // 起点 → 水平缓冲 → 垂直移动（避开任务条） → 水平接近终点 → 垂直对齐 → 终点
  return `M ${sx} ${sy}
          H ${midStartX}
          V ${midY}
          H ${midEndX}
          V ${ey}
          H ${ex}`;
});

</script>

<style lang="scss">
.xg-link {
  cursor: pointer;
  transition: filter 0.2s;
  pointer-events: auto;

  path {
    transition: stroke-width 0.2s;
  }

  &>path {
    stroke: var(--gantt-color-link-path);
    stroke-width: 2;
  }

  &.xg-link__invalid {
    --gantt-color-link-path: var(--gantt-color-danger);
    --gantt-color-link-path-hover: var(--gantt-color-danger-hover);
  }

  &.not-show-link {
    display: none !important;
  }

  defs {

    path,
    circle {
      fill: var(--gantt-color-link-path);
    }
  }

  &:hover {
    &>path {
      stroke: var(--gantt-color-link-path-hover);
    }

    defs {

      path,
      circle {
        fill: var(--gantt-color-link-path-hover);
      }
    }
  }
}
</style>
