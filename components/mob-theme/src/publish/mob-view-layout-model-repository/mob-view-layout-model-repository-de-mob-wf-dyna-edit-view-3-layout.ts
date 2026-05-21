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
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "caption": "关系分页部件",
              "itemStyle": "DEFAULT",
              "itemType": "CTRLPOS",
              "layoutPos": {
                "shrink": 1,
                "layout": "FLEX"
              },
              "showCaption": true,
              "id": "drtab"
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
          "id": "view_drtab"
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
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "caption": "表单",
              "itemStyle": "DEFAULT",
              "itemType": "CTRLPOS",
              "layoutPos": {
                "shrink": 1,
                "layout": "FLEX"
              },
              "showCaption": true,
              "id": "form"
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
          "id": "view_form"
        },
        {
          "rawItem": {
            "predefinedType": "NAV_POS",
            "id": "nav_pos"
          },
          "caption": "导航区占位",
          "itemStyle": "DEFAULT",
          "itemType": "RAWITEM",
          "layoutPos": {
            "shrink": 1,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "nav_pos"
        }
      ],
      "predefinedType": "Content",
      "layout": {
        "layout": "FLEX"
      },
      "dataRegionType": "INHERIT",
      "caption": "容器",
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
          "rawItem": {
            "halign": "LEFT",
            "renderMode": "TEXT",
            "valign": "MIDDLE",
            "wrapMode": "NOWRAP",
            "contentType": "RAW",
            "predefinedType": "WF_ACTION_BUTTON",
            "rawItemHeight": 40,
            "id": "wf_action_button"
          },
          "caption": "处理",
          "contentHeight": 40,
          "height": 40,
          "itemStyle": "DEFAULT",
          "itemType": "RAWITEM",
          "layoutPos": {
            "grow": 1,
            "shrink": 1,
            "height": 40,
            "heightMode": "PX",
            "layout": "FLEX",
            "widthMode": "FULL"
          },
          "showCaption": true,
          "id": "wf_action_button"
        },
        {
          "caption": "工具栏",
          "itemStyle": "DEFAULT",
          "itemType": "CTRLPOS",
          "layoutPos": {
            "shrink": 0,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "footertoolbar"
        }
      ],
      "predefinedType": "Footer",
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
        "spacingBottom": "INNERMEDIUM",
        "spacingLeft": "INNERMEDIUM",
        "spacingRight": "INNERMEDIUM",
        "spacingTop": "INNERMEDIUM"
      },
      "id": "view_footer"
    }
  ],
  "layoutPanel": true,
  "mobilePanel": true,
  "codeName": "MobWFDynaEditView3Layout",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "实体移动端工作流动态编辑视图分页关系布局面板(预置模型)",
  "appDataEntityId": "mobfrontmodel.mobviewlayoutmodelrepository",
  "controlParam": {},
  "modelId": "C6E84DFF-77BE-48F5-B56C-4F994F23E297",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "mobwfdynaeditview3layout"
}
