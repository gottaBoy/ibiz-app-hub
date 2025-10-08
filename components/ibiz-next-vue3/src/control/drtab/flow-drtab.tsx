import {
  defineComponent,
  h,
  PropType,
  ref,
  watch,
  onActivated,
  resolveComponent,
  nextTick,
  computed,
  Ref,
} from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { createUUID } from 'qx-util';
import './flow-drtab.scss';
import { DRTabController } from './drtab.controller';

export const FlowDrtab = defineComponent({
  name: 'FlowDrtab',
  props: {
    pagesstate: {
      type: Array as PropType<IData[]>,
      default: () => [],
    },
    drtabpages: {
      type: Array as PropType<IData[]>,
      default: () => [],
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => {},
    },
    params: {
      type: Object as PropType<IParams>,
      default: () => {},
    },
    counterData: {
      type: Array as PropType<IData>,
      default: () => {},
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    activeTab: {
      type: Object as PropType<IData>,
      default: () => {},
    },
    controller: {
      type: Object as PropType<DRTabController>,
      default: () => {},
    },
  },
  setup(props) {
    const ns = useNamespace('flow-drtab');
    const uuid = createUUID();
    const c = props.controller;
    // 导航项
    const navtag = ref('');
    // 视图列表
    const viewList: Ref<IData[]> = ref([]);
    // 导航栏位置
    const navbarpos = ref();
    // 导航栏宽度
    const navBarWidth: Ref<string | number> = ref(200);
    // 观察滚动项元素id数组
    const visibleViews: string[] = [];
    // 滚动高度
    const scrollTop = ref(0);
    // 导航栏
    const navbarRef = ref();
    // 已加载完成视图数量
    const completedViews: Ref<number> = ref(0);
    // 定时器引用
    const tempTimer = ref();
    // 点击时候最终激活的锚点
    const tempTarget = ref();
    navbarpos.value = c.navbarpos;
    navBarWidth.value = c.navbarwidth;

    // 所有可视视图
    const allVisibleViews = computed(() => {
      return props.pagesstate.filter(item => {
        const target = props.drtabpages.find(page => {
          return page.id === item.tag;
        });
        return target && !item.hidden;
      }).length;
    });

    // 所有导航项元素id
    const allNavTags = computed(() => {
      if (props.pagesstate) {
        return props.pagesstate.map(item => {
          const target = props.drtabpages.find(page => {
            return page.id === item.tag;
          });
          return `${target?.appViewId}_${item.tag}`;
        });
      }
      return [];
    });

    // 滚动到目标
    const scrollToTarget = () => {
      if (navtag.value) {
        const el = document.getElementById(`${navtag.value}`);
        if (el) {
          el.scrollIntoView();
        }
      }
    };

    // 是否完全可见
    const isFullyVisible = (element: HTMLElement, container: HTMLElement) => {
      // 获取容器和元素的位置信息
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // 完全可见的四个条件
      return (
        // 元素顶部不超出容器顶部
        elementRect.top >= containerRect.top &&
        // 元素底部不超出容器底部
        elementRect.bottom <= containerRect.bottom &&
        // 元素左侧不超出容器左侧
        elementRect.left >= containerRect.left &&
        // 元素右侧不超出容器右侧
        elementRect.right <= containerRect.right
      );
    };

    // 滚动到目标锚点
    const scrollToTargetNavItem = () => {
      const anchor = document.getElementById(`navbar_${navtag.value}`);
      if (
        anchor &&
        navbarRef.value &&
        !isFullyVisible(anchor, navbarRef.value)
      ) {
        anchor.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 计算当前选中激活项
    const computeSelectItem = () => {
      if (visibleViews.length > 0) {
        navtag.value = visibleViews[0];
      }
      if (tempTarget.value) {
        clearTimeout(tempTimer.value);
        tempTimer.value = setTimeout(() => {
          navtag.value = tempTarget.value;
          scrollToTargetNavItem();
          tempTarget.value = '';
        }, 200);
      } else {
        scrollToTargetNavItem();
      }
    };

    // 创建 Intersection Observer 对象,用来观察滚动元素
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 当元素进入视口时执行的操作
            if (entry.target && entry.target.id) {
              if (visibleViews.length > 0) {
                const curIndex = allNavTags.value?.findIndex(
                  tag => tag === entry.target.id,
                );
                const index = allNavTags.value?.findIndex(
                  tag => tag === visibleViews[0],
                );
                if (curIndex < index) {
                  visibleViews.unshift(entry.target.id);
                } else {
                  visibleViews.push(entry.target.id);
                }
              } else {
                visibleViews.push(entry.target.id);
              }
            }
          } else if (entry.target && entry.target.id) {
            // 当元素离开视口时执行的操作
            const index = visibleViews.indexOf(entry.target.id);
            if (index >= 0) {
              visibleViews.splice(index, 1);
            }
          }
        });
        visibleViews.sort((a: string, b: string) => {
          const aIndex = allNavTags.value?.findIndex(tag => tag === a);
          const bIndex = allNavTags.value?.findIndex(tag => tag === b);
          return aIndex - bIndex;
        });
        if (allVisibleViews.value !== completedViews.value || !c.enableAnchor) {
          return;
        }
        computeSelectItem();
      },
    );

    // 分页视图挂载完成
    const onViewMounted = (item: IData) => {
      const target = props.drtabpages.find(page => {
        return page.id === item.tag;
      });
      completedViews.value += 1;
      if (completedViews.value === allVisibleViews.value && !navtag.value) {
        navtag.value = `${target?.appViewId}_${props.pagesstate[0].tag}`;
      }
      const el = document.getElementById(`${target?.appViewId}_${item.tag}`);
      if (el) {
        observer.observe(el);
      }
      if (
        completedViews.value === allVisibleViews.value &&
        props.activeTab &&
        props.activeTab.tag !== props.drtabpages[0].id
      ) {
        nextTick(() => {
          scrollToTarget();
        });
      }
    };

    watch(
      () => props.activeTab,
      (newVal, oldVal) => {
        if (newVal && newVal.tag !== oldVal?.tag) {
          const target = props.drtabpages.find(page => {
            return page.id === newVal.tag;
          });
          navtag.value = `${target?.appViewId}_${newVal.tag}`;
          if (newVal.tag !== props.drtabpages[0].id) {
            // 不是第一个才滚动
            scrollToTarget();
          }
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

    watch(
      () => props.drtabpages,
      newVal => {
        if (newVal) {
          Promise.all(
            newVal.map(async (item: IData) => {
              const view = await ibiz.hub.getAppView(item.appViewId);
              return { id: item.id, height: view?.height, width: view?.width };
            }),
          ).then(res => {
            viewList.value = res;
          });
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

    // 重新进入时回滚到上次离开位置
    onActivated(() => {
      nextTick(() => {
        const el = document.getElementById(`${uuid}`);
        if (el) {
          el.scrollTop = scrollTop.value;
        }
      });
    });

    // 计算视图默认宽高
    const calcStyle = (tag: string) => {
      const target = viewList.value.find(item => {
        return item.id === tag;
      });
      if (target) {
        return {
          height: target.height ? `${target.height}px` : '100%',
          width: target.width ? `${target.width}px` : '100%',
        };
      }
    };

    // 点击锚点栏
    const onClickBar = (item: IData) => {
      const target = props.drtabpages.find(page => {
        return page.id === item.tag;
      });
      tempTarget.value = `${target?.appViewId}_${item.tag}`;
      const el = document.getElementById(`${target?.appViewId}_${item.tag}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        if (visibleViews.includes(tempTarget.value)) {
          navtag.value = tempTarget.value;
        }
      }
    };

    // 绘制锚点栏
    const renderAnchorBar = () => {
      // 是否启用锚点栏
      if (c.enableAnchor) {
        return (
          <div
            class={[ns.e('anchor-bar'), ns.is(navbarpos.value, true)]}
            style={{ width: `${navBarWidth.value}px` }}
          >
            <div
              class={[ns.e('anchor-items'), ns.is(navbarpos.value)]}
              ref={el => {
                navbarRef.value = el;
              }}
            >
              {props.pagesstate.map(item => {
                const target = props.drtabpages.find(page => {
                  return page.id === item.tag;
                });
                if (!target || item.hidden) {
                  return null;
                }
                return (
                  <div
                    class={[
                      ns.e('anchor-item'),
                      ns.is(
                        'active',
                        `${target?.appViewId}_${item.tag}` === navtag.value,
                      ),
                    ]}
                    id={`navbar_${target.appViewId}_${item.tag}`}
                    onClick={() => onClickBar(item)}
                  >
                    {item.caption}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    };

    // 处理滚动事件，记录滚动距离
    const handleScroll = () => {
      const el = document.getElementById(`${uuid}`);
      if (el) {
        scrollTop.value = el.scrollTop;
      }
    };

    return {
      c,
      ns,
      uuid,
      navbarpos,
      onViewMounted,
      navBarWidth,
      calcStyle,
      renderAnchorBar,
      handleScroll,
    };
  },
  render() {
    const tabs = this.pagesstate.map((item: IData) => {
      const counterNum = item.counterId
        ? this.counterData[item.counterId]
        : undefined;
      const viewShell = resolveComponent('IBizViewShell');
      const target = this.drtabpages.find(page => {
        return page.id === item.tag;
      });
      if (!target || item.hidden) {
        return null;
      }
      return (
        <div
          id={`${target.appViewId}_${item.tag}`}
          class={this.ns.e('tab-item')}
        >
          {this.showHeader && (
            <div class={this.ns.em('tab-item', 'label')}>
              {item.sysImage && (
                <iBizIcon
                  class={this.ns.be('label', 'icon')}
                  icon={item.sysImage}
                />
              )}
              <span class={this.ns.be('label', 'text')}>{item.caption}</span>
              {!isNil(counterNum) && (
                <iBizBadge
                  class={this.ns.e('counter')}
                  value={counterNum}
                  counterMode={item.counterMode}
                />
              )}
            </div>
          )}
          <div
            class={this.ns.em('tab-item', 'tab-view')}
            style={this.calcStyle(item.tag)}
          >
            {h(viewShell, {
              context: this.context,
              params: this.params,
              viewId: target.appViewId,
              onMounted: () => this.onViewMounted(item),
            })}
          </div>
        </div>
      );
    });
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.navbarpos),
          this.ns.is('left', this.navbarpos?.includes('left')),
          this.ns.is('right', this.navbarpos?.includes('right')),
          this.ns.is('enable-anchor', this.c.enableAnchor),
        ]}
        onScroll={this.handleScroll}
        id={this.uuid}
      >
        {this.renderAnchorBar()}
        <div
          class={this.ns.e('container')}
          style={{ '--navbarwidth': `${this.navBarWidth}px` }}
        >
          {tabs}
        </div>
      </div>
    );
  },
});
