export default {
  "layoutBodyOnly": true,
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
                        "layout": "FLEX",
                        "widthMode": "FULL"
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
          "caption": "选择视图面板",
          "itemStyle": "DEFAULT",
          "itemType": "CTRLPOS",
          "layoutPos": {
            "shrink": 1,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "pickupviewpanel"
        }
      ],
      "predefinedType": "Content",
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "视图内容区",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "basis": 0,
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
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "actionType": "UIACTION",
              "buttonStyle": "DEFAULT",
              "buttonType": "PANELBUTTON",
              "uiactionId": "view_cancelaction",
              "renderMode": "BUTTON",
              "tooltip": "取消",
              "caption": "取消",
              "itemStyle": "DEFAULT",
              "itemType": "BUTTON",
              "layoutPos": {
                "grow": 1,
                "shrink": 1,
                "layout": "FLEX",
                "spacingRight": "OUTERSMALL"
              },
              "showCaption": true,
              "id": "button_cancelaction"
            },
            {
              "actionType": "UIACTION",
              "buttonStyle": "PRIMARY",
              "buttonType": "PANELBUTTON",
              "uiactionId": "view_okaction",
              "renderMode": "BUTTON",
              "tooltip": "确定",
              "caption": "确定",
              "itemStyle": "PRIMARY",
              "itemType": "BUTTON",
              "layoutPos": {
                "grow": 1,
                "shrink": 1,
                "layout": "FLEX",
                "spacingLeft": "OUTERSMALL"
              },
              "showCaption": true,
              "id": "button_okaction"
            }
          ],
          "layout": {
            "align": "space-around",
            "dir": "row",
            "layout": "FLEX",
            "valign": "center"
          },
          "dataRegionType": "INHERIT",
          "caption": "容器",
          "contentHeight": 100,
          "height": 100,
          "itemStyle": "DEFAULT",
          "itemType": "CONTAINER",
          "layoutPos": {
            "grow": 1,
            "shrink": 0,
            "height": 100,
            "heightMode": "FULL",
            "layout": "FLEX"
          },
          "id": "container"
        }
      ],
      "predefinedType": "FOOTER",
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "容器",
      "itemStyle": "DEFAULT",
      "itemType": "CONTAINER",
      "layoutPos": {
        "shrink": 0,
        "layout": "FLEX",
        "spacingBottom": "OUTERSMALL",
        "spacingLeft": "OUTERSMALL",
        "spacingRight": "OUTERSMALL",
        "spacingTop": "OUTERSMALL"
      },
      "id": "view_footer"
    }
  ],
  "layoutPanel": true,
  "mobilePanel": true,
  "codeName": "MobPickupViewLayout",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "实体移动端数据选择视图布局面板",
  "appDataEntityId": "mobfrontmodel.mobviewlayoutmodelrepository",
  "controlParam": {},
  "modelId": "35F70706-A1D7-4CA2-B037-951E02EA0070",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "mobpickupviewlayout"
}
