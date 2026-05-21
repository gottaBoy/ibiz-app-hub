import { ref, nextTick, onBeforeUnmount, VNode, Ref } from 'vue';

/**
 * 检查节点是否为指定标签名的 DOM 元素
 * @param element 待检查元素
 * @param nodeName 目标标签名（大写）
 */
function isElement(element: HTMLElement, nodeName: string): boolean {
  // nodeType = 1 表示元素节点，nodeName 天然大写，直接匹配
  return !!(element && element.nodeType === 1 && element.nodeName === nodeName);
}

/**
 * 获取Mermaid流程图的svg元素，用于判断当前点击的svg元素是否为流程图
 * @param {HTMLElement} element
 * @return {*}  {(HTMLElement | null)}
 */
function getMermaidSvg(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element;
  // 向上遍历父级
  while (current) {
    // 遇到类名为 cherry-previewer 的元素，立即结束遍历
    if (current.classList.contains('cherry-previewer')) {
      return null;
    }
    const parent = current.parentElement;
    // 找到 svg 元素时，检查其父元素是否存在且data-type等于mermaid
    if (
      isElement(current, 'svg') &&
      parent &&
      parent.dataset.type === 'mermaid'
    ) {
      return current;
    }
    current = current.parentElement; // 继续向上查找
  }
  return null;
}

/**
 * SVG转换为Base64
 * @param {HTMLElement} svgElement SVG 元素
 * @return {*}  {string}
 */
function svgToBase64(svgElement: HTMLElement): string {
  // 克隆 SVG 元素以避免修改原始元素
  const clonedSvg = svgElement.cloneNode(true) as HTMLElement;

  // 确保有明确的尺寸
  const width =
    (svgElement as IParams).width.baseVal.value || svgElement.clientWidth;
  const height =
    (svgElement as IParams).height.baseVal.value || svgElement.clientHeight;

  clonedSvg.setAttribute('width', width);
  clonedSvg.setAttribute('height', height);
  clonedSvg.style.backgroundColor = 'white';

  // 序列化 SVG
  const svgString = new XMLSerializer().serializeToString(clonedSvg);

  // 直接转换为 Base64
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * 图片预览渲染 Hook
 * 提供 Markdown 编辑器图片预览功能（点击图片弹窗预览、ESC 关闭）
 * @param ns 命名空间（用于 CSS 类名）
 */
export function useImgPreviewRender(ns: { e: (name: string) => string }): {
  isImgPreview: Ref<boolean>;
  renderImgPreview: () => VNode;
  onMDEditorCreated: (mdeditor: IParams) => void;
} {
  // 预览图片当前地址
  const imgPreviewUrl = ref<string>('');
  // 预览图片地址列表（控制弹窗显示/隐藏）
  const imgPreviewUrlList = ref<string[]>([]);
  // 图片预览组件 Ref
  const imgPreviewRef = ref();
  // 是否正在预览图片
  const isImgPreview = ref(false);
  // Markdown 预览区 DOM
  let mdPreviewerDom: HTMLElement | null = null;

  /**
   * 打开图片预览弹窗
   * @param url 图片地址
   */
  const openImgPreview = async (url: string): Promise<void> => {
    isImgPreview.value = true;
    imgPreviewUrl.value = url;
    // 打开预览图片模态
    imgPreviewUrlList.value = [url];
    await nextTick();
    if (imgPreviewRef.value) {
      const { container } = imgPreviewRef.value.$refs;
      if (container) {
        container.children[0]?.click();
      }
    }
  };

  /**
   * 处理键盘事件（ESC 关闭预览）
   * @param event 键盘事件对象
   */
  const handleKeyPress = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      event.stopPropagation();
      event.preventDefault();

      // 关闭预览弹窗
      imgPreviewUrlList.value = [];
      isImgPreview.value = false;
      // 解绑键盘事件
      // eslint-disable-next-line no-use-before-define
      removeKeydownListener();
    }
  };

  /**
   * 绑定键盘事件（预览弹窗显示时调用）
   */
  const addKeydownListener = async (): Promise<void> => {
    await nextTick();
    const container = imgPreviewRef.value?.$refs.container;
    if (!container) return;

    const imgViewerWrapper = container.querySelector(
      '.el-image-viewer__wrapper',
    ) as HTMLElement;
    imgViewerWrapper?.addEventListener('keydown', handleKeyPress);
  };

  /**
   * 解绑键盘事件
   */
  const removeKeydownListener = (): void => {
    const container = imgPreviewRef.value?.$refs.container;
    if (!container) return;

    const imgViewerWrapper = container.querySelector(
      '.el-image-viewer__wrapper',
    ) as HTMLElement;
    imgViewerWrapper?.removeEventListener('keydown', handleKeyPress);
  };

  /**
   * 处理 Markdown 预览区点击
   * @param event 点击事件对象
   */
  const handlePreviewerImgClick = (event: MouseEvent): void => {
    const target = event?.target as HTMLElement;

    // 图片元素点击
    if (isElement(target, 'IMG') && target) {
      openImgPreview((target as IParams).src);
      return;
    }

    // mermaid流程图点击
    const mermaidSvg = getMermaidSvg(target);
    if (mermaidSvg) {
      openImgPreview(svgToBase64(mermaidSvg));
    }
  };

  /**
   * 图片预览关闭回调
   */
  const onPreviewClose = (): void => {
    imgPreviewUrlList.value = [];
    isImgPreview.value = false;
  };

  /**
   * 渲染图片预览组件（Element Plus ElImage）
   */
  const renderImgPreview = (): VNode => {
    return (
      <el-image
        class={ns.e('img-preview')}
        ref={imgPreviewRef}
        zoom-rate={1.1}
        src={imgPreviewUrl.value}
        preview-src-list={imgPreviewUrlList.value}
        hide-on-click-modal={true}
        onShow={addKeydownListener}
        onClose={onPreviewClose}
        fit='cover'
      />
    );
  };

  /**
   * Markdown 编辑器创建完成回调
   * @param mdeditor 编辑器实例（包含预览区 DOM）
   */
  const onMDEditorCreated = (mdeditor: IParams): void => {
    mdPreviewerDom = mdeditor?.previewer?.previewerBubble?.previewerDom || null;
    mdPreviewerDom?.addEventListener('click', handlePreviewerImgClick);
  };

  // 组件卸载时清理资源
  onBeforeUnmount(() => {
    // 解绑预览区点击事件
    if (mdPreviewerDom) {
      mdPreviewerDom.removeEventListener('click', handlePreviewerImgClick);
      mdPreviewerDom = null;
    }
    // 解绑键盘事件
    removeKeydownListener();
  });

  return {
    isImgPreview,
    renderImgPreview,
    onMDEditorCreated,
  };
}
