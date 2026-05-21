/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ControlController,
  IControlProvider,
  IViewLayoutPanelController,
  PredefinedControlRender,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { IControlContainer } from '@ibiz/model-core';
import { fixJsonString } from '@ibiz-template/core';
import { isNil } from 'ramda';
import {
  h,
  VNode,
  computed,
  PropType,
  reactive,
  CSSProperties,
  defineComponent,
  resolveComponent,
} from 'vue';
import { useNamespace } from '../../use';
import './control-base.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IBizControlBase: any = defineComponent({
  name: 'IBizControlBase',
  props: {
    controller: {
      type: Object as PropType<ControlController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('control');
    const { controlType, sysCss, codeName } = props.controller.model;
    const typeClass = controlType!.toLowerCase();
    const sysCssName = sysCss?.cssName;
    const model = props.controller.model;

    /** 子部件模型 */
    const controls = (props.controller.model as IControlContainer).controls;

    const onLayoutPanelCreated = (
      controller: IViewLayoutPanelController,
    ): void => {
      props.controller.setLayoutPanel(controller as IViewLayoutPanelController);
    };

    const inlineStyle = reactive<CSSProperties>({});
    // 非导航栏时才输出宽高
    if (model.controlType!.endsWith('EXPBAR') === false) {
      if (!isNil(model.width)) {
        if (model.width > 0 && model.width <= 1) {
          inlineStyle.width = `${model.width * 100}%`;
        } else {
          inlineStyle.width = `${model.width}px`;
        }
      }
      if (!isNil(model.height)) {
        if (model.height > 0 && model.height <= 1) {
          inlineStyle.width = `${model.height * 100}%`;
        } else {
          inlineStyle.height = `${model.height}px`;
        }
      }
    }

    /**
     * 处理html事件
     *
     * @param {MouseEvent} e
     * @param {string} eventName
     */
    const handleHtmlEvent = async (e: MouseEvent, eventName: string) => {
      e.stopPropagation();
      const scriptCode = (e.target as HTMLElement).getAttribute(eventName);
      const data = (e.target as HTMLElement).getAttribute('data');
      const context = props.controller.context.clone();
      const _context = (e.target as HTMLElement).getAttribute('context');
      if (_context) {
        Object.assign(context, fixJsonString(_context));
      }
      const params = { ...props.controller.params };
      const _params = (e.target as HTMLElement).getAttribute('params');
      if (_params) {
        Object.assign(params, fixJsonString(_params));
      }
      if (scriptCode) {
        await ScriptFactory.asyncExecScriptFn(
          {
            ...props.controller.getEventArgs(),
            context,
            params,
            data: data ? fixJsonString(data) : null,
          },
          scriptCode,
        );
      }
    };

    /**
     * 获取部件绘制器
     *
     * @param {(IData[] | IData | undefined)} data
     * @return {*}  {(VNode | undefined)}
     */
    const getControlRender = (
      data: IData[] | IData | undefined,
    ): VNode | undefined => {
      // 过滤空数据显示内容绘制器
      const controlRenders = model.controlRenders
        ? model.controlRenders.filter(
            item =>
              !(Object.values(PredefinedControlRender) as string[]).includes(
                item.id!,
              ),
          )
        : undefined;

      if (!controlRenders || controlRenders.length === 0) {
        return undefined;
      }
      const controlRender = controlRenders[0];
      if (
        controlRender.renderType === 'LAYOUTPANEL_MODEL' &&
        controlRender.layoutPanelModel
      ) {
        const htmlCode = ScriptFactory.execScriptFn(
          {
            ...props.controller.getEventArgs(),
            data,
          },
          controlRender.layoutPanelModel,
          { isAsync: false },
        ) as string;
        return (
          <div
            v-html={htmlCode}
            onClick={(e: MouseEvent) => handleHtmlEvent(e, 'click')}
            onDblclick={(e: MouseEvent) => handleHtmlEvent(e, 'dbclick')}
            class={[
              ns.e('control-render'),
              ns.e(controlRender.renderName?.toLowerCase()),
            ]}
          ></div>
        );
      }
      if (
        controlRender.renderType === 'LAYOUTPANEL' &&
        controlRender.layoutPanel
      ) {
        return (
          <iBizControlShell
            class={[
              ns.e('control-render'),
              ns.e(controlRender.renderName?.toLowerCase()),
            ]}
            data={data}
            params={props.controller.params}
            context={props.controller.context}
            modelData={controlRender.layoutPanel}
          ></iBizControlShell>
        );
      }
    };

    const customRender = computed(() => {
      const data =
        (props.controller as any).data || (props.controller as any).items;
      return getControlRender(data);
    });

    /**
     * @description 禁用部件遮罩信息绘制
     */
    const disableMaskInfoRender = (): VNode | undefined => {
      const disableRender = model.controlRenders
        ? model.controlRenders.find(
            item => item.id === PredefinedControlRender.DISABLEPANEL,
          )
        : undefined;
      if (!disableRender) {
        return (
          <div
            v-html={props.controller.state.maskOption.maskInfo || ''}
            class={[ns.e('disable-mask-text')]}
          ></div>
        );
      }
      if (
        disableRender.renderType === 'LAYOUTPANEL_MODEL' &&
        disableRender.layoutPanelModel
      ) {
        const htmlCode = ScriptFactory.execScriptFn(
          {
            ...props.controller.getEventArgs(),
          },
          disableRender.layoutPanelModel,
          { isAsync: false, singleRowReturn: true },
        ) as string;
        return (
          <div v-html={htmlCode} class={[ns.e('disable-mask-text')]}></div>
        );
      }
      if (
        disableRender.renderType === 'LAYOUTPANEL' &&
        disableRender.layoutPanel
      ) {
        return (
          <iBizControlShell
            class={[ns.e('disable-mask-text')]}
            data={{}}
            params={props.controller.params}
            context={props.controller.context}
            modelData={disableRender.layoutPanel}
          ></iBizControlShell>
        );
      }
    };

    return {
      ns,
      typeClass,
      sysCssName,
      inlineStyle,
      codeName,
      controls,
      customRender,
      disableMaskInfoRender,
      onLayoutPanelCreated,
    };
  },
  render() {
    const { state, controlPanel, providers } = this.controller;
    let layoutPanel = null;
    // 有部件布局的绘制布局面板
    if (state.isCreated && controlPanel) {
      // 绘制部件插槽，外部插槽优先
      const slots: IData = {
        ...this.$slots,
      };

      if (this.controls?.length) {
        this.controls.forEach(ctrl => {
          const slotKey = ctrl.name!;
          const ctrlProps = {
            context: this.controller.context,
            params: this.controller.params,
          };
          // 已经有插槽的不用自己绘制了。
          const outCtrlSlot = slots[slotKey];
          if (outCtrlSlot) {
            slots[slotKey] = (): VNode => {
              return outCtrlSlot(ctrlProps);
            };
          } else {
            slots[slotKey] = (): VNode => {
              const comp = resolveComponent('IBizControlShell') as string;
              return h(comp, {
                modelData: ctrl,
                ...ctrlProps,
              });
            };
          }
        });
      }

      // 绘制布局面板
      const provider = providers[controlPanel.name!] as IControlProvider;
      layoutPanel = h(
        resolveComponent(provider.component) as string,
        {
          modelData: controlPanel,
          context: this.controller.context,
          params: this.controller.params,
          provider,
          container: this.controller,
          onControllerAppear: this.onLayoutPanelCreated,
        },
        slots,
      );
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.b(this.typeClass),
          this.ns.m(this.codeName),
          this.sysCssName,
          this.ns.is('disabled', state.disabled),
          this.ns.is('mob', ibiz.env.isMob),
        ]}
        style={this.inlineStyle}
      >
        {layoutPanel || this.customRender || this.$slots.default?.()}
        {state.disabled && (
          <div
            class={[
              this.ns.e('mask-container'),
              this.ns.m(state.maskOption.mode.toLowerCase()),
            ]}
          >
            {state.maskOption.mode === 'MASK' && this.disableMaskInfoRender()}
          </div>
        )}
      </div>
    );
  },
});
