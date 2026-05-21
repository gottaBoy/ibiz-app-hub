import {
  IAppDataEntity,
  IAppDEDataImport,
  IAppDEField,
  IDEDataImportItem,
} from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  defineComponent,
  ref,
  PropType,
  Ref,
  computed,
  onMounted,
  watch,
} from 'vue';
import qs from 'qs';
import { showTitle } from '@ibiz-template/core';
import { clone } from 'ramda';
import './data-import2.scss';
import {
  asyncImportData2,
  createImportSchema,
  fetchImportSchemas,
  getDefaultDataImport,
  getImportSchema,
  updateImportSchema,
} from '@ibiz-template/runtime';

interface ISharedProperties {
  logicName?: string;
  caption?: string;
}
type DataOption =
  | (IAppDEField & ISharedProperties)
  | (IDEDataImportItem & ISharedProperties);

type Options = {
  [key: string]: string | boolean;
};

type columnMapValueType = { name: string; index: number; caption: string };

type columnMappingListMapValueType = {
  create_date: string;
  create_man: string;
  data_entity_tag: string;
  fields?: [{ caption: string; id: string; index: number; name: string }];
  id: string;
  import_tag: string;
  name: string;
  owner_type: string;
  system_tag: string;
  update_date: string;
  update_man: string;
};

export const DataImport2 = defineComponent({
  name: 'DataImport2',
  props: {
    dismiss: {
      type: Function as PropType<() => void>,
      required: true,
    },
    appDataEntity: {
      type: Object as PropType<IAppDataEntity>,
      required: true,
    },
    dataImport: {
      type: Object as PropType<IAppDEDataImport>,
      required: false,
    },
    context: {
      type: Object as PropType<IContext>,
      required: false,
    },
    params: {
      type: Object as PropType<IParams>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('data-import2');

    const isLoading: Ref<boolean> = ref(false);

    const onCancelButtonClick = () => {
      props.dismiss();
    };

    // excel表格数据
    const previewinfo: Ref<[string[]]> = ref([[]]);

    // 列映射集合
    const columnMap: Map<string, columnMapValueType> = new Map();

    // 维护表格中多个下拉选择属性值
    const selectValues: Ref<string[]> = ref([]);

    // 表格中下拉的属性
    const dataOption: Ref<DataOption[]> = ref([]);

    // 定制导入组件
    const dataimport2: Ref<HTMLDivElement | undefined> = ref();

    // 导入模式下拉选择器
    const select: Ref<HTMLDivElement | undefined> = ref();

    // 上传的文件名
    const fileName: Ref<string> = ref('');

    // 上传的文件ID
    let fileid: string = '';

    // 是否已列映射保存
    const ColumnMappingSave: Ref<boolean> = ref(true);

    // 导入模式下拉选择器选项值
    const listValue: Ref<string> = ref('');

    // 维护所有的导入模式信息
    const columnMappingListMap: Map<string, columnMappingListMapValueType> =
      new Map();

    // // 导入模式下拉选择器选项集合
    const options: Ref<Options[]> = ref([]);

    // 是否是私人导入模式
    const isNoPersonel: Ref<boolean> = ref(false);

    const dataImport =
      props.dataImport || getDefaultDataImport(props.appDataEntity);

    // 重置表格中多个下拉选择属性值和列映射集合
    const clearSelect = () => {
      const keys = [...columnMap.keys()];
      keys.forEach(item => {
        const data = columnMap.get(item);
        const cloneData = clone(data);
        if (data && cloneData) {
          cloneData.name = '';
          columnMap.set(item, cloneData);
          selectValues.value[data.index] = '';
        }
      });
    };

    // 列映射列表值改变
    const watchValue = async (listvalue: string) => {
      if (listvalue) {
        const columnData = columnMappingListMap.get(listvalue);
        if (!columnData) {
          return;
        }
        let columnMapData = columnData.fields;
        if (!columnData.fields) {
          const res = await getImportSchema(columnData.id, props.context);
          if (res.status === 200 && res.data) {
            columnMapData = res.data.fields;
          }
          columnData.fields = res.data.fields;
          columnMappingListMap.set(listvalue, columnData);
        }
        if (
          columnData.owner_type !== '' &&
          columnData.owner_type !== 'PERSONAL'
        ) {
          isNoPersonel.value = true;
        }
        const keys = [...columnMap.keys()];
        const captionMap = new Map();
        clearSelect();
        keys.forEach(item => {
          const columnMapValue = columnMap.get(item);
          const lastIndex = item.lastIndexOf('-'); // "MXCOUNT-0-0-0"
          const itemName = item.substring(0, lastIndex); // "MXCOUNT-0-0"
          let index = captionMap.get(itemName); // 取第几个
          if (!index) {
            captionMap.set(itemName, 0);
            index = 0;
          }
          const filteredObjects =
            columnMapData &&
            columnMapData.filter(
              (columnitem: { caption: string }) =>
                columnitem.caption === itemName,
            );
          const newColumnValue = filteredObjects && filteredObjects[index];
          if (newColumnValue) {
            const dataOptionValue = dataOption.value.find(
              dataOptionItem => dataOptionItem.id === newColumnValue.name,
            );
            if (dataOptionValue && columnMapValue) {
              captionMap.set(itemName, index + 1);
              newColumnValue.index = columnMapValue.index;
              columnMap.set(item, newColumnValue);
              selectValues.value[newColumnValue.index] = newColumnValue.name;
            }
          }
        });
      } else {
        clearSelect();
      }
    };

    // 监听导入模式下拉选择器值变化
    watch(listValue, (newValue, _oldValue) => {
      watchValue(newValue);
    });

    // 列映射保存
    const onButtonColumnMappingImportClick = async () => {
      const string = selectValues.value.join('');
      if (string === '') {
        ibiz.message.warning(ibiz.i18n.t('component.dataImport2.atLastOne'));
        return;
      }
      if (previewinfo.value[0].length) {
        ColumnMappingSave.value = true;
        const columnMapArr = [...columnMap.values()];
        const fields = columnMapArr.filter(
          (columnitem: { name: string }) => columnitem.name !== '',
        );
        const data: IData = {
          name: `${
            fileName.value.split('.')[0]
          }|${new Date().toLocaleString()}`, // 导入模式名称 按照导入的名称|时间来生成
          fields, // 导入模式属性 {name:'',order_value:1}
        };
        if (props.params) {
          Object.assign(data, props.params);
        }
        if (listValue.value) {
          const columnData = columnMappingListMap.get(listValue.value);
          if (columnData) {
            data.name = columnData.name;
            data.id = columnData.id;
          }
          const resput = await updateImportSchema({
            appDataEntity: props.appDataEntity,
            dataImport,
            data,
            context: props.context,
          });
          if (resput.status === 200 && resput.ok) {
            columnMappingListMap.set(
              listValue.value,
              resput.data as columnMappingListMapValueType,
            );
          }
        } else {
          options.value.push({
            value: data.name,
            label: data.name,
            oldLabel: data.name,
            edit: true,
            checkmark: false,
            close: false,
          });

          // 创建新的导入schema
          const res = await createImportSchema({
            appDataEntity: props.appDataEntity,
            dataImport,
            data,
            context: props.context,
          });
          if (res.status === 200 && res.ok) {
            columnMappingListMap.set(
              data.name,
              res.data as columnMappingListMapValueType,
            );
          }
          listValue.value = data.name;
        }
      } else {
        ibiz.message.warning(ibiz.i18n.t('component.dataImport2.uploadPlease'));
      }
    };

    // 导入
    const onButtonImportClick = async () => {
      if (previewinfo.value[0].length) {
        if (listValue.value && ColumnMappingSave.value) {
          const data = columnMappingListMap.get(listValue.value);
          let id = '';
          if (data) {
            id = data.id;
          }
          // 执行自定义的异步导入
          await asyncImportData2({
            appDataEntity: props.appDataEntity,
            dataImport,
            fileId: fileid,
            schemaId: id,
            context: props.context,
          });
          onCancelButtonClick();
        } else {
          await onButtonColumnMappingImportClick();
          await onButtonImportClick();
        }
      } else {
        ibiz.message.warning(ibiz.i18n.t('component.dataImport2.uploadPlease'));
      }
    };

    const findDialog = (el: HTMLElement) => {
      const regex = /\bel-dialog\b/;
      if (!regex.test(el.className)) {
        if (el.parentElement) {
          findDialog(el.parentElement as HTMLElement);
        }
      } else {
        el.style.maxWidth = 'calc(100% - 100px)';
      }
    };

    // 列映射列表查询
    const columnMappingListQuery = async () => {
      const res = await fetchImportSchemas({
        appDataEntity: props.appDataEntity,
        dataImport,
        context: props.context,
      });
      if (res.status === 200 && res.data) {
        res.data.forEach(item => {
          options.value.push({
            value: item.name,
            label: item.name,
            oldLabel: item.name,
            edit: true,
            checkmark: false,
            close: false,
          });
          columnMappingListMap.set(
            item.name,
            item as columnMappingListMapValueType,
          );
        });
      }
    };

    onMounted(() => {
      if (dataImport && dataImport.dedataImportItems) {
        dataOption.value = dataImport.dedataImportItems;
      } else if (props.appDataEntity.appDEFields) {
        dataOption.value = props.appDataEntity.appDEFields;
      }
      if (dataimport2.value && dataimport2.value.parentElement) {
        findDialog(dataimport2.value.parentElement);
      }
      columnMappingListQuery();
    });

    const uploadHeaders = ibiz.util.file.getUploadHeaders();
    // 请求头
    const headers: Ref<IData> = ref({ ...uploadHeaders });

    // 请求地址
    const UploadUrl = computed(() => {
      let uploadFileUrl;
      if (ibiz.env.uploadFileUrl.indexOf(`{cat}`) !== -1) {
        uploadFileUrl = ibiz.env.uploadFileUrl.replace('/{cat}', '/temp');
      } else {
        uploadFileUrl = `${ibiz.env.uploadFileUrl}/temp`;
      }
      let uploadUrl = `${ibiz.env.baseUrl}/${ibiz.env.appId}${uploadFileUrl}`;
      uploadUrl += qs.stringify({ preview: true }, { addQueryPrefix: true });
      return uploadUrl;
    });

    // 上传前
    const beforeUpload = () => {
      isLoading.value = true;
    };

    // 上传成功
    const onSuccess = (response: IData, _file: IData, _fileList: []) => {
      fileName.value = '';
      fileid = '';
      if (response.name) {
        fileName.value = response.name;
      }
      if (response.fileid) {
        fileid = response.fileid;
      }
      if (response.previewinfo) {
        previewinfo.value = JSON.parse(response.previewinfo);

        if (previewinfo.value[0] && previewinfo.value[0].length > 0) {
          // 获取第一个数组的长度
          const firstArrayLength = previewinfo.value[0].length;

          // 补全其他数组
          for (let i = 1; i < previewinfo.value.length; i++) {
            const currentArray = previewinfo.value[i];
            const currentArrayLength = currentArray.length;

            // 如果当前数组长度小于第一个数组长度，则进行补全
            if (currentArrayLength < firstArrayLength) {
              const diff = firstArrayLength - currentArrayLength;
              for (let j = 0; j < diff; j++) {
                currentArray.push('');
              }
            }
          }

          columnMap.clear();
          previewinfo.value[0].forEach((item: string, index: number) => {
            columnMap.set(`${item}-${index}`, {
              name: '',
              index,
              caption: item,
            });
            selectValues.value[index] = '';
          });
        }
      }
      isLoading.value = false;
      watchValue(listValue.value);
    };

    const columnMappingSaveChange = (data: boolean) => {
      ColumnMappingSave.value = data;
    };

    const selectValuesChange = (index: number, item: string) => {
      selectValues.value[index] = item;
    };

    const columnMapChange = (key: string, data: columnMapValueType) => {
      columnMap.set(key, data);
    };

    const listValueChange = (data: string) => {
      listValue.value = data;
    };

    const columnMappingListMapChange = (
      key: string,
      data?: columnMappingListMapValueType,
    ) => {
      if (data) {
        columnMappingListMap.set(key, data);
      } else {
        columnMappingListMap.delete(key);
      }
    };

    const optionsChange = (str: string, data?: Options) => {
      if (data) {
        const index = options.value.findIndex(obj => obj.label === str);
        const optionValue = options.value[index];
        Object.keys(data).forEach((key: string) => {
          optionValue[key] = data[key];
        });
      } else {
        const index = options.value.findIndex(obj => obj.label === str);
        if (index !== -1) {
          options.value.splice(index, 1);
        }
      }
    };
    return {
      ns,
      onButtonColumnMappingImportClick,
      onButtonImportClick,
      onCancelButtonClick,
      isLoading,
      UploadUrl,
      headers,
      onSuccess,
      previewinfo,
      selectValues,
      beforeUpload,
      dataimport2,
      listValue,
      options,
      select,
      isNoPersonel,
      fileName,
      dataOption,
      ColumnMappingSave,
      columnMap,
      columnMappingSaveChange,
      selectValuesChange,
      columnMapChange,
      columnMappingListMap,
      listValueChange,
      columnMappingListMapChange,
      optionsChange,
    };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), 'ibiz-view']}
        v-loading={this.isLoading}
        ref='dataimport2'
      >
        <div
          class={[this.ns.e('data-import2-toolbar'), 'ibiz-panel-view-header']}
        >
          <div class={[this.ns.e('caption')]}>
            <div class='ibiz-panel-container'>
              <div class='ibiz-control-captionbar'>
                <div class='ibiz-control-captionbar-caption'>
                  {ibiz.i18n.t('component.dataImport.importData')}
                </div>
              </div>
            </div>
          </div>
          <div
            class={[
              this.ns.e('data-import2-toolbar-container'),
              'ibiz-panel-container--view_header_right',
            ]}
          >
            <div class='ibiz-panel-container'>
              <div class='ibiz-control-toolbar'>
                <div class='ibiz-control-toolbar__item'>
                  {this.fileName
                    ? ibiz.i18n.t('component.dataImport2.fileName', {
                        fileName: this.fileName,
                      })
                    : ''}
                </div>
                {this.previewinfo[0] && this.previewinfo[0].length ? (
                  <data-import2-select
                    previewinfo={this.previewinfo}
                    options={this.options}
                    columnMappingListMap={this.columnMappingListMap}
                    listValue={this.listValue}
                    context={this.context}
                    onListValueChange={this.listValueChange}
                    onColumnMappingListMapChange={
                      this.columnMappingListMapChange
                    }
                    onOptionsChange={this.optionsChange}
                  ></data-import2-select>
                ) : (
                  ''
                )}
                {this.previewinfo[0] && this.previewinfo[0].length ? (
                  <div class='ibiz-control-toolbar__item'>
                    <el-button
                      onClick={this.onButtonColumnMappingImportClick}
                      disabled={this.isNoPersonel}
                    >
                      {ibiz.i18n.t('component.dataImport2.saveMode')}
                    </el-button>
                  </div>
                ) : (
                  ''
                )}
                <el-upload
                  class='ibiz-control-toolbar__item'
                  action={this.UploadUrl}
                  headers={this.headers}
                  data={this.params}
                  show-file-list={false}
                  onSuccess={this.onSuccess}
                  before-upload={this.beforeUpload}
                >
                  <el-button>
                    {this.previewinfo[0] && this.previewinfo[0].length
                      ? ibiz.i18n.t('component.dataImport2.reUpload')
                      : ibiz.i18n.t('component.dataImport2.fileUpload')}
                  </el-button>
                </el-upload>
                {this.previewinfo[0] && this.previewinfo[0].length ? (
                  <div class='ibiz-control-toolbar__item'>
                    <el-button
                      onClick={this.onButtonImportClick}
                      disabled={!this.selectValues.join('')}
                      title={showTitle(
                        !this.selectValues.join('')
                          ? ibiz.i18n.t(
                              'component.dataImport2.selectProperties',
                            )
                          : '',
                      )}
                    >
                      {ibiz.i18n.t('component.dataImport2.import')}
                    </el-button>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
        <data-import2-table
          previewinfo={this.previewinfo}
          selectValues={this.selectValues}
          dataOption={this.dataOption}
          columnMappingSave={this.ColumnMappingSave}
          columnMap={this.columnMap}
          onSelectValuesChange={this.selectValuesChange}
          onColumnMappingSaveChange={this.columnMappingSaveChange}
          onColumnMapChange={this.columnMapChange}
        ></data-import2-table>
      </div>
    );
  },
});
