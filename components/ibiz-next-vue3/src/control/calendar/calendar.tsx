/* eslint-disable no-nested-ternary */
import {
  useUIStore,
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
} from '@ibiz-template/vue3-util';
import {
  ref,
  VNode,
  watch,
  PropType,
  computed,
  defineComponent,
  resolveComponent,
} from 'vue';
import {
  IDETBRawItem,
  ILayoutPanel,
  ISysCalendar,
  IDEToolbarItem,
  IDETBGroupItem,
  ISysCalendarItem,
  IDETBUIActionItem,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  IButtonState,
  IControlProvider,
  ICalendarItemData,
  CalendarController,
  IButtonContainerState,
} from '@ibiz-template/runtime';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import { showTitle } from '@ibiz-template/core';
import { MenuItem } from '@imengyu/vue3-context-menu';
import CustomCalendar from './components/custom-calendar';
import {
  getWeekRange,
  isTimeBetween,
  useCalendarLegend,
} from './calendar-util';
import { useContextMenu } from '../../util';
import './calendar.scss';

export const CalendarControl = defineComponent({
  name: 'IBizCalendarControl',
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
     * @description 部件激活模式，值为0：表示无激活,1：表示单击激活,2：表示双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description  是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 是否默认加载
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c: CalendarController = useControlController(
      (...args) => new CalendarController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const { UIStore } = useUIStore();

    const { getFontColor, getBkColor, getActBdrColors } = useCalendarLegend(ns);

    const calendarRef = ref<IData>();
    const curPopover = ref<IData>();
    const showDateRange = ref(c.controlParams.showmode === 'daterange');
    const showDateList = ref(c.controlParams.showmode === 'expand');

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

    // 月样式图例点击切换显示与隐藏
    const monthLegendClick = (_item: IData): void => {
      Object.assign(_item, { isShow: !_item.isShow });
    };

    const legendItems = ref<IData[]>([]);
    // 存在图例的日历样式
    const legendType = ['DAY', 'WEEK', 'MONTH'];
    // 计算图例样式
    const calcLegend = (): void => {
      legendItems.value = c.state.legends.map((_item, index) => {
        const tempItem = {
          ..._item,
          isShow: true,
        };

        // 没有图例的日历样式不附加默认背景颜色
        if (
          !c.model.calendarStyle ||
          !legendType.includes(c.model.calendarStyle)
        )
          return tempItem;

        // 如果数据源配置了背景色，则边框激活色为主题激活色
        if (!_item.bkcolor) {
          Object.assign(tempItem, {
            bkcolor: getBkColor(index),
            actBdrColor: getActBdrColors(index),
          });
        }
        if (!_item.color)
          Object.assign(tempItem, {
            color: getFontColor(),
          });
        return tempItem;
      });
    };
    watch(
      () => c.state.legends,
      () => {
        calcLegend();
      },
      { deep: true },
    );

    // 适配主题切换
    watch(
      () => UIStore.theme,
      () => {
        calcLegend();
      },
    );

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

    // 气泡框对应显示日期
    const popoverValue = ref('');

    const selectDate = (tag: string): void => {
      if (!calendarRef.value) return;
      calendarRef.value.selectDate(tag);
    };

    // 数据激活时关闭气泡
    c.evt.on('onActive', () => {
      if (curPopover.value) {
        curPopover.value.hide();
        curPopover.value = undefined;
      }
    });

    // 获取指定时间所在的星期一的时间
    const getMondayDate = (date: Date) => {
      const weekDay = date.getDay();
      let startDate;
      if (weekDay === 0) {
        startDate = date.getTime() - 6 * 24 * 60 * 60 * 1000;
      } else {
        startDate = date.getTime() - (weekDay - 1) * 24 * 60 * 60 * 1000;
      }
      return dayjs(new Date(startDate)).format('YYYY-MM-DD');
    };

    // 时间范围比较
    const timeRangeComparison = (newVal: Date, oldVal: Date): boolean => {
      // 用户自定义1走的也是周模式
      if (
        c.model.calendarStyle === 'WEEK' ||
        c.model.calendarStyle === 'USER'
      ) {
        // 比较是否在同一周
        const newMonday = getMondayDate(newVal);
        const oldMonday = getMondayDate(oldVal);

        if (newMonday === oldMonday) {
          return true;
        }
        return false;
      }
      if (c.model.calendarStyle === 'DAY') {
        // 比较是否在同一天
        const newDay = dayjs(newVal).format('YYYY-MM-DD');
        const oldDay = dayjs(oldVal).format('YYYY-MM-DD');

        if (newDay === oldDay) {
          return true;
        }
        return false;
      }
      if (c.model.calendarStyle === 'MONTH') {
        // 比较是否在同一个月
        const oldDateString = dayjs(oldVal).format('YYYY-MM');
        const newDateString = dayjs(newVal).format('YYYY-MM');
        if (oldDateString === newDateString) {
          return true;
        }
        return false;
      }
      if (c.model.calendarStyle === 'TIMELINE') {
        // 比较两个时间是否相等
        return dayjs(newVal).isSame(dayjs(oldVal), 'millisecond');
      }
      // 其他情况直接更新
      return false;
    };

    watch(
      () => c.state.selectedDate,
      (newVal: Date, oldVal: Date) => {
        // 月份相同不加载数据
        if (timeRangeComparison(newVal, oldVal)) {
          return;
        }
        c.load();
      },
    );

    /**
     * 计算数据项样式
     *
     * @author zk
     * @date 2023-08-08 11:08:29
     * @param {ICalendarItemData} data
     * @return {*}  {IData}
     */
    const calcItemStyle = (data: ICalendarItemData): IData => {
      const _legend = legendItems.value.find(
        _item => _item.id === data.itemType,
      );
      return {
        color: data.color,
        backgroundColor: data.bkColor,
        [`${ns.cssVarBlockName('item-color')}`]: data.color,
        [`${ns.cssVarBlockName('item-active-border-color')}`]:
          _legend?.actBdrColor,
      };
    };

    /**
     * 计算日历项
     *
     * @param {Date} _date
     * @return {*}  {ICalendarItemData[]}
     */
    const calcCalendarItems = (date: Date): ICalendarItemData[] => {
      const weekRange = getWeekRange(date);
      const calendarItems = c.state.items.filter((item: ICalendarItemData) => {
        // 适配图例显隐逻辑
        const _legend = legendItems.value.find(
          legend => legend.id === item.itemType,
        );
        if (_legend && !_legend.isShow) return false;

        if (!showDateRange.value) {
          return dayjs(date).isSame(item.beginTime, 'day');
        }
        return weekRange.some((_date: dayjs.ConfigType) =>
          isTimeBetween({
            beginTime: item.beginTime,
            endTime: item.endTime,
            date: _date,
          }),
        );
      });
      if (showDateRange.value) {
        // 以开始时间顺序排序
        calendarItems.sort((a, b) => {
          let result: number = 0;
          // 开始时间一样就以结束时间倒序
          if (dayjs(a.beginTime).isSame(b.beginTime, 'day')) {
            result = dayjs(a.endTime).isAfter(b.endTime) ? -1 : 1;
          } else {
            result = dayjs(a.beginTime).isAfter(b.beginTime) ? 1 : -1;
          }
          return result;
        });
      }
      return calendarItems.map(_item => {
        const targetLegend = legendItems.value.find((legendItem: IData) =>
          Object.is(legendItem.id, _item.itemType),
        );
        if (!targetLegend) return _item;

        // 图例没有配置颜色时，赋默认颜色
        if (!_item.bkColor)
          Object.assign(_item, { bkColor: targetLegend.bkcolor });
        if (!_item.color) Object.assign(_item, { color: targetLegend.color });
        return _item;
      });
    };

    // *上下文菜单相关 /

    let ContextMenu: IData;

    const iBizRawItem = resolveComponent('IBizRawItem');
    const iBizIcon = resolveComponent('IBizIcon');

    c.evt.on('onMounted', () => {
      // 有上下文菜单时加载组件
      if (Object.values(c.contextMenus).length > 0) {
        const importMenu = () => import('@imengyu/vue3-context-menu');
        importMenu().then(value => {
          ContextMenu = value.default;
          if (ContextMenu.default && !ContextMenu.showContextMenu) {
            ContextMenu = ContextMenu.default;
          }
        });
      }
    });

    const { calcUiactionGroup } = useContextMenu();

    /**
     * 计算上下文菜单组件配置项集合
     */
    const calcContextMenuItems = (
      toolbarItems: IDEToolbarItem[],
      calendarData: ICalendarItemData,
      evt: MouseEvent,
      menuState: IButtonContainerState,
    ): MenuItem[] => {
      const result: MenuItem[] = [];
      toolbarItems.forEach(item => {
        if (item.itemType === 'SEPERATOR') {
          result.push({
            divided: 'self',
          });
          return;
        }

        const buttonState = menuState[item.id!] as IButtonState;
        if (buttonState && !buttonState.visible) {
          return;
        }

        // 除分隔符之外的公共部分
        let menuItem: MenuItem | undefined = {};
        if (item.showCaption && item.caption) {
          menuItem.label = item.caption;
        }
        if (item.sysImage && item.showIcon) {
          menuItem.icon = <iBizIcon icon={item.sysImage}></iBizIcon>;
        }

        // 界面行为项
        if (item.itemType === 'DEUIACTION') {
          menuItem.disabled = buttonState.disabled;
          menuItem.clickClose = true;
          const { uiactionId } = item as IDETBUIActionItem;
          if (uiactionId) {
            menuItem.onClick = () => {
              c.doUIAction(uiactionId, calendarData, evt, item.appId);
            };
          }
        } else if (item.itemType === 'RAWITEM') {
          const { rawItem } = item as IDETBRawItem;
          if (rawItem) {
            menuItem.label = (
              <iBizRawItem rawItem={item as IDETBRawItem}></iBizRawItem>
            );
          }
        } else if (item.itemType === 'ITEMS') {
          // 分组项绘制子菜单
          const group = item as IDETBGroupItem;
          if (group.detoolbarItems?.length) {
            menuItem.children = calcContextMenuItems(
              group.detoolbarItems!,
              calendarData,
              evt,
              menuState,
            );
          }
          // 分组项配置界面行为组
          if (group.uiactionGroup && group.groupExtractMode) {
            const menuItems = calcUiactionGroup(
              group.uiactionGroup,
              menuState,
              (detail: IUIActionGroupDetail) => {
                ContextMenu.closeContextMenu();
                c.doUIAction(
                  detail.uiactionId!,
                  calendarData,
                  evt,
                  detail.appId,
                );
              },
            );
            switch (group.groupExtractMode) {
              case 'ITEMS':
                menuItem.children = menuItems;
                break;
              case 'ITEMX':
                if (menuItems) {
                  menuItem = menuItems[0];
                  menuItem.children = menuItems.slice(1);
                }
                break;
              case 'ITEM':
              default:
                menuItem = undefined;
                if (menuItems) {
                  result.push(...menuItems);
                }
                break;
            }
          }
        }
        if (menuItem) {
          result.push(menuItem);
        }
      });

      return result;
    };

    /**
     * 节点右键菜单点击事件
     */
    const onNodeContextmenu = async (
      item: ICalendarItemData,
      evt: MouseEvent,
    ) => {
      // 阻止原生浏览器右键菜单打开
      evt.preventDefault();
      evt.stopPropagation();
      const { sysCalendarItems } = c.model;
      const targetCalendarItem = sysCalendarItems?.find(
        (_item: ISysCalendarItem) => {
          return _item.id === item.itemType;
        },
      );
      if (!targetCalendarItem?.decontextMenu) {
        return;
      }
      const contextMenuC = c.contextMenus[targetCalendarItem.decontextMenu.id!];

      if (!contextMenuC.model.detoolbarItems) {
        return;
      }

      // 更新菜单的权限状态
      await contextMenuC.calcButtonState(
        item.deData || (item.deData ? item : undefined),
        targetCalendarItem.appDataEntityId,
        { view: c.view, ctrl: c },
      );
      const menuState = contextMenuC.state.buttonsState;

      const menus: MenuItem[] = calcContextMenuItems(
        contextMenuC.model.detoolbarItems,
        item,
        evt,
        menuState as IButtonContainerState,
      );
      if (!menus.length) {
        return;
      }

      ContextMenu.showContextMenu({
        x: evt.x,
        y: evt.y,
        customClass: ns.b('context-menu'),
        items: menus,
        zIndex: 9999,
      });
    };

    return {
      c,
      ns,
      curPopover,
      calendarRef,
      legendItems,
      popoverValue,
      showDateList,
      showDateRange,
      infiniteScroll,
      disabledLodeMore,
      selectDate,
      calcItemStyle,
      handleScrollLoad,
      monthLegendClick,
      calcCalendarItems,
      onNodeContextmenu,
    };
  },
  render() {
    /**
     * 绘制项布局面板
     *
     * @param {ICalendarItemData} item
     * @param {ILayoutPanel} modelData
     * @param {Date} date
     * @return {*}  {VNode}
     */
    const renderPanelItem = (
      item: ICalendarItemData,
      modelData: ILayoutPanel,
      date?: Date,
    ): VNode => {
      const { context, params } = this.c;
      // 是否选中数据
      const findIndex = this.c.state.selectedData.findIndex((data: IData) => {
        return data.deData.srfkey === item.deData.srfkey;
      });
      const itemClass = [
        this.ns.b('item'),
        this.ns.is('active', findIndex !== -1),
        this.ns.is(
          'begin-time',
          date && dayjs(date).isSame(item.beginTime, 'day'),
        ),
        this.ns.is(
          'hidden',
          this.showDateRange &&
            !isTimeBetween({
              beginTime: item.beginTime,
              endTime: item.endTime,
              date,
            }),
        ),
        this.ns.is('no-begin-time', this.showDateRange && !item.beginTime),
        this.ns.is('no-end-time', this.showDateRange && !item.endTime),
        this.ns.is('end-time', date && dayjs(date).isSame(item.endTime, 'day')),
      ];
      const style = this.calcItemStyle(item);
      return (
        <iBizControlShell
          class={itemClass}
          data={item.deData}
          modelData={modelData}
          context={context}
          params={params}
          style={style}
          onClick={(e: MouseEvent): Promise<void> => {
            e.stopPropagation();
            return this.c.onRowClick(item);
          }}
          onDblclick={(e: MouseEvent): Promise<void> => {
            e.stopPropagation();
            return this.c.onDbRowClick(item);
          }}
          onContextmenu={(e: MouseEvent) => this.onNodeContextmenu(item, e)}
        ></iBizControlShell>
      );
    };

    /**
     * 绘制默认列表项
     *
     * @param {ICalendarItemData} item
     * @param {Date} date
     * @return {*}  {VNode}
     */
    const renderDefaultItem = (item: ICalendarItemData, date?: Date): VNode => {
      // 是否选中数据
      const findIndex = this.c.state.selectedData.findIndex((data: IData) => {
        return data.deData.srfkey === item.deData.srfkey;
      });
      const itemClass = [
        this.ns.b('item'),
        this.ns.be('item', 'default'),
        this.ns.is('active', findIndex !== -1),
        this.ns.is(
          'begin-time',
          date && dayjs(date).isSame(item.beginTime, 'day'),
        ),
        this.ns.is(
          'hidden',
          this.showDateRange &&
            !isTimeBetween({
              beginTime: item.beginTime,
              endTime: item.endTime,
              date,
            }),
        ),
        this.ns.is('no-begin-time', this.showDateRange && !item.beginTime),
        this.ns.is('no-end-time', this.showDateRange && !item.endTime),
        this.ns.is('end-time', date && dayjs(date).isSame(item.endTime, 'day')),
      ];
      const style = this.calcItemStyle(item);
      return (
        <div
          class={itemClass}
          key={item.deData.srfkey}
          style={style}
          title={showTitle(item.tips || item.text)}
          onClick={(): Promise<void> => this.c.onRowClick(item)}
          onDblclick={(): Promise<void> => this.c.onDbRowClick(item)}
          onContextmenu={evt => this.onNodeContextmenu(item, evt)}
        >
          {this.showDateRange
            ? date &&
              (dayjs(date).isSame(item.beginTime, 'day') ||
                dayjs(date).day() === 0 ||
                (!item.beginTime && dayjs(date).isSame(item.endTime, 'day')))
              ? item.text
              : ''
            : item.text}
        </div>
      );
    };

    /**
     * 绘制日历项
     *
     * @param {ICalendarItemData} item
     * @param {Date} date
     * @return {*}
     */
    const renderCalendarItem = (item: ICalendarItemData, date: Date) => {
      const model = this.c.model.sysCalendarItems?.find(
        (calendarItems: IData) => {
          return item.itemType === calendarItems.itemType;
        },
      );
      const panel = model!.layoutPanel;
      return panel
        ? renderPanelItem(item, panel, date)
        : renderDefaultItem(item, date);
    };

    /**
     * 绘制日历列表
     *
     * @param {ICalendarItemData[]} items
     * @param {Date} date
     * @return {*}  {VNode[]}
     */
    const renderCalendarList = (
      items: ICalendarItemData[],
      date: Date,
    ): VNode[] => {
      if (items.length > 1 && !this.showDateRange && !this.showDateList) {
        return [
          renderCalendarItem(items[0], date),
          <el-popover
            trigger='click'
            ref={(el: IData) => {
              if (el && items[0].id === this.popoverValue) {
                this.curPopover = el;
              }
            }}
            onShow={() => {
              this.popoverValue = items[0].id;
            }}
          >
            {{
              reference: () => {
                return (
                  <span class={this.ns.b('more')}>{`+${
                    items.length - 1
                  } ${ibiz.i18n.t('app.more')}...`}</span>
                );
              },
              default: () => {
                return items.map(item => {
                  return renderCalendarItem(item, date);
                });
              },
            }}
          </el-popover>,
        ];
      }
      return items.map(item => {
        return renderCalendarItem(item, date);
      });
    };

    /**
     * 绘制日历项
     *
     * @author zk
     * @date 2023-08-08 02:08:26
     * @return {*}  {VNode}
     */
    const renderCalendarItems = (date: Date): VNode[] => {
      const items = this.calcCalendarItems(date);
      return renderCalendarList(items, date);
    };

    /**
     * 绘制默认的日历
     * @return {*}
     * @author: zhujiamin
     * @Date: 2023-11-22 14:18:10
     */
    const renderElCalender = () => {
      return (
        <div
          class={[
            this.ns.b('content'),
            this.ns.is('show-date-range', this.showDateRange),
          ]}
        >
          <el-calendar v-model={this.c.state.selectedDate} ref='calendarRef'>
            {{
              header: ({ date }: { date: string }): VNode[] => {
                return [
                  <span class={this.ns.b('content-title')}>{date}</span>,
                  <div class={this.ns.b('legend')}>
                    {this.legendItems &&
                      this.legendItems.length > 1 &&
                      this.legendItems.map((_legend: IData) => {
                        let label = _legend.name!;
                        const _model = this.c.model.sysCalendarItems?.find(
                          _calendarItem => _calendarItem.id === _legend.id,
                        );
                        if (_model?.nameLanguageRes) {
                          label = ibiz.i18n.t(
                            _model.nameLanguageRes.lanResTag!,
                            _model.name,
                          );
                        }
                        return (
                          <div
                            class={[this.ns.be('legend', 'item')]}
                            onClick={() => this.monthLegendClick(_legend)}
                          >
                            <div
                              class={this.ns.bem('legend', 'item', 'tip')}
                              style={{
                                background: _legend.isShow
                                  ? _legend?.bkcolor
                                  : `var(${this.ns.cssVarName(
                                      'color-disabled-bg',
                                    )})`,
                                color: _legend?.color,
                              }}
                            ></div>
                            <div class={this.ns.bem('legend', 'item', 'text')}>
                              {label}
                            </div>
                          </div>
                        );
                      })}
                  </div>,
                  <div class={this.ns.b('content-header')}>
                    <el-date-picker
                      v-model={this.c.state.selectedDate}
                      type='month'
                    />
                    <el-button-group>
                      <el-button
                        onClick={(): void => {
                          this.selectDate('prev-year');
                        }}
                      >
                        {ibiz.i18n.t('control.calendar.lastYear')}
                      </el-button>
                      <el-button
                        onClick={(): void => {
                          this.selectDate('prev-month');
                        }}
                      >
                        {ibiz.i18n.t('control.calendar.lastMonth')}
                      </el-button>
                      <el-button
                        onClick={(): void => {
                          this.selectDate('today');
                        }}
                      >
                        {ibiz.i18n.t('control.calendar.today')}
                      </el-button>
                      <el-button
                        onClick={(): void => {
                          this.selectDate('next-month');
                        }}
                      >
                        {ibiz.i18n.t('control.calendar.nextMonth')}
                      </el-button>
                      <el-button
                        onClick={(): void => {
                          this.selectDate('next-year');
                        }}
                      >
                        {ibiz.i18n.t('control.calendar.nextYear')}
                      </el-button>
                    </el-button-group>
                  </div>,
                ];
              },
              'date-cell': ({ data }: { data: IData }): VNode => {
                const { date } = data;
                return (
                  <div class={this.ns.b('day')}>
                    <p class={this.ns.b('date-text')}>{date.getDate()}</p>
                    <div class={this.ns.b('items')}>
                      {renderCalendarItems(date)}
                    </div>
                  </div>
                );
              },
            }}
          </el-calendar>
        </div>
      );
    };

    /**
     * 无数据
     * @param {*} VNode
     * @return {*}
     * @author: zhujiamin
     * @Date: 2023-11-22 14:46:37
     */
    const renderNoData = (): VNode | false => {
      // 未加载不显示无数据
      const { isLoaded } = this.c.state;
      const noDataSlots: IParams = {};
      if (hasEmptyPanelRenderer(this.c)) {
        Object.assign(noDataSlots, {
          customRender: () => (
            <IBizCustomRender controller={this.c}></IBizCustomRender>
          ),
        });
      }
      return (
        isLoaded && (
          <iBizNoData
            text={this.c.model.emptyText}
            emptyTextLanguageRes={this.c.model.emptyTextLanguageRes}
            hideNoDataImage={this.c.state.hideNoDataImage}
          >
            {noDataSlots}
          </iBizNoData>
        )
      );
    };

    /**
     * 绘制周，天, 用户自定义1
     *
     * @return {*}
     */
    const renderWeekDay = () => {
      const slots: IData = {};
      const { sysCalendarItems } = this.c.model;
      slots.event = ({ data }: { data: IData }) => {
        const targetCalendarItem = sysCalendarItems?.find(
          (item: ISysCalendarItem) => {
            return item.id === data.itemType;
          },
        );
        if (targetCalendarItem && targetCalendarItem.layoutPanel) {
          return renderPanelItem(
            data as ICalendarItemData,
            targetCalendarItem.layoutPanel,
          );
        }
        return renderDefaultItem(data as ICalendarItemData);
      };
      return (
        <div class={this.ns.b('content')}>
          <CustomCalendar
            v-model={this.c.state.selectedDate}
            showDetail={this.c.state.showDetail}
            calendarTitle={this.c.state.calendarTitle}
            ref='calendarRef'
            viewType={this.c.model.calendarStyle}
            events={this.c.state.items}
            legends={this.legendItems}
            multiple={!this.c.state.singleSelect}
            selectedData={this.c.state.selectedData}
            onEventClick={(value: IParams) => {
              const { data } = value;
              const item = data[0];
              if (item) this.c.onRowClick(item);
            }}
            onEventDblClick={(value: IParams) => {
              const { data } = value;
              const item = data[0];
              if (item) this.c.onDbRowClick(item);
            }}
            onEventContextmenu={(value: IParams) => {
              const { data, evt } = value;
              const item = data[0];
              if (item && evt) this.onNodeContextmenu(item, evt);
            }}
          >
            {slots}
          </CustomCalendar>
        </div>
      );
    };

    /**
     * 绘制时间轴日历
     * @return {*}
     * @author: zhujiamin
     * @Date: 2023-11-22 14:18:25
     */
    const renderTimeLine = () => {
      return (
        <div
          ref='infiniteScroll'
          class={this.ns.b('timeline-content')}
          onScroll={debounce(this.handleScrollLoad, 300)}
        >
          <el-timeline>
            {this.c.state.items.length > 0
              ? this.c.state.items.map((item: ICalendarItemData) => {
                  const model = this.c.model.sysCalendarItems?.find(
                    (calendarItems: IData) => {
                      return item.itemType === calendarItems.itemType;
                    },
                  );
                  const time = item[this.c.groupTimeField];
                  const temptime = time
                    ? dayjs(time).format(this.c.timelineCaptionFormat)
                    : time;
                  return (
                    <el-timeline-item
                      key={item.id}
                      placement='top'
                      color={item.bkColor}
                      timestamp={temptime}
                    >
                      {model?.layoutPanel
                        ? renderPanelItem(item, model.layoutPanel)
                        : renderDefaultItem(item)}
                    </el-timeline-item>
                  );
                })
              : renderNoData()}
          </el-timeline>
        </div>
      );
    };

    const renderCalendar = () => {
      switch (this.c.model.calendarStyle) {
        case 'TIMELINE':
          return renderTimeLine();
        case 'WEEK':
        case 'DAY':
        case 'USER':
          return renderWeekDay();
        case 'MONTH':
        default:
          return renderElCalender();
      }
    };

    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase
          controller={this.c}
          class={this.ns.e(this.c.model.calendarStyle?.toLowerCase())}
        >
          {renderCalendar()}
          {this.c.state.enableNavView && this.c.state.showNavIcon ? (
            !this.c.state.showNavView ? (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.showNav')}
                name='eye-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            ) : (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.hiddenNav')}
                name='eye-off-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            )
          ) : null}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
