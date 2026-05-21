export default {
  "layoutMode": "Flex",
  "layout": {
    "layout": "FLEX"
  },
  "rootPanelItems": [
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
          "id": "control_header_left"
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
              "id": "treeexpbar_toolbar"
            }
          ],
          "layout": {
            "dir": "row-reverse",
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
          "id": "control_header_right"
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
        "shrink": 0,
        "layout": "FLEX"
      },
      "id": "control_header"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "caption": "导航树",
          "itemStyle": "DEFAULT",
          "itemType": "CTRLPOS",
          "layoutPos": {
            "grow": 1,
            "shrink": 1,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "treeexpbar_tree"
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
        "grow": 1,
        "shrink": 1,
        "layout": "FLEX"
      },
      "id": "view_content"
    }
  ],
  "layoutPanel": true,
  "codeName": "MobTreeExpBarLayout",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "部件-移动端树导航栏布局面板",
  "appDataEntityId": "mobfrontmodel.controllayoutmodelrepository",
  "controlParam": {},
  "modelId": "E8A7352D-CA7E-48A0-8E22-6EEA08A4FBB8",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "mobtreeexpbarlayout"
}
