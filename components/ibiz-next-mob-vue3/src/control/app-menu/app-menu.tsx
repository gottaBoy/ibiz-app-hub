import { useRoute } from 'vue-router';
import { ref, watch, PropType, onMounted, defineComponent } from 'vue';
import { prepareControl, useControlController } from '@ibiz-template/vue3-util';
import { IAppMenu, IAppMenuItem } from '@ibiz/model-core';
import { AppMenuController, IControlProvider } from '@ibiz-template/runtime';
import { MenuDesign } from './custom-menu-design/custom-menu-design';
import './app-menu.scss';

export const AppMenuControl = defineComponent({
  name: 'IBizAppMenuControl',
  props: {
    /**
     * @description 菜单模型数据
     */
    modelData: { type: Object as PropType<IAppMenu>, required: true },
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
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController((...args) => new AppMenuController(...args));
    const { controlClass, ns } = prepareControl(c);
    const activeName = ref();
    const showPopup = ref(false);
    // 路由对象
    const route = useRoute();
    // 计算当前路由匹配菜单
    const calcCurMenu = (): IAppMenuItem | undefined => {
      const allItems = c.getAllItems();
      const app = ibiz.hub.getApp(c.context.srfappid);
      return allItems.find(item => {
        if (item.itemType === 'MENUITEM' && item.appFuncId) {
          const func = app.getAppFunc(item.appFuncId!);
          return func?.appViewId?.split('.')?.[1] === route.params.view2;
        }
        return false;
      });
    };

    const setPopupState = (state: boolean): void => {
      showPopup.value = state;
    };

    const onTabChange = async (
      active: string,
      event?: MouseEvent,
      opts: IData = {},
    ) => {
      if (active === 'customized') return setPopupState(true);
      activeName.value = active;
      await c.onClickMenuItem(active, event, true, opts);
    };

    onMounted(async () => {
      const allItems = c.getAllItems();
      // 默认激活的菜单项
      const defaultActiveMenuItem = allItems.find(item => {
        return item.openDefault && !item.hidden;
      });
      if (
        defaultActiveMenuItem &&
        !route.params.view2 &&
        !route.fullPath.includes('404')
      ) {
        onTabChange(defaultActiveMenuItem.id!, undefined, { replace: true });
      } else if (ibiz.config.appMenu.enableEcho) {
        const activeMenu = calcCurMenu();
        activeName.value = activeMenu ? activeMenu.id! : '';
      }
    });

    // 监听二级路由参数，变化时计算当前激活菜单回显
    watch(
      () => route.params.view2,
      (newVal, oldVal) => {
        if (newVal !== oldVal && ibiz.config.appMenu.enableEcho) {
          const activeMenu = calcCurMenu();
          activeName.value = activeMenu ? activeMenu.id! : '';
        }
      },
    );

    return {
      c,
      ns,
      showPopup,
      activeName,
      controlClass,
      onTabChange,
      setPopupState,
    };
  },
  render() {
    const { model, state } = this.c;
    if (!state.isCreated) return;
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          this.ns.m(model.controlStyle || 'default'),
        ]}
      >
        <van-tabbar modelValue={this.activeName} onChange={this.onTabChange}>
          {state.mobMenuItems.map(item => (
            <van-tabbar-item name={item.id}>
              {{
                icon: () => (
                  <iBizIcon
                    slot='icon'
                    icon={item.sysImage}
                    class={this.ns.e('icon')}
                  ></iBizIcon>
                ),
                default: () => <span>{item.caption}</span>,
              }}
            </van-tabbar-item>
          ))}
          {model.enableCustomized && (
            <van-tabbar-item name='customized'>
              {{
                icon: () => <ion-icon name='ellipsis-horizontal'></ion-icon>,
                default: () => (
                  <span>{ibiz.i18n.t('control.appmenu.more')}</span>
                ),
              }}
            </van-tabbar-item>
          )}
        </van-tabbar>
        <van-popup
          round={true}
          position='bottom'
          v-model:show={this.showPopup}
          style={{ height: '80%' }}
        >
          <MenuDesign
            controller={this.c}
            show={this.showPopup}
            onClose={() => this.setPopupState(false)}
          />
        </van-popup>
      </div>
    );
  },
});
