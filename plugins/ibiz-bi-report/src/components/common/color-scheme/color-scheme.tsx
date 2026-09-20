import { PropType, defineComponent, ref, watch } from 'vue';
import { createUUID } from 'qx-util';
import './color-scheme.scss';
import { biReportDefaultText } from '../../../locale';
import { useNamespace } from '../../../use';

export interface ColorItem {
  /**
   * 文本
   *
   * @author tony001
   * @date 2024-05-30 18:05:49
   * @type {string}
   */
  text: string;

  /**
   * 值
   *
   * @author tony001
   * @date 2024-05-30 18:05:57
   * @type {(string | string[])}
   */
  value: string | string[];
}

export default defineComponent({
  name: 'BIColorScheme',
  props: {
    colorList: {
      type: Array as PropType<ColorItem[]>,
    },
    editorStyle: {
      type: String as PropType<'ITEM' | 'ITEMS'>,
      default: 'ITEM',
    },
    value: {
      type: Object as PropType<IData>,
      default: () => {},
    },
  },
  emits: {
    change: (_value: {
      colorScheme: 'default' | 'template';
      color: string | string[];
    }) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace(`color-scheme`);

    const schemes = [
      {
        text: '系统配色',
        value: 'default',
      },
      {
        text: '模板配色',
        value: 'template',
      },
    ] as const;

    const currentScheme = ref<(typeof schemes)[number]['value']>(
      schemes[0].value,
    );

    // 颜色列表
    let templateColorList: (ColorItem & { key?: string })[] = [
      {
        text: '简约蓝',
        value:
          props.editorStyle === 'ITEM'
            ? '#6698FF'
            : [
                '#6698FF',
                '#73DEB3',
                '#7585A2',
                '#F7BE21',
                '#EE734A',
                '#83D0EE',
              ],
      },
      {
        text: '秋日橙',
        value:
          props.editorStyle === 'ITEM'
            ? '#EE734A'
            : [
                '#EE734A',
                '#7585A2',
                '#FEC103',
                '#9EB411',
                '#CD8050',
                '#DAD5B5',
              ],
      },
      {
        text: '马卡龙',
        value:
          props.editorStyle === 'ITEM'
            ? '#467CE6'
            : [
                '#467CE6',
                '#CD74CA',
                '#4997CC',
                '#BCBFE3',
                '#666CEB',
                '#82BC9A',
              ],
      },
      {
        text: '薄荷绿',
        value:
          props.editorStyle === 'ITEM'
            ? '#118299'
            : [
                '#118299',
                '#13B3B3',
                '#73DEB3',
                '#FEC103',
                '#9EB411',
                '#83D0EE',
              ],
      },
    ];

    if (props.colorList && props.colorList.length) {
      templateColorList = props.colorList;
    }

    templateColorList = templateColorList.map(item => {
      return {
        ...item,
        key: createUUID(),
      };
    });

    const currentColorKey = ref(templateColorList[0].key); // 当前选中颜色key
    const currentColor = ref(templateColorList[0].value); // 当前选中颜色value

    // 配色方式选择
    const handleSchemeChange = () => {
      const value = currentScheme.value;
      if (value === 'default') {
        emit('change', {
          colorScheme: 'default',
          color: templateColorList[0].value,
        });
      }
      if (value === 'template') {
        currentColorKey.value = templateColorList[0].key;
        currentColor.value = templateColorList[0].value;
        emit('change', { colorScheme: 'template', color: currentColor.value });
      }
    };

    // 模板配色选择
    const handleTemplateColorChange = () => {
      const color = templateColorList.find(
        item => item.key === currentColorKey.value,
      );
      if (color) {
        currentColor.value = color.value;
        emit('change', {
          colorScheme: currentScheme.value,
          color: currentColor.value,
        });
      }
    };

    watch(
      () => props.value,
      newVal => {
        if (!newVal) {
          currentColorKey.value = templateColorList[0].key;
          currentColor.value = templateColorList[0].value;
          return;
        }
        const { colorScheme, color } = newVal;

        currentScheme.value = colorScheme;
        if (colorScheme === 'default') {
          currentColorKey.value = templateColorList[0].key;
          currentColor.value = templateColorList[0].value;
          return;
        }
        if (typeof color === 'string') {
          const data = templateColorList.find((item: IData) => {
            return item.value === color;
          });
          if (data) {
            currentColorKey.value = data.key;
            currentColor.value = data.value;
          }
        } else {
          const data = templateColorList.find((item: IData) => {
            return JSON.stringify(item.value) === JSON.stringify(color);
          });
          if (data) {
            currentColorKey.value = data.key;
            currentColor.value = data.value;
          }
        }
      },
      { immediate: true },
    );

    return {
      ns,
      schemes,
      currentScheme,
      templateColorList,
      currentColorKey,
      currentColor,
      handleSchemeChange,
      handleTemplateColorChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('content')}>
          <el-select
            class={this.ns.b('picker')}
            popper-class={this.ns.b('popper')}
            v-model={this.currentScheme}
            onChange={this.handleSchemeChange}
          >
            {this.schemes.map(scheme => {
              return (
                <el-option
                  key={scheme.value}
                  label={biReportDefaultText(scheme.text)}
                  value={scheme.value}
                />
              );
            })}
          </el-select>
          {this.currentScheme === 'template' && (
            <el-select
              class={this.ns.b('template-color-picker')}
              popper-class={this.ns.b('popper')}
              v-model={this.currentColorKey}
              onChange={this.handleTemplateColorChange}
            >
              {{
                default: () => {
                  return this.templateColorList.map(color => {
                    return (
                      <el-option
                        key={color.key}
                        label={biReportDefaultText(color.text)}
                        value={color.key}
                      >
                        <div class={this.ns.b('template-color-picker-option')}>
                          {Array.isArray(color.value) ? (
                            color.value.map(item => (
                              <div
                                class={this.ns.be(
                                  'template-color-picker',
                                  'icon',
                                )}
                                style={{ background: item }}
                              ></div>
                            ))
                          ) : (
                            <div
                              class={this.ns.be(
                                'template-color-picker',
                                'icon',
                              )}
                              style={{ background: color.value }}
                            ></div>
                          )}

                          <div
                            class={this.ns.be('template-color-picker', 'text')}
                          >
                            {biReportDefaultText(color.text)}
                          </div>
                        </div>
                      </el-option>
                    );
                  });
                },
                prefix: () => {
                  return Array.isArray(this.currentColor) ? (
                    this.currentColor.map(item => (
                      <div
                        class={this.ns.be('template-color-picker', 'icon')}
                        style={{ background: item }}
                      ></div>
                    ))
                  ) : (
                    <div
                      class={this.ns.be('template-color-picker', 'icon')}
                      style={{ background: this.currentColor }}
                    ></div>
                  );
                },
              }}
            </el-select>
          )}
        </div>
      </div>
    );
  },
});
