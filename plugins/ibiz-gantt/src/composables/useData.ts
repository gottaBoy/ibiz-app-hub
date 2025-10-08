/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { isObject, isString } from 'lodash';
import { computed, type ExtractPropTypes, watch, type Ref } from 'vue';
import type rootProps from '@/components/root/rootProps';
import Variables from '@/constants/vars';
import type RowItem from '@/models/data/row';
import { useStore } from '@/store';
import useGanttHeader from './useGanttHeader';
import { GanttHeader } from '@/models/param';
import useLinks from './useLinks';

export default () => {
  const store = useStore();
  const { setGanttHeaders } = useGanttHeader();
  const { updateLinks } = useLinks();

  function initData(
    data: Ref<any[]>,
    props: ExtractPropTypes<typeof rootProps>,
  ) {
    const options: DataOptions = {
      dataId: props.dataId,
      isExpand: !props.showExpand || props.expandAll,
      expandLabel: props.expandKey,
      draggableLabel:
        (isObject(props.draggable) && props.draggable.draggableStateKey) || '',
      startLabel: props.startKey,
      endLabel: props.endKey,
      children: props.children,
      leaf: props.leaf,
      unit: store.$styleBox.unit,
      enableDateCompletion: props.enableDateCompletion,
      get isSliderDrag() {
        return store.dragBackdrop.data.isSliderDrag;
      },
    };
    store.$param.enableDateCompletion = props.enableDateCompletion;
    store.$param.allowDrag = props.allowDrag;
    store.$param.allowDrop = props.allowDrop;
    store.$param.headerDrag = props.headerDrag;
    store.$data.init(data.value, options);

    setGanttHeaders();

    watch(
      () => data,
      val => {
        // 更新数据
        store.$data.update(val.value, options);

        setGanttHeaders();
        updateLinks(props.links);
      },
      { deep: true },
    );

    watch(
      () => props.links,
      () => {
        updateLinks(props.links);
      },
      { deep: true },
    );

    watch(
      () => props.showExpand,
      () => {
        store.$data.updateExpand(true);
        updateLinks(props.links);
      },
    );

    watch(
      () => props.expandAll,
      val => {
        store.$data.updateExpand(!props.showExpand || val);
        updateLinks(props.links);
      },
    );

    watch(
      [() => props.dateRange, () => props.showWeekdays],
      ([dateRange, showWeekdays]) => {
        store.$param.dateRange = dateRange;
        store.$param.showWeekdays = showWeekdays;
        setGanttHeaders();
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.headerDrag,
      val => {
        store.$param.headerDrag = val;
      },
    );

    watch(
      () => props.preload,
      val => {
        store.$param.preload = val;
      },
    );
  }

  function toRowData(data?: RowItem): RowData {
    return {
      row: data?.data,
      $index: data?.flatIndex,
      level: data && data.level + 1,
    };
  }

  function toSliderData(left: number, header: GanttHeader, data?: RowItem) {
    return {
      row: data?.data,
      $index: data?.flatIndex,
      level: data && data.level + 1,
      left,
      header,
    };
  }

  function flattenData() {
    store.$data.updateFlatData();
    store.$links.update(store.$data.flatData);
  }

  function getProp(data: RowItem, prop?: string, empty?: string): string {
    if (isString(prop)) {
      if (prop in data.data) return data.data[prop];
      if (prop.includes('.')) {
        const [l, ...rest] = prop.split('.');
        if (l in data.data)
          return rest.reduce((acc, v) => acc[v], data.data[l]);
      }
    }

    return empty ?? Variables.noData;
  }

  return {
    $data: store.$data,
    initData,
    dateList: computed(() => store.ganttHeader.headers),
    toRowData,
    toSliderData,
    flattenData,
    getProp,
  };
};
