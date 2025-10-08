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
    }
  ],
  "layoutPanel": true,
  "appViewLogics": [
    {
      "logicTrigger": "CUSTOM",
      "logicType": "APPUILOGIC",
      "builtinAppUILogic": {
        "actionAfterWizard": "DEFAULT",
        "builtinLogic": true,
        "logicType": "PREDEFINED",
        "viewLogicType": "APP_NEWDATA",
        "id": "新建数据"
      },
      "builtinLogic": true,
      "id": "newdata"
    },
    {
      "logicTrigger": "CUSTOM",
      "logicType": "APPUILOGIC",
      "builtinAppUILogic": {
        "editMode": true,
        "builtinLogic": true,
        "logicType": "PREDEFINED",
        "viewLogicType": "APP_OPENDATA",
        "id": "打开数据"
      },
      "builtinLogic": true,
      "id": "opendata"
    }
  ],
  "controls": [
    {
      "aggMode": "NONE",
      "columnEnableFilter": 2,
      "columnEnableLink": 2,
      "groupMode": "NONE",
      "groupStyle": "DEFAULT",
      "pagingSize": 20,
      "sortMode": "REMOTE",
      "enableCustomized": true,
      "fetchControlAction": {
        "appDEMethodId": "fetchdefault",
        "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
        "id": "fetch"
      },
      "removeControlAction": {
        "appDEMethodId": "remove",
        "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
        "id": "remove"
      },
      "autoLoad": true,
      "showBusyIndicator": true,
      "codeName": "Meditviewpanel",
      "controlType": "MULTIEDITVIEWPANEL",
      "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
      "controlParam": {
        "id": "meditviewpanel"
      },
      "modelId": "4e8c9f6da4230a76c0195b4ca614c172_meditviewpanel",
      "modelType": "PSDEGRID",
      "name": "meditviewpanel",
      "id": "frontmodel.viewlayoutmodelrepository.meditviewpanel"
    },
    {
      "groupMode": "SINGLE",
      "quickSearchMode": 1,
      "enableQuickSearch": true,
      "controlType": "SEARCHBAR",
      "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
      "controlParam": {
        "id": "searchbar"
      },
      "id": "searchbar"
    },
    {
      "capLanguageRes": {
        "lanResTag": "DE.LNAME.VIEWLAYOUTMODELREPOSITORY"
      },
      "caption": "视图布局模型存储",
      "codeName": "DEMEditView9Layout_TOPcaptionbar",
      "controlType": "CAPTIONBAR",
      "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
      "controlParam": {},
      "name": "captionbar",
      "id": "demeditview9layout_topcaptionbar"
    }
  ],
  "codeName": "Usr0806549299",
  "controlType": "VIEWLAYOUTPANEL",
  "logicName": "DEMEditView9Layout_TOP实体多表单编辑视图（部件视图）布局面板",
  "appDataEntityId": "frontmodel.viewlayoutmodelrepository",
  "controlParam": {},
  "modelId": "02553BFE-45B8-47F5-9737-5699E9F8BA4A",
  "modelType": "PSSYSVIEWLAYOUTPANEL",
  "name": "layoutpanel",
  "id": "usr0806549299"
}
