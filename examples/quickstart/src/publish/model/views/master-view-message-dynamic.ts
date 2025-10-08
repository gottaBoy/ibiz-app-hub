export default {
  deviewCodeName: 'view_message_dynamic',
  deviewId: '4cb63e2579029edd072a10858beff22c',
  appWFId: 'workflow',
  accUserMode: 2,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '视图消息_动态内容',
  codeName: 'master_view_message_dynamic',
  appDataEntityId: 'web.master',
  appViewMsgGroupId: 'view_message_dynamic',
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
                caption: '实体数据集',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  layoutPos: 'CENTER',
                  layout: 'BORDER',
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
                caption: '布局面板',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  layoutPos: 'CENTER',
                  layout: 'BORDER',
                },
                showCaption: true,
                id: 'container_group1',
              },
            ],
            predefinedType: 'CONTAINER_SCROLL_MAIN',
            layout: {
              layout: 'BORDER',
            },
            dataRegionType: 'INHERIT',
            caption: '面板容器',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              layoutPos: 'CENTER',
              layout: 'BORDER',
            },
            showCaption: true,
            id: 'container_scroll_main',
          },
        ],
        predefinedType: 'CONTAINER_SCROLL',
        layout: {
          layout: 'BORDER',
        },
        dataRegionType: 'INHERIT',
        caption: '滚动条容器',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 1,
          heightMode: 'FULL',
          layout: 'FLEX',
          widthMode: 'FULL',
        },
        id: 'container_scroll',
      },
    ],
    layoutPanel: true,
    controls: [
      {
        capLanguageRes: {
          lanResTag: 'DE.LNAME.MASTER',
        },
        caption: '视图消息_动态内容',
        codeName: 'view_message_dynamic_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'view_message_dynamic_captionbar',
      },
    ],
    codeName: 'ac556b80915195d4d86',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: 'view_message_dynamic',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: 'd64128615df4ce44b9dbe0eca9201452',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'ac556b80915195d4d86',
  },
  title: '视图消息_动态内容',
  viewStyle: 'DEFAULT',
  viewType: 'DECUSTOMVIEW',
  enableDP: true,
  showCaptionBar: true,
  modelId: 'd364a3edba4354d1b2e7e114ffbe5454',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERview_message_dynamic',
  id: 'web.master_view_message_dynamic',
};
