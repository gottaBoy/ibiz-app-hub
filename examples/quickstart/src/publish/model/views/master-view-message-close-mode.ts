export default {
  deviewCodeName: 'view_message_close_mode',
  deviewId: '4e4ae62904e47931728c5a979f5151e3',
  appWFId: 'workflow',
  accUserMode: 3,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '视图消息_关闭模式',
  codeName: 'master_view_message_close_mode',
  appDataEntityId: 'web.master',
  appViewMsgGroupId: 'view_message_close_mode_group',
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
            rawItem: {
              rawItemParams: [
                {
                  key: 'position',
                  value: 'TOP',
                },
              ],
              predefinedType: 'VIEWMSG_POS',
              id: 'viewmsg_pos',
            },
            caption: '视图消息占位',
            itemStyle: 'DEFAULT',
            itemType: 'RAWITEM',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'viewmsg_pos',
          },
        ],
        predefinedType: 'CONTAINER_GROUP',
        layout: {
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        caption: '无删除',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 1,
          layout: 'FLEX',
        },
        showCaption: true,
        id: 'container_group',
      },
      {
        actionGroupExtractMode: 'ITEM',
        panelItems: [
          {
            rawItem: {
              rawItemParams: [
                {
                  key: 'position',
                  value: 'BODY',
                },
              ],
              predefinedType: 'VIEWMSG_POS',
              id: 'viewmsg_pos1',
            },
            caption: '视图消息占位',
            itemStyle: 'DEFAULT',
            itemType: 'RAWITEM',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'viewmsg_pos1',
          },
        ],
        predefinedType: 'CONTAINER_GROUP',
        layout: {
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        caption: '默认删除（删除后，再次打开页面，当前视图消息不会再显示）',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 1,
          layout: 'FLEX',
        },
        showCaption: true,
        id: 'container_group1',
      },
      {
        actionGroupExtractMode: 'ITEM',
        panelItems: [
          {
            rawItem: {
              rawItemParams: [
                {
                  key: 'position',
                  value: 'BOTTOM',
                },
              ],
              predefinedType: 'VIEWMSG_POS',
              id: 'viewmsg_pos2',
            },
            caption: '视图消息占位',
            itemStyle: 'DEFAULT',
            itemType: 'RAWITEM',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'viewmsg_pos2',
          },
        ],
        predefinedType: 'CONTAINER_GROUP',
        layout: {
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        caption: '本次删除（删除后，再次打开页面，当前视图消息会再显示）',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 1,
          layout: 'FLEX',
        },
        showCaption: true,
        id: 'container_group2',
      },
    ],
    layoutPanel: true,
    controls: [
      {
        capLanguageRes: {
          lanResTag: 'DE.LNAME.MASTER',
        },
        caption: '视图消息_关闭模式',
        codeName: 'view_message_close_mode_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'view_message_close_mode_captionbar',
      },
    ],
    codeName: 'af4a8bfe7580129125a',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: 'view_message_close_mode',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: 'b44c8831d4bfcc02c5820407f7a9b9c5',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'af4a8bfe7580129125a',
  },
  title: '视图消息_关闭模式',
  viewStyle: 'DEFAULT',
  viewType: 'DECUSTOMVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: '5efb43ac4f6d56dd5d4f9d00ffa8afe5',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERview_message_close_mode',
  id: 'web.master_view_message_close_mode',
};
