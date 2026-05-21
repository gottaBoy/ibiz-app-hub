import { IMobPlatformProvider } from '@ibiz-template/runtime';
import { VueBrowserPlatformProvider } from './vue-browser-platform-provider';

/**
 * @description 安卓搭载平台适配器
 * @export
 * @class AndroidPlatformProvider
 */
export class AndroidPlatformProvider
  extends VueBrowserPlatformProvider
  implements IMobPlatformProvider
{
  getShowViewHeader(): boolean {
    return ibiz.config.view.mobShowViewHeader;
  }

  getShowPresetBack(): boolean {
    return ibiz.config.view.mobShowPresetBack;
  }
}
