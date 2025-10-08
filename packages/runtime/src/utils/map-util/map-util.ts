/**
 * @description 根据行政等级获取行政等级对应的数字，province为1
 * @export
 * @param {string} areaLevel
 * @returns {*}  {number}
 */
export function getAreaLevelNum(areaLevel: string): number {
  return ['province', 'city', 'district', 'township'].indexOf(areaLevel) + 2;
}

/**
 * @description 根据行政编码计算行政等级，仅支持6位行政编码，国家级返回空串
 * @export
 * @param {string} code
 * @returns {*}  {number}
 */
export const getAreaLevelByCode = (code: string): string => {
  // 验证输入
  if (!code || code.length !== 6) {
    return '';
  }
  // 提取前6位作为基础代码
  const baseCode = code.substring(0, 6);
  // 国家级判断: 后5位为0
  if (baseCode.substring(1) === '00000') {
    return '';
  }
  // 省级判断: 后4位为0
  if (baseCode.substring(2) === '0000') {
    return 'province';
  }
  // 地级判断: 后2位为0
  if (baseCode.substring(4) === '00') {
    return 'city';
  }
  // 县级判断: 6位完整代码
  if (code.length === 6) {
    return 'district';
  }
  return '';
};
