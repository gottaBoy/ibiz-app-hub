import {
  IDEForm,
  IDEFormItem,
  IDEFormDetail,
  IDEEditFormItem,
} from '@ibiz/model-core';
import { recursiveIterate } from '@ibiz-template/core';
import { clone, isNil, isNotNil } from 'ramda';
import { ControlService, ControlVO, UIMapField } from '../../../../service';
import { getDefaultValue } from '../../../utils';

/**
 * 表单的部件服务
 * @author lxm
 * @date 2023-12-13 03:04:57
 * @export
 * @class FormService
 * @extends {ControlService<T>}
 * @template T
 */
export class FormService<
  T extends IDEForm = IDEForm,
> extends ControlService<T> {
  /**
   * 属性key和界面key映射，key为属性key，value为多个界面key集合
   *
   * @author tony001
   * @date 2025-01-14 14:01:14
   */
  fieldToUIMap = new Map<string, string[]>();

  /**
   * 设置表单项的默认值
   * @author lxm
   * @date 2023-12-13 03:16:19
   * @param {IData} data 表单数据
   * @param {IContext} context 上下文
   * @param {IParams} params 视图参数
   * @param {('create' | 'update')} type 新建还是更新
   */
  setDefault(
    data: IData,
    context: IContext,
    params: IParams,
    type: 'create' | 'update',
  ): void {
    const { defaultData } = this.getLoadParams(params);
    // 递归所有的表单项，设置默认值
    recursiveIterate(
      this.model,
      (item: IDEFormItem, parent: IDEFormDetail) => {
        // 重复器中的子表单属性项不应挂在主表单中
        if (parent.detailType === 'MDCTRL') return true;
        if (item.detailType === 'FORMITEM') {
          const { createDVT, createDV, updateDVT, updateDV, valueFormat } =
            item;
          const valueType = type === 'create' ? createDVT : updateDVT;
          const defaultValue = type === 'create' ? createDV : updateDV;
          const name = item.id!.toLowerCase();

          const defaultVal = getDefaultValue(
            {
              name,
              valueType,
              defaultValue,
              valueFormat,
            },
            { data, context, params },
          );
          if (defaultVal !== undefined) {
            data[name] = defaultVal;
          }
          if (isNil(data[name]) && isNotNil(defaultData[name])) {
            data[name] = defaultData[name];
          }
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
        isBreak: true,
      },
    );
  }

  /**
   * 获取加载参数
   *
   * @author tony001
   * @date 2024-11-27 18:11:24
   * @param {IParams} args
   * @return {*}  {IParams}
   */
  getLoadParams(params: IParams): IParams {
    const copyArgs = clone(params);
    const defaultData: IData = {};
    if (copyArgs.srfdefdata) {
      Object.assign(defaultData, copyArgs.srfdefdata);
      delete copyArgs.srfdefdata;
    }
    return { args: copyArgs, defaultData };
  }

  /**
   * 初始化属性映射
   *
   * @author tony001
   * @date 2025-01-14 14:01:23
   * @protected
   */
  protected initUIDataMap(): void {
    super.initUIDataMap();
    // 初始化表单属性key和界面key映射
    recursiveIterate(
      this.model,
      (item: IDEFormDetail, parent: IDEFormDetail) => {
        // 重复器中的子表单属性项不应挂在主表单中
        if (parent.detailType === 'MDCTRL') return true;
        if (item.detailType === 'FORMITEM' || item.detailType === 'MDCTRL') {
          const formItem = item as IDEEditFormItem;
          const uiKey = formItem.id!.toLowerCase();
          const deField =
            formItem.fieldName || (item as IDEEditFormItem).appDEFieldId!;
          if (deField) {
            if (this.fieldToUIMap.has(deField)) {
              this.fieldToUIMap.get(deField)!.push(uiKey);
            } else {
              this.fieldToUIMap.set(deField, [uiKey]);
            }
          }
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
        isBreak: true,
      },
    );
  }

  /**
   * 根据表单项过滤出数据
   *
   * @author tony001
   * @date 2025-01-09 17:01:21
   * @param {IData} data
   * @param {Map<string, UIMapField>} [dataUIMap]
   * @return {*}  {IData}
   */
  getFilteredData(data: IData): IData {
    const _data = data instanceof ControlVO ? data.getOrigin() : data;
    const tempData: IData = {};
    // 存在扩展数据附加扩展数据，主表单数据优先级大于扩展数据
    if (data.srfexdata && Object.keys(data.srfexdata).length > 0) {
      Object.assign(tempData, { ...data.srfexdata });
    }
    let tempDataUIMap = this.dataUIMap;
    if (data.$dataUIMap && data.$dataUIMap.size > 0) {
      tempDataUIMap = data.$dataUIMap;
    }
    tempDataUIMap.forEach((dataUI: UIMapField) => {
      if (dataUI.isOneToMultiField) {
        if (data[dataUI.uiKey] !== undefined) {
          tempData[dataUI.dataKey] = data[dataUI.uiKey];
        }
      } else if (_data[dataUI.dataKey] !== undefined) {
        tempData[dataUI.dataKey] = _data[dataUI.dataKey];
      }
    });
    return tempData;
  }
}
