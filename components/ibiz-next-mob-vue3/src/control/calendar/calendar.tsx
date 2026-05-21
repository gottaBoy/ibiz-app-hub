import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  Ref,
  ref,
  VNode,
  watch,
  PropType,
  computed,
  defineComponent,
} from 'vue';
import { ILayoutPanel, ISysCalendar } from '@ibiz/model-core';
import {
  IControlProvider,
  ICalendarItemData,
  CalendarController,
} from '@ibiz-template/runtime';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import isBetween from 'dayjs/plugin/isBetween';
import VueHashCalendar from 'vue3-hash-calendar';
import 'vue3-hash-calendar/es/index.css';
import { getCurSelectDayDate, getCurSelectMonthDate } from './date-util';
import { usePopstateListener } from '../../util';
import './calendar.scss';

dayjs.extend(isBetween);

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

    // 当前日历显示类型
    const currentType = ref(c.model.calendarStyle);

    /**
     * 无限滚动元素
     */
    const infiniteScroll = ref<HTMLDivElement>();

    /**
     * 禁用加载更多
     */
    const disabledLodeMore = computed(() => {
      if (c.model.calendarStyle !== 'TIMELINE' || c.state.isLoading)
        return true;
      const result = !Object.values(c.loadMoreItems).some(
        item => item.curPage < item.totalPage,
      );
      return result;
    });

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

    const dateChange = async (newDate: Date) => {
      c.state.selectedDate = newDate;
      await loadData(c.state.selectedDate);
      const items = markDateItems.value[dayjs(newDate).format('YYYY-MM')];
      // 加载过当前月份的marker则不加载
      if (items) return;
      await loadMarkerData(c.state.selectedDate);
    };

    /**
     * @description 处理滚动加载
     * @returns {*}  {Promise<void>}
     */
    const handleScrollLoad = async (): Promise<void> => {
      if (!infiniteScroll.value || disabledLodeMore.value) return;
      const scrollTop = infiniteScroll.value.scrollTop;
      const scrollHeight = infiniteScroll.value.scrollHeight;
      const clientHeight = infiniteScroll.value.clientHeight;
      // 滚动到底部加载更多
      if (scrollHeight - scrollTop - clientHeight < 10)
        await c.load({ isLoadMore: true });
    };

    watch(
      () => c.state.selectedDate,
      (newVal: Date | undefined, oldVal: Date | undefined) => {
        if (
          newVal &&
          dayjs(newVal).format('YYYY-MM-DD') !==
            dayjs(oldVal).format('YYYY-MM-DD')
        ) {
          calendar.value?.reset(c.state.selectedDate);
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

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

    /**
     * @description 通过日期计算标记
     * @param {IData} time
     */
    const calcMarkerByDate = (time: IData) => {
      const date = dayjs()
        .set('year', time.year)
        .set('month', time.month)
        .set('date', time.day);
      // 根据时间范围过滤
      const markers: ICalendarItemData[] = Object.values(markDateItems.value)
        .flat()
        .filter(item =>
          date.isBetween(item.beginTime, item.endTime, 'D', '[]'),
        );
      // 相同类型的只要一条
      const map: Map<string, ICalendarItemData> = new Map();
      markers.forEach(item => {
        if (!map.has(item.itemType)) map.set(item.itemType, item);
      });
      return Array.from(map.values());
    };

    /**
     * 滑动方向变化
     *
     * @param {('left' | 'right' | 'up' | 'down')} direction
     */
    const handleSlidechange = (direction: 'left' | 'right' | 'up' | 'down') => {
      if (currentType.value === 'WEEK') {
        if (direction === 'left') {
          // 跳到下一周（7天后）, 不能直接调用内置的上一周方法，如果跨月，同样会出现时间计算错误问题，需要自己计算时间，通过重置时间方法进行触发自动定位跳转
          const nextweek = dayjs(c.state.selectedDate).add(7, 'day');
          // 延迟执行，需要等动画执行完毕后再设置时间，触发自动定位，不然还是会显示异常
          setTimeout(() => {
            calendar.value.reset(nextweek.toDate());
          }, 500);
        }
        if (direction === 'right') {
          // 上一周，同上不能使用默认的问题，需要自己计算时间，通过时间定位方法进行跳转
          const lastweek = dayjs(c.state.selectedDate).subtract(7, 'day');
          setTimeout(() => {
            calendar.value.reset(lastweek.toDate());
          }, 500);
        }
      }
    };

    /**
     * 日历展示类型切换
     *
     * @param {string} type
     */
    const onCalendarTypeChange = (type: string) => {
      currentType.value = type.toUpperCase();
    };

    return {
      c,
      ns,
      visible,
      calendar,
      loadItems,
      currentDate,
      infiniteScroll,
      disabledLodeMore,
      currentType,
      toDay,
      onCustom,
      onConfirm,
      dateChange,
      closeDrawer,
      calcItemStyle,
      handleScrollLoad,
      calcMarkerByDate,
      handleSlidechange,
      onCalendarTypeChange,
    };
  },
  render() {
    const renderMarker = (date: IData): VNode[] => {
      const markers = this.calcMarkerByDate(date);
      return markers.map(item => {
        const style = this.calcItemStyle(item);
        return (
          <div
            style={style}
            class={[
              this.ns.em('mark', 'item'),
              this.ns.em('mark', item.itemType),
            ]}
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
        this.ns.bm('item', 'panel'),
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
    const renderDefaultItem = (
      item: ICalendarItemData,
      isLink: boolean = true,
    ): VNode => {
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
          is-link={isLink}
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
        <div
          class={this.ns.b('header-toolbar')}
          onClick={evt => evt.stopPropagation()}
        >
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

    // 绘制默认日历内容
    const renderCalendarContent = (): VNode[] => {
      return [
        <div class={this.ns.b('content')}>
          <VueHashCalendar
            ref='calendar'
            pickerType='date'
            onChange={date => this.dateChange(date)}
            default-datetime={this.c.state.selectedDate}
            scroll-change-date={this.currentType !== 'WEEK'} // 周的时候滑动不改变值
            show-week-view={this.c.model.calendarStyle === 'WEEK'}
            onSlidechange={this.handleSlidechange}
            onCalendarTypeChange={this.onCalendarTypeChange}
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
        </div>,
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
                <van-tab
                  title={label}
                  title-class={this.ns.be('footer', 'tab-item')}
                  title-style={{
                    [`--${this.ns.b()}-tab-bg`]: calendarItem.bkcolor,
                  }}
                >
                  <van-list>
                    {renderCalendarListByItemType(calendarItem.itemType!)}
                  </van-list>
                </van-tab>
              );
            })}
          </van-tabs>
        </div>,
        <van-popup
          close-on-popstate={true}
          v-model:show={this.visible}
          style={{ height: 'auto' }}
          teleport='body'
          position='bottom'
        >
          <van-date-picker
            v-model={this.currentDate}
            onConfirm={this.onConfirm}
            onCancel={this.closeDrawer}
            title={ibiz.i18n.t('control.calendar.pickerDate')}
          />
        </van-popup>,
      ];
    };

    // 绘制时光轴
    const renderTimeLine = (): VNode | undefined => {
      if (this.c.state.items.length === 0) return renderNoData();
      const groupMap = new Map<string | number, ICalendarItemData[]>();
      const groups: IData[] = [];

      this.c.state.items.forEach(item => {
        const value = item[this.c.groupTimeField];
        if (value) {
          if (!groupMap.has(value)) groupMap.set(value, []);
          groupMap.get(value)!.push(item);
        }
      });

      groupMap.forEach((children, key) => {
        groups.push({
          key: `${key}`,
          caption: key
            ? dayjs(key).format(this.c.timelineCaptionFormat)
            : `${key}`,
          children,
        });
      });

      return (
        <div
          ref='infiniteScroll'
          class={this.ns.b('timeline')}
          onScroll={debounce(this.handleScrollLoad, 300)}
        >
          {groups.map(item => {
            return (
              <div class={this.ns.be('timeline', 'item')}>
                <div class={this.ns.bem('timeline', 'item', 'timespan')}>
                  {item.caption}
                </div>
                {item.children.map((child: ICalendarItemData) => {
                  const model = this.c.model.sysCalendarItems?.find(
                    (calendarItems: IData) => {
                      return child.itemType === calendarItems.itemType;
                    },
                  );
                  const style: IData = {};
                  if (model?.bkcolor) {
                    Object.assign(style, {
                      [`--${this.ns.b()}-timeline-item-bg-color`]:
                        model.bkcolor,
                    });
                  }
                  return (
                    <div
                      class={this.ns.bem('timeline', 'item', 'content')}
                      style={style}
                    >
                      {model?.layoutPanel
                        ? renderPanelItem(child, model.layoutPanel)
                        : renderDefaultItem(child, false)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      this.c.state.isCreated && (
        <iBizControlBase controller={this.c}>
          {this.c.model.calendarStyle === 'TIMELINE'
            ? renderTimeLine()
            : renderCalendarContent()}
        </iBizControlBase>
      )
    );
  },
});
