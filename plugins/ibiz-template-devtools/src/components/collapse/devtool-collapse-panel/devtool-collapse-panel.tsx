import { defineComponent, inject, ref, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import { TransitionHeight } from '../transition-height/transition-height';
import './devtool-collapse-panel.scss';

export const DevToolCollapsePanel = defineComponent({
  name: 'DevToolCollapsePanel',
  component: [TransitionHeight],
  props: {
    title: String, // 折叠面板的标题
    name: String, // 折叠面板的名字，即为唯一标识符（不可与其他重复！）
    // 是否隐藏小箭头，默认false，即展示小箭头
    hiddenArrow: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ns = useNamespace('devtool-collapse-panel');
    const transitionWrap = ref();
    const height = ref<number>(0);
    const collapse = inject('collapse') as IData;
    const isOpen = ref<boolean>(false);
    watch(
      () => [collapse.openArr.value, props.name],
      () => {
        isOpen.value = collapse.openArr.value.includes(props.name);
      },
      { immediate: true, deep: true },
    );
    const handleHeaderClick = (event: MouseEvent): void => {
      event.stopPropagation();
      collapse.updateVModel(props.name, isOpen.value);
      isOpen.value = !isOpen.value; // 内容依托于变量isOpen直接更新即可
    };

    const renderSvg = (): JSX.Element => {
      return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
          <path
            fill='currentColor'
            d='M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z'
          ></path>
        </svg>
      );
    };

    return { ns, transitionWrap, height, handleHeaderClick, isOpen, renderSvg };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div
          class={this.ns.e('header')}
          onClick={(event: MouseEvent) => this.handleHeaderClick(event)}
        >
          <span>{this.title}</span>
          {!this.hiddenArrow ? (
            <div class={[this.ns.e('icon'), this.isOpen ? 'rotate90deg' : '']}>
              {this.renderSvg()}
            </div>
          ) : null}
        </div>
        <TransitionHeight
          class='transitionHeight'
          show={this.isOpen}
          key={createUUID()}
        >
          <div class={this.ns.e('body')}>{this.$slots.default?.()}</div>
        </TransitionHeight>
      </div>
    );
  },
});
export default DevToolCollapsePanel;
