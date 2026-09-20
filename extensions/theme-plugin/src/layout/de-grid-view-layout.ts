import {
  localizeThemeLayoutModel,
  themePluginCaption,
} from '../locale';

const DEGridView = {
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
      caption: themePluginCaption('viewMessagePlaceholder'),
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
                      caption: themePluginCaption('pageTitle'),
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
                  caption: themePluginCaption('container'),
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
              caption: themePluginCaption('container'),
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
                      caption: themePluginCaption('searchBar'),
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
                  caption: themePluginCaption('container'),
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
                      caption: themePluginCaption('toolbar'),
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
                  caption: themePluginCaption('container'),
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
              caption: themePluginCaption('container'),
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
          caption: themePluginCaption('container'),
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
      caption: themePluginCaption('referencedLayoutPanel'),
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
      caption: themePluginCaption('viewMessagePlaceholder'),
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
              caption: themePluginCaption('searchForm'),
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
      caption: themePluginCaption('referencedLayoutPanel'),
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
          caption: themePluginCaption('grid'),
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
      caption: themePluginCaption('container'),
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
        caption: themePluginCaption('customLayout'),
        halign: 'LEFT',
        renderMode: 'PARAGRAPH',
        valign: 'MIDDLE',
        wrapMode: 'NOWRAP',
        contentType: 'RAW',
        predefinedType: 'STATIC_LABEL',
        id: 'static_label',
        appId: 'sztrainsys__web',
      },
      caption: themePluginCaption('label'),
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
      caption: themePluginCaption('viewMessagePlaceholder'),
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
  logicName: '\u8868\u683C\u89C6\u56FE\u5E03\u5C40(\u9884\u7F6E\u6A21\u578B)',
  appDataEntityId: 'frontmodel.viewlayoutmodelrepository',
  controlParam: {},
  modelId: 'd7c15227abc2b1d2198b5b99cb78b41d',
  modelType: 'PSSYSVIEWLAYOUTPANEL',
  name: 'layoutpanel',
  id: 'gridviewlayout',
};

export default localizeThemeLayoutModel(DEGridView);
