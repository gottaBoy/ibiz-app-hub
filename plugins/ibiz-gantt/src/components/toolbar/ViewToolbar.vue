<template>
  <div
    class="xg-view-toolbar"
    :style="{ color: $styleBox.headerStyle?.textColor }"
  >
    <div v-show="showToday" class="today" @click="jumpToday">{{ t('today') }}</div>
    <el-dropdown
      popper-class="xg-view-toolbar-switch-action"
      trigger="click"
      :teleported="!$param.fullScreen"
      @command="handleCommand"
    >
      <div
        class="switch-view"
      >
        {{ dateUnit[$styleBox.unit] }}
        <i class="fa fa-angle-down" aria-hidden="true" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(value, key) in dateUnit"
            :key="key"
            :command="key"
            >{{ value }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div
      class="full-screen"
      @click="fullscreenChange"
      :title="$param.fullScreen ? t('exitFullscreen') : t('fullscreen')"
    >
      <ion-icon v-if="$param.fullScreen" name="contract-outline"></ion-icon>
      <ion-icon v-else name="expand-outline"></ion-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import useStyle from '@/composables/useStyle';
import useExport from '@/composables/useExport';
import useParam from '@/composables/useParam';
import useToday from '@/composables/useToday';
import useGanttHeader from '@/composables/useGanttHeader';
import { useStore } from '@/store';
import { useGanttLocale } from '@/locale';
import { computed } from 'vue';

const { $styleBox } = useStyle();
const { jumpToDate, fullscreenChange } = useExport();
const { showToday } = useToday();
const { setGanttHeaders } = useGanttHeader();
const store = useStore();
const { t } = useGanttLocale();

const dateUnit = computed(() => ({
  month: t('month'),
  week: t('week'),
  day: t('day'),
  hour: t('hour'),
}));

const handleCommand = (unit: HeaderDateUnit) => {
  $styleBox.unit = unit;
  setGanttHeaders();
  store.$data.updateDateUnit(unit);
};

const jumpToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  jumpToDate(today);
};

const { $param } = useParam();

</script>

<style lang="scss">
.xg-view-toolbar {
  top: 100px;
  z-index: 10;
  right: 12px;
  display: flex;
  position: absolute;
  align-items: center;
  font-size: 14px;

  > div {
    padding: 8px 10px;
    margin-right: 8px;
    height: 32px;
    display: flex;
    align-items: center;
    color: var(--gantt-color-text-3);
    background-color: var(--gantt-color-bg);
    border: 1px solid var(--gantt-color-border-toolbar-item);
    box-shadow: 0 4px 7px 1px var(--gantt-color-shadow);
    border-radius: 5px;
    cursor: pointer;
    position: relative;
    &:hover {
      color: var(--primary-color);
      background-color: var(--gantt-color-bg-toolbar-item-hover);
      filter: none;
      &::after {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        display: block;
        width: 100%;
        height: 100%;
        content: '';
        background-color: var(--gantt-color-bg);
        border-radius: 5px;
      }
    }
  }
  .full-screen {
    font-size: 20px;
  }
}
.xg-view-toolbar-switch-action {
  &.el-popper.el-dropdown__popper .el-scrollbar .el-dropdown__list {
    background-color: transparent;

    .el-dropdown-menu {
      background-color: transparent;
    }

    .el-dropdown-menu__item {
      color: var(--gantt-color-text-switch-item);
      background-color: transparent;

      &:hover {
        background-color: var(--gantt-color-bg-hover-switch-item);
      }
    }
  }
}
</style>
