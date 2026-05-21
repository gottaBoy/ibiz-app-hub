import { defineComponent, h, PropType, ref, resolveComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IModal } from '@ibiz-template/runtime';
import { CloseFullScreenSvg, CloseSvg, FullScreenSvg } from './icon/icon';
import './print-preview-markdown.scss';

export const PrintPreviewMarkdown = defineComponent({
  name: 'PrintPreviewMarkdown',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const ns = useNamespace('print-preview-markdown');
    const printPreview = ref();
    const isFull = ref(false);
    //  切换全屏
    const switchFull = () => {
      if (isFull.value) {
        ibiz.fullscreenUtil.closeElementFullscreen();
      } else {
        ibiz.fullscreenUtil.openElementFullscreen(printPreview.value);
      }
      isFull.value = !isFull.value;
    };

    // 点击关闭
    const onClose = () => {
      props.modal.dismiss();
    };

    // 绘制头部，关闭按钮仅在全屏时显示
    const renderHeader = () => {
      return (
        <div class={ns.e('header')}>
          <div class={ns.em('header', 'caption')}>
            {ibiz.i18n.t('util.printPreviewUtil.title')}
          </div>
          <div class={ns.em('header', 'action')}>
            <div
              class={ns.em('header', 'full')}
              onClick={switchFull}
              title={ibiz.i18n.t(
                isFull.value ? 'app.cancelFullscreen' : 'app.fullscreen',
              )}
            >
              {isFull.value ? <CloseFullScreenSvg /> : <FullScreenSvg />}
            </div>
            {isFull.value && (
              <div
                class={ns.em('header', 'close')}
                onClick={onClose}
                title={ibiz.i18n.t('app.close')}
              >
                <CloseSvg />
              </div>
            )}
          </div>
        </div>
      );
    };

    //  绘制内容
    const renderContent = () => {
      const markdown = resolveComponent('IBizMarkDown');
      return (
        <div class={ns.e('content')}>
          {h(markdown, {
            value: props.value,
            readonly: true,
          })}
        </div>
      );
    };
    return { ns, printPreview, renderHeader, renderContent };
  },
  render() {
    return (
      <div class={this.ns.b()} ref='printPreview'>
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  },
});
