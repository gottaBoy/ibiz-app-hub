/* eslint-disable no-param-reassign */
/* eslint-disable no-unsafe-optional-chaining */
import { PropType, computed, defineComponent, h, ref, watch } from 'vue';
import { IOverlayContainer } from '@ibiz-template/runtime';
import { BIReportDesignController } from '../../../controller';
import { useNamespace } from '../../../use';
import BIChartPqlEditorModal from './chart-pql-editor-modal/chart-pql-editor-modal';
import './chart-pql-editor.scss';
import { getSchemaField } from '../../../util';
import { ISchemaField } from '../../../interface';
import { biReportT } from '../../../locale';

export default defineComponent({
  name: 'BIChartPqlEditor',
  props: {
    controller: {
      type: Object as PropType<BIReportDesignController>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: {
    change: (_value: string) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('chart-pql-editor');

    // 模态
    let modal: IOverlayContainer | undefined;

    // 当前值
    const currentValue = ref('');

    // 过滤数据类型
    const filterType = ['COMMON'];

    // 数据
    const items = computed(() => {
      return [
        ...props.controller.state.measure?.filter(item =>
          filterType.includes(item.bimeasuretype),
        ),
        ...props.controller.state.dimension?.filter(item =>
          filterType.includes(item.bidimensiontype),
        ),
      ];
    });

    // 字段
    const fields = ref<ISchemaField[]>([]);

    // 字段图标映射
    const fieldIconMap = ref<Map<string, string>>(new Map());

    watch(
      () => items.value,
      async () => {
        const schemaFields = await Promise.all(
          items.value.map(async item => {
            const field = await getSchemaField(
              item,
              props.controller.state.schemaFields || [],
              props.controller.context.srfappid || ibiz.env.appId,
            );
            if (field) {
              fieldIconMap.value.set(
                field.appDEFieldId,
                (item as IData).bimeasuretype ? 'measure' : 'dimension',
              );
            }
            return field;
          }),
        );
        fields.value = schemaFields.filter(field => {
          if (!field) {
            return false;
          }
          return true;
        }) as ISchemaField[];
        const appDataEntityId = props.controller.state.selectCube?.psdename;
        if (appDataEntityId) {
          const appDataEntity = await ibiz.hub.getAppDataEntity(
            appDataEntityId,
            props.controller.context.srfappid,
          );
          if (appDataEntity) {
            fields.value.forEach(item => {
              item.appDataEntityFullTag = appDataEntity.defullTag;
            });
          }
        }
      },
      {
        immediate: true,
      },
    );

    watch(
      () => props.value,
      () => {
        currentValue.value = props.value || '';
      },
      {
        immediate: true,
      },
    );

    // 处理取消按钮点击
    const handleCancel = () => {
      modal?.dismiss();
    };

    // 处理确认按钮点击
    const handleConfirm = (value: string) => {
      currentValue.value = value;
      modal?.dismiss();
      emit('change', currentValue.value);
    };

    // 打开模态
    const openModal = async () => {
      if (modal) {
        return;
      }
      modal = ibiz.overlay.createModal(
        () => {
          return h(BIChartPqlEditorModal, {
            value: currentValue.value,
            fields: fields.value,
            fieldIconMap: fieldIconMap.value,
            context: props.controller.context,
            params: props.controller.viewParams,
            onCancel: handleCancel,
            onConfirm: handleConfirm,
          });
        },
        undefined,
        { width: '40%', height: '70%' },
      );
      await modal.present();
      await modal.onWillDismiss();
      modal = undefined;
    };

    return {
      ns,
      fields,
      currentValue,
      openModal,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <iBizPqlEditor
          fields={this.fields}
          value={this.currentValue}
          readonly={true}
          placeholder={biReportT('pqlInputPlaceholder')}
          context={this.controller.context}
          params={this.controller.viewParams}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            this.openModal();
          }}
        ></iBizPqlEditor>
      </div>
    );
  },
});
