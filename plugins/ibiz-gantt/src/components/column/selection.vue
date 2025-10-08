<template>
  <Icon
    v-if="$styleBox.draggable.draggable !== false || data.isDraggable"
    name="drag"
    class="drag-icon"
  />

  <div class="level-block" :style="{ width: `${data!.level * indent}px` }" />

  <div
    v-if="$styleBox.showExpand"
    class="expand"
    :style="{
      width: `${Math.min(rowHeight / 2, 16)}px`,
      height: `${Math.min(rowHeight / 2, 16)}px`,
      lineHeight: `${Math.min(rowHeight / 2, 16)}px`,
      display: 'inline-block',
      'box-sizing': 'border-box',
      'vertical-align': 'middle',
    }"
  >
    <Icon
      v-if="!!data?.children?.length || !data?.isLeaf"
      name="arrow-right"
      :class="['expand-icon', { 'expand-icon__expanded': data?.isExpand }]"
      :style="{ width: '100%', height: '100%' }"
      @click.stop="setExpand"
    />
  </div>

  <Checkbox
    v-if="$styleBox.showCheckbox"
    v-model="checked"
    @click="onClickCheckbox"
    @right-click="onRightClickCheckbox"
  />
</template>

<script lang="ts" setup>
import { PropType, ref, watchEffect } from 'vue';
import useStyle from '@/composables/useStyle';
import useData from '@/composables/useData';
import RowItem from '@/models/data/row';
import Icon from '../common/Icon.vue';
import Checkbox from '../common/Checkbox.vue';
import useEvent from '@/composables/useEvent';

const props = defineProps({
  data: {
    type: Object as PropType<RowItem>,
    default: () => ({}),
  },
  indent: {
    type: Number,
    default: 20,
  },
});

const { rowHeight, $styleBox } = useStyle();
const { flattenData } = useData();

// #region checkbox expand
const checked = ref(props.data.isChecked);
const { EmitRowChecked, EmitNodeExpand, EmitNodeCollapse } = useEvent();

watchEffect(() => {
  checked.value = props.data.isChecked;
});

const onClickCheckbox = (state: boolean) => {
  EmitRowChecked(state, props.data.data);
};

const setExpand = () => {
  const isExpand = !props.data.isExpand;
  props.data?.setExpand(isExpand);
  flattenData();
  if (isExpand) {
    EmitNodeExpand(props.data?.data);
  } else {
    EmitNodeCollapse(props.data?.data);
  }
}

const onRightClickCheckbox = (state: boolean) => {
  // 选中时，先选中再抛出事件。取消时相反
  if (!state) {
    EmitRowChecked(
      false,
      props.data.data,
      props.data.getFlattenChildren().map(v => v.data),
    );
    props.data.setChecked(false, true);
  } else {
    props.data.setChecked(true, true);
    EmitRowChecked(
      true,
      props.data.data,
      props.data.getFlattenChildren().map(v => v.data),
    );
  }
};
// #endregion
</script>

<style lang="scss">
@import './style.scss';
</style>
