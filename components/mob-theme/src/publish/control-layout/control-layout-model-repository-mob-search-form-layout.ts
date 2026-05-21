export default {
  "viewProxyMode": true,
  "layoutMode": "FLEX",
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
            "grow": 1,
            "shrink": 1,
            "layout": "FLEX"
          },
          "id": "control_searchform"
        },
        {
          "actionGroupExtractMode": "ITEM",
          "panelItems": [
            {
              "rawItem": {
                "halign": "LEFT",
                "valign": "MIDDLE",
                "wrapMode": "NOWRAP",
                "contentType": "RAW",
                "predefinedType": "SEARCHFORM_BUTTONS",
                "id": "searchform_buttons2"
              },
              "itemStyle": "DEFAULT",
              "itemType": "RAWITEM",
              "layoutPos": {
                "shrink": 1,
                "layout": "FLEX"
              },
              "id": "searchform_buttons2"
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
            "grow": 0,
            "shrink": 0,
            "layout": "FLEX"
          },
          "id": "control_buttons_right"
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
        "grow": 1,
        "shrink": 1,
        "layout": "FLEX"
      },
      "id": "control_content"
    },
    {
      "actionGroupExtractMode": "ITEM",
      "panelItems": [
        {
          "rawItem": {
            "caption": "图片",
            "contentType": "PLACEHOLDER",
            "predefinedType": "SEARCHFORM_BUTTONS",
            "id": "searchform_buttons"
          },
          "caption": "图片",
          "itemStyle": "DEFAULT",
          "itemType": "RAWITEM",
          "layoutPos": {
            "shrink": 1,
            "layout": "FLEX"
          },
          "showCaption": true,
          "id": "searchform_buttons"
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
        "grow": 0,
        "shrink": 0,
        "layout": "FLEX"
      },
      "id": "control_buttons_bottom"
    }
  ],
  "layoutPanel": true,
  "controls": [
    {
      "capLanguageRes": {
        "lanResTag": "DE.LNAME.CONTROLLAYOUTMODELREPOSITORY"
      },
      "caption": "移动端搜索表单",
      "codeName": "MobSearchFormLayoutcaptionbar",
      "controlType": "CAPTIONBAR",
      "appDataEntityId": "mobfrontmodel.controllayoutmodelrepository",
      "controlParam": {},
      "name": "captionbar",
      "id": "mobsearchformlayoutcaptionbar"
    }
  ],
  "codeName": "Usr1022075630",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "移动端搜索表单部件布局面板布局面板",
  "appDataEntityId": "mobfrontmodel.controllayoutmodelrepository",
  "controlParam": {},
  "modelId": "EE291077-4277-4F81-8DE6-67A7690BD32F",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "usr1022075630"
}
