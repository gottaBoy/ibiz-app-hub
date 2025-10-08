export default {
  deviewCodeName: 'view_message_kind',
  deviewId: 'aff975fc2211361666c98a999ca36ab4',
  appWFId: 'workflow',
  accUserMode: 3,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '视图消息_消息类型',
  codeName: 'master_view_message_kind',
  appDataEntityId: 'web.master',
  appViewMsgGroupId: 'view_message_kind_group',
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
        caption: '常规信息',
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
        caption: '警告信息',
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
        caption: '错误信息',
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
        caption: '视图消息_消息类型',
        codeName: 'view_message_kind_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'view_message_kind_captionbar',
      },
    ],
    codeName: 'a60418e214fe7b041ce',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: 'view_message_kind',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: '152160c1ac6d9a003906d91dab9c582f',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'a60418e214fe7b041ce',
  },
  title: '视图消息_消息类型',
  viewStyle: 'DEFAULT',
  viewType: 'DECUSTOMVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: '4f4232e4a3fbe4eb801c6bb52d473d9d',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERview_message_kind',
  id: 'web.master_view_message_kind',
};
