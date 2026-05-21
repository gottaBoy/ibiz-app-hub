import {
  ViewController,
  IMEditView9Event,
  IMEditView9State,
  MDViewEngine,
  IMEditViewPanelController,
  SysUIActionTag,
  IApiMEditView9Call,
} from '@ibiz-template/runtime';
import { IAppDEMEditView } from '@ibiz/model-core';

export class MEditView9Engine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEMEditView,
    IMEditView9State,
    IMEditView9Event
  >;

  /**
   * 多数据部件名称
   * @author lxm
   * @date 2023-06-07 09:17:19
   * @readonly
   * @type {string}
   */
  get xdataControlName(): string {
    return 'meditviewpanel';
  }

  get meditviewpanel(): IMEditViewPanelController {
    return this.view.getController(
      'meditviewpanel',
    ) as IMEditViewPanelController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    if (!this.view.slotProps.meditviewpanel) {
      this.view.slotProps.meditviewpanel = {};
    }
  }

  async call(
    key: keyof IApiMEditView9Call,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.NEW) {
      await this.meditviewpanel.handleAdd();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      return null;
    }
    return super.call(key, args);
  }
}
