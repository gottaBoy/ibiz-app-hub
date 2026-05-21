import { PropType, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './mdctrl-container.scss';

export const MDCtrlContainer = defineComponent({
  name: 'IBizMDCtrlContainer',
  props: {
    enableCreate: {
      type: Boolean,
      required: true,
    },
    enableDelete: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Object as PropType<IData[]>,
      required: true,
    },
    caption: {
      type: String,
      required: false,
    },
  },
  emits: {
    addClick: (_index?: number) => true,
    removeClick: (_data: IData, _index: number) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('mdctrl-container');

    const renderAddBtn = (index?: number, showButton: boolean = true) => {
      if (!props.enableCreate) {
        return null;
      }
      return (
        <van-button
          class={[ns.e('create'), ns.e('btn')]}
          size='small'
          onClick={(): void =>
            emit('addClick', index === undefined ? undefined : index + 1)
          }
        >
          {showButton && <van-icon name='plus' />}
          {ibiz.i18n.t('app.add')}
        </van-button>
      );
    };

    return { ns, renderAddBtn };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.items.map((item, index) => {
          const formComponent = this.$slots.item ? (
            this.$slots.item({ data: item, index })
          ) : (
            <div>{ibiz.i18n.t('control.form.mdCtrlContainer.noSlot')}</div>
          );
          return (
            <div class={this.ns.b('item')} key={item.id}>
              <div class={this.ns.b('item-header')}>
                <div class={this.ns.be('item-header', 'caption')}>
                  {this.caption || ''}
                </div>
              </div>
              <div class={this.ns.b('item-content')}>
                <van-swipe-cell>
                  {{
                    default: () => {
                      return formComponent;
                    },
                    right: () => {
                      if (!this.enableDelete) {
                        return;
                      }
                      return (
                        <van-button
                          class={this.ns.be('item-content', 'remove-btn')}
                          type='danger'
                          text={ibiz.i18n.t('app.delete')}
                          square={true}
                          onClick={() => {
                            this.$emit('removeClick', item, index);
                          }}
                        />
                      );
                    },
                  }}
                </van-swipe-cell>
              </div>
            </div>
          );
        })}
        {this.enableCreate && (
          <div class={this.ns.b('footer')}>{this.renderAddBtn()}</div>
        )}
      </div>
    );
  },
});
