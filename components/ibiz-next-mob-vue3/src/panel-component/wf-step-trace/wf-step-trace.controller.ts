import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';
import { clone } from 'ramda';
import { WFStepTraceState } from './wf-step-trace.state';

/**
 * 面板按钮控制器
 *
 * @export
 * @class WFStepTraceController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class WFStepTraceController extends PanelItemController<IPanelRawItem> {
  /**
   * 导航占位状态
   *
   * @type {WFStepTraceState}
   * @memberof WFStepTraceController
   */
  declare state: WFStepTraceState;

  /**
   * 设置界面数据
   *
   * @author zk
   * @date 2023-07-04 04:07:00
   * @param {IData[]} data
   * @memberof WFStepTraceController
   */
  setData(data: IData): void {
    if (!data) {
      return;
    }
    // 排序时间
    const sortData = (a: IData, b: IData) => {
      return Date.parse(b.time) - Date.parse(a.time);
    };
    const commentsData: IData[] = [];
    const copyData = clone(data);
    let tasks = copyData.usertasks;
    if (!tasks) {
      return;
    }
    if (tasks.length > 0) {
      tasks = tasks.reverse();
      tasks.forEach((task: IData) => {
        if (task.identitylinks.length > 0) {
          const authorNames = this.acceptingOfficerNoDup(
            'displayname',
            task.identitylinks,
          );
          commentsData.push({
            authorName: authorNames.join('、'),
            taskName: task.userTaskName,
            isLink: true,
          });
        }
        if (task.comments.length > 0) {
          task.comments.forEach((comment: IData) => {
            Object.assign(comment, { taskName: task.userTaskName });
          });
          task.comments.sort(sortData);
          commentsData.push(...task.comments);
        }
      });
      this.state.data = commentsData;
    }
  }

  /**
   * 办理人员名称显示去重
   *
   * @author zk
   * @date 2023-07-04 04:07:03
   * @param {string} tag 需要去重的名称标识
   * @param {IData[]} dataS 需要去重数据集
   * @return {*}
   * @memberof WFStepTraceController
   */
  acceptingOfficerNoDup(tag: string, dataS: IData[]): IData[] {
    const tempData: IData[] = [];
    if (dataS?.length > 0 && tag) {
      dataS.forEach((data: IData) => {
        tempData.push(data[tag]);
      });
    }
    const noDup = [...new Set(tempData)];
    return noDup;
  }

  /**
   * @description 获取数据
   * @exposedoc
   * @return {*}
   * @memberof WFStepTraceController
   */
  getData(): IData[] {
    return this.state.data;
  }
}
