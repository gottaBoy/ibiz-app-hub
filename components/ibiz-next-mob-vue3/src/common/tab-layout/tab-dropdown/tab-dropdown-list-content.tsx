import { defineComponent, PropType } from 'vue';
import { IModal } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { layoutProps } from '../tab-layout-util';
import './tab-dropdown-list-content.scss';

export const TabDropdownListContent = defineComponent({
  name: 'IBizTabDropdownListContent',
  props: {
    modal: {
      type: Object as PropType<IModal>,
    },
    ...layoutProps,
  },
  setup(props) {
    const ns = useNamespace('tab-dropdown-list-content');
    const handleItemClick = (activeName: string) => {
      props.modal?.dismiss({ ok: true, data: [{ activeName }] });
    };
    const handleClose = () => {
      props.modal?.dismiss();
    };

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    return { ns, handleClick, handleClose, handleItemClick };
  },
  render() {
    return (
      <div class={[this.ns.b()]} onClick={this.handleClick}>
        <div class={this.ns.e('modal')} onClick={this.handleClose}></div>
        <div class={this.ns.e('wrapper')}>
          {this.tabPages.map(tab => {
            if (tab.isHidden) return;
            return (
              <div
                class={[
                  this.ns.e('item'),
                  this.ns.is('active', tab.id === this.activeName),
                ]}
                onClick={() => this.handleItemClick(tab.id)}
              >
                <iBizInfoItem label={tab.text} icon={tab.icon} />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
