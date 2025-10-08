import { defineComponent, PropType, VNode, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNamespace } from '@ibiz-template/vue3-util';
import './auth-userinfo.scss';
import { IPanelRawItem } from '@ibiz/model-core';
import { CTX } from '@ibiz-template/runtime';
import { AuthUserinfoController } from './auth-userinfo.controller';

/**
 * 用户信息
 * @description 展示用户的基本信息，提供登出功能。
 * @panelitemparams {name:strictly,parameterType:boolean,defaultvalue:false,description:是否取消与首页菜单的关联，即菜单收缩时不会跟随改变，当用户信息未配置在首页左侧时应启用}
 * @panelitemparams {name:readonly,parameterType:boolean,defaultvalue:false,description:是否只读}
 * @primary
 */
export const AuthUserinfo = defineComponent({
  name: 'IBizAuthUserinfo',
  props: {
    /**
     * @description 用户信息控件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 用户信息控件控制器
     */
    controller: {
      type: AuthUserinfoController,
      required: true,
    },
  },
  setup(prop) {
    const ns = useNamespace('user-info');
    const c = prop.controller;
    const {
      srfusername = ibiz.i18n.t('panelComponent.authUserinfo.visitor'),
      loginname,
    } = ibiz.appData?.context || {};
    const router = useRouter();

    const ctx = inject<CTX | undefined>('ctx', undefined);

    const menuAlign = computed(() => {
      if (ctx?.view) {
        return ctx.view.model.mainMenuAlign || 'LEFT';
      }
      return 'LEFT';
    });

    const onClick = () => {
      ibiz.hub.controller.logout();
    };

    const isCollapse = computed(() => {
      const { strictly } = c.rawItemParams;
      if (strictly && strictly === 'true') {
        return false;
      }
      return (c.panel.view.state as IData).isCollapse;
    });

    const isReadonly = computed(() => {
      const { readonly } = c.rawItemParams;
      return readonly === 'true';
    });

    return {
      ns,
      c,
      onClick,
      srfusername,
      loginname,
      router,
      menuAlign,
      isCollapse,
      isReadonly,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          ...this.controller.containerClass,
          this.ns.is('left', this.menuAlign === 'LEFT'),
          this.ns.is('top', this.menuAlign === 'TOP'),
          this.ns.is('collapse', this.isCollapse),
          this.ns.is('readonly', this.isReadonly),
        ]}
      >
        <el-dropdown disabled={this.isReadonly}>
          {{
            default: (): VNode => (
              <div
                class={[
                  this.ns.b('info'),
                  this.ns.is('collapse', this.isCollapse),
                ]}
              >
                <div class={this.ns.b('label')}>
                  <el-avatar
                    class={this.ns.b('avatar')}
                    src='./assets/images/user-avatar.png'
                  />

                  <div
                    class={[
                      this.ns.b('name'),
                      this.ns.is('collapse', this.isCollapse),
                    ]}
                  >
                    <div class={this.ns.be('name', 'user-name')}>
                      {this.srfusername}
                    </div>
                    {this.menuAlign === 'LEFT' && this.loginname && (
                      <div class={this.ns.be('name', 'person-name')}>
                        {this.loginname}
                      </div>
                    )}
                  </div>
                </div>
                <ion-icon
                  class={[
                    this.ns.e('down'),
                    this.ns.is('collapse', this.isCollapse),
                  ]}
                  name='chevron-down-outline'
                ></ion-icon>
              </div>
            ),
            dropdown: (): VNode => (
              <el-dropdown-menu>
                <el-dropdown-item>
                  <ion-icon name='log-out-outline' class={this.ns.e('icon')} />
                  <span onClick={this.onClick}>
                    {ibiz.i18n.t('app.logout')}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            ),
          }}
        </el-dropdown>
      </div>
    );
  },
});
