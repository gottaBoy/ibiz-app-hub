import {
  IControlProvider,
  IModal,
  ISearchFormController,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDESearchForm } from '@ibiz/model-core';
import { defineComponent, PropType, reactive } from 'vue';
import './md-advaned-searchform.scss';

export const IBizMdAdvanedSearchfrom = defineComponent({
  name: 'IBizMdAdvanedSearchfrom',
  props: {
    modal: {
      type: Object as PropType<IModal>,
    },
    /**
     * @description 搜索表单模型数据
     */
    modelData: {
      type: Object as PropType<IDESearchForm>,
      required: true,
    },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 搜索表单控制器
     */
    controller: { type: Object as PropType<ISearchFormController> },
  },
  setup(props) {
    const ns = useNamespace('md-advaned-searchform');
    const c = props.controller;

    c!.evt.on('onCreated', () => {
      const keys = Object.keys(c!.details);
      keys.forEach(key => {
        const detail = c!.details[key];
        detail.state = reactive(detail.state);
      });
    });

    // 重置按钮
    const onCancel = () => {
      c!.reset();
      props.modal!.dismiss();
    };

    // 确认搜索按钮
    const onConfirm = () => {
      c!.onSearchButtonClick();
      props.modal!.dismiss();
    };

    return { c, ns, onCancel, onConfirm };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <iBizFormControl
          class={this.ns.e('searchform')}
          controller={this.c!}
        ></iBizFormControl>
        <div class={this.ns.e('footer')}>
          <van-button onClick={this.onCancel}>
            {ibiz.i18n.t('control.form.searchForm.reset')}
          </van-button>
          <van-button
            type='primary'
            class={this.ns.e('confirm')}
            onClick={this.onConfirm}
          >
            {ibiz.i18n.t('control.form.searchForm.search')}
          </van-button>
        </div>
      </div>
    );
  },
});
