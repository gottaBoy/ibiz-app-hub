import { useNamespace } from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  h,
  onMounted,
  reactive,
  Ref,
  ref,
  resolveComponent,
} from 'vue';
import { useRoute } from 'vue-router';
import qs from 'qs';
import { IViewConfig } from '@ibiz-template/runtime';
import './login-view.scss';
import { IBizContext, LoginMode } from '@ibiz-template/core';

export const LoginView = defineComponent({
  setup() {
    const ns = useNamespace('login-view');
    const loading = ref(false);

    const formRef = ref<IData | null>(null);

    const route = useRoute();
    const ru = (route.query.ru as string) || '/';

    // 模型里是否有自定义登录视图
    const hasLoginView = ref(false);

    // 登录视图id
    const loginView: Ref<null | IViewConfig> = ref(null);

    // 是否匿名
    const isAnonymous = ref(true);

    // 是否已加载完成
    const isMounted = ref(false);

    // 上下文和视图参数
    const context = IBizContext.create({});
    const params = {};

    // 视图壳
    const viewShell = resolveComponent('IBizViewShell');

    // 登录数据
    const loginData = reactive({
      username: '',
      password: '',
    });

    // 是否授权登录失败
    const loginFailed = computed(() => {
      return window.location.href.indexOf('srfthird_auth_success=false') >= 0;
    });

    // 第三方内嵌授权
    const platform = window.navigator.userAgent.toUpperCase();
    const thirdAuth = () => {
      if (platform.indexOf('DINGTALK') !== -1) {
        ibiz.thirdAuth.auth('DINGTALK', 'EMBED');
      } else if (platform.indexOf('WXWORK') !== -1) {
        ibiz.thirdAuth.auth('WXWORK', 'EMBED');
      }
    };
    if (!loginFailed.value && ibiz.env.loginMode !== LoginMode.OAUTH) {
      thirdAuth();
    }

    // 登录
    const login = async () => {
      try {
        if (!loginData.username) {
          ibiz.notification.error({
            desc: ibiz.i18n.t('view.fillInUserName'),
          });
          return;
        }
        if (!loginData.password) {
          ibiz.notification.error({
            desc: ibiz.i18n.t('view.fillInPassword'),
          });
          return;
        }
        loading.value = true;
        const bol = await ibiz.platform.login(
          loginData.username,
          loginData.password,
        );
        if (bol) {
          // hash重置为初始空状态
          window.location.hash = '';
          // 将当前历史路由状态给替换成初始状态
          window.history.replaceState({}, '');
          // 重新赋值路由为目标页面地址
          window.location.hash = ru;
          // 重新加载目标页面
          if (!loginFailed.value) {
            // 不是从授权页面跳转过来的
            window.location.reload();
          } else {
            // 从授权页面跳过来的需要清除地址栏里面的标记
            const path = window.location.href.replace(
              '?srfthird_auth_success=false',
              '',
            );
            window.location.href = path;
          }
        }
        loading.value = false;
      } catch (error) {
        ibiz.notification.error({
          desc:
            (error as IData)?.response?.data?.message ||
            ibiz.i18n.t('view.loginFailed'),
        });
        loading.value = false;
      }
    };

    // 计算标题
    const title = ref(ibiz.env.AppTitle);

    const getTitle = async () => {
      const app = await ibiz.hub.getAppAsync(ibiz.env.appId);
      const model = app.model;
      // 环境变量中的系统标题权重最大
      if (model.caption && !title.value) {
        title.value = model.caption;
      }
    };

    getTitle();

    onMounted(async () => {
      // 第三方容器环境不执行后续逻辑
      const search = qs.parse(window.location.search.replace('?', ''));
      if (loginFailed.value) {
        ibiz.message.error(ibiz.i18n.t('view.thirdAuthFail'));
      }
      if (
        (platform.indexOf('DINGTALK') !== -1 ||
          platform.indexOf('WXWORK') !== -1) &&
        !loginFailed.value
      ) {
        return;
      }
      if (search.isAnonymous === 'true') {
        const bol = await ibiz.auth.anonymousLogin();
        if (bol === true) {
          window.location.hash = ru;
          window.location.reload();
        }
      } else {
        try {
          const loginViewConfig =
            await ibiz.hub.config.view.get('AppLoginView');
          if (loginViewConfig) {
            loginView.value = loginViewConfig;
            hasLoginView.value = true;
          }
        } catch (err) {
          ibiz.log.warn(err);
          // 报错之后刷新页面，重新加载整个应用系统
          window.location.reload();
        }
        isAnonymous.value = false;
      }
      ibiz.util.hiddenAppLoading();
      isMounted.value = true;
    });

    const renderCustomLoginView = () => {
      return h(viewShell, {
        context,
        params,
        viewId: loginView.value!.id,
      });
    };

    return {
      ns,
      loginData,
      login,
      title,
      loading,
      formRef,
      isMounted,
      hasLoginView,
      isAnonymous,
      renderCustomLoginView,
    };
  },
  render() {
    if (this.isMounted && this.isAnonymous === false) {
      if (this.hasLoginView) {
        return this.renderCustomLoginView();
      }
      return (
        <div class={this.ns.b()}>
          <div class={this.ns.b('logo')}>
            <img
              class={this.ns.b('logo-img')}
              src='./assets/img/login-logo.png'
            />
            <div class={this.ns.b('title')}>{this.title}</div>
          </div>
          <van-form class={this.ns.b('form')} ref='formRef'>
            <div class={this.ns.b('user')}>
              <ion-icon name='person'></ion-icon>
              <van-field
                placeholder={ibiz.i18n.t('view.enterUserName')}
                name={ibiz.i18n.t('view.userName')}
                v-model={this.loginData.username}
                rules={[
                  {
                    required: true,
                    message: ibiz.i18n.t('view.fillInUserName'),
                  },
                ]}
              ></van-field>
            </div>
            <div class={this.ns.b('password')}>
              <ion-icon name='lock-closed'></ion-icon>
              <van-field
                placeholder={ibiz.i18n.t('view.enterPassword')}
                name={ibiz.i18n.t('view.password')}
                type='password'
                v-model={this.loginData.password}
                rules={[
                  {
                    required: true,
                    message: ibiz.i18n.t('view.fillInPassword'),
                  },
                ]}
              ></van-field>
            </div>
          </van-form>
          <div class={this.ns.b('btns')}>
            <van-button
              loading={this.loading}
              class={this.ns.b('login-btn')}
              onClick={this.login}
            >
              {ibiz.i18n.t('view.login')}
            </van-button>
          </div>
        </div>
      );
    }
    return null;
  },
});
