import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelButton } from '@ibiz/model-core';
import { defineComponent, PropType, computed } from 'vue';
import { PanelButtonController } from './panel-button.controller';
import { convertBtnType } from '../../util';
import './panel-button.scss';

/**
 * 按钮组件
 * @primary
 * @description 面板中最常见的按钮组件，支持配置界面行为、界面逻辑等，同时支持权限配置是否显示、是否禁用；当绑定的界面行为标识为 global_ai_assistant 时，则识别为全局AI助手按钮
 */
export const PanelButton = defineComponent({
  name: 'IBizPanelButton',
  props: {
    /**
     * @description 按钮模型
     */
    modelData: {
      type: Object as PropType<IPanelButton>,
      required: true,
    },
    /**
     * @description 按钮控制器
     */
    controller: {
      type: PanelButtonController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-button');

    const {
      caption,
      captionItemName,
      renderMode,
      showCaption,
      sysImage,
      codeName,
    } = props.modelData;

    const { panel, state } = props.controller;
    const { id } = props.modelData;
    const captionText = computed(() => {
      if (captionItemName && panel.data) {
        return panel.data[captionItemName];
      }
      return caption;
    });

    const buttonType = computed(() => {
      if (Object.is(renderMode, 'LINK')) return 'link';
      return convertBtnType(props.modelData);
    });

    const handleButtonClick = (event: MouseEvent) => {
      props.controller.onActionClick(event);
    };

    // 类名控制
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
        ns.is(
          'login-btn',
          props.modelData.id?.toUpperCase() === 'AUTH_LOGINBUTTON',
        ),
      ];
      return result;
    });

    return {
      ns,
      state,
      sysImage,
      codeName,
      classArr,
      buttonType,
      captionText,
      showCaption,
      handleButtonClick,
    };
  },
  render() {
    if (!this.state.visible) return;
    if (this.state.isGlobalAIAssistant) return <iBizAIButton />;
    return (
      <van-button
        type={this.buttonType}
        class={this.classArr}
        disabled={this.state.disabled}
        onClick={this.handleButtonClick}
      >
        <div class={this.ns.b('content')}>
          {this.sysImage ? (
            <iBizIcon
              class={this.ns.bm('content', 'icon')}
              icon={this.sysImage}
            />
          ) : null}
          {this.showCaption ? (
            <span class={this.ns.bm('content', 'caption')}>
              {this.captionText}
            </span>
          ) : null}
        </div>
      </van-button>
    );
  },
});
export default PanelButton;
