import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  resolveComponent,
  toRaw,
  watch,
} from 'vue';
import {
  ControlVO,
  EditFormController,
  EventBase,
  FormMDCtrlRepeaterController,
  IEditFormController,
} from '@ibiz-template/runtime';
import { useCtx, useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormDetail, IDEFormItem } from '@ibiz/model-core';
import { recursiveIterate } from '@ibiz-template/core';
import './repeater-grid.scss';

export const RepeaterGrid = defineComponent({
  name: 'IBizRepeaterGrid',
  props: {
    controller: {
      type: FormMDCtrlRepeaterController,
      required: true,
    },
  },
  emits: {
    change: (_value: IData[]) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('repeater-grid');

    // 表单项
    const formItems: IDEFormItem[] = [];

    // 数据
    const items = ref<IData[]>([]);

    // 上下文
    const ctx = useCtx();

    // 表单控制器
    const formControllers = reactive<IEditFormController[]>([]);

    // 容器
    const container = ref<HTMLElement>();

    // 表格
    const table = ref<HTMLElement>();

    // 表头
    const thead = ref<HTMLElement>();

    // 自适应宽度
    const flexWidth = ref(0);

    // 表格宽度
    const gridWidth = ref('');

    // 容器大小变化监听器
    let resizeObserver: ResizeObserver | undefined;

    recursiveIterate(
      props.controller.repeatedForm,
      (item: IDEFormDetail) => {
        if (item.detailType === 'FORMITEM') {
          // 隐藏表单项不绘制
          if ((item as IDEFormItem).editor?.editorType !== 'HIDDEN') {
            formItems.push(item);
          }
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
      },
    );

    // 单条数据改变时，更新数据
    const onSingleValueChange = (value: IData, index: number) => {
      const arrData = [...((props.controller.value || []) as IData[])];
      arrData[index] = value;
      emit('change', arrData);
    };

    // 添加表单控制器
    const addFormController = async (data: IData = {}) => {
      const formC = new EditFormController(
        props.controller.repeatedForm,
        props.controller.context,
        props.controller.params,
        ctx,
      );
      formC.state.isSimple = true;
      await formC.created();
      formC.setSimpleData(data);
      formControllers.push(formC);
      props.controller.setRepeaterController(
        `${formControllers.length - 1}`,
        formC,
      );
      formC.evt.on('onFormDataChange', (event: EventBase) => {
        // 隔离抛出不一样的对象
        const item = event.data[0];
        const formData = item instanceof ControlVO ? item.clone() : { ...item };
        const index = formControllers.indexOf(formC);
        onSingleValueChange(formData, index);
      });
    };

    watch(
      () => props.controller.value,
      newVal => {
        if (Array.isArray(newVal)) {
          newVal.forEach((item, index) => {
            const formC = formControllers[index] as EditFormController;
            if (formC) {
              const changeVal = item || {};
              // 找有没有不一致的属性
              const find = Object.keys(formC.data).find(key => {
                return changeVal[key] !== formC.data[key];
              });
              // 内外部数据不一致时，只能是外部修改了，这是更新数据并重走load
              if (find) {
                formC.setSimpleData(changeVal);
              }
            } else {
              addFormController(item);
            }
          });
          items.value = newVal;
        } else {
          items.value = [];
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    onMounted(() => {
      if (!container.value || !table.value || !thead.value) {
        return;
      }
      resizeObserver = new ResizeObserver(() => {
        if (!container.value || !table.value || !thead.value) {
          return;
        }

        const containerWidth = container.value.offsetWidth;
        const theadRow = thead.value.children[0];
        if (!theadRow) return;
        const thElements = Array.from(theadRow.children) as HTMLElement[];
        if (thElements.length === 0) return;

        let fixedWidthSum = 0;
        const flexThElements: HTMLElement[] = [];

        thElements.forEach(th => {
          const isFlow = th.dataset.flex === 'true';
          if (isFlow) {
            flexThElements.push(th);
          } else {
            const thWidth = th.style.width
              ? parseFloat(th.style.width)
              : th.offsetWidth;
            fixedWidthSum += thWidth;
          }
        });

        const availableSpace = containerWidth - fixedWidthSum - 1;
        const flowColumnCount = flexThElements.length;

        if (flowColumnCount > 0 && availableSpace > 0) {
          flexWidth.value = availableSpace / flowColumnCount;
          gridWidth.value = `${containerWidth}px`;
        } else {
          flexWidth.value = 0;
          gridWidth.value = `${fixedWidthSum}px`;
        }
      });
      resizeObserver.observe(container.value);
    });

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    return {
      ns,
      formItems,
      formControllers,
      items,
      container,
      table,
      thead,
      flexWidth,
      gridWidth,
    };
  },
  render() {
    const isEmpty = !this.items.length;

    // 表头行
    const headers = [
      <th class={this.ns.b('index-cell')} style={{ width: `66px` }}>
        {ibiz.i18n.t('control.form.repeaterGrid.index')}
      </th>,
      this.formItems.map(item => {
        return (
          <th
            class={this.ns.bm('cell', item.id)}
            data-flex={item.labelWidth === 1}
            style={{
              width: `${item.labelWidth === 1 ? `${this.flexWidth}px` : `${item.labelWidth}px`}`,
            }}
          >
            {item.caption}
          </th>
        );
      }),
      (this.controller.enableCreate || this.controller.enableDelete) && (
        <th class={this.ns.b('action-cell')} style={{ width: `80px` }}></th>
      ),
    ];

    // 表格行
    const rows = (
      isEmpty && this.controller.enableCreate ? [{}] : this.items
    ).map((_row: IData, index: number) => {
      return (
        <tr>
          <td class={this.ns.b('index-cell')}>{isEmpty ? '' : index + 1}</td>
          {this.formItems.map(item => {
            if (isEmpty) {
              return <td class={this.ns.bm('cell', item.id)}></td>;
            }
            const formC = toRaw(
              this.formControllers[index],
            ) as EditFormController;
            if (!formC || !formC.state.isLoaded) {
              return (
                <td>{ibiz.i18n.t('control.form.repeaterGrid.absentOrLoad')}</td>
              );
            }
            const formItemC = formC.formItems.find(x => x.name === item.id)!;

            let editor = null;
            if (!formItemC.editorProvider) {
              editor = <not-supported-editor modelData={item.editor} />;
            } else {
              const component = resolveComponent(
                formItemC.editorProvider.formEditor,
              );
              editor = h(component, {
                value: formItemC.value,
                data: formItemC.data,
                controller: formItemC.editor,
                disabled: formItemC.state.disabled,
                readonly: formItemC.state.readonly,
                onChange: (val: unknown, name?: string): void => {
                  formItemC.setDataValue(val, name);
                },
              });
            }
            return <td class={this.ns.bm('cell', item.id)}>{editor}</td>;
          })}
          {(this.controller.enableCreate || this.controller.enableDelete) && (
            <td class={this.ns.b('action-cell')}>
              <div class={this.ns.b('action-group')}>
                {this.controller.enableCreate && (
                  <ion-icon
                    name='add-outline'
                    title={ibiz.i18n.t('app.add')}
                    class={this.ns.b('add-btn')}
                    onClick={() => {
                      this.controller.create(isEmpty ? 0 : index + 1);
                    }}
                  ></ion-icon>
                )}
                {this.controller.enableDelete && !isEmpty && (
                  <ion-icon
                    name='remove-outline'
                    title={ibiz.i18n.t('app.delete')}
                    class={this.ns.b('remove-btn')}
                    onClick={() => {
                      this.controller.remove(index);
                      this.formControllers.splice(index, 1);
                    }}
                  ></ion-icon>
                )}
              </div>
            </td>
          )}
        </tr>
      );
    });

    return (
      <div class={this.ns.b()} ref='container'>
        <table
          class={this.ns.b('table')}
          ref='table'
          style={{
            width: this.gridWidth,
          }}
        >
          <thead ref='thead'>
            <tr>{headers}</tr>
          </thead>
          <tbody>{rows}</tbody>
          {isEmpty && !this.controller.enableCreate && (
            <tbody class={this.ns.b('empty-content')}>
              <td colspan={this.formItems.length + 1}>
                {ibiz.i18n.t('control.form.repeaterGrid.noData')}
              </td>
            </tbody>
          )}
        </table>
      </div>
    );
  },
});
