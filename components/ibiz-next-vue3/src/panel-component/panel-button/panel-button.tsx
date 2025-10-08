import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelButton } from '@ibiz/model-core';
import { defineComponent, PropType, computed, ref } from 'vue';
import { showTitle } from '@ibiz-template/core';
import { PanelButtonController } from './panel-button.controller';
import { convertBtnType } from '../../util';
import './panel-button.scss';

/**
 * 面板按钮
 * @primary
 * @description 面板中最常见的按钮组件，支持配置界面行为、界面逻辑等，同时支持权限配置是否显示、是否禁用。
 */
export const PanelButton = defineComponent({
  name: 'IBizPanelButton',
  props: {
    /**
     * @description 面板项模型数据
     */
    modelData: { type: Object as PropType<IPanelButton>, required: true },
    /**
     * @description 面板项控制器
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
      itemStyle,
      tooltip,
      buttonCssStyle,
      buttonStyle,
    } = props.modelData;

    const { panel, state } = props.controller;

    const tempStyle = ref('');

    if (buttonCssStyle) {
      tempStyle.value = buttonCssStyle;
    }

    const captionText = computed(() => {
      if (captionItemName && panel.data) {
        return panel.data[captionItemName.toLowerCase()];
      }
      return caption;
    });

    let isText = false;
    if (Object.is(renderMode, 'LINK')) {
      isText = true;
    }

    const buttonType = computed(() => {
      if (Object.is(renderMode, 'LINK')) return 'text';
      return convertBtnType(buttonStyle);
    });

    const handleButtonClick = async (event: MouseEvent): Promise<void> => {
      try {
        state.loading = true;
        await props.controller.onActionClick(event);
        props.controller.onClick(event);
      } finally {
        state.loading = false;
      }
    };

    return {
      ns,
      isText,
      captionText,
      buttonType,
      showCaption,
      sysImage,
      codeName,
      state,
      tooltip,
      handleButtonClick,
      buttonCssStyle,
      tempStyle,
      itemStyle,
    };
  },
  render() {
    if (this.state.visible) {
      return (
        <div
          class={[
            this.ns.b(),
            this.ns.m(this.codeName),
            this.ns.is('loading', this.state.loading),
            this.itemStyle && this.ns.m(this.itemStyle.toLowerCase()),
            ...this.controller.containerClass,
          ]}
          style={this.tempStyle}
        >
          <el-button
            type={this.buttonType}
            text={this.isText}
            data-id={this.modelData.id}
            title={showTitle(this.tooltip)}
            disabled={this.state.disabled}
            loading={this.state.loading}
            onClick={this.handleButtonClick}
          >
            <div class={this.ns.b('content')}>
              <iBizIcon
                class={this.ns.bm('content', 'icon')}
                icon={this.sysImage}
              />
              {this.showCaption ? (
                <span class={this.ns.bm('content', 'caption')}>
                  {this.captionText}
                </span>
              ) : (
                ''
              )}
            </div>
          </el-button>
        </div>
      );
    }
    return null;
  },
});
export default PanelButton;
