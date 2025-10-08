export default {
  layoutMode: 'FLEX',
  layout: {
    layout: 'FLEX',
  },
  rootPanelItems: [
    {
      rawItem: {
        rawItemParams: [
          {
            key: 'POSITION',
            value: 'TOP',
          },
        ],
        predefinedType: 'VIEWMSG_POS',
        id: 'viewmsg_pos_top',
      },
      caption: '视图消息占位',
      itemStyle: 'DEFAULT',
      itemType: 'RAWITEM',
      layoutPos: {
        shrink: 0,
        layout: 'FLEX',
      },
      showCaption: true,
      id: 'viewmsg_pos_top',
    },
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
                      caption: '搜索栏',
                      itemStyle: 'DEFAULT',
                      itemType: 'CTRLPOS',
                      layoutPos: {
                        shrink: 1,
                        layout: 'FLEX',
                      },
                      showCaption: true,
                      id: 'searchbar',
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
                  id: 'view_searchbar',
                },
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
                dir: 'row',
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
      ],
      predefinedType: 'PANELPART',
      layout: {
        layout: 'FLEX',
      },
      dataRegionType: 'INHERIT',
      caption: '引用布局面板',
      itemStyle: 'DEFAULT',
      itemType: 'CONTAINER',
      layoutPos: {
        shrink: 1,
        layout: 'FLEX',
      },
      showCaption: true,
      id: 'panelpart',
    },
    {
      rawItem: {
        rawItemParams: [
          {
            key: 'POSITION',
            value: 'BODY',
          },
        ],
        predefinedType: 'VIEWMSG_POS',
        id: 'viewmsg_pos_body',
      },
      caption: '视图消息占位',
      itemStyle: 'DEFAULT',
      itemType: 'RAWITEM',
      layoutPos: {
        shrink: 0,
        layout: 'FLEX',
      },
      showCaption: true,
      id: 'viewmsg_pos_body',
    },
    {
      actionGroupExtractMode: 'ITEM',
      panelItems: [
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
      ],
      predefinedType: 'PANELPART',
      layout: {
        layout: 'FLEX',
      },
      dataRegionType: 'INHERIT',
      caption: '引用布局面板',
      itemStyle: 'DEFAULT',
      itemType: 'CONTAINER',
      layoutPos: {
        shrink: 1,
        layout: 'FLEX',
      },
      showCaption: true,
      id: 'panelpart1',
    },
    {
      actionGroupExtractMode: 'ITEM',
      panelItems: [
        {
          caption: '表格',
          itemStyle: 'DEFAULT',
          itemType: 'CTRLPOS',
          layoutPos: {
            grow: 1,
            shrink: 1,
            layout: 'FLEX',
          },
          showCaption: true,
          id: 'grid',
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
      rawItem: {
        caption: '主题插件自定义布局',
        halign: 'LEFT',
        renderMode: 'PARAGRAPH',
        valign: 'MIDDLE',
        wrapMode: 'NOWRAP',
        contentType: 'RAW',
        predefinedType: 'STATIC_LABEL',
        id: 'static_label',
        appId: 'sztrainsys__web',
      },
      caption: '标签',
      itemStyle: 'DEFAULT',
      itemType: 'RAWITEM',
      layoutPos: {
        shrink: 1,
        layout: 'FLEX',
        appId: 'sztrainsys__web',
      },
      showCaption: true,
      id: 'static_label',
      appId: 'sztrainsys__web',
    },
    {
      rawItem: {
        rawItemParams: [
          {
            key: 'POSITION',
            value: 'BOTTOM',
          },
        ],
        predefinedType: 'VIEWMSG_POS',
        id: 'viewmsg_pos_bottom',
      },
      caption: '视图消息占位',
      itemStyle: 'DEFAULT',
      itemType: 'RAWITEM',
      layoutPos: {
        shrink: 0,
        layout: 'FLEX',
      },
      showCaption: true,
      id: 'viewmsg_pos_bottom',
    },
  ],
  layoutPanel: true,
  codeName: 'GridViewLayout',
  controlType: 'VIEWLAYOUTPANEL',
  logicName: '表格视图布局(预置模型)',
  appDataEntityId: 'frontmodel.viewlayoutmodelrepository',
  controlParam: {},
  modelId: 'd7c15227abc2b1d2198b5b99cb78b41d',
  modelType: 'PSSYSVIEWLAYOUTPANEL',
  name: 'layoutpanel',
  id: 'gridviewlayout',
};
