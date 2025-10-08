<template>
  <g v-show="linking.isLinking">
    <path
      :d="path"
      fill="transparent"
      stroke="var(--gantt-color-linking)"
      stroke-width="2"
      :marker-end="`url(#${id})`"
    />

    <defs>
      <marker
        :id="id"
        markerWidth="5"
        markerHeight="4"
        refX="5"
        refY="2"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <circle cx="2" cy="2" r="2" fill="var(--gantt-color-linking)" />
      </marker>
    </defs>
  </g>
</template>

<script lang="ts" setup>
import useLinks from '@/composables/useLinks';
import { uuid } from '@/utils/common';
import { computed } from 'vue';

const { linking } = useLinks();

const id = uuid();

const path = computed(
  () =>
    `M ${linking.startPos.x} ${linking.startPos.y} L ${linking.endPos.x} ${linking.endPos.y}`
);
</script>
