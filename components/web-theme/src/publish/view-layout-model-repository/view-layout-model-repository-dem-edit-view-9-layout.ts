  export default {
  "layoutMode": "Flex",
  "layout": {
    "layout": "FLEX"
  },
  "rootPanelItems": [
    {
      "rawItem": {
        "rawItemParams": [
          {
            "key": "POSITION",
            "value": "TOP"
          }
        ],
        "predefinedType": "VIEWMSG_POS",
        "id": "viewmsg_pos_top"
      },
      "caption": "视图消息占位",
      "itemStyle": "DEFAULT",
      "itemType": "RAWITEM",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX"
      },
      "showCaption": true,
      "id": "viewmsg_pos_top"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "actionGroupExtractMode": "ITEM",
              "panelItems": [
                {
                  "actionGroupExtractMode": "ITEM",
                  "panelItems": [
                    {
                      "caption": "页面标题",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "shrink": 1,
                        "layout": "FLEX"
                      },
                      "showCaption": true,
                      "id": "captionbar"
                    }
                  ],
                  "layout": {
                    "align": "center",
                    "layout": "FLEX"
                  },
                  "dataRegionType": "INHERIT",
                  "caption": "容器",
                  "itemStyle": "DEFAULT",
                  "itemType": "CONTAINER",
                  "layoutPos": {
                    "shrink": 1,
                    "heightMode": "FULL",
                    "layout": "FLEX"
                  },
                  "id": "view_captionbar"
                }
              ],
              "layout": {
                "layout": "FLEX"
              },
              "dataRegionType": "INHERIT",
              "caption": "容器",
              "itemStyle": "DEFAULT",
              "itemType": "CONTAINER",
              "layoutPos": {
                "shrink": 1,
                "heightMode": "FULL",
                "layout": "FLEX"
              },
              "id": "view_header_left"
            },
            {
              "actionGroupExtractMode": "ITEM",
              "panelItems": [
                {
                  "actionGroupExtractMode": "ITEM",
                  "panelItems": [
                    {
                      "caption": "搜索栏",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "shrink": 1,
                        "layout": "FLEX"
                      },
                      "showCaption": true,
                      "id": "searchbar"
                    }
                  ],
                  "layout": {
                    "align": "center",
                    "layout": "FLEX"
                  },
                  "dataRegionType": "INHERIT",
                  "caption": "容器",
                  "itemStyle": "DEFAULT",
                  "itemType": "CONTAINER",
                  "layoutPos": {
                    "shrink": 1,
                    "heightMode": "FULL",
                    "layout": "FLEX"
                  },
                  "id": "view_searchbar"
                },
                {
                  "actionGroupExtractMode": "ITEM",
                  "panelItems": [
                    {
                      "caption": "工具栏",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "shrink": 1,
                        "layout": "FLEX"
                      },
                      "showCaption": true,
                      "id": "toolbar"
                    }
                  ],
                  "layout": {
                    "align": "center",
                    "layout": "FLEX"
                  },
                  "dataRegionType": "INHERIT",
                  "caption": "容器",
                  "itemStyle": "DEFAULT",
                  "itemType": "CONTAINER",
                  "layoutPos": {
                    "shrink": 1,
                    "heightMode": "FULL",
                    "layout": "FLEX"
                  },
                  "id": "view_toolbar"
                }
              ],
              "layout": {
                "dir": "row",
                "layout": "FLEX"
              },
              "dataRegionType": "INHERIT",
              "caption": "容器",
              "itemStyle": "DEFAULT",
              "itemType": "CONTAINER",
              "layoutPos": {
                "shrink": 1,
                "heightMode": "FULL",
                "layout": "FLEX"
              },
              "id": "view_header_right"
            }
          ],
          "predefinedType": "VIEWHEADER",
          "layout": {
            "align": "space-between",
            "dir": "row",
            "layout": "FLEX",
            "valign": "center"
          },
          "dataRegionType": "INHERIT",
          "caption": "容器",
          "itemStyle": "DEFAULT",
          "itemType": "CONTAINER",
          "layoutPos": {
            "shrink": 0,
            "layout": "FLEX"
          },
          "id": "view_header"
        }
      ],
      "predefinedType": "PANELPART",
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "引用布局面板",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "shrink": 1,
        "layout": "FLEX"
      },
      "showCaption": true,
      "id": "panelpart"
    },
    {
      "rawItem": {
        "rawItemParams": [
          {
            "key": "POSITION",
            "value": "BODY"
          }
        ],
        "predefinedType": "VIEWMSG_POS",
        "id": "viewmsg_pos_body"
      },
      "caption": "视图消息占位",
      "itemStyle": "DEFAULT",
      "itemType": "RAWITEM",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX"
      },
      "showCaption": true,
      "id": "viewmsg_pos_body"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "caption": "搜索表单",
              "itemStyle": "DEFAULT",
              "itemType": "CTRLPOS",
              "layoutPos": {
                "shrink": 1,
                "layout": "FLEX"
              },
              "showCaption": true,
              "id": "searchform"
            }
          ],
          "layout": {
            "dir": "column",
            "layout": "FLEX"
          },
          "dataRegionType": "INHERIT",
          "itemStyle": "DEFAULT",
          "itemType": "CONTAINER",
          "layoutPos": {
            "shrink": 0,
            "layout": "FLEX"
          },
          "id": "view_searchform"
        }
      ],
      "predefinedType": "PANELPART",
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "引用布局面板",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "shrink": 1,
        "layout": "FLEX"
      },
      "showCaption": true,
      "id": "panelpart1"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "caption": "多编辑面板",
          "itemStyle": "DEFAULT",
          "itemType": "CTRLPOS",
          "layoutPos": {
            "grow": 1,
            "shrink": 1,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "meditviewpanel"
        }
      ],
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "容器",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "grow": 1,
        "shrink": 1,
        "layout": "FLEX"
      },
      "id": "view_meditviewpanel"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "actionType": "NONE",
          "buttonStyle": "DEFAULT",
          "buttonType": "PANELBUTTON",
          "renderMode": "BUTTON",
          "tooltip": "添加",
          "uiactionTarget": "NONE",
          "caption": "添加",
          "itemStyle": "DEFAULT",
          "itemType": "BUTTON",
          "layoutPos": {
            "shrink": 1,
            "layout": "FLEX"
          },
          "sysImage": {
            "cssClass": "add"
          },
          "showCaption": true,
          "id": "button_calluilogic"
        }
      ],
      "layout": {
        "align": "center",
        "dir": "row",
        "layout": "FLEX",
        "valign": "center"
      },
      "dataRegionType": "INHERIT",
      "caption": "容器",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX"
      },
      "id": "container"
    },
    {
      "rawItem": {
        "rawItemParams": [
          {
            "key": "POSITION",
            "value": "BOTTOM"
          }
        ],
        "predefinedType": "VIEWMSG_POS",
        "id": "viewmsg_pos_bottom"
      },
      "caption": "视图消息占位",
      "itemStyle": "DEFAULT",
      "itemType": "RAWITEM",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX"
      },
      "showCaption": true,
      "id": "viewmsg_pos_bottom"
    }
  ],
  "layoutPanel": true,
  "codeName": "MEditViewLayout",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "实体多表单编辑视图（部件视图）布局面板(预置模型)",
  "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
  "controlLogics": [
    {
      "eventNames": "onClick",
      "itemName": "BUTTON_CALLUILOGIC",
      "logicTag": "layoutpanel",
      "logicType": "SCRIPT",
      "scriptCode": "view.call(\"New\");",
      "triggerType": "CTRLEVENT",
      "id": "logic"
    }
  ],
  "controlParam": {},
  "modelId": "8C599AC4-BDB7-450B-B60D-3A9EF2FC4622",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "meditviewlayout"
}
