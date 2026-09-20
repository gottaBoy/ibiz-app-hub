<template>
  <div class="xg-table-toolbar">
    <el-popover placement="bottom" trigger="click" :teleported="true">
      <template #reference>
        <el-button :title="t('settings')"
          ><ion-icon name="settings-outline"></ion-icon
        ></el-button>
      </template>
      <template #default>
        <template v-for="r in $slotsBox.tableHeaders.headers">
          <el-checkbox
            v-for="c in r"
            :key="c.uuid"
            v-model="c.show"
            :label="c.label"
          />
        </template>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import useSlotsBox from '@/composables/useSlotsBox';
import { useGanttLocale } from '@/locale';
const { $slotsBox } = useSlotsBox();
const { t } = useGanttLocale();
</script>
<style lang="scss">
.xg-table-toolbar {
  .el-button {
    font-size: 20px;
  }
}
</style>
