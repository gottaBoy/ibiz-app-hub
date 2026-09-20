import { PropType, defineComponent, ref } from 'vue';
import { useNamespace } from '../../../use';
import './collapse-item.scss';
import { biReportT } from '../../../locale';

/** BI报表折叠组件 */
export default defineComponent({
  name: 'BICollapseItem',
  props: {
    label: {
      type: String as PropType<string>,
      required: true,
    },
    enableShowEmptyData: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: true,
    },
    enableRemove: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: true,
    },
    enableEditMode: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: true,
    },
    enableSwitch: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: true,
    },
    switchValue: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: true,
    },
    name: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    editMode: {
      type: String,
    },
  },
  emits: ['switchChange', 'svgClick'],
  setup(props, { emit }) {
    const ns = useNamespace('collapse-item');

    const showEmptyDataSvg = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g
            id='apm1.Base基础/1.icon图标/2.normal/more-vertical'
            stroke-width='1'
            fill-rule='evenodd'
          >
            <path
              d='M8 4.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm0 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm0 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z'
              id='apm形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    const editModeSvg = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g
            id='akn1.Base基础/1.icon图标/2.normal/filter备份'
            stroke-width='1'
            fill-rule='evenodd'
          >
            <path
              d='M1.6 2h12.8a.6.6 0 0 1 0 1.2H1.6a.6.6 0 1 1 0-1.2zm2.5 5.393h7.8a.6.6 0 0 1 0 1.2H4.1a.6.6 0 1 1 0-1.2zm2.5 5.416h2.8a.6.6 0 0 1 0 1.2H6.6a.6.6 0 1 1 0-1.2z'
              id='akn形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    const removeSvg = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g id='aweaction/sweep' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M11.6 14.8h2.7v-4.7H1.7v4.7h2.7v-2.9h1.2v2.9h1.8v-3.9h1.2v3.9h1.8v-2.9h1.2v2.9zm2.7-5.9V6.2h-5v-5H6.7v5h-5v2.7h12.6zM5.5 5V1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4h4a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4z'
              id='awe形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    // 是否展示模式切换弹窗
    const visible = ref(false);

    // 选中图标
    const checkSvg = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g stroke-width='1' fill-rule='evenodd'>
            <path d='M6.012 11.201L1.313 6.832l-.817.879 5.54 5.15 9.304-9.163-.842-.855z'></path>
          </g>
        </svg>
      );
    };

    const ClickSvg = (event: MouseEvent, mode: string, value?: string) => {
      emit('svgClick', { event, mode, value });
    };

    const switchChange = () => {
      emit('switchChange', !props.switchValue);
    };

    return {
      ns,
      visible,
      showEmptyDataSvg,
      editModeSvg,
      removeSvg,
      checkSvg,
      ClickSvg,
      switchChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <el-collapse-item name={this.name} class={this.ns.e('item-content')}>
          {{
            default: () => this.$slots.default?.(),
            title: () => {
              return (
                <div class={this.ns.e('item')}>
                  <div
                    class={[
                      this.ns.e('item-title'),
                      this.ns.is('required', this.required),
                    ]}
                  >
                    {this.label}
                  </div>
                  <div class={this.ns.e('item-wrapper')}>
                    {this.enableShowEmptyData ? (
                      <div
                        class={[
                          this.ns.e('item-showEmptyData'),
                          this.ns.e('item-div'),
                        ]}
                        onClick={(event: MouseEvent) => {
                          event.stopPropagation();
                          this.ClickSvg(event, 'showEmptyData');
                        }}
                      >
                        {this.showEmptyDataSvg()}
                      </div>
                    ) : null}
                    {this.enableEditMode ? (
                      <el-tooltip
                        effect='dark'
                        content={biReportT('switchEditMode')}
                        placement='top'
                        popper-class={this.ns.e('tooltip')}
                      >
                        <div
                          class={[
                            this.ns.e('item-editMode'),
                            this.ns.e('item-div'),
                          ]}
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            this.visible = true;
                          }}
                        >
                          <el-popover
                            v-model:visible={this.visible}
                            placement='bottom-start'
                            popper-class={this.ns.b('editMode-popover')}
                            show-arrow={false}
                            width={240}
                            trigger='click'
                          >
                            {{
                              reference: () => {
                                return this.editModeSvg();
                              },
                              default: () => {
                                return (
                                  <div
                                    class={this.ns.b(
                                      'editMode-popover-content',
                                    )}
                                  >
                                    <div
                                      class={this.ns.b('editMode-popover-item')}
                                      onClick={(event: MouseEvent) => {
                                        event.stopPropagation();
                                        this.visible = false;
                                        this.ClickSvg(
                                          event,
                                          'editMode',
                                          'default',
                                        );
                                      }}
                                    >
                                      <div
                                        class={this.ns.be(
                                          'editMode-popover-item',
                                          'text',
                                        )}
                                      >
                                        {biReportT('basic')}
                                      </div>
                                      {this.editMode !== 'pql' &&
                                        this.checkSvg()}
                                    </div>
                                    <div
                                      class={this.ns.b('editMode-popover-item')}
                                      onClick={(event: MouseEvent) => {
                                        event.stopPropagation();
                                        this.visible = false;
                                        this.ClickSvg(event, 'editMode', 'pql');
                                      }}
                                    >
                                      <div
                                        class={this.ns.be(
                                          'editMode-popover-item',
                                          'text',
                                        )}
                                      >
                                        PQL
                                      </div>
                                      {this.editMode === 'pql' &&
                                        this.checkSvg()}
                                    </div>
                                  </div>
                                );
                              },
                            }}
                          </el-popover>
                        </div>
                      </el-tooltip>
                    ) : null}
                    {this.enableRemove ? (
                      <el-tooltip
                        effect='dark'
                        content={biReportT('clear')}
                        placement='top'
                        popper-class={this.ns.e('tooltip')}
                      >
                        <div
                          class={[
                            this.ns.e('item-remove'),
                            this.ns.e('item-div'),
                          ]}
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            this.ClickSvg(event, 'remove');
                          }}
                        >
                          {this.removeSvg()}
                        </div>
                      </el-tooltip>
                    ) : null}
                    {this.enableSwitch ? (
                      <div class={[this.ns.e('item-switch')]}>
                        <el-switch
                          model-value={this.switchValue}
                          onChange={this.switchChange}
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            },
          }}
        </el-collapse-item>
      </div>
    );
  },
});
