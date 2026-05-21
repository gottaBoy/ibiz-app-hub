/* eslint-disable @typescript-eslint/no-explicit-any */
import { clone } from 'ramda';
import { RuntimeError } from '@ibiz-template/core';
import { IDEReportPanel } from '@ibiz/model-core';
import { IModalData, IReportPanelController } from '../../interface';

/**
 * 打开设计界面参数
 *
 * @author tony001
 * @date 2024-06-30 11:06:27
 * @export
 * @interface designPageParam
 */
export interface designPageParam {
  /**
   * 模式，数据模式 | 界面模式, 默认数据模式
   *
   * @author tony001
   * @date 2024-06-30 11:06:16
   * @type {('DATA' | 'UI')}
   */
  mode?: 'DATA' | 'UI';

  /**
   * 数据模式下传入报表标识
   *
   * @author tony001
   * @date 2024-06-30 11:06:12
   * @type {string}
   */
  reportId?: string;

  /**
   * 界面模式下传入报表面板对象
   *
   * @author tony001
   * @date 2024-06-30 11:06:00
   * @type {IReportPanelController}
   */
  reportPanel?: IReportPanelController;

  /**
   * 报表标识
   *
   * @author tony001
   * @date 2024-07-04 11:07:22
   * @type {string}
   */
  srfreporttag?: string;

  /**
   * 报表体系标识
   *
   * @author tony001
   * @date 2024-07-04 11:07:35
   * @type {string}
   */
  srfbischematag?: string;
}

export class BIReportUtil {
  /**
   * 打开设计界面
   *
   * @author tony001
   * @date 2024-06-30 11:06:21
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} data
   * @return {*}  {Promise<IModalData>}
   */
  async openDesignPage(
    context: IContext,
    params: IParams,
    data: designPageParam,
  ): Promise<IModalData> {
    if (!data.mode) data.mode = 'DATA';
    const tempContext: IContext = clone(context);
    let config: IData = {};
    if (data.mode === 'DATA') {
      const app = ibiz.hub.getApp(ibiz.env.appId);
      try {
        Object.assign(tempContext, { pssysbireport: data.reportId });
        const res = await app.deService.exec(
          'pssysbireport',
          'get',
          tempContext,
          params,
        );
        if (res.data) {
          config = await this.translateDEReportToConfig(res.data);
          // 报表标识
          if (data.srfreporttag) {
            config.reportTag = data.srfreporttag;
          }
          // 报表体系标识
          if (data.srfbischematag) {
            config.selectedSchemeId = data.srfbischematag;
          }
        }
      } catch (error: any) {
        throw new RuntimeError(error.message);
      }
    } else if (data.mode === 'UI') {
      config = this.translateReportPanelToConfig(data.reportPanel!.model);
    }
    const modal = ibiz.overlay.createModal(
      'iBizBIReportDesign',
      {
        dismiss: (_data?: IModalData) => modal.dismiss(_data),
        context: tempContext,
        viewParams: params,
        config,
      },
      {
        width: '90%',
        height: '90%',
        footerHide: true,
      },
    );
    modal.present();
    const result: IModalData = await modal.onWillDismiss();
    return result;
  }

  /**
   * 实体报表数据转化配置数据
   *
   * @author tony001
   * @date 2024-06-30 11:06:00
   * @private
   * @param {IData} data
   * @return {*}  {IData}
   */
  async translateDEReportToConfig(data: IData): Promise<IData> {
    const config: IData = {};
    let biReportUIModel: IData = {};
    if (data.bireportuimodel) {
      biReportUIModel = JSON.parse(data.bireportuimodel);
    }
    config.selectChartType = biReportUIModel?.selectChartType || 'NUMBER';
    config.reportTag = 'bi_report';
    config.selectCubeId = data.pssysbicubeid;
    config.selectedSchemeId = data.pssysbischemeid;
    const biReportItems: IData = {};
    if (data.pssysbireportitems && data.pssysbireportitems.length > 0) {
      data.pssysbireportitems.forEach((item: IData) => {
        if (item.birepitemtype === 'MEASURE') {
          if (!biReportItems.measure) {
            biReportItems.measure = [];
          }
          const tempMeasure: IData = {
            pssysbischemeid: item.pssysbischemeid,
            pssysbicubemeasureid: item.pssysbicubemeasureid,
            pssysbicubeid: item.pssysbicubeid,
            codename: item.pssysbicubemeasureid?.split('.').pop(),
            pssysbicubemeasurename: item.pssysbicubemeasurename,
            birepitemparams: item.birepitemparams,
          };
          if (biReportUIModel.extend) {
            const { extend } = biReportUIModel;
            if (extend[`aggmode@${tempMeasure.codename}`]) {
              tempMeasure.aggtype = extend[`aggmode@${tempMeasure.codename}`];
              tempMeasure.bimeasuretype = 'COMMON';
            }
          }
          biReportItems.measure.push(tempMeasure);
        }
        if (item.birepitemtype === 'DIMENSION') {
          const tempDimension: IData = {
            pssysbischemeid: item.pssysbischemeid,
            pssysbicubedimensionid: item.pssysbicubedimensionid,
            pssysbicubeid: item.pssysbicubeid,
            codename: item.pssysbicubedimensionid?.split('.').pop(),
            pssysbicubedimensionname: item.pssysbicubedimensionname,
            placement: item.placement,
            birepitemparams: item.birepitemparams,
          };
          // 交叉表维度列
          if (item.placement === 'COLHEADER') {
            if (!biReportItems.dimension_col) {
              biReportItems.dimension_col = [];
            }
            biReportItems.dimension_col.push(tempDimension);
            // 分组维度
          } else if (
            biReportUIModel &&
            biReportUIModel.group &&
            biReportUIModel.group.indexOf(item.pssysbicubedimensionid) !== -1
          ) {
            if (!biReportItems.group) {
              biReportItems.group = [];
            }
            biReportItems.group.push(tempDimension);
            // 普通维度
          } else {
            if (!biReportItems.dimension) {
              biReportItems.dimension = [];
            }
            biReportItems.dimension.push(tempDimension);
          }
        }
      });
    }
    const propertyData: IData = {
      caption: data.pssysbireportname,
    };
    if (Object.keys(biReportItems).length > 0) {
      Object.assign(propertyData, { data: biReportItems });
    }
    if (biReportUIModel.style) {
      Object.assign(propertyData, { style: biReportUIModel.style });
    }
    // 识别filter
    if (biReportUIModel.filter) {
      propertyData.data.filter = biReportUIModel.filter;
    }
    // 识别period
    if (biReportUIModel.period) {
      propertyData.data.period = biReportUIModel.period;
    }
    // 识别扩展字段
    if (biReportUIModel.extend) {
      propertyData.extend = biReportUIModel.extend;
    }
    config.propertyData = propertyData;
    return config;
  }

  /**
   * 报表面板数据转化配置界面数据
   *
   * @param {IDEReportPanel} model
   * @return {*}  {Promise<IData>}
   * @memberof BIReportUtil
   */
  async translateReportPanelToConfig(model: IDEReportPanel): Promise<IData> {
    const config: IData = {};
    let reportUIModelObj: IData = {};
    const biReportDatas: IData = {};
    const { appDEReport } = model;
    const propertyData: IData = {
      data: biReportDatas,
    };
    config.reportTag = appDEReport!.id;
    const tempAppBISchemeId = appDEReport!.appBISchemeId!.split('.').pop();
    config.selectedSchemeId = tempAppBISchemeId;
    const {
      name,
      appBICubeId,
      appBIReportDimensions,
      appBIReportMeasures,
      reportUIModel,
    } = appDEReport!.appBIReport!;
    propertyData.caption = name;
    config.selectCubeId = `${tempAppBISchemeId}.${appBICubeId}`;
    if (reportUIModel) {
      reportUIModelObj = JSON.parse(reportUIModel);
      config.selectChartType = reportUIModelObj.selectChartType;
      propertyData.style = reportUIModelObj.style;
      // 识别filter
      if (reportUIModelObj.filter) {
        propertyData.data.filter = reportUIModelObj.filter;
      }
      // 识别period
      if (reportUIModelObj.period) {
        propertyData.data.period = reportUIModelObj.period;
      }
      // 识别扩展字段
      if (reportUIModelObj.extend) {
        propertyData.extend = reportUIModelObj.extend;
      }
    } else {
      config.selectChartType = 'NUMBER';
    }
    if (appBIReportMeasures && appBIReportMeasures.length > 0) {
      appBIReportMeasures.forEach((measure: IModel) => {
        if (!biReportDatas.measure) {
          biReportDatas.measure = [];
        }
        const tempMeasure: IData = {
          pssysbischemeid: tempAppBISchemeId,
          pssysbicubemeasureid: `${tempAppBISchemeId}.${appBICubeId}.${measure.measureTag}`,
          pssysbicubemeasurename: measure.measureName,
          pssysbicubeid: `${tempAppBISchemeId}.${appBICubeId}`,
          codename: measure.measureTag,
          birepitemparams: measure.birepitemparams,
        };
        if (reportUIModelObj.extend) {
          const { extend } = reportUIModelObj;
          if (extend[`aggmode@${tempMeasure.codename}`]) {
            tempMeasure.aggtype = extend[`aggmode@${tempMeasure.codename}`];
            tempMeasure.bimeasuretype = 'COMMON';
          }
        }
        biReportDatas.measure.push(tempMeasure);
      });
    }
    if (appBIReportDimensions && appBIReportDimensions.length > 0) {
      appBIReportDimensions.forEach((dimension: IModel) => {
        if (!biReportDatas.dimension) {
          biReportDatas.dimension = [];
        }
        const tempDimension = {
          pssysbischemeid: tempAppBISchemeId,
          pssysbicubedimensionid: `${tempAppBISchemeId}.${appBICubeId}.${dimension.dimensionTag}`,
          pssysbicubedimensionname: dimension.dimensionName,
          pssysbicubeid: `${tempAppBISchemeId}.${appBICubeId}`,
          codename: dimension.dimensionTag,
          pscodelistid: dimension.appCodeListId,
          placement: dimension.placement,
          birepitemparams: dimension.birepitemparams,
        };
        biReportDatas.dimension.push();
        // 交叉表维度列
        if (dimension.placement === 'COLHEADER') {
          if (!biReportDatas.dimension_col) {
            biReportDatas.dimension_col = [];
          }
          biReportDatas.dimension_col.push(tempDimension);
          // 分组维度
        } else if (
          reportUIModelObj &&
          reportUIModelObj.group &&
          reportUIModelObj.group.indexof(
            `${tempAppBISchemeId}.${appBICubeId}.${dimension.dimensionTag}`,
          ) !== -1
        ) {
          if (!biReportDatas.group) {
            biReportDatas.group = [];
          }
          biReportDatas.group.push(tempDimension);
          // 普通维度
        } else {
          if (!biReportDatas.dimension) {
            biReportDatas.dimension = [];
          }
          biReportDatas.dimension.push(tempDimension);
        }
      });
    }
    config.propertyData = propertyData;
    return config;
  }

  /**
   * 指定参数数据转化为应用BI报表数据
   *
   * @param {{
   *     reportTag: string;
   *     selectChartType: string;
   *     selectCubeId: string;
   *     caption: string;
   *     data: IData;
   *     style: IData;
   *   }} arg
   * @return {*}  {Promise<IData>}
   * @memberof BIReportUtil
   */
  async translateDataToAppBIReport(arg: {
    context: IContext;
    reportTag: string;
    selectChartType: string;
    selectCubeId: string;
    caption: string;
    data: IData;
    style: IData;
    extend: IData;
  }): Promise<IData> {
    const {
      context,
      reportTag,
      selectChartType,
      selectCubeId,
      caption,
      data,
      style,
      extend,
    } = arg;
    const app = ibiz.hub.getApp(context.srfappid);
    const tempUIReportModel: IData = {
      selectChartType,
      style,
    };
    // 识别filter
    if (data.filter) {
      Object.assign(tempUIReportModel, { filter: data.filter });
    }
    // 识别period
    if (data.period) {
      Object.assign(tempUIReportModel, { period: data.period });
    }
    // 识别扩展字段
    if (extend && Object.keys(extend).length > 0) {
      Object.assign(tempUIReportModel, { extend });
    }
    const targetData: IData = {
      pssysbireportitems: [],
      pssysbischemeid: selectCubeId.split('.')[0],
      pssysbicubeid: selectCubeId,
      bireportuimodel: JSON.stringify(tempUIReportModel),
      pssysappid: app.model.codeName,
      bireporttag: reportTag,
      pssysbireportname: caption,
      validflag: 1,
    };
    if (data && data.measure) {
      data.measure.forEach((measure: IData) => {
        const tempMeasure: IData = {
          birepitemtype: 'MEASURE',
          pssysbischemeid: measure.pssysbischemeid,
          pssysbicubemeasureid: measure.pssysbicubemeasureid,
          pssysbicubeid: measure.pssysbicubeid,
          pssysbicubename: measure.pssysbicubename,
          pssysbicubemeasurename: measure.pssysbicubemeasurename,
          birepitemparams: measure.birepitemparams,
          validflag: 1,
        };
        targetData.pssysbireportitems.push(tempMeasure);
      });
    }
    if (data && data.dimension) {
      data.dimension.forEach((dimension: IData) => {
        const tempDimension: IData = {
          birepitemtype: 'DIMENSION',
          pssysbischemeid: dimension.pssysbischemeid,
          pssysbicubedimensionid: dimension.pssysbicubedimensionid,
          pssysbicubeid: dimension.pssysbicubeid,
          pssysbicubename: dimension.pssysbicubename,
          pssysbicubedimensionname: dimension.pssysbicubedimensionname,
          birepitemparams: dimension.birepitemparams,
          validflag: 1,
        };
        targetData.pssysbireportitems.push(tempDimension);
      });
    }
    await this.mergeSpecialParams(selectChartType, arg, targetData);
    return targetData;
  }

  /**
   * 合入特殊参数
   *
   * @author tony001
   * @date 2024-07-05 09:07:02
   * @param {string} type
   * @param {IData} sourceData
   * @param {IData} targetData
   * @return {*}  {Promise<void>}
   */
  async mergeSpecialParams(
    type: string,
    sourceData: IData,
    targetData: IData,
  ): Promise<void> {
    switch (type) {
      // 交叉表
      case 'CROSSTABLE':
        await this.mergeCrosstableSpecialParams(sourceData, targetData);
        break;
      // 分组参数
      case 'MULTI_SERIES_COL':
      case 'STACK_COL':
      case 'ZONE_COL':
      case 'MULTI_SERIES_BAR':
      case 'STACK_BAR':
      case 'MULTI_SERIES_LINE':
      case 'ZONE_LINE':
      case 'AREA':
        await this.mergeGroupParams(sourceData, targetData);
        break;
      default:
        break;
    }
  }

  /**
   * 处理交叉表特殊参数（维度列）
   *
   * @author tony001
   * @date 2024-07-05 10:07:56
   * @param {IData} sourceData
   * @param {IData} targetData
   * @return {*}  {Promise<void>}
   */
  async mergeCrosstableSpecialParams(
    sourceData: IData,
    targetData: IData,
  ): Promise<void> {
    const { data } = sourceData;
    if (data && data.dimension_col?.length > 0) {
      data.dimension_col.forEach((dimension: IData) => {
        const tempDimension: IData = {
          birepitemtype: 'DIMENSION',
          pssysbischemeid: dimension.pssysbischemeid,
          pssysbicubedimensionid: dimension.pssysbicubedimensionid,
          pssysbicubeid: dimension.pssysbicubeid,
          pssysbicubename: dimension.pssysbicubename,
          pssysbicubedimensionname: dimension.pssysbicubedimensionname,
          placement: 'COLHEADER',
          validflag: 1,
        };
        // 添加维度数据
        targetData.pssysbireportitems.push(tempDimension);
      });
    }
  }

  /**
   * 处理分组特殊参数(添加维度数据并将标识存到ui报表模型的group字段中)
   *
   * @author tony001
   * @date 2024-07-05 10:07:05
   * @param {IData} sourceData
   * @param {IData} targetData
   * @return {*}  {Promise<void>}
   */
  async mergeGroupParams(sourceData: IData, targetData: IData): Promise<void> {
    const { data } = sourceData;
    if (data && data.group?.length > 0) {
      const groupNames: string[] = [];
      data.group.forEach((groupItem: IData) => {
        const tempDimension: IData = {
          birepitemtype: 'DIMENSION',
          pssysbischemeid: groupItem.pssysbischemeid,
          pssysbicubedimensionid: groupItem.pssysbicubedimensionid,
          pssysbicubeid: groupItem.pssysbicubeid,
          pssysbicubename: groupItem.pssysbicubename,
          pssysbicubedimensionname: groupItem.pssysbicubedimensionname,
          validflag: 1,
        };
        // 添加维度数据
        targetData.pssysbireportitems.push(tempDimension);
        groupNames.push(groupItem.pssysbicubedimensionid);
      });
      const biReportUIModel = JSON.parse(targetData.bireportuimodel);
      // 添加bi报表界面模型group数据
      biReportUIModel.group = groupNames;
      targetData.bireportuimodel = JSON.stringify(biReportUIModel);
    }
  }
}
