import { useNamespace } from '@ibiz-template/vue3-util';
import { IDETBUIActionItem } from '@ibiz/model-core';
import { defineComponent, onMounted, PropType, ref, VNode } from 'vue';
import { IToolbarController } from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import { convertBtnType } from '../../../util';
import './export-excel.scss';

export const IBizExportExcel = defineComponent({
  name: 'IBizExportExcel',
  props: {
    mode: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    item: {
      type: Object as PropType<IDETBUIActionItem>,
      required: true,
    },
    btnContent: {
      type: Function,
      required: true,
    },
    controller: {
      type: Object as PropType<IToolbarController>,
      required: true,
    },
  },
  emits: ['exportExcel'],
  setup(props, { emit }) {
    const ns = useNamespace('export-excel');
    const startPage = ref(1);
    const endPage = ref(9999);
    const maxRowCount = ref(1000);

    const xdataControl = props.controller.xdataControl;

    onMounted(() => {
      if (xdataControl)
        xdataControl.evt.on('onMounted', () => {
          maxRowCount.value =
            (xdataControl as IData).dataExport?.maxRowCount || 1000;
        });
    });

    const onCommand = (command: string, e: MouseEvent): void => {
      if (!command) {
        return;
      }
      emit('exportExcel', e, {
        type: command,
        startPage: startPage.value,
        endPage: endPage.value,
      });
    };
    return { ns, maxRowCount, endPage, startPage, onCommand };
  },
  render() {
    return this.$props.mode === 'menu' ? (
      <el-sub-menu
        index={this.$props.item.id}
        class={this.ns.b('submenu')}
        popper-class={this.ns.b('submenu-popper')}
      >
        {{
          title: () => {
            return (
              <el-button
                title={showTitle(this.item.tooltip)}
                size={this.$props.size}
                type={convertBtnType(this.item.buttonStyle)}
                class={this.ns.b('submenu-button')}
              >
                {this.btnContent(this.item)}
              </el-button>
            );
          },
          default: () => {
            return [
              <el-menu-item
                class={this.ns.b('menu-item')}
                onClick={(e: MouseEvent): void =>
                  this.onCommand('maxRowCount', e)
                }
              >
                {ibiz.i18n.t('control.toolbar.exportExcel.exportAll', {
                  maxRowCount: this.maxRowCount,
                })}
              </el-menu-item>,
              <el-menu-item
                class={this.ns.b('menu-item')}
                onClick={(e: MouseEvent): void =>
                  this.onCommand('activatedPage', e)
                }
              >
                {ibiz.i18n.t('control.toolbar.exportExcel.expCurrentPage')}
              </el-menu-item>,
              <el-menu-item
                class={this.ns.b('menu-item')}
                onClick={(e: MouseEvent): void =>
                  this.onCommand('selectedRows', e)
                }
              >
                {ibiz.i18n.t('control.toolbar.exportExcel.expCurrentSelect')}
              </el-menu-item>,
              <el-menu-item
                class={[this.ns.b('menu-item'), this.ns.e('custom')]}
              >
                <el-input
                  type='number'
                  v-model={this.startPage}
                  size='small'
                  maxlength='4'
                  onClick={(event: Event): void => {
                    event.stopPropagation();
                  }}
                  onChange={(value: number): void => {
                    this.startPage = value;
                  }}
                ></el-input>
                <span
                  class='item-text'
                  onClick={(event: Event): void => {
                    event.stopPropagation();
                  }}
                >
                  -
                </span>
                <el-input
                  v-model={this.endPage}
                  size='small'
                  type='number'
                  maxlength='4'
                  onClick={(event: Event): void => {
                    event.stopPropagation();
                  }}
                ></el-input>
                <span
                  class='item-text'
                  onClick={(event: Event): void => {
                    event.stopPropagation();
                  }}
                >
                  {ibiz.i18n.t('control.toolbar.exportExcel.page')}
                </span>
                <el-button
                  onClick={(e: MouseEvent): void =>
                    this.onCommand('customPage', e)
                  }
                  size='small'
                >
                  {ibiz.i18n.t('control.toolbar.exportExcel.export')}
                </el-button>
              </el-menu-item>,
            ];
          },
        }}
      </el-sub-menu>
    ) : (
      <el-dropdown
        trigger='click'
        size={this.$props.size}
        onCommand={this.onCommand}
        popper-class={this.ns.b()}
      >
        {{
          default: (): VNode => {
            return (
              <el-button
                size={this.$props.size}
                class={this.ns.e('button')}
                title={showTitle(this.item.tooltip)}
                type={convertBtnType(this.item.buttonStyle)}
              >
                {this.btnContent(this.item)}
              </el-button>
            );
          },
          dropdown: (): VNode => {
            return (
              <el-dropdown-menu>
                <el-dropdown-item command='maxRowCount'>
                  {ibiz.i18n.t('control.toolbar.exportExcel.exportAll', {
                    maxRowCount: this.maxRowCount,
                  })}
                </el-dropdown-item>

                <el-dropdown-item command='activatedPage'>
                  {ibiz.i18n.t('control.toolbar.exportExcel.expCurrentPage')}
                </el-dropdown-item>

                <el-dropdown-item command='selectedRows'>
                  {ibiz.i18n.t('control.toolbar.exportExcel.expCurrentSelect')}
                </el-dropdown-item>

                <el-dropdown-item class={this.ns.e('custom')} command=''>
                  <el-input
                    type='number'
                    v-model={this.startPage}
                    size='small'
                    maxlength='4'
                    onClick={(event: Event): void => {
                      event.stopPropagation();
                    }}
                    onChange={(value: number): void => {
                      this.startPage = value;
                    }}
                  ></el-input>
                  <span
                    class='item-text'
                    onClick={(event: Event): void => {
                      event.stopPropagation();
                    }}
                  >
                    -
                  </span>
                  <el-input
                    v-model={this.endPage}
                    size='small'
                    type='number'
                    maxlength='4'
                    onClick={(event: Event): void => {
                      event.stopPropagation();
                    }}
                  ></el-input>
                  <span
                    class='item-text'
                    onClick={(event: Event): void => {
                      event.stopPropagation();
                    }}
                  >
                    {ibiz.i18n.t('control.toolbar.exportExcel.page')}
                  </span>
                  <el-button
                    onClick={(e: MouseEvent): void =>
                      this.onCommand('customPage', e)
                    }
                    size='small'
                  >
                    {ibiz.i18n.t('control.toolbar.exportExcel.export')}
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            );
          },
        }}
      </el-dropdown>
    );
  },
});
