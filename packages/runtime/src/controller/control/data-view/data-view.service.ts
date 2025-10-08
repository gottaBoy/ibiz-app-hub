import { IDEDataView } from '@ibiz/model-core';
import { IHttpResponse, clone } from '@ibiz-template/core';
import { ControlVO, MDControlService, UIMapField } from '../../../service';

/**
 * 数据视图（卡片）部件服务
 *
 * @export
 * @class DataViewControlService
 * @extends {MDControlService<IDEDataView>}
 */
export class DataViewControlService<
  T extends IDEDataView = IDEDataView,
> extends MDControlService<T> {
  /**
   * @description 移动并排序数据
   * @param {IContext} context
   * @param {ControlVO} data
   * @param {IData} args
   * @returns {*}  {Promise<IHttpResponse<ControlVO[]>>}
   * @memberof DataViewControlService
   */
  async moveOrderItem(
    context: IContext,
    data: ControlVO,
    args: IData,
  ): Promise<IHttpResponse<ControlVO[]>> {
    const moveAction = this.model.moveControlAction!.appDEMethodId!;
    const params = clone(data.getOrigin());
    Object.assign(params, args);
    let res = await this.exec(moveAction, context, params, {
      srfupdateitem: true,
    });
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO[]>;
  }

  /**
   * 初始化属性映射
   *
   * @memberof DataViewControlService
   */
  initUIDataMap(): void {
    super.initUIDataMap();
    // *初始化数据项的属性映射
    this.model.dedataViewDataItems?.forEach(item => {
      const uiKey = item.id!.toLowerCase();
      const deField = item.appDEFieldId;
      let mapField: UIMapField;
      // 后台实体属性
      if (deField) {
        const deFieldKey = deField.toLowerCase();
        mapField = new UIMapField(uiKey, deFieldKey, {
          isOriginField: true,
          dataType: item.dataType,
        });
      } else {
        // 前台属性
        mapField = new UIMapField(uiKey, uiKey);
      }
      this.dataUIMap.set(uiKey, mapField);
    });
  }
}
