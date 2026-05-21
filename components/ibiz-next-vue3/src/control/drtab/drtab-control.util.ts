import { Ref, onUnmounted, ref, watch, watchEffect } from 'vue';
import { defaultNamespace } from '@ibiz-template/core/out/utils/namespace/namespace';
import { DRTabController } from './drtab.controller';

/**
 * 获取显示内容
 *
 * @author ljx
 * @date 2024-06-12 17:09:09
 * @export
 * @param {DRTabController} c
 * @param {Ref<IData | undefined>} controlRef
 * @param {IData} counterData
 * @returns {*}
 */
export function useAppDRTab(
  c: DRTabController,
  controlRef: Ref<IData | undefined>,
  counterData: Ref<IData>,
): {
  visibleItems: Ref<IData>;
  moreItems: Ref<IData>;
} {
  // 浏览器ResizeObserver对象
  let resizeObserver: ResizeObserver | null = null;

  // 上次宽度
  let lastDrTabWidth = 0;
  const visibleItems = ref<IData[]>([]);
  const moreItems = ref<IData[]>([]);

  // 创建模拟元素并计算宽度
  const calcDomWidth = (text: string, style = {}): number => {
    let domWidth = 0;
    const dom = document.createElement('span');
    const sonDom = document.createElement('span');
    // 设置innerHtml
    sonDom.innerHTML = text;
    Object.assign(sonDom.style, style);
    Object.assign(dom.style, {
      width: 'auto',
      position: 'absolute',
      left: '-9999px',
    });
    dom.appendChild(sonDom);
    document.body.appendChild(dom);
    // 获取模拟tab元素的总宽度（包括padding）
    domWidth = dom.offsetWidth;
    document.body.removeChild(dom);
    return domWidth;
  };

  // 方法：更新可见和隐藏的项目
  function updateVisibleItems() {
    const { drTabPages, showMore } = c.state;

    if (!controlRef.value || !showMore || drTabPages.length === 0) {
      visibleItems.value = drTabPages;
      moreItems.value = [];
      return;
    }

    const totalDom = controlRef.value.$el;
    // 拿到容器总宽度
    const totalWidth = totalDom.offsetWidth;
    // 初始化累计宽度
    let accumulatedWidth = 0;

    // 遍历总数据进行自增加上以上值，当值大于总宽度时获取index下标，以此下标截取
    visibleItems.value = [];
    moreItems.value = [];
    drTabPages.forEach((tab: IData, index: number) => {
      if (!tab.hidden) {
        // 文字值
        const caption = tab.caption || '';
        // 计数器
        const counterNum = tab.counterId
          ? counterData.value[tab.counterId]
          : undefined;
        const fontSize = `var(--${defaultNamespace}-font-size-regular)`;

        // 获取计数器元素宽度
        if (
          counterNum != null &&
          !(!counterNum && counterNum !== 0) &&
          !(tab.counterMode === 1 && counterNum <= 0)
        ) {
          const counterStyle = {
            marginLeft: `var(--${defaultNamespace}-spacing-tight)`,
            minWidth: '20px',
            fontSize,
          };
          const counterWidth = calcDomWidth(String(counterNum), counterStyle);
          accumulatedWidth += counterWidth;
        }

        // 获取tab宽度
        // 模拟设置元素样式
        const tabStyle = {
          padding:
            index === 0
              ? `0 var(--${defaultNamespace}-spacing-base) 0 0`
              : `0 var(--${defaultNamespace}-spacing-base)`,
          fontSize,
        };
        const tabWidth = calcDomWidth(caption, tabStyle);
        accumulatedWidth += tabWidth;

        // 获取更多元素宽度
        const moreStyle = {
          padding: `0 0 0 var(--${defaultNamespace}-spacing-base)`,
          fontSize,
        };
        const moreWidth = calcDomWidth(
          `${ibiz.i18n.t('app.more')} ^`,
          moreStyle,
        );
        // 检查是否超过总宽度
        if (accumulatedWidth + moreWidth > totalWidth) {
          // 获取超过总宽度值
          moreItems.value.push(tab);
        } else {
          // 如果没有超过总宽度，所有项都可见
          visibleItems.value.push(tab);
        }
      }
    });
  }

  const calcDrTabWidth = () => {
    if (window.ResizeObserver) {
      const drTabDom = controlRef.value!.$el;
      if (drTabDom) {
        // 监听宽度变化动态重新计算显示值
        resizeObserver = new ResizeObserver(entries => {
          const width = entries[0].contentRect.width;
          if (width !== lastDrTabWidth) {
            updateVisibleItems();
            lastDrTabWidth = width;
          }
        });
        resizeObserver.observe(drTabDom);
      }
    }
  };

  // 监听 drTabPages 的变化
  watch(
    () => c.state.drTabPages,
    () => {
      updateVisibleItems();
    },
    { deep: true },
  );

  const stop = watchEffect(() => {
    if (controlRef.value) {
      calcDrTabWidth();
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    stop();
  });
  return { visibleItems, moreItems };
}
