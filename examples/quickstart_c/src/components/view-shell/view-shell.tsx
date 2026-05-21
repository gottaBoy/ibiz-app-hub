/* eslint-disable no-param-reassign */
/* eslint-disable vue/no-mutating-props */
import {
  EventBase,
  IModal,
  IViewProvider,
  IViewShellHooks,
  RedrawViewEvent,
} from '@ibiz-template/runtime';
import { defineComponent, h, PropType, ref, Component, Ref, watch } from 'vue';
import { IAppView } from '@ibiz/model-core';
import './view-shell.scss';
import { useNamespace } from '@ibiz-template/vue3-util';
import { getAppViewComponent } from '@/publish/pages';

export const IBizViewShell = defineComponent({
  name: 'IBizViewShell',
  props: {
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams> },
    modelData: { type: Object as PropType<IAppView> },
    viewId: { type: String },
    viewShellHooks: { type: Object as PropType<IViewShellHooks> },
  },
  setup(props, { attrs }) {
    const ns = useNamespace('view-shell');
    const isComplete = ref(false);
    const errMsg = ref('');
    const provider = ref<IViewProvider>();
    const viewComponent = ref<Component>();
    const viewModel = ref<IModel>();

    // 当前视图上下文
    const context: Ref<IContext> = ref(props.context);
    // 当前视图参数
    const params: Ref<IParams> = ref(props.params || {});

    // 监听上层视图视图参数合视图上下文变化
    watch(
      () => ({ context: props.context, params: props.params }),
      newVal => {
        context.value = newVal.context;
        params.value = newVal.params ? newVal.params : {};
      },
    );

    // 初始化方法
    const init = async (): Promise<void> => {
      const viewId = props.modelData ? props.modelData.id! : props.viewId!;
      viewModel.value = await ibiz.hub.getAppView(viewId);
      viewComponent.value = await getAppViewComponent(
        viewId,
        viewModel.value.appId,
      );
      if (!viewComponent.value) {
        errMsg.value = `未找到${viewId}对应的视图组件`;
      }
      isComplete.value = true;
    };

    // 重绘视图
    const redrawView = async (event: RedrawViewEvent): Promise<void> => {
      isComplete.value = false;
      const { redrawData } = event;
      const { isReloadModel } = redrawData;
      // 合并参数
      Object.assign(context.value, redrawData.context);
      Object.assign(params.value, redrawData.params);
      // 重绘清空原关闭监听
      const modal = attrs.modal as IModal;
      if (modal) {
        modal.hooks.preDismiss.clear();
        modal.hooks.shouldDismiss.clear();
        modal.hooks.beforeDismiss.clear();
      }
      if (isReloadModel) {
        await init();
      } else {
        setTimeout(() => {
          isComplete.value = true;
        });
      }
    };

    // 视图创建完成
    const onCreated = (event: EventBase): void => {
      if (props.viewShellHooks) {
        props.viewShellHooks.hooks.viewCreated.call(event);
      }
    };

    init();

    return {
      ns,
      isComplete,
      errMsg,
      viewComponent,
      viewModel,
      provider,
      redrawView,
      onCreated,
      curContext: context,
      curParams: params,
    };
  },
  render() {
    if (this.isComplete && this.viewComponent) {
      return h(
        this.viewComponent,
        {
          context: this.curContext,
          params: this.curParams,
          model: this.viewModel,
          ...this.$attrs,
          onCreated: this.onCreated,
          onRedrawView: this.redrawView,
        },
        this.$slots,
      );
    }
    return (
      <div class={this.ns.b()} v-loading={!this.isComplete}>
        {this.isComplete ? this.errMsg : null}
      </div>
    );
  },
});
