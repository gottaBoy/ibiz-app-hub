import {
  IMobPlatformProvider,
  PlatformProviderBase,
} from '@ibiz-template/runtime';

/**
 * @description 移动端搭载平台处理器基类
 * @export
 * @class MobPlatformProviderBase
 */
export abstract class MobPlatformProviderBase
  extends PlatformProviderBase
  implements IMobPlatformProvider
{
  getShowViewHeader(): boolean {
    return ibiz.config.view.mobShowViewHeader;
  }

  getShowPresetBack(): boolean {
    return ibiz.config.view.mobShowPresetBack;
  }
}
