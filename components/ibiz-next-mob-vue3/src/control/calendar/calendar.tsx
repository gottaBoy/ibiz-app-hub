import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, Ref, ref, VNode } from 'vue';
import { ILayoutPanel, ISysCalendar } from '@ibiz/model-core';
import {
  CalendarController,
  ICalendarItemData,
  IControlProvider,
} from '@ibiz-template/runtime';
import dayjs from 'dayjs';
import VueHashCalendar from 'vue3-hash-calendar';
import 'vue3-hash-calendar/es/index.css';
import { getCurSelectDayDate, getCurSelectMonthDate } from './date-util';
import './calendar.scss';
import { usePopstateListener } from '../../util';

export const CalendarControl = defineComponent({
  name: 'IBizCalendarControl',
  components: {
    VueHashCalendar,
  },
  props: {
    /**
     * @description 日历模型数据
     */
    modelData: { type: Object as PropType<ISysCalendar>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 部件激活模式，值为0：无激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否默认加载数据
     * @default false
     */
    loadDefault: { type: Boolean, default: false },
  },
  setup() {
    const c: CalendarController = useControlController(
      (...args) => new CalendarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const loadItems: Ref<ICalendarItemData[]> = ref([]);

    // 显示底部弹窗
    const visible = ref<boolean>(false);

    // 日历
    const calendar = ref();

    // 弹窗选择时间
    const currentDate = ref();

    // 存储月加载缓存
    const markDateItems: Ref<IData> = ref({});
    //  加载的标记数据

    const loadMarkerItems: Ref<IData[]> = ref([]);

    const setMarkDate = (date: Date) => {
      const copyDate = new Date(date);
      const items = markDateItems.value[dayjs(copyDate).format('YYYY-MM')];
      if (!items) {
        markDateItems.value[dayjs(copyDate).format('YYYY-MM')] = [
          ...loadMarkerItems.value,
        ];
      } else {
        const mergeAndFilter = (arr1: IData[], arr2: IData[]) => {
          // 合并两个数组
          const mergedArray = arr1.concat(arr2);

          // 创建一个 Set 数据结构用于存储已经存在的 id 和 itemType 的组合
          const uniqueCombination = new Set();

          // 过滤出 id 和 itemType 都不重复的数据
          const filteredArray = mergedArray.filter(item => {
            const combination = item.id + item.itemType;
            if (uniqueCombination.has(combination)) {
              return false;
            }
            uniqueCombination.add(combination);
            return true;
          });
          return filteredArray;
        };
        markDateItems.value[dayjs(copyDate).format('YYYY-MM')] = mergeAndFilter(
          markDateItems.value[dayjs(copyDate).format('YYYY-MM')],
          c.state.items,
        );
      }
    };

    const loadMarkerData = async (date: Date) => {
      const param = getCurSelectMonthDate(date);
      loadMarkerItems.value = await c.load({ viewParam: param });
      setMarkDate(c.state.selectedDate);
    };

    const loadData = async (date: Date) => {
      const param = getCurSelectDayDate(date);
      loadItems.value = await c.load({ viewParam: param });
    };

    /**
     * 计算数据项样式
     *
     * @author zk
     * @date 2023-08-08 11:08:29
     * @param {ICalendarItemData} data
     * @return {*}  {IData}
     */
    const calcItemStyle = (data: ICalendarItemData): IData => {
      return {
        color: data.color,
        backgroundColor: data.bkColor,
      };
    };

    /**
     * markerDate实际数据
     *
     * @author zk
     * @date 2023-08-08 11:08:29
     * @param {ICalendarItemData} data
     * @return {*}  {IData}
     */
    const markerData = computed((): IData => {
      // 过滤同一天数据 并且 是不同日历项类型
      const filterSameDayAndUniqueType = (
        itemData: IData,
        index: number,
        arr: IData[],
      ) => {
        const dateString = dayjs(new Date(itemData.beginTime)).format(
          'YYYY-MM-DD',
        );
        // 判断属性 beginTime 是否在同一天 itemType 是否重复
        const isSameDayAndUniqueType =
          arr.findIndex(
            item =>
              dateString ===
                dayjs(new Date(item.beginTime)).format('YYYY-MM-DD') &&
              item.itemType === itemData.itemType,
          ) === index;
        return isSameDayAndUniqueType;
      };

      const date = Object.values(markDateItems.value)
        .flat()
        .filter(filterSameDayAndUniqueType)
        .map(item => {
          const _date = new Date(item.beginTime);
          return {
            date: item.beginTime,
            type: item.itemType,
            day: _date.getDate(),
            month: _date.getMonth(),
            year: _date.getFullYear(),
            data: item,
          };
        });
      return date;
    });

    c.evt.on('onMounted', () => {
      loadMarkerData(c.state.selectedDate || new Date());
      loadData(c.state.selectedDate || new Date());
    });

    const dateChange = (newDate: Date) => {
      c.state.selectedDate = newDate;
      loadData(c.state.selectedDate);
      const items = markDateItems.value[dayjs(newDate).format('YYYY-MM')];
      // 加载过当前月份的marker则不加载
      if (items) {
        return;
      }
      loadMarkerData(c.state.selectedDate);
    };

    // 自定义选择日期
    const onCustom = () => {
      const temptime = dayjs(c.state.selectedDate)
        .format('YYYY-MM-DD')
        .split('-');
      currentDate.value = temptime;
      visible.value = true;
    };

    // 跳转今天
    const toDay = () => {
      calendar.value.today();
    };

    // 确认选择日期
    const onConfirm = () => {
      const date = currentDate.value.join('-');
      const time = new Date(date);
      calendar.value.reset(time);
      visible.value = false;
    };
    const closeDrawer = () => {
      visible.value = false;
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    return {
      c,
      ns,
      markerData,
      loadItems,
      visible,
      calendar,
      currentDate,
      onConfirm,
      calcItemStyle,
      dateChange,
      onCustom,
      toDay,
    };
  },
  render() {
    const renderMarker = (date: IData): VNode[] => {
      const arr = this.markerData.filter(
        (item: IData) =>
          item.day === date.day &&
          item.month === date.month &&
          item.year === date.year,
      );
      return arr.map((item: IData) => {
        const style = this.calcItemStyle(item.data);
        return (
          <div
            class={[this.ns.em('mark', 'item'), this.ns.em('mark', item.type)]}
            style={style}
          ></div>
        );
      });
    };

    // 绘制项布局面板
    const renderPanelItem = (
      item: ICalendarItemData,
      modelData: ILayoutPanel,
    ): VNode => {
      const { context, params } = this.c;
      // 是否选中数据
      const findIndex = this.c.state.selectedData.findIndex(data => {
        return data.deData.srfkey === item.deData.srfkey;
      });
      const itemClass = [
        this.ns.b('item'),
        this.ns.is('active', findIndex !== -1),
      ];
      return (
        <iBizControlShell
          class={itemClass}
          data={item.deData}
          modelData={modelData}
          context={context}
          params={params}
          onClick={(e: MouseEvent): Promise<void> => {
            e.stopPropagation();
            return this.c.onRowClick(item);
          }}
          onDblclick={(e: MouseEvent): Promise<void> => {
            e.stopPropagation();
            return this.c.onDbRowClick(item);
          }}
        ></iBizControlShell>
      );
    };

    // 绘制默认列表项
    const renderDefaultItem = (item: ICalendarItemData): VNode => {
      // 是否选中数据
      const findIndex = this.c.state.selectedData.findIndex(data => {
        return data.deData.srfkey === item.deData.srfkey;
      });
      const itemClass = [
        this.ns.b('item'),
        this.ns.bm('item', 'default'),
        this.ns.is('active', findIndex !== -1),
      ];
      return (
        <van-cell
          class={itemClass}
          key={item.deData.srfkey}
          is-link
          title={item.text || ''}
          onClick={() => this.c.onRowClick(item)}
        ></van-cell>
      );
    };

    const renderNoData = (): VNode | undefined => {
      // 未加载不显示无数据
      const { isLoaded } = this.c.state;
      if (!isLoaded) {
        return;
      }
      return (
        isLoaded && (
          <iBizNoData
            text={this.c.model.emptyText}
            emptyTextLanguageRes={this.c.model.emptyTextLanguageRes}
          ></iBizNoData>
        )
      );
    };

    /**
     * 绘制日历列表
     *
     * @author zk
     * @date 2023-08-08 02:08:34
     * @param {ICalendarItemData[]} items
     * @param {ISysCalendarItem} model
     * @return {*}  {VNode[]}
     */
    const renderCalendarList = (
      items: ICalendarItemData[],
    ): VNode[] | undefined | VNode => {
      if (items.length === 0) {
        return renderNoData();
      }
      return items.map(item => {
        const model = this.c.model.sysCalendarItems?.find(calendarItems => {
          return item.itemType === calendarItems.itemType;
        });
        const panel = model!.layoutPanel;
        return panel ? renderPanelItem(item, panel) : renderDefaultItem(item);
      });
    };

    const renderCalendarListByItemType = (itemType: string) => {
      const list = this.loadItems.filter(item => item.itemType === itemType);
      return renderCalendarList(list);
    };

    // 绘制顶部工具栏
    const renderHeaderToolbar = () => {
      return (
        <div class={this.ns.b('header-toolbar')}>
          <div class={this.ns.be('header-toolbar', 'select-day')}>
            {dayjs(this.c.state.selectedDate).format('YYYY年MM月DD日')}
          </div>
          <div class={this.ns.be('header-toolbar', 'switch-toolbar')}>
            <div
              class={this.ns.bem('header-toolbar', 'switch-toolbar', 'item')}
              onClick={this.onCustom}
            >
              {ibiz.i18n.t('control.calendar.customPicker')}
            </div>
            <div
              class={this.ns.bem('header-toolbar', 'switch-toolbar', 'item')}
              onClick={this.toDay}
            >
              {ibiz.i18n.t('control.calendar.today')}
            </div>
          </div>
        </div>
      );
    };

    return (
      this.c.state.isCreated && (
        <iBizControlBase controller={this.c}>
          <div class={this.ns.b('content')}>
            <VueHashCalendar
              ref='calendar'
              show-week-view={true}
              pickerType='date'
              onChange={date => {
                this.dateChange(date);
              }}
            >
              {{
                day: ({ date }: { extendAttr: IData; date: IData }): VNode => {
                  return (
                    <div class={this.ns.e('day')}>
                      <span>{date?.day}</span>
                      <div class={this.ns.e('mark')}>{renderMarker(date)}</div>
                    </div>
                  );
                },
                action: () => {
                  return renderHeaderToolbar();
                },
              }}
            </VueHashCalendar>
          </div>
          <div class={this.ns.b('footer')}>
            <van-tabs>
              {this.c.model.sysCalendarItems?.map(calendarItem => {
                let label = calendarItem.name!;
                if (calendarItem.nameLanguageRes) {
                  label = ibiz.i18n.t(
                    calendarItem.nameLanguageRes.lanResTag!,
                    calendarItem.name,
                  );
                }
                return (
                  <van-tab title={label}>
                    <van-list>
                      {renderCalendarListByItemType(calendarItem.itemType!)}
                    </van-list>
                  </van-tab>
                );
              })}
            </van-tabs>
          </div>
          <van-popup
            close-on-popstate={true}
            v-model:show={this.visible}
            style={{ height: '70%' }}
            teleport='body'
            position='bottom'
          >
            <van-date-picker
              v-model={this.currentDate}
              onConfirm={this.onConfirm}
              title={ibiz.i18n.t('control.calendar.pickerDate')}
            />
          </van-popup>
        </iBizControlBase>
      )
    );
  },
});
