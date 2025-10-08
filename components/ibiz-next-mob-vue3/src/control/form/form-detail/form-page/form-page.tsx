import { defineComponent, PropType, reactive, ref, VNode } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './form-page.scss';
import { IDEForm } from '@ibiz/model-core';
import { FormController, FormPageController } from '@ibiz-template/runtime';
import { JSX } from 'vue/jsx-runtime';

export const FormPage = defineComponent({
  name: 'IBizFormPage',
  props: {
    modelData: {
      type: Object as PropType<IDEForm>,
      required: true,
    },
    controller: {
      type: Object as PropType<FormController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-page');
    const currentPage = ref(props.modelData.deformPages![0].id!);
    const lazyKeys = reactive([currentPage.value]);

    const onTabChange = (name: string) => {
      currentPage.value = name;
      if (!lazyKeys.includes(currentPage.value)) {
        lazyKeys.push(currentPage.value);
      }
    };

    return { ns, currentPage, lazyKeys, onTabChange };
  },
  render() {
    const { noTabHeader } = this.modelData;
    const defaultSlots: VNode[] =
      (this.$slots.default?.()[0]?.children as VNode[]) || [];
    if (defaultSlots.length === 1 || noTabHeader) {
      return (
        <div class={[this.ns.b(), this.ns.m('no-tab-header')]}>
          {defaultSlots}
        </div>
      );
    }
    return (
      <van-tabs
        onChange={this.onTabChange}
        class={[this.ns.b('header')]}
        active={this.currentPage}
      >
        {defaultSlots.map(slot => {
          const props = slot.props;
          if (!props || !props.controller) {
            return slot;
          }
          const c = props.controller as FormPageController;
          // 不显示且不用保活时直接不绘制
          if (!c.state.visible && !c.state.keepAlive) {
            return null;
          }
          return (
            <van-tab class={this.ns.b('tab-item')} name={c.model.id}>
              {{
                default: (): VNode => slot,
                title: (): JSX.Element => {
                  return (
                    <span class={c.labelClass}>
                      {c.model.sysImage ? (
                        <iBizIcon icon={c.model.sysImage} />
                      ) : null}
                      {c.model.caption}
                    </span>
                  );
                },
              }}
            </van-tab>
          );
        })}
      </van-tabs>
    );
  },
});

export default FormPage;
