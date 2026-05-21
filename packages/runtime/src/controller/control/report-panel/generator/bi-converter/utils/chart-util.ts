/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class ChartUtil {
  /**
   * @description x轴标签标题
   * @static
   * @returns {*}
   * @memberof ChartUtil
   */
  static xAxisLabel() {
    const options: IData = {};
    options.formatter = `function(param) {
      if (param && param.includes(' ')) {
        const time = new Date(param);
        if (time.toString() !== 'Invalid Date') {
          return time.toLocaleDateString().replaceAll('/','-');
        }
      }
      if(param.indexOf('_') < 0){
          return param;
      }
      const str = param.split('_').pop();
      if(str.length > 4){
        return str.slice(0,4) + '...'
      }
      return str;
    }`;
    return options;
  }

  /**
   * @description 使用间隔的时候加上省略限制
   * @static
   * @param {number} [labelInterval=1]
   * @returns {*}
   * @memberof ChartUtil
   */
  static computeLabelEllipsis(labelInterval: number = 1) {
    return {
      width: 60 * (labelInterval > 0 ? labelInterval : 1),
      overflow: 'truncate',
      ellipsis: '...',
    };
  }

  /**
   * @description 获取图例位置
   * @static
   * @param {string} position
   * @returns {*}  {IData}
   * @memberof ChartUtil
   */
  static getLegendPosition(position: string): IData {
    const legendGap: number = 20;
    const options: IData = {
      type: 'scroll',
    };
    if (position === 'left' || position === 'right') {
      options.orient = 'vertical';
      options[position] = legendGap;
      options.top = 'middle';
    }
    if (position === 'top' || position === 'bottom') {
      options.left = 'center';
      options.top = position;
    }
    if (position === 'left-top') {
      options.left = legendGap;
      options.top = 'top';
    }
    if (position === 'right-top') {
      options.right = legendGap;
      options.top = 'top';
    }
    if (position === 'left-bottom') {
      options.left = legendGap;
      options.top = 'bottom';
    }
    if (position === 'right-bottom') {
      options.right = legendGap;
      options.top = 'bottom';
    }
    return options;
  }
}
