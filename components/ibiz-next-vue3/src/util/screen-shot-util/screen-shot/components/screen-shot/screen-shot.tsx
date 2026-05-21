import { useNamespace } from '@ibiz-template/vue3-util';
import { PropType, defineComponent, onMounted, onUnmounted } from 'vue';
import { ScreenShotController } from '../../controller';
import { IBrushOption, ToolbarItemType } from '../../type';
import { ScreenShotToolbar } from '../screen-shot-toolbar/screen-shot-toolbar';
import './screen-shot.scss';

export const ScreenShot = defineComponent({
  name: 'IBizScreenShot',
  props: {
    /**
     * 生成Canvas的画布元素
     */
    element: {
      type: Object as PropType<HTMLElement>,
      required: true,
    },
    /**
     * dom中的滚动容器
     */
    container: {
      type: Object as PropType<HTMLElement>,
    },
    /**
     * 滚动项类名，用于排除不在滚动容器的项绘制
     */
    itemClassName: {
      type: String,
    },
  },
  emits: {
    complete: (_base64: string) => true,
    cancel: () => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('screen-shot');

    const c = new ScreenShotController();

    const {
      isLoading,
      history,
      textStatus,
      toolbarStatus,
      canvasElement,
      textInputElement,
    } = c.store;

    /**
     * @description 处理组件关闭
     */
    const handleClose = (): void => {
      emit('cancel');
    };

    /**
     * @description 处理工具栏点击
     * @param {ToolbarItemType} type 工具栏类型
     * @param {IBrushOption} opt 画笔配置
     */
    const handleToolBarClick = (
      type: ToolbarItemType,
      opt: IBrushOption,
    ): void => {
      if (type === ToolbarItemType.CLOSE) {
        handleClose();
        return;
      }
      c.onToolClick(type, opt);
      if (type === ToolbarItemType.AI)
        emit('complete', canvasElement.value!.toDataURL('png'));
    };

    /**
     * @description 处理按键事件
     * @param {KeyboardEvent} e
     */
    const keydownHandle = (e: KeyboardEvent): void => {
      // 监听 ESC 键
      if (e.code === 'Escape') handleClose();

      // Ctrl + Z
      if (e.ctrlKey && e.code === 'KeyZ') {
        c.goBackToHistory();
      }
      // Ctrl + Y
      if (e.ctrlKey && e.code === 'KeyY') {
        c.goForwardToHistory();
      }
    };

    onMounted(() => {
      c.domToCanvas(props.element, {
        container: props.container,
        itemClassName: props.itemClassName,
      });
      document.addEventListener('keydown', keydownHandle);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', keydownHandle);
    });

    return {
      c,
      ns,
      history,
      isLoading,
      textStatus,
      toolbarStatus,
      canvasElement,
      textInputElement,
      handleToolBarClick,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.c.store.toolbarName.value
            ? this.ns.m(this.c.store.toolbarName.value.toLowerCase())
            : '',
        ]}
        id='screenShotContainer'
        onMouseup={() => this.c.mouseUpEvent()}
      >
        {this.isLoading && (
          <div class='el-loading-mask'>
            <div class='el-loading-spinner'>
              <svg class='circular' viewBox='0 0 50 50'>
                <circle
                  class='path'
                  cx='25'
                  cy='25'
                  r='20'
                  fill='none'
                ></circle>
              </svg>
              <p class='el-loading-text'>
                {ibiz.i18n.t('util.screenShotUtil.prepareCanvas')}
              </p>
            </div>
          </div>
        )}
        {this.toolbarStatus && (
          <ScreenShotToolbar
            history={this.history}
            class={this.ns.e('toolber')}
            onItemClick={this.handleToolBarClick}
          />
        )}
        <canvas
          ref='canvasElement'
          id='canvasContainer'
          class={this.ns.e('canvas')}
          onMousedown={evt => this.c.mouseDownEvent(evt)}
          onMousemove={evt => this.c.mouseMoveEvent(evt)}
        ></canvas>
        <div
          ref='textInputElement'
          id='textInputContainer'
          spellcheck={false}
          contenteditable={true}
          class={[this.ns.e('text'), this.ns.is('show', this.textStatus)]}
        ></div>
      </div>
    );
  },
});
