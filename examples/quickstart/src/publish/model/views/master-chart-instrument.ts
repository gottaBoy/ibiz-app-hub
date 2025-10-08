export default {
  enableSearch: true,
  loadDefault: true,
  deviewCodeName: 'Chart_instrument',
  deviewId: 'fd151e1c9e1754a0c37f663beb711510',
  appWFId: 'workflow',
  accUserMode: 3,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '图表_仪表图',
  codeName: 'master_chart_instrument',
  appDataEntityId: 'web.master',
  appViewMsgGroupId: 'chart_instrument',
  viewLayoutPanel: {
    layoutBodyOnly: true,
    viewProxyMode: true,
    layoutMode: 'FLEX',
    layout: {
      layout: 'FLEX',
    },
    rootPanelItems: [
      {
        actionGroupExtractMode: 'ITEM',
        panelItems: [
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                actionGroupExtractMode: 'ITEM',
                panelItems: [
                  {
                    caption: '页面标题',
                    itemStyle: 'DEFAULT',
                    itemType: 'CTRLPOS',
                    layoutPos: {
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    showCaption: true,
                    id: 'captionbar',
                  },
                ],
                layout: {
                  align: 'center',
                  layout: 'FLEX',
                },
                dataRegionType: 'INHERIT',
                caption: '容器',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  shrink: 1,
                  heightMode: 'FULL',
                  layout: 'FLEX',
                },
                id: 'view_captionbar',
              },
            ],
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              heightMode: 'FULL',
              layout: 'FLEX',
            },
            id: 'view_header_left',
          },
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                actionGroupExtractMode: 'ITEM',
                panelItems: [
                  {
                    caption: '工具栏',
                    itemStyle: 'DEFAULT',
                    itemType: 'CTRLPOS',
                    layoutPos: {
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    showCaption: true,
                    id: 'toolbar',
                  },
                ],
                layout: {
                  align: 'center',
                  layout: 'FLEX',
                },
                dataRegionType: 'INHERIT',
                caption: '容器',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  shrink: 1,
                  heightMode: 'FULL',
                  layout: 'FLEX',
                },
                id: 'view_toolbar',
              },
            ],
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              heightMode: 'FULL',
              layout: 'FLEX',
            },
            id: 'view_header_right',
          },
        ],
        predefinedType: 'VIEWHEADER',
        layout: {
          align: 'space-between',
          dir: 'row',
          layout: 'FLEX',
          valign: 'center',
        },
        dataRegionType: 'INHERIT',
        caption: '容器',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 0,
          layout: 'FLEX',
        },
        id: 'view_header',
      },
      {
        actionGroupExtractMode: 'ITEM',
        panelItems: [
          {
            caption: '搜索表单',
            itemStyle: 'DEFAULT',
            itemType: 'CTRLPOS',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'searchform',
          },
        ],
        layout: {
          dir: 'column',
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 0,
          layout: 'FLEX',
        },
        id: 'view_searchform',
      },
      {
        actionGroupExtractMode: 'ITEM',
        panelItems: [
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                caption: '图表',
                itemStyle: 'DEFAULT',
                itemType: 'CTRLPOS',
                layoutPos: {
                  shrink: 1,
                  heightMode: 'FULL',
                  layout: 'FLEX',
                },
                showCaption: true,
                id: 'chart',
              },
            ],
            predefinedType: 'CONTAINER_MULTIDATA_RAW',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'MULTIDATA_RAW',
            dataSourceType: 'CUSTOM',
            scriptCode:
              '[\n{\n    name:\'演示数据1\',\n    num:1000,\n    quantity: 20,\n    type:"演示类型1",\n    update_time:"2025-07-02",\n    create_time:"2025-03-09"\n},\n{\n    name:\'演示数据2\',\n    num:1000,\n    quantity: 10,\n    type:"演示类型1",\n    update_time:"2025-07-02",\n    create_time:"2025-03-09"\n},\n{\n    name:\'演示数2\',\n    num:1000,\n    quantity: 30,\n    type:"演示类型1",\n    update_time:"2025-07-02",\n    create_time:"2025-03-09"\n}\n]',
            caption: '多项数据容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            id: 'container_multidata_raw',
          },
        ],
        predefinedType: 'VIEWCONTENT',
        layout: {
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        caption: '容器',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          grow: 1,
          shrink: 1,
          layout: 'FLEX',
        },
        id: 'view_content',
      },
    ],
    layoutPanel: true,
    appViewEngines: [
      {
        engineCat: 'VIEW',
        engineType: 'ChartView',
        id: 'engine',
      },
    ],
    controls: [
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
        codeName: 'chart_instrument_search_form',
        controlType: 'SEARCHFORM',
        logicName: '图表_仪表图_搜索表单',
        appDataEntityId: 'web.master',
        controlParam: {
          id: 'searchform',
        },
        modelId: '7eec04d731fa4138f6bed7eeae7aab21',
        modelType: 'PSDEFORM_SEARCHFORM',
        name: 'searchform',
        id: 'web.master.chart_instrument_search_form',
      },
      {
        chartCoordinateSystems: [
          {
            echartsType: 'none',
            type: 'NONE',
            name: '[gauge_0]无坐标系[0]',
            id: '0',
          },
        ],
        dechartDataGrid: {
          id: '0',
        },
        dechartLegend: {
          showLegend: true,
          id: '0',
        },
        dechartSerieses: [
          {
            clockwise: true,
            caption: '演示数据',
            catalogField: 'NAME',
            echartsType: 'gauge',
            chartCoordinateSystemId: '0',
            chartDataSetId: '0',
            chartSeriesEncode: {
              category: 'NAME',
              value: 'QUANTITY',
              type: 'NONE',
              name: '坐标系编码',
              id: '0',
            },
            seriesLayoutBy: 'column',
            seriesType: 'gauge',
            valueField: 'QUANTITY',
            enableChartDataSet: true,
            id: 'gauge_0',
          },
        ],
        dechartTitle: {
          title: '图表_仪表图_图表',
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
            name: 'gauge_0-DEFAULT',
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
        codeName: 'chart_instrument_chart',
        controlType: 'CHART',
        height: 400,
        logicName: 'Chart12',
        appDataEntityId: 'web.master',
        controlParam: {
          id: 'chart',
        },
        modelId: '8efa0f81c3b254e78b21d1161e8a08dd',
        modelType: 'PSDECHART',
        userParam: {
          'EC.color':
            '["#5470c6","#91cc75","#fac858","#ee6666","#73c0de","#3ba272","#fc8452","#9a60b4","#ea7ccc","#5470c6","#91cc75"]',
        },
        name: 'chart',
        id: 'web.master.chart_instrument_chart',
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
        caption: '图表_仪表图',
        codeName: 'chart_instrument_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'chart_instrument_captionbar',
      },
    ],
    codeName: 'a6835f76ccadea8e65d',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: 'Chart_instrument图表视图布局面板',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: '6314da159bca0f01b875628ff0aeaf65',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'a6835f76ccadea8e65d',
  },
  title: '图表_仪表图',
  viewStyle: 'DEFAULT',
  viewType: 'DECHARTVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: '3018a3dbda6cdb469d4eeb52231fac5c',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERChart_instrument',
  id: 'web.master_chart_instrument',
};
