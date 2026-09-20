import { PropType, defineComponent, ref } from 'vue';
import { useNamespace } from '../../../use';
import { aggModeList } from '../../../util/constant-data';
import { biReportT } from '../../../locale';
import './bi-aggmode-select.scss';

export const BIAggmodeSelect = defineComponent({
  name: 'BIAggmodeSelect',
  props: {
    item: {
      type: Object as PropType<IData>,
      required: true,
    },
    value: {
      type: String,
    },
  },
  emit: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('bi-aggmode-select');
    const aggmodeVisible = ref(false); // aggmode显隐

    const aggModeClick = (value: string, event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      aggmodeVisible.value = false;
      emit('change', value);
    };

    const handleClick = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
    };
    return {
      ns,
      aggModeList,
      aggmodeVisible,
      handleClick,
      aggModeClick,
    };
  },
  render() {
    return (
      <el-popover
        v-model:visible={this.aggmodeVisible}
        popper-class={this.ns.e('aggmode-container')}
        placement='right-start'
        width={200}
      >
        {{
          reference: () => {
            return (
              <div
                class={[
                  this.ns.e('aggmode'),
                  this.ns.em('aggmode', 'group-item'),
                ]}
                onPointerup={this.handleClick}
              >
                <span>
                  <svg
                    viewBox='0 0 16 16'
                    xmlns='http://www.w3.org/2000/svg'
                    height='1em'
                    width='1em'
                    focusable='false'
                    fill='currentColor'
                  >
                    <g
                      id='ade1.Base基础/1.icon图标/1.-action/arithmetic'
                      stroke-width='1'
                      fill-rule='evenodd'
                    >
                      <g
                        id='ade计算_arithmetic'
                        transform='translate(1.4 1.4)'
                        fill-rule='nonzero'
                      >
                        <path
                          d='M12.6 12.824a.6.6 0 0 1 .097 1.192l-.097.008H7.933a.6.6 0 0 1-.097-1.192l.097-.008H12.6zm.413-12.66a.6.6 0 0 1 .09.764l-.068.085-12 12.649a.6.6 0 0 1-.937-.741l.067-.085 12-12.649a.6.6 0 0 1 .848-.022zM12.6 9.663a.6.6 0 0 1 .097 1.192l-.097.008H7.933a.6.6 0 0 1-.097-1.192l.097-.008H12.6zM3.267 0a.6.6 0 0 1 .592.503L3.867.6l-.001 2.21h2.067a.6.6 0 0 1 .098 1.193l-.098.008-2.067-.001v2.212a.6.6 0 0 1-1.191.097l-.008-.097-.001-2.212H.6A.6.6 0 0 1 .503 2.82L.6 2.81l2.066-.001V.6a.6.6 0 0 1 .6-.6z'
                          id='ade形状结合'
                        ></path>
                      </g>
                    </g>
                  </svg>
                  <span>{biReportT('calculate')}</span>
                </span>
                <svg
                  viewBox='0 0 16 16'
                  xmlns='http://www.w3.org/2000/svg'
                  height='1em'
                  width='1em'
                  focusable='false'
                  fill='currentColor'
                >
                  <g
                    id='abbnavigation/angle-right'
                    stroke-width='1'
                    fill-rule='evenodd'
                  >
                    <path
                      d='M7.978 11.498l-.005.005L2.3 5.831 3.13 5l4.848 4.848L12.826 5l.83.831-5.673 5.672-.005-.005z'
                      id='abb形状结合'
                      transform='rotate(-90 7.978 8.252)'
                    ></path>
                  </g>
                </svg>
              </div>
            );
          },
          default: () => {
            return (
              <div class={[this.ns.e('aggmode-list')]}>
                {this.aggModeList.map((mode: IData) => {
                  return (
                    <div
                      class={[
                        this.ns.em('aggmode-list', 'item'),
                        this.ns.is('selected', this.value === mode.value),
                      ]}
                      onPointerup={(event: MouseEvent) =>
                        this.aggModeClick(mode.value, event)
                      }
                    >
                      {mode.name}
                    </div>
                  );
                })}
              </div>
            );
          },
        }}
      </el-popover>
    );
  },
});
