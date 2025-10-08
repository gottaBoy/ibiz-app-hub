import { useNamespace } from '@ibiz-template/vue3-util';

export async function getJsonUrl(
  baseUrl: string,
  code: string | number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const res = await ibiz.net.axios({
    url: `${baseUrl}/${code}.json`,
  });
  return res.data;
}

/** 渐变颜色集合 */
export const GradientColors = ['#90d1e7', '#fff600', '#ff5200'];

export const defaultOpts = {
  /** true地图code标识使用字符串，false使用数字 */
  strAreaCode: false,
  /** 热力图配置 */
  visualMap: {
    /** 两端的文本，如 ['高', '低'] */
    text: [
      ibiz.i18n.t('component.mapChart.high'),
      ibiz.i18n.t('component.mapChart.low'),
    ],
    /** 底部代表的值 */
    min: 0,
    /** 顶部代表的值 */
    max: 100,
    /** 热力图渐变颜色数组 */
    rangeColor: GradientColors,
  },
  /** 区块颜色 */
  areaColor: '#87cefa',
  /** 区块边界颜色 */
  areaBorderColor: '#FFF',
  /** 悬浮时区块颜色 */
  hoverAreaColor: '#fbdb2f',
  /** 点图标 */
  pointSymbol: 'pin',
  /** 地图json数据基础路径 */
  jsonBaseUrl: `${ibiz.env.assetsUrl}/json/map`,
  /** 默认打开的区域编码 */
  defaultAreaCode: 100000 as string | number,
  // 距离底部距离
  bottom: 20,
  // 距离顶部距离
  top: 20,
};

export type MapOptions = typeof defaultOpts;

/**
 * @description 获取项样式
 * @param {IData} item
 * @returns {*}  {string}
 */
const getItemStyle = (item: IData): string => {
  const itemStyle = [];
  if (item._color) {
    itemStyle.push(`color:${item._color}`);
  }
  if (item._bgcolor) {
    itemStyle.push(`background:${item._bgcolor}`);
  }
  if (item._borderColor) {
    itemStyle.push(`border-color:${item._borderColor}`);
  }
  if (item._borderWidth) {
    itemStyle.push(`border-width:${item._borderWidth}px`);
  }
  if (item._borderWidth && item._borderColor) {
    itemStyle.push(`border-style:solid`);
  }
  return itemStyle.join(';');
};

export const findData = (
  id: string,
  type: 'area' | 'point',
  pointData: IData[] = [],
  areaData: IData[] = [],
): IData | undefined => {
  if (type === 'area') {
    return areaData.find(item => item._id === id);
  }
  if (type === 'point') {
    return pointData.find(item => item._id === id);
  }
};

export const getCssVarByName = (name: string): string => {
  let result: string = name;
  const styles = window.getComputedStyle(document.documentElement);
  if (styles) {
    result = styles.getPropertyValue(name) || result;
  }
  return result;
};

export const getPointStaticOption = (params: IData): IData => {
  const { pointSymbol } = params;
  const ns = useNamespace('map-chart-user');
  const textColor = getCssVarByName(ns.cssVarName('color-danger'));
  const fontSize = getCssVarByName(ns.cssVarName('font-size-header-4'));
  const options = {
    type: 'scatter',
    coordinateSystem: 'geo',
    symbol: pointSymbol,
    symbolSize: Number(fontSize.slice(0, 2)),
    visualMap: false,
    itemStyle: {
      color: textColor,
    },
  };
  return options;
};

export const getPointOption = (
  pointData: IData[],
  areaData: IData[],
): IData => {
  const options: IData = {};
  const ns = useNamespace('map-chart-user');
  const textColor = getCssVarByName(ns.cssVarName('color-text-1'));
  const fontSize = getCssVarByName(ns.cssVarName('font-size-regular'));

  options.label = {
    show: true,
    color: textColor,
    fontSize: Number(fontSize.slice(0, 2)),
    textShadowBlur: 0,
    formatter: (params: IData) => {
      if (!params.data) {
        return;
      }
      const find = findData(params.data._id, 'point', pointData, areaData)!;
      return find?._text;
    },
    // 偏移
    position: 'left',
    offset: [10, -15],
  };
  options.tooltip = {
    formatter: (params: IData) => {
      if (!params.data) {
        return;
      }
      const find = findData(params.data._id, 'point', pointData, areaData)!;
      if (!find) {
        return;
      }
      const { _deData: data } = find;
      let text = data.srfmajortext;
      if (find._value) {
        text = `${data.srfmajortext}: ${find._value}`;
      }
      if (find._tooltip) {
        text = find._tooltip;
      }
      const style = getItemStyle(find);
      return `<div style="${style}" class="${find._className} ${ns.e(
        'popper',
      )}">${text}</div>`;
    },
    padding: 0,
  };
  options.data = pointData.map(item => {
    let symbol;
    if (item._symbol) {
      symbol = `image://${item._symbol}`;
    }
    return {
      _id: item._id,
      symbol,
      value: [Number(item._longitude), Number(item._latitude)],
      // 每个点逃离visualMap
      visualMap: false,
    };
  });
  return options;
};

export const getAreaStaticOption = (params: IData): IData => {
  const { areaColor, areaBorderColor, hoverAreaColor } = params;
  const options = {
    type: 'map',
    nameProperty: 'adcodeStr',
    itemStyle: {
      // 默认区域颜色
      areaColor,
      borderColor: areaBorderColor,
      borderWidth: 2,
    },
    // 悬浮样式
    emphasis: {
      itemStyle: {
        areaColor: hoverAreaColor,
      },
    },
  };
  return options;
};

export const getAreaOption = (
  mapName: string,
  pointData: IData[],
  areaData: IData[],
  cityInfo: IData = [],
): IData => {
  const options: IData = {};
  const ns = useNamespace('map-chart-user');
  const textColor = getCssVarByName(ns.cssVarName('color-text-1'));
  const fontSize = getCssVarByName(ns.cssVarName('font-size-regular'));

  options.map = mapName;

  options.label = {
    show: true,
    color: textColor,
    fontSize: Number(fontSize.slice(0, 2)),
    formatter: (params: IData) => {
      return cityInfo.cityNames[params.name];
    },
  };
  options.tooltip = {
    formatter: (params: IData) => {
      if (!params.data) {
        return;
      }
      const find = findData(params.data._id, 'area', pointData, areaData)!;
      if (!find || (!find._tooltip && !find._value)) {
        return;
      }
      const { _deData: data } = find;
      let text = data.srfmajortext;
      if (find._value) {
        text = `${data.srfmajortext}: ${find._value}`;
      }
      if (find._tooltip) {
        text = find._tooltip;
      }
      // 项样式作为弹框样式，弹框默认内容为主信息+值，可配置提示属性实体处理逻辑来调整提示框内容
      const style = getItemStyle(find);
      return `<div style="${style}" class="${find._className} ${ns.e(
        'popper',
      )}">${text}</div>`;
    },
    padding: 0,
  };
  options.data = areaData.map(item => {
    return {
      name: `${item._areaCode}`,
      value: item._value,
      _id: item._id,
      deData: item,
    };
  });
  options.select = {
    disabled: true,
  };
  return options;
};

export const getTooltip = (): IData => {
  const ns = useNamespace('map-chart-user');
  const textColor = getCssVarByName(ns.cssVarName('color-text-1'));
  const fontSize = getCssVarByName(ns.cssVarName('font-size-regular'));
  const backgroundColor = getCssVarByName(ns.cssVarName('color-bg-0'));
  return {
    trigger: 'item',
    textStyle: {
      color: textColor,
      fontSize: Number(fontSize.slice(0, 2)),
    },
    backgroundColor,
    borderWidth: 0,
    extraCssText: 'backdrop-filter: blur(3px);',
  };
};

export const getVisualMap = (options: IData): IData => {
  const { visualMap } = options;
  return {
    min: visualMap.min,
    max: visualMap.max,
    text: visualMap.text,
    realtime: false,
    hoverLink: false,
    inRange: {
      color: visualMap.rangeColor,
    },
  };
};
