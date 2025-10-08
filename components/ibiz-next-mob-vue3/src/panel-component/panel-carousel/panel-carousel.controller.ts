import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem, IRawItemParam, ISysImage } from '@ibiz/model-core';

/**
 * 面板轮播图控制器
 *
 * @author zk
 * @date 2023-12-08 02:12:18
 * @export
 * @class PanelCarouselController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class PanelCarouselController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 图片集
   * @exposedoc
   * @memberof PanelCarouselController
   */
  public images: ISysImage[] = [];

  /**
   * 初始化
   *
   * @author zk
   * @date 2023-12-08 11:12:23
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PanelCarouselController
   */
  protected async onInit(): Promise<void> {
    super.onInit();
    this.initCarouselImages();
  }

  /**
   * 初始化轮播图资源
   *
   * @author zk
   * @date 2023-12-08 02:12:03
   * @return {*}  {void}
   * @memberof PanelCarouselController
   */
  initCarouselImages(): void {
    const params: IRawItemParam[] | undefined =
      this.model.rawItem!.rawItemParams;
    if (!params) {
      ibiz.log.error('未配置轮播图资源');
      return;
    }
    this.images = params
      .filter(item => item.key === 'img')
      .map(item => item.sysImage) as ISysImage[];
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
      ibiz.log.error(`未配置轮播图参数:${key}}`);
      return undefined;
    }
    params.forEach((item: IRawItemParam) => {
      if (item.key === key) {
        value = item.value;
      }
    });
    return value;
  }
}
