import { PropType, VNode, computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '../../../use';
import './font-border-select.scss';
import { biReportT, biReportDefaultText } from '../../../locale';

/** 字体线条选择组件 */
export default defineComponent({
  name: 'BIFontBorderSelect',
  props: {
    disabled: {
      type: Boolean,
    },
    mode: {
      type: String as PropType<'FONT' | 'BORDER'>,
      default: 'FONT',
    },
    value: {
      type: Object as PropType<IData>,
      default: () => {},
    },
    fontMax: {
      type: Number,
      default: 48,
    },
    fontMin: {
      type: Number,
      default: 12,
    },
    borderMax: {
      type: Number,
      default: 10,
    },
    borderMin: {
      type: Number,
      default: 1,
    },
    useDotted: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace(`font-border-select`);

    const currentColor = ref<string | null>('');
    const selectValue = ref('');
    const isVisible = ref(false);
    // 数值
    const number = ref(12);

    // px输入框是否聚焦
    const isFocus = ref(false);

    watch(
      () => props.value,
      newVal => {
        if (isFocus.value) {
          return;
        }
        if (newVal) {
          const {
            fontWeight,
            fontStyle,
            fontSize,
            color,
            borderSize,
            borderStyle,
          } = newVal;
          if (props.mode === 'FONT') {
            selectValue.value =
              (fontStyle === 'italic' ? fontStyle : fontWeight) || '';
            number.value = fontSize;
            currentColor.value = color;
          } else {
            selectValue.value = borderStyle;
            number.value = borderSize;
            currentColor.value = color;
          }
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    const computedSelect = () => {
      if (selectValue.value === 'solid') {
        return 'solid';
      }
      if (selectValue.value === 'dashed') {
        return 'dashed';
      }
      if (selectValue.value === 'doubleDashed') {
        return 'doubleDashed';
      }
      if (selectValue.value === 'dotted') {
        return 'dotted';
      }
      return 'solid';
    };

    const emitFunc = () => {
      const num = number.value;
      let px = num;
      if (props.mode === 'FONT') {
        if (num >= props.fontMin || num <= props.fontMax) {
          px = num;
        }
        if (num < props.fontMin) {
          px = props.fontMin;
        }
        if (num > props.fontMax) {
          px = props.fontMax;
        }
      } else {
        if (num >= props.borderMin || num <= props.borderMax) {
          px = num;
        }
        if (num < props.borderMin) {
          px = props.borderMin;
        }
        if (num > props.borderMax) {
          px = props.borderMax;
        }
      }
      emit('change', {
        fontSize: px,
        fontWeight:
          selectValue.value !== 'italic' ? selectValue.value : 'normal',
        fontStyle: selectValue.value === 'italic' ? 'italic' : 'normal',
        borderSize: px,
        borderStyle: computedSelect(),
        color: currentColor.value,
      });
    };
    // 文本粗细数据
    const fontItem = [
      {
        value: 'normal',
        label: '常规',
      },
      {
        value: 'bold',
        label: '加粗',
      },
      {
        value: 'italic',
        label: '斜体',
      },
    ];

    // 边框粗细数据
    const borderItem = [
      {
        value: 'solid',
        label: 'normalBorder',
      },
      {
        value: 'dashed',
        label: 'dashed',
      },
      {
        value: 'doubleDashed',
        label: 'doubleDashed',
      },
      {
        value: 'dotted',
        label: 'dotted',
      },
    ];

    // 正常边框
    const normalBorder = () => {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='3'
          style='font-family: Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif; font-size: 12px;'
        >
          <desc>Line Type</desc>
          <defs></defs>
          <path
            fill='none'
            d='M 0 0 L 150 0'
            stroke-width='3'
            stroke='#cacaca'
            stroke-dasharray='none'
          ></path>
        </svg>
      );
    };

    // 虚线边框
    const dashed = () => {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='3'
          style='font-family: Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif; font-size: 12px;'
        >
          <desc>Line Type</desc>
          <defs></defs>
          <path
            fill='none'
            d='M 0 0 L 150 0'
            stroke-width='3'
            stroke='#cacaca'
            stroke-dasharray='8,6'
          ></path>
        </svg>
      );
    };

    // 双线边框
    const doubleDashed = () => {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='3'
          style='font-family: Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif; font-size: 12px;'
        >
          <desc>Line Type</desc>
          <defs></defs>
          <path
            fill='none'
            d='M 0 0 L 150 0'
            stroke-width='3'
            stroke='#cacaca'
            stroke-dasharray='16,6'
          ></path>
        </svg>
      );
    };

    // 点状边框
    const dotted = () => {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='3'
          style='font-family: Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif; font-size: 12px;'
        >
          <desc>Line Type</desc>
          <defs></defs>
          <path
            fill='none'
            d='M 0 0 L 150 0'
            stroke-width='3'
            stroke='#cacaca'
            stroke-dasharray='2,6'
          ></path>
        </svg>
      );
    };

    // 展示值
    const numberPx = computed({
      get: () => `${number.value.toString()} px`,
      set: val => {
        const num = parseInt(val, 10);
        if (Number.isNaN(num)) {
          number.value = 0;
        } else {
          number.value = num;
        }
        emitFunc();
      },
    });

    // 输入框失去焦点时触发
    const handleColNumberChange = (event: MouseEvent) => {
      isFocus.value = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const str = (event.target as any)?.value;
      const num = parseInt(str, 10);
      if (props.mode === 'FONT') {
        if (num >= props.fontMin || num <= props.fontMax) {
          number.value = num;
        }
        if (num < props.fontMin) {
          number.value = props.fontMin;
        }
        if (num > props.fontMax) {
          number.value = props.fontMax;
        }
      } else {
        if (num >= props.borderMin || num <= props.borderMax) {
          number.value = num;
        }
        if (num < props.borderMin) {
          number.value = props.borderMin;
        }
        if (num > props.borderMax) {
          number.value = props.borderMax;
        }
      }
      emitFunc();
    };

    // 加图标
    const addNumber = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g id='abdnavigation/angle-up' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M7.978 11.498l-.005.005L2.3 5.831 3.13 5l4.848 4.848L12.826 5l.83.831-5.673 5.672-.005-.005z'
              id='abd形状结合'
              transform='rotate(180 7.978 8.252)'
            ></path>
          </g>
        </svg>
      );
    };

    // 减图标
    const minusNumber = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g id='aaynavigation/angle-down' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M7.978 11.997l-.005.006L2.3 6.33l.83-.831 4.848 4.848L12.826 5.5l.83.83-5.673 5.673-.005-.006z'
              id='aay形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    // 加减数字
    const changeNumber = (mode: string) => {
      if (mode === 'add') {
        // 加
        number.value += 1;
        if (props.mode === 'FONT') {
          if (number.value > props.fontMax) {
            number.value = props.fontMax;
          }
        } else if (number.value > props.borderMax) {
          number.value = props.borderMax;
        }
      } else if (mode === 'minus') {
        // 减
        number.value -= 1;
        if (props.mode === 'FONT') {
          if (number.value < props.fontMin) {
            number.value = props.fontMin;
          }
        } else if (number.value < props.borderMin) {
          number.value = props.borderMin;
        }
      }
      emitFunc();
    };

    // 预制颜色
    const predefineColors = ref([
      '#000000',
      '#2C2C2C',
      '#50555C',
      '#ACB3BF',
      '#D0D3D9',
      '#C4C4C4',
      '#DADADA',
      '#E5E5E5',
      '#F0F0F0',
      '#F24E1E',
      '#E99C58',
      '#FFC700',
      '#FF4D00',
      '#FF00D6',
      '#D82E57',
      '#8E1DE8',
      '#0ACF83',
      '#18A0FB',
      '#A259FF',
      '#907CFF',
    ]);

    const arrowSvg = () => {
      return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
          <path
            fill='currentColor'
            d='M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z'
          ></path>
        </svg>
      );
    };

    const onDropDownClick = (item: IData) => {
      selectValue.value = item.value;
      emitFunc();
    };

    const dropDownVisible = (visible: boolean) => {
      isVisible.value = visible;
    };

    const colorChange = () => {
      emitFunc();
    };
    const selectChange = () => {
      emitFunc();
    };

    return {
      ns,
      fontItem,
      borderItem,
      normalBorder,
      dashed,
      doubleDashed,
      dotted,
      selectValue,
      number,
      numberPx,
      addNumber,
      minusNumber,
      handleColNumberChange,
      changeNumber,
      currentColor,
      selectChange,
      colorChange,
      predefineColors,
      onDropDownClick,
      arrowSvg,
      dropDownVisible,
      isVisible,
      isFocus,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('bottom-content')}>
          {/* 字体或线段选择 */}
          {this.mode === 'FONT' ? (
            <el-select
              v-model={this.selectValue}
              size='large'
              style='width: 95px'
              onChange={this.selectChange}
              disabled={this.disabled}
              popper-class={this.ns.e('select-popper')}
            >
              {this.fontItem.map(item => {
                return (
                  <el-option
                    key={item.value}
                    label={biReportDefaultText(item.label)}
                    value={item.value}
                  ></el-option>
                );
              })}
            </el-select>
          ) : (
            <el-dropdown
              class={[this.ns.e('dropdown')]}
              disabled={this.disabled}
              popper-class={this.ns.e('dropdown-popper')}
              onVisibleChange={(visible: boolean) => {
                this.dropDownVisible(visible);
              }}
            >
              {{
                default: (): VNode => (
                  <div
                    class={[
                      this.ns.e('dropdown-input'),
                      this.isVisible ? 'visible' : '',
                    ]}
                  >
                    {this.selectValue === '' && (
                      <div class={[this.ns.e('dropdown-input-content')]}>
                        {biReportT('select')}
                      </div>
                    )}
                    {this.selectValue === 'solid' && (
                      <div class={[this.ns.e('dropdown-input-content')]}>
                        {this.normalBorder()}
                      </div>
                    )}
                    {this.selectValue === 'dashed' && (
                      <div class={[this.ns.e('dropdown-input-content')]}>
                        {this.dashed()}
                      </div>
                    )}
                    {this.selectValue === 'doubleDashed' && (
                      <div class={[this.ns.e('dropdown-input-content')]}>
                        {this.doubleDashed()}
                      </div>
                    )}
                    {this.selectValue === 'dotted' && this.useDotted && (
                      <div class={[this.ns.e('dropdown-input-content')]}>
                        {this.dotted()}
                      </div>
                    )}
                    {this.arrowSvg()}
                  </div>
                ),
                dropdown: (): VNode => (
                  <el-dropdown-menu>
                    {this.borderItem.map(item => {
                      return (
                        <el-dropdown-item
                          class={[this.ns.e('dropdown-item')]}
                          onClick={() => this.onDropDownClick(item)}
                        >
                          {{
                            default: () => {
                              if (item.label === 'normalBorder') {
                                return this.normalBorder();
                              }
                              if (item.label === 'dashed') {
                                return this.dashed();
                              }
                              if (item.label === 'doubleDashed') {
                                return this.doubleDashed();
                              }
                              if (item.label === 'dotted') {
                                return this.dotted();
                              }
                            },
                          }}
                        </el-dropdown-item>
                      );
                    })}
                  </el-dropdown-menu>
                ),
              }}
            </el-dropdown>
          )}

          {/* px选择 */}
          <el-input
            class={this.ns.e('input-number')}
            v-model={this.numberPx}
            size={'large'}
            onBlur={this.handleColNumberChange}
            onFocus={() => {
              this.isFocus = true;
            }}
            disabled={this.disabled}
          >
            {{
              suffix: () => {
                return (
                  <div class={[this.ns.e('input-number-suffix')]}>
                    <span
                      class={[
                        this.ns.e('input-number-suffix-add'),
                        this.number ===
                        (this.mode === 'FONT' ? this.fontMax : this.borderMax)
                          ? 'readonly'
                          : '',
                      ]}
                      onClick={() => this.changeNumber('add')}
                    >
                      {this.addNumber()}
                    </span>
                    <span
                      class={[
                        this.ns.e('input-number-suffix-minus'),
                        this.number ===
                        (this.mode === 'FONT' ? this.fontMin : this.borderMin)
                          ? 'readonly'
                          : '',
                      ]}
                      onClick={() => this.changeNumber('minus')}
                    >
                      {this.minusNumber()}
                    </span>
                  </div>
                );
              },
            }}
          </el-input>
          {/* 颜色选择 */}
          <el-color-picker
            v-model={this.currentColor}
            disabled={this.disabled}
            size='large'
            predefine={this.predefineColors}
            onChange={this.colorChange}
            show-alpha
          ></el-color-picker>
        </div>
      </div>
    );
  },
});
