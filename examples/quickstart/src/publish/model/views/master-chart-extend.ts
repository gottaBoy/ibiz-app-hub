export default {
  enableSearch: true,
  loadDefault: true,
  deviewCodeName: 'chart_extend',
  deviewId: 'f4cf5cadfe3eae60e400e33e8ff7df89',
  appWFId: 'workflow',
  accUserMode: 2,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '扩展参数',
  codeName: 'master_chart_extend',
  appDataEntityId: 'web.master',
  appViewEngines: [
    {
      engineCat: 'VIEW',
      engineType: 'ChartView',
      id: 'engine',
    },
  ],
  appViewMsgGroupId: 'chart_extend_msg',
  controls: [
    {
      chartCoordinateSystems: [
        {
          chartGrid: {
            chartGridXAxis0Id: '0',
            chartGridYAxis0Id: '0',
            chartCoordinateSystemId: '0',
            type: 'grid',
            name: '[bar_0]直角坐标系[0]',
            id: '0',
          },
          echartsType: 'cartesian2d',
          type: 'XY',
          name: '[bar_0]直角坐标系[0]',
          id: '0',
        },
      ],
      dechartDataGrid: {
        id: '0',
      },
      dechartLegend: {
        legendPos: 'BOTTOM',
        showLegend: true,
        id: '0',
      },
      dechartSerieses: [
        {
          caption: '柱状',
          catalogField: 'NAME',
          echartsType: 'bar',
          chartCoordinateSystemId: '0',
          chartDataSetId: '0',
          chartSeriesEncode: {
            chartXAxisId: '0',
            chartYAxisId: '0',
            x: ['NAME'],
            y: ['QUANTITY'],
            type: 'XY',
            name: '坐标系编码',
            id: '0',
          },
          seriesLayoutBy: 'column',
          seriesType: 'bar',
          valueField: 'QUANTITY',
          enableChartDataSet: true,
          userParam: {
            'EC.label':
              '{"show":1,"position":"top","color":"rgba(144, 124, 255, 1)","textBorderColor":"rgba(10, 207, 131, 1)"}',
            'EC.lineStyle': '{"color":"rgba(242, 78, 30, 1)","type":"dotted"}',
            'EC.markPoint':
              '{"symbolSize":1,"symbolOffset":[0,-20],"label":{"formatter":"{a|柱状\\n}{b|{b} }{c|{c}}","backgroundColor":"rgb(242,242,242)","borderColor":"#aaa","borderWidth":1,"borderRadius":4,"padding":[4,10],"lineHeight":26,"position":"top","rich":{"a":{"align":"center","color":"#fff","fontSize":18,"textShadowBlur":2,"textShadowColor":"#000","textBorderColor":"#333","textBorderWidth":2},"b":{"color":"#333"},"c":{"color":"#ff8811","textBorderColor":"#000","textBorderWidth":1,"fontSize":22}}},"data":[{"type":"max","name":"max value: "},{"type":"min","name":"min value: "}]}',
          },
          id: 'bar_0',
        },
        {
          caption: '折线',
          catalogField: 'NAME',
          echartsType: 'line',
          chartCoordinateSystemId: '0',
          chartDataSetId: '1',
          chartSeriesEncode: {
            chartXAxisId: '0',
            chartYAxisId: '0',
            x: ['NAME'],
            y: ['QUANTITY'],
            type: 'XY',
            name: '坐标系编码',
            id: '0',
          },
          seriesLayoutBy: 'column',
          seriesType: 'line',
          valueField: 'QUANTITY',
          enableChartDataSet: true,
          index: 1,
          userParam: {
            'EC.label': '{"show":0}',
          },
          id: 'line_2',
        },
      ],
      dechartTitle: {
        title: 'x轴扩展参数_图表',
        id: '0',
      },
      chartDataSetGroups: [
        {
          appDEDataSetId: 'fetch_default',
          appDataEntityId: 'web.master',
          name: 'DEFAULT',
          id: '0',
        },
      ],
      chartDataSets: [
        {
          chartDataSetFields: [
            {
              groupField: true,
              name: 'NAME',
              id: '0',
            },
            {
              index: 1,
              name: 'QUANTITY',
              id: '1',
            },
          ],
          name: 'bar_0-DEFAULT',
          id: '0',
        },
        {
          chartDataSetFields: [
            {
              groupField: true,
              name: 'NAME',
              id: '0',
            },
            {
              index: 1,
              name: 'QUANTITY',
              id: '1',
            },
          ],
          index: 1,
          name: 'line_2-DEFAULT',
          id: '1',
        },
      ],
      chartGrids: [
        {
          chartGridXAxis0Id: '0',
          chartGridYAxis0Id: '0',
          chartCoordinateSystemId: '0',
          type: 'grid',
          name: '[bar_0]直角坐标系[0]',
          id: '0',
        },
      ],
      chartXAxises: [
        {
          echartsPos: 'xAxis',
          echartsType: 'category',
          position: 'bottom',
          type: 'category',
          userParam: {
            'EC.axisTick': '{"show":1}',
            'EC.interval': '1',
            'EC.minorTick': '{"show":1}',
            'EC.axisLabel':
              '{"show":1,"rotate":-30,"margin":10,"color":"rgba(24, 160, 251, 1)","fontWeight":16,"fontSize":16,"textBorderColor":"rgba(144, 124, 255, 1)"}',
          },
          name: 'axis_xAxis_1',
          id: '0',
        },
      ],
      chartYAxises: [
        {
          echartsPos: 'yAxis',
          echartsType: 'value',
          position: 'left',
          type: 'numeric',
          userParam: {
            'EC.breaks': '[{"start":1000,"end":1200,"gap":"1.5%"}]',
            'EC.axisLine': '{"lineStyle":{"type":"dashed"}}',
            'EC.axisLabel':
              '{"show":1,"color":"rgba(144, 124, 255, 1)","fontWeight":16,"fontSize":18,"textBorderColor":"rgba(24, 160, 251, 1)"}',
          },
          name: 'axis_yAxis_0',
          id: '0',
        },
      ],
      navViewPos: 'NONE',
      fetchControlAction: {
        appDEMethodId: 'fetch_default',
        appDataEntityId: 'web.master',
        id: 'fetch',
      },
      readOnly: true,
      autoLoad: true,
      showBusyIndicator: true,
      codeName: 'chart_extend_x_chart',
      controlType: 'CHART',
      height: 500,
      logicName: 'Chart20',
      appDataEntityId: 'web.master',
      controlParam: {
        id: 'chart',
      },
      modelId: 'c658cf40b29cf4cc21481a2544580bd0',
      modelType: 'PSDECHART',
      userParam: {
        'EC.tooltip':
          '{"trigger":"axis","axisPointer":{"type":"shadow"},"formatter":"function(param){return `<div><div>当前横坐标：${param[0].name}</div>${param.map(function(item) {return \'<div>\'+item.marker+item.seriesName+\'：\'+item.value[1]+\'</div>\'}).join(\'\')}</div>`}"}',
        'EC.color':
          '["#5470c6","#91cc75","#fac858","#ee6666","#73c0de","#3ba272","#fc8452","#9a60b4","#ea7ccc","#5470c6","#91cc75"]',
      },
      name: 'chart',
      id: 'web.master.chart_extend_x_chart',
    },
    {
      searchButtonStyle: 'DEFAULT',
      deformPages: [
        {
          layout: {
            columnCount: 24,
            layout: 'TABLE_24COL',
          },
          caption: '常规条件',
          codeName: 'formpage1',
          detailStyle: 'DEFAULT',
          detailType: 'FORMPAGE',
          id: 'formpage1',
        },
      ],
      layout: {
        columnCount: 24,
        layout: 'TABLE_24COL',
      },
      tabHeaderPos: 'TOP',
      noTabHeader: true,
      autoLoad: true,
      showBusyIndicator: true,
      codeName: 'main139',
      controlType: 'SEARCHFORM',
      logicName: 'x轴扩展参数_搜索表单',
      appDataEntityId: 'web.master',
      controlParam: {
        id: 'searchform',
      },
      modelId: '6b191331de99fc7d0f422c9c93d6866b',
      modelType: 'PSDEFORM_SEARCHFORM',
      name: 'searchform',
      id: 'web.master.main139',
    },
    {
      groupMode: 'SINGLE',
      controlType: 'SEARCHBAR',
      appDataEntityId: 'web.master',
      controlParam: {
        id: 'searchbar',
      },
      id: 'searchbar',
    },
    {
      capLanguageRes: {
        lanResTag: 'DE.LNAME.MASTER',
      },
      caption: '扩展参数',
      codeName: 'chart_extend_captionbar',
      controlType: 'CAPTIONBAR',
      appDataEntityId: 'web.master',
      controlParam: {},
      name: 'captionbar',
      id: 'chart_extend_captionbar',
    },
  ],
  viewLayoutPanel: {
    layoutBodyOnly: true,
    useDefaultLayout: true,
    layoutPanel: true,
    codeName: 'layoutpanel',
    controlStyle: 'APPDECHARTVIEW',
    controlType: 'VIEWLAYOUTPANEL',
    appDataEntityId: 'web.master',
    controlParam: {},
    id: 'layoutpanel',
  },
  title: '扩展参数',
  viewStyle: 'DEFAULT',
  viewType: 'DECHARTVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: 'c9f1f4d45e00be7d1c925c1fcdc2924f',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERchart_extend',
  id: 'web.master_chart_extend',
};
