import {
  getControlsByView,
  getCtrlTeleportParams,
  getErrorViewProvider,
  IModal,
  IViewLayoutPanelController,
  IViewProvider,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppView, IControl } from '@ibiz/model-core';
import {
  defineComponent,
  h,
  PropType,
  resolveComponent,
  VNode,
  computed,
  renderSlot,
  Teleport,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import './view.scss';
import { useNamespace, useViewController, useViewOperation } from '../../use';

export const View = defineComponent({
  name: 'IBizView',
  props: {
    /**
     * @description 应用上下文
     */
    context: { type: Object as PropType<IContext> },
    /**
     * @description 视图参数
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 视图模型
     */
    modelData: { type: Object as PropType<IAppView>, required: true },
    /**
     * @description 视图模态操作对象，在模态等形式打开视图时，需给视图注入此对象
     */
    modal: { type: Object as PropType<IModal> },
    /**
     * @description 视图状态
     */
    state: { type: Object as PropType<IData> },
    /**
     * @description 视图适配器
     */
    provider: { type: Object as PropType<IViewProvider> },
  },
  setup(_props, { slots }) {
    const ns = useNamespace('view');
    const c = useViewController((...args) => new ViewController(...args));
    // 监听视图用户操作
    useViewOperation(c);
    // 视图部件模型在viewlayoutPanel里面。
    const allControls = getControlsByView(c.model);
    const teleportControls: IControl[] = [];
    const teleportTags = new Map<string, string>();
    const controls: IControl[] = [];

    allControls.forEach(ctrl => {
      const { teleportFlag, teleportTag } = getCtrlTeleportParams(ctrl);
      // 配置了tag或者flag，则认为是teleport部件
      if (!!teleportTag || teleportFlag) {
        teleportControls.push(ctrl);
        teleportTags.set(ctrl.id!, teleportTag || '');
      } else {
        controls.push(ctrl);
      }
    });

    const getCtrlTeleportTag = (ctrl: IControl): string | undefined => {
      const tag = teleportTags.get(ctrl.id!);
      if (tag) {
        return tag;
      }
      const placeholderC = c.parentView?.layoutPanel?.panelItems[ctrl.name!];
      if (placeholderC) {
        return `#${(placeholderC.state as IData).teleportTag}`;
      }
    };

    const { viewType, sysCss, codeName } = c.model;
    const typeClass = viewType!.toLowerCase();
    const sysCssName = sysCss?.cssName;
    const viewClassNames = computed(() => [
      ns.b(),
      true && ns.b(typeClass),
      true && ns.m(codeName),
      true && sysCssName,
      c.state.viewMessages.TOP ? 'has-top-message' : '',
      c.state.viewMessages.BOTTOM ? 'has-bottom-message' : '',
      c.state.presetClassList,
    ]);

    const onLayoutPanelCreated = (
      controller: IViewLayoutPanelController,
    ): void => {
      c.setLayoutPanel(controller as IViewLayoutPanelController);
    };

    const getControlStyle = () => {
      const result = {};
      Object.assign(result, {
        display: c.state.hasError ? 'none' : 'initial',
      });
      return result;
    };

    /**
     * 获取部件绘制的props
     * @author lxm
     * @date 2024-03-27 01:39:30
     * @param {IControl} ctrl
     * @return {*}  {IParams}
     */
    const getCtrlProps = (ctrl: IControl, slotProps: IData = {}): IParams => {
      const slotKey = ctrl.name! || ctrl.id!;
      return {
        context: c.context,
        params: c.params,
        modelData: ctrl,
        ...(c.slotProps[slotKey] || {}),
        ...slotProps,
      };
    };

    /**
     * 绘制部件
     * @author lxm
     * @date 2024-03-27 01:45:21
     * @param {IControl} ctrl
     * @return {*}  {VNode}
     */
    const renderControl = (ctrl: IControl, slotProps: IData = {}): VNode => {
      const slotKey = ctrl.name! || ctrl.id!;
      const ctrlProps = getCtrlProps(ctrl, slotProps);
      if (slots[slotKey]) {
        return renderSlot(slots, slotKey, ctrlProps);
      }

      const provider = c.providers[slotKey];
      const comp = resolveComponent(
        provider?.component || 'IBizControlShell',
      ) as string;
      if (provider) {
        ctrlProps.provider = provider;
      }
      return h(comp, ctrlProps);
    };

    // 水印销毁方法
    let watermarkDestroy: void | null | (() => void);
    onMounted(() => {
      nextTick(async () => {
        const container = document.getElementById(c.id);
        const appView: IData = await ibiz.hub.config.view.get(c.model.id!);
        if (!container || !appView?.waterMarkOption) return;

        // 挂载视图水印
        watermarkDestroy = ibiz.util.watermark.mount(
          appView.waterMarkOption,
          container,
          c.context,
          c.params,
          c.state.srfactiveviewdata || {},
        );
      });
    });

    onBeforeUnmount(() => {
      watermarkDestroy?.();
    });

    return {
      c,
      ns,
      controls,
      teleportControls,
      viewClassNames,
      onLayoutPanelCreated,
      getCtrlProps,
      renderControl,
      getCtrlTeleportTag,
      getControlStyle,
    };
  },
  render() {
    let layoutPanel = null;
    if (this.c.state.isCreated) {
      if (this.c.engines.length === 0) {
        layoutPanel = (
          <span style={'color:red;'}>
            {ibiz.i18n.t('vue3Util.view.viewType', {
              viewType: this.modelData.viewType,
            })}
          </span>
        );
      } else {
        // 绘制部件插槽，外部插槽优先
        const slots: IData = {
          ...this.$slots,
        };
        if (this.controls?.length) {
          this.controls.forEach(ctrl => {
            const slotKey = ctrl.name! || ctrl.id!;
            slots[slotKey] = (slotProps: IData): VNode => {
              return this.renderControl(ctrl, slotProps);
            };
          });
        }

        // 绘制视图布局面板
        const viewLayoutPanel = this.c.model.viewLayoutPanel!;
        const provider = this.c.providers[viewLayoutPanel.name!];
        layoutPanel = h(
          resolveComponent(provider.component) as string,
          {
            modelData: viewLayoutPanel,
            context: this.c.context,
            params: this.c.params,
            provider,
            container: this.c,
            style: this.getControlStyle(),
            onControllerAppear: this.onLayoutPanelCreated,
          },
          slots,
        );
      }
    }

    // 绘制teleport部件
    let teleportContent = null;
    if (this.c.state.isCreated && this.teleportControls?.length) {
      teleportContent = this.teleportControls.map(ctrl => {
        const tag = this.getCtrlTeleportTag(ctrl);
        if (!tag) {
          ibiz.log.error(
            ibiz.i18n.t('vue3Util.view.noTeleportTag', {
              name: ctrl.name,
            }),
          );
          return null;
        }
        return (
          <div style={this.getControlStyle()}>
            <Teleport to={tag} disabled={!this.c.state.activated}>
              {this.renderControl(ctrl)}
            </Teleport>
          </div>
        );
      });
    }

    // 绘制错误页面
    let errorContent = null;
    if (this.c.state.hasError && this.c.error.status) {
      const provider = getErrorViewProvider(this.c.error.status);
      if (provider) {
        if (typeof provider.component === 'string') {
          errorContent = h(resolveComponent(provider.component) as string);
        }
        errorContent = h(provider.component);
      }
    }
    return (
      <div
        class={this.viewClassNames}
        id={this.c.id}
        v-loading={this.c.state.isLoading}
        element-loading-text={this.c.state.loadingText}
      >
        {layoutPanel}
        {teleportContent}
        {errorContent}
      </div>
    );
  },
});
