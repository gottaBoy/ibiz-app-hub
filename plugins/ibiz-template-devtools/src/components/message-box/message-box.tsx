import { defineComponent, Transition } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './message-box.scss';
import { devtoolT } from '../../locale/helper';

export const MessageBox = defineComponent({
  name: 'MessageBox',
  component: [Transition],
  props: {
    isShowDialog: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    showCloseIcon: {
      type: Boolean,
      default: true,
    },
    mask: {
      type: Boolean,
      default: true,
    },
    isShowFoot: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['hasClosed', 'changeDialog'],
  setup(props, { emit }) {
    const ns = useNamespace('devtool-dialog');
    const closeDialog = (type: string = ''): void => {
      emit('changeDialog', false);
      emit('hasClosed', type);
    };

    const renderSvg = (): JSX.Element => {
      return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
          <path
            fill='currentColor'
            d='M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z'
          ></path>
        </svg>
      );
    };

    const clickMaskCloseFn = (): void => {
      closeDialog();
    };

    const clickButton = (type: string): void => {
      closeDialog(type);
    };

    return { ns, clickMaskCloseFn, closeDialog, renderSvg, clickButton };
  },
  render() {
    return (
      <Transition name='animation'>
        {this.isShowDialog && (
          <div
            class={[this.ns.b(), this.mask ? 'isShowMask' : '']}
            onClick={this.clickMaskCloseFn}
          >
            <div
              class={this.ns.e('wrapper')}
              onClick={e => e.stopPropagation()}
            >
              <div class={this.ns.e('header')}>
                <span>{this.title}</span>
                {this.showCloseIcon && (
                  <div
                    class={this.ns.e('icon')}
                    onClick={() => this.closeDialog('')}
                  >
                    {this.renderSvg()}
                  </div>
                )}
              </div>
              <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
              <div class={this.ns.e('footer')}>
                <button
                  class={this.ns.e('footer-button')}
                  onClick={() => this.clickButton('cancel')}
                >
                  {devtoolT('cancel')}
                </button>
                <button
                  class={this.ns.e('footer-button')}
                  onClick={() => this.clickButton('confirm')}
                >
                  {devtoolT('save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Transition>
    );
  },
});

export default MessageBox;
