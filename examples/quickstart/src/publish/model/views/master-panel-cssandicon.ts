export default {
  deviewCodeName: 'panel_cssandicon',
  deviewId: '53eb071951ec4fc8f4a05a7802a1eaea',
  appWFId: 'workflow',
  accUserMode: 3,
  capLanguageRes: {
    lanResTag: 'DE.LNAME.MASTER',
  },
  caption: '面板_界面样式及图标',
  codeName: 'master_panel_cssandicon',
  appDataEntityId: 'web.master',
  appViewMsgGroupId: 'panel_cssandicon',
  viewLayoutPanel: {
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
                rawItem: {
                  caption: '直接界面样式',
                  halign: 'LEFT',
                  renderMode: 'PARAGRAPH',
                  valign: 'MIDDLE',
                  wrapMode: 'NOWRAP',
                  contentType: 'RAW',
                  sysCss: {
                    cssName: 'rawitem',
                  },
                  predefinedType: 'STATIC_LABEL',
                  id: 'static_label',
                },
                caption: '标签',
                itemStyle: 'DEFAULT',
                itemType: 'RAWITEM',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                  spacingLeft: 'OUTERLARGE',
                  spacingRight: 'OUTERLARGE',
                  spacingTop: 'OUTERLARGE',
                },
                sysCss: {
                  cssName: 'rawitem',
                },
                showCaption: true,
                id: 'static_label',
              },
            ],
            predefinedType: 'CONTAINER_GROUP',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '直接界面样式',
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
                actionGroupExtractMode: 'ITEM',
                panelItems: [
                  {
                    rawItem: {
                      caption: '动态界面样式',
                      halign: 'LEFT',
                      renderMode: 'PARAGRAPH',
                      valign: 'MIDDLE',
                      wrapMode: 'NOWRAP',
                      contentType: 'RAW',
                      dynaClass: 'data?.className',
                      predefinedType: 'STATIC_LABEL',
                      id: 'static_label3',
                    },
                    caption: '标签',
                    itemStyle: 'DEFAULT',
                    itemType: 'RAWITEM',
                    layoutPos: {
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    showCaption: true,
                    id: 'static_label3',
                  },
                ],
                predefinedType: 'CONTAINER_SINGLEDATA',
                layout: {
                  layout: 'FLEX',
                },
                dataRegionType: 'SINGLEDATA',
                dataSourceType: 'CUSTOM',
                scriptCode: "{\nclassName: 'dynamic-class'\n}",
                caption: '单项数据容器',
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                  spacingLeft: 'OUTERLARGE',
                  spacingRight: 'OUTERLARGE',
                  spacingTop: 'OUTERLARGE',
                },
                id: 'container_singledata2',
              },
            ],
            predefinedType: 'CONTAINER_GROUP',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '动态界面样式',
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
                actionGroupExtractMode: 'ITEM',
                panelItems: [
                  {
                    actionGroupExtractMode: 'ITEM',
                    panelItems: [
                      {
                        actionGroupExtractMode: 'ITEM',
                        layout: {
                          layout: 'FLEX',
                        },
                        dataRegionType: 'INHERIT',
                        caption: '容器',
                        itemStyle: 'DEFAULT',
                        itemType: 'CONTAINER',
                        controlAttributes: [
                          {
                            attrName: 'dynamicstyle',
                            attrValue:
                              "{\r\n    position: 'absolute',\r\n  inset: 0,\r\n  background:'linear-gradient( 270deg, #AECDE5 0%, #567DA5 100%)',\r\n  opacity: 0.51\r\n}",
                            id: 'logic20',
                          },
                        ],
                        layoutPos: {
                          shrink: 1,
                          layout: 'FLEX',
                        },
                        id: 'outer_content',
                      },
                      {
                        actionGroupExtractMode: 'ITEM',
                        layout: {
                          layout: 'FLEX',
                        },
                        dataRegionType: 'INHERIT',
                        caption: '容器',
                        itemStyle: 'DEFAULT',
                        itemType: 'CONTAINER',
                        controlAttributes: [
                          {
                            attrName: 'dynamicstyle',
                            attrValue:
                              "(() => {\r\n  const colorMap = {\r\n      green: 'linear-gradient( 270deg, #30CD6E 0%, #24B04C 100%)',\r\n      yellow: 'linear-gradient( 270deg, #E8BA41 0%, #F7AC24 100%)',\r\n      red: 'linear-gradient( 270deg, #DA582C 0%, #F73A13 100%)',\r\n    };\r\n    const {completed_percent, on_year_light } = data || {}\r\n  return {position: 'absolute',\r\n  top: 0,\r\n  bottom: 0,\r\n  left: 0,\r\n  display: 'flex',\r\n  'align-items': 'center',\r\n  width: completed_percent != null ?  `${completed_percent}%` : 0,\r\n  background: colorMap[on_year_light] || colorMap['green'],\r\n  'max-width': '100%',\r\n  overflow: 'hidden',\r\n  'border-radius': 'inherit'}\r\n})()\r\n",
                            id: 'logic21',
                          },
                        ],
                        layoutPos: {
                          shrink: 1,
                          layout: 'FLEX',
                        },
                        id: 'inner',
                      },
                      {
                        actionGroupExtractMode: 'ITEM',
                        panelItems: [
                          {
                            editor: {
                              halign: 'LEFT',
                              renderMode: 'TEXT_DYNAMIC',
                              valign: 'MIDDLE',
                              wrapMode: 'NOWRAP',
                              editorType: 'SPAN',
                              predefinedType: 'FIELD_TEXT_DYNAMIC',
                              valueType: 'SIMPLE',
                              editable: true,
                              id: 'start_text',
                            },
                            valueFormat: '#,##0.##########亿元',
                            viewFieldName: 'completed',
                            allowEmpty: true,
                            caption: '文本(动态)',
                            itemStyle: 'DEFAULT',
                            itemType: 'FIELD',
                            controlAttributes: [
                              {
                                attrName: 'dynamicstyle',
                                attrValue:
                                  "{\r\n    'padding-left': '4px',\r\n  overflow: 'hidden',\r\n  'text-overflow': 'ellipsis',\r\n  'white-space':'nowrap',\r\n  '--ibiz-form-item-text-color': '#fff'\r\n}",
                                id: 'logic23',
                              },
                            ],
                            layoutPos: {
                              shrink: 1,
                              layout: 'FLEX',
                            },
                            id: 'start_text',
                          },
                          {
                            editor: {
                              halign: 'LEFT',
                              renderMode: 'TEXT_DYNAMIC',
                              valign: 'MIDDLE',
                              wrapMode: 'NOWRAP',
                              editorType: 'SPAN',
                              predefinedType: 'FIELD_TEXT_DYNAMIC',
                              valueType: 'SIMPLE',
                              editable: true,
                              id: 'end_text',
                            },
                            valueFormat: '@%',
                            viewFieldName: 'completed_percent',
                            allowEmpty: true,
                            caption: '文本(动态)',
                            itemStyle: 'DEFAULT',
                            itemType: 'FIELD',
                            controlAttributes: [
                              {
                                attrName: 'dynamicstyle',
                                attrValue:
                                  "{\r\n  '--ibiz-form-item-text-color': '#fff'\r\n}",
                                id: 'logic24',
                              },
                            ],
                            layoutPos: {
                              shrink: 1,
                              layout: 'FLEX',
                            },
                            id: 'end_text',
                          },
                        ],
                        layout: {
                          align: 'flex-start',
                          dir: 'row',
                          layout: 'FLEX',
                          valign: 'center',
                        },
                        dataRegionType: 'INHERIT',
                        caption: '容器',
                        itemStyle: 'DEFAULT',
                        itemType: 'CONTAINER',
                        layoutPos: {
                          shrink: 1,
                          layout: 'FLEX',
                        },
                        sysCss: {
                          cssName: 'slider-text-container',
                        },
                        id: 'container6',
                      },
                    ],
                    layout: {
                      layout: 'FLEX',
                    },
                    dataRegionType: 'INHERIT',
                    caption: '容器',
                    itemStyle: 'DEFAULT',
                    itemType: 'CONTAINER',
                    controlAttributes: [
                      {
                        attrName: 'dynamicstyle',
                        attrValue:
                          "{\r\n  position: 'relative',\r\n  height: '22px',\r\n  overflow: 'hidden',\r\n  'font-size': '14px',\r\n ' line-height': '22px',\r\n  color: '#FFF',\r\n  'border-radius':' 5px'\r\n}",
                        id: 'logic19',
                      },
                      {
                        attrName: 'dynamictooltip',
                        attrValue:
                          "(() => {\r\n    const {\r\n        prof_category,\r\n        semi_target,\r\n        completed_percent,\r\n    } = data || {};\r\n    // 单位\r\n    const unit = '亿元';\r\n\r\n    // 格式化文本\r\n    const format = (value) => {\r\n      if (value == null) {\r\n        return `-${unit}`;\r\n      }\r\n      return `${ibiz.util.text.format(`${value}`, '#,##0.##########')}${unit}`;\r\n    };\r\nconst content = `\r\n<div class=\"tooltip-content\">\r\n    <div class=\"tooltip-item\">\r\n    所属专业：${prof_category != null ? prof_category : '-'}\r\n    </div>\r\n    <div class=\"tooltip-item\">\r\n    上半年目标产值：${format(semi_target)}\r\n    </div>\r\n    <div class=\"tooltip-item\">\r\n    上半年已完成占比：${completed_percent != null ? completed_percent : '-'}%\r\n    </div>\r\n</div>`\r\n\r\nreturn {\r\n  content,\r\n  placement: 'right',\r\n  \"show-arrow\":true,\r\n  'popper-class': 'dynamic-tooltip'\r\n}\r\n})()",
                        id: 'logic25',
                      },
                    ],
                    layoutPos: {
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    sysCss: {
                      cssName: 'slider',
                    },
                    id: 'outer',
                  },
                  {
                    actionGroupExtractMode: 'ITEM',
                    panelItems: [
                      {
                        rawItem: {
                          caption: '上半年:',
                          halign: 'LEFT',
                          renderMode: 'PARAGRAPH',
                          valign: 'MIDDLE',
                          wrapMode: 'NOWRAP',
                          contentType: 'RAW',
                          predefinedType: 'STATIC_LABEL',
                          id: 'static_label2',
                        },
                        caption: '标签',
                        itemStyle: 'DEFAULT',
                        itemType: 'RAWITEM',
                        layoutPos: {
                          shrink: 1,
                          layout: 'FLEX',
                        },
                        showCaption: true,
                        id: 'static_label2',
                      },
                      {
                        editor: {
                          halign: 'LEFT',
                          renderMode: 'TEXT_DYNAMIC',
                          valign: 'MIDDLE',
                          wrapMode: 'NOWRAP',
                          editorType: 'SPAN',
                          predefinedType: 'FIELD_TEXT_DYNAMIC',
                          valueType: 'SIMPLE',
                          editable: true,
                          id: 'field_text_dynamic1',
                        },
                        valueFormat: '#,##0.##########亿元',
                        viewFieldName: 'semi_target',
                        allowEmpty: true,
                        caption: '文本(动态)',
                        itemStyle: 'DEFAULT',
                        itemType: 'FIELD',
                        layoutPos: {
                          shrink: 1,
                          layout: 'FLEX',
                        },
                        id: 'field_text_dynamic1',
                      },
                    ],
                    layout: {
                      align: 'flex-end',
                      dir: 'row',
                      layout: 'FLEX',
                      valign: 'center',
                    },
                    dataRegionType: 'INHERIT',
                    caption: '容器',
                    itemStyle: 'DEFAULT',
                    itemType: 'CONTAINER',
                    controlAttributes: [
                      {
                        attrName: 'dynamicstyle',
                        attrValue:
                          "{\r\n  'font-size': '14px',\r\n  'line-height': '22px',\r\n  color: '#FFF',\r\n  'text-align': 'right'\r\n}",
                        id: 'logic22',
                      },
                    ],
                    layoutPos: {
                      shrink: 1,
                      layout: 'FLEX',
                    },
                    id: 'footer',
                  },
                ],
                predefinedType: 'CONTAINER_SINGLEDATA',
                layout: {
                  layout: 'FLEX',
                },
                dataRegionType: 'SINGLEDATA',
                dataSourceType: 'CUSTOM',
                scriptCode:
                  '{\n    "prof_category": "规上服务业营收（2）",\n    "semi_target": "213.10",\n    "completed": "161.35",\n    "completed_percent": "76.0",\n    "on_year": "10.0%",\n    "on_year_light": "green"\n}',
                caption: '单项数据容器',
                contentWidth: 50,
                itemStyle: 'DEFAULT',
                itemType: 'CONTAINER',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                  spacingLeft: 'OUTERLARGE',
                  spacingRight: 'OUTERLARGE',
                  width: 50,
                  widthMode: 'PERCENTAGE',
                },
                width: 50,
                id: 'container_singledata1',
              },
              {
                rawItem: {
                  caption:
                    '说明：通过dynamicstyle属性，可给面板项注入自定义动态样式，属性类型为对象或者字符串；通过dynamictooltip属性，可在鼠标悬浮在容器上时显示tooltip提示，属性类型为对象，对象的content属性用于指定提示显示的内容，其余属性将传给el-tooltip组件',
                  halign: 'LEFT',
                  renderMode: 'PARAGRAPH',
                  valign: 'MIDDLE',
                  wrapMode: 'NOWRAP',
                  contentType: 'RAW',
                  cssStyle: 'padding: 8px 4px;\nline-height: 32px;',
                  sysCss: {
                    cssName: 'description-text',
                  },
                  predefinedType: 'STATIC_LABEL',
                  id: 'static_label1',
                },
                caption: '标签',
                itemStyle: 'DEFAULT',
                itemType: 'RAWITEM',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                },
                sysCss: {
                  cssName: 'description-text',
                },
                showCaption: true,
                id: 'static_label1',
              },
            ],
            predefinedType: 'CONTAINER_GROUP',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '容器样式表',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'container_group2',
          },
          {
            actionGroupExtractMode: 'ITEM',
            panelItems: [
              {
                rawItem: {
                  sysImage: {
                    rawContent:
                      '<?xml version="1.0" encoding="UTF-8"?>\n<svg width="450px" height="206px" viewBox="0 0 450 206" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <title>iBizsys 软件工厂</title>\n    <g id="iBizsys-软件工厂" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="ibiz软件工厂-（私有云订阅服务）" transform="translate(251.48, 97.957)" fill="#00A4FF" fill-rule="nonzero">\n            <g id="软件工厂-copy">\n                <path d="M30.229,8.584 C29.785,11.063 29.23,13.579 28.749,15.281 L31.524,16.021 C32.375,13.468 33.263,9.435 34.003,5.957 L31.709,5.365 L31.302,5.476 L22.422,5.476 C22.792,3.848 23.088,2.183 23.347,0.481 L20.017,0 C19.314,5.661 17.871,11.026 15.355,14.43 C16.169,14.837 17.575,15.836 18.167,16.354 C19.573,14.319 20.72,11.618 21.645,8.584 L30.229,8.584 Z M16.428,25.308 L16.243,22.2 L11.729,22.829 L11.729,18.574 L15.947,18.574 L15.947,15.466 L11.729,15.466 L11.729,10.175 L8.658,10.175 L8.658,15.466 L5.291,15.466 C6.364,13.098 7.511,10.36 8.473,7.437 L16.206,7.437 L16.206,4.181 L9.509,4.181 C9.842,3.071 10.175,1.887 10.471,0.777 L7.104,0.074 C6.845,1.443 6.475,2.849 6.105,4.181 L0.407,4.181 L0.407,7.437 L5.143,7.437 C4.218,10.175 3.367,12.358 2.96,13.209 C2.257,14.837 1.665,15.91 0.925,16.132 C1.295,16.909 1.85,18.426 2.035,19.092 C2.294,18.796 3.589,18.574 4.921,18.574 L8.658,18.574 L8.658,23.236 C5.365,23.717 2.294,24.161 0,24.42 L0.703,27.935 C2.997,27.565 5.772,27.084 8.658,26.64 L8.658,33.855 L11.729,33.855 L11.729,26.122 L16.428,25.308 Z M26.011,11.988 L22.755,11.988 L22.755,13.69 C22.755,18.574 22.163,26.085 14.615,31.672 C15.466,32.153 16.65,33.263 17.205,34.003 C21.238,30.895 23.421,27.232 24.605,23.68 C26.196,28.231 28.527,31.894 32.005,33.966 C32.486,33.041 33.559,31.746 34.262,31.08 C29.748,28.786 27.121,23.384 25.863,17.242 C25.974,16.021 26.011,14.8 26.011,13.764 L26.011,11.988 Z" id="形状"></path>\n                <path d="M45.14,0.148 C43.216,5.55 40.071,10.915 36.704,14.393 C37.296,15.207 38.258,17.057 38.591,17.871 C39.553,16.835 40.552,15.577 41.477,14.282 L41.477,33.892 L44.733,33.892 L44.733,9.102 C46.139,6.512 47.397,3.811 48.359,1.11 L45.14,0.148 Z M70.818,18.019 L61.013,18.019 L61.013,10.693 L69.153,10.693 L69.153,7.326 L61.013,7.326 L61.013,0.444 L57.572,0.444 L57.572,7.326 L53.428,7.326 C53.872,5.772 54.279,4.181 54.612,2.59 L51.282,1.924 C50.468,6.549 48.951,11.285 46.879,14.245 C47.693,14.615 49.173,15.429 49.839,15.91 C50.764,14.504 51.578,12.691 52.318,10.693 L57.572,10.693 L57.572,18.019 L47.323,18.019 L47.323,21.386 L57.572,21.386 L57.572,33.929 L61.013,33.929 L61.013,21.386 L70.818,21.386 L70.818,18.019 Z" id="形状"></path>\n                <polygon id="路径" points="92.833 27.824 92.833 7.548 105.709 7.548 105.709 3.996 76.479 3.996 76.479 7.548 88.985 7.548 88.985 27.824 74.518 27.824 74.518 31.265 107.633 31.265 107.633 27.824"></polygon>\n                <path d="M144.078,2.368 L114.848,2.368 L114.848,13.431 C114.848,18.981 114.552,26.64 111,31.931 C111.925,32.264 113.553,33.3 114.182,33.892 C117.956,28.268 118.548,19.499 118.548,13.468 L118.548,5.994 L144.078,5.994 L144.078,2.368 Z" id="路径"></path>\n            </g>\n        </g>\n        <g id="ibz" transform="translate(53, 73)">\n            <rect id="矩形" fill="#00A4FF" fill-rule="nonzero" x="56.6734489" y="32.0534424" width="8.49997851" height="25.7577313"></rect>\n            <polygon id="路径" fill="#00A4FF" fill-rule="nonzero" points="70.5761343 32.0534424 92.9017167 32.0534424 92.9017167 37.956548 81.0732223 50.8634569 93.6024569 50.8634569 93.6024569 57.8181846 69.6721794 57.8181846 69.6721794 51.9641547 80.6738004 39.0572458 70.6742379 39.0572458"></polygon>\n            <path d="M96.5735953,45.6404003 L104.982478,44.9393189 C106.608195,50.933565 109.61437,51.7047546 112.550472,51.7047546 C117.056231,51.0036732 120.181532,44.9393189 112.487405,43.992859 C97.8559499,42.5906962 97.8489425,32.9438158 97.8489425,32.9438158 C97.7438315,32.6423508 97.9890905,22.0209674 109.761526,22.0209674 C127.532297,22.0209674 125.374017,34.5422815 125.374017,34.5422815 L116.474617,34.5422815 C115.535625,29.9151441 112.319227,29.3192249 109.467215,29.7959603 C102.712079,31.352361 109.789555,34.9839628 112.389301,35.2293413 C114.778825,35.692055 123.601144,34.5282599 125.850521,45.8717572 C127.364119,55.0348913 118.401652,58.0775847 115.535625,58.4211146 C97.5336094,60.6225102 97.0711209,48.2624448 96.5735953,45.6404003 Z" id="路径" fill="#00A4FF" fill-rule="nonzero"></path>\n            <path d="M128.863703,32.2076804 L137.973326,32.2076804 L142.990626,46.9303901 L148.253184,32.2076804 L157.657118,32.2076804 L145.744535,63.0903168 C144.15791,66.1680351 140.957307,68.0724645 137.496822,67.9978868 L131.442427,67.9978868 L130.524458,60.7977806 C132.149666,61.0517488 133.804431,61.0517488 135.429639,60.7977806 C138.688081,60.6505535 138.610999,56.4370542 137.454778,54.3548424 L128.863703,32.2076804 Z" id="路径" fill="#00A4FF"></path>\n            <path d="M176.163666,40.6206574 L185,40.8309818 C185,40.8309818 183.836771,31.2331772 171.118337,31.2331772 C160.684315,31.2331772 160.502123,38.6996943 160.361975,39.9686517 C160.361975,39.9686517 159.535101,47.4421796 172.540839,48.4938017 C177.172732,49.0336344 176.80134,52.3918144 173.626987,52.7002902 C171.62287,52.6091496 169.016116,52.1955116 167.544562,48.7041261 L159.401961,49.3350994 C159.401961,49.3350994 159.163709,59.0310554 172.204484,59.1502393 C179.274953,59.1502393 185,55.0559238 185,49.4823265 C185,44.4345403 180.893662,41.9316796 173.641002,41.0693495 C170.838041,40.9782089 165.232119,38.2650238 171.503744,37.6340505 C171.503744,37.6480722 175.743222,37.7041587 176.163666,40.6206574 Z" id="路径" fill="#00A4FF" fill-rule="nonzero"></path>\n            <path d="M4.71356374,47.4351688 C4.90977099,46.8322387 7.07505818,45.2057299 8.66573842,43.3198208 C9.64592543,42.2228737 10.4992226,41.018739 11.2094253,39.730284 C12.7720759,36.5754176 8.56062739,35.2503737 4.72057114,39.239527 C0.880514898,43.2286803 -2.11164572,50.0572133 1.91761038,55.0629346 C5.659563,58.4000821 7.47448009,55.8481458 11.0762847,52.5390415 C16.3178213,47.7226121 14.2646525,45.9348545 10.6908776,49.4823265 C7.73375396,52.0272521 5.95387388,51.2560625 5.2881707,51.0036732 C4.62246752,50.7512839 3.93574213,48.9214614 4.71356374,47.4351688 Z" id="路径" fill="#00A4FF"></path>\n            <path d="M13.8792454,34.5563031 C13.8792454,34.5563031 15.6941625,33.0629997 16.0585474,31.5626855 C17.3198798,28.7583598 13.2555867,27.4333159 12.0222839,28.975695 L10.0321818,31.4364908 C8.41347195,34.0515245 12.6669649,36.0005308 13.8792454,34.5563031 Z" id="路径" fill="#00A4FF"></path>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="60.8568678" cy="25.6034934" rx="4.80707771" ry="4.80941853"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="81.7038885" cy="10.2147563" rx="3.88910806" ry="3.89100187"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="102.698065" cy="2.92350951" rx="2.9220866" ry="2.92350951"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="123.446982" cy="10.5582862" rx="2.55069429" ry="2.55193636"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="144.553276" cy="25.6034934" rx="1.80090229" ry="1.80177925"></ellipse>\n            <path d="M44.3123919,39.4218082 C52.5530966,33.0419672 48.271574,22.3574864 38.909685,22.3574864 C35.5601469,22.3574864 19.4571374,22.2733567 19.4571374,22.2733567 L19.4571374,57.8181846 L38.559315,57.8181846 C49.5539285,57.8181846 55.2018945,45.5702922 44.3123919,39.4218082 Z M27.6698124,29.6066683 L36.1697909,29.6066683 C41.6215496,29.6066683 41.2922017,36.3580824 36.1697909,36.1687904 L27.6698124,36.1687904 L27.6698124,29.6066683 Z M36.1697909,50.7512839 L27.6698124,50.7512839 L27.6698124,43.4670479 L36.1697909,43.4670479 C42.6236081,43.4670479 42.413386,50.7512839 36.1697909,50.7512839 Z" id="形状" fill="#00A4FF" fill-rule="nonzero"></path>\n            <g id="编组" transform="translate(-77.3501, -33.6519)"></g>\n        </g>\n    </g>\n</svg>',
                  },
                  contentType: 'IMAGE',
                  predefinedType: 'STATIC_IMAGE',
                  id: 'static_image',
                },
                caption: '图片',
                itemStyle: 'DEFAULT',
                itemType: 'RAWITEM',
                layoutPos: {
                  shrink: 1,
                  layout: 'FLEX',
                },
                sysImage: {
                  rawContent:
                    '<?xml version="1.0" encoding="UTF-8"?>\n<svg width="450px" height="206px" viewBox="0 0 450 206" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <title>iBizsys 软件工厂</title>\n    <g id="iBizsys-软件工厂" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="ibiz软件工厂-（私有云订阅服务）" transform="translate(251.48, 97.957)" fill="#00A4FF" fill-rule="nonzero">\n            <g id="软件工厂-copy">\n                <path d="M30.229,8.584 C29.785,11.063 29.23,13.579 28.749,15.281 L31.524,16.021 C32.375,13.468 33.263,9.435 34.003,5.957 L31.709,5.365 L31.302,5.476 L22.422,5.476 C22.792,3.848 23.088,2.183 23.347,0.481 L20.017,0 C19.314,5.661 17.871,11.026 15.355,14.43 C16.169,14.837 17.575,15.836 18.167,16.354 C19.573,14.319 20.72,11.618 21.645,8.584 L30.229,8.584 Z M16.428,25.308 L16.243,22.2 L11.729,22.829 L11.729,18.574 L15.947,18.574 L15.947,15.466 L11.729,15.466 L11.729,10.175 L8.658,10.175 L8.658,15.466 L5.291,15.466 C6.364,13.098 7.511,10.36 8.473,7.437 L16.206,7.437 L16.206,4.181 L9.509,4.181 C9.842,3.071 10.175,1.887 10.471,0.777 L7.104,0.074 C6.845,1.443 6.475,2.849 6.105,4.181 L0.407,4.181 L0.407,7.437 L5.143,7.437 C4.218,10.175 3.367,12.358 2.96,13.209 C2.257,14.837 1.665,15.91 0.925,16.132 C1.295,16.909 1.85,18.426 2.035,19.092 C2.294,18.796 3.589,18.574 4.921,18.574 L8.658,18.574 L8.658,23.236 C5.365,23.717 2.294,24.161 0,24.42 L0.703,27.935 C2.997,27.565 5.772,27.084 8.658,26.64 L8.658,33.855 L11.729,33.855 L11.729,26.122 L16.428,25.308 Z M26.011,11.988 L22.755,11.988 L22.755,13.69 C22.755,18.574 22.163,26.085 14.615,31.672 C15.466,32.153 16.65,33.263 17.205,34.003 C21.238,30.895 23.421,27.232 24.605,23.68 C26.196,28.231 28.527,31.894 32.005,33.966 C32.486,33.041 33.559,31.746 34.262,31.08 C29.748,28.786 27.121,23.384 25.863,17.242 C25.974,16.021 26.011,14.8 26.011,13.764 L26.011,11.988 Z" id="形状"></path>\n                <path d="M45.14,0.148 C43.216,5.55 40.071,10.915 36.704,14.393 C37.296,15.207 38.258,17.057 38.591,17.871 C39.553,16.835 40.552,15.577 41.477,14.282 L41.477,33.892 L44.733,33.892 L44.733,9.102 C46.139,6.512 47.397,3.811 48.359,1.11 L45.14,0.148 Z M70.818,18.019 L61.013,18.019 L61.013,10.693 L69.153,10.693 L69.153,7.326 L61.013,7.326 L61.013,0.444 L57.572,0.444 L57.572,7.326 L53.428,7.326 C53.872,5.772 54.279,4.181 54.612,2.59 L51.282,1.924 C50.468,6.549 48.951,11.285 46.879,14.245 C47.693,14.615 49.173,15.429 49.839,15.91 C50.764,14.504 51.578,12.691 52.318,10.693 L57.572,10.693 L57.572,18.019 L47.323,18.019 L47.323,21.386 L57.572,21.386 L57.572,33.929 L61.013,33.929 L61.013,21.386 L70.818,21.386 L70.818,18.019 Z" id="形状"></path>\n                <polygon id="路径" points="92.833 27.824 92.833 7.548 105.709 7.548 105.709 3.996 76.479 3.996 76.479 7.548 88.985 7.548 88.985 27.824 74.518 27.824 74.518 31.265 107.633 31.265 107.633 27.824"></polygon>\n                <path d="M144.078,2.368 L114.848,2.368 L114.848,13.431 C114.848,18.981 114.552,26.64 111,31.931 C111.925,32.264 113.553,33.3 114.182,33.892 C117.956,28.268 118.548,19.499 118.548,13.468 L118.548,5.994 L144.078,5.994 L144.078,2.368 Z" id="路径"></path>\n            </g>\n        </g>\n        <g id="ibz" transform="translate(53, 73)">\n            <rect id="矩形" fill="#00A4FF" fill-rule="nonzero" x="56.6734489" y="32.0534424" width="8.49997851" height="25.7577313"></rect>\n            <polygon id="路径" fill="#00A4FF" fill-rule="nonzero" points="70.5761343 32.0534424 92.9017167 32.0534424 92.9017167 37.956548 81.0732223 50.8634569 93.6024569 50.8634569 93.6024569 57.8181846 69.6721794 57.8181846 69.6721794 51.9641547 80.6738004 39.0572458 70.6742379 39.0572458"></polygon>\n            <path d="M96.5735953,45.6404003 L104.982478,44.9393189 C106.608195,50.933565 109.61437,51.7047546 112.550472,51.7047546 C117.056231,51.0036732 120.181532,44.9393189 112.487405,43.992859 C97.8559499,42.5906962 97.8489425,32.9438158 97.8489425,32.9438158 C97.7438315,32.6423508 97.9890905,22.0209674 109.761526,22.0209674 C127.532297,22.0209674 125.374017,34.5422815 125.374017,34.5422815 L116.474617,34.5422815 C115.535625,29.9151441 112.319227,29.3192249 109.467215,29.7959603 C102.712079,31.352361 109.789555,34.9839628 112.389301,35.2293413 C114.778825,35.692055 123.601144,34.5282599 125.850521,45.8717572 C127.364119,55.0348913 118.401652,58.0775847 115.535625,58.4211146 C97.5336094,60.6225102 97.0711209,48.2624448 96.5735953,45.6404003 Z" id="路径" fill="#00A4FF" fill-rule="nonzero"></path>\n            <path d="M128.863703,32.2076804 L137.973326,32.2076804 L142.990626,46.9303901 L148.253184,32.2076804 L157.657118,32.2076804 L145.744535,63.0903168 C144.15791,66.1680351 140.957307,68.0724645 137.496822,67.9978868 L131.442427,67.9978868 L130.524458,60.7977806 C132.149666,61.0517488 133.804431,61.0517488 135.429639,60.7977806 C138.688081,60.6505535 138.610999,56.4370542 137.454778,54.3548424 L128.863703,32.2076804 Z" id="路径" fill="#00A4FF"></path>\n            <path d="M176.163666,40.6206574 L185,40.8309818 C185,40.8309818 183.836771,31.2331772 171.118337,31.2331772 C160.684315,31.2331772 160.502123,38.6996943 160.361975,39.9686517 C160.361975,39.9686517 159.535101,47.4421796 172.540839,48.4938017 C177.172732,49.0336344 176.80134,52.3918144 173.626987,52.7002902 C171.62287,52.6091496 169.016116,52.1955116 167.544562,48.7041261 L159.401961,49.3350994 C159.401961,49.3350994 159.163709,59.0310554 172.204484,59.1502393 C179.274953,59.1502393 185,55.0559238 185,49.4823265 C185,44.4345403 180.893662,41.9316796 173.641002,41.0693495 C170.838041,40.9782089 165.232119,38.2650238 171.503744,37.6340505 C171.503744,37.6480722 175.743222,37.7041587 176.163666,40.6206574 Z" id="路径" fill="#00A4FF" fill-rule="nonzero"></path>\n            <path d="M4.71356374,47.4351688 C4.90977099,46.8322387 7.07505818,45.2057299 8.66573842,43.3198208 C9.64592543,42.2228737 10.4992226,41.018739 11.2094253,39.730284 C12.7720759,36.5754176 8.56062739,35.2503737 4.72057114,39.239527 C0.880514898,43.2286803 -2.11164572,50.0572133 1.91761038,55.0629346 C5.659563,58.4000821 7.47448009,55.8481458 11.0762847,52.5390415 C16.3178213,47.7226121 14.2646525,45.9348545 10.6908776,49.4823265 C7.73375396,52.0272521 5.95387388,51.2560625 5.2881707,51.0036732 C4.62246752,50.7512839 3.93574213,48.9214614 4.71356374,47.4351688 Z" id="路径" fill="#00A4FF"></path>\n            <path d="M13.8792454,34.5563031 C13.8792454,34.5563031 15.6941625,33.0629997 16.0585474,31.5626855 C17.3198798,28.7583598 13.2555867,27.4333159 12.0222839,28.975695 L10.0321818,31.4364908 C8.41347195,34.0515245 12.6669649,36.0005308 13.8792454,34.5563031 Z" id="路径" fill="#00A4FF"></path>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="60.8568678" cy="25.6034934" rx="4.80707771" ry="4.80941853"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="81.7038885" cy="10.2147563" rx="3.88910806" ry="3.89100187"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="102.698065" cy="2.92350951" rx="2.9220866" ry="2.92350951"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="123.446982" cy="10.5582862" rx="2.55069429" ry="2.55193636"></ellipse>\n            <ellipse id="椭圆形" fill="#00A4FF" fill-rule="nonzero" cx="144.553276" cy="25.6034934" rx="1.80090229" ry="1.80177925"></ellipse>\n            <path d="M44.3123919,39.4218082 C52.5530966,33.0419672 48.271574,22.3574864 38.909685,22.3574864 C35.5601469,22.3574864 19.4571374,22.2733567 19.4571374,22.2733567 L19.4571374,57.8181846 L38.559315,57.8181846 C49.5539285,57.8181846 55.2018945,45.5702922 44.3123919,39.4218082 Z M27.6698124,29.6066683 L36.1697909,29.6066683 C41.6215496,29.6066683 41.2922017,36.3580824 36.1697909,36.1687904 L27.6698124,36.1687904 L27.6698124,29.6066683 Z M36.1697909,50.7512839 L27.6698124,50.7512839 L27.6698124,43.4670479 L36.1697909,43.4670479 C42.6236081,43.4670479 42.413386,50.7512839 36.1697909,50.7512839 Z" id="形状" fill="#00A4FF" fill-rule="nonzero"></path>\n            <g id="编组" transform="translate(-77.3501, -33.6519)"></g>\n        </g>\n    </g>\n</svg>',
                },
                showCaption: true,
                id: 'static_image',
              },
            ],
            predefinedType: 'CONTAINER_GROUP',
            layout: {
              layout: 'FLEX',
            },
            dataRegionType: 'INHERIT',
            caption: '图片',
            itemStyle: 'DEFAULT',
            itemType: 'CONTAINER',
            layoutPos: {
              shrink: 1,
              layout: 'FLEX',
            },
            showCaption: true,
            id: 'container_group3',
          },
        ],
        layout: {
          dir: 'column',
          layout: 'FLEX',
        },
        dataRegionType: 'INHERIT',
        itemStyle: 'DEFAULT',
        itemType: 'CONTAINER',
        layoutPos: {
          shrink: 1,
          layout: 'FLEX',
          spacingBottom: 'INNERMEDIUM',
          spacingLeft: 'INNERMEDIUM',
          spacingRight: 'INNERMEDIUM',
          spacingTop: 'INNERMEDIUM',
        },
        id: 'page_container',
      },
    ],
    layoutPanel: true,
    controls: [
      {
        capLanguageRes: {
          lanResTag: 'DE.LNAME.MASTER',
        },
        caption: '面板_界面样式及图标',
        codeName: 'panel_cssandicon_captionbar',
        controlType: 'CAPTIONBAR',
        appDataEntityId: 'web.master',
        controlParam: {},
        name: 'captionbar',
        id: 'panel_cssandicon_captionbar',
      },
    ],
    codeName: 'usr0516974143',
    controlType: 'VIEWLAYOUTPANEL',
    logicName: '面板_界面样式及图标布局面板',
    appDataEntityId: 'web.master',
    controlParam: {},
    modelId: 'd15c1b47662f6227edc039d706c18752',
    modelType: 'PSSYSVIEWLAYOUTPANEL',
    name: 'layoutpanel',
    id: 'usr0516974143',
  },
  title: '面板_界面样式及图标',
  viewStyle: 'DEFAULT',
  viewType: 'DECUSTOMVIEW',
  enableDP: true,
  showCaptionBar: false,
  modelId: '519e6463d6494d012ca87bda12741d60',
  modelType: 'PSAPPDEVIEW',
  name: 'MASTERpanel_cssandicon',
  id: 'web.master_panel_cssandicon',
};
