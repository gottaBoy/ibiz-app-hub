import { IModal } from '@ibiz-template/runtime';
import { PropType, defineComponent } from 'vue';
import { useNamespace } from '../../../use';
import './bi-axis.scss';
import { biReportT } from '../../../locale';

export const BIAxis = defineComponent({
  name: 'BIAxis',
  props: {
    value: {
      type: String,
      default: 'LEFT',
    },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('bi-axis');
    // 绘制选中图标
    const renderSelectIcon = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
          fill='currentColor'
        >
          <g id='agctips/check' stroke-width='1' fill-rule='evenodd'>
            <path
              id='agc路径-12'
              d='M6.012 11.201L1.313 6.832l-.817.879 5.54 5.15 9.304-9.163-.842-.855z'
            ></path>
          </g>
        </svg>
      );
    };

    // 点击
    const onClick = (tag: 'LEFT' | 'RIGHT') => {
      emit('change', tag);
    };

    // 离开关闭模态
    const onMouseLevel = () => {
      props.modal.dismiss();
    };
    return { ns, renderSelectIcon, onClick, onMouseLevel };
  },
  render() {
    return (
      <div class={this.ns.b()} onMouseleave={this.onMouseLevel}>
        <div class={this.ns.e('item')} onClick={() => this.onClick('LEFT')}>
          <span>{biReportT('leftAxis')}</span>
          {this.value === 'LEFT' && this.renderSelectIcon()}
        </div>
        <div class={this.ns.e('item')} onClick={() => this.onClick('RIGHT')}>
          <span>{biReportT('rightAxis')}</span>
          {this.value === 'RIGHT' && this.renderSelectIcon()}
        </div>
      </div>
    );
  },
});
