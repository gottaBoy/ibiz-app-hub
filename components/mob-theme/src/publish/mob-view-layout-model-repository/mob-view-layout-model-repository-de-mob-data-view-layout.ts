export default {
  "layoutMode": "FLEX",
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
                      "caption": "左侧工具栏",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "grow": 1,
                        "shrink": 1,
                        "heightMode": "FULL",
                        "layout": "FLEX",
                        "valignSelf": "MIDDLE",
                        "widthMode": "FULL"
                      },
                      "showCaption": true,
                      "id": "lefttoolbar"
                    }
                  ],
                  "layout": {
                    "layout": "FLEX"
                  },
                  "dataRegionType": "INHERIT",
                  "caption": "容器",
                  "contentWidth": 100,
                  "itemStyle": "DEFAULT",
                  "itemType": "CONTAINER",
                  "layoutPos": {
                    "basis": 100,
                    "shrink": 0,
                    "layout": "FLEX",
                    "width": 100,
                    "widthMode": "PX"
                  },
                  "width": 100,
                  "id": "view_left_toolbar"
                },
                {
                  "actionGroupExtractMode": "ITEM",
                  "panelItems": [
                    {
                      "caption": "标题栏",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "shrink": 1,
                        "heightMode": "FULL",
                        "layout": "FLEX"
                      },
                      "showCaption": true,
                      "id": "captionbar"
                    }
                  ],
                  "layout": {
                    "align": "center",
                    "dir": "row",
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
                  "id": "view_captionbar"
                },
                {
                  "actionGroupExtractMode": "ITEM",
                  "panelItems": [
                    {
                      "caption": "工具栏",
                      "itemStyle": "DEFAULT",
                      "itemType": "CTRLPOS",
                      "layoutPos": {
                        "grow": 1,
                        "shrink": 1,
                        "heightMode": "FULL",
                        "layout": "FLEX",
                        "valignSelf": "MIDDLE",
                        "widthMode": "FULL"
                      },
                      "showCaption": true,
                      "id": "righttoolbar"
                    }
                  ],
                  "layout": {
                    "layout": "FLEX"
                  },
                  "dataRegionType": "INHERIT",
                  "caption": "容器",
                  "contentWidth": 100,
                  "itemStyle": "DEFAULT",
                  "itemType": "CONTAINER",
                  "layoutPos": {
                    "basis": 100,
                    "shrink": 0,
                    "layout": "FLEX",
                    "width": 100,
                    "widthMode": "PX"
                  },
                  "width": 100,
                  "id": "view_right_toolbar"
                }
              ],
              "predefinedType": "Toolbar",
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
                "layout": "FLEX"
              },
              "id": "view_toolbar"
            }
          ],
          "predefinedType": "Header",
          "layout": {
            "dir": "column",
            "layout": "FLEX"
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
              "id": "container1"
            },
            {
              "actionGroupExtractMode": "ITEM",
              "predefinedType": "SETTING_CONTAINER",
              "layout": {
                "dir": "row-reverse",
                "layout": "FLEX"
              },
              "dataRegionType": "INHERIT",
              "caption": "设置容器",
              "itemStyle": "DEFAULT",
              "itemType": "CONTAINER",
              "layoutPos": {
                "shrink": 1,
                "heightMode": "FULL",
                "layout": "FLEX"
              },
              "id": "setting_container"
            }
          ],
          "predefinedType": "Toolbar",
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
            "shrink": 1,
            "layout": "FLEX"
          },
          "id": "view_toolbar2"
        },
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
            "layout": "FLEX"
          },
          "dataRegionType": "INHERIT",
          "caption": "容器",
          "itemStyle": "DEFAULT",
          "itemType": "CONTAINER",
          "layoutPos": {
            "shrink": 1,
            "layout": "FLEX"
          },
          "id": "view_searchform"
        }
      ],
      "layout": {
        "dir": "column",
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "容器",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX"
      },
      "id": "view_top"
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
          "caption": "数据视图",
          "itemStyle": "DEFAULT",
          "itemType": "CTRLPOS",
          "layoutPos": {
            "shrink": 1,
            "heightMode": "FULL",
            "layout": "FLEX",
            "widthMode": "FULL"
          },
          "showCaption": true,
          "id": "dataview"
        }
      ],
      "predefinedType": "Content",
      "layout": {
        "dir": "column",
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "grow": 1,
        "shrink": 1,
        "layout": "FLEX"
      },
      "id": "view_content"
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
  "codeName": "MobDataViewLayout",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "实体移动端卡片视图布局面板",
  "appDataEntityId": "mobfrontmodel.mobviewlayoutmodelrepository",
  "controlParam": {},
  "modelId": "371A2B9F-13F8-4D53-B7C2-805664DA306C",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "mobdataviewlayout"
}
