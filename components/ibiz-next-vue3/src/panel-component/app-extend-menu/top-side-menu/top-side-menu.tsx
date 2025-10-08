/* eslint-disable array-callback-return */
import { defineComponent, PropType } from 'vue';
import { IAppMenuItem, IPanelRawItem } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { TopSideMenuController } from './top-side-menu.controller';
import './top-side-menu.scss';

/**
 * 头部菜单
 * @primary
 * @description 首页视图扩展菜单头部菜单
 * @panelitemparams {name:rendermode,parameterType:'BUTTON' | 'MENU',defaultvalue:'BUTTON',description:菜单项绘制模式，其中BUTTON表示按照按钮形态绘制、MENU表示按照菜单形态绘制}
 * @primary
 */
export const TopSideMenu = defineComponent({
  name: 'IBizTopSideMenu',
  props: {
    /**
     * @description 模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 头部菜单控制器
     */
    controller: {
      type: TopSideMenuController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('top-side-menu');

    const { state } = props.controller;

    return { ns, state };
  },
  render() {
    if (!this.controller.appMenu) {
      return null;
    }
    return (
      <div class={this.ns.b()}>
        <iBizCommonExtendMenu
          renderMode={this.controller.rawItemParams.rendermode}
          items={this.state.items}
          menuItemsState={this.state.menuItemsState}
          providers={this.controller.itemProviders}
          position={'TOP'}
          layoutMode={this.controller.appMenu.layoutMode}
          layout={this.controller.appMenu.layout}
          onMenuItemClick={(item: IAppMenuItem, event: MouseEvent) => {
            this.controller.handleClickMenuItem(item, event);
          }}
        ></iBizCommonExtendMenu>
      </div>
    );
  },
});
