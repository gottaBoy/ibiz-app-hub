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
      const helper = new ModelHelper(
        async url => {
          if (ibiz.env.isLocalModel) {
            const res = await ibiz.net.getModel(`./model${url}`);
            return res.data;
          }
          const res = await ibiz.net.get(
            `${ibiz.env.remoteModelUrl}${url}`,
            undefined,
            permission ? {} : { srfdcsystem: ibiz.env.dcSystem },
          );
          return res.data;
        },
        ibiz.env.appId,
        context,
        permission,
      );
      const app = await ibiz.hub.getAppAsync(ibiz.env.appId);
      await this.initEnvironment(app.model);
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

      await this.initTheme(app.model);
      // 设置浏览器标题
      if (app.model.title) {
        ibiz.util.setBrowserTitle('');
      }
    }

    this.noPermissionModel = permission;
    this.hasModelInit = true;
  }
}
