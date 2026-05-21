import {
  defineComponent,
  h,
  PropType,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormItem } from '@ibiz/model-core';
import { CompositeFormItemExController } from './composite-form-item-ex.controller';
import './composite-form-item-ex.scss';

export const CompositeFormItemEx = defineComponent({
  name: 'IBizCompositeFormItemEx',
  props: {
    modelData: {
      type: Object as PropType<IDEFormItem>,
      required: true,
    },
    controller: {
      type: Object as PropType<CompositeFormItemExController>,
      required: true,
    },
    attrs: {
      type: Object as PropType<IData>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('form-item');
    const ns2 = useNamespace('composite-form-item-ex');
    const c = props.controller;
    const onValueChange = (
      val: unknown,
      name?: string,
      ignore: boolean = false,
    ): void => {
      props.controller.setDataValue(val, name, ignore);
    };

    // 是否加载中
    const loading = ref<boolean>(true);

    // 编辑器实例
    const editorRef = ref<IData>();

    watch(
      () => props.controller.data?.[c.valueItem?.id || ''],
      value => {
        if (value) {
          c.updateEditor(value);
        } else {
          c.updateEditor(c.defaultType);
        }
      },
      { immediate: true },
    );

    watch(
      () => editorRef.value,
      value => {
        if (value) {
          loading.value = false;
        } else {
          loading.value = true;
        }
      },
    );

    return { ns, ns2, c, editorRef, loading, onValueChange };
  },
  render() {
    if (!this.c.state.visible || this.c.model.editor?.editorType === 'HIDDEN') {
      return null;
    }
    const editorType = this.c.editor?.model.editorType;
    const editorStyle = this.c.editor?.model.editorStyle || 'DEFAULT';
    const isIncludes = this.c.includesList.some(
      id => id === `${editorType}_${editorStyle}`,
    );

    // 编辑器切换菜单
    const editorSwitchMenu = (
      <el-popover
        trigger='click'
        popper-class={this.ns2.b('menu-popover')}
        offset={0}
        disabled={this.c.disableSwitch}
      >
        {{
          reference: () => {
            const option = this.c.switchOptions.find(
              item => item.id === this.c.state.editorId,
            );
            return (
              <div
                class={[
                  this.ns2.b('menu'),
                  this.ns2.is('disabled', this.c.disableSwitch),
                ]}
              >
                <div class={this.ns2.be('menu', 'text-icon')}>
                  <iBizIcon icon={option?.icon}></iBizIcon>
                </div>
                <div class={this.ns2.be('menu', 'text')}>
                  {option?.name || this.c.state.editorId}
                </div>
                <div class={this.ns2.be('menu', 'icon')}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 1024 1024'
                  >
                    <path
                      fill='currentColor'
                      d='M831.872 340.864 512 652.672 192.128 340.864a30.59 30.59 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.59 30.59 0 0 0-42.752 0z'
                    ></path>
                  </svg>
                </div>
              </div>
            );
          },
          default: () => {
            return (
              <div class={this.ns2.b('menu-content')}>
                {this.c.switchOptions.map(option => {
                  return (
                    <div
                      class={[
                        this.ns2.b('menu-item'),
                        this.ns2.is(
                          'active',
                          option.id === this.c.state.editorId,
                        ),
                      ]}
                      onClick={() => {
                        this.c.handleEditorSwitch(option.id);
                      }}
                    >
                      <svg
                        viewBox='0 0 1446 1024'
                        class={this.ns2.be('menu-item', 'icon')}
                      >
                        <path d='M574.116299 786.736392 1238.811249 48.517862C1272.390222 11.224635 1329.414799 7.827718 1366.75664 41.450462 1403.840015 74.840484 1406.731043 132.084741 1373.10189 169.433699L655.118888 966.834607C653.072421 969.716875 650.835807 972.514337 648.407938 975.210759 615.017957 1012.29409 558.292155 1015.652019 521.195664 982.250188L72.778218 578.493306C35.910826 545.297758 32.859041 488.584019 66.481825 451.242134 99.871807 414.158803 156.597563 410.800834 193.694055 444.202665L574.116299 786.736392Z'></path>
                      </svg>
                      <div class={this.ns2.be('menu-item', 'text-icon')}>
                        <iBizIcon icon={option.icon}></iBizIcon>
                      </div>
                      <span class={this.ns2.be('menu-item', 'text')}>
                        {option.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          },
        }}
      </el-popover>
    );

    // 编辑器内容
    let editor = null;
    const compositeItem = this.c.model.compositeItem;
    const editMode = this.c.editor?.model?.editorParams?.editMode;
    const editorProps = {
      ref: 'editorRef',
      key: this.c.state.editorId,
      style: this.c.editor?.style,
      value: this.c.value,
      data: this.c.data,
      controller: this.c.editor,
      disabled: this.c.state.disabled,
      readonly: this.c.state.readonly,
      onChange: this.onValueChange,
      controlParams: editMode
        ? { ...this.c.form.controlParams, editmode: editMode }
        : this.c.form.controlParams,
      onFocus: (event: MouseEvent) => this.c.onFocus(event),
      onBlur: (event: MouseEvent) => this.c.onBlur(event),
      onEnter: (event: MouseEvent) => this.c.onEnter(event),
      onClick: (event: MouseEvent, params: IParams) =>
        this.c.onClick(event, params),
      ...this.attrs,
    };
    if (this.$slots.default) {
      editor = this.$slots.default(editorProps);
    } else if (this.c.editorProvider) {
      const component = resolveComponent(this.c.editorProvider.formEditor);
      if (isIncludes && !this.c.hiddenSwitch) {
        editor = h(
          component,
          {
            ...editorProps,
          },
          {
            editorSwitchMenu: () => editorSwitchMenu,
          },
        );
      } else {
        editor = h(component, {
          ...editorProps,
        });
      }
    } else {
      editor = (
        <not-supported-editor
          modelData={this.modelData.editor}
          context={this.c.context}
        />
      );
    }

    return (
      <iBizFormItemContainer
        id={`${this.c.form.view.model.codeName}_${this.c.form.model.codeName}_${this.modelData.codeName}`}
        class={[
          this.ns.b(),
          this.ns2.b(),
          this.ns.m(this.modelData.id),
          this.ns.is('compositeItem', compositeItem),
          ...this.c.containerClass,
        ]}
        style={this.modelData.cssStyle}
        controller={this.c}
        onClick={(event: MouseEvent) => this.c.onClick(event)}
      >
        <div
          class={[
            this.ns2.e('editor'),
            this.ns2.is('hidden-switch', this.c.hiddenSwitch),
          ]}
          v-loading={this.loading}
        >
          {editor}
          {!this.loading &&
            !isIncludes &&
            !this.c.hiddenSwitch &&
            editorSwitchMenu}
        </div>
      </iBizFormItemContainer>
    );
  },
});
export default CompositeFormItemEx;
