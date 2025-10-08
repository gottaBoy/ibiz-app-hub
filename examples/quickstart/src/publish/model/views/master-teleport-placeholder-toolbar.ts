export default {
  tabLayout: 'TOP',
  loadDefault: true,
  showDataInfoBar: true,
  deviewCodeName: 'teleport_placeholder_toolbar',
  deviewId: '2c0bc6a79cd2e40a882e0dced0f8d714',
  appWFId: 'workflow',
  accUserMode: 2,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '传送占位_工具栏',
  codeName: 'master_teleport_placeholder_toolbar',
  appDataEntityId: 'web.master',
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
                caption: '标题栏',
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
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            id: 'view_captionbar',
          },
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                caption: '分页导航',
                itemStyle: 'DEFAULT',
                itemType: 'CTRLPOS',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                },
                showCaption: true,
                id: 'tabexppanel',
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
              grow: 1,
              shrink: 1,
              layout: 'FLEX',
            },
            id: 'view_tabexppanel',
          },
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                rawItem: {
                  predefinedType: 'TELEPORT_PLACEHOLDER',
                  id: 'tabtoolbar',
                },
                caption: '传送部件占位',
                itemStyle: 'DEFAULT',
                itemType: 'RAWITEM',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                },
                showCaption: true,
                id: 'tabtoolbar',
              },
              {
                rawItem: {
                  rawItemParams: [
                    {
                      key: 'TeleportTag',
                      value: 'master_teleport_placeholder_toolbar-listtoolbar',
                      id: 'panelitem',
                    },
                  ],
                  predefinedType: 'TELEPORT_PLACEHOLDER',
                  id: 'listtoolbar',
                },
                caption: '传送部件占位',
                itemStyle: 'DEFAULT',
                itemType: 'RAWITEM',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                },
                showCaption: true,
                id: 'listtoolbar',
              },
            ],
            layout: {
              align: 'flex-start',
              dir: 'row',
              layout: 'FLEX',
              valign: 'center',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            id: 'container2',
          },
        ],
        predefinedType: 'VIEWHEADER',
        layout: {
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
            actionGroupExtractMode: 'ITEM',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 0,
              layout: 'FLEX',
            },
            id: 'view_tabexppanel_left',
          },
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                actionGroupExtractMode: 'ITEM',
                panelItems: [
                  {
                    rawItem: {
                      predefinedType: 'NAV_POS',
                      id: 'nav_pos',
                    },
                    caption: '导航区占位',
                    itemStyle: 'DEFAULT',
                    itemType: 'RAWITEM',
                    layoutPos: {
                      grow: 1,
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    showCaption: true,
                    id: 'nav_pos',
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
              {
                actionGroupExtractMode: 'ITEM',
                layout: {
                  layout: 'FLEX',
                },
                dataRegionType: 'INHERIT',
                caption: '容器',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  shrink: 0,
                  layout: 'FLEX',
                },
                id: 'view_tabexppanel_bottom',
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
              grow: 1,
              shrink: 1,
              layout: 'FLEX',
            },
            id: 'container1',
          },
          {
            actionGroupExtractMode: 'ITEM',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 0,
              layout: 'FLEX',
            },
            id: 'view_tabexppanel_right',
          },
        ],
        layout: {
          dir: 'row',
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
        id: 'container',
      },
    ],
    layoutPanel: true,
    appViewEngines: [
      {
        engineCat: 'VIEW',
        engineType: 'TabExpView',
        id: 'engine',
      },
    ],
    controls: [
      {
        dedrtabPages: [
          {
            caption: '表格',
            appViewId: 'web.master_teleport_placeholder_toolbar_grid',
            id: 'grid',
          },
          {
            caption: '列表',
            appViewId: 'web.master_teleport_placeholder_toolbar_list',
            id: 'list',
          },
        ],
        dataRelationTag: 'DataRelation133',
        editItemCapLanguageRes: {
          lanResTag: 'DE.LNAME.MASTER',
        },
        editItemCaption: '主数据',
        uniqueTag: 'master_teleport_placeholder_toolbar__tabexppanel',
        autoLoad: true,
        showBusyIndicator: true,
        codeName: 'data_relation133',
        controlType: 'DRTAB',
        appDataEntityId: 'web.master',
        controlParam: {
          id: 'tabexppanel',
        },
        modelId: 'd0ade0f11756023c7313a72b868216fa',
        modelType: 'PSDEDRTAB',
        name: 'tabexppanel',
        id: 'data_relation133',
      },
      {
        capLanguageRes: {
          lanResTag: 'DE.LNAME.MASTER',
        },
        caption: '传送占位_工具栏',
        codeName: 'teleport_placeholder_toolbar_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'teleport_placeholder_toolbar_captionbar',
      },
    ],
    codeName: 'afdfeed1bec236a0526',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: 'teleport_placeholder_toolbar分页导航视图布局面板',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: '84255f5a8b18c14cbf528866605eefc7',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'afdfeed1bec236a0526',
  },
  title: '传送占位_工具栏',
  viewStyle: 'DEFAULT',
  viewType: 'DETABEXPVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: 'cde60b4742fa8d26821b88921c50718a',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERteleport_placeholder_toolbar',
  id: 'web.master_teleport_placeholder_toolbar',
};
