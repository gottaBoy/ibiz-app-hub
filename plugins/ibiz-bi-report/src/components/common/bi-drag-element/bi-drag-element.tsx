/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  h,
  ref,
  Ref,
  watch,
  PropType,
  nextTick,
  onMounted,
  onUnmounted,
  defineComponent,
  computed,
} from 'vue';
import {
  IModal,
  IOverlayPopoverContainer,
  UIActionUtil,
  getUIActionById,
} from '@ibiz-template/runtime';
import { IAppDEUIAction } from '@ibiz/model-core';
import { NOOP, RuntimeError, listenJSEvent } from '@ibiz-template/core';
import draggable from 'vuedraggable';
import { createUUID } from 'qx-util';
import { useNamespace } from '../../../use';
import { BIReportDesignController } from '../../../controller';
import { FilterItem } from '../filter-item/filter-item';
import { BITimeSelect } from '../bi-time-select/bi-time-select';
import { calcUIActionTag, getSchemaField, isDate } from '../../../util';
import './bi-drag-element.scss';
import { biReportT } from '../../../locale';
import { AppBIPeriodData, ISchemaField } from '../../../interface';
import { BIAggmodeSelect } from '../bi-aggmode-select/bi-aggmode-select';
import { aggModeList } from '../../../util/constant-data';
import { extendData } from '../../../config';
import { BISort } from '../bi-sort/bi-sort';
import { BIAxis } from '../bi-axis/bi-axis';
import { BIChartCordon } from '../bi-chart-cordon/bi-chart-cordon';

export default defineComponent({
  name: 'BIDragElement',
  components: {
    draggable,
    'bi-aggmode-select': BIAggmodeSelect,
  },
  props: {
    controller: {
      type: Object as PropType<BIReportDesignController>,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    caption: {
      type: String,
      default: '',
    },
    subCaption: {
      type: String,
      default: '',
    },
    type: {
      type: String as PropType<
        'measure' | 'dimension' | 'period' | 'filter' | 'group'
      >,
      default: 'measure',
    },
    value: {
      type: Array<IData>,
      default: () => [],
    },
    actions: {
      type: Array<IData>,
      default: () => [],
    },
    expandActions: {
      type: Array<IData>,
      default: () => [],
    },
    error: {
      type: Object as PropType<IData>,
    },
  },
  emits: ['change', 'extendChange'],
  setup(props, { emit }) {
    const ns = useNamespace('drag-element');
    const items: Ref<IData[]> = ref([]);
    const dragTarget: Ref<IData | null> = ref(null);
    const editorValue = ref(); // 编辑时文本框的值
    const editorItem = ref(); // 被编辑的项
    const inputRef = ref(); // 文本框Ref
    // 行为pop相关参数
    const actionPop = ref({
      visible: false,
      currentId: '',
    });

    // 用于拖拽分组
    const uuid = createUUID();
    /**
     * 行为ref
     */
    const actionRef = ref();
    /**
     * 行为是否正在处理
     */
    const processing = ref(false);
    /**
     * 气泡弹窗容器
     */
    let overlay: IOverlayPopoverContainer | null = null;
    /**
     * 回调
     */
    let cleanup = NOOP;

    /**
     * 界面模型
     */
    const uiActions: Ref<Map<string, IAppDEUIAction>> = ref(new Map());

    // 显示同类型拖拽框
    const showDrag = ref(false);

    // 允许被其他行为关闭的行为
    const allowCloseAction = ['SORT', 'AXIS'];

    // 正在执行的行为
    const doingAction = ref();

    // 属性值
    const propertyData = computed(() => {
      return props.controller.state.propertyData;
    });

    const getAppID = (): string => {
      return props.controller.context.srfappid || ibiz.env.appId;
    };

    /**
     * 初始化界面行为
     *
     */
    const initUIActions = async () => {
      for (let index = 0; index < items.value.length; index++) {
        const item = items.value[index];
        if (!uiActions.value.has(item.codename)) {
          item.parampsdeuiactiontag = await calcUIActionTag(item, getAppID());
          if (item.parampsdeuiactiontag) {
            const action = await getUIActionById(
              item.parampsdeuiactiontag,
              getAppID(),
            );
            if (action) {
              uiActions.value.set(item.codename, action);
            }
          }
        }
      }
    };

    // 检查是否为允许拖入的类型(指的是纬度和指标)
    const checkType = (targetItem: IData | null) => {
      if (!targetItem || targetItem.dragTypes.indexOf(props.type) < 0) {
        return {
          ok: false,
          msg: '',
        };
      }
      return {
        ok: true,
        msg: '',
      };
    };

    // 检查校验状态
    const checkState = () => {
      // 后续可根据需要补充其他校验条件，暂时只校验是否超出个数限制
      // 后续还有其他校验规则的，根据顺序依次检测并返回第一个未通过的校验
      const res = props.controller!.verifyErrorState(
        props.type,
        items.value,
        ['MAXLIMIT', 'TYPELIMIT'],
        {
          targetItem: dragTarget.value,
        },
      );
      return res;
    };

    /**
     * 是否允许拖拽进入
     *
     * @param {IData} targetItem 当前拖拽的目标
     * @return {*}  {boolean} 是否允许放入
     */
    const verificationFunc = (targetItem: IData | null): Boolean => {
      // 超出限制个数不再允许拖入,类型不同不允许拖入
      const res = props.controller!.verifyErrorState(
        props.type,
        items.value,
        ['MAXLIMIT', 'TYPELIMIT'],
        {
          targetItem,
        },
      );
      return res.ok && checkType(targetItem).ok;
    };

    /**
     * 过滤条件改变
     * @param {IFilterNodeField} condition
     */
    const onFilterChange = (item: IData, condition: IData) => {
      actionPop.value.visible = false;
      item.condition = condition;
      emit('change', items.value);
    };

    /**
     * 处理事件源
     *
     * @param {*} event
     * @return {*}
     */
    const handleEvent = (event: MouseEvent): MouseEvent => {
      const e = { ...event };
      e.target = event.currentTarget;
      return e;
    };

    /**
     * 时间配置改变
     *
     * @param {IData} item
     * @param {IData} config
     */
    const onConfigChange = (
      item: IData,
      value: IData,
      field: ISchemaField | undefined,
    ) => {
      actionPop.value.visible = false;
      if (props.type === 'period' && field) {
        // 同环比抛值
        const tempValue = {
          ...value,
          field: field.appDEFieldId,
          yoy: 1,
          pop: 1,
        };
        item.value = tempValue;
        emit('change', items.value);
      } else {
        // 其他时间维度抛值
        emit('extendChange', `${extendData.PERIOD}@${item.codename}`, value);
      }
    };

    /**
     * 更新过滤项时间类型
     *
     * @param {IData} item
     * @param {('DYNAMIC' | 'STATIC')} type
     */
    const onMateChange = (item: IData, type: 'DYNAMIC' | 'STATIC') => {
      item.dateType = type;
    };

    /**
     * 打开过滤气泡
     * @param {MouseEvent} event
     * @param {IData} item
     */
    const onOpenFilterPopover = async (event: MouseEvent, item: IData) => {
      const field = await getSchemaField(
        item,
        props.controller.state.schemaFields,
        getAppID(),
      );
      if (field) {
        overlay = ibiz.overlay.createPopover(
          (modal: IModal) =>
            h(FilterItem, {
              field,
              modal,
              condition: item.condition,
              type: item.dateType,
              context: props.controller.context,
              params: props.controller.viewParams,
              onChange: filter => onFilterChange(item, filter),
              onMateChange: (type: 'DYNAMIC' | 'STATIC') =>
                onMateChange(item, type),
            }),
          undefined,
          {
            placement: 'right',
            autoClose: true,
            noArrow: true,
            width: 400,
          },
        );
        await overlay.present(event.target as HTMLElement);
        await overlay.onWillDismiss();
        overlay = null;
      } else {
        ibiz.message.error(
          biReportT('schemaNotFound', { codename: item.codename }),
        );
      }
    };

    // 打开配置气泡框
    const onOpenConfigPopover = async (event: MouseEvent, item: IData) => {
      let tempValue = item.value;
      if (props.type === 'dimension') {
        tempValue = propertyData.value.extend[`period@${item.codename}`];
      }
      const field = await getSchemaField(
        item,
        props.controller.state.schemaFields,
        getAppID(),
      );
      overlay = ibiz.overlay.createPopover(
        (modal: IModal) =>
          h(BITimeSelect, {
            value: tempValue,
            context: props.controller.context,
            params: props.controller.viewParams,
            modal,
            onChange: (value: AppBIPeriodData) =>
              onConfigChange(item, value, field),
          }),
        undefined,
        {
          placement: 'right',
          autoClose: true,
          noArrow: true,
          width: 400,
        },
      );
      await overlay.present(event.target as HTMLElement);
      await overlay.onWillDismiss();
      overlay = null;
    };

    // 抛出排序事件
    const onSortChange = (name: string, value: string | null) => {
      emit('extendChange', `${extendData.SORT}@${name}`, value);
    };

    // 警戒线改变
    const onCordonChange = (item: IData, value: Array<IData>) => {
      emit('extendChange', `${extendData.CORDON}@${item.codename}`, value);
    };

    // 应用轴改变
    const onAxisChange = (item: IData, value: string) => {
      emit('extendChange', `${extendData.AXIS}@${item.codename}`, value);
    };

    // 打开排序配置气泡
    const onOpenSortPopover = async (event: MouseEvent, item: IData) => {
      overlay = ibiz.overlay.createPopover(
        (modal: IModal) =>
          h(BISort, {
            value: propertyData.value.extend,
            dimension: item,
            measures: propertyData.value.data.measure,
            modal,
            onChange: (name: string, value: string | null) =>
              onSortChange(name, value),
          }),
        undefined,
        {
          placement: 'right',
          autoClose: true,
          noArrow: false,
          width: 250,
        },
      );
      await overlay.present(event.target as HTMLElement);
      await overlay.onWillDismiss();
      overlay = null;
    };

    // 打开设置警戒线的模态
    const onOpenSetCordonModal = async (event: MouseEvent, item: IData) => {
      overlay = ibiz.overlay.createModal(
        (modal: IModal) =>
          h(BIChartCordon, {
            value: propertyData.value.extend[`cordon@${item.codename}`],
            modal,
            onCordonChange: (value: Array<IData>) =>
              onCordonChange(item, value),
          }),
        undefined,
        {
          width: 660,
          modalClass: ns.e('cordon'),
          footerHide: true,
        },
      );
      // 此处直接关闭行为列表
      actionPop.value.visible = false;
      await overlay.present(event.target as HTMLElement);
      await overlay.onWillDismiss();
      overlay = null;
    };

    // 打开应用轴设置气泡框
    const onOpenAxisPopover = async (event: MouseEvent, item: IData) => {
      overlay = ibiz.overlay.createPopover(
        (modal: IModal) =>
          h(BIAxis, {
            value: propertyData.value.extend[`axis@${item.codename}`],
            modal,
            onChange: (value: string) => onAxisChange(item, value),
          }),
        undefined,
        {
          placement: 'right',
          autoClose: true,
          noArrow: false,
          width: 250,
        },
      );
      await overlay.present(event.target as HTMLElement);
      await overlay.onWillDismiss();
      overlay = null;
    };

    // 计算时间范围编辑器模型
    const conputedDateRangeModel = (_item: IData) => {
      return {
        dataType: 25,
        enableCond: 3,
        labelPos: 'NONE',
        noPrivDisplayMode: 1,
        editor: {
          editorType: 'DATERANGE_SWITCHUNIT',
          valueType: 'SIMPLE',
          editable: true,
          id: 'srfperiod',
          appId: getAppID(),
        },
        allowEmpty: false,
        codeName: 'srfperiod',
        fieldName: 'srfperiod',
        detailStyle: 'DEFAULT',
        detailType: 'FORMITEM',
        layoutPos: {
          colMD: 24,
          layout: 'TABLE_24COL',
          appId: getAppID(),
        },
        id: 'srfperiod',
        appId: getAppID(),
      };
    };

    // 计算合并时间配置
    const computedMergeDateConfig = (item: IData) => {
      // 是纬度项且是时间
      if (props.type === 'dimension' && isDate(item.stddatatype)) {
        return {
          srfperiod: propertyData.value.extend[`period@${item.codename}`],
          customeditormodel: conputedDateRangeModel(item),
        };
      }
    };

    // 执行界面行为
    const doUIAction = async (event: MouseEvent, item: IData) => {
      const params: any = {
        event,
        data: [item],
        context: props.controller.context,
        params: {
          ...props.controller.viewParams,
          ...JSON.parse(item.birepitemparams || '{}'),
          ...computedMergeDateConfig(item),
        },
      };
      const result = await UIActionUtil.exec(
        item.parampsdeuiactiontag,
        params,
        getAppID(),
      );
      if (!result.cancel && result.data) {
        actionPop.value.visible = false;
        if (
          props.type === 'dimension' &&
          isDate(item.stddatatype) &&
          result.data[0].srfperiod
        ) {
          // 时间维度抛值
          emit(
            'extendChange',
            `${extendData.PERIOD}@${item.codename}`,
            result.data[0].srfperiod,
          );
          delete result.data[0].srfperiod;
        }
        item.birepitemparams = JSON.stringify(result.data[0]);
        emit('change', items.value);
      }
    };

    // 处理拖入项默认配置
    const handleItemDefaultConfig = (item: IData) => {
      if (props.type === 'dimension' && isDate(item.stddatatype)) {
        // 纬度时间项默认设值
        const tempValue = {
          unit: 'DAY',
          type: 'DYNAMIC',
          start: -7,
          end: 0,
        };
        emit(
          'extendChange',
          `${extendData.PERIOD}@${item.codename}`,
          tempValue,
        );
      }
    };

    // 拖拽放入事件
    const onDrop = async (_e: Event) => {
      const item = dragTarget.value;
      const checkResult = verificationFunc(item);
      if (!checkResult) return;
      const index = items.value.findIndex((_item: IData) => {
        const tempid =
          _item.pssysbicubedimensionid || _item.pssysbicubemeasureid;
        const tempDragItemId =
          item!.pssysbicubedimensionid || item!.pssysbicubemeasureid;
        return tempid && tempid === tempDragItemId;
      });
      let tempItems = [...items.value];
      if (item && index < 0) {
        if (props.type === 'period') {
          // 同环比特殊设置
          const field = await getSchemaField(
            item,
            props.controller.state.schemaFields,
            getAppID(),
          );
          if (field) {
            item.value = {
              field: field.appDEFieldId,
              unit: 'DAY',
              type: 'DYNAMIC',
              start: -7,
              end: 0,
              pop: 1,
              yoy: 1,
            };
          }
        }
        if (!props.multiple) {
          tempItems = [item!];
          if (items.value.length) {
            // 清空aggmode
            emit(
              'extendChange',
              `${extendData.AGGMODE}@${items.value[0].codename}`,
              null,
            );
            // 清空之前时间项的时间配置
            emit(
              'extendChange',
              `${extendData.PERIOD}@${items.value[0].codename}`,
              null,
            );
          }
        } else {
          tempItems.push(item!);
        }
        handleItemDefaultConfig(item);
        emit('change', tempItems);
        // 如果是过滤需默认打开过滤气泡
        if (props.type === 'filter') {
          setTimeout(() => {
            if (actionRef.value) {
              onOpenFilterPopover(
                { target: actionRef.value } as MouseEvent,
                item!,
              );
            }
          }, 0);
        }
      }
      dragTarget.value = null;
    };

    // 删除按钮
    const onDelete = (item: IData) => {
      actionPop.value.currentId = '';
      const index = items.value.findIndex((_item: IData) => {
        const tempid =
          _item.pssysbicubedimensionid || _item.pssysbicubemeasureid;
        const tempDragItemId =
          item.pssysbicubedimensionid || item.pssysbicubemeasureid;
        return tempid && tempid === tempDragItemId;
      });
      if (index > -1) {
        items.value.splice(index, 1);
      }
      emit('extendChange', `${extendData.AGGMODE}@${item.codename}`, null);
      emit('extendChange', `${extendData.PERIOD}@${item.codename}`, null);
      emit('extendChange', `${extendData.SORT}@${item.codename}`, null);
      emit('extendChange', `${extendData.CORDON}@${item.codename}`, null);
      emit('extendChange', `${extendData.AXIS}@${item.codename}`, null);
      emit('change', items.value);
    };

    // 绘制项图标
    const renderIcon = (item: IData) => {
      if (props.type === 'measure') {
        if (item.bimeasuretype === 'COMMON') {
          return (
            <svg
              class={ns.em('content', 'item-icon-com')}
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              focusable='false'
              fill='currentColor'
            >
              <g id='alzeditor/hashtag' stroke-width='1' fill-rule='evenodd'>
                <path
                  d='M4.236 9.9l.422-3.8H2.6a.6.6 0 1 1 0-1.2h2.19l.372-3.347a.6.6 0 1 1 1.192.133L5.998 4.9h4.793l.37-3.347a.6.6 0 0 1 1.193.133L11.998 4.9h2.459a.6.6 0 0 1 0 1.2h-2.592l-.421 3.8h2.013a.6.6 0 0 1 0 1.2H11.31l-.374 3.368a.6.6 0 0 1-1.192-.132l.358-3.236H5.311l-.374 3.368a.6.6 0 0 1-1.192-.132l.358-3.236H1.6a.6.6 0 0 1 0-1.2h2.636zm1.208 0h4.792l.422-3.8H5.865l-.421 3.8z'
                  id='alz形状结合'
                ></path>
              </g>
            </svg>
          );
        }
        return (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g id='aljeditor/formula' stroke-width='1' fill-rule='evenodd'>
              <path
                d='M12.663 11.027c-.117.142-.25.318-.4.527.09.88.404 1.722.913 2.446a.807.807 0 0 0 .951.051c.212-.071.317.313 0 .494a2.582 2.582 0 0 1-2.376.185 2.786 2.786 0 0 1-.918-1.726c-.101.152-.177.27-.223.346-.05.08-.121.194-.215.34a5.11 5.11 0 0 1-.776.993 1.134 1.134 0 0 1-.787.3.82.82 0 0 1-.832-.852 1.058 1.058 0 0 1 1.085-1.113c.176 0 .352.021.522.066.167.045.324.094.471.147a2.69 2.69 0 0 0 .264-.271c.129-.15.25-.305.362-.467-.15-.602-.31-1.287-.527-2.038a.869.869 0 0 0-1.281-.585c-.259.118-.388-.329.094-.529.447-.184 2.482-1.047 2.941.8.075.303.144.597.212.885l.246-.38c.085-.13.157-.246.218-.346.213-.368.476-.704.781-1 .214-.194.492-.301.781-.3a.8.8 0 0 1 .594.239.84.84 0 0 1 .238.619c.015.3-.1.59-.314.8a1.075 1.075 0 0 1-.767.3 2.1 2.1 0 0 1-.535-.069 5.572 5.572 0 0 1-.456-.138 1.662 1.662 0 0 0-.266.276zM7.223 5.4H8.5a.6.6 0 1 1 0 1.2H6.928c-.236 1.116-.614 3-.573 2.8-.105.506-.198.919-.297 1.318-.17.677-.36 1.312-.604 1.999-.587 1.652-1.397 2.363-2.395 2.363-.146 0-.283-.009-.412-.027-.627-.087-1.061-.549-1.305-1.273a.6.6 0 0 1 1.137-.383c.112.334.224.452.334.468.072.01.154.015.246.015.432 0 .833-.352 1.264-1.565.23-.65.41-1.248.57-1.889.096-.38.185-.778.287-1.27-.04.193.285-1.423.522-2.556H4.5a.6.6 0 1 1 0-1.2h1.472c.456-1.698 1.376-3.494 2.285-4.009.84-.476 1.634-.401 2.159.29a.6.6 0 0 1-.955.726c-.124-.163-.254-.175-.612.028-.51.289-1.218 1.642-1.627 2.965z'
                id='alj形状结合'
              ></path>
            </g>
          </svg>
        );
      }
      if (item.bidimensiontype === 'COMMON') {
        return (
          <svg
            class={ns.em('content', 'item-icon-fx')}
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='bbd1.Base基础/1.icon图标/2.normal/View-report-fill'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M9 1.2v4.974h1V3.2h2v2.974h1.5a1.5 1.5 0 0 1 1.5 1.5v5.784a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5V7.674a1.5 1.5 0 0 1 1.5-1.5H4V3.2h2v2.974h1V1.2h2zM6 6.636H4v4.038h2V6.636zm1 4.038h2V6.636H7v4.038zm5-4.053h-2v4.053h2V6.621z'
                id='bbd形状结合'
              ></path>
            </g>
          </svg>
        );
      }
      return (
        <svg
          class={ns.em('content', 'item-icon-fx')}
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
          fill='currentColor'
        >
          <g id='alheditor/formula' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M12.663 11.027c-.117.142-.25.318-.4.527.09.88.404 1.722.913 2.446a.807.807 0 0 0 .951.051c.212-.071.317.313 0 .494a2.582 2.582 0 0 1-2.376.185 2.786 2.786 0 0 1-.918-1.726c-.101.152-.177.27-.223.346-.05.08-.121.194-.215.34a5.11 5.11 0 0 1-.776.993 1.134 1.134 0 0 1-.787.3.82.82 0 0 1-.832-.852 1.058 1.058 0 0 1 1.085-1.113c.176 0 .352.021.522.066.167.045.324.094.471.147a2.69 2.69 0 0 0 .264-.271c.129-.15.25-.305.362-.467-.15-.602-.31-1.287-.527-2.038a.869.869 0 0 0-1.281-.585c-.259.118-.388-.329.094-.529.447-.184 2.482-1.047 2.941.8.075.303.144.597.212.885l.246-.38c.085-.13.157-.246.218-.346.213-.368.476-.704.781-1 .214-.194.492-.301.781-.3a.8.8 0 0 1 .594.239.84.84 0 0 1 .238.619c.015.3-.1.59-.314.8a1.075 1.075 0 0 1-.767.3 2.1 2.1 0 0 1-.535-.069 5.572 5.572 0 0 1-.456-.138 1.662 1.662 0 0 0-.266.276zM7.223 5.4H8.5a.6.6 0 1 1 0 1.2H6.928c-.236 1.116-.614 3-.573 2.8-.105.506-.198.919-.297 1.318-.17.677-.36 1.312-.604 1.999-.587 1.652-1.397 2.363-2.395 2.363-.146 0-.283-.009-.412-.027-.627-.087-1.061-.549-1.305-1.273a.6.6 0 0 1 1.137-.383c.112.334.224.452.334.468.072.01.154.015.246.015.432 0 .833-.352 1.264-1.565.23-.65.41-1.248.57-1.889.096-.38.185-.778.287-1.27-.04.193.285-1.423.522-2.556H4.5a.6.6 0 1 1 0-1.2h1.472c.456-1.698 1.376-3.494 2.285-4.009.84-.476 1.634-.401 2.159.29a.6.6 0 0 1-.955.726c-.124-.163-.254-.175-.612.028-.51.289-1.218 1.642-1.627 2.965z'
              id='alh形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    // 点击行为
    const onAction = async (evt: MouseEvent, id: string, item: IData) => {
      // 界面行为正在处理时不重复触发其他行为
      if (
        !processing.value ||
        (doingAction.value && allowCloseAction.includes(doingAction.value))
      ) {
        await overlay?.dismiss();
        const event = handleEvent(evt);
        processing.value = true;
        try {
          doingAction.value = id;
          switch (id) {
            case 'UPDATE':
              editorItem.value = item;
              editorValue.value =
                item.pssysbicubemeasurename || item.pssysbicubedimensionname;
              nextTick(() => {
                inputRef.value.focus();
              });
              break;
            case 'REMOVE':
              onDelete(item);
              break;
            case 'FILTER':
              await onOpenFilterPopover(event, item);
              break;
            case 'CONFIG':
              await onOpenConfigPopover(event, item);
              break;
            case 'SORT':
              await onOpenSortPopover(event, item);
              break;
            case 'CORDON':
              await onOpenSetCordonModal(event, item);
              break;
            case 'AXIS':
              await onOpenAxisPopover(event, item);
              break;
            default:
              await doUIAction(event, item);
          }
        } catch (error) {
          throw new RuntimeError(error as string);
        } finally {
          processing.value = false;
        }
      }
    };

    /**
     * 绘制界面行为
     *
     * @param {IData} item
     */
    const renderUIAction = (item: IData) => {
      if (uiActions.value.has(item.codename)) {
        const action = uiActions.value.get(item.codename)!;
        return (
          <div
            class={ns.em('actions', `group-item`)}
            onPointerup={evt => onAction(evt, action.uiactionTag!, item)}
          >
            {action.sysImage && <iBizIcon icon={action.sysImage}></iBizIcon>}
            <span>{action.caption}</span>
          </div>
        );
      }
    };

    // 绘制行为列表
    const renderAction = (
      action: IData,
      item: IData,
      style: 'group' | 'expand' = 'group',
    ) => {
      let icon = (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
        >
          <g
            id='baxnormal/vertical-view-lines'
            stroke-width='1'
            fill-rule='evenodd'
          >
            <path
              d='M4.092 8.854v-2c0-.163-.138-.3-.3-.3-.163 0-.3.137-.3.3v2c0 .163.137.3.3.3.162 0 .3-.137.3-.3zM14.869 7.3a.6.6 0 1 1 0 1.2H5.292v.354c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5V8.5H1.1a.6.6 0 0 1 0-1.2h1.192v-.446c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5V7.3h9.577zm-4.07-3.8v-2c0-.163-.139-.3-.3-.3-.164 0-.3.137-.3.3v2c0 .163.136.3.3.3.161 0 .3-.137.3-.3zm4.07-1.6a.6.6 0 1 1 0 1.2H12v.4c0 .825-.676 1.5-1.5 1.5-.826 0-1.5-.675-1.5-1.5v-.4H1.1a.6.6 0 1 1 0-1.2h7.898v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h2.871zM12.55 14.208v-2c0-.162-.138-.3-.3-.3-.162 0-.3.138-.3.3v2c0 .163.138.3.3.3.162 0 .3-.137.3-.3zm2.319-1.6a.6.6 0 0 1 0 1.201H13.75v.399c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5v-.399H1.1a.6.6 0 0 1 0-1.201h9.65v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h1.119z'
              id='bax形状结合'
            ></path>
          </g>
        </svg>
      );
      let suffixIcon = null;
      if (action.id === 'UPDATE') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
          >
            <g id='aiwaction/edit' stroke-width='1' fill-rule='evenodd'>
              <path
                d='M2 8.34L10.71 0 15 4.17 6.538 13H2V8.34zm1.2.512V11.8h2.826l7.283-7.6-2.606-2.533L3.2 8.852zM0 16v-1.2h16V16H0z'
                id='aiw编辑'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'REMOVE') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g id='azaaction/trash' stroke-width='1' fill-rule='evenodd'>
              <path
                d='M4.002 3.403V1a1 1 0 0 1 1-1h6.003a1 1 0 0 1 1 1v2.403h3.396a.6.6 0 1 1 0 1.2h-1.395V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.603H.6a.6.6 0 1 1 0-1.2h3.4zm8.804 1.205H3.2V14.8h9.605V4.608zM5.202 1.2v2.155h5.603V1.2H5.202zm.6 6.417a.6.6 0 0 1 1.201 0v4.758a.6.6 0 0 1-1.2 0V7.617zm3.202 0a.6.6 0 0 1 1.2 0v4.758a.6.6 0 0 1-1.2 0V7.617z'
                id='aza删除'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'FILTER') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            preserveAspectRatio='xMidYMid meet'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='akp1.Base基础/1.icon图标/2.normal/filter备份'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M1.6 2h12.8a.6.6 0 0 1 0 1.2H1.6a.6.6 0 1 1 0-1.2zm2.5 5.393h7.8a.6.6 0 0 1 0 1.2H4.1a.6.6 0 1 1 0-1.2zm2.5 5.416h2.8a.6.6 0 0 1 0 1.2H6.6a.6.6 0 1 1 0-1.2z'
                id='akp形状结合'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'CONFIG') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            preserveAspectRatio='xMidYMid meet'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='bbhnormal/vertical-view-lines'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M4.092 8.854v-2c0-.163-.138-.3-.3-.3-.163 0-.3.137-.3.3v2c0 .163.137.3.3.3.162 0 .3-.137.3-.3zM14.869 7.3a.6.6 0 1 1 0 1.2H5.292v.354c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5V8.5H1.1a.6.6 0 0 1 0-1.2h1.192v-.446c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5V7.3h9.577zm-4.07-3.8v-2c0-.163-.139-.3-.3-.3-.164 0-.3.137-.3.3v2c0 .163.136.3.3.3.161 0 .3-.137.3-.3zm4.07-1.6a.6.6 0 1 1 0 1.2H12v.4c0 .825-.676 1.5-1.5 1.5-.826 0-1.5-.675-1.5-1.5v-.4H1.1a.6.6 0 1 1 0-1.2h7.898v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h2.871zM12.55 14.208v-2c0-.162-.138-.3-.3-.3-.162 0-.3.138-.3.3v2c0 .163.138.3.3.3.162 0 .3-.137.3-.3zm2.319-1.6a.6.6 0 0 1 0 1.201H13.75v.399c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5v-.399H1.1a.6.6 0 0 1 0-1.201h9.65v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h1.119z'
                id='bbh形状结合'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'SORT') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='avq1.Base基础/1.icon图标/2.normal/sort-positive-sequence'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M4.7 1.068v11.93l2.182-2.18.848.849-3.515 3.515-.582-.583H3.5v-.133l-2.8-2.8.849-.848L3.5 12.77V1.068h1.2zm9.771 8.082v.972l-2.779 3.527h1.711v-1.33H14.6v2.53h-4.558v-1.026l2.725-3.474h-1.57v.921H10V9.15h4.471zM11.791 1l1.11.014 1.474 5.785.938.001V8h-2.62V6.8l.382-.001-.198-.918h-1.354l-.24.918.504.001V8H9.19V6.8l.756-.001L11.792 1zm.478 2.038l-.498 1.898h.904l-.406-1.898z'
                id='avq形状结合'
              ></path>
            </g>
          </svg>
        );
        suffixIcon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='abbnavigation/angle-right'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M7.978 11.498l-.005.005L2.3 5.831 3.13 5l4.848 4.848L12.826 5l.83.831-5.673 5.672-.005-.005z'
                id='abb形状结合'
                transform='rotate(-90 7.978 8.252)'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'CORDON') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='a1.Base基础/1.icon图标/6.chart/Analytical-line'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M3.1,0.9 L3.1,12.9 L16.1,12.9 L16.1,14.1 L3.1,14.1 L3.1,16.1 L1.9,16.1 L1.9,14.1 L-0.1,14.1 L-0.1,12.9 L1.9,12.9 L1.9,0.9 L3.1,0.9 Z M14.4906668,8.9 L14.4906668,10.1 L11.2906668,10.1 L11.2906668,8.9 L14.4906668,8.9 Z M10.4906668,8.9 L10.4906668,10.1 L7.29066679,10.1 L7.29066679,8.9 L10.4906668,8.9 Z M6.49066679,8.9 L6.49066679,10.1 L4.78461538,10.1 L4.78461538,8.9 L6.49066679,8.9 Z M14.4906668,3.9 L14.4906668,5.1 L11.2906668,5.1 L11.2906668,3.9 L14.4906668,3.9 Z M10.4906668,3.9 L10.4906668,5.1 L7.29066679,5.1 L7.29066679,3.9 L10.4906668,3.9 Z M6.49066679,3.9 L6.49066679,5.1 L4.78461538,5.1 L4.78461538,3.9 L6.49066679,3.9 Z'
                id='a形状结合'
              ></path>
            </g>
          </svg>
        );
      } else if (action.id === 'AXIS') {
        icon = (
          <svg
            viewBox='0 0 16 16'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='b1.Base基础/1.icon图标/6.chart/Axis-settings'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M4.1,0.5 L4.099,11.5 L16,11.5 L16,12.7 L13.6,12.7 L13.6,14.9 L12.4,14.9 L12.4,12.7 L10.6,12.7 L10.6,14.9 L9.4,14.9 L9.4,12.7 L7.6,12.7 L7.6,14.9 L6.4,14.9 L6.4,12.7 L4.099,12.7 L4.1,15.7 L2.9,15.7 L2.899,12.7 L0,12.7 L0,11.5 L2.899,11.5 L2.899,9.7 L0.9,9.7 L0.9,8.5 L2.899,8.5 L2.899,6.7 L0.9,6.7 L0.9,5.5 L2.899,5.5 L2.899,3.7 L0.9,3.7 L0.9,2.5 L2.899,2.5 L2.9,0.5 L4.1,0.5 Z'
                id='b形状结合'
              ></path>
            </g>
          </svg>
        );
        suffixIcon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='abbnavigation/angle-right'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M7.978 11.498l-.005.005L2.3 5.831 3.13 5l4.848 4.848L12.826 5l.83.831-5.673 5.672-.005-.005z'
                id='abb形状结合'
                transform='rotate(-90 7.978 8.252)'
              ></path>
            </g>
          </svg>
        );
      }

      return (
        <div
          class={[
            ns.em('actions', `${style}-item`),
            ns.is('delete', action.id === 'REMOVE'),
          ]}
          onPointerup={evt => onAction(evt, action.id, item)}
        >
          {icon}
          <span class={ns.em('actions', 'item-text')}>
            {style === 'group' && action.caption}
            {style === 'expand' && action.id === 'FILTER' && item.condition
              ? 1
              : ''}
          </span>
          {suffixIcon}
        </div>
      );
    };

    // 行为图标点击
    const onActionIconClick = (_event: MouseEvent, id: string) => {
      _event.stopPropagation();
      _event.preventDefault();
      actionPop.value.currentId = id;
      actionPop.value.visible = true;
    };

    // 编辑态失焦
    const onChange = () => {
      if (!editorValue.value) {
        editorItem.value = null;
        return;
      }
      const item = items.value.find((_item: IData) => {
        const tempid =
          _item.pssysbicubedimensionid || _item.pssysbicubemeasureid;
        return (
          tempid === editorItem.value.pssysbicubedimensionid ||
          tempid === editorItem.value.pssysbicubemeasureid
        );
      });
      if (item) {
        if (
          Object.prototype.hasOwnProperty.call(item, 'pssysbicubedimensionname')
        ) {
          item.pssysbicubedimensionname = editorValue.value;
        } else {
          item.pssysbicubemeasurename = editorValue.value;
        }
      }
      editorItem.value = null;
      editorValue.value = '';
      emit('change', items.value);
    };

    // 处理键盘点击
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        onChange();
        // inputRef.value.$el.dispatchEvent(e);
      } else if (e && e.code === 'Escape') {
        e.stopPropagation();
        editorItem.value = null;
        editorValue.value = '';
      }
    };

    // 聚合模式变更
    const onAggModeChange = (item: IData, value: string) => {
      nextTick(() => {
        processing.value = false;
        actionPop.value.visible = false;
        item.aggtype = value;
        emit('extendChange', `${extendData.AGGMODE}@${item.codename}`, value);
      });
    };

    // 绘制计算模式显示文本
    const renderAggmodeText = (item: IData) => {
      // 只管指标
      if (item.bimeasuretype === 'COMMON' || item.aggtype) {
        const tempMode = aggModeList.find(
          _item => _item.value === item.aggtype,
        );
        if (tempMode) {
          return <span class={ns.em('aggmode', 'text')}>{tempMode.name}</span>;
        }
      }
      return null;
    };

    // 绘制指标项后缀
    const renderMeasureItemSuffix = (item: IData) => {
      // aggmode
      const aggmode = renderAggmodeText(item);
      return [aggmode];
    };

    // 绘制纬度项后缀
    const renderDimensionItemSuffix = (item: IData) => {
      // 过滤
      const filter = (
        <div class={ns.e('actions')} ref={actionRef}>
          {props.expandActions.map(action => {
            return renderAction(action, item, 'expand');
          })}
        </div>
      );
      return [filter];
    };

    // 绘制拖入项后缀
    const renderItemSuffix = (item: IData) => {
      // 根据是指标还是维度分开绘制后缀项
      if (item.pssysbicubemeasureid) {
        // 指标
        return renderMeasureItemSuffix(item);
      }
      // 纬度
      return renderDimensionItemSuffix(item);
    };

    // 绘制指标的行为项
    const renderMeasureItemActions = (item: IData) => {
      const actions = [];
      if (item.bimeasuretype === 'COMMON' || item.aggtype) {
        const aggmode = (
          <bi-aggmode-select
            item={item}
            value={item.aggtype}
            onChange={(value: string) => onAggModeChange(item, value)}
          ></bi-aggmode-select>
        );
        actions.push(aggmode);
      }
      return actions;
    };

    // 处理时间配置点击
    const handleTimeConfigClick = (event: MouseEvent, item: IData) => {
      if (props.type === 'dimension') {
        onAction(event, 'CONFIG', item);
      }
    };

    // 绘制维度时间项默认配置
    const renderCommonTimeConfig = (item: IData) => {
      if (props.type === 'dimension') {
        const icon = (
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            preserveAspectRatio='xMidYMid meet'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='bbhnormal/vertical-view-lines'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M4.092 8.854v-2c0-.163-.138-.3-.3-.3-.163 0-.3.137-.3.3v2c0 .163.137.3.3.3.162 0 .3-.137.3-.3zM14.869 7.3a.6.6 0 1 1 0 1.2H5.292v.354c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5V8.5H1.1a.6.6 0 0 1 0-1.2h1.192v-.446c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5V7.3h9.577zm-4.07-3.8v-2c0-.163-.139-.3-.3-.3-.164 0-.3.137-.3.3v2c0 .163.136.3.3.3.161 0 .3-.137.3-.3zm4.07-1.6a.6.6 0 1 1 0 1.2H12v.4c0 .825-.676 1.5-1.5 1.5-.826 0-1.5-.675-1.5-1.5v-.4H1.1a.6.6 0 1 1 0-1.2h7.898v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h2.871zM12.55 14.208v-2c0-.162-.138-.3-.3-.3-.162 0-.3.138-.3.3v2c0 .163.138.3.3.3.162 0 .3-.137.3-.3zm2.319-1.6a.6.6 0 0 1 0 1.201H13.75v.399c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5v-.399H1.1a.6.6 0 0 1 0-1.201h9.65v-.4c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5v.4h1.119z'
                id='bbh形状结合'
              ></path>
            </g>
          </svg>
        );
        return (
          <div
            class={[ns.em('actions', 'group-item')]}
            onPointerup={(event: MouseEvent) =>
              handleTimeConfigClick(event, item)
            }
          >
            {icon}
            <span>{biReportT('configure')}</span>
          </div>
        );
      }
    };

    // 绘制纬度的行为项
    const renderDimensionItemActions = (
      item: IData,
      hasAction: boolean = false,
    ) => {
      const actions = [];
      if (props.type !== 'period' && isDate(item.stddatatype) && !hasAction) {
        // 有界面行为的时候，把时间配置合并到界面行为打开的表单中去
        // 如果同时是时间属性 并且不是同环比，则需要默认添加一个时间选择配置项
        const timePicker = renderCommonTimeConfig(item);
        actions.push(timePicker);
      }

      return actions;
    };

    // 通用的项行为
    const renderCommonActions = (item: IData) => {
      return props.actions.map((action: IData) => {
        return renderAction(action, item);
      });
    };

    // 绘制项行为
    const renderItemActoins = (item: IData) => {
      const actions: Array<JSX.Element | undefined> = [];
      // 界面行为
      // eslint-disable-next-line no-shadow
      const uiActions = renderUIAction(item);
      if (item.pssysbicubemeasureid) {
        // 指标
        actions.push(...renderMeasureItemActions(item));
      } else {
        // 纬度
        actions.push(...renderDimensionItemActions(item, !!uiActions));
      }
      // 默认配置
      const common = renderCommonActions(item);

      return [uiActions, ...actions, ...common];
    };

    // 绘制项内容
    const renderItemText = (item: IData) => {
      const tempid = item.pssysbicubedimensionid || item.pssysbicubemeasureid;
      const itemContent = (
        <div class={ns.em('content', 'item')}>
          <div class={ns.em('content', 'item-icon')}>{renderIcon(item)}</div>
          <div class={ns.em('content', 'text')}>
            {item.pssysbicubemeasurename || item.pssysbicubedimensionname}
          </div>
          {renderItemSuffix(item)}
          <div class={ns.em('content', 'icon')}>
            <el-popover
              visible={
                actionPop.value.visible && tempid === actionPop.value.currentId
              }
              width={200}
              placement='right'
              popper-class={ns.e('actions-pop')}
            >
              {{
                default: () => {
                  return (
                    <div class={ns.e('actions')}>{renderItemActoins(item)}</div>
                  );
                },
                reference: () => {
                  return (
                    <span
                      onPointerup={(event: MouseEvent) =>
                        onActionIconClick(event, tempid)
                      }
                    >
                      <svg
                        viewBox='0 0 16 16'
                        xmlns='http://www.w3.org/2000/svg'
                        height='1em'
                        width='1em'
                        focusable='false'
                        fill='currentColor'
                      >
                        <g
                          id='apr1.Base基础/1.icon图标/2.normal/more-vertical'
                          stroke-width='1'
                          fill-rule='evenodd'
                        >
                          <path
                            d='M8 4.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm0 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm0 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z'
                            id='apr形状结合'
                          ></path>
                        </g>
                      </svg>
                    </span>
                  );
                },
              }}
            </el-popover>
          </div>
        </div>
      );
      const editor = (
        <div class={ns.e('ediotr')}>
          <el-input
            ref={(el: any) => {
              inputRef.value = el;
            }}
            v-model={editorValue.value}
            autofocus
            onKeydown={handleKeyDown}
            onBlur={onChange}
          >
            {{
              prefix: () => {
                return (
                  <span class={ns.em('editor', 'icon')}>
                    {renderIcon(item)}
                  </span>
                );
              },
            }}
          </el-input>
        </div>
      );
      if (
        editorItem.value &&
        (editorItem.value.pssysbicubemeasureid === tempid ||
          editorItem.value.pssysbicubedimensionid === tempid)
      ) {
        return editor;
      }
      return itemContent;
    };

    // 阻止默认事件
    const onDragenter = (e: Event) => {
      e.preventDefault();
    };
    const onDragleave = (e: Event) => {
      e.preventDefault();
    };
    const onDragover = (e: Event) => {
      e.preventDefault();
    };

    // 监听值变化
    watch(
      () => props.value,
      (newVal: IData[] | null) => {
        if (!newVal) {
          items.value = [];
        } else {
          items.value = props.value;
        }
        initUIActions();
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 处理行为气泡外部点击
    const handleOutClick = () => {
      if (!processing.value) {
        actionPop.value.visible = false;
      }
    };

    // 排序移动结束，抛值
    const onMoveEnd = () => {
      emit('change', items.value);
    };

    onMounted(() => {
      // 添加拖拽监听
      props.controller.evt.on('onDragTarget', (target: IData | null) => {
        dragTarget.value = target;
        showDrag.value = checkType(target).ok;
      });
      // 监听键盘关闭pop
      cleanup = listenJSEvent(window, 'keydown', event => {
        if (event.keyCode === 27) {
          overlay?.dismiss();
        }
      });

      window.addEventListener('pointerup', handleOutClick);
    });

    onUnmounted(() => {
      if (cleanup !== NOOP) {
        cleanup();
      }
      overlay?.dismiss();
      window.removeEventListener('pointerup', handleOutClick);
    });
    return {
      ns,
      onDrop,
      onDragenter,
      onDragleave,
      onDragover,
      renderItemText,
      checkType,
      checkState,
      onMoveEnd,
      showDrag,
      items,
      uuid,
    };
  },
  render() {
    const empty = [
      <div
        class={[
          this.ns.e('no-select'),
          this.ns.is('empty_error', this.error && !this.error.ok),
        ]}
      >
        {biReportT('dragIn', { caption: this.caption })}
      </div>,
      <div
        class={[
          this.ns.e('empty'),
          this.ns.is('error', this.error && !this.error.ok),
        ]}
      >
        {this.error?.msg}
      </div>,
    ];
    const content = (
      <draggable
        v-model={this.items}
        draggable={`.${this.ns.e('item')}`}
        filter={`.${this.ns.e('empty')}`}
        onEnd={this.onMoveEnd}
        force-fallback={true}
        chosen-class='chosenClass'
        animation='300'
        group={this.uuid}
        fallback-class={true}
        fallback-on-body={true}
        sort={true}
      >
        {{
          item: (data: IData) => {
            const { element } = data;
            return (
              <div class={this.ns.e('item')}>
                {this.renderItemText(element)}
              </div>
            );
          },
        }}
      </draggable>
    );
    return (
      <div
        class={[this.ns.b()]}
        onDrop={this.onDrop}
        onDragenter={this.onDragenter}
        onDragleave={this.onDragleave}
        onDragover={this.onDragover}
      >
        <div
          class={[
            this.ns.e('content'),
            this.ns.is('draging', this.showDrag),
            this.ns.is('success', this.checkState().ok),
          ]}
        >
          {this.items.length > 0 ? content : empty}
        </div>
        <div
          class={[
            this.ns.e('error-tip'),
            this.ns.is('visible', this.showDrag && !this.checkState().ok),
          ]}
        >
          {this.checkState().msg}
        </div>
      </div>
    );
  },
});
