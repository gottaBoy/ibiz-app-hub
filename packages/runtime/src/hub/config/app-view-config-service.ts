import { RuntimeError } from '@ibiz-template/core';
import { IAppView } from '@ibiz/model-core';
import { IAppViewConfigService, IViewConfig } from '../../interface';

/**
 * 应用视图配置服务
 *
 * @author chitanda
 * @date 2023-12-21 16:12:06
 * @export
 * @class AppViewConfigService
 * @implements {IAppViewConfigService}
 */
export class AppViewConfigService implements IAppViewConfigService {
  /**
   * 视图配置信息集合
   * @author lxm
   * @date 2023-07-03 07:08:33
   */
  protected viewConfigs = new Map<string, IViewConfig>();

  /**
   * 计算应用视图 标识
   *
   * @author chitanda
   * @date 2023-04-20 18:04:48
   * @protected
   * @param {string} tag
   * @return {*}  {string}
   */
  protected calcAppViewId(tag: string = ''): string {
    let id = '';
    if (tag && tag.indexOf('.') !== -1) {
      const ids = tag.split('.');
      id = ids[ids.length - 1];
    } else {
      id = tag.toLowerCase();
    }
    return id;
  }

  /**
   * 获取视图自定义Option
   *
   * @author zk
   * @date 2024-01-31 11:01:20
   * @protected
   * @param {IAppView} model
   * @return {*}  {IData}
   * @memberof AppViewConfigService
   */
  protected getCustomOption(model: IAppView): {
    modalOption: IData;
    waterMarkOption: IData;
  } {
    const { appViewParams, userParam } = model;
    // 解析ModalOption参数
    let optionProperty = appViewParams?.find(
      item => item.id === 'modaloption',
    )?.value;

    // 应用功能视图没有viewParams，从userParam中获取modalOption
    if (!optionProperty && userParam) {
      // 解析ModalOption参数
      optionProperty = userParam.modalOption;
    }

    let modalOption = {};
    if (optionProperty) {
      try {
        modalOption = JSON.parse(optionProperty);
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t('runtime.hub.failedParse', {
            error,
            paramsName: 'modalOption',
          }),
        );
      }
    }

    // 解析waterMarkOption参数
    let waterMarkProperty = appViewParams?.find(
      item => item.id === 'watermarkoption',
    )?.value;

    // 应用功能视图没有viewParams，从userParam中获取waterMarkOption
    if (!waterMarkProperty && userParam) {
      // 解析waterMarkOption参数
      waterMarkProperty = userParam.waterMarkOption;
    }

    let waterMarkOption = {};
    if (waterMarkProperty) {
      try {
        waterMarkOption = JSON.parse(waterMarkProperty);
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t('runtime.hub.failedParse', {
            error,
            paramsName: 'waterMarkOption',
          }),
        );
      }
    }
    return { modalOption, waterMarkOption };
  }

  has(key: string): boolean {
    const id = this.calcAppViewId(key);
    return this.viewConfigs.has(id);
  }

  set(key: string, viewConfig: IViewConfig): void {
    const id = this.calcAppViewId(key);
    this.viewConfigs.set(id, viewConfig);
  }

  async get(key: string): Promise<IViewConfig> {
    const id = this.calcAppViewId(key);
    // 没有的时候请求视图模型并设置
    if (!this.viewConfigs.has(id)) {
      //! 只有动态走这个逻辑，全代码确保所有视图都设置了viewConfig
      const model = await ibiz.hub.getAppView(id);
      if (!model) {
        throw new RuntimeError(ibiz.i18n.t('runtime.hub.noExist', { id }));
      }
      this.set(model.id!, {
        id: model.id!,
        appId: model.appId!,
        codeName: model.codeName!,
        openMode: model.openMode!,
        viewType: model.viewType!,
        width: model.width,
        height: model.height,
        appDataEntityId: model.appDataEntityId,
        redirectView: model.redirectView,
        ...this.getCustomOption(model),
      });
    }
    return this.viewConfigs.get(id)!;
  }

  getSync(key: string): IViewConfig | null {
    if (this.viewConfigs.has(key)) {
      return this.viewConfigs.get(key)!;
    }
    return null;
  }
}
