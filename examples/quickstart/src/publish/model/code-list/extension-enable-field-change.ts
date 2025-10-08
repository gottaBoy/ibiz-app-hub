export default {
  codeListTag: 'extension__enable_field_change',
  codeListType: 'STATIC',
  codeName: 'extension__enable_field_change',
  emptyText: '未定义',
  appDataEntityId: 'web.psdelogic',
  codeItems: [
    {
      codeName: 'mock_region_status',
      data: '{"is_dropdown_list": true ,"codelist_tag":"mock__cl_status","allow_empty":"false"}',
      text: '变更区划状态',
      value: 'mock.region.status',
      id: 'mock_region_status',
    },
    {
      codeName: 'item_3',
      data: '{"is_dropdown_list": false,"allow_empty":"true"}',
      codeItems: [
        {
          codeName: 'mock_master_description',
          text: '描述',
          value: 'mock.master.description',
          id: 'mock_master_description',
        },
      ],
      text: '变更主数据属性',
      value: 'mock.master.*',
      id: 'item_3',
    },
  ],
  enableCache: true,
  name: '可供选择的属性变更',
  id: 'web.extension__enable_field_change',
};
