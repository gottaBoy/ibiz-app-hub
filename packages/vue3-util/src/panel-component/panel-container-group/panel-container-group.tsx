import { IPanelContainer } from '@ibiz/model-core';
import { ref, VNode, computed, PropType, defineComponent } from 'vue';
import { PanelContainerGroupController } from './panel-container-group.controller';
import { useNamespace } from '../../use';
import { IBizIcon } from '../../common';
import './panel-container-group.scss';

/**
 * 分组容器
 * @primary
 * @description 可将多个具有特定意义或相近功能的面板项聚合到一起进行展示，并可通过分组容器进行统一管理，支持配置分组标题，可折叠。
 */
export const PanelContainerGroup = defineComponent({
  name: 'IBizPanelContainerGroup',
  props: {
    /**
     * @description 分组容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 分组容器控制器
     */
    controller: {
      type: PanelContainerGroupController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-container-group');

    const isCollapse = ref(!props.controller.defaultExpansion);

    const changeCollapse = (): void => {
      if (!props.controller.disableClose) {
        isCollapse.value = !isCollapse.value;
      }
    };

    const captionText = computed(() => {
      const { captionItemName, caption, capLanguageRes } = props.modelData;
      if (captionItemName) {
        return props.controller.data[captionItemName];
      }
      let text = caption;
      if (capLanguageRes) {
        text = ibiz.i18n.t(capLanguageRes.lanResTag!, caption);
      }
      return text;
    });

    return { ns, captionText, isCollapse, changeCollapse };
  },
  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.id),
      ...this.controller.containerClass,
      this.ns.is('hidden', !this.controller.state.visible),
      this.ns.is('mob', ibiz.env.isMob),
    ];
    if (this.modelData.showCaption === true) {
      classArr.push(this.ns.m('show-header'));
      classArr.push(this.ns.b('collapse'));
      classArr.push(this.ns.is('collapse', this.isCollapse));
      if (this.controller.disableClose) {
        classArr.push(this.ns.bm('collapse', 'disable-close'));
      }
    }

    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow slot='content' layout={this.modelData.layout}>
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );

    // 头部绘制
    let header: unknown = null;
    if (this.modelData.showCaption) {
      header = (
        <div
          class={[this.ns.b('header'), this.ns.is('is-mob', ibiz.env.isMob)]}
          onClick={this.changeCollapse}
        >
          <div class={[this.ns.be('header', 'left')]}>
            <div class={[this.ns.e('caption'), ...this.controller.labelClass]}>
              {this.modelData.sysImage && (
                <IBizIcon
                  class={this.ns.em('caption', 'icon')}
                  icon={this.modelData.sysImage}
                ></IBizIcon>
              )}
              {this.captionText}
              {this.modelData.counterId && (
                <span class={this.ns.e('counter')}>
                  ({this.controller.state.counterData[this.modelData.counterId]}
                  )
                </span>
              )}
            </div>
          </div>
          <div class={[this.ns.be('header', 'right')]}>
            {this.modelData.titleBarCloseMode !== undefined &&
              this.modelData.titleBarCloseMode !== 0 &&
              (this.isCollapse ? (
                <ion-icon name='caret-forward-sharp' />
              ) : (
                <ion-icon name='caret-down-sharp' />
              ))}
          </div>
        </div>
      );
    }

    return (
      <div class={classArr} v-loading={this.controller.state.loading}>
        {header}
        <div class={[this.ns.b('content')]}>{content}</div>
      </div>
    );
  },
});
