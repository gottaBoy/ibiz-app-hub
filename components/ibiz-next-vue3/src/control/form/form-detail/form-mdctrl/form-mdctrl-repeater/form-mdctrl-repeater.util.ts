import { ref, Ref } from 'vue';
/**
 * 分页加载自定义Hook
 * 用于实现数据的分批加载显示，避免一次性渲染大量数据影响性能
 *
 * @param initItems 初始数据项数组
 * @param chunkSize 每页加载的数据项数量
 * @returns 包含当前渲染数据和加载更多方法的对象
 */
export function useLoadMore(
  initItems: IData[],
  chunkSize: number,
): {
  renderItems: Ref<IData[]>;
  loadMore: () => void;
  updateTotalItems: (items: IData[]) => void;
} {
  // 存储所有数据项
  let totalItems: IData[] = [];
  // 当前页码，从第1页开始
  let page: number = 1;
  // 存储当前需要渲染的数据项
  const renderItems: Ref<IData[]> = ref([]);

  /**
   * 更新总数据项并重置分页状态
   * @param items 新的数据项数组
   */
  const updateTotalItems = (items: IData[]): void => {
    page = 1;
    totalItems = items ?? [];
    renderItems.value = totalItems.slice(0, chunkSize);
  };

  // 初始化数据
  updateTotalItems(initItems);

  /**
   * 加载更多数据
   * 将下一页的数据追加到当前渲染列表中
   */
  const loadMore = (): void => {
    // 如果已经加载完所有数据，则不再加载
    if (renderItems.value.length >= totalItems.length) {
      return;
    }

    page += 1;
    // 计算需要加载的数据范围并追加到渲染列表
    const start = (page - 1) * chunkSize;
    const end = page * chunkSize;
    renderItems.value.push(...totalItems.slice(start, end));
  };

  return {
    renderItems,
    loadMore,
    updateTotalItems,
  };
}
