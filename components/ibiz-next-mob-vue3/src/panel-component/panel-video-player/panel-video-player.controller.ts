import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem, IRawItemParam } from '@ibiz/model-core';

/**
 * 面板视频播放器控制器
 *
 * @author zk
 * @date 2023-12-08 02:12:07
 * @export
 * @class PanelCarouselController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class PanelVideoPlayerController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 视频播放器额外参数
   * @exposedoc
   * @memberof PanelVideoPlayerController
   */
  public rawItemParams = {};

  /**
   *
   *
   * @author zk
   * @date 2023-12-08 03:12:26
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PanelVideoPlayerController
   */
  protected async onInit(): Promise<void> {
    super.onInit();
    this.initRawItemParams();
  }

  /**
   * 获取直接内容参数
   *
   * @author zk
   * @date 2023-12-08 02:12:51
   * @param {string} key
   * @return {*}  {(string | undefined)}
   * @memberof PanelCarouselController
   */
  getParamsValue(key: string): string | undefined {
    let value: string | undefined;
    const params: IRawItemParam[] | undefined =
      this.model.rawItem!.rawItemParams;
    if (!params) {
      ibiz.log.error(`未配置视频播放参数:${key}}`);
      return undefined;
    }
    params.forEach((item: IRawItemParam) => {
      if (item.key === key) {
        value = item.value;
      }
    });
    return value;
  }

  /**
   * 初始化额外参数
   *
   * @author zk
   * @date 2023-12-08 03:12:27
   * @return {*}  {void}
   * @memberof PanelVideoPlayerController
   */
  public initRawItemParams(): void {
    const arrayParams: IRawItemParam[] | undefined =
      this.model.rawItem!.rawItemParams;
    if (!arrayParams) {
      ibiz.log.error(`未配置视频播放参数`);
      return;
    }
    const rawItemParams: IData = {};
    for (let i = 0; i < arrayParams.length; i++) {
      const item = arrayParams[i];
      rawItemParams[item.key!] = item.value;
    }
    this.rawItemParams = rawItemParams;
  }
}
