import { ModelHelper } from '@ibiz-template/model-helper';
import { AppHooks } from '@ibiz-template/vue3-util';
import { AuthGuard } from './auth-guard';
import { i18n } from '../../../locale';

export class DynaAuthGuard extends AuthGuard {
  hasModelInit: boolean = false;

  noPermissionModel: boolean = false;

  async initModel(context: IParams, permission: boolean = true): Promise<void> {
    // 没初始化或者初始化了但是切换模型
    if (
      !this.hasModelInit ||
      (this.hasModelInit && this.noPermissionModel !== permission)
    ) {
      // 清空重置基座
      ibiz.hub.reset();
      const helper = new ModelHelper(
        async (url: string, params?: IParams) => {
          const res = await ibiz.net.get(
            `${ibiz.env.remoteModelUrl}${url}`,
            params,
            permission ? {} : { srfdcsystem: ibiz.env.dcSystem },
          );
          return res.data;
        },
        ibiz.env.appId,
        context,
        permission,
      );
      const tempApp = await helper.getAppModel();
      await this.initEnvironment(tempApp);
      // 注册路由导航完成关闭模态类视图
      ibiz.appUtil.registerAutoCloseOnNavEnd();
      const app = await ibiz.hub.getAppAsync(ibiz.env.appId);
      await AppHooks.initedApp.call({ context, app });
      const appModel = app.model;
      ibiz.env.isMob = appModel.mobileApp === true;
      if (ibiz.env.isEnableMultiLan) {
        const lang = ibiz.i18n.getLang();
        const m = await helper.getPSAppLang(
          lang.replace('-', '_').toUpperCase(),
        );
        const items = m.languageItems || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {};
        items.forEach(item => {
          data[item.lanResTag!] = item.content;
        });
        i18n.global.mergeLocaleMessage(lang, data);
      }
      const module = await import('@ibiz-template/web-theme');
      const theme = module.default || module;
      AppHooks.useComponent.callSync(null, theme);
      if (ibiz.config.theme) ibiz.util.theme.setTheme(ibiz.config.theme);
      if (appModel.appUIThemes) {
        await this.loadTheme();
      }

      // 设置浏览器标题
      if (app.model.title) {
        ibiz.util.setBrowserTitle('');
      }
    }

    this.noPermissionModel = permission;
    this.hasModelInit = true;
  }
}
