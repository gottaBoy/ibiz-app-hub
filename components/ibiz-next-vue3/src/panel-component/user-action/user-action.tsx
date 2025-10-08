import { PropType, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  AppFuncCommand,
  IAppMenuController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IAppMenuItem, IPanelRawItem } from '@ibiz/model-core';
import { showTitle } from '@ibiz-template/core';
import './user-action.scss';

/**
 * 用户操作
 * @primary
 * @description 首页中用户操作行为按钮，需在菜单上配置标识为设置（setting）、帮助（helper）、自定义（custom）的三种隐藏菜单项，点击按钮将会执行对应的菜单项应用功能。
 * @panelitemparams {name:noprivmode,parameterType:'PARENT' | 'SELF',defaultvalue:'PARENT',description:无权限模式，为PARENT时会通过父容器进行显示隐藏}
 * @export
 * @class UserAction
 */
export const UserAction = defineComponent({
  name: 'IBizUserAction',
  props: {
    /**
     * @description 面板预置按钮模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 面板预置按钮控制器
     */
    controller: {
      type: Object as PropType<PanelItemController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('user-action');
    const c = props.controller;

    // 图片配置
    const imgConfig: IData = {
      SETTING: { imagePath: 'svg/setting.svg' },
      HELPER: { imagePath: 'svg/helper.svg' },
      CUSTOM: { imagePath: 'svg/custom-workbench.svg' },
    };

    let sysImage = props.modelData.sysImage;

    if (!sysImage && props.modelData && props.modelData.rawItem) {
      const predefinedType: string | undefined =
        props.modelData.rawItem.predefinedType;
      if (predefinedType) {
        sysImage = imgConfig[predefinedType];
      }
    }

    let noPrivMode: 'PARENT' | 'SELF' = 'PARENT';

    if (props.modelData.rawItem?.rawItemParams) {
      props.modelData.rawItem.rawItemParams.find(item => {
        if (item.key?.toLowerCase() === 'noprivmode' && item.value) {
          noPrivMode = item.value as 'PARENT' | 'SELF';
          return true;
        }
        return false;
      });
    }

    let menuItem: IAppMenuItem | undefined;

    /**
     * 初始化菜单项
     *
     */
    const initMenuItem = () => {
      const menuC = c.panel.view.getController('appmenu') as IAppMenuController;
      if (menuC) {
        menuItem = menuC.allAppMenuItems.find((item: IData) => {
          return item.id === props.modelData.id;
        });
        if (menuItem && menuItem.accessKey) {
          const app = ibiz.hub.getApp(c.panel.context.srfappid);
          const permitted = app.authority.calcByResCode(menuItem.accessKey);
          c.state.visible = permitted;
          // 无权限模式为PARENT时，隐藏父
          if (c.parent && noPrivMode === 'PARENT') {
            c.parent.state.visible = permitted;
          }
        }
      }
    };

    c.panel.view.evt.on('onMounted', () => {
      initMenuItem();
    });

    // 寻找对应的菜单项并打开对应应用功能
    const onClick = async (event: Event) => {
      if (menuItem) {
        const tempContext = c.panel.context.clone();
        const tempParam = c.panel.params;
        tempContext.srfappid = menuItem.appId || ibiz.env.appId;
        await ibiz.commands.execute(
          AppFuncCommand.TAG,
          menuItem.appFuncId,
          tempContext,
          tempParam,
          { event },
        );
      }
    };

    return {
      ns,
      c,
      sysImage,
      onClick,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} title={showTitle(this.modelData.caption)}>
        <i-biz-icon
          class={[this.ns.e('image')]}
          icon={this.sysImage}
          onClick={(event: Event) => this.onClick(event)}
        ></i-biz-icon>
      </div>
    );
  },
});
