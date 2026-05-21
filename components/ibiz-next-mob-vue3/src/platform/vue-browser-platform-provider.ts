import {
  BrowserPlatformProvider,
  IMobPlatformProvider,
} from '@ibiz-template/runtime';
import { useViewStack } from '../util';

/**
 * vue浏览器搭载平台适配器
 *
 * @author zk
 * @date 2023-11-20 03:11:25
 * @export
 * @class BrowserPlatformProvider
 * @extends {PlatformProviderBase}
 */
export class VueBrowserPlatformProvider
  extends BrowserPlatformProvider
  implements IMobPlatformProvider
{
  /**
   * 返回事件
   *
   * @author zk
   * @date 2023-12-12 01:12:56
   * @memberof VueBrowserPlatformProvider
   */
  back(): void {
    const { goBack } = useViewStack();
    goBack();
  }

  getShowViewHeader(): boolean {
    return ibiz.config.view.mobShowViewHeader;
  }

  getShowPresetBack(): boolean {
    return ibiz.config.view.mobShowPresetBack;
  }
}
