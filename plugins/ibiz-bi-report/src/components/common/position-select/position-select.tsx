import { PropType, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '../../../use';
import { icons, textIcons } from './position-select-iocns';
import './position-select.scss';
import { biReportDefaultText } from '../../../locale';

export default defineComponent({
  name: 'BIPositionSelect',
  props: {
    value: {
      type: String,
    },
    editorStyle: {
      type: String as PropType<'CENTER' | 'DIRECTION'>,
      default: 'CENTER',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showCenter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('position-select');
    const selected = ref('');
    watch(
      () => props.value,
      () => {
        if (!props.value) {
          if (props.editorStyle === 'CENTER') {
            selected.value = textIcons[0].value;
          } else {
            selected.value = icons[0].value;
          }
        } else {
          selected.value = props.value;
        }
      },
      {
        immediate: true,
      },
    );

    const onSelect = (item: IData) => {
      if (props.disabled) return;
      emit('change', item.value);
    };
    return { ns, selected, onSelect };
  },
  render() {
    let tmepItems = [];
    if (this.editorStyle === 'CENTER') {
      tmepItems = textIcons;
    } else {
      tmepItems = icons;
    }
    return (
      <div class={this.ns.b()}>
        {tmepItems.map((item: IData) => {
          if (
            (item.value === 'left' || item.value === 'right') &&
            !this.showCenter
          ) {
            return null;
          }
          return (
            <el-tooltip
              effect='dark'
              content={biReportDefaultText(item.caption)}
              placement='top'
              show-after={200}
              hide-after={0}
              popper-class={this.ns.e('tooltip')}
              show-arrow
            >
              {{
                default: () => {
                  return (
                    <div
                      class={[
                        this.ns.e('item'),
                        this.ns.is('selected', this.selected === item.value),
                        this.ns.is('disabled', this.disabled),
                      ]}
                      onClick={() => this.onSelect(item)}
                      v-html={item.icon}
                    ></div>
                  );
                },
              }}
            </el-tooltip>
          );
        })}
      </div>
    );
  },
});
